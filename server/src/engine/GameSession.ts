import { v4 as uuidv4 } from 'uuid';
import { GamePhase, ShipRole, TeamShip, Player, DailyOrder, AdvisoryVote, GMEvent } from './types.js';
import { MAP_NODES } from '../data/mapNodes.js';
import { calculateShipWeight, getTreasureValue } from '../data/items.js';
import { DAILY_GM_EVENTS } from '../data/gmEvents.js';
import { BotController } from './BotController.js';

export class GameSession {
  public id: string;
  public roomCode: string;
  public phase: GamePhase = GamePhase.LOBBY;
  public currentDay: number = 1;
  public maxDays: number = 15;
  public turnSecondsRemaining: number = 90;
  public isTimerRunning: boolean = false;
  private timerInterval: NodeJS.Timeout | null = null;

  public teams: Map<string, TeamShip> = new Map();
  public players: Map<string, Player> = new Map();
  public currentEvent: GMEvent | null = DAILY_GM_EVENTS[1] || null;
  public instructorSocketId: string | null = null;
  public broadcastCallback: (event: string, data: any) => void = () => {};

  constructor(roomCode: string = 'TEAM-B') {
    this.id = uuidv4();
    this.roomCode = roomCode;
    this.currentEvent = DAILY_GM_EVENTS[1] || null;
    this.initDefaultTeams();
  }

  private initDefaultTeams() {
    const defaultTeams = [
      { id: 'team-1', name: 'เรือแบล็คเพิร์ล (Black Pearl)', color: '#3b82f6', botStrategy: 'BALANCED' as const },
      { id: 'team-2', name: 'เรือฟลายอิ้งดัตช์แมน (Flying Dutchman)', color: '#10b981', botStrategy: 'TRADER' as const },
      { id: 'team-3', name: 'เรือควีนแอนส์รีเวนจ์ (Queen Anne)', color: '#ef4444', botStrategy: 'PIRATE_HUNTER' as const },
      { id: 'team-4', name: 'เรือรอยัลฟอร์จูน (Royal Fortune)', color: '#f59e0b', botStrategy: 'SMUGGLER' as const },
      { id: 'team-5', name: 'เรือไซเรนซอง (Siren Song)', color: '#8b5cf6', botStrategy: 'BALANCED' as const },
      { id: 'team-6', name: 'เรือซีฮอว์ก (Sea Hawk)', color: '#ec4899', botStrategy: 'TRADER' as const },
    ];

    for (const t of defaultTeams) {
      this.teams.set(t.id, {
        id: t.id,
        name: t.name,
        color: t.color,
        isBot: false,
        botStrategy: t.botStrategy,
        currentLocationId: 'node-1', // Grand Port Royal
        gold: 1000,
        inventory: {
          water: 10,
          fuel: 10,
          cannon: 3,
          compass: 1,
          treasureBoxes: 0,
        },
        hullIntegrity: 100,
        isSunk: false,
        isReturnedSafely: false,
        members: [],
        pendingOrder: {
          action: 'ADVANCE',
          targetNodeId: 'node-2',
          buyWater: 0,
          buyFuel: 0,
          buyCannon: 0,
          buyCompass: 0,
          useCannon: false,
          useCompass: false,
          salvageFlotsam: false,
          discardFlotsam: false,
        },
        advisoryVotes: [],
        spyData: {
          fakeLocationNodeId: 'node-1',
          fakeGold: 1000,
          fakeTreasures: 0,
          rumorMessage: '',
          scoutedTeams: []
        },
        logHistory: [{
          day: 1,
          message: 'เรือพร้อมออกเดินทางจาก Grand Port Royal พร้อมทุน 1,000 Gold',
          goldChange: 0,
          weight: calculateShipWeight({ water: 10, fuel: 10, cannon: 3, compass: 1, treasureBoxes: 0 })
        }]
      });
    }
  }

  // --- Player Management ---
  public registerPlayer(name: string, teamId: string, role: ShipRole, socketId: string): Player {
    // 1. Remove player from all teams first if already registered (prevent duplicates on role/team switch)
    this.teams.forEach(t => {
      t.members = t.members.filter(m => m.socketId !== socketId && m.name !== name);
    });

    const team = this.teams.get(teamId);
    let assignedRole = role;

    if (team) {
      // 2. If role is unique and already occupied by someone else, fallback to DECKHAND
      if (assignedRole !== ShipRole.DECKHAND) {
        const isOccupied = team.members.some(m => m.role === assignedRole && m.socketId !== socketId && m.name !== name);
        if (isOccupied) {
          assignedRole = ShipRole.DECKHAND;
        }
      }
    }

    const player: Player = {
      id: uuidv4(),
      name,
      teamId,
      role: assignedRole,
      isOnline: true,
      socketId
    };

    this.players.set(player.id, player);

    if (team) {
      team.members.push(player);
    }

    return player;
  }

  // --- Turn & Timer System ---
  public startTimer(seconds: number, onTick?: () => void, onComplete?: () => void) {
    this.stopTimer();
    this.turnSecondsRemaining = seconds;
    this.isTimerRunning = true;

    this.timerInterval = setInterval(() => {
      this.turnSecondsRemaining--;
      if (onTick) onTick();

      if (this.turnSecondsRemaining <= 0) {
        this.stopTimer();
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  public stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
  }

  public startGame() {
    this.currentDay = 1;
    this.startDayLoop();
  }

  public resetGame() {
    this.stopTimer();
    this.phase = GamePhase.LOBBY;
    this.currentDay = 1;
    this.turnSecondsRemaining = 90;
    this.teams.clear();
    this.players.clear();
    this.currentEvent = DAILY_GM_EVENTS[1] || null;
    this.initDefaultTeams();
    this.broadcastState();
  }

  public startDayLoop() {
    this.phase = GamePhase.DAY_WEATHER_BRIEF;
    this.currentEvent = DAILY_GM_EVENTS[this.currentDay] || {
      id: `evt-${this.currentDay}`,
      day: this.currentDay,
      title: 'น่านน้ำเปิดกว้าง',
      description: 'ไม่มีรายงานเหตุการณ์พิเศษ',
      type: 'CALM',
      affectedNodeIds: [],
      effect: {}
    };

    // Reset daily pending orders
    this.teams.forEach(team => {
      team.advisoryVotes = [];
      team.pendingOrder = {
        action: 'ANCHOR',
        targetNodeId: team.currentLocationId,
        buyWater: 0,
        buyFuel: 0,
        buyCannon: 0,
        buyCompass: 0,
        useCannon: false,
        useCompass: false,
        salvageFlotsam: false,
        discardFlotsam: false,
      };
    });

    // 10 seconds brief, then 90 seconds decision phase
    this.startTimer(10, undefined, () => {
      this.phase = GamePhase.DAY_DECISION;
      this.processBotTurns();
      this.broadcastState();
      // 90 seconds (1.5 mins) for team decisions
      this.startTimer(90, undefined, () => {
        this.processEndOfDay();
      });
      this.broadcastState();
    });

    this.broadcastState();
  }

  // --- Bot Management ---
  public toggleTeamBot(teamId: string, isBot: boolean) {
    const team = this.teams.get(teamId);
    if (team) {
      team.isBot = isBot;
      this.broadcastState();
    }
  }

  public autoFillBots() {
    this.teams.forEach(team => {
      if (team.members.length === 0) {
        team.isBot = true;
      }
    });
    this.broadcastState();
  }

  public addCustomShip(name: string, color?: string, isBot: boolean = false): TeamShip {
    const nextIndex = this.teams.size + 1;
    const newId = `team-${Date.now().toString().slice(-4)}`;
    
    const palette = ['#06b6d4', '#e11d48', '#84cc16', '#a855f7', '#f97316', '#14b8a6', '#6366f1', '#fbbf24', '#0284c7'];
    const chosenColor = color || palette[(this.teams.size) % palette.length];

    const newShip: TeamShip = {
      id: newId,
      name: name || `เรือลำใหม่ #${nextIndex}`,
      color: chosenColor,
      isBot,
      botStrategy: 'BALANCED',
      currentLocationId: 'node-1',
      gold: 1000,
      inventory: {
        water: 10,
        fuel: 10,
        cannon: 3,
        compass: 1,
        treasureBoxes: 0,
      },
      hullIntegrity: 100,
      isSunk: false,
      isReturnedSafely: false,
      members: [],
      pendingOrder: {
        action: 'ANCHOR',
        targetNodeId: 'node-1',
        buyWater: 0,
        buyFuel: 0,
        buyCannon: 0,
        buyCompass: 0,
        useCannon: false,
        useCompass: false,
        salvageFlotsam: false,
        discardFlotsam: false,
      },
      advisoryVotes: [],
      spyData: {
        fakeLocationNodeId: 'node-1',
        fakeGold: 1000,
        fakeTreasures: 0,
        rumorMessage: '',
        scoutedTeams: []
      },
      logHistory: [{
        day: this.currentDay,
        message: `เรือ ${name || `ลำใหม่ #${nextIndex}`} เข้าร่วมกองเรือ ณ Grand Port Royal พร้อมทุน 1,000 Gold`,
        goldChange: 0,
        weight: calculateShipWeight({ water: 10, fuel: 10, cannon: 3, compass: 1, treasureBoxes: 0 })
      }]
    };

    this.teams.set(newShip.id, newShip);
    this.broadcastState();
    return newShip;
  }

  public removeShip(teamId: string): boolean {
    const team = this.teams.get(teamId);
    if (team && team.members.length === 0) {
      this.teams.delete(teamId);
      this.broadcastState();
      return true;
    }
    return false;
  }

  public processBotTurns() {
    this.teams.forEach(team => {
      if (team.isBot && !team.isSunk && !team.isReturnedSafely) {
        const botOrder = BotController.decideBotOrder(team, this.currentDay, this.currentEvent);
        team.pendingOrder = { ...team.pendingOrder, ...botOrder };

        // Add dummy advisory vote from bot navigator
        team.advisoryVotes = [
          {
            playerId: `bot-nav-${team.id}`,
            playerName: 'AI Navigator',
            role: ShipRole.NAVIGATOR,
            suggestedAction: botOrder.action || 'ANCHOR',
            suggestedTargetNodeId: botOrder.targetNodeId,
            note: 'วิเคราะห์กระแสน้ำและเป้าหมายตามยุทธศาสตร์ AI'
          }
        ];
      }
    });
  }

  // --- Role Actions & Advisories ---
  public submitAdvisoryVote(vote: AdvisoryVote) {
    const team = this.teams.get(vote.playerId ? this.players.get(vote.playerId)?.teamId || '' : '');
    if (team) {
      team.advisoryVotes = team.advisoryVotes.filter(v => v.playerId !== vote.playerId);
      team.advisoryVotes.push(vote);
      this.broadcastState();
    }
  }

  public updatePendingOrder(teamId: string, partialOrder: Partial<DailyOrder>) {
    const team = this.teams.get(teamId);
    if (team && !team.isSunk && !team.isReturnedSafely) {
      team.pendingOrder = { ...team.pendingOrder, ...partialOrder };
      this.broadcastState();
    }
  }

  // --- End of Day Processing ---
  public processEndOfDay() {
    this.phase = GamePhase.END_DAY_PROCESSING;
    this.broadcastState();

    this.teams.forEach(team => {
      if (team.isSunk || team.isReturnedSafely) return;

      const order = team.pendingOrder;
      const currentNode = MAP_NODES[team.currentLocationId];
      let targetNode = currentNode;

      // 1. Validate Movement
      if (order.action === 'ADVANCE' || order.action === 'RETREAT') {
        const candidateNode = MAP_NODES[order.targetNodeId || ''];
        if (candidateNode && currentNode.connectedTo.includes(candidateNode.id)) {
          // Check Smuggler's Strait weight limit (700 lbs)
          const currentWeight = calculateShipWeight(team.inventory);
          if (candidateNode.specialRule?.weightLimit && currentWeight > candidateNode.specialRule.weightLimit) {
            team.logHistory.push({
              day: this.currentDay,
              message: `ติดแก่งหินที่ ${candidateNode.nameTh}! น้ำหนักเรือ (${currentWeight} lbs) เกินจำกัด 700 lbs จึงต้องจอดพักอยู่ที่เดิม`,
              goldChange: 0,
              weight: currentWeight
            });
          } else {
            targetNode = candidateNode;
            team.currentLocationId = targetNode.id;
          }
        }
      }

      // 2. Consume Resources
      // Water: 1 per day
      team.inventory.water -= 1;
      // Weather water drain if applicable
      if (this.currentEvent?.affectedNodeIds.includes(team.currentLocationId) && this.currentEvent.effect.waterDrain) {
        team.inventory.water -= this.currentEvent.effect.waterDrain;
      }

      // Fuel: 1 if moving, 0 if anchor
      if (order.action !== 'ANCHOR') {
        team.inventory.fuel -= 1;
        // Weather fuel drain if applicable
        if (this.currentEvent?.affectedNodeIds.includes(team.currentLocationId) && this.currentEvent.effect.fuelDrain) {
          team.inventory.fuel -= this.currentEvent.effect.fuelDrain;
        }
      }

      // 3. Process Purchases if shop available at current node
      let goldCost = 0;
      if (currentNode.shopAvailable && currentNode.prices) {
        const bw = order.buyWater || 0;
        const bf = order.buyFuel || 0;
        const bc = order.buyCannon || 0;
        const bcp = order.buyCompass || 0;

        goldCost = bw * currentNode.prices.water +
                   bf * currentNode.prices.fuel +
                   bc * currentNode.prices.cannon +
                   bcp * currentNode.prices.compass;

        if (team.gold >= goldCost) {
          team.gold -= goldCost;
          team.inventory.water += bw;
          team.inventory.fuel += bf;
          team.inventory.cannon = Math.min(3, team.inventory.cannon + bc);
          team.inventory.compass += bcp;
        }
      }

      // 4. Special Node Events (Cocoa Island Excavation)
      if (team.currentLocationId === 'node-12') { // Cocoa Island
        team.inventory.treasureBoxes += 1;
        const val = getTreasureValue(team.inventory.treasureBoxes);
        team.logHistory.push({
          day: this.currentDay,
          message: `ขุดพบหีบสมบัติกล่องที่ ${team.inventory.treasureBoxes} ณ Cocoa Island! (มูลค่าประเมิน ${val} Gold)`,
          goldChange: 0,
          weight: calculateShipWeight(team.inventory)
        });
      }

      // 5. Flotsam Salvage
      if (order.salvageFlotsam && this.currentEvent?.affectedNodeIds.includes(team.currentLocationId)) {
        if (this.currentEvent.effect.flotsamWater) team.inventory.water += this.currentEvent.effect.flotsamWater;
        if (this.currentEvent.effect.flotsamFuel) team.inventory.fuel += this.currentEvent.effect.flotsamFuel;
        if (this.currentEvent.effect.flotsamTreasure) team.inventory.treasureBoxes += this.currentEvent.effect.flotsamTreasure;

        team.logHistory.push({
          day: this.currentDay,
          message: `เก็บกู้ของลอยน้ำสำเร็จ! ได้รับเสบียงเพิ่มขึ้น`,
          goldChange: 0,
          weight: calculateShipWeight(team.inventory)
        });
      }

      // 6. Hazard & Combat
      if (team.currentLocationId === 'node-11') { // Pirate's Cove
        if (order.useCannon && team.inventory.cannon > 0) {
          team.inventory.cannon -= 1;
          team.gold += 500;
          team.logHistory.push({
            day: this.currentDay,
            message: `ยิงปืนใหญ่ขับไล่โจรสลัดสำเร็จ! ชิงเงินรางวัลมาได้ +500 Gold`,
            goldChange: 500,
            weight: calculateShipWeight(team.inventory)
          });
        } else {
          team.gold = Math.max(0, team.gold - 200);
          team.hullIntegrity = Math.max(0, team.hullIntegrity - 25);
          team.logHistory.push({
            day: this.currentDay,
            message: `ถูกโจรสลัดปล้นสะดม! เสียทอง 200 Gold และเรือเสียหาย 25%`,
            goldChange: -200,
            weight: calculateShipWeight(team.inventory)
          });
        }
      }

      // 7. Check Safe Return or Sunk
      const finalWeight = calculateShipWeight(team.inventory);
      const deckhandBonus = team.members.filter(m => m.role === ShipRole.DECKHAND).length * 15;
      const maxCapacity = 1000 + deckhandBonus;

      if (team.inventory.water <= 0) {
        team.isSunk = true;
        team.sunkReason = 'ลูกเรือขาดน้ำดื่มจนเรืออับปาง';
      } else if (team.inventory.fuel < 0) {
        team.isSunk = true;
        team.sunkReason = 'เชื้อเพลิงหมด ลอยเคว้งกลางทะเล';
      } else if (finalWeight > maxCapacity) {
        team.isSunk = true;
        team.sunkReason = `บรรทุกน้ำหนักเกินพิกัด (${finalWeight} lbs / ${maxCapacity} lbs) จนเรือจม`;
      } else if (team.hullIntegrity <= 0) {
        team.isSunk = true;
        team.sunkReason = 'ตัวเรือเสียหาย 100% จนอับปาง';
      } else if (this.currentDay >= this.maxDays && team.currentLocationId !== 'node-1') {
        team.isSunk = true;
        team.sunkReason = `กลับเข้าท่าเรือ Grand Port Royal ไม่ทันวันที่ ${this.maxDays}`;
      } else if (this.currentDay >= 8 && team.currentLocationId === 'node-1') {
        team.isReturnedSafely = true;
        team.logHistory.push({
          day: this.currentDay,
          message: `เทียบท่า Grand Port Royal อย่างปลอดภัยแล้ว! ภารกิจสำเร็จ`,
          goldChange: 0,
          weight: finalWeight
        });
      }
    });

    // Check if Spy Phase triggers (Day 5 and Day 10)
    if ([5, 10].includes(this.currentDay)) {
      this.enterSpyPhase();
    } else if (this.currentDay >= this.maxDays) {
      this.phase = GamePhase.FINAL_SUMMARY;
      this.broadcastState();
    } else {
      this.currentDay++;
      this.startDayLoop();
    }
  }

  // --- Spy & Information Warfare ---
  public enterSpyPhase() {
    this.phase = GamePhase.SPY_FREEZE;

    // Generate bot spy intel automatically
    const allTeams = Array.from(this.teams.values());
    this.teams.forEach(team => {
      if (team.isBot && !team.isSunk) {
        const botSpyIntel = BotController.generateBotSpyIntel(team, allTeams);
        team.spyData = { ...team.spyData, ...botSpyIntel };
      }
    });

    this.broadcastState();

    // 3 minutes (180s) for Spy Phase
    this.startTimer(180, undefined, () => {
      this.phase = GamePhase.STRATEGY_REVISION;
      this.broadcastState();
      // 1 minute (60s) for Strategy Revision
      this.startTimer(60, undefined, () => {
        this.currentDay++;
        this.startDayLoop();
      });
      this.broadcastState();
    });
  }

  public updateSpyIntel(teamId: string, intel: Partial<TeamShip['spyData']>) {
    const team = this.teams.get(teamId);
    if (team) {
      team.spyData = { ...team.spyData, ...intel };
      this.broadcastState();
    }
  }

  public triggerIntelLeak(leakType: 'REVEAL_2_TEAMS' | 'BERMUDA_TRAP') {
    // Instructor action: reveals coordinates on projector
    const realTeams = Array.from(this.teams.values()).filter(t => !t.isSunk);
    const leakedInfo = realTeams.slice(0, 2).map(t => ({
      teamName: t.name,
      realNodeId: t.currentLocationId,
      nodeName: MAP_NODES[t.currentLocationId]?.nameTh
    }));

    this.broadcastCallback('INTEL_LEAK_BROADCAST', {
      type: leakType,
      leakedInfo,
      message: `ข่าวกรองรั่วไหล! ระบบตรวจพบพิกัดที่แท้จริงของ: ${leakedInfo.map(i => `${i.teamName} อยู่ที่ ${i.nodeName}`).join(' และ ')}`
    });
  }

  // --- Summary & State Serialization ---
  public getLeaderboard() {
    return Array.from(this.teams.values()).map(team => {
      let treasureTotalGold = 0;
      for (let i = 1; i <= team.inventory.treasureBoxes; i++) {
        treasureTotalGold += getTreasureValue(i);
      }
      const finalScore = team.isSunk ? 0 : (team.gold + treasureTotalGold);

      return {
        id: team.id,
        name: team.name,
        color: team.color,
        isBot: team.isBot,
        isSunk: team.isSunk,
        isReturnedSafely: team.isReturnedSafely,
        sunkReason: team.sunkReason,
        gold: team.gold,
        treasureBoxes: team.inventory.treasureBoxes,
        treasureTotalGold,
        finalScore,
        locationId: team.currentLocationId,
        locationName: MAP_NODES[team.currentLocationId]?.nameTh || 'กลางทะเล',
        weight: calculateShipWeight(team.inventory)
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  public serializeState() {
    return {
      phase: this.phase,
      currentDay: this.currentDay,
      maxDays: this.maxDays,
      turnSecondsRemaining: this.turnSecondsRemaining,
      isTimerRunning: this.isTimerRunning,
      currentEvent: this.currentEvent,
      teams: Array.from(this.teams.values()),
      leaderboard: this.getLeaderboard(),
      mapNodes: MAP_NODES
    };
  }

  public broadcastState() {
    this.broadcastCallback('GAME_STATE_UPDATE', this.serializeState());
  }
}

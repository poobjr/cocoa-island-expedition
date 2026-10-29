import { TeamShip, DailyOrder } from './types.js';
import { MAP_NODES, MapNode } from '../data/mapNodes.js';
import { calculateShipWeight } from '../data/items.js';

export class BotController {
  /**
   * Breadth-First Search (BFS) to find path from startNode to targetNode
   */
  public static findPath(
    startNodeId: string, 
    targetNodeId: string, 
    maxWeightAllowance: number
  ): string[] {
    if (startNodeId === targetNodeId) return [startNodeId];

    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: startNodeId, path: [startNodeId] }
    ];
    const visited = new Set<string>([startNodeId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentNode = MAP_NODES[current.nodeId];
      if (!currentNode) continue;

      for (const neighborId of currentNode.connectedTo) {
        if (visited.has(neighborId)) continue;

        const neighborNode = MAP_NODES[neighborId];
        if (!neighborNode) continue;

        // Skip Smuggler's Strait if boat is too heavy
        if (neighborNode.specialRule?.weightLimit && maxWeightAllowance > neighborNode.specialRule.weightLimit) {
          continue;
        }

        const newPath = [...current.path, neighborId];
        if (neighborId === targetNodeId) {
          return newPath;
        }

        visited.add(neighborId);
        queue.push({ nodeId: neighborId, path: newPath });
      }
    }

    return [startNodeId]; // fallback stay
  }

  /**
   * Decide daily order for an AI Bot ship
   */
  public static decideBotOrder(team: TeamShip, currentDay: number, currentEvent: any): Partial<DailyOrder> {
    const currentNode = MAP_NODES[team.currentLocationId];
    if (!currentNode) return { action: 'ANCHOR' };

    const currentWeight = calculateShipWeight(team.inventory);

    // 1. Determine Target Destination based on Game Day
    let targetDestination = 'node-12'; // Default: Cocoa Island

    if (team.currentLocationId === 'node-12') {
      // If at Cocoa Island, stay to dig up to 3 boxes or until Day 16
      if (team.inventory.treasureBoxes < 3 && currentDay <= 15) {
        return {
          action: 'ANCHOR',
          targetNodeId: 'node-12',
          buyWater: 0,
          buyFuel: 0,
          buyCannon: 0,
          buyCompass: 0,
          useCannon: false,
          useCompass: false,
          salvageFlotsam: false
        };
      }
      targetDestination = 'node-1'; // Return to Grand Port
    } else if (currentDay >= 15) {
      targetDestination = 'node-1'; // Turn back towards home
    }

    // 2. Find Next Step along the Path
    const path = this.findPath(team.currentLocationId, targetDestination, currentWeight);
    const nextNodeId = path.length > 1 ? path[1] : team.currentLocationId;

    let action: 'ADVANCE' | 'RETREAT' | 'ANCHOR' = 'ADVANCE';
    if (nextNodeId === team.currentLocationId) {
      action = 'ANCHOR';
    }

    // 3. Resource Shopping if at shop node
    let buyWater = 0;
    let buyFuel = 0;
    let buyCannon = 0;
    let buyCompass = 0;

    if (currentNode.shopAvailable && currentNode.prices) {
      let budget = team.gold;
      let projectedWeight = currentWeight;

      // Buy water if low (< 6 days reserve)
      if (team.inventory.water < 6 && budget >= currentNode.prices.water && projectedWeight + 50 <= 900) {
        const qty = Math.min(3, Math.floor(budget / currentNode.prices.water));
        buyWater = qty;
        budget -= qty * currentNode.prices.water;
        projectedWeight += qty * 50;
      }

      // Buy fuel if low (< 6 days reserve)
      if (team.inventory.fuel < 6 && budget >= currentNode.prices.fuel && projectedWeight + 10 <= 900) {
        const qty = Math.min(3, Math.floor(budget / currentNode.prices.fuel));
        buyFuel = qty;
        budget -= qty * currentNode.prices.fuel;
        projectedWeight += qty * 10;
      }

      // Buy cannon if 0
      if (team.inventory.cannon === 0 && budget >= currentNode.prices.cannon && projectedWeight + 60 <= 900) {
        buyCannon = 1;
        budget -= currentNode.prices.cannon;
        projectedWeight += 60;
      }

      // Buy compass if 0
      if (team.inventory.compass === 0 && budget >= currentNode.prices.compass && projectedWeight + 10 <= 900) {
        buyCompass = 1;
        budget -= currentNode.prices.compass;
        projectedWeight += 10;
      }
    }

    // 4. Combat stance: Use cannon if at Pirate's Cove (node-11)
    const useCannon = team.currentLocationId === 'node-11' && team.inventory.cannon > 0;

    // 5. Flotsam Salvage if available and weight allows
    const salvageFlotsam = !!(
      currentEvent?.affectedNodeIds?.includes(team.currentLocationId) &&
      currentWeight + 60 <= 900
    );

    return {
      action,
      targetNodeId: nextNodeId,
      buyWater,
      buyFuel,
      buyCannon,
      buyCompass,
      useCannon,
      useCompass: false,
      salvageFlotsam
    };
  }

  /**
   * Generate realistic spy intel & rumors for bots during Spy Phase
   */
  public static generateBotSpyIntel(team: TeamShip, allTeams: TeamShip[]): Partial<TeamShip['spyData']> {
    const fakeNodes = ['node-3', 'node-4', 'node-5', 'node-6', 'node-10'];
    const randomFakeNode = fakeNodes[Math.floor(Math.random() * fakeNodes.length)];
    const fakeGold = Math.max(100, team.gold + (Math.random() > 0.5 ? 300 : -200));

    const rumors = [
      'พวกเราติดพายุเบอร์มิวดา น้ำมันใกล้หมดแล้ว กำลังหาทางกลับ!',
      'มีข่าวว่าแถบช่องแคบลักลอบคลื่นลมแรงมาก อย่าเสี่ยงเข้าไป!',
      'เรือเราพบตาน้ำจืดที่โอเอซิส เสบียงพร้อมแล่นฉิว',
      'ได้ยินมาว่าเรือลำอื่นเตรียมยิงปืนใหญ่ดักปล้นที่อ่าวโจรสลัด',
      'สมบัติที่เกาะโกโก้ถูกขุดไปเยอะแล้ว ราคากำลังตก!',
      'กัปตันสั่งกางใบเต็มที่ มุ่งหน้ากลับ Grand Port Royal แล้ว'
    ];
    const randomRumor = rumors[Math.floor(Math.random() * rumors.length)];

    // Scout 1 other team
    const otherTeams = allTeams.filter(t => t.id !== team.id && !t.isSunk);
    const scoutedTeams = otherTeams.slice(0, 2).map(target => ({
      targetTeamId: target.id,
      suspectedNodeId: target.currentLocationId,
      notes: `สายลับรายงานว่า ${target.name} ดูเหมือนจะมีเสบียงหนาแน่น`
    }));

    return {
      fakeLocationNodeId: randomFakeNode,
      fakeGold,
      fakeTreasures: Math.max(0, team.inventory.treasureBoxes - 1),
      rumorMessage: randomRumor,
      scoutedTeams
    };
  }
}

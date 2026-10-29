import { defineStore } from 'pinia';
import { socket } from '../services/socket';

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: string;
}

export interface MapNode {
  id: string;
  code: number;
  name: string;
  nameTh: string;
  type: string;
  x: number;
  y: number;
  description: string;
  connectedTo: string[];
  shopAvailable: boolean;
  prices?: {
    water: number;
    fuel: number;
    cannon: number;
    compass: number;
  };
  specialRule?: any;
}

export interface TeamShip {
  id: string;
  name: string;
  color: string;
  currentLocationId: string;
  gold: number;
  inventory: {
    water: number;
    fuel: number;
    cannon: number;
    compass: number;
    treasureBoxes: number;
  };
  hullIntegrity: number;
  isBot: boolean;
  isSunk: boolean;
  sunkReason?: string;
  isReturnedSafely: boolean;
  members: Player[];
  pendingOrder: any;
  advisoryVotes: any[];
  spyData: any;
  logHistory: any[];
}

export const useGameStore = defineStore('game', {
  state: () => ({
    isConnected: false,
    currentPlayer: null as Player | null,
    currentRole: '' as string,
    currentTeamId: '' as string,

    // Global session state
    phase: 'LOBBY',
    currentDay: 1,
    maxDays: 15,
    turnSecondsRemaining: 90,
    isTimerRunning: false,
    currentEvent: null as any,
    teams: [] as TeamShip[],
    leaderboard: [] as any[],
    mapNodes: {} as Record<string, MapNode>,
    intelLeakNotice: null as any,
  }),

  getters: {
    myTeam(state): TeamShip | undefined {
      return state.teams.find(t => t.id === state.currentTeamId);
    },
    currentNode(state): MapNode | undefined {
      if (!this.myTeam) return undefined;
      return state.mapNodes[this.myTeam.currentLocationId];
    },
    isCaptain(state): boolean {
      return state.currentRole === 'CAPTAIN';
    },
    isSpy(state): boolean {
      return state.currentRole === 'SPY';
    },
    isSpyPhase(state): boolean {
      return state.phase === 'SPY_PHASE' || state.phase === 'SPY_REVISION';
    },
    currentShipWeight(state): number {
      if (!this.myTeam) return 0;
      const inv = this.myTeam.inventory;
      return (
        inv.water * 50 +
        inv.fuel * 10 +
        (inv.cannon > 0 ? 60 : 0) +
        inv.compass * 10 +
        inv.treasureBoxes * 50
      );
    }
  },

  actions: {
    initSocketListeners() {
      socket.on('connect', () => {
        this.isConnected = true;
      });

      socket.on('disconnect', () => {
        this.isConnected = false;
      });

      socket.on('GAME_STATE_UPDATE', (stateData: any) => {
        this.phase = stateData.phase;
        this.currentDay = stateData.currentDay;
        this.maxDays = stateData.maxDays;
        this.turnSecondsRemaining = stateData.turnSecondsRemaining;
        this.isTimerRunning = stateData.isTimerRunning;
        this.currentEvent = stateData.currentEvent;
        this.teams = stateData.teams;
        this.leaderboard = stateData.leaderboard;
        this.mapNodes = stateData.mapNodes;
      });

      socket.on('TIMER_TICK', (data: { secondsRemaining: number; phase: string; currentDay: number }) => {
        this.turnSecondsRemaining = data.secondsRemaining;
        this.phase = data.phase;
        this.currentDay = data.currentDay;
      });

      socket.on('PLAYER_REGISTERED', (player: Player) => {
        this.currentPlayer = player;
        this.currentRole = player.role;
        this.currentTeamId = player.teamId;
      });

      socket.on('INTEL_LEAK_BROADCAST', (leakData: any) => {
        this.intelLeakNotice = leakData;
        setTimeout(() => {
          this.intelLeakNotice = null;
        }, 10000);
      });
    },

    registerPlayer(name: string, teamId: string, role: string) {
      socket.emit('REGISTER_PLAYER', { name, teamId, role });
    },

    switchRole(newRole: string) {
      this.currentRole = newRole;
      if (this.currentPlayer) {
        this.currentPlayer.role = newRole;
        socket.emit('REGISTER_PLAYER', {
          name: this.currentPlayer.name,
          teamId: this.currentTeamId,
          role: newRole
        });
      }
    },

    updateDailyOrder(order: any) {
      if (this.currentTeamId) {
        socket.emit('UPDATE_DAILY_ORDER', { teamId: this.currentTeamId, order });
      }
    },

    submitAdvisoryVote(suggestedAction: string, suggestedTargetNodeId?: string, note?: string) {
      if (this.currentPlayer) {
        socket.emit('SUBMIT_ADVISORY_VOTE', {
          playerId: this.currentPlayer.id,
          playerName: this.currentPlayer.name,
          role: this.currentRole,
          suggestedAction,
          suggestedTargetNodeId,
          note
        });
      }
    },

    updateSpyIntel(intel: any) {
      if (this.currentTeamId) {
        socket.emit('UPDATE_SPY_INTEL', { teamId: this.currentTeamId, intel });
      }
    },

    // Instructor actions
    instructorStartGame() {
      socket.emit('INSTRUCTOR_START_GAME');
    },
    instructorResetGame() {
      socket.emit('INSTRUCTOR_RESET_GAME');
    },
    instructorPauseTimer() {
      socket.emit('INSTRUCTOR_PAUSE_TIMER');
    },
    instructorResumeTimer() {
      socket.emit('INSTRUCTOR_RESUME_TIMER');
    },
    instructorSkipDay() {
      socket.emit('INSTRUCTOR_SKIP_DAY');
    },
    instructorTriggerSpyPhase() {
      socket.emit('INSTRUCTOR_TRIGGER_SPY_PHASE');
    },
    instructorTriggerLeak(type: 'REVEAL_2_TEAMS' | 'BERMUDA_TRAP') {
      socket.emit('INSTRUCTOR_TRIGGER_LEAK', { type });
    },
    instructorToggleBot(teamId: string, isBot: boolean) {
      socket.emit('INSTRUCTOR_TOGGLE_BOT', { teamId, isBot });
    },
    instructorAutofillBots() {
      socket.emit('INSTRUCTOR_AUTOFILL_BOTS');
    },
    instructorAddShip(name: string, color?: string, isBot?: boolean) {
      socket.emit('INSTRUCTOR_ADD_SHIP', { name, color, isBot });
    },
    instructorRemoveShip(teamId: string) {
      socket.emit('INSTRUCTOR_REMOVE_SHIP', { teamId });
    }
  }
});

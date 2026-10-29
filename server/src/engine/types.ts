export enum GamePhase {
  LOBBY = 'LOBBY',
  DAY_WEATHER_BRIEF = 'WEATHER_BRIEF', // 20 วินาที
  DAY_DECISION = 'DAY_DECISION',       // 3 นาที (180 วินาที)
  END_DAY_PROCESSING = 'PROCESSING',   // 5 วินาที
  SPY_FREEZE = 'SPY_FREEZE',           // 5-7 นาที (ทุก Day 5, 10, 15, 20)
  STRATEGY_REVISION = 'STRATEGY_REV',  // 2 นาที (120 วินาที)
  FINAL_SUMMARY = 'FINAL_SUMMARY'      // สิ้นสุด Day 25
}

export enum ShipRole {
  CAPTAIN = 'CAPTAIN',                 // 👑 กัปตัน (ยืนยันคำสั่งประจำวัน)
  GEOGRAPHER = 'GEOGRAPHER',           // 🧭 นักภูมิศาสตร์ (พยากรณ์อากาศล่วงหน้า)
  NAVIGATOR = 'NAVIGATOR',             // ⚓ ต้นหน & คุมหางเสือ (เดิน/ถอย/จอด & คำนวณน้ำมัน)
  QUARTERMASTER = 'QUARTERMASTER',     // 💰 ฝ่ายเสบียง (น้ำหนัก/ซื้อขาย/เก็บของลอยน้ำ)
  GUNNER = 'GUNNER',                   // ⚔️ สรั่งเรือ & พลปืนใหญ่ (ปืนใหญ่/ซ่อมบำรุง/รบ)
  SPY = 'SPY',                         // 🕵️ สายลับ (ข่าวกรอง/ปล่อยข่าวลือ/Spy Phase)
  DECKHAND = 'DECKHAND'                // 👥 ลูกเรือทั่วไป (ไม่จำกัดจำนวน/ดูสถานะสด/โหวต)
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: ShipRole;
  isOnline: boolean;
  socketId: string;
}

export interface TeamInventory {
  water: number;        // ถัง (50 lbs / ถัง)
  fuel: number;         // ถัง (10 lbs / ถัง)
  cannon: number;       // ครั้ง (max 3 ครั้ง, 60 lbs)
  compass: number;      // อัน (1-time use, 10 lbs)
  treasureBoxes: number;// หีบ (50 lbs / หีบ)
}

export interface DailyOrder {
  action: 'ADVANCE' | 'RETREAT' | 'ANCHOR';
  targetNodeId: string;
  buyWater: number;
  buyFuel: number;
  buyCannon: number;
  buyCompass: number;
  useCannon: boolean;
  useCompass: boolean;
  salvageFlotsam: boolean;
  discardFlotsam: boolean;
  submittedBy: string; // Captain ID
}

export interface AdvisoryVote {
  playerId: string;
  playerName: string;
  role: ShipRole;
  suggestedAction: 'ADVANCE' | 'RETREAT' | 'ANCHOR';
  suggestedTargetNodeId?: string;
  note?: string;
}

export interface SpyIntel {
  fakeLocationNodeId?: string;
  fakeGold?: number;
  fakeTreasures?: number;
  rumorMessage?: string;
  scoutedTeams: {
    targetTeamId: string;
    suspectedNodeId: string;
    notes: string;
  }[];
}

export interface TeamShip {
  id: string;
  name: string;
  color: string;
  currentLocationId: string;
  gold: number;
  inventory: TeamInventory;
  hullIntegrity: number; // 0 - 100%
  isSunk: boolean;
  sunkReason?: string;
  isReturnedSafely: boolean;
  members: Player[];
  pendingOrder: Partial<DailyOrder>;
  advisoryVotes: AdvisoryVote[];
  spyData: SpyIntel;
  isBot: boolean;
  botStrategy?: 'TRADER' | 'SMUGGLER' | 'BALANCED' | 'PIRATE_HUNTER';
  logHistory: {
    day: number;
    message: string;
    goldChange: number;
    weight: number;
  }[];
}

export interface GMEvent {
  id: string;
  day: number;
  title: string;
  description: string;
  type: 'STORM' | 'PIRATE' | 'FLOTSAM' | 'CALM' | 'FOG';
  affectedNodeIds: string[]; // Node IDs ที่ได้รับผลกระทบ
  effect: {
    waterDrain?: number;
    fuelDrain?: number;
    hullDamage?: number;
    flotsamWater?: number;
    flotsamFuel?: number;
    flotsamTreasure?: number;
  };
}

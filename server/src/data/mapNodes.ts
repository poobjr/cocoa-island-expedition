export interface MapNode {
  id: string;
  code: number;
  name: string;
  nameTh: string;
  type: 'PORT' | 'SAFE' | 'TRADE' | 'HAZARD' | 'INTEL' | 'DESTINATION';
  x: number; // Percent on map (0-100)
  y: number; // Percent on map (0-100)
  description: string;
  connectedTo: string[]; // Node IDs
  shopAvailable: boolean;
  prices?: {
    water: number;
    fuel: number;
    cannon: number;
    compass: number;
  };
  specialRule?: {
    weightLimit?: number;
    freeWater?: boolean;
    flotsamChance?: number;
    radarRevealAll?: boolean;
    pirateChance?: number;
    stormImmunity?: boolean;
    repairAvailable?: boolean;
  };
}

export const MAP_NODES: Record<string, MapNode> = {
  // 1. Port Royal (Start & Finish)
  'node-1': {
    id: 'node-1',
    code: 1,
    name: 'Grand Port Royal',
    nameTh: 'ท่าเรือหลักหลวง (จุดเริ่มต้น/จบ)',
    type: 'PORT',
    x: 8,
    y: 50,
    description: 'ศูนย์กลางการค้าและอู่ต่อเรือหลวง เสบียงราคามาตรฐาน ทุกลำต้องกลับมาที่นี่ก่อนสิ้นสุดวันที่ 15',
    connectedTo: ['node-2'],
    shopAvailable: true,
    prices: { water: 50, fuel: 30, cannon: 200, compass: 100 },
    specialRule: { repairAvailable: true }
  },

  // 2. Unnamed Island
  'node-2': {
    id: 'node-2',
    code: 2,
    name: 'Unnamed Island',
    nameTh: 'เกาะนิรนาม (ทางแยกยุทธศาสตร์)',
    type: 'SAFE',
    x: 20,
    y: 50,
    description: 'จุดพักผ่อนแห่งแรก ไม่มีร้านค้า เป็นทางแยกเลือกมุ่งหน้าสู่ สายเหนือ, สายกลาง หรือ สายใต้',
    connectedTo: ['node-1', 'node-3', 'node-6', 'node-9'],
    shopAvailable: false,
    specialRule: { flotsamChance: 0.3 }
  },

  // สายเหนือ (Northern Trade Route)
  // 3. Deep Sea Oasis
  'node-3': {
    id: 'node-3',
    code: 3,
    name: 'Deep Sea Oasis',
    nameTh: 'โอเอซิสกลางสมุทร',
    type: 'TRADE',
    x: 35,
    y: 20,
    description: 'ตาน้ำจืดธรรมชาติกลางทะเล น้ำดื่มราคาถูกกว่าปกติ 50% แต่น้ำมันแพง',
    connectedTo: ['node-2', 'node-4', 'node-7'],
    shopAvailable: true,
    prices: { water: 25, fuel: 50, cannon: 250, compass: 120 },
    specialRule: { freeWater: false }
  },

  // 4. Fisherman Village
  'node-4': {
    id: 'node-4',
    code: 4,
    name: 'Fisherman Village',
    nameTh: 'หมู่บ้านชาวประมง',
    type: 'TRADE',
    x: 58,
    y: 18,
    description: 'ชุมชนชาวประมงพื้นบ้าน มีเสบียงครบครัน และมีช่างไม้ช่วยซ่อมแซมเรือ',
    connectedTo: ['node-3', 'node-5', 'node-8'],
    shopAvailable: true,
    prices: { water: 45, fuel: 35, cannon: 220, compass: 110 },
    specialRule: { repairAvailable: true }
  },

  // 5. Coral Lagoon
  'node-5': {
    id: 'node-5',
    code: 5,
    name: 'Coral Lagoon',
    nameTh: 'ทะเลสาบปะการัง',
    type: 'SAFE',
    x: 78,
    y: 25,
    description: 'แนวปะการังธรรมชาติที่กำบังคลื่นลม ปลอดภัยจากพายุกระหน่ำ 100% เหมาะจอดวางแผนบุกเกาะโกโก้',
    connectedTo: ['node-4', 'node-12'],
    shopAvailable: false,
    specialRule: { stormImmunity: true }
  },

  // สายกลาง (Central Mystery & Intel Route)
  // 6. Hermes Lighthouse
  'node-6': {
    id: 'node-6',
    code: 6,
    name: 'Hermes Lighthouse',
    nameTh: 'ประภาคารส่องน่านน้ำ',
    type: 'INTEL',
    x: 38,
    y: 48,
    description: 'ประภาคารโบราณสูงเสียดฟ้า หากจอดที่นี่จะสามารถมองเห็นพิกัดที่แท้จริงของเรือทุกลำได้ทันที',
    connectedTo: ['node-2', 'node-7'],
    shopAvailable: false,
    specialRule: { radarRevealAll: true }
  },

  // 7. Shipwreck Graveyard
  'node-7': {
    id: 'node-7',
    code: 7,
    name: 'Shipwreck Graveyard',
    nameTh: 'สุสานเรืออับปาง',
    type: 'HAZARD',
    x: 52,
    y: 50,
    description: 'ซากเรือสินค้าโบราณอับปาง มีทรัพยากรลอยน้ำ (Flotsam) ชุกชุม 100% แต่ระวังหินโสโครกทำเรือพัง',
    connectedTo: ['node-6', 'node-3', 'node-8', 'node-10'],
    shopAvailable: false,
    specialRule: { flotsamChance: 1.0 }
  },

  // 8. Bermuda Triangle
  'node-8': {
    id: 'node-8',
    code: 8,
    name: 'Bermuda Triangle',
    nameTh: 'สามเหลี่ยมเบอร์มิวดา',
    type: 'HAZARD',
    x: 70,
    y: 50,
    description: 'ทางลัดตรงสู่ Cocoa Island เร็วที่สุด แต่หมอกจัดและพายุบ่อย หากไม่มีเข็มทิศจะถูกคลื่นซัดหลงทิศ',
    connectedTo: ['node-7', 'node-4', 'node-11', 'node-12'],
    shopAvailable: false,
    specialRule: { stormImmunity: false }
  },

  // สายใต้ (Southern Smuggler & Pirate Route)
  // 9. Smuggler\'s Strait
  'node-9': {
    id: 'node-9',
    code: 9,
    name: "Smuggler's Strait",
    nameTh: 'ช่องแคบลักลอบ',
    type: 'HAZARD',
    x: 35,
    y: 80,
    description: 'ร่องน้ำแคบลัดเลาะโขดหิน ย่นระยะทางได้ไวมาก แต่น้ำตื้น เรือที่มีน้ำหนักเกิน 700 lbs จะแล่นผ่านไม่ได้!',
    connectedTo: ['node-2', 'node-10'],
    shopAvailable: false,
    specialRule: { weightLimit: 700 }
  },

  // 10. Black Market Atoll
  'node-10': {
    id: 'node-10',
    code: 10,
    name: 'Black Market Atoll',
    nameTh: 'อะทอลล์ตลาดมืด',
    type: 'TRADE',
    x: 55,
    y: 82,
    description: 'แหล่งรวมพ่อค้าเถื่อน ขายปืนใหญ่และเข็มทิศราคาพิเศษ พร้อมข่าวกรองลับของสายลับ',
    connectedTo: ['node-9', 'node-7', 'node-11'],
    shopAvailable: true,
    prices: { water: 60, fuel: 40, cannon: 150, compass: 70 },
    specialRule: { flotsamChance: 0.4 }
  },

  // 11. Pirate\'s Cove
  'node-11': {
    id: 'node-11',
    code: 11,
    name: "Pirate's Cove",
    nameTh: 'อ่าวรังโจรสลัด',
    type: 'HAZARD',
    x: 75,
    y: 78,
    description: 'รังของโจรสลัดทะเลแคริบเบียน มีโอกาส 80% ที่จะโดนปล้น หากมีปืนใหญ่สู้ชนะจะได้ทองคำ 500 Gold!',
    connectedTo: ['node-10', 'node-8', 'node-12'],
    shopAvailable: false,
    specialRule: { pirateChance: 0.8 }
  },

  // 12. Cocoa Island (Destination)
  'node-12': {
    id: 'node-12',
    code: 12,
    name: 'Cocoa Island',
    nameTh: 'เกาะโกโก้ (เกาะสมบัติในตำนาน)',
    type: 'DESTINATION',
    x: 92,
    y: 50,
    description: 'เป้าหมายสูงสุดของการเดินทาง! ขุดหีบสมบัติได้วันละ 1 กล่อง (หนัก 50 lbs) มูลค่าจะลดลงตามลำดับกล่องที่ขุด',
    connectedTo: ['node-5', 'node-8', 'node-11'],
    shopAvailable: false,
    specialRule: { freeWater: false }
  }
};

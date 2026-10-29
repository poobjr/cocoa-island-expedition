export interface ItemInfo {
  id: string;
  name: string;
  nameTh: string;
  weightLbs: number;
  descriptionTh: string;
}

export const ITEMS: Record<string, ItemInfo> = {
  water: {
    id: 'water',
    name: 'Fresh Water',
    nameTh: 'น้ำดื่ม',
    weightLbs: 50,
    descriptionTh: 'เสบียงสำคัญที่สุด! บริโภควันละ 1 ถัง (50 lbs) หากน้ำหมดลูกเรือจะตายและเรืออับปางทันที'
  },
  fuel: {
    id: 'fuel',
    name: 'Ship Fuel',
    nameTh: 'เชื้อเพลิง',
    weightLbs: 10,
    descriptionTh: 'ใช้ในการแล่นเรือวันละ 1 ถัง (10 lbs) หากทิ้งสมออยู่กับที่จะไม่เสียเชื้อเพลิง'
  },
  cannon: {
    id: 'cannon',
    name: 'Naval Cannon',
    nameTh: 'ปืนใหญ่',
    weightLbs: 60,
    descriptionTh: 'ใช้งานได้สูงสุด 3 ครั้ง ใช้ป้องกันตัวจากโจรสลัด หรือสกัดเรือคู่แข่ง'
  },
  compass: {
    id: 'compass',
    name: 'Ancient Compass',
    nameTh: 'เข็มทิศโบราณ',
    weightLbs: 10,
    descriptionTh: 'ใช้งานได้ครั้งเดียว (Single-use) ป้องกันการหลงทางในหมอกและพายุ Bermuda 100%'
  },
  treasure: {
    id: 'treasure',
    name: 'Treasure Box',
    nameTh: 'หีบสมบัติโบราณ',
    weightLbs: 50,
    descriptionTh: 'ขุดได้วันละ 1 กล่องที่ Cocoa Island นำกลับมาขายที่ Port เมื่อจบเกม'
  }
};

/**
 * คำนวณมูลค่าของหีบสมบัติตามลำดับกล่องที่ขุดได้ (Dynamic Price Decay)
 */
export function getTreasureValue(boxIndex: number): number {
  switch (boxIndex) {
    case 1:
      return 5000;
    case 2:
      return 4750;
    case 3:
      return 4250;
    case 4:
      return 3500;
    case 5:
      return 2500;
    default:
      return Math.max(1000, 2500 - (boxIndex - 5) * 400);
  }
}

/**
 * คำนวณน้ำหนักรวมของเรือ
 */
export function calculateShipWeight(inventory: {
  water: number;
  fuel: number;
  cannon: number;
  compass: number;
  treasureBoxes: number;
}): number {
  return (
    inventory.water * ITEMS.water.weightLbs +
    inventory.fuel * ITEMS.fuel.weightLbs +
    (inventory.cannon > 0 ? ITEMS.cannon.weightLbs : 0) +
    inventory.compass * ITEMS.compass.weightLbs +
    inventory.treasureBoxes * ITEMS.treasure.weightLbs
  );
}

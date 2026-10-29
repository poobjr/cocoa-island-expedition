import { GMEvent } from '../engine/types.js';

export const DAILY_GM_EVENTS: Record<number, GMEvent> = {
  1: {
    id: 'evt-1',
    day: 1,
    title: 'น่านน้ำเปิดรับสายลม',
    description: 'สภาพอากาศแจ่มใส ทะเลสงบ เหมาะแก่การออกเรือกางใบจาก Grand Port Royal',
    type: 'CALM',
    affectedNodeIds: ['node-1', 'node-2'],
    effect: {}
  },
  2: {
    id: 'evt-2',
    day: 2,
    title: 'พบกล่องเสบียงลอยน้ำ',
    description: 'มีถังน้ำดื่มจากเรือสินค้าลอยตามกระแสน้ำมายังบริเวณเกาะนิรนาม',
    type: 'FLOTSAM',
    affectedNodeIds: ['node-2'],
    effect: { flotsamWater: 1 }
  },
  3: {
    id: 'evt-3',
    day: 3,
    title: 'ลมต้านรุนแรงสายเหนือ',
    description: 'มีลมพัดสวนทิศทางในเส้นทางสายเหนือ เรือที่มุ่งหน้าไปยัง Deep Sea Oasis ต้องใช้เชื้อเพลิงเพิ่ม 1 ถังหากแล่นเรือ',
    type: 'STORM',
    affectedNodeIds: ['node-3'],
    effect: { fuelDrain: 1 }
  },
  4: {
    id: 'evt-4',
    day: 4,
    title: 'หมอกหนาลงจัดบริเวณประภาคาร',
    description: 'หมอกควันปริศนาปกคลุมรอบ Hermes Lighthouse ทัศนวิสัยลดลง',
    type: 'FOG',
    affectedNodeIds: ['node-6'],
    effect: {}
  },
  5: {
    id: 'evt-5',
    day: 5,
    title: 'สัญญาณข่าวกรอง: การรวมพลสายลับครั้งที่ 1',
    description: 'เข้าสู่วันที่ 5 กองบัญชาการประกาศเริ่มสงครามข้อมูล! ส่งตัวแทนสายลับเข้าสู่ HQ',
    type: 'CALM',
    affectedNodeIds: [],
    effect: {}
  },
  6: {
    id: 'evt-6',
    day: 6,
    title: 'เรือสินค้าชนหินโสโครกอับปาง',
    description: 'ซากเรือสินค้าแตกในสุสานเรือ พบถังเชื้อเพลิงและน้ำดื่มลอยน้ำจำนวนมาก!',
    type: 'FLOTSAM',
    affectedNodeIds: ['node-7'],
    effect: { flotsamFuel: 2, flotsamWater: 1 }
  },
  7: {
    id: 'evt-7',
    day: 7,
    title: 'โจรสลัดแบล็คเบียร์ดออกล่าเหยื่อ',
    description: 'กองเรือโจรสลัดออกอาละวาดแถบ Pirate\'s Cove เรือใดผ่านจุดนี้ต้องเตรียมยิงปืนใหญ่ป้องกันตัว!',
    type: 'PIRATE',
    affectedNodeIds: ['node-11'],
    effect: {}
  },
  8: {
    id: 'evt-8',
    day: 8,
    title: 'หมอกเปิดเหนือเกาะโกโก้',
    description: 'แสงแดดส่องสว่างเหนือ Cocoa Island เผยจุดขุดหีบสมบัติทองคำโบราณในตำนาน!',
    type: 'CALM',
    affectedNodeIds: ['node-12'],
    effect: {}
  },
  9: {
    id: 'evt-9',
    day: 9,
    title: 'พายุหมุนมรสุมสามเหลี่ยมเบอร์มิวดา',
    description: 'พายุหมุนรุนแรงก่อตัวใน Bermuda Triangle เรือที่ไม่มีเข็มทิศจะถูกคลื่นซัดเสียหายและหลงทิศ!',
    type: 'STORM',
    affectedNodeIds: ['node-8'],
    effect: { hullDamage: 20 }
  },
  10: {
    id: 'evt-10',
    day: 10,
    title: '🚨 มหาสงครามข่าวกรอง: การรวมพลสายลับครั้งที่ 2',
    description: 'เข้าสู่วันที่ 10! เรือหลายลำเริ่มขนหีบสมบัติกลับ ส่งสายลับด่วนเพื่อสืบว่าใครมีทองจริงหรือข่าวลวง!',
    type: 'CALM',
    affectedNodeIds: [],
    effect: {}
  },
  11: {
    id: 'evt-11',
    day: 11,
    title: 'ฝนตกหนักเติมน้ำจืดธรรมชาติ',
    description: 'พายุฝนบริสุทธิ์ตกช่วยชีวิตเรือที่กำลังเดินทางกลับ เรือในพื้นที่ปลอดภัยได้รับน้ำดื่ม +1 ถัง!',
    type: 'FLOTSAM',
    affectedNodeIds: ['node-2', 'node-4', 'node-5'],
    effect: { flotsamWater: 1 }
  },
  12: {
    id: 'evt-12',
    day: 12,
    title: 'โจรสลัดลอบซุ่มปิดล้อมช่องแคบ',
    description: 'เรือโจรดักปล้นบริเวณ Smuggler\'s Strait และ Pirate\'s Cove เพื่อแย่งชิงหีบสมบัติขากลับ!',
    type: 'PIRATE',
    affectedNodeIds: ['node-9', 'node-11'],
    effect: {}
  },
  13: {
    id: 'evt-13',
    day: 13,
    title: 'หมู่บ้านชาวประมงช่วยชีวิต',
    description: 'ชาวประมงออกมาช่วยลากเรือและขายเสบียงฉุกเฉินราคาพิเศษแก่เรือที่กำลังแข่งกันมุ่งหน้าสู่ท่าเรือหลวง',
    type: 'CALM',
    affectedNodeIds: ['node-4'],
    effect: {}
  },
  14: {
    id: 'evt-14',
    day: 14,
    title: 'เห็นแสงไฟประภาคารท่าเรือหลวงอยู่ลิบๆ',
    description: 'เหลือเวลาอีกเพียง 1 วันเท่านั้น! แสงไฟจาก Grand Port Royal ส่องสว่าง ใครจะนำสมบัติกลับถึงฝั่งได้ทันเวลา?',
    type: 'CALM',
    affectedNodeIds: ['node-1', 'node-2'],
    effect: {}
  },
  15: {
    id: 'evt-15',
    day: 15,
    title: '👑 วันสุดท้ายของการเดินทางสู่ Grand Port Royal (Final Day)',
    description: 'หมดเวลาการเดินทางเมื่อสิ้นสุดวันนี้! เรือที่เทียบท่า Grand Port Royal ได้สำเร็จจะเปิดหีบสมบัติขายแลกทองคำและตัดสินผู้ชนะ!',
    type: 'CALM',
    affectedNodeIds: ['node-1'],
    effect: {}
  },
  16: {
    id: 'evt-16',
    day: 16,
    title: 'พายุไซโคลนกระหน่ำสายกลาง',
    description: 'ไซโคลนถล่มสุสานเรือและเบอร์มิวดาอย่างรุนแรง ตัวเรือจะได้รับความเสียหาย 20% หากฝ่าไป',
    type: 'STORM',
    affectedNodeIds: ['node-7', 'node-8'],
    effect: { hullDamage: 20 }
  },
  17: {
    id: 'evt-17',
    day: 17,
    title: 'โจรสลัดลอบซุ่มโจมตีช่องแคบ',
    description: 'เรือโจรดักปล้นบริเวณ Smuggler\'s Strait เรือที่น้ำหนักเกินอาจหนีไม่พ้น',
    type: 'PIRATE',
    affectedNodeIds: ['node-9'],
    effect: {}
  },
  18: {
    id: 'evt-18',
    day: 18,
    title: 'ฝนตกหนักเติมน้ำจืดธรรมชาติ',
    description: 'พายุฝนบริสุทธิ์ตกทั่วทั้งน่านน้ำ เรือทุกลำได้รับน้ำดื่มฟรี +1 ถัง (หากน้ำหนักไม่เกิน)',
    type: 'FLOTSAM',
    affectedNodeIds: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7', 'node-8', 'node-9', 'node-10', 'node-11', 'node-12'],
    effect: { flotsamWater: 1 }
  },
  19: {
    id: 'evt-19',
    day: 19,
    title: 'กระแสน้ำหนุนมุ่งหน้าสู่ท่าเรือหลวง',
    description: 'ลมตะวันออกพัดแรง หนุนให้เรือแล่นกลับทิศตะวันตกได้เร็วขึ้น',
    type: 'CALM',
    affectedNodeIds: ['node-5', 'node-8', 'node-11'],
    effect: {}
  },
  20: {
    id: 'evt-20',
    day: 20,
    title: 'สัญญาณข่าวกรอง: สงครามข้อมูลโค้งสุดท้าย',
    description: 'เข้าสู่วันที่ 20! โอกาสสุดท้ายในการล้วงความลับว่าเรือลำใดกำลังนำสมบัติกลับไปขายที่ท่าเรือ',
    type: 'CALM',
    affectedNodeIds: [],
    effect: {}
  },
  21: {
    id: 'evt-21',
    day: 21,
    title: 'การนับถอยหลัง 5 วันสุดท้าย!',
    description: 'เหลือเวลาเพียง 5 วันเสมือน! เรือทุกลำต้องคำนวณเชื้อเพลิงและน้ำดื่มเพื่อแล่นกลับ Grand Port Royal',
    type: 'CALM',
    affectedNodeIds: [],
    effect: {}
  },
  22: {
    id: 'evt-22',
    day: 22,
    title: 'คลื่นลมแปรปรวนรอบนอก',
    description: 'ทะเลรอบนอกเริ่มปั่นป่วน ห้ามประมาทเด็ดขาด',
    type: 'STORM',
    affectedNodeIds: ['node-8', 'node-11'],
    effect: { hullDamage: 10 }
  },
  23: {
    id: 'evt-23',
    day: 23,
    title: 'หมู่บ้านชาวประมงช่วยชีวิต',
    description: 'ชาวประมงออกมาช่วยลากเรือและขายเสบียงฉุกเฉินราคาพิเศษแก่เรือที่กำลังเดินทางกลับ',
    type: 'CALM',
    affectedNodeIds: ['node-4'],
    effect: {}
  },
  24: {
    id: 'evt-24',
    day: 24,
    title: 'เห็นประภาคารท่าเรือหลวงอยู่ลิบๆ',
    description: 'แสงไฟจาก Grand Port Royal ส่องสว่าง ใครจะกลับถึงฝั่งได้อย่างปลอดภัย?',
    type: 'CALM',
    affectedNodeIds: ['node-1', 'node-2'],
    effect: {}
  },
  25: {
    id: 'evt-25',
    day: 25,
    title: 'วันสุดท้ายของการเดินทาง (Final Day)',
    description: 'เวลาสิ้นสุดลงเมื่อหมดวันนี้! เรือทุกลำที่เทียบท่า Grand Port Royal ได้สำเร็จจะเปิดหีบสมบัติขายแลกทองคำ!',
    type: 'CALM',
    affectedNodeIds: ['node-1'],
    effect: {}
  }
};

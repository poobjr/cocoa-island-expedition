# ⛵ The Island Adventure: Cocoa Island Expedition

> **Interactive Real-time Team Building Game & Simulation**  
> มหากาพย์การเดินเรือสำรวจเกาะโกโก้ 15 วัน — เกมจำลองสถานการณ์และการบริหารทรัพยากรแบบเรียลไทม์ผ่านมือถือและจอโปรเจกเตอร์

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **🎭 ระบบ 7 บทบาทบนเรือ (Multi-Role Ship Management):**
   - **กัปตันเรือ (Captain):** ตัดสินใจขั้นสูงสุด ออกคำสั่งเดินหน้า/ถอยหลัง/จอดพัก/ซ่อมแซมเรือ
   - **ต้นหน & หางเสือ (Navigator):** คาดการณ์สภาพอากาศล่วงหน้า ประหยัดน้ำมัน -10% และเลือกทิศทางเดินเรือ
   - **ฝ่ายเสบียงและการเงิน (Quartermaster):** บริหารเหรียญทอง ซื้อขายเสบียงน้ำดื่ม/เชื้อเพลิง คุมขีดจำกัดน้ำหนักเรือ
   - **นักภูมิศาสตร์ (Geographer):** อ่านแผนที่ ตรวจสอบสภาพลมกระแสน้ำ และโหนดพิเศษ
   - **สรั่งเรือ & ปืนใหญ่ (Gunner):** ป้องกันการบุกปล้นของโจรสลัด บำรุงรักษาตัวเรือไม่ให้อับปาง
   - **สายลับ & ข่าวกรอง (Spy):** สร้างข่าวลือลวงคู่แข่ง สืบพิกัดสมบัติ และดักฟังวิทยุสื่อสาร
   - **ลูกเรือทั่วไป (Deckhand):** ช่วยงานบนเรือ เพิ่มขีดความสามารถในการบรรทุกน้ำหนัก +15 lbs ต่อคน

2. **🗺️ แผนที่เดินเรือ 12 โหนดโบราณ (Nautical Sea Chart):**
   - กราฟิกสไตล์แผนที่เดินเรือโบราณแคริบเบียน พร้อมสายน้ำไหลเคลื่อนไหว
   - 3 เส้นทางหลัก: สายเหนือ (การค้า/ตาน้ำจืด), สายกลาง (สุสานเรือ/ประภาคารเรดาร์), สายใต้ (ช่องแคบลักลอบ/รังโจรสลัด)
   - ปลายทาง **Cocoa Island (Node 12)** เพื่อขุดหีบสมบัติทองคำ

3. **🎬 3D Dynamic Event Pop-ups:**
   - หน้าต่างแจ้งเตือนเหตุการณ์พร้อมภาพ 3D เสมือนจริง (โจรสลัด, พายุไต้ฝุ่น, เสบียงลอยน้ำ Flotsam, ทะเลสาบสงบ, เกาะสมบัติ)
   - ระบบ **Auto-Close Countdown 10 วินาที** พร้อมแถบ Progress Bar และปุ่ม Pause/Resume

4. **📡 Fog of War & Information Warfare:**
   - ซ่อนพิกัดและจำนวนสมบัติของเรือลำอื่นบนจอโปรเจกเตอร์
   - แสดงเฉพาะข่าวลือที่สายลับปล่อยออกมา ยกเว้นเรือที่เทียบท่าหลักหรือถูกประภาคารส่องเรดาร์ตรวจจับ

5. **⚡ Zero-DB Ephemeral Architecture:**
   - เก็บ State ทั้งหมดไว้ใน Node.js RAM เชื่อมต่อผ่าน Socket.io อย่างรวดเร็ว
   - รีเซ็ตเกมใหม่ได้ทันที เหมาะกับการจัดสัมมนาหลายรอบโดยไม่ต้องจัดการฐานข้อมูล

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm run install:all
```

### 2. รันในโหมดพัฒนา (Development)
เปิด 2 หน้าต่าง Terminal:
```bash
# Terminal 1: Backend Server (Port 3001)
npm run dev:server

# Terminal 2: Frontend Client (Port 5173)
npm run dev:client
```

เข้าใช้งานผ่านเบราว์เซอร์:
- **หน้าผู้เข้าร่วม (Mobile/Participant):** `http://localhost:5173/#participant`
- **หน้าจอโปรเจกเตอร์ใหญ่ (Projector):** `http://localhost:5173/#projector`
- **หน้าจอวิทยากร/ผู้ควบคุม (Instructor):** `http://localhost:5173/#instructor`

---

## 📦 การ Build และนำขึ้นเซิร์ฟเวอร์ (Production & Cloud Deployment)

### Build ทั้งโปรเจกต์:
```bash
npm run build
```

### Start Production Server:
```bash
npm start
```
*ระบบจะเปิดเซิร์ฟเวอร์ Express และ Serve หน้าเว็บ Frontend จากพอร์ตเดียวกัน (ค่าเริ่มต้น: 3001 หรือตามค่า `PORT` ของโฮสติ้ง)*

---

## ☁️ แนะนำการ Deploy บน Cloud (Render / Railway / Docker)

- **Render.com / Railway.app:**
  - สร้าง New Web Service จาก GitHub Repository
  - **Build Command:** `npm run install:all && npm run build`
  - **Start Command:** `npm start`
  - รองรับ WebSocket 100% พร้อม HTTPS ให้ใช้งานทันที

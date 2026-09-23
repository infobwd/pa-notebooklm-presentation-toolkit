# Web App — Phase 3.5

Static web app สำหรับ Easy Mode ของ PA NotebookLM Presentation Toolkit

## คุณสมบัติ

- Wizard 8 ขั้นตอน
- บันทึกข้อมูลอัตโนมัติใน `localStorage`
- Import / Export โปรเจกต์เป็น JSON
- ตัวชี้วัด TARGET / ACTUAL แบบเพิ่ม-ลดได้
- Visual Evidence checklist
- Readiness check สำหรับ Draft / Final
- Generate Markdown 6 ไฟล์ใน Browser
- ตัวเลือกแบบ Datalist + Quick Pick สำหรับตำแหน่ง วิทยฐานะ สังกัด Model และแหล่งข้อมูลตั้งต้น
- Responsive layout สำหรับ Desktop / Tablet / Mobile
- ใช้ฟอนต์ **Kanit** เป็นฟอนต์หลัก (โหลดจาก Google Fonts พร้อม fallback)
- แสดง **ตัวอย่างใต้ช่องกรอก** เพื่อช่วยผู้ใช้เข้าใจว่าควรกรอกอะไร
- **Local Document Reader**: อ่าน PDF/DOCX/TXT/MD ใน Browser โดยไม่อัปโหลดไฟล์ผ่าน Toolkit
- PDF ใช้ text layer; PDF สแกนที่ไม่มีข้อความจะแจ้งเตือน (Phase 3 ยังไม่มี OCR)
- เลือกเอกสารที่จะรวมเป็น Source, Preview/แก้ข้อความ, Copy หรือดาวน์โหลด extracted text
- คัดลอก **Prompt + Sources** ไปใช้กับ AI ภายนอก แล้วนำ JSON กลับมา Import
- **External AI JSON Bridge**: คัดลอก Prompt → ให้ AI ตอบ JSON → ตรวจ JSON → Import เข้าฟอร์ม
- รองรับ Import แบบเติมเฉพาะช่องว่างหรือแทนข้อมูลเดิม
- ตรวจ schema, duration, indicators และ evidenceTypes ก่อน Import
- **Evidence Trace ต่อ ACTUAL**: source file / page / period / population / cohort / verification
- คำนวณร้อยละจาก numerator / denominator ได้ใน Indicator Card
- **Document Role** และเลือกหน้า PDF ที่จะส่งให้ AI
- **Conflict Detector + Pre-Import Review** ก่อนเขียนทับข้อมูลเดิม
- รองรับ migration จาก JSON รุ่น 2.2 → 3.1
- Automated reliability tests ใน GitHub Actions
- Preview Studio สำหรับตรวจ/แก้ไขไฟล์ก่อนดาวน์โหลด
- Script word count + ประมาณเวลาอ่าน
- Preview tabs สำหรับ Results / Storyboard / Script / Manifest / Prompts / QA
- ดาวน์โหลดไฟล์รายตัวหรือ Bundle สำรองไฟล์เดียว
- ไม่เรียก AI API
- ไม่มี backend

## Privacy

โค้ด Phase 3.1 ไม่ส่งข้อมูลที่กรอกไปยัง API ภายนอก ข้อมูลฟอร์มอยู่ใน Browser ของผู้ใช้

> หมายเหตุ: หากเผยแพร่เว็บผ่าน GitHub Pages ตัวเว็บเองอาจเข้าถึงได้ตามการตั้งค่า Pages ของ Repository ดังนั้นไม่ควรกรอกข้อมูลส่วนบุคคลที่ไม่จำเป็นหรือข้อมูลลับ

## Local Preview

เปิด `web/index.html` ผ่าน static HTTP server หรือ GitHub Pages

## GitHub Pages

Workflow ที่ `.github/workflows/pages.yml` จะ deploy โฟลเดอร์ `web/` เมื่อมี push ไปที่ `main`

Expected URL:
`https://infobwd.github.io/pa-notebooklm-presentation-toolkit/`

หาก workflow แจ้งว่า Pages ยังไม่เปิด ให้ไปที่ Repository Settings → Pages → Source: GitHub Actions แล้วรัน workflow ใหม่


## Phase 3 dependencies

โหลดเมื่อผู้ใช้ต้องการอ่านเอกสาร:
- PDF.js `3.11.174` ผ่าน jsDelivr
- Mammoth `1.8.0` ผ่าน jsDelivr

Toolkit ดาวน์โหลดเฉพาะ library code จาก CDN; document bytes ถูกประมวลผลใน Browser และไม่ได้ถูกส่งไป CDN โดยโค้ดของ Toolkit


## Owner Test Data

มีข้อมูลทดสอบจริงของเจ้าของ repo สำหรับตรวจ workflow โดยเฉพาะ:

- `web/test-data/owner-pa-2569.ai-intake.json` — ใช้กับ AI JSON Assistant
- `web/test-data/owner-pa-2569.project.json` — ใช้กับ Import Project
- `web/test-data/README.md` — อธิบายขอบเขตและ guardrails

ใน AI JSON Assistant มีปุ่ม **Owner Test Data** เพื่อโหลด fixture แรกเข้าสู่ช่อง JSON โดยตรง

ข้อมูลนี้ตั้งใจให้ ACTUAL ของตัวชี้วัด PA ยังเป็น PENDING เพื่อทดสอบว่าระบบไม่ควรขึ้นสถานะ Final โดยไม่มีหลักฐานจริง


## Phase 3.1 schemas

- AI Intake: `pa-toolkit/intake/3.1`
- Project: `pa-toolkit/project/3.1`
- `web/schema/ai-intake.schema.json`
- `web/schema/project.schema.json`

ACTUAL จะนับเป็น Final-ready เมื่อมี Evidence Trace ครบและผู้ใช้เลือก **ตรวจต้นฉบับแล้ว**


## Phase 3.2 — UX & Evidence Review

- STEP 3: ACTUAL มีตัวเลือก 5 รูปแบบ — PENDING / จำนวน÷ทั้งหมด / ร้อยละ / คะแนนหรือค่า / ข้อความผลจริง
- แบบจำนวน÷ทั้งหมดคำนวณร้อยละให้อัตโนมัติ
- Evidence Trace อยู่ใต้ตัวชี้วัดใน STEP 3 และระบุ UNVERIFIED / VERIFIED ชัดเจน
- STEP 7: กดดูรายละเอียดตัวชี้วัดรายข้อ และกดกลับไปแก้รายการนั้นใน STEP 3 ได้
- ช่องกรอกข้อความทั่วไปใช้ **Sarabun** ส่วนหัว/ปุ่มยังใช้ Kanit
- ช่องข้อมูลยาวเปลี่ยนเป็น Rich Editor พร้อมนับคำ/ตัวอักษร
- Context / Process / Systems ใช้ Smart Numbered List เพิ่ม/ลบรายการได้
- เลิกใช้ blocking `window.alert()` และเปลี่ยนเป็น Toast Notification
- การแก้ ACTUAL/Evidence/Trace หลัง VERIFIED จะเปลี่ยนกลับเป็น UNVERIFIED อัตโนมัติ


## Phase 3.3 — Dashboard & Source Audit

- STEP 7 มี **Project Dashboard** สรุป Draft, Verified ACTUAL, เอกสารใน session, Source links, Audit issues และรายการที่ยังต้องตรวจ
- **Source-to-Page Navigation**: ถ้า Evidence Trace ระบุไฟล์/หน้าและไฟล์นั้นอยู่ใน Document Reader ระบบแสดง excerpt และเปิดกลับไปยัง Source ได้
- **Document Audit** ตรวจ:
  - exact duplicate
  - near duplicate
  - ชื่อไฟล์/เวอร์ชันใกล้กันแต่เนื้อหาต่างกัน
  - เอกสารซ้ำที่ถูกกำหนด Role ต่างกัน
  - Source file ของตัวชี้วัดที่ยังไม่โหลดใน session
  - Source page ที่อยู่นอกช่วงเอกสาร
- ผล Audit เป็นคำเตือนเพื่อให้ผู้ใช้ตรวจ ไม่เปลี่ยนข้อเท็จจริงหรือเลือกเอกสารแทนผู้ใช้
- Source Manifest ที่ Generate ใน session จะบันทึก Document Audit summary ไว้ด้วย


## Phase 3.4 — Guided Import & Source Picker

แก้ pain point ด้าน UX สองจุด:

### Import JSON
- ปุ่ม **Import เข้าระบบ** กดได้ตลอด
- ถ้ายังไม่กด **ตรวจ JSON** ระบบจะตรวจให้ก่อนอัตโนมัติ
- ถ้า JSON ผิด จะแสดง Error + Toast และไม่ Import
- ถ้า JSON ผ่าน จะแสดง Pre-Import Review และแจ้งให้ผู้ใช้ตรวจแล้วกด Import อีกครั้ง
- ไม่มี silent no-op จากปุ่ม disabled

### Source file / page ใน STEP 3
Evidence Trace ไม่ต้องพิมพ์ชื่อไฟล์เองอย่างเดียวอีกต่อไป:
- เลือกจากไฟล์ที่อ่านอยู่ใน Document Reader
- กด **เลือกไฟล์ต้นทาง** เพื่อเปิด Document Reader และเลือกไฟล์จากเครื่อง
- หลังอ่านข้อความ แต่ละเอกสารมีปุ่ม **ใช้เป็น Source**
- ถ้า Source เป็น PDF ระบบแสดง dropdown เลือกหน้าอย่างรวดเร็ว
- ยังพิมพ์ “หน้า 4 / ตาราง 2 / ภาคผนวก ก” เองได้
- Source file/page คือเอกสารจริงที่รองรับ ACTUAL ไม่ใช่ Visual Evidence


## Phase 3.5 — Hardening & Acceptance

เพิ่ม quality gate สำหรับ critical workflow:
- Browser acceptance ด้วย Playwright + Chromium
- Desktop / Tablet / Mobile viewport
- Owner Test Data → auto-validate → Pre-Import Review → Import
- Owner fixture ต้องยังเป็น DRAFT และ Verified ACTUAL = 0/3
- invalid JSON ต้องมี visible error + Toast
- STEP 3 Source Picker ด้วยไฟล์ TXT จริงใน browser test
- เลือก Source แล้วต้องยัง UNVERIFIED
- localStorage persistence หลัง reload
- ตรวจ console/page runtime errors
- failure เก็บ screenshot/error artifact ใน GitHub Actions

เพิ่ม runtime hardening:
- localStorage save/load มี error handling
- runtime error / unhandled promise rejection แสดงสถานะและ Toast แทนการล้มเงียบ


## Phase 3.5.1 — UX Polish

ปรับจากการทดสอบใช้งานจริง:
- STEP 2: **Model / แนวทางหลัก** รองรับหลายบรรทัดผ่าน Rich Editor
- STEP 2: **แหล่งข้อมูลตั้งต้น** รองรับหลายรายการแบบ Smart Numbered List
- มี quick-add สำหรับ PDCA / PLC / Active Learning และ SAR / ผลประเมิน / PLC โดยเพิ่มต่อท้าย ไม่เขียนทับค่าที่มี
- STEP 3: TARGET มีปุ่มช่วยใส่ **≥ / ≤ / = / %** ไม่ต้องพิมพ์สัญลักษณ์พิเศษเอง
- External AI Bridge เปลี่ยนเป็น 1 คอลัมน์เร็วขึ้นบนจอเล็ก/โน้ตบุ๊ก และ full-screen บนมือถือ
- ปุ่มใน modal แตกบรรทัด/เรียงแนวตั้งบนมือถือ เพื่อลด horizontal overflow


## Phase 3.5.2 — Visual Evidence Organizer

STEP 6 ปรับเป็น Visual Organizer:
- แนบภาพแล้วเห็น Preview ใน Browser
- แสดงไฟล์ต้นฉบับ + ชื่อไฟล์มาตรฐาน
- เลือก slot จาก Visual Naming Plan
- แก้ชื่อมาตรฐานเองได้
- ระบุประเภท Visual Evidence ต่อภาพ
- เตือนชื่อซ้ำและนามสกุลที่ไม่ตรงกับแผน
- ดาวน์โหลดสำเนาภาพด้วยชื่อมาตรฐานได้
- Project JSON เก็บ metadata + Naming Plan แต่ไม่เก็บ binary image
- หลัง refresh ต้องเลือกไฟล์จริงอีกครั้งเพื่อดู Preview/ดาวน์โหลดสำเนา
- Source Manifest และ Visual Storyboard ใช้ชื่อไฟล์มาตรฐาน

Toolkit มี Generic Naming Plan ในตัว และรองรับ Import Naming Plan JSON ของแต่ละ Project

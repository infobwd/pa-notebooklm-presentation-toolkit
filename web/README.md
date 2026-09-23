# Web App — Phase 3.2

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

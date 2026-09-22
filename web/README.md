# Web App — Phase 3

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
- Preview Studio สำหรับตรวจ/แก้ไขไฟล์ก่อนดาวน์โหลด
- Script word count + ประมาณเวลาอ่าน
- Preview tabs สำหรับ Results / Storyboard / Script / Manifest / Prompts / QA
- ดาวน์โหลดไฟล์รายตัวหรือ Bundle สำรองไฟล์เดียว
- ไม่เรียก AI API
- ไม่มี backend

## Privacy

โค้ด Phase 3 ไม่ส่งข้อมูลที่กรอกไปยัง API ภายนอก ข้อมูลฟอร์มอยู่ใน Browser ของผู้ใช้

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

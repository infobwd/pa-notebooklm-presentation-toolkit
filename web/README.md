# Web App — Phase 1

Static web app สำหรับ Easy Mode ของ PA NotebookLM Presentation Toolkit

## คุณสมบัติ

- Wizard 8 ขั้นตอน
- บันทึกข้อมูลอัตโนมัติใน `localStorage`
- Import / Export โปรเจกต์เป็น JSON
- ตัวชี้วัด TARGET / ACTUAL แบบเพิ่ม-ลดได้
- Visual Evidence checklist
- Readiness check สำหรับ Draft / Final
- Generate Markdown 6 ไฟล์ใน Browser
- ไม่เรียก AI API
- ไม่มี backend

## Privacy

โค้ด Phase 1 ไม่ส่งข้อมูลที่กรอกไปยัง API ภายนอก ข้อมูลฟอร์มอยู่ใน Browser ของผู้ใช้

> หมายเหตุ: หากเผยแพร่เว็บผ่าน GitHub Pages ตัวเว็บเองอาจเข้าถึงได้ตามการตั้งค่า Pages ของ Repository ดังนั้นไม่ควรกรอกข้อมูลส่วนบุคคลที่ไม่จำเป็นหรือข้อมูลลับ

## Local Preview

เปิด `web/index.html` ผ่าน static HTTP server หรือ GitHub Pages

## GitHub Pages

Workflow ที่ `.github/workflows/pages.yml` จะ deploy โฟลเดอร์ `web/` เมื่อมี push ไปที่ `main`

Expected URL:
`https://infobwd.github.io/pa-notebooklm-presentation-toolkit/`

หาก workflow แจ้งว่า Pages ยังไม่เปิด ให้ไปที่ Repository Settings → Pages → Source: GitHub Actions แล้วรัน workflow ใหม่

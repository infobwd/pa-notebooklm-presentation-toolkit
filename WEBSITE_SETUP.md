# Website Setup — GitHub Pages

เว็บไซต์ Easy Mode อยู่ใน `web/` และ Repository นี้เป็น **Public**

## วิธีเผยแพร่ที่ใช้เป็นค่าเริ่มต้น

แนะนำ GitHub Pages แบบ:

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/ (root)`

ที่ root มี `index.html` สำหรับพาผู้ใช้เข้า `web/` อัตโนมัติ

URL:

`https://infobwd.github.io/pa-notebooklm-presentation-toolkit/`

## ตั้งค่าครั้งแรก

1. Repository → **Settings**
2. **Pages**
3. Build and deployment → Source = **Deploy from a branch**
4. Branch = **main**
5. Folder = **/(root)**
6. Save

หลังจากนั้น push เข้า `main` จะ trigger Pages build ตาม GitHub

## GitHub Actions alternative

ไฟล์ `.github/workflows/pages.yml` ยังเก็บไว้เป็นทางเลือกสำหรับอนาคต หากต้องการเปลี่ยน Pages Source เป็น **GitHub Actions**

เพื่อป้องกัน Pages deployment ชนกัน Workflow นี้จึงรันแบบ **manual only** ในสถานะปัจจุบัน

## Phase 2

เว็บไซต์รองรับ:
- Wizard 8 ขั้นตอน
- localStorage
- Import/Export Project JSON
- Draft/Final readiness
- Generate Markdown 6 ไฟล์
- Preview Studio
- แก้ Markdown ก่อนดาวน์โหลด
- ประมาณจำนวนคำ/เวลา Script
- Bundle สำรอง

## Privacy

- ไม่มี backend
- ไม่มี AI API
- ข้อมูลฟอร์มเก็บใน Browser
- Generate Markdown ใน Browser
- การเลือกไฟล์หลักฐานใช้ชื่อไฟล์สำหรับ Manifest ไม่ได้ upload ไฟล์จากโค้ด Toolkit

Repository และเว็บไซต์เป็น Public ดังนั้น **อย่า commit ข้อมูลส่วนบุคคลหรือหลักฐานจริงของผู้รับการประเมินลง Repository นี้**  
ข้อมูลที่ผู้ใช้กรอกผ่านเว็บไม่ถูก commit เข้า Repository โดยอัตโนมัติ

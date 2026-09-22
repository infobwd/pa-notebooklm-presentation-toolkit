# Phase 2 — Preview & Export

สถานะ: **Implemented**

## เป้าหมาย

ทำให้ Easy Mode เปลี่ยนจาก “กรอกแล้วดาวน์โหลด” เป็น workflow:

**กรอก → ตรวจความพร้อม → Generate → Preview → แก้ไข → Export → NotebookLM**

## สิ่งที่เพิ่ม

### 1. Preview Studio
หลัง Generate ผู้ใช้เปิดดูได้ครบ:
- Presentation Results Source
- Visual Storyboard
- Presentation Script
- Source Manifest
- NotebookLM Prompts
- Final QA Checklist

### 2. Editable Markdown
ผู้ใช้แก้ข้อความใน Preview ก่อนดาวน์โหลดได้ โดยไม่ต้องเปิด text editor ภายนอก

> การแก้ไขนี้อยู่ใน generated session ปัจจุบัน หาก Generate ใหม่จาก Form ระบบจะสร้างใหม่จากข้อมูลใน Form

### 3. Script Timing Helper
ระบบนับคำด้วย `Intl.Segmenter` เมื่อ Browser รองรับ และประมาณเวลาเล่าด้วยค่าประมาณ 120 คำ/นาที

ค่าดังกล่าวใช้เพื่อช่วยตรวจความยาวเท่านั้น ไม่ใช่การรับรองเวลาพูดจริง

### 4. File Preview Tabs
สลับไฟล์ด้วย Tab และ Copy/Download ไฟล์ที่กำลังตรวจได้ทันที

### 5. Backup Bundle
รวม Markdown ทั้ง 6 ไฟล์เป็นไฟล์ `*-notebooklm-package-bundle.md` สำหรับสำรองหรือตรวจทาน

สำหรับ NotebookLM ยังแนะนำ **ไฟล์แยก** ตาม Source Manifest เพื่อควบคุมบทบาทของแต่ละ Source ได้ชัดกว่า

### 6. Project Portability
Phase 1 มี Import/Export JSON อยู่แล้ว และ Phase 2 ใช้ต่อโดยไม่เปลี่ยน format ของ Project

## สิ่งที่ยังไม่ทำใน Phase 2

- อ่านเนื้อหา PDF/DOCX อัตโนมัติ
- OCR
- AI API
- Upload หลักฐานไป server
- สร้าง Slide/Video โดยตรง

สิ่งเหล่านี้หากทำ จะอยู่ใน Phase 3 หรือภายหลัง และต้องพิจารณา privacy/data handling ก่อน

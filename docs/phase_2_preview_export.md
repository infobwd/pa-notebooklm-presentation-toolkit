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


---

# Phase 2.1 — Easier Choices & Responsive UX

สถานะ: **Implemented**

## การเลือกข้อมูล
เพิ่มตัวเลือกสำเร็จรูปโดยยังคงเปิดให้พิมพ์ค่าเฉพาะของแต่ละบุคคลได้:
- ตำแหน่ง
- วิทยฐานะ
- สังกัด
- Model / แนวทาง
- แหล่งข้อมูลตั้งต้น

ตำแหน่ง/วิทยฐานะ/สังกัดมีทั้ง Datalist และ Quick Pick สำหรับรายการที่ใช้บ่อย จึงลดการพิมพ์ซ้ำบนมือถือ

## Responsive
ปรับ breakpoint สำหรับ:
- Desktop
- Tablet 721–1180 px
- Mobile ≤720 px
- Small mobile ≤390 px

บนมือถือ:
- Navigation เปลี่ยนเป็นแนวนอนเลื่อนได้
- Form เป็น 1 column
- ปุ่ม Next/Back ติดด้านล่าง
- ปุ่ม Export/Import จัดเป็น 2 column
- Quick Pick เลื่อนแนวนอนได้
- Input ใช้ 16px เพื่อลดการ zoom อัตโนมัติบน mobile browser

## Typography
ใช้ **Kanit** เป็น font หลักผ่าน Google Fonts และมี system font fallback หากโหลด font ภายนอกไม่ได้

ไม่มีข้อมูลฟอร์มถูกส่งไป Google Fonts; browser เพียงร้องขอไฟล์ CSS/font เพื่อการแสดงผล


---

# Phase 2.2 — Field Examples & External AI JSON Bridge

สถานะ: **Implemented**

## 1. ตัวอย่างในทุกช่องสำคัญ
ระบบเพิ่มข้อความ “ตัวอย่าง:” ใต้ field หลักโดยอัตโนมัติ เช่น:
- ชื่อ/ตำแหน่ง/วิทยฐานะ/สังกัด
- รอบ PA และช่วงผลการปฏิบัติงาน
- ประเด็นท้าทาย/Model/Baseline
- ปัญหา/Context/Process
- ผลเชิงคุณภาพ
- Student / Service Journey
- ระบบ/นวัตกรรม/การมีส่วนร่วม
- รางวัล/การขยายผล/Policy

Indicator card มีตัวอย่างแยกสำหรับ:
- ชื่อตัวชี้วัด
- TARGET
- ACTUAL
- หลักฐาน

## 2. External AI JSON Prompt
ปุ่ม **AI JSON Assistant** สร้าง Prompt มาตรฐานสำหรับใช้กับ AI ภายนอก โดยกำหนด:
- schema_version = `pa-toolkit/intake/2.2`
- JSON only
- ห้าม Markdown fence
- ห้ามเดา ACTUAL
- ห้ามเปลี่ยน CONTEXT เป็นผลจริง
- ข้อมูลไม่พอให้ใช้ค่าว่างหรือ PENDING
- รองรับ indicators หลายรายการ
- รองรับ evidenceTypes เฉพาะค่าที่ Toolkit รู้จัก

## 3. JSON Validation
ก่อน Import ระบบตรวจ:
- JSON syntax
- object shape
- schema version warning
- duration 5/7
- indicators array
- field type
- evidenceTypes allowlist

## 4. Import Modes
- **Fill blanks**: เติมเฉพาะช่องที่ยังว่าง (ค่าเริ่มต้น)
- **Replace**: ใช้ JSON แทนข้อมูลในฟอร์ม

Import เป็นเพียงการช่วยกรอกข้อมูล ไม่ถือเป็นการ verify หลักฐาน

## 5. Project JSON
Project export เพิ่ม:
- `schema_version: pa-toolkit/project/2.2`
- `version: 2`

ยังคงรองรับ Project JSON เดิมในระดับ field ที่ระบบรู้จัก

## Security / Privacy
External AI เป็นบริการนอก Toolkit ผู้ใช้ต้องพิจารณานโยบายข้อมูลของบริการที่เลือกเอง
Toolkit ไม่ส่งข้อมูลไป AI ภายนอกโดยอัตโนมัติ; ผู้ใช้เป็นผู้ Copy Prompt/แนบเอกสาร/วาง JSON กลับเข้าระบบด้วยตนเอง

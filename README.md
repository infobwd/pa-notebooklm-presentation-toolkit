# PA NotebookLM Presentation Toolkit

ชุดคู่มือและ Template กลางสำหรับช่วยผู้บริหารสถานศึกษา/ครู/บุคลากรทางการศึกษาเตรียมข้อมูลเพื่อสร้าง **Slide Deck** และ **Video Overview** ด้วย NotebookLM โดยเน้นความถูกต้องของหลักฐาน การแยก TARGET/ACTUAL และการควบคุมภาพที่ใช้ในการนำเสนอ

## แนวคิดหลัก

**COLLECT → CLASSIFY → SYNTHESIZE → VISUALIZE → GENERATE → VERIFY**

หรือ

**รวบรวมหลักฐาน → จำแนกข้อมูล → สังเคราะห์สาระ → วางแผนภาพ → สร้างสื่อ → ตรวจสอบ**

Toolkit นี้ออกแบบให้ใช้กับข้อมูลของแต่ละบุคคลโดยไม่ผูกกับชื่อ โรงเรียน นวัตกรรม หรือระบบใดเป็นพิเศษ

## เริ่มต้น

**เปิด `START_HERE.md` ก่อน** แล้วเลือกโหมดที่เหมาะกับคุณ

### 🟢 Easy Mode
สำหรับผู้ใช้ทั่วไป: **กรอก → แนบ → สร้าง → ตรวจ → นำเสนอ**

ใช้โฟลเดอร์ `EASY_MODE/`

### 🔵 Advanced Mode
สำหรับผู้ที่ต้องการควบคุม Source, Storyboard, Script, Prompt และ QA อย่างละเอียด

จากนั้นจึงใช้:

1. อ่าน `QUICK_START.md`
2. ถ้าต้องการดูตัวอย่างที่กรอกครบแล้ว ให้เปิด `examples/sample_generic/README.md`
3. กรอก `templates/01_profile_template.md`
4. สร้าง Presentation Results Source จาก `templates/02_presentation_results_template.md`
5. วางแผนภาพด้วย `templates/03_visual_storyboard_template.md`
6. เลือก Script 5 หรือ 7 นาที
7. จัด Sources ตาม `templates/07_source_manifest_template.md`
8. ใช้ Prompt จาก `templates/06_notebooklm_prompts_template.md`
9. ตรวจงานด้วย `templates/10_final_qa_checklist.md`

### ตัวอย่าง End-to-End

โฟลเดอร์ `examples/sample_generic/` เป็น **ตัวอย่าง Advanced แบบครบวงจร**

โฟลเดอร์ `examples/sample_easy_mode/` เป็น **ตัวอย่าง Easy Mode** ที่แสดงว่าผู้ใช้กรอกเพียง Input Form แล้ว AI ควรสร้างอะไรต่อให้

> ตัวอย่างนี้เป็น FICTIONAL SAMPLE เท่านั้น ห้ามนำชื่อ ตัวเลข หรือเนื้อหาตัวอย่างไปใช้เป็นข้อมูลจริง

## Data Isolation Rule

> ใช้เฉพาะข้อมูลของผู้รับการประเมินรายนี้จาก Sources ใน Notebook ปัจจุบัน ห้ามนำชื่อ ตัวเลข ผลงาน รางวัล ระบบ หรือนวัตกรรมจากตัวอย่าง บุคคลอื่น หรือ Notebook อื่นมาปะปน หากไม่มีข้อมูล ให้ระบุ **PENDING** แทนการคาดเดา

## โครงสร้าง

- `QUICK_START.md` — เริ่มใช้งานเร็ว
- `MASTER_GUIDE.md` — คู่มือฉบับเต็ม
- `templates/` — Template สำหรับสร้างชุด Sources
- `docs/` — หลักการและ workflow รายส่วน
- `visual-evidence-guide/` — แนวทางภาพหลักฐาน
- `examples/` — ตัวอย่างโครงสร้างแบบ generic

## หลักข้อมูล 5 สถานะ

- **FACT** — ข้อเท็จจริงที่มีหลักฐาน
- **TARGET** — ค่าเป้าหมาย ยังไม่ใช่ผลจริง
- **ACTUAL** — ผลจริงที่ตรวจสอบแล้ว
- **CONTEXT** — ข้อมูลประกอบ/ข้อมูลฐาน
- **PENDING** — ยังรอข้อมูล ห้าม AI เติมเอง

# PA NotebookLM Presentation Toolkit

ชุดคู่มือและ Template กลางสำหรับช่วยผู้บริหารสถานศึกษา/ครู/บุคลากรทางการศึกษาเตรียมข้อมูลเพื่อสร้าง **Slide Deck** และ **Video Overview** ด้วย NotebookLM โดยเน้นความถูกต้องของหลักฐาน การแยก TARGET/ACTUAL และการควบคุมภาพที่ใช้ในการนำเสนอ

## แนวคิดหลัก

**COLLECT → CLASSIFY → SYNTHESIZE → VISUALIZE → GENERATE → VERIFY**

หรือ

**รวบรวมหลักฐาน → จำแนกข้อมูล → สังเคราะห์สาระ → วางแผนภาพ → สร้างสื่อ → ตรวจสอบ**

Toolkit นี้ออกแบบให้ใช้กับข้อมูลของแต่ละบุคคลโดยไม่ผูกกับชื่อ โรงเรียน นวัตกรรม หรือระบบใดเป็นพิเศษ

## 🌐 Website — Easy Mode Wizard

มีเว็บแบบ Static Wizard อยู่ใน `web/` เพื่อให้ผู้ใช้ทั่วไปทำงานได้ง่ายขึ้น โดยไม่ต้องเปิด Template หลายไฟล์

Expected GitHub Pages URL:

`https://infobwd.github.io/pa-notebooklm-presentation-toolkit/`

ฟังก์ชันหลัก:
- Wizard 8 ขั้นตอน
- บันทึกอัตโนมัติใน Browser
- Import / Export Project JSON
- ตรวจ Draft / Final readiness
- สร้าง Markdown Package 6 ไฟล์ใน Browser
- **Phase 2 Preview Studio:** เปิดดูและแก้ไข Markdown ก่อนดาวน์โหลด
- **Phase 3.5.2 Visual Evidence Organizer:** Preview ภาพใน STEP 6, configurable naming plan, standardized filenames และดาวน์โหลดสำเนาชื่อมาตรฐาน
- **Phase 3.5.1 UX Polish:** Step 2 multiline fields, responsive External AI Bridge, TARGET ≥/≤/=/ % helper
- **Phase 3.5 Hardening & Acceptance:** Browser E2E acceptance, Desktop/Tablet/Mobile regression, runtime/localStorage hardening
- **Phase 3.4 Guided Import & Source Picker:** Import ตรวจ JSON อัตโนมัติเมื่อจำเป็น และ STEP 3 เลือก Source file/page จาก Document Reader ได้
- **Phase 3.3 Dashboard & Source Audit:** Project Dashboard, Source-to-Page Navigation, duplicate/version/role/source-link checks
- **Phase 3.2 UX & Evidence Review:** ACTUAL แบบเลือกชนิด, Smart Editors, STEP 7 drill-down, Sarabun ในช่องข้อมูล และ Toast Notification
- **Phase 3.1 Evidence & Reliability:** ผูก ACTUAL กับ Source/Page/Period/Population, ตรวจ conflict, Pre-Import Review และยืนยันต้นฉบับก่อน Final
- **Phase 3 Local Document Reader:** อ่าน PDF/DOCX/TXT/MD ใน Browser → ระบุบทบาท/เลือกหน้า → Preview → Copy Prompt + Sources → AI JSON → Import
- **Phase 2.2 External AI JSON Bridge:** Copy Prompt → ให้ AI ภายนอกตอบ JSON → Validate → Import เข้าฟอร์ม
- มีตัวอย่างประกอบทุกช่องสำคัญเพื่อช่วยผู้ใช้กรอกข้อมูล
- ประมาณจำนวนคำ/เวลา Script และดาวน์โหลด Bundle สำรอง
- ไม่มี AI API และไม่มี backend

> Repository นี้เปิดเป็น **Public** แล้ว และรองรับการเผยแพร่เว็บด้วย GitHub Pages ผ่าน GitHub Actions


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

- `web/` — Website / Easy Mode Wizard
- `START_HERE.md` — ทางเข้าหลักของผู้ใช้
- `QUICK_START.md` — เริ่มใช้งาน Advanced Mode
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

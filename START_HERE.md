# START HERE — PA Presentation with NotebookLM

ยินดีต้อนรับสู่ **PA NotebookLM Presentation Toolkit**

คุณไม่จำเป็นต้องเข้าใจทุกไฟล์ใน Repository ก่อนเริ่มใช้งาน ให้เลือกเพียงหนึ่งโหมดตามความต้องการ

## ทางที่ง่ายที่สุด: ใช้ Website Wizard

เมื่อ GitHub Pages เปิดใช้งาน ให้เข้า:

`https://infobwd.github.io/pa-notebooklm-presentation-toolkit/`

เว็บจะพาคุณทำทีละขั้นและสร้าง Markdown Package ให้อัตโนมัติใน Browser

> ถ้ายังเข้าเว็บไม่ได้ ให้ใช้ Easy Mode แบบ Markdown ด้านล่าง หรือเปิด Repository Settings → Pages → Source: GitHub Actions


---

# 🟢 EASY MODE — แนะนำสำหรับผู้ใช้ทั่วไป

เหมาะสำหรับ:
- ครู
- ผู้บริหารสถานศึกษา
- บุคลากรทางการศึกษา
- ผู้ที่ต้องการเริ่มทำ Slide Deck / Video Overview โดยไม่ต้องจัดการ Template หลายไฟล์เอง

แนวคิดคือ:

> **กรอก → แนบ → สร้าง → ตรวจ → นำเสนอ**

## ขั้นตอน

### 1. กรอกข้อมูล
เปิด:

`EASY_MODE/01_INPUT_FORM.md`

กรอกข้อมูลของคุณให้ครบเท่าที่มี

### 2. เตรียมหลักฐาน
เตรียม:
- PA / ข้อตกลง / เอกสารต้นฉบับ
- ภาพกิจกรรมจริง
- ภาพห้องเรียน / PLC / การนิเทศ
- Screenshot ระบบ
- ผล ACTUAL
- รางวัล / หนังสือรับรองที่เกี่ยวข้อง

### 3. ให้ AI สร้างชุดงาน
เปิด:

`EASY_MODE/02_BUILD_WITH_AI.md`

Copy Master Prompt ไปใช้กับ ChatGPT หรือ AI ที่คุณใช้ พร้อมแนบ:
- INPUT FORM
- เอกสารต้นทาง
- หลักฐานที่เกี่ยวข้อง

AI จะช่วยสร้าง:
- Presentation Results Source
- Visual Storyboard
- Script 5 หรือ 7 นาที
- Source Manifest
- NotebookLM Prompts
- Final QA Checklist

### 4. นำไปใช้ใน NotebookLM
เปิด:

`EASY_MODE/03_NOTEBOOKLM_STEPS.md`

ทำตามขั้นตอน:
- Upload Sources
- Chat QA
- Generate Slide Deck
- ตรวจ
- Generate Video Overview
- ตรวจ Final

### 5. ตรวจงานก่อนใช้จริง
เปิด:

`EASY_MODE/04_FINAL_CHECK.md`

ถ้าผ่านครบ จึงใช้เป็น Final

---

# 🔵 ADVANCED MODE — สำหรับผู้ที่ต้องการควบคุมละเอียด

เหมาะสำหรับ:
- ผู้ที่ต้องการออกแบบ Source เอง
- ต้องการกำกับ Storyboard รายฉาก
- ต้องการควบคุม Script, Prompt, Evidence, ACTUAL, Policy Alignment
- ผู้พัฒนา Toolkit / ผู้ช่วย AI / ทีมงาน

เริ่มจาก:

1. `QUICK_START.md`
2. `MASTER_GUIDE.md`
3. `templates/`
4. `docs/`
5. `visual-evidence-guide/`

---

# เลือกโหมดไหนดี?

| ถ้าคุณ... | ใช้โหมด |
|---|---|
| ต้องการเริ่มให้เร็ว | 🟢 EASY |
| ไม่อยากกรอกหลาย Template | 🟢 EASY |
| ต้องการให้ AI ช่วยจัดชุดไฟล์ | 🟢 EASY |
| ต้องการควบคุมทุก Source | 🔵 ADVANCED |
| ต้องการแก้ Storyboard เอง | 🔵 ADVANCED |
| ต้องการพัฒนา Toolkit ต่อ | 🔵 ADVANCED |

---

# กฎสำคัญที่สุด

ไม่ว่าจะใช้โหมดไหน ให้รักษากฎนี้:

- **FACT** = ข้อเท็จจริงที่มีหลักฐาน
- **TARGET** = เป้าหมาย ยังไม่ใช่ผลจริง
- **ACTUAL** = ผลจริงที่ตรวจสอบแล้ว
- **CONTEXT** = ข้อมูลพื้นฐาน/บริบท
- **PENDING** = ยังไม่มีข้อมูล ห้าม AI เติมเอง

และ:

> **ใช้เฉพาะข้อมูลของบุคคล/Project ปัจจุบัน ห้ามนำข้อมูลจากตัวอย่างหรือบุคคลอื่นมาปะปน**

---

# ถ้าต้องการดูตัวอย่าง

## ตัวอย่างแบบละเอียด
เปิด:
`examples/sample_generic/`

## ตัวอย่าง Easy Mode
เปิด:
`examples/sample_easy_mode/`

---

# Recommended Default

ถ้าไม่แน่ใจว่าจะเริ่มอย่างไร:

> **เลือก EASY MODE + Script 5 นาที + ภาพจริงเป็นหลัก + ACTUAL ต้องมีหลักฐาน**

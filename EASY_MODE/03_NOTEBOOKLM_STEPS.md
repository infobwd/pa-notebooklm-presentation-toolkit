# EASY MODE — NOTEBOOKLM STEPS

หลังจาก AI สร้างชุดไฟล์แล้ว ให้ทำตามนี้

---

# STEP 1 — เลือก Script

เลือกเพียงหนึ่ง:
- 5 นาที
- 7 นาที

ห้ามใช้สองเวอร์ชันพร้อมกัน

---

# STEP 2 — สร้าง Notebook

ตั้งชื่อเช่น:

> PA Presentation — {{ชื่อผู้รับการประเมิน}}

---

# STEP 3 — Upload Sources

ควรใส่:
- presentation_results_source.md
- visual_storyboard.md
- presentation_script.md
- PA / ข้อตกลงฉบับจริง
- ภาพหลักฐาน
- policy_alignment ถ้ามี

ไม่ควรใส่ทุกครั้ง:
- รายงานยาวที่สรุปแล้ว
- ตารางคะแนนดิบ
- technical docs
- เอกสารซ้ำหลายเวอร์ชัน

---

# STEP 4 — Chat QA ก่อน Generate

ถาม:

> จาก Sources ที่เลือก กรุณาจัดข้อมูลเป็น FACT / TARGET / ACTUAL / CONTEXT / PENDING และระบุข้อมูลที่ยังขาดหรือขัดกันก่อนสร้าง Final

ถ้าคำตอบผิด:
- อย่า Generate ต่อ
- กลับไปแก้ Source ก่อน

---

# STEP 5 — สร้าง Slide Deck

ใช้ Prompt จาก:
`notebooklm_prompts.md`

ตรวจ:
- ประเด็นหลักชัด
- ACTUAL ถูก
- ภาพหลักฐานตรง
- ระบบ/นวัตกรรมไม่แย่งน้ำหนักจากผลลัพธ์
- ไม่มีภาพ AI แทน evidence

---

# STEP 6 — แก้ Slide Deck

ถ้าผิดหลายจุด:
- แก้ Source / Storyboard
- Generate ใหม่

ถ้าผิดเล็กน้อย:
- ใช้ Slide Revision Prompt

---

# STEP 7 — สร้าง Video Overview

หลัง Slide ผ่านก่อน

เลือก Sources เดิม แต่เน้น:
- ภาพคน
- ภาพกิจกรรม
- ห้องเรียน/งานจริง
- ผล ACTUAL
- Student Journey

ใช้ Screenshot ระบบเป็น B-roll

---

# STEP 8 — ตรวจ Video

ตรวจ:
- ภาษา
- เสียง
- ชื่อบุคคล
- ตัวเลข
- เวลา
- ภาพหลักฐาน
- ไม่พูดสิ่งที่ยัง PENDING
- จบด้วยผลกระทบ ไม่ใช่รายชื่อระบบ

---

# STEP 9 — Final

ถ้า ACTUAL ยังไม่ครบ:
**ยังไม่ถือว่า Final**

เมื่อครบแล้ว:
1. อัปเดต Source
2. Refresh/Upload ใหม่
3. Generate Final Slide
4. Generate Final Video
5. ตรวจด้วย `04_FINAL_CHECK.md`

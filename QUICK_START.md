# Quick Start — Advanced Mode

> หากต้องการวิธีที่ง่ายที่สุด ให้เริ่มจาก `START_HERE.md` แล้วเลือก **EASY MODE**  
> ไฟล์นี้เป็น Quick Start สำหรับผู้ใช้ที่ต้องการควบคุมโครงสร้าง Sources ด้วยตนเอง

คู่มือย่อสำหรับเริ่มใช้งานภายใน 15–30 นาที

## 1. เตรียมข้อมูลบุคคล

กรอก `templates/01_profile_template.md`

อย่างน้อยต้องมี:
- ชื่อผู้รับการประเมิน
- ตำแหน่ง/วิทยฐานะ
- สถานศึกษา/สังกัด
- รอบประเมิน
- ระยะเวลานำเสนอ
- ประเด็นท้าทาย/ข้อตกลง
- TARGET และ ACTUAL ที่มี

## 2. จำแนกข้อมูล

ทุกข้อมูลต้องติดสถานะ:
- FACT
- TARGET
- ACTUAL
- CONTEXT
- PENDING

ห้ามใช้ TARGET แทน ACTUAL

## 3. สร้าง Source หลัก

ใช้ `templates/02_presentation_results_template.md`

ไฟล์นี้คือ **WHAT TO SAY**

## 4. เตรียมภาพ

ใช้ `templates/03_visual_storyboard_template.md`

ลำดับความสำคัญ:
1. ภาพจริง
2. Screenshot ระบบจริง
3. Infographic จากเอกสาร
4. กราฟจากข้อมูลจริง
5. ภาพ AI เชิงแนวคิด

## 5. เลือก Script

- กระชับ: `04_script_5min_template.md`
- เต็ม: `05_script_7min_template.md`

เลือกเพียง 1 เวอร์ชันต่อการ Generate

## 6. เลือก Sources

ใช้ `07_source_manifest_template.md`

โดยทั่วไปควรมี:
- Presentation Results Source
- Visual Storyboard
- Script
- เอกสารข้อตกลง/ต้นฉบับสำคัญ
- Visual Evidence

## 7. ทำ Chat QA

ถาม NotebookLM ก่อนว่า:
> สรุป Sources เป็น FACT / TARGET / ACTUAL / CONTEXT / PENDING และระบุข้อมูลที่ยังขาดก่อนทำ Final

ถ้าตอบผิด ให้แก้ Source ก่อนสร้างสไลด์

## 8. Generate Slide Deck

ใช้ Prompt จาก `06_notebooklm_prompts_template.md`

ตรวจว่า:
- ไม่แต่ง ACTUAL
- ไม่ใช้ภาพ AI แทนหลักฐาน
- ไม่ให้ผลงานรองกลบประเด็นหลัก

## 9. Generate Video Overview

ใช้ Sources ชุดที่คัดแล้ว
เน้นภาพคน/ห้องเรียน/กิจกรรมจริง
ใช้ Screenshot เป็น B-roll

## 10. Final QA

ใช้ `10_final_qa_checklist.md` ก่อนส่งงาน

# Troubleshooting

## NotebookLM เอา TARGET ไปเขียนเป็นผลจริง
แก้:
- ทำสถานะ TARGET/ACTUAL ให้ชัดใน Source
- เพิ่ม Guardrail
- Generate ใหม่

## เอาข้อมูลคนละปีมาเทียบเป็น trend
แก้:
- เขียนใน Source ว่าเป็นคนละ cohort/ช่วง/เครื่องมือ
- วางข้อมูลคนละกล่อง
- ห้ามใช้ลูกศรขึ้น/ลง

## Slide Deck เน้นระบบมากกว่าผลลัพธ์
แก้:
- ลด Screenshot
- ย้ายระบบไปช่วง Supporting Evidence
- เพิ่ม Actual/Student Journey

## Video ใช้ภาพ AI แทนกิจกรรมจริง
แก้:
- แยกภาพจริงเป็น Source
- ตั้งชื่อไฟล์ชัด
- ระบุ Do Not Generate ใน Storyboard

## ข้อมูลตัวอย่างหลุดเข้ามา
แก้:
- ลบ Example Source จาก Notebook
- ใช้ Data Isolation Rule
- ตรวจ Final QA อีกครั้ง

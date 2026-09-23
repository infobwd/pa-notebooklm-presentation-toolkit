# Visual Evidence Naming Convention

รูปแบบทั่วไปที่แนะนำ:

`NN_category_subject_sequence.ext`

ตัวอย่าง Generic:
- `10_presenter_01.jpg`
- `11_organization_01.jpg`
- `12_model_framework.png`
- `14_process_real_01.jpg`
- `15_active_classroom_01.jpg`
- `16_system_01.png`
- `21_recognition_01.jpg`
- `22_baseline_chart_01.png`

## หลัก

- ชื่อสั้นและสื่อความหมาย
- ภาษาอังกฤษเพื่อความเสถียรของชื่อไฟล์
- มีเลขนำหน้าเพื่อจัดลำดับ
- หลีกเลี่ยงชื่อทั่วไป เช่น `IMG_1234.jpg`
- นามสกุลควรตรงกับชนิดไฟล์จริง
- Project เฉพาะบุคคลสามารถใช้ Naming Plan ของตนเองได้ โดยไม่ต้อง hard-code ชื่อเฉพาะไว้ใน Generic Toolkit

## STEP 6 Visual Naming Plan

STEP 6 รองรับไฟล์ Naming Plan JSON รูปแบบ:

```json
{
  "schema_version": "pa-toolkit/visual-naming-plan/1",
  "title": "My Visual Naming Plan",
  "slots": [
    {
      "id": "10_presenter",
      "order": 10,
      "filename": "10_presenter_01.jpg",
      "label": "ภาพผู้รับการประเมิน",
      "evidenceType": "ภาพผู้รับการประเมิน",
      "aliases": ["presenter"]
    }
  ]
}
```

Template:
`visual-evidence-guide/naming_plan_template.json`

เมื่อ Import Naming Plan:
1. ภาพที่แนบใหม่จะจับคู่ชื่อเดิมถ้าตรง/มี alias
2. ถ้าจับคู่ไม่ได้ จะใช้ slot ว่างตามลำดับ
3. ผู้ใช้เปลี่ยน slot หรือชื่อมาตรฐานเองได้
4. Source Manifest / Project JSON ใช้ชื่อมาตรฐาน
5. Browser ไม่เปลี่ยนชื่อไฟล์ต้นฉบับบนเครื่องโดยตรง
6. ปุ่ม **ดาวน์โหลดสำเนาชื่อนี้** สร้างสำเนาโดยใช้ชื่อมาตรฐาน

## นามสกุล

การ “เปลี่ยนชื่อ” ไม่ใช่การแปลงชนิดภาพ

ตัวอย่าง:
- แผนต้องการ `.png`
- แต่ไฟล์จริงเป็น JPEG

Toolkit จะแจ้งเตือนและเมื่อดาวน์โหลดสำเนาจะรักษาชนิดไฟล์จริงแทน เพื่อไม่สร้างไฟล์ที่นามสกุลกับ binary content ไม่ตรงกัน

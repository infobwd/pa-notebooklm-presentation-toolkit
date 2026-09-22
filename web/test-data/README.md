# Owner Test Data — PA 2569

โฟลเดอร์นี้เป็นข้อมูลทดสอบของ **เจ้าของ Repository** เพื่อทดสอบ Import/Export และ guardrail ของ PA NotebookLM Presentation Toolkit

> Repository นี้เป็น Public ดังนั้นข้อมูลในโฟลเดอร์นี้มองเห็นได้สาธารณะ

## ขอบเขตข้อมูล

ใช้เฉพาะข้อมูลด้านวิชาชีพ/สถานศึกษาและข้อมูล PA ที่เจ้าของ repo ต้องการใช้ทดสอบระบบ

ไม่ได้ใส่:
- ชื่อนักเรียน
- ที่อยู่ส่วนบุคคล
- เบอร์โทรศัพท์
- ข้อมูลสุขภาพ
- รหัสผ่าน/token
- ข้อมูลส่วนบุคคลของเด็กหรือครอบครัว

## ไฟล์

### `owner-pa-2569.ai-intake.json`
ใช้กับ:

**AI JSON Assistant → เปิดไฟล์ JSON / โหลด Owner Test Data → ตรวจ JSON → Import**

Schema:
`pa-toolkit/intake/3.1`

### `owner-pa-2569.project.json`
ใช้กับ:

**นำเข้าโปรเจกต์** ที่แถบด้านบนของเว็บ

Schema:
`pa-toolkit/project/3.1`

## สิ่งที่ตั้งใจทดสอบ

1. Identity fields ครบ
2. Context หลายบรรทัด
3. I-OPPA process
4. ตัวชี้วัด 3 รายการ
5. TARGET มีค่า แต่ ACTUAL ยังเป็น `PENDING`
6. Qualitative/process evidence
7. Supporting systems หลายรายการ
8. Recognition
9. Evidence checklist
10. Readiness ต้องยังไม่ขึ้น Final เพราะ ACTUAL และ Student Journey ยังขาด

## Data integrity

- NT 2567 และ NT 2568 เป็น **คนละ cohort** ห้ามใช้เป็น before-after growth
- SAR 2568 และ NT เป็น **CONTEXT** ไม่ใช่ ACTUAL ของ PA โดยอัตโนมัติ
- ACTUAL ของตัวชี้วัด PA ทั้ง 3 รายการจงใจเป็น `PENDING`
- Expansion/Policy ที่ยังไม่มีหลักฐานตรง ให้คงเป็น `PENDING`

เมื่อมีหลักฐาน ACTUAL จริงในภายหลัง ให้แก้ test fixture หรือสร้าง fixture รุ่นใหม่ แทนการเติมค่าคาดการณ์


## Phase 3.1 Test Expectation

ตัวชี้วัดทั้ง 3 รายการมี:
- period และ population สำหรับใช้ทดสอบ migration/trace
- `verification = unverified`
- ACTUAL = `PENDING`

ดังนั้น Readiness ต้องไม่ถือว่า ACTUAL เหล่านี้เป็น Verified ACTUAL และต้องไม่ขึ้น READY FOR FINAL

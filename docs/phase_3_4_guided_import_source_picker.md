# Phase 3.4 — Guided Import & Source Picker

สถานะ: **Implemented**

## ปัญหาที่แก้

### 1. Import JSON แบบ silent no-op

ก่อนหน้า ปุ่ม **Import เข้าระบบ** ถูก disable จนกว่าจะกด **ตรวจ JSON** ผู้ใช้จึงอาจกดแล้วรู้สึกว่าไม่มีอะไรเกิดขึ้น

Phase 3.4:
1. ปุ่ม Import กดได้เสมอ
2. ถ้ายังไม่ได้ Validate ระบบเรียก JSON validation ให้ก่อน
3. ถ้าผิด แสดง error status + Toast
4. ถ้าผ่าน แสดง Pre-Import Review
5. ระบบหยุดก่อน Import และแจ้งให้ผู้ใช้ตรวจ Review แล้วกด Import อีกครั้ง
6. คลิกครั้งถัดไปจึง Import ตาม decision ที่ผู้ใช้เห็น

ยังคงหลักเดิมว่า AI ไม่สามารถยืนยัน Evidence แทนผู้ใช้ได้

## 2. Source file/page ใน Evidence Trace

ความหมาย:
- **Source file** = เอกสารต้นฉบับที่รองรับค่า ACTUAL
- **Source page/location** = หน้าหรือตำแหน่งที่พบหลักฐาน เช่น หน้า 4, ตาราง 2, ภาคผนวก ก

ไม่ใช่ Visual Evidence และไม่จำเป็นต้องพิมพ์ชื่อไฟล์เอง

### Workflow ใหม่ใน STEP 3

ใต้ Evidence Trace:
- ช่อง Source file แบบ manual ยังอยู่
- dropdown เลือก Source จากเอกสารที่โหลดใน Document Reader
- ปุ่ม **เลือกไฟล์ต้นทาง**
- ถ้ายังไม่มีเอกสาร จะเปิด native file picker
- อ่านเอกสารใน Document Reader
- กด **ใช้เป็น Source** ที่เอกสารที่ต้องการ
- กลับ STEP 3 อัตโนมัติ
- ถ้าเป็น PDF จะมี dropdown เลือกหน้าอย่างรวดเร็ว

ผู้ใช้ยังสามารถพิมพ์ตำแหน่งที่ไม่ใช่หน้าได้ เช่น:
- ตาราง 2
- ภาคผนวก ก
- หัวข้อ 3.2

## Session model

Browser ไม่อนุญาตให้เว็บเก็บ File object แบบถาวรโดยอัตโนมัติ

ดังนั้น:
- ชื่อ Source file/page บันทึกใน Project JSON ได้
- raw file/text ใน Document Reader อยู่เฉพาะ session
- หลัง refresh ต้องเลือกไฟล์จริงใหม่เพื่อเปิด Source/Preview
- Evidence Trace ยังเก็บชื่อไฟล์และหน้าที่อ้างอิงไว้

## Guardrail

การเลือกไฟล์เป็น Source ไม่ทำให้ Verification เปลี่ยนเป็น VERIFIED

ผู้ใช้ยังต้องตรวจเอกสารจริงและเลือก:
**VERIFIED — ตรวจต้นฉบับแล้ว**

หากแก้ Source/ACTUAL ภายหลัง ระบบจะกลับเป็น UNVERIFIED

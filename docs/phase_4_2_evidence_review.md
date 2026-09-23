# Phase 4.2 — Evidence Review & Trace Handoff

สถานะ: **Implemented**

## เป้าหมาย

ปิดช่องว่างระหว่าง:

**Search พบหน้าที่น่าสนใจ → คนตรวจต้นฉบับ → เลือกว่าจะใช้หรือไม่ → ผูกตัวชี้วัด → ส่งไป Evidence Trace**

โดยไม่ทำให้ Search หรือ OCR กลายเป็นการ “ยืนยันหลักฐาน” อัตโนมัติ

## Workflow

1. ค้นหาเอกสารใน Document Reader
2. กด **เก็บเข้า Evidence Review**
3. ตรวจ excerpt กับเอกสารต้นฉบับ
4. จัดประเภท:
   - FACT
   - TARGET
   - ACTUAL
   - CONTEXT
   - PENDING
5. เลือก Review Status:
   - รอตรวจ
   - ตรวจต้นฉบับแล้ว
   - ไม่ใช้
6. ผูกกับ Indicator ที่เกี่ยวข้อง
7. ใส่ Note เช่น period / population / cohort ที่ต้องตรวจ
8. กด **ส่งไป Evidence Trace**
9. STEP 3 รับ sourceFile/sourcePage แต่ Verification ยังคง **UNVERIFIED**
10. ผู้ใช้ตรวจ Evidence Trace และเลือก VERIFIED เอง

## Evidence Review Note

แต่ละ Note เก็บเฉพาะ metadata/ข้อความสั้นที่จำเป็น:

- id
- sourceFile
- sourcePage
- excerpt
- query
- sectionHint
- classification
- linkedIndicatorId
- reviewStatus
- note
- extractionMode

Raw PDF/image bytes ไม่ถูกเก็บใน Project JSON

## Section hints

ระบบตรวจคำหัวข้อทั่วไปที่ปรากฏอยู่จริงใน excerpt เช่น:
- ผลการดำเนินงาน
- ผลลัพธ์ / ผลสัมฤทธิ์
- ตัวชี้วัด
- เป้าหมาย
- วิธีดำเนินงาน
- บริบท / baseline
- การพัฒนา
- รางวัล / การยอมรับ
- นโยบาย
- ภาคผนวก
- สรุป

Section hint เป็นเพียง text hint จากคำที่พบ ไม่ใช่การตีความความหมายหรือการยืนยันสถานะหลักฐาน

## Review Status vs Evidence Verification

สำคัญมาก:

**Evidence Review: “ตรวจต้นฉบับแล้ว”**
หมายถึงผู้ใช้ได้เปิดดูเอกสารและทบทวน Note นี้

ไม่เท่ากับ:

**Evidence Trace: VERIFIED**
ซึ่งเป็นการยืนยัน Source/Period/Population/ACTUAL ใน STEP 3

ดังนั้นการ Promote Note ไป Evidence Trace จะบังคับ:
`verification = unverified`

เสมอ

## Persistence

Review Notes:
- บันทึกใน localStorage
- อยู่ใน Export Project JSON
- Import Project JSON กลับมาได้
- หลัง refresh ยังเห็น Note เดิม
- ถ้า raw Source ไม่ได้โหลดใหม่ ระบบจะแสดงว่า **Source ยังไม่โหลดใน session**

## Generated package

Phase 4.2 เพิ่มไฟล์:

`evidence_review_notes.md`

Package จากเดิม 6 ไฟล์เป็น 7 ไฟล์

Source Manifest เพิ่ม:
- จำนวน Review Notes
- checked / candidate / rejected
- classification
- Indicator link
- guardrail ว่า Review checked ไม่เท่ากับ VERIFIED

## Tests

Unit:
`web/tests/evidence-review.test.js`

Browser acceptance ต่อจาก synthetic PDF 55 หน้า:
1. Search marker หน้า 42
2. Save เข้า Evidence Review
3. Classification = ACTUAL
4. Review Status = checked
5. ผูก Indicator
6. Promote to Evidence Trace
7. ตรวจ sourceFile/sourcePage
8. ตรวจว่า verification ยังเป็น UNVERIFIED
9. Reload
10. Review Note ต้องยังอยู่ แต่แจ้งว่า raw Source ไม่ได้โหลดใน session

## Privacy

Evidence Review ทำงานใน Browser

Project JSON เก็บ excerpt/metadata ของ Note เพราะเป็นข้อมูลที่ผู้ใช้เลือกเก็บเอง แต่ไม่เก็บ raw PDF หรือ page image

ผู้ใช้ควรหลีกเลี่ยงการเก็บข้อมูลส่วนบุคคลที่ไม่จำเป็นใน excerpt/note และปกปิดข้อมูลก่อนแชร์ Project JSON

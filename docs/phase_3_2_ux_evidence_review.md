# Phase 3.2 — UX & Evidence Review

สถานะ: **Implemented**

Phase 3.2 ไม่เปลี่ยนหลัก Evidence Governance ของ Phase 3.1 แต่ทำให้ผู้ใช้เห็นและแก้ข้อมูลได้ง่ายขึ้น

## STEP 3 — ACTUAL choices

ผู้ใช้เลือกประเภท ACTUAL ก่อน:
1. ยังไม่มี / PENDING
2. จำนวน / ทั้งหมด
3. ร้อยละ (%)
4. คะแนน / ค่า
5. ข้อความผลจริง

เมื่อเลือก “จำนวน / ทั้งหมด” ระบบคำนวณรูปแบบ `24/30 = 80%` ให้เอง

Evidence Trace อยู่ใน STEP 3 ใต้ตัวชี้วัดแต่ละข้อ:
- Source file
- Page / location
- Period
- Population
- Cohort
- Verification

ถ้าผู้ใช้แก้ ACTUAL หรือ Trace หลังเคย VERIFIED ระบบจะลดสถานะกลับเป็น UNVERIFIED อัตโนมัติ

## STEP 7 — Readiness drill-down

STEP 7 แสดงตัวชี้วัดเป็นรายการกดเปิดได้:
- TARGET
- ACTUAL
- ACTUAL type
- Evidence
- Source
- Period
- Population
- Verification
- เหตุผลที่ยังไม่พร้อม

ปุ่ม **แก้ไขตัวชี้วัดนี้ที่ STEP 3** จะพาไปยัง card ที่ตรงกันและเปิด Evidence Trace

## Text input UX

Font:
- UI heading/button: Kanit
- ข้อมูลที่ผู้ใช้กรอก: Sarabun

Textarea ของฟอร์มหลักไม่แสดงเป็น textarea แบบเดิม:
- narrative fields → Rich Editor + word/character counter
- contextNotes / processNotes / systems → Smart Numbered List เพิ่ม/ลบรายการได้

ค่าที่บันทึกใน Project JSON ยังคงเป็น string เพื่อรักษา compatibility กับ Markdown generator

## Notification

เปลี่ยน blocking `window.alert()` เป็น Toast Notification:
- success
- error
- warning
- info

## Compatibility

Schema ยังคง:
- `pa-toolkit/intake/3.1`
- `pa-toolkit/project/3.1`

เพิ่ม field ต่อ indicator:
- `actualMode: pending | fraction | percent | score | text`

Project/Intake เก่าจะ infer actualMode ตอน migration/normalization


## Next implemented: Phase 3.3

Phase 3.3 เพิ่ม Project Dashboard, Source-to-Page Navigation และ Document Audit โดยไม่เปลี่ยนหลัก Evidence Governance ของ Phase 3.1/3.2

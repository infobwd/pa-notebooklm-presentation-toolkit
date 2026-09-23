# Phase 3.1 — Evidence & Reliability

สถานะ: **Implemented foundation**

เป้าหมายของ Phase 3.1 คือทำให้ระบบตอบได้ว่า:

> ตัวเลขนี้มาจากไหน หน้าไหน เป็นของใคร/กลุ่มใด ช่วงไหน และผู้ใช้ตรวจต้นฉบับแล้วหรือยัง

## หลักการ

ACTUAL จะถือว่า “พร้อมสำหรับ Final” เมื่อมี:
- ค่า ACTUAL ที่ไม่ใช่ PENDING
- Evidence
- Source file
- Period
- Population / target group
- การยืนยันโดยผู้ใช้ว่าได้ตรวจต้นฉบับแล้ว

ถ้ามี numerator/denominator ระบบคำนวณร้อยละได้เอง

## Evidence trace fields ต่อ indicator

- `actualNumerator`
- `actualDenominator`
- `sourceFile`
- `sourcePage`
- `period`
- `population`
- `cohortId`
- `verification`: `unverified | verified`

AI ภายนอกต้องส่ง `verification: "unverified"` เสมอ เพราะ AI ไม่มีสิทธิ์ยืนยันหลักฐานแทนผู้ใช้

## Document roles

เอกสารที่อ่านใน Browser สามารถระบุบทบาท:
- PA Agreement
- Performance Report
- SAR / Context
- Assessment Result
- Policy
- Award / Recognition
- Evidence / Attachment
- Other

PDF สามารถจำกัดหน้าที่ส่งให้ AI เช่น `1-3,5,8`

## Conflict review

ก่อน Import JSON ระบบเปรียบเทียบค่าปัจจุบันกับค่าจาก AI:
- field conflicts
- indicator conflicts โดยจับคู่จากชื่อ indicator
- TARGET / ACTUAL / period / population / cohort

ค่า conflict ไม่ควรถูกแทนที่แบบเงียบ

## Schema migration

- Intake ปัจจุบัน: `pa-toolkit/intake/3.1`
- Project ปัจจุบัน: `pa-toolkit/project/3.1`
- Project/Intake รุ่น 2.2 ยังนำเข้าได้ และถูก normalize เป็นโครงสร้าง 3.1

## Automated tests

`web/tests/reliability.test.js` ตรวจ:
- percentage calculation
- page selection
- pending ACTUAL
- verified ACTUAL trace
- field conflicts
- indicator conflicts
- project migration

## Scope

Phase 3.1 ยังไม่ทำ:
- OCR
- พิสูจน์ว่าเนื้อหาที่ AI สกัดตรงกับ PDF โดยอัตโนมัติ
- server-side storage
- cloud AI API


## Phase 3.2 UX follow-up

ส่วน Reliability เดิมถูกนำมาแสดงให้ผู้ใช้เข้าใจง่ายขึ้น:
- ACTUAL เลือกรูปแบบก่อนกรอก
- Evidence Trace แสดงอยู่ใน STEP 3 อย่างชัดเจน
- STEP 7 มี indicator drill-down และปุ่มกลับไปแก้ใน STEP 3
- long-form input ใช้ Rich Editor / Smart Numbered List
- field content ใช้ Sarabun
- notification ใช้ Toast แทน `window.alert()`

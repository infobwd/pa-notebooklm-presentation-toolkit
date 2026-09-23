# Phase 3.3 — Dashboard & Source Audit

สถานะ: **Implemented**

## เป้าหมาย

ทำให้ผู้ใช้เห็นภาพรวมของ Project และตรวจความสัมพันธ์ระหว่าง ACTUAL กับเอกสารต้นทางได้ง่ายขึ้น โดยไม่เพิ่มการตัดสินอัตโนมัติแทนผู้ใช้

## Project Dashboard

อยู่ใน STEP 7 และสรุป:
- Draft completeness
- Verified ACTUAL
- จำนวนเอกสารที่อ่านใน session
- Source links ที่จับคู่ได้
- Source audit issues
- Pending checks

การ์ด Dashboard กดเพื่อไปยัง STEP หรือ Document Reader ที่เกี่ยวข้องได้

## Source-to-Page Navigation

เมื่อ Indicator มี:
- sourceFile
- sourcePage

และ Source file ถูกโหลดใน Document Reader ของ session เดียวกัน ระบบจะ:
1. จับคู่ชื่อไฟล์
2. ตรวจเลขหน้า
3. แสดง Source excerpt ใน STEP 7
4. เปิด Document Reader ไปยังไฟล์/หน้าที่อ้างอิง
5. highlight เอกสารชั่วคราวเพื่อให้ตรวจต้นฉบับง่ายขึ้น

ถ้า Source file ยังไม่ถูกโหลด ระบบจะแจ้งให้ผู้ใช้เลือกไฟล์เอง

## Document Audit

โมดูล:
`web/js/document-audit.js`

ตรวจแบบ deterministic / heuristic ที่ไม่เปลี่ยนข้อมูลต้นฉบับ:

### Duplicate
- exact duplicate: normalized content ตรงกัน
- near duplicate: token Jaccard similarity สูง

### Version conflict
ชื่อไฟล์ที่ดูเป็นเวอร์ชัน/สำเนาของเอกสารเดียวกัน แต่เนื้อหาไม่เหมือนกัน

### Role conflict
เอกสารที่ duplicate/near-duplicate แต่ถูกกำหนด Document Role ต่างกัน

### Source link audit
ตรวจว่า:
- sourceFile ใน Evidence Trace มีไฟล์ที่จับคู่ใน Reader หรือไม่
- sourcePage อยู่ในช่วงหน้าของ PDF หรือไม่

## Guardrail

Source Audit เป็น **คำเตือนเพื่อการตรวจสอบ** ไม่ใช่ผลตัดสินว่าเอกสารใดถูกหรือผิด และไม่ block Final readiness โดยอัตโนมัติ

Final readiness ยังคงอิง Evidence Trace และการยืนยันต้นฉบับโดยผู้ใช้

## Session scope

Raw document text และ audit result อยู่เฉพาะ session ของ Browser

เมื่อ refresh:
- Project form ยังอยู่จาก localStorage
- raw document text ต้องเลือกใหม่
- Source Audit ที่ต้องใช้ raw document จะคำนวณใหม่เมื่อโหลดไฟล์

## Generated Source Manifest

ถ้า Generate package ใน session ที่มีเอกสาร Source Manifest จะเพิ่ม:
- Document sources + roles/pages
- Document Audit summary
- ACTUAL Evidence Trace

## Automated tests

`web/tests/document-audit.test.js` ตรวจ:
- duplicate detection
- version conflict detection
- source page parsing
- source file matching
- missing source detection

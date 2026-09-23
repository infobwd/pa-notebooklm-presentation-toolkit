# Phase 4.0 — Document Intelligence: Opt-in OCR for Scanned PDFs

สถานะ: **Implemented**

## เป้าหมาย

ช่วยอ่านข้อความจาก PDF ที่เป็นภาพสแกนหรือหน้าที่ไม่มี text layer โดยยังรักษาหลัก:
- local-first
- user opt-in
- page-level control
- OCR text is unverified
- no silent evidence promotion

Workflow:

**PDF → Native text extraction → Scan assessment → User chooses OCR pages → Render PDF page to Canvas → OCR → Preview with OCR label → User verifies against original**

## Detection

หลัง PDF.js อ่าน text layer ระบบตรวจทีละหน้า

หน้าที่มีข้อความน้อยกว่าเกณฑ์จะถูกเสนอเป็น **OCR candidate**

ระบบไม่เริ่ม OCR เอง แม้เอกสารจะมีแนวโน้มเป็น PDF สแกน

## OCR controls

ใน Document Reader ของ PDF แต่ละไฟล์:
- เปิดหัวข้อ **OCR PDF สแกน — เลือกใช้เอง**
- ระบุหน้า เช่น `1-3,5`
- เลือกภาษา: ไทย + English / ไทย / English
- เริ่ม OCR
- ดู progress
- ยกเลิก OCR

เพื่อควบคุม memory/runtime:
- OCR สูงสุด **12 หน้าต่อรอบ**
- เอกสารยาวให้แบ่งทำหลายรอบ

## Browser pipeline

Tesseract.js ไม่อ่าน PDF โดยตรง

Toolkit จึง:
1. เปิด PDF ด้วย PDF.js
2. render หน้าที่เลือกเป็น Canvas
3. ใช้ Tesseract.js OCR จาก Canvas
4. merge OCR text กลับเข้ากับ page text ของ session

## Version / dependencies

- PDF.js: 3.11.174
- Tesseract.js: 7.0.0
- OCR language: `tha`, `eng`, หรือ `tha + eng`

Tesseract.js ถูก **lazy-load** เฉพาะตอนผู้ใช้กดเริ่ม OCR เท่านั้น

## OCR output

หน้าที่ OCR สำเร็จแสดง marker:

`--- หน้า N [OCR — ตรวจทานก่อนใช้] ---`

ถ้า OCR ไม่พบข้อความ:

`[OCR ไม่พบข้อความ]`

ระบบเก็บ:
- native text
- OCR text
- extraction mode
- confidence เมื่อ library ส่งค่า
- OCR completed pages

## Evidence guardrail

OCR ไม่ถือเป็นการยืนยันหลักฐาน

ดังนั้น:
- OCR ไม่เปลี่ยน Indicator Verification
- OCR ไม่เปลี่ยน PENDING เป็น ACTUAL
- OCR ไม่ทำให้ Final-ready โดยอัตโนมัติ
- ผู้ใช้ต้องเปิดต้นฉบับและตรวจข้อความ/ตัวเลขเอง

Source Manifest ระบุ:

`OCR: <pages> [USER REVIEW REQUIRED]`

## Privacy / network

Raw PDF และ Canvas page image ไม่ถูกอัปโหลดโดย Toolkit

เมื่อเริ่ม OCR Browser จะดาวน์โหลด:
- Tesseract.js
- OCR worker/core
- language model

จาก CDN ตามความจำเป็น

การดาวน์โหลด library/model เป็น network request แต่ document/page image ยังประมวลผลใน Browser

## Session scope

- raw PDF file อยู่เฉพาะ session
- OCR text อยู่เฉพาะ session
- refresh แล้วต้องเลือก PDF ใหม่เพื่อ OCR อีกครั้ง
- Project JSON ไม่เก็บ PDF bytes หรือ OCR page images

## Failure / cancellation

- ทำ OCR ได้ทีละ 1 document job
- สามารถ Cancel ได้
- หาก library/language model โหลดไม่สำเร็จ จะแสดง Toast/Error
- หากเลือกเกิน 12 หน้า ระบบไม่เริ่มและให้แบ่งช่วง
- หน้า OCR ที่ยังอ่านข้อความไม่ได้จะยังถูกแนะนำให้ตรวจต่อ

## Tests

Unit:
`web/tests/ocr-intelligence.test.js`

Browser acceptance ตรวจ:
- Tesseract ไม่ถูกโหลดตอนเปิดเว็บ
- เปิด Document Reader แล้วยังไม่โหลด Tesseract
- มีข้อความอธิบาย OCR opt-in / privacy

ไม่ได้รัน OCR จริงใน CI เพื่อหลีกเลี่ยง dependency ขนาดใหญ่และความผันผวนของ network/language-model download

## Phase 4.1 implemented

ทำต่อแล้ว:
- long-document chunking
- full-text search ใน extracted sources
- page relevance suggestions
- one-click page selection / Evidence Trace Source

ดู `docs/phase_4_1_long_document_search.md`

## Next Phase 4 candidates

- OCR image preprocessing controls
- local cache ของ OCR language model / offline strategy
- richer phrase/section heading detection
- export selected search findings เป็น evidence review note

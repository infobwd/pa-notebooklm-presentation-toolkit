# Phase 4.1 — Long-document Chunking, Full-text Search & Page Relevance

สถานะ: **Implemented**

## เป้าหมาย

ทำให้รายงาน 50–100 หน้าใช้งานได้โดยไม่ต้องเลื่อนหาเนื้อหาด้วยมือทุกหน้า

Workflow:

**Extract / OCR → Local chunks → Full-text query → Ranked chunk hits → Aggregate to page → User reviews original → Select page as Source**

## Chunking

โมดูล:
`web/js/document-intelligence.js`

ค่าเริ่มต้น:
- chunk ขนาดประมาณ 1,400 ตัวอักษร
- overlap ประมาณ 180 ตัวอักษร
- พยายามตัดตาม paragraph / line / sentence / whitespace ก่อน hard cut

สำหรับ PDF:
- chunk แต่ละชิ้นเก็บ `docId`
- ชื่อไฟล์
- เลขหน้า
- chunk index
- extraction mode: native / OCR

สำหรับ TXT / DOCX / MD:
- chunk ตามเนื้อหาเอกสารโดยไม่มี page number

Raw chunks อยู่เฉพาะ session และไม่ถูกบันทึกใน Project JSON

## Full-text search

ค้นจาก extracted text ใน Browser เท่านั้น

รองรับ:
- exact phrase bonus
- token overlap
- ไทย/อังกฤษผ่าน `Intl.Segmenter` เมื่อ Browser รองรับ
- fallback tokenization เมื่อไม่มี Segmenter
- search scope:
  - เฉพาะเอกสารที่เลือกใช้
  - เอกสารทั้งหมดที่อ่านแล้ว

ผลลัพธ์ระดับ chunk ถูก aggregate เป็นระดับ **เอกสาร/หน้า** เพื่อไม่ให้หน้าเดียวแสดงซ้ำหลายแถว

## Page relevance

คำว่า “เกี่ยวข้อง” ในระบบหมายถึง **textual relevance** เท่านั้น

ไม่หมายความว่า:
- ตัวเลขในหน้านั้นถูกต้อง
- หน้านั้นเป็น ACTUAL ของรอบปัจจุบัน
- population / period ตรง
- Evidence ผ่านการ verify

ผู้ใช้ยังต้องตรวจต้นฉบับและ Evidence Trace เอง

## Project-aware query suggestions

ระบบสร้าง quick search จาก:
- ประเด็นท้าทาย
- ความต้องการพัฒนา
- ชื่อตัวชี้วัดแต่ละข้อ

เป็นเพียงคำค้นช่วยนำทาง ไม่ส่งข้อมูลไป AI และไม่เปลี่ยนข้อมูลในฟอร์ม

## Search result actions

แต่ละผลค้นหาสามารถ:
- **เพิ่มหน้านี้เข้า AI** → ตั้ง page selection ของเอกสาร
- **ใช้หน้านี้เป็น Source** → เมื่อ Document Reader เปิดมาจาก Evidence Trace ใน STEP 3
- **คัดลอกข้อความ** → คัดลอก excerpt สำหรับตรวจต่อ

การเลือก Source จาก search:
- ใส่ sourceFile / sourcePage
- verification ยังคงเป็น `UNVERIFIED`
- ไม่เปลี่ยน ACTUAL หรือ Final readiness อัตโนมัติ

## OCR integration

หลัง OCR สำเร็จ search index จะ rebuild

OCR text:
- ค้นหาได้
- ระบุ extraction mode
- ผลค้นหามีป้าย OCR
- ยังอยู่ภายใต้ guardrail “ตรวจทานก่อนใช้”

การทำ Search ไม่ trigger Tesseract.js และไม่ทำ OCR อัตโนมัติ

## Performance guardrails

สำหรับเอกสารยาว:
- index สร้างจากข้อความที่มีอยู่ใน session
- ไม่สร้าง embedding
- ไม่มี AI API
- ไม่มี network request จาก search
- จำกัดผล chunk ก่อน aggregate
- UI จำกัดจำนวน page results

## Tests

Unit:
`web/tests/document-intelligence.test.js`

ครอบคลุม:
- chunk overlap
- PDF page preservation
- Thai search
- ranking
- page aggregation
- Project context query suggestions

Browser acceptance:
- สร้าง PDF synthetic 55 หน้า
- ฝัง marker ไว้หน้า 42
- extract → chunk → search
- ต้องหา **หน้า 42** เป็นผลแรก
- กดผลค้นหาแล้ว page selection ต้องเป็น `42`
- search ต้องไม่โหลด Tesseract.js

## Privacy

Chunking / search / relevance ทำงานใน Browser ทั้งหมด

ไม่มี raw document text, query หรือ chunks ถูกส่งไป server โดย Toolkit

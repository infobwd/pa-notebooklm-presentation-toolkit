# Phase 3 — Local Document Reader

สถานะ: **Implemented**

## เป้าหมาย

ลดขั้นตอนการคัดลอกข้อมูลจากเอกสารด้วยมือ โดยให้ผู้ใช้เลือกเอกสารจากเครื่องและอ่านข้อความใน Browser ก่อนส่งต่อไป workflow AI JSON

**ไฟล์ → Local Extraction → Preview → Select Sources → Prompt + Sources → External AI → JSON → Validate → Import**

## รองรับ

- PDF ที่มี text layer
- DOCX
- TXT
- Markdown (.md)

ข้อจำกัด:
- สูงสุด 10 ไฟล์ต่อรอบ
- แนะนำไม่เกิน 25 MB ต่อไฟล์
- PDF สแกนที่ไม่มี text layer ยังไม่ทำ OCR
- PDF layout ที่ซับซ้อนอาจเรียงข้อความไม่สมบูรณ์ จึงต้อง Preview ก่อนใช้

## Local-first

เอกสารไม่ถูก upload ไป backend เพราะ Phase 3 ยังเป็น static web app ไม่มี server

Parser โหลดแบบ on-demand:
- PDF.js 3.11.174 จาก jsDelivr
- Mammoth 1.8.0 จาก jsDelivr

Browser ดาวน์โหลด library code จาก CDN แต่ Toolkit ไม่ส่ง document bytes ไป CDN

## PDF

ระบบ:
1. อ่าน ArrayBuffer
2. เปิดด้วย PDF.js
3. ดึง text content ทีละหน้า
4. เพิ่ม marker `--- หน้า N ---`
5. ตรวจคร่าว ๆ ว่าข้อความน้อยผิดปกติหรือไม่

ถ้าข้อความน้อยมาก ระบบแจ้งว่าเอกสารอาจเป็น PDF สแกนและไม่เดาเนื้อหา

## DOCX

ใช้ Mammoth `extractRawText` เพื่อดึงข้อความ ไม่พยายามรักษา layout ซับซ้อน

## Source Selection

หลัง extraction ผู้ใช้สามารถกำหนด **Document Role** (PA Agreement / Performance Report / SAR / Assessment / Policy / Award / Evidence / Other) และสำหรับ PDF สามารถเลือกหน้าที่จะส่งให้ AI เช่น `1-3,5,8`

หลัง extraction ผู้ใช้:
- เลือก/ยกเลิกเอกสารที่จะใช้กับ AI
- ลบเอกสารจาก session
- ตรวจข้อความรวม
- แก้ข้อความรวมก่อน Copy
- Copy extracted text
- Download extracted text เป็น .txt

## External AI Bridge

ปุ่ม **คัดลอก Prompt + Sources** รวม:
1. JSON extraction prompt
2. กฎ TARGET / ACTUAL / CONTEXT / PENDING
3. ข้อความจากเอกสารที่ผู้ใช้เลือก

ผู้ใช้ส่ง package นี้ไป AI ภายนอกด้วยตนเอง จากนั้นนำ JSON กลับมา Validate/Import ด้วย Phase 2.2

## Source Manifest

ถ้าผู้ใช้ Generate Package ใน session เดียวกับที่อ่านเอกสาร Source Manifest จะเพิ่มหัวข้อ:

`DOCUMENT SOURCES — Local Extraction`

พร้อมชื่อเอกสารและจำนวนหน้า PDF (ถ้ามี)

## สิ่งที่ Phase 3 ยังไม่ทำ

- OCR
- AI API ภายในเว็บไซต์
- semantic extraction ใน Browser
- verify ว่า AI อ่านเอกสารถูก
- upload เอกสารไป cloud
- เก็บ raw extracted text ใน localStorage

Raw text จงใจอยู่เฉพาะ session เพื่อจำกัดการเก็บข้อมูลโดยไม่จำเป็น

## Phase 3.1 ที่ทำต่อแล้ว

ดู `docs/phase_3_1_evidence_reliability.md`

เพิ่มแล้ว:
- source-page mapping สำหรับ ACTUAL
- document role tagging
- PDF page selection
- conflict detection
- pre-import review
- project/intake schema migration
- automated reliability tests

สิ่งที่ยังเป็น candidate:
- local OCR แบบ opt-in
- text chunking สำหรับเอกสารยาว
- duplicate document detection

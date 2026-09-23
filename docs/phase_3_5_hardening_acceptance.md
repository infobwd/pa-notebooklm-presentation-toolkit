# Phase 3.5 — Hardening & Acceptance

สถานะ: **Implemented**

เป้าหมายของ Phase 3.5 คือปิด Phase 3 ด้วยการทดสอบ workflow แบบผู้ใช้จริงและทำให้ error สำคัญไม่หายเงียบ

## Acceptance path

เส้นทางที่ถือเป็น critical path:

1. เปิดเว็บ
2. Import Owner Test Data
3. กด Import ก่อน Validate → ระบบต้อง Validate และหยุดที่ Pre-Import Review
4. Import หลัง Review
5. Owner fixture ต้องยังเป็น DRAFT และ Verified ACTUAL = 0/3
6. ไป STEP 3
7. เลือก Source file จากเครื่อง
8. อ่านไฟล์
9. ใช้เป็น Source
10. Verification ต้องยังเป็น UNVERIFIED
11. ไป STEP 7 ตรวจ Dashboard / Source Audit
12. Reload แล้วข้อมูลฟอร์มต้องยังอยู่ใน localStorage

## Browser acceptance

Workflow:
`.github/workflows/browser-acceptance.yml`

ใช้ Chromium ผ่าน Playwright และทดสอบ:
- Desktop 1440px
- Tablet 820px
- Mobile 390px
- horizontal overflow
- Owner fixture Import / Pre-Import Review
- invalid JSON error state
- Source Picker ด้วย TXT fixture
- localStorage persistence
- runtime console/page errors

Failure จะ upload screenshot/error artifact ชื่อ:
`phase-3-5-browser-failure`

## Test fixture

`web/e2e/fixtures/source-sample.txt`

เป็น FICTIONAL TEST FIXTURE เท่านั้น ไม่มีข้อมูลจริง

## Hardening rules

- ปุ่มสำคัญห้าม silent no-op
- Invalid input ต้องมี visible status/notification
- ACTUAL จาก AI ต้องเริ่ม UNVERIFIED
- การเลือก Source ห้ามเปลี่ยนเป็น VERIFIED อัตโนมัติ
- Owner Test Data ต้องไม่ผ่าน Final โดยไม่มี ACTUAL จริง
- Mobile/Tablet ต้องไม่มี horizontal overflow ที่ระดับ document

## Phase 3 exit criteria

Phase 3 ถือว่าปิดได้เมื่อ:
- unit/reliability tests ผ่าน
- browser acceptance ผ่าน
- critical path ข้างต้นผ่าน
- Pages deploy ผ่าน
- ไม่มี regression สำคัญจาก Phase 3.1–3.4

หลังจากนี้ roadmap หลักคือ Phase 4 — Document Intelligence

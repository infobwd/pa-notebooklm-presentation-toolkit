# External AI JSON Bridge

Phase 3.1 ใช้ External AI JSON Bridge ต่อจาก Phase 2.2 โดยเพิ่ม Evidence Trace และ Pre-Import Review:

**เอกสารจริง → AI ภายนอก → JSON → Validate → Import → ผู้ใช้ตรวจ → Generate**

## วิธีใช้

1. เปิดเว็บไซต์ Toolkit
2. กด **AI JSON Assistant**
3. กด **คัดลอก Prompt**
4. นำ Prompt ไปใช้กับ AI ภายนอก พร้อมแนบเอกสารที่ต้องการให้ช่วยสกัด
5. ให้ AI ตอบ JSON เท่านั้น
6. Copy JSON กลับมาวาง หรือบันทึกเป็นไฟล์ .json
7. กด **ตรวจ JSON**
8. เลือก Import แบบ:
   - เติมเฉพาะช่องว่าง
   - แทนข้อมูลในฟอร์ม
9. ตรวจ **Pre-Import Review** และรายการ CONFLICT
10. กด **Import เข้าระบบ**
11. เปิด Evidence Trace ของแต่ละ ACTUAL และตรวจ Source/Page/Period/Population
12. เมื่อเทียบต้นฉบับแล้วจึงเลือก **ตรวจต้นฉบับแล้ว** ก่อน Final

## Schema

- Version: `pa-toolkit/intake/3.1`
- JSON Schema: `web/schema/ai-intake.schema.json`
- Fictional Example: `web/schema/ai-intake.example.json`

## Trust Rule

JSON จาก AI เป็น **draft extraction** ไม่ใช่การยืนยันข้อเท็จจริง

Toolkit จะตรวจ syntax/shape บางส่วน แต่ไม่สามารถพิสูจน์ว่าข้อมูลใน JSON ตรงกับเอกสารจริงได้ ผู้ใช้ต้องตรวจ:
- ชื่อ/ตำแหน่ง/ช่วงเวลา
- TARGET
- ACTUAL + หลักฐาน
- cohort / กลุ่มประชากร
- รางวัล/การขยายผล
- policy reference

## Privacy

Toolkit ไม่เชื่อมต่อ AI ภายนอกโดยอัตโนมัติ การส่งเอกสารไป AI ภายนอกเป็นการกระทำของผู้ใช้ จึงควรตรวจนโยบายข้อมูลของบริการนั้นและหลีกเลี่ยงข้อมูลส่วนบุคคลที่ไม่จำเป็น


## Phase 3.1 Evidence Trace

AI สามารถเสนอ:
- actualNumerator / actualDenominator
- sourceFile / sourcePage
- period / population / cohortId

แต่ `verification` จาก AI จะถูกบังคับเป็น `unverified` เสมอ ผู้ใช้เป็นผู้ยืนยันต้นฉบับเอง

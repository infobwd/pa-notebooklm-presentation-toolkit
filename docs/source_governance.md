# Source Governance

## หลักการ

Source ที่ดีไม่ใช่ไฟล์จำนวนมาก แต่คือไฟล์ที่:
- มีบทบาทชัด
- ลดข้อมูลซ้ำ
- จำแนกสถานะข้อมูล
- ตรวจสอบย้อนหลังได้

## Source Layers

1. **Official Source** — เอกสารต้นฉบับที่เป็นทางการ
2. **Synthesized Source** — Markdown ที่สรุปเฉพาะสิ่งที่จะใช้
3. **Visual Evidence** — ภาพ/กราฟ/Screenshot ที่คัดแล้ว
4. **Archive** — เอกสารดิบสำหรับตรวจสอบย้อนหลัง

## Conflict Rule

ถ้า Synthesized Source ขัดกับ Official Source ให้ยึด Official Source และแก้ Synthesized Source

## Missing Evidence Rule

ถ้าไม่มีหลักฐาน:
- ใช้ PENDING
- ห้ามเดา
- ห้ามสร้างภาพ/ตัวเลขขึ้นแทน

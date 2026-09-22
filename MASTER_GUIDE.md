# Master Guide — PA Presentation with NotebookLM

## 1. วัตถุประสงค์

Toolkit นี้ช่วยเปลี่ยนเอกสารประเมินจำนวนมากให้เป็นชุด Sources ที่ NotebookLM ใช้สร้าง Slide Deck และ Video Overview ได้อย่างมีการควบคุม โดยลดความเสี่ยงจาก:
- การนำ TARGET ไปเล่าเป็น ACTUAL
- การตีความข้อมูลต่างรุ่น/ต่างช่วงเวลาเป็นพัฒนาการตรง ๆ
- การใช้ภาพ AI แทนหลักฐานจริง
- การดึงข้อมูลของบุคคลอื่นมาปะปน
- การทำสไลด์เป็นรายการผลงานแทนการเล่าเหตุผลและผลลัพธ์

## 2. Workflow หลัก

1. **COLLECT** รวบรวมเอกสารและหลักฐาน
2. **CLASSIFY** จำแนก FACT/TARGET/ACTUAL/CONTEXT/PENDING
3. **SYNTHESIZE** สรุปเป็น Presentation Results Source
4. **VISUALIZE** สร้าง Visual Storyboard
5. **SCRIPT** เลือก 5 หรือ 7 นาที
6. **SELECT SOURCES** จัด Source Manifest
7. **QA** ตรวจความเข้าใจของ NotebookLM
8. **GENERATE** สร้าง Slide Deck
9. **REVIEW** ตรวจภาพ/ตัวเลข/เนื้อหา
10. **VIDEO** สร้าง Video Overview
11. **FINAL QA** ตรวจรอบสุดท้าย

## 3. กฎข้อมูล

### FACT
มีเอกสาร/หลักฐานรองรับแล้ว

### TARGET
เป็นเป้าหมายหรือค่าที่ตกลงไว้ ห้ามกล่าวว่าเกิดขึ้นจริงจนกว่าจะมี ACTUAL

### ACTUAL
ผลจริงในรอบที่ตรวจสอบได้

### CONTEXT
ข้อมูลฐาน/ปีที่ผ่านมา/ภาพรวม ใช้เพื่ออธิบายเหตุผล ไม่ใช่ผลของงานปัจจุบันโดยอัตโนมัติ

### PENDING
ยังไม่มีข้อมูล ห้าม AI คาดเดาหรือเติมเอง

## 4. แยกเอกสารดิบออกจาก Sources สำหรับ Final

เอกสารดิบอาจมีตารางยาว ข้อมูลซ้ำ และเป้าหมายปะปนกับผลจริง จึงควร:
- สรุปสาระที่ต้องใช้ลง Markdown
- แยกภาพหลักฐานที่ต้องการใช้ออกมาเป็นไฟล์ภาพ
- เก็บเอกสารดิบไว้ใน Archive สำหรับตรวจสอบย้อนหลัง

## 5. Visual Evidence

ทุกภาพควรตอบคำถามว่า:
> ภาพนี้ช่วย “พิสูจน์” หรือ “อธิบาย” ข้อความใด?

ถ้าเป็นหลักฐานจริง ห้ามสร้างใหม่ด้วย AI

## 6. Script

Script 5 นาทีเหมาะกับการนำเสนอคม กระชับ  
Script 7 นาทีเหมาะกับการอธิบายบริบท/กระบวนการเพิ่ม

ห้ามเลือก Script สองเวอร์ชันพร้อมกันในการ Generate เดียว

## 7. NotebookLM QA

ก่อน Generate ให้ถามอย่างน้อย:
- อะไรคือ TARGET?
- อะไรคือ ACTUAL?
- อะไรยัง PENDING?
- ประเด็นหลักของการนำเสนอคืออะไร?
- มีข้อมูลใดใน Sources ที่ขัดกันหรือไม่?

## 8. Slide Deck

โครงทั่วไป:
1. Identity / Context
2. Problem / Need
3. Management or Development Model
4. Process / Participation
5. Evidence of Practice
6. ACTUAL Results
7. Supporting Systems / Innovation
8. Recognition / Expansion
9. Impact Chain / Closing

## 9. Video Overview

หลัก:
- ภาพจริงนำ
- เสียงเป็นธรรมชาติ
- ไม่อ่านรายงานเป็นข้อ ๆ
- ไม่ไล่ฟีเจอร์ระบบ
- จบด้วยผลกระทบต่อผู้เรียน/ผู้รับบริการ/องค์กร

## 10. Data Isolation Rule

ใช้เฉพาะ Sources ของบุคคลนั้นใน Notebook นั้น  
ตัวอย่าง generic ใน Toolkit มีไว้เพื่ออธิบายโครงสร้าง ไม่ใช่ข้อมูลสำหรับนำไปใช้จริง

## 11. ก่อน Final

ต้องผ่าน `templates/10_final_qa_checklist.md`

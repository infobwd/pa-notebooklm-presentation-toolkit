# EASY MODE — BUILD WITH AI

ไฟล์นี้ใช้หลังจากกรอก `01_INPUT_FORM.md` แล้ว

เป้าหมายคือให้ AI ช่วยแปลงข้อมูลของคุณเป็นชุด Sources สำหรับ NotebookLM โดยคุณไม่ต้องกรอก Template หลายไฟล์เอง

---

# สิ่งที่ต้องส่งให้ AI

อย่างน้อย:
1. `01_INPUT_FORM.md`
2. PA / ข้อตกลง / เอกสารต้นฉบับสำคัญ
3. เอกสารผลหรือหลักฐานที่เกี่ยวข้อง
4. ภาพหรือ Screenshot ที่ต้องการใช้

ถ้ามี:
- SAR
- ผลการประเมิน
- รายงานผล
- เอกสารนโยบาย
- หลักฐานรางวัล
- หลักฐานการขยายผล

ให้ส่งเฉพาะที่เกี่ยวข้อง ไม่จำเป็นต้องยัดทุกไฟล์เข้า NotebookLM ภายหลัง

---

# Master Prompt

Copy ข้อความด้านล่างไปใช้กับ AI

---

> คุณคือผู้ช่วยจัดเตรียมชุดข้อมูลสำหรับสร้าง PA Presentation ด้วย NotebookLM
>
> ให้ใช้ INPUT FORM และเอกสาร/หลักฐานที่แนบเป็นแหล่งข้อมูลหลัก
>
> ## กฎสำคัญ
> 1. ห้ามแต่งข้อมูลที่ไม่มีใน Sources
> 2. จำแนกทุกข้อมูลเป็น FACT / TARGET / ACTUAL / CONTEXT / PENDING
> 3. TARGET ห้ามถูกเขียนเป็น ACTUAL
> 4. CONTEXT ห้ามถูกเขียนเป็นผลสำเร็จของรอบปัจจุบันโดยอัตโนมัติ
> 5. ถ้าข้อมูลไม่พอ ให้ใช้ PENDING
> 6. ถ้าพบข้อมูลขัดกัน ให้แจ้งความขัดแย้งก่อน ไม่ต้องเดาว่าอะไรถูก
> 7. ใช้เฉพาะข้อมูลของบุคคล/Project นี้ ห้ามนำข้อมูลจากตัวอย่าง บุคคลอื่น หรือความจำจากงานอื่นมาปะปน
> 8. ห้ามสร้างรางวัล ผลสอบ หนังสือราชการ Screenshot หรือหลักฐานปลอม
> 9. รักษาคำศัพท์ ชื่อเรื่อง ชื่อ Model และตัวเลขตามเอกสารจริง
>
> ## งานที่ต้องสร้าง
>
> สร้างชุดไฟล์ Markdown ต่อไปนี้:
>
> ### 1. presentation_results_source.md
> หน้าที่: WHAT TO SAY
>
> ต้องมี:
> - Identity
> - Context / Development Need
> - Challenge / Agreement
> - Model / Process
> - Participation
> - TARGET
> - ACTUAL
> - Qualitative Results
> - Student/Service Journey
> - Supporting Systems
> - Recognition
> - Expansion
> - Policy Alignment
> - PENDING
> - NotebookLM Guardrails
>
> ### 2. visual_storyboard.md
> หน้าที่: WHAT TO SHOW
>
> สำหรับแต่ละ Scene ระบุ:
> - Message
> - Main Reference
> - ภาพที่ควรใช้
> - Priority
> - ใช้ใน Slide Deck อย่างไร
> - ใช้ใน Video อย่างไร
> - Generated Image Allowed หรือไม่
> - Do Not Generate
>
> ให้ใช้ลำดับภาพ:
> ภาพจริง → Screenshot จริง → Infographic จากเอกสาร → กราฟจากข้อมูลจริง → AI conceptual
>
> ### 3. presentation_script.md
> เลือกความยาวตาม INPUT FORM
>
> ถ้า 5 นาที:
> - กระชับ
> - เน้นปัญหา → วิธีพัฒนา → ผลจริง → ผลกระทบ
>
> ถ้า 7 นาที:
> - เพิ่มบริบท กระบวนการ และการขยายผลได้มากขึ้น
>
> ### 4. source_manifest.md
> แบ่งเป็น:
> - CORE SOURCES
> - VISUAL EVIDENCE
> - ARCHIVE ONLY
> - DO NOT ADD
>
> ### 5. notebooklm_prompts.md
> สร้าง:
> - Chat QA Prompt
> - Slide Deck Prompt
> - Video Overview Prompt
> - Slide Revision Prompt
> - Video Revision Prompt
>
> ### 6. final_qa_checklist.md
> ตรวจ:
> - Identity
> - Evidence
> - TARGET / ACTUAL
> - Storyline
> - Visual
> - Privacy
> - Time
> - Data Isolation
>
> ## ก่อนสร้างไฟล์
>
> ให้สรุปก่อนว่า:
> - ข้อมูลใดครบ
> - ข้อมูลใดยัง PENDING
> - มีข้อมูลใดขัดกันหรือไม่
> - มี ACTUAL เพียงพอสำหรับ Final หรือยัง
>
> ถ้ายังไม่มี ACTUAL ให้สร้างได้ในสถานะ DRAFT แต่ต้องติดป้าย PENDING ชัดเจน
>
> ห้ามทำให้ Draft ดูเหมือน Final

---

# หลัง AI สร้างไฟล์แล้ว

ตรวจอย่างน้อย:
- ชื่อถูกหรือไม่
- ตัวเลขถูกหรือไม่
- TARGET/ACTUAL ถูกแยกหรือไม่
- มีข้อมูลจากคนอื่นหลุดมาหรือไม่
- Storyline ตรงกับงานจริงหรือไม่

จากนั้นเปิด:

`EASY_MODE/03_NOTEBOOKLM_STEPS.md`

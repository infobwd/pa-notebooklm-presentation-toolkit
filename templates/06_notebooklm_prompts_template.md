# NotebookLM Prompts Template

## ก่อนใช้

เลือก Script เพียงหนึ่งเวอร์ชัน และจัด Sources ตาม Source Manifest

## Prompt — Chat QA

> ตรวจ Sources ที่เลือก แล้วจัดข้อมูลเป็น FACT / TARGET / ACTUAL / CONTEXT / PENDING ระบุข้อมูลที่ขัดกัน ข้อมูลที่ยังขาด และจุดที่ห้ามตีความเป็นผลสำเร็จจริง

## Prompt — Slide Deck

> สร้าง Slide Deck ภาษาไทยสำหรับ {{presenter_name}} โดยใช้เวลาไม่เกิน {{presentation_duration}} ยึด Presentation Results Source เป็นข้อเท็จจริงหลัก ใช้ Visual Storyboard กำกับภาพ และใช้ Script ที่เลือกเป็นลำดับเรื่อง  
> 
> ข้อกำหนด:
> - ใช้ภาพจริงก่อนภาพสร้าง
> - ห้ามสร้างภาพ AI แทนหลักฐาน
> - ห้ามแต่ง ACTUAL
> - แยก TARGET / ACTUAL / CONTEXT / PENDING
> - ให้ประเด็นท้าทายและผลลัพธ์เป็นแกนหลัก
> - ข้อความสั้น ภาพใหญ่ ตัวเลขเด่น
> - ถ้าขาดหลักฐานให้ระบุ [ต้องเพิ่มภาพหลักฐาน]

## Prompt — Video Overview

> สร้าง Video Overview ภาษาไทย ความยาวตาม Script ที่เลือก สำหรับ {{presenter_name}}  
> ใช้เสียงผู้บรรยายที่เหมาะสมกับบริบททางวิชาชีพ โทนสุภาพ เป็นธรรมชาติ ไม่อ่านรายงานเป็นข้อ ๆ  
> ใช้ภาพจริง/กิจกรรมจริงเป็นแกน และ Screenshot เป็น B-roll  
> เน้นเหตุผลของการพัฒนา กระบวนการ ผลลัพธ์ และการขยายผล  
> ห้ามแต่งตัวเลขหรือสร้างหลักฐานปลอม

## Data Isolation Rule

> ใช้เฉพาะข้อมูลจาก Sources ของ Project นี้ ห้ามนำข้อมูลจากตัวอย่าง บุคคลอื่น หรือ Notebook อื่นมาใช้ หากไม่มีข้อมูลให้ระบุ PENDING

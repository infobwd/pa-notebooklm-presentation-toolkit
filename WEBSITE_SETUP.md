# Website Setup — GitHub Pages

เว็บไซต์ Easy Mode อยู่ในโฟลเดอร์ `web/` และ deploy ด้วย GitHub Actions workflow:

`.github/workflows/pages.yml`

## สถานะปัจจุบัน

- Static web app: พร้อม
- JavaScript syntax check: ผ่านใน GitHub Actions
- GitHub Pages deployment: ต้องเปิด Pages สำหรับ Repository นี้หนึ่งครั้งด้วยสิทธิ์เจ้าของ Repository

เนื่องจาก Repository เป็น Private และ GitHub App ที่ใช้แก้ไฟล์ไม่มีสิทธิ์ Administration จึงไม่สามารถเปิด Pages แทนเจ้าของ Repository ได้

## เปิด Pages ครั้งแรก

1. เปิด Repository `infobwd/pa-notebooklm-presentation-toolkit`
2. ไปที่ **Settings**
3. เลือก **Pages**
4. ในส่วน **Build and deployment**
5. ตั้ง **Source** เป็น **GitHub Actions**
6. ไปที่แท็บ **Actions**
7. เปิด workflow **Deploy toolkit website to Pages**
8. กด **Run workflow**

เมื่อ deploy สำเร็จ URL ที่คาดไว้คือ:

`https://infobwd.github.io/pa-notebooklm-presentation-toolkit/`

## หลังเปิดครั้งแรก

ทุกครั้งที่แก้:
- `web/**`
- `.github/workflows/pages.yml`

workflow จะ deploy เว็บไซต์อัตโนมัติเมื่อ push เข้า `main`

## Privacy

Phase 1:
- ไม่มี backend
- ไม่มี AI API
- ฟอร์มบันทึกใน localStorage
- การ Generate Markdown ทำใน Browser
- การเลือกไฟล์หลักฐานอ่านเฉพาะชื่อไฟล์ ไม่อัปโหลดไฟล์ด้วยโค้ดของ Toolkit

อย่างไรก็ตาม หากเว็บไซต์ Pages ถูกตั้งให้เข้าถึงแบบสาธารณะ ผู้ใช้ควรหลีกเลี่ยงการกรอกข้อมูลลับหรือข้อมูลส่วนบุคคลที่ไม่จำเป็น

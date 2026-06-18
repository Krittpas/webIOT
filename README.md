# ลิงก์ของเรา — หน้ารวมลิงก์

หน้าเว็บสไตล์ Linktree สำหรับเเขวน 2 ลิงก์: กลุ่ม LINE และ Google Classroom

## ไฟล์ในโฟลเดอร์นี้

- `index.html` — ตัวเว็บไซต์ทั้งหมด (HTML + CSS อยู่ในไฟล์เดียว ไม่มี JavaScript เลย)
- `_headers` — กำหนด HTTP security headers ใช้ได้อัตโนมัติบน Netlify และ Cloudflare Pages
- `README.md` — ไฟล์นี้

ไม่มี build step, ไม่ต้องใช้ npm/node — เปิด `index.html` ในเบราว์เซอร์ได้ทันที

## มาตรการความปลอดภัยที่ใส่ไว้

- **ไม่มี JavaScript ในหน้าเว็บเลย** (`script-src 'none'`) ตัดความเสี่ยงเรื่อง XSS เกือบทั้งหมด
- ลิงก์ทั้งสองเปิดด้วย `rel="noopener noreferrer"` และ `referrerpolicy="no-referrer"` กันไม่ให้หน้าปลายทางเข้าถึงหน้านี้ย้อนกลับ หรือเห็น referrer ของผู้ใช้
- มี Content-Security-Policy ทั้งแบบ `<meta>` ในตัว `index.html` (ทำงานทุกที่ที่ deploy) และแบบ HTTP header ในไฟล์ `_headers` (เข้มกว่า เพราะตั้ง `frame-ancestors` และ `X-Frame-Options` ป้องกัน clickjacking ได้จริง ซึ่งทำผ่าน meta tag ไม่ได้)
- ไม่มีฟอร์ม ไม่มีการเก็บข้อมูลผู้ใช้ ไม่มี analytics หรือ tracking script ใด ๆ
- โหลดเฉพาะ Google Fonts จากภายนอก (ไม่มีคุกกี้ ไม่มีการติดตาม)

**ข้อจำกัดที่ควรรู้:** ไฟล์ `_headers` ใช้ได้กับ Netlify และ Cloudflare Pages เท่านั้น ถ้า deploy ที่ GitHub Pages จะไม่สามารถตั้ง HTTP header เองได้ (เหลือแค่ความคุ้มครองจาก `<meta>` ในตัวไฟล์ ซึ่งครอบคลุมน้อยกว่า header จริงเล็กน้อย)

## วิธี Deploy

### 1) Netlify (ง่ายที่สุด)
1. ไปที่ https://app.netlify.com/drop
2. ลากทั้งโฟลเดอร์ `linktree-page` ไปวาง
3. เสร็จแล้ว — ได้ลิงก์ใช้งานทันที (ไปตั้งชื่อโดเมนย่อยเองได้ในหน้า Site settings)

### 2) Cloudflare Pages
1. สร้างบัญชีที่ https://pages.cloudflare.com
2. เลือก "Upload assets" แล้วลากโฟลเดอร์นี้เข้าไป
3. ไฟล์ `_headers` จะถูกอ่านอัตโนมัติ

### 3) Vercel
1. ติดตั้ง CLI: `npm i -g vercel` แล้วรัน `vercel` ในโฟลเดอร์นี้ หรืออัปโหลดผ่านหน้าเว็บ vercel.com
2. หากต้องการ header เดียวกับไฟล์ `_headers` ให้สร้างไฟล์ `vercel.json` เพิ่ม:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "no-referrer" }
      ]
    }
  ]
}
```

### 4) GitHub Pages
1. สร้าง repo ใหม่ อัปโหลด `index.html` ไว้ที่ root (ไฟล์ `_headers` จะไม่มีผลที่นี่)
2. ไปที่ Settings → Pages → เลือก branch ที่จะ deploy
3. รอ 1-2 นาที จะได้ลิงก์ `https://ชื่อบัญชี.github.io/ชื่อ-repo/`

## วิธีแก้ไขเนื้อหา

เปิด `index.html` แล้วแก้ตรงนี้ได้เลย:

- หัวข้อหน้า: `<h1 class="title">ลิงก์ของเรา</h1>`
- คำอธิบายใต้หัวข้อ: `<p class="subtitle">...</p>`
- ลิงก์ LINE: แก้ค่า `href` ในแท็ก `<a class="card card--chat" ...>`
- ลิงก์ Classroom: แก้ค่า `href` ในแท็ก `<a class="card card--classroom" ...>`
- ข้อความในการ์ดแต่ละอัน: แก้ใน `<span class="card-title">` และ `<span class="card-desc">`

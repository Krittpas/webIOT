# ลิงก์ของเรา — หน้ารวมลิงก์

หน้าเว็บสไตล์ Linktree สำหรับเเขวน 2 ลิงก์: กลุ่ม LINE และ Google Classroom

## ไฟล์ในโฟลเดอร์นี้

- `index.html` — ตัวเว็บไซต์ทั้งหมด (HTML + CSS) รวมหน้าแอดมินที่ซ่อนอยู่
- `app.js` — สคริปต์ของหน้าแอดมิน (รหัสผ่าน, กราฟ, ปุ่มเพิ่ม/ลดคะแนน, เชื่อม Supabase)
- `supabase_setup.sql` — สคริปต์ SQL สำหรับสร้างตารางและฟังก์ชันใน Supabase
- `_headers` — กำหนด HTTP security headers ใช้ได้อัตโนมัติบน Netlify และ Cloudflare Pages
- `README.md` — ไฟล์นี้

ไม่มี build step, ไม่ต้องใช้ npm/node

## หน้าแอดมิน (อันดับทีม)

หน้าหลักยังเป็นหน้ารวมลิงก์เหมือนเดิม แต่มีหน้าแอดมินซ่อนอยู่:

1. กด **Ctrl + I** จะมีช่องให้ใส่รหัส
2. พิมพ์รหัสตัวใดตัวหนึ่ง: `AdRK`, `AdKN`, `AdPN`, `AdSD`, `AdSV` แล้วกด Enter
3. เข้าสู่หน้าแอดมิน — เห็น **กราฟแรงกิ้ง** ของ 4 ทีมเรียงตามลำดับ
   โก๊ดโกด → เศร้าซึม → อี๋แหวะ → กลั๊วกลัว
4. ใต้กราฟ ใส่จำนวนคะแนนของแต่ละทีมแล้วกด **เพิ่ม** หรือ **ลด**
5. กราฟอัปเดตอัตโนมัติทุก 5 วินาที และกด **ออกจากระบบ** เพื่อกลับหน้าหลัก

### การตั้งค่า Supabase (ทำครั้งเดียว)

1. สร้างโปรเจกต์ฟรีที่ https://supabase.com
2. เปิด **SQL Editor** → วางเนื้อหาจาก `supabase_setup.sql` → กด **Run**
   (สร้างตาราง `teams`, ใส่ 4 ทีม, เปิด RLS และฟังก์ชัน `adjust_score`)
3. ไปที่ **Project Settings → API** คัดลอกค่า 2 ตัว:
   - **Project URL** เช่น `https://abcdxyz.supabase.co`
   - **anon public key**
4. ใส่ค่าทั้งสองในไฟล์ `app.js` ที่ตัวแปร `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
5. แก้ค่า `YOUR_PROJECT_REF.supabase.co` ให้เป็น host จริงของคุณใน **2 ที่**:
   - `connect-src` ในแท็ก `<meta ... Content-Security-Policy>` ใน `index.html`
   - `Content-Security-Policy` ในไฟล์ `_headers`
   (ถ้าไม่แก้ CSP เบราว์เซอร์จะบล็อกการเชื่อมต่อ Supabase)

> ⚠️ รหัสผ่านแอดมินถูกตรวจในฝั่งเบราว์เซอร์เท่านั้น กันคนทั่วไปได้ แต่ไม่ใช่ระบบความปลอดภัยจริง
> ใครเปิดอ่าน `app.js` จะเห็น anon key และเรียกฟังก์ชันเพิ่ม/ลดคะแนนได้เอง — เหมาะกับสกอร์บอร์ดงานกิจกรรม/ห้องเรียน
> ถ้าต้องการความปลอดภัยจริง ให้ใช้ Supabase Auth + Edge Function แทน RPC ที่ anon เรียกได้

> 💡 เปิดผ่านเซิร์ฟเวอร์ (Netlify/Cloudflare/Vercel หรือ `python -m http.server`) จะทำงานได้ดีที่สุด
> การดับเบิลคลิกเปิดไฟล์แบบ `file://` ตรง ๆ อาจติด CORS เวลาเรียก Supabase

## มาตรการความปลอดภัยที่ใส่ไว้

- โหลด JavaScript เฉพาะไฟล์ของเราเอง (`script-src 'self'`, ไม่มีสคริปต์จากภายนอก) และเชื่อมต่อเครือข่ายได้เฉพาะโดเมน Supabase ที่ระบุไว้ใน `connect-src` เท่านั้น
  (เดิมหน้าเว็บไม่มี JavaScript เลย แต่หน้าแอดมิน + Supabase จำเป็นต้องใช้)
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

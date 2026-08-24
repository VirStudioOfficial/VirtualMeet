# Virtual Meet — Signaling Server

سرور جدا (Node.js + Express + Socket.io) که مسئول موارد زیره:

- عضویت در room (join/leave) و broadcast کردن ورود/خروج شرکت‌کننده‌ها
- رله کردن پیام‌های WebRTC signaling (offer / answer / ICE candidate) بین دو کاربر — خودش هیچ‌وقت داخل این پیام‌ها رو نگاه نمی‌کنه، فقط مسیر می‌ده
- broadcast وضعیت میکروفون/دوربین
- رله چت متنی داخل room

## اجرا (لوکال)

```bash
cd signaling-server
npm install
npm run dev
```

سرور روی `http://localhost:3001` بالا میاد. برای چک کردن سلامتش:

```bash
curl http://localhost:3001/health
```

## متغیرهای محیطی

| متغیر | پیش‌فرض | توضیح |
|---|---|---|
| `PORT` | `3001` | پورتی که سرور روش گوش میده |
| `CLIENT_ORIGIN` | `http://localhost:3000` | آدرس فرانت‌اند، برای CORS |

## اتصال از سمت کلاینت (Next.js)

توی ریشه‌ی پروژه‌ی Next یه فایل `.env.local` بساز:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

اگه این متغیر ست نشه، کلاینت به صورت پیش‌فرض به `http://localhost:3001` وصل میشه (برای توسعه‌ی لوکال).

## دیپلوی

این سرور با Vercel سازگار نیست (چون Vercel از WebSocket پایدار/طولانی‌مدت پشتیبانی نمی‌کنه). گزینه‌های مناسب:

- **Render** — یه "Web Service" جدید بساز، build command: `npm install && npm run build`، start command: `npm start`
- **Railway** — مشابه، فقط `npm start` رو به عنوان start command بده
- بعد از دیپلوی، آدرس عمومی سرور رو (مثلاً `https://your-app.onrender.com`) به عنوان `NEXT_PUBLIC_SOCKET_URL` توی env کلاینت (روی Vercel) ست کن، و `CLIENT_ORIGIN` رو هم روی سرور signaling به آدرس دیپلوی‌شده‌ی Next.js تنظیم کن.

## معماری

سرور signaling **خودش هیچ صدا/تصویری رو منتقل نمی‌کنه**. فقط پیام‌های کوچیک متنی (SDP، ICE candidate) رو بین دو مرورگر رد و بدل می‌کنه تا اونا مستقیماً (peer-to-peer) به هم وصل بشن. جریان واقعی صدا/تصویر از سرور رد نمی‌شه — این باعث میشه هزینه‌ی سرور خیلی پایین بمونه، ولی یعنی برای گروه‌های بزرگ (بیشتر از ۴-۶ نفر) باید به فکر یه SFU (مثل mediasoup یا LiveKit) باشی، چون مدل mesh (هر کاربر به همه وصل میشه) با افزایش تعداد نفرات سنگین میشه.

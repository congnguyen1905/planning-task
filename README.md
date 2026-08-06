# Việc hôm nay — Todo list đồng bộ nhiều máy

Next.js (App Router) + Upstash Redis (lưu trữ, free tier) + SWR (poll mỗi 3s để đồng bộ giữa các thiết bị).

## Vì sao cần Upstash Redis mà không dùng "database truyền thống"?

Vercel chạy code ở serverless functions — không có ổ đĩa bền để ghi file JSON
(dữ liệu sẽ mất khi function khởi động lại). Để nhiều máy cùng thấy dữ liệu
mới nhất, cần **một nơi lưu trữ chung** nằm ngoài function. Upstash Redis là
lựa chọn nhẹ nhất: không cần định nghĩa schema, không cần migration, chỉ là
một key-value store — set up trong 1 phút, free tier đủ dùng cho todo list cá
nhân.

Đồng bộ "realtime" ở đây là **polling mỗi 3 giây** (client tự fetch lại), đơn
giản, không cần thêm dịch vụ websocket/pubsub, và với todo list thì độ trễ
vài giây là không đáng kể.

## Chạy local

```bash
npm install
cp .env.example .env.local
```

Tạo Redis DB free tại https://console.upstash.com (chọn Redis → Create
Database), sau đó copy `UPSTASH_REDIS_REST_URL` và
`UPSTASH_REDIS_REST_TOKEN` vào `.env.local`.

```bash
npm run dev
```

Mở http://localhost:3000

## Deploy lên Vercel

1. Push code này lên GitHub repo.
2. Vào https://vercel.com → New Project → import repo.
3. Cách nhanh nhất để có Redis: trong dashboard project trên Vercel, vào tab
   **Storage → Create Database → Upstash for Redis** (Marketplace
   integration). Vercel sẽ tự động thêm `UPSTASH_REDIS_REST_URL` và
   `UPSTASH_REDIS_REST_TOKEN` vào Environment Variables của project —
   không cần copy tay.
   - Hoặc: tạo DB thủ công tại console.upstash.com rồi tự thêm 2 biến trên
     vào Vercel → Settings → Environment Variables.
4. Deploy. Xong — mở app trên 2 máy/2 tab khác nhau, sửa ở máy này thì máy
   kia tự cập nhật trong vòng ~3 giây.

## Cấu trúc chính

- `src/lib/redis.ts` — kết nối Upstash Redis
- `src/lib/store.ts` — đọc/ghi toàn bộ list (lưu dưới 1 key JSON)
- `src/app/api/todos/**` — REST API cho todo & sub-todo (CRUD)
- `src/lib/useTodos.ts` — hook SWR: poll 3s + các hàm mutate
- `src/components/*` — UI: form thêm việc, dòng todo, dòng việc con
- `src/app/page.tsx` — trang chính

## Nếu muốn thay polling bằng push tức thì sau này

Có thể thay `useTodos.ts` bằng Pusher/Ably: khi 1 API route ghi Redis xong,
gọi `pusher.trigger("todos", "updated", {...})`, client subscribe channel đó
để nhận cập nhật ngay lập tức thay vì chờ tối đa 3s. Cấu trúc REST API hiện
tại không cần đổi gì.

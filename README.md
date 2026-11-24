# WaniKarya Starter: Homepage, Pencarian, Marketplace

## Cara pakai (±10 menit)

1. Buat proyek (jawab: TypeScript Yes, ESLint Yes, Tailwind Yes, src/ dir **No**, App Router Yes, import alias `@/*`):
   ```
   npx create-next-app@latest wanikarya
   cd wanikarya
   npm install lucide-react
   ```
2. Salin isi folder ini ke proyek (timpa file yang sudah ada): `app/`, `components/`, `lib/`, `public/`.
3. Jalankan `npm run dev`, buka http://localhost:3000
   - `/` Homepage, `/cari?q=salak` Pencarian, `/marketplace` Marketplace
4. Taruh foto di `public/images/` (nama file ada di `lib/data.ts`). Selama belum ada, tampil blok warna sementara.
5. `git init`, commit, push ke GitHub.

## Catatan
- Data masih **mock** di `lib/data.ts`; semua akses lewat `lib/queries.ts`. Saat Supabase siap, cukup ganti isi fungsi di file itu.
- Link ke halaman yang belum dibuat (detail produk, /login, dll.) sementara 404.
- Filter/sort/Muat Lebih Banyak memakai query string (`?kategori=kuliner&urut=termurah&limit=12`), jadi bisa di-share dan dibuka ulang.

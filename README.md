# TaskFlow — Kanban Proje Yönetim Tahtası

## Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. .env.local Dosyasını Doldur
Supabase Dashboard → Settings → API bölümünden alacağın değerleri `.env.local` dosyasına gir:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Supabase SQL Editor'de Tabloları Oluştur
Supabase → SQL Editor'e git, `supabase-schema.sql` dosyasının içeriğini yapıştır ve çalıştır.

### 4. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```
Tarayıcıda http://localhost:3000 aç.

## Vercel Deploy

```bash
npm install -g vercel
vercel
vercel --prod
```

Vercel Dashboard → Settings → Environment Variables bölümüne `.env.local` değerlerini ekle.

## Özellikler

- Kullanıcı kaydı ve girişi
- Birden fazla tahta oluşturma
- Sütun oluşturma ve yönetme
- Kart ekleme, düzenleme, silme
- Sürükle-bırak ile kart ve sütun sıralama
- Sayfa yenilemesinde sıralama korunur
- Mobil uyumlu tasarım

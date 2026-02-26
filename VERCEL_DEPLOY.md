# Komut Zinciri - Vercel Deployment Rehberi

## Vercel'e Deploy Etme

### 1. Vercel Environment Variables Ayarları

Vercel dashboard'unuzda proje ayarlarına gidin ve şu environment variable'ları ekleyin:

- `MONGODB_URI`: `mongodb+srv://emrekesim34_db_user:Fvj0QoILnP3Ysfal@cluster0.cgcj347.mongodb.net/komut-zinciri`
- `JWT_SECRET`: `komut-zinciri-secret-key-2026`

### 2. Deploy Komutu

```bash
# Vercel CLI'yi yükleyin (eğer yoksa)
npm i -g vercel

# Deploy edin
vercel --prod
```

### 3. Local Development

```bash
# Backend için
cd server
npm run dev

# Frontend için (başka bir terminal'de)
npm run dev
```

### 4. Backend URL

- **Production**: https://komut-zinciri.vercel.app/api
- **Development**: http://localhost:3001/api

Frontend otomatik olarak environment'a göre doğru URL'i kullanacaktır.

## Notlar

- Frontend ve backend aynı Vercel project'inde deploy edilir
- MongoDB Atlas'a her ortamdan erişilebilir
- JWT token'lar 7 gün geçerlidir

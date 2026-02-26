# Komut Zinciri - Dino Macerası 🦖

Eğlenceli bir programlama mantığı oyunu! Dinozoru komutlarla hedefe ulaştır.

## Özellikler

- 🎮 Seviye bazlı oyun sistemi
- 👥 Kullanıcı kayıt ve giriş
- 🏆 Puan sistemi ve lider tablosu  
- ⏱️ Zamanlayıcı
- 📊 Puanlama: Temel Puan (1000) + Zaman Bonusu + Hamle Bonusu
- 🎯 Toplanabilir objeler (Piller)
- 📱 Mobil uyumlu tasarım

## Kurulum

### Backend

```bash
cd server
npm install
npm run dev
```

Backend varsayılan olarak `http://localhost:3001` üzerinde çalışacaktır.

### Frontend

```bash
npm install
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` üzerinde çalışacaktır.

## Puanlama Sistemi

- **Temel Puan**: 1000 puan (bölüm tamamlama)
- **Zaman Bonusu**: (60 - harcanan süre) × 10
- **Hamle Bonusu**: (kalan hamle sayısı) × 50

## Teknolojiler

### Frontend
- React 19
- TypeScript
- Vite

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Oyun Nasıl Oynanır?

1. Kayıt ol veya giriş yap
2. Kontrollerle (Sol, İleri, Sağ) komutlarını planla
3. Tüm pilleri topla
4. Yıldıza ulaş
5. Puanını kazan ve lider tablosuna gir!

## Geliştirici

Emre Kesim

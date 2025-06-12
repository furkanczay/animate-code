# Code Animation

Code Animation, adım adım kod değişikliklerini ve dosya farklarını modern ve animasyonlu bir şekilde görselleştiren, Next.js tabanlı bir uygulamadır.

## Özellikler

- Adım adım kod diff animasyonu
- Satır ve kelime bazında fark gösterimi
- Monaco Editor ile canlı kod düzenleme
- Modern, video dostu ve responsive arayüz
- Karanlık/açık tema desteği
- Statik export (next export) ile kolay dağıtım

## Kurulum

```bash
npm install
npm run dev
```

## Build ve Statik Export

```bash
npm run build
npm run export
```

Çıktı `out/` klasörüne yazılır.

## Deploy

- Statik hosting servislerine (Netlify, Vercel, GitHub Pages, Dokploy, vs.) sadece `out/` klasörünü yükleyin.
- Kendi sunucunuzda Nginx veya Docker ile kolayca servis edebilirsiniz.

## Kullanılan Teknolojiler

- Next.js 15
- React 19
- Tailwind CSS
- Monaco Editor
- Framer Motion
- Lucide Icons
- diff, he

## Katkı

Katkıda bulunmak için PR gönderebilir veya issue açabilirsiniz.

---

**Not:**
Statik export sonrası oluşan `out/` klasörünü doğrudan bir HTTP sunucusunda veya Docker ile yayınlayın. Live Server veya dosyaya çift tıklayarak açmak işe yaramaz.

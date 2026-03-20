# jazz-your-life

每天替你先收好幾張值得按下播放的爵士選擇。

`jazz-your-life` 是一個為 Spotify 重度爵士樂愛好者打造的每日推薦 Web App。它會用最短的點擊路徑，先給你今天可以從哪裡開始聽；連接 Spotify 後，也會根據最近的常聽、收藏與播放紀錄，調整推薦方向。

Live URL: [https://www.noesis.studio](https://www.noesis.studio)

## Product Highlights

- 每日爵士推薦首頁，支援 `Classic`、`Exploratory`、`Fusion`、`Late Night`、`Focus`
- 一鍵前往 Spotify 播放
- 支援分享與本地收藏
- Spotify OAuth with PKCE
- 根據 Spotify 聆聽訊號產生個人化推薦
- 未登入時也會用公開資料源補齊真實專輯封面，而不是只顯示預設圖

## Local Development

1. Load Node via `nvm`:

   ```bash
   export NVM_DIR="$HOME/.nvm"
   . "$NVM_DIR/nvm.sh"
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env.local
   ```

4. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), create an app and add these redirect URIs:

   ```text
   http://127.0.0.1:3000/api/spotify/callback
   https://www.noesis.studio/api/spotify/callback
   ```

5. Fill in `SPOTIFY_CLIENT_ID` in `.env.local`.
6. Set `SITE_URL=https://www.noesis.studio` in `.env.local` if you want local metadata and OAuth redirects to match production.
7. Start the dev server:

   ```bash
   npm run dev
   ```

8. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Verification

```bash
npm test
npm run lint
npm run build
```

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import the GitHub repo into Vercel as `jazz-your-life`.
3. Use the default Next.js build settings.
4. Add `SPOTIFY_CLIENT_ID` to production env.
5. Add `SITE_URL=https://www.noesis.studio` to production env.
6. Make sure Spotify Dashboard also allowlists:

   ```text
   https://www.noesis.studio/api/spotify/callback
   ```

7. Redeploy after each push.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Vitest
- Spotify Web API + OAuth PKCE
- `next-pwa`

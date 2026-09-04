# 字卡島 Word Island — 英語學習 App

康軒國中英語（U1~U6）單字練習 App：字卡、測驗、配對、克漏字、拼字練習、萊特納間隔複習。

## 線上使用

部署在 GitHub Pages，用手機或電腦瀏覽器直接開啟即可（不需安裝）：

👉 https://chiayun0910.github.io/english-study-app/

> 若你是用 iPhone：請直接用 Safari 開啟上面的網址，不要用「用檔案 App 打開 HTML 檔」的方式，否則語音朗讀與進度儲存功能會受限。可以之後在 Safari 分享選單選「加入主畫面」，就會像一個獨立 App 一樣使用。

## 檔案說明

- `index.html` — 可直接部署、離線可用的完整版本（React 透過 CDN 載入，不需建置工具），實際部署使用這個檔案。
- `EnglishStudyApp.jsx` — 原始 React 元件原始碼（含 lucide-react 圖示套件），作為之後在有建置工具（如 Vite）的專案中繼續開發用。
- `單字卡/` — 對應課程的 PDF 單字卡。

## 進度儲存

學習進度（章節印章、答題統計、錯題複習排程）會存在瀏覽器的 `localStorage`，僅存在你自己的裝置上，換裝置或清除瀏覽器資料會遺失。畫面上方有「備份進度 / 匯入進度 / 重置進度」可以手動匯出/匯入 JSON 備份。

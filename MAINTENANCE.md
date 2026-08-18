# 維護指引

這份文件說明怎麼修改網站內容、以及怎麼讓改動出現在線上網站。
**不需要程式背景**，照著步驟做就好。

換照片請看 [images/README.md](images/README.md)——那份文件把每張圖的檔名、比例、拍法都列出來了。

---

## 目錄

- [改網站文字：對照表](#改網站文字對照表)
- [讓改動上線](#讓改動上線)
- [改壞了怎麼還原](#改壞了怎麼還原)
- [商標](#商標)
- [介紹影片連結](#介紹影片連結)

---

## 改網站文字：對照表

所有文字都在 `index.html` 裡。用純文字編輯器（VS Code 或記事本）開啟，
按 `Ctrl + F` 搜尋下表的關鍵字就能找到位置。

> ⚠️ **不要用 Word 或 WordPad 開 `index.html`**——它們另存後會破壞網頁格式。
> 也不要雙擊（雙擊是用瀏覽器開，只能看不能改）。

| 想改什麼 | 搜尋這個 |
|---|---|
| 首頁三行文案 | `#hero` 區塊的 `<h1>`、`.hero-sub`、`.hero-sub2` |
| 首頁兩枚徽章 | `hero-chips` |
| 設計理念兩段文字 | `#about` 區塊的兩段 `<p>` |
| 核心特色四格 | `feat-t`（標題）、`feat-d`（說明） |
| 介紹影片連結 | `data-video`（見下方[介紹影片連結](#介紹影片連結)） |
| 模式卡片名稱與副標 | `mode-card`。改圖檔鍵值時要同步改 `switchMode` 的第二個參數 |
| 規格數值 | `spec-row`（滑到圖片上浮出的四項）與 `cmp-row`（展開的完整對照表七項）。兩邊都有的項目要一起改 |
| 兩代產品說明 | `#series` 各卡片底部的 `<p>` |
| 設計師姓名與語錄 | `#designers` |
| Instagram 連結 | `ig-button` 的 `href` |
| 商標 | `brand-wordmark`（見下方[商標](#商標)） |
| 品牌色 | `<style>` 開頭的 `:root` CSS 變數。部分色碼散落各處，全域改色建議全檔搜尋替換 |
| 搜尋結果與分享預覽文案 | `<head>` 裡的 `meta description` 與 `og:` 系列 |

改完存檔，雙擊 `index.html` 就能在瀏覽器看到結果（按 `Ctrl + F5` 強制重新整理）。

---

## 讓改動上線

**先理解一件事**：改了電腦上的檔案，線上網站**不會**跟著變。要經過四關：

```
① 改檔案  →  ② commit 打存檔點  →  ③ push 送上 GitHub  →  ④ GitHub 自動重建網站
  在電腦上        在電腦上              上傳                自動，1～2 分鐘
```

漏掉 ② 或 ③，網站就還是舊的。部署來源是 `main` 分支根目錄。

### 方法 A：在 GitHub 網頁上直接改（最簡單，適合只改文字）

不用裝任何軟體，用瀏覽器就好。

1. 開 https://github.com/ziqing-hub/PaintingChair
2. 點檔案清單裡的 `index.html`
3. 往下看到程式碼那一大區，**它自己的右上角**有一排小圖示（`Raw`、複製、下載…），
   點**鉛筆**那顆（滑鼠移上去會顯示 `Edit this file`）。
   如果按到鉛筆旁邊的小箭頭跳出選單，選 **Edit in place**
   > 不是網頁最右上角那排——那裡是 Star／Fork／Watch，不是編輯
4. 按 `Ctrl + F` 搜尋要改的字，改掉
5. **改完先按上方的 `Preview` 分頁看差異**：綠色是新增、紅色是刪掉。
   確認只有你要改的那幾行變色，沒有整段標籤消失
   （整站只有一個 `index.html`，誤刪一個 `</div>` 就會破版，這一步別跳過）
6. 右上角綠色按鈕 **Commit changes...**
7. 跳出視窗：第一格寫一句話說明改了什麼（例如 `改首頁標語`），第二格可留空，
   下面選 **Commit directly to the `main` branch**
8. 按 **Commit changes**
9. 等 1～2 分鐘，開網站按 `Ctrl + F5`

> ⚠️ 這樣改完，**GitHub 上的版本會比電腦裡的新**。下次要在電腦上改之前，
> 一定要先把新版拉下來（見方法 B 第 2 步），不然兩邊各改一份就會撞在一起。

### 方法 B：GitHub Desktop（適合換圖片、或一次改好幾個檔案）

**只需設定一次**

1. 安裝 GitHub Desktop：https://desktop.github.com
2. 用 `ziqing-hub` 帳號登入
3. 選單 `File` → `Add local repository` → 選存放專案的那個 `PaintingChair` 資料夾

**之後每次要更新，照這 8 步**

1. 開 GitHub Desktop，左上角確認：`Current repository` 是 **PaintingChair**、
   `Current branch` 是 **main**
   > **「分支」是什麼？** 想成同一個網站的平行版本。網站上線用的是 `main` 這條，
   > repo 另外留了一條舊版 `v1-original`（只是存檔，沒在用）。
   > **如果 `Current branch` 不是 `main`，點它、在清單裡選 `main`。**
   > 在 `v1-original` 上 commit 與 push，網站不會有任何變化，而且很難查出原因。
2. **先按上排中間那顆按鈕。** 它平常寫的是 `Fetch origin`（下面帶一行「Last fetched…」），
   按下去它會去問 GitHub「有沒有新版本」。
   如果按完字變成 `Pull origin 1`（後面帶數字），**再按一次**把新版本拉下來。
   字沒變就表示沒有新版本，可以往下做。這一步是防撞版的關鍵，別跳過
3. 改 `index.html`（或把新照片丟進 `images/` 覆蓋舊檔），**記得存檔**
4. 回到 GitHub Desktop，左邊 `Changes` 分頁會列出所有改過的檔案
5. **點檔名，右邊會顯示逐行差異：綠色是新增、紅色是刪掉。**
   這一步是確認「只改了想改的地方」，不要跳過
6. 左下角 `Summary` 欄寫一句話，例如 `換上第二代展覽照`
7. 按 **Commit to main**
8. 按右上角 **Push origin**

按完 Push 等 1～2 分鐘，開網站按 `Ctrl + F5`。

> GitHub Desktop 不同版本的按鈕位置略有差異，但這四個字眼一定找得到：
> `Changes`、`Summary`、`Commit to main`、`Push origin`。

### 方法 C：命令列

在 `PaintingChair` 資料夾的空白處按**右鍵** →「在終端機中開啟」
（Windows 10 是「在此處開啟 PowerShell 視窗」），然後：

```bash
git add -A                     # 把所有改動加入這次存檔點
git commit -m "改首頁標語"      # 先打存檔點（先 commit 才不會被 pull 擋住）
git pull                       # 再拉下遠端的新版本
git push                       # 送上 GitHub
```

**順序很重要：`commit` 要在 `pull` 前面。** 如果先 pull 而檔案已經改過，
git 會直接停下來印 `Your local changes to the following files would be overwritten by merge`。

如果 `git pull` 印出 `CONFLICT`，先執行 `git merge --abort` 回到原狀，
再照下方「兩邊都改過怎麼辦」處理。

### commit 訊息怎麼寫

一句話說「改了什麼」，不用寫「怎麼改的」。

| ✅ 好 | ❌ 不好 |
|---|---|
| `改首頁標語` | `update` |
| `換上第二代展覽照` | `修正` |
| `補上承重規格` | `改了一些東西` |

### 三個檢查點

1. **改之前** — 先按 `Fetch origin`；若變成 `Pull origin`（帶數字）就再按一次
   （只在 GitHub 網頁上改的話跳過這點——網頁看到的永遠是最新版）
2. **commit 之前** — 在 `Changes` 逐行看過差異，確認沒有誤刪
3. **push 之後** — 等 1～2 分鐘 → 網站按 `Ctrl + F5`。還是舊的就開無痕視窗確認。
   想確認部署本身有沒有成功：到 repo 的 **Actions** 分頁，
   看 `pages-build-deployment` 是不是綠色勾勾

> GitHub Pages 對 HTML 的快取是 10 分鐘，而這個網站的 CSS 全部寫在 `index.html` 裡，
> 所以「HTML 被快取」等於「CSS 一起被快取」。想立刻確認結果，在網址後面加個
> 查詢字串（例如 `?v=2`）——那是另一個網址，完全繞過快取。

### 有些檔案不會被上傳，那是刻意的

`.gitignore` 這個檔案列了「永遠不要上傳」的東西，所以下面這些即使電腦裡有，
在 `Changes` 裡也看不到——那是**正常的**，不是漏掉：

| 被擋掉的 | 為什麼 |
|---|---|
| `index_old.html`、`index_*.html` | 舊版留檔，只在本機用來對照（`index.html` 本身是例外，會上傳） |
| `NOTES.local.md` | 本機維護備忘 |
| `pc-tmp/`、`shots/`、`shots-*/`、`*.tmp.html`、`.tmp-*` | 測試截圖與暫存檔 |
| `node_modules/`、`dist/`、`build/`、`package-lock.json` | 套件與建置產物，可重新產生 |
| `.vscode/`、`.idea/` | 編輯器設定 |
| `Thumbs.db`、`desktop.ini`、`.DS_Store`、`*.log` | 作業系統與程式產生的雜物 |
| `*.lnk` | Windows 捷徑，含絕對路徑，換電腦不通用 |

`tools/wordmark-svg.mjs` **沒有**被擋，所以會出現在 `Changes` 裡。那是 repo 的一部分，勾起來一起上傳。

---

## 改壞了怎麼還原

**在 GitHub 網頁上改的（方法 A）**

1. 進 https://github.com/ziqing-hub/PaintingChair
2. 點檔案清單上方的 **`History`**（時鐘圖示，旁邊有 commit 筆數）
3. 找到改壞**之前**的那一筆，點進去
4. 右上角 `...` → **`Revert changes`**，它會產生一筆反向的改動
   （或是點該筆紀錄裡的 `index.html` → `View file` → 用鉛筆進編輯畫面，把舊內容整份貼回去再 Commit）

網頁上的每一次 Commit 一樣都是存檔點。

**用 GitHub Desktop 改的（方法 B）**

| 狀況 | 怎麼救 |
|---|---|
| 還沒 commit | `Changes` 分頁對著檔名按**右鍵** → `Discard changes`。<br>⚠️ **這是唯一救不回來的操作**：還沒 commit 的改動沒有存檔點，Discard 之後就永久消失（垃圾桶裡也找不到）。只有在確定「這個檔案改壞了，要整個丟掉重來」時才用。還想留一點的話，先把檔案另存一份 |
| 已經 commit、還沒 push | 切到 `History` 分頁 → 對最上面那筆按右鍵 → `Undo commit`（改動退回 `Changes`，不會消失） |
| 已經 commit 也 push 了 | `History` 分頁 → 找到那筆 → 右鍵 → `Revert changes in commit`（舊版寫 `Revert this commit`）→ 再按 `Push origin`。這會多產生一筆「把剛剛那次反過來做」的紀錄，**原本的歷史都還留著** |

**commit 過的都救得回來**——每一次 commit 都是一個可以回去的存檔點。
但**還沒 commit 的沒有存檔點**，所以動 `Discard` 之前先想一下。
這也是為什麼建議**常 commit、每次只改一件事**：出問題時才知道是哪一步壞的。

### 兩邊都改過怎麼辦（版本衝突）

最好的辦法是**不要兩邊同時改**：要嘛都在網頁改，要嘛都在電腦改。

萬一撞到了，順序反過來做才安全——**先 commit，再 pull**：

1. **先 commit 自己的改動**（`Summary` 隨便寫，例如 `本機改動備份`）。
   commit 過的東西永遠找得回來，這是最安全的一步
2. 再按 `Fetch origin` / `Pull origin`
3. 如果跳出衝突提示，先按 **`Abort merge`** 回到 pull 之前的狀態，
   確認兩邊各改了什麼之後再決定
4. 要自己合的話：衝突的檔案會列在 `Changes`，裡面會出現 `<<<<<<<` 和 `>>>>>>>` 標記，
   把不要的那一段連標記一起刪掉、存檔，再按 **`Continue merge`**，最後 `Push origin`

❌ **不要在還沒 commit 時按 `Discard all changes`。**
那會一次丟掉 `Changes` 清單裡**每一個**檔案的改動，包含剛剛覆蓋進 `images/` 的照片
（原始檔已經被蓋掉，新舊兩份會同時消失），而且救不回來。

真的要備份的話，**整包備份**：把整個 `PaintingChair` 資料夾複製一份到別的位置。
只備份 `index.html` 不夠——照片也要。

---

## 商標

### 它現在是什麼

**是一張圖（SVG），不是文字。** 早期版本用文字加上 Bauhaus 93 字型顯示，
但那個字型只有 Windows 隨附——macOS 與 iOS 上會退回完全不同的字（Arial Black），
品牌識別就消失了。現在把字的形狀直接畫進網頁，任何裝置看到的都一樣。

形狀是從 Windows 隨附的 Bauhaus 93 字型檔直接取出的真實輪廓（不是描邊近似），
與原本用字型渲染的結果一致：墨跡長寬比差 0.004%、像素 IoU 0.9959。

### 想改顏色

`index.html` 搜尋 `brand-wordmark text-`：

```html
<div class="brand-wordmark text-[#5b6d5f]">
```

把 `#5b6d5f` 換成要的色碼即可（例如 `#d0202f` 是品牌紅）。**只改這一個地方**，
不用動下面那一大串座標。

### 想改大小

搜尋 `brand-wordmark svg`：

```css
.brand-wordmark svg { height: 27.9px; width: auto; display: block; }
```

改 `27.9px` 就好，寬度會等比例跟著變。

### 想改文字（例如加副標、改成縮寫）

需要跑一行指令：

1. 在 `PaintingChair` 資料夾裡按右鍵 →「在終端機中開啟」
2. 貼上這行並按 Enter（把 `Painting Chair` 換成要的字）：

   ```bash
   node tools/wordmark-svg.mjs "C:/Windows/Fonts/BAUHS93.TTF" "Painting Chair" out.svg 0.025
   ```

   四個參數：字型檔位置／要轉的文字／輸出檔名／字距（em，數字越大字越鬆）

3. 資料夾裡會多出 `out.svg`。用記事本打開，裡面有兩個東西要抄：
   - `viewBox="0 0 6728.8 930.2"` 這一段
   - `d="M 123.45 ..."` 那一大串

4. 回到 `index.html` 搜尋 `brand-wordmark`，把上面兩個東西貼掉舊的對應位置

**如果字型裡沒有要轉的字**（例如想轉中文，但 Bauhaus 93 只有拉丁字母），
程式會直接停下並列出缺哪些字，不會產生看起來成功、其實是空格子的結果。

### 不想碰指令的做法

在有安裝 Bauhaus 93 的環境下，用 Illustrator（或 Figma、Inkscape）打字 →
選文字 → 「建立外框」→ 存成 SVG，效果一樣。存出來的檔案裡同樣有 `viewBox` 和 `d`，
照上面第 4 步貼進去。

### 想改形狀本身

`d` 那一大串是標準的 SVG 路徑，任何向量軟體都能開來拉節點。
改完存成 SVG，再照第 4 步貼回來。

---

## 介紹影片連結

影片**不是放檔案就會出現播放鍵**，要填連結。位置在 `index.html` 裡搜尋 `data-video`：

```html
<div class="img-container ... about-media" data-video="">
```

在引號中間貼上連結：

- **YouTube**：`https://youtu.be/影片ID`（分享網址後面的 `?si=...` 是追蹤碼，可以不要）
- **自己的影片檔**：放進 `images/` 再寫 `images/intro.mp4`
- **留空**：播放鍵自動隱藏，不會出現點下去沒反應的按鈕

兩件要注意：

1. 播放鍵旁的文字「觀看 90 秒介紹影片」是寫死的，換了不同長度的影片要一起改
   （就在 `data-video` 下面幾行）
2. 用檔案直接開（`file://`）時 YouTube 會拒絕嵌入並顯示「錯誤 153」——
   那是瀏覽器的來源限制，不是設定錯誤。程式已針對這種情況改成另開分頁。
   想在本機看到真正的頁內播放，執行 `python -m http.server 8000` 再開 `http://localhost:8000`

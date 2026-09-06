/* ------------------------------------------------------------------ */
/* 字卡島 Word Island - 跟讀語音辨識 Cloud Function                     */
/*                                                                      */
/* 流程：瀏覽器把使用者念的錄音（不管是 Chrome/Android 的 webm，還是   */
/* iPhone Safari 的 mp4/aac）用 base64 傳上來 → 這裡先用 ffmpeg 統一轉  */
/* 成 Speech-to-Text 看得懂的 16kHz 單聲道 WAV → 呼叫 Google Cloud      */
/* Speech-to-Text 辨識文字 → 跟目標單字比對，回傳是否唸對。             */
/* ------------------------------------------------------------------ */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const speech = require("@google-cloud/speech");
const { Translate } = require("@google-cloud/translate").v2;
const language = require("@google-cloud/language");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const os = require("os");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const speechClient = new speech.SpeechClient();
const translateClient = new Translate();
const languageClient = new language.LanguageServiceClient();

// Google 文法分析回傳的詞性代碼，轉換成這個 App 資料裡慣用的縮寫
const POS_MAP = {
  NOUN: "n.",
  VERB: "v.",
  ADJ: "a.",
  ADV: "adv.",
  PRON: "pron.",
  DET: "det.",
  ADP: "prep.",
  CONJ: "conj.",
  NUM: "num.",
  PRT: "part."
};

// 把一段文字拆成一個個單字（忽略大小寫/標點），用來判斷使用者實際念了哪些字，
// 而不是唸了一整句話（例句）剛好裡面出現目標單字也算過關。
// 這個函式同時用在「單字模式」的目標字（可能是像 make one's way to 這種片語，
// 本身就是好幾個單字組成）跟辨識結果上，才能正確比對多字片語。
function transcriptWords(s) {
  return (s || "")
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter(Boolean);
}

// 判斷 targetWords 這串單字，是否以「連續、順序一致」的方式出現在 gotWords 裡面
function containsPhrase(gotWords, targetWords) {
  if (!targetWords.length || gotWords.length < targetWords.length) return false;
  for (let i = 0; i + targetWords.length <= gotWords.length; i++) {
    let ok = true;
    for (let j = 0; j < targetWords.length; j++) {
      if (gotWords[i + j] !== targetWords[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

// 例句比對用：算「目標句子的單字」有多少比例出現在辨識結果裡（不管順序、不管重複次數），
// 語音辨識偶爾會漏字/誤判一兩個單字，用比例而非要求完全一致，念完大部分句子就算通過
function sentenceSimilarity(target, transcript) {
  const targetWords = transcriptWords(target);
  if (!targetWords.length) return 0;
  const gotSet = new Set(transcriptWords(transcript));
  const matched = targetWords.filter(w => gotSet.has(w)).length;
  return matched / targetWords.length;
}
// 只看整體比例的話，念到句子一半（例如 9 個字念了 6 個）就可能超過門檻，
// 誤判成「整句都念完了」。所以除了比例要夠高，還要求辨識結果裡有出現句尾
// 的最後一個字，兩個條件都符合才代表使用者真的把整句念到最後。
const SENTENCE_MATCH_THRESHOLD = 0.8;
function sentenceFullyRead(target, transcript) {
  const targetWords = transcriptWords(target);
  if (!targetWords.length) return false;
  const gotWords = transcriptWords(transcript);
  const gotSet = new Set(gotWords);
  const similarity = targetWords.filter(w => gotSet.has(w)).length / targetWords.length;
  const lastWord = targetWords[targetWords.length - 1];
  return similarity >= SENTENCE_MATCH_THRESHOLD && gotSet.has(lastWord);
}

function transcodeToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("error", reject)
      .on("end", resolve)
      .save(outputPath);
  });
}

exports.checkPronunciation = onCall(
  {
    region: "asia-east1",
    memory: "512MiB",
    timeoutSeconds: 30,
    cpu: 1
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入");
    }
    const { audioBase64, expectedWord, expectedWords, expectedSentence } = request.data || {};
    // 有帶 expectedSentence 就是「跟讀例句」模式，比對邏輯比較寬鬆（比例式）；
    // 否則是「跟讀單字」模式：expectedWords（陣列）支援「feel / felt」這種一筆多型態的單字，
    // 唸對任一型態都算通過，沒帶陣列的話退回用 expectedWord（單一字串）相容舊呼叫方式
    const mode = typeof expectedSentence === "string" && expectedSentence.trim() ? "sentence" : "word";
    const targetList = Array.isArray(expectedWords) && expectedWords.length ? expectedWords : [expectedWord];
    // 每個目標型態各自拆成單字陣列（例如 "make one's way to" → ["make","one's","way","to"]），
    // 支援一般單字，也支援本身是好幾個字的片語/句型
    const targetWordLists = targetList.map(transcriptWords).filter(w => w.length);
    if (!audioBase64 || (mode === "sentence" ? !expectedSentence.trim() : !targetWordLists.length)) {
      throw new HttpsError("invalid-argument", "缺少錄音或單字/例句資料");
    }
    // 錄音長度粗略把關，避免異常大檔案（例如誤傳整段影片）拖垮效能/費用
    if (audioBase64.length > 8_000_000) {
      throw new HttpsError("invalid-argument", "錄音檔太大");
    }

    const id = crypto.randomUUID();
    const inputPath = path.join(os.tmpdir(), `${id}-in`);
    const outputPath = path.join(os.tmpdir(), `${id}-out.wav`);

    try {
      fs.writeFileSync(inputPath, Buffer.from(audioBase64, "base64"));
      await transcodeToWav(inputPath, outputPath);
      const audioContent = fs.readFileSync(outputPath).toString("base64");

      const [response] = await speechClient.recognize({
        audio: { content: audioContent },
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
          maxAlternatives: 3
        }
      });

      const results = response.results || [];
      const transcripts = results
        .flatMap(r => r.alternatives || [])
        .map(a => a.transcript || "");
      // 使用者念到一半停頓一下，Speech-to-Text 常常會把錄音拆成好幾個 result
      // （例如「the weather in the mountains」/「can change very quickly」兩段），
      // 每段各自都不完整、比對不到完整句子。把每段的最佳結果接起來，
      // 還原成完整的一句話，再拿去比對，念完整句（就算中間有停頓）才不會被誤判失敗。
      if (results.length > 1) {
        const joined = results
          .map(r => (r.alternatives && r.alternatives[0] && r.alternatives[0].transcript) || "")
          .filter(Boolean)
          .join(" ");
        if (joined) transcripts.push(joined);
      }

      let isMatch;
      let bestSimilarity;
      if (mode === "sentence") {
        // 例句模式：比例要夠高，而且辨識結果要包含句尾最後一個字，兩者都符合才算真的念完整句
        bestSimilarity = transcripts.reduce((max, t) => Math.max(max, sentenceSimilarity(expectedSentence, t)), 0);
        isMatch = transcripts.some(t => sentenceFullyRead(expectedSentence, t));
      } else {
        // 單字/片語模式：辨識結果要「完整包含」目標型態（連續、順序一致），且整段辨識結果
        // 長度不能比目標型態多太多字（最多容許 2 個贅字，例如冠詞），避免使用者唸整句例句、
        // 句子裡剛好出現目標單字，卻被誤判成跟讀成功
        isMatch = transcripts.some(t => {
          const gotWords = transcriptWords(t);
          if (!gotWords.length) return false;
          return targetWordLists.some(target => gotWords.length <= target.length + 2 && containsPhrase(gotWords, target));
        });
      }

      return { match: isMatch, transcripts, ...(mode === "sentence" ? { similarity: bestSimilarity } : {}) };
    } catch (err) {
      console.error("checkPronunciation error", err);
      throw new HttpsError("internal", "語音辨識失敗，請再試一次");
    } finally {
      try {
        fs.unlinkSync(inputPath);
      } catch (e) {
        /* ignore */
      }
      try {
        fs.unlinkSync(outputPath);
      } catch (e) {
        /* ignore */
      }
    }
  }
);

/* ------------------------------------------------------------------ */
/* 自訂生字：點例句裡的單字時，自動翻譯成中文＋判斷詞性，                */
/* 使用者不用自己打意思、自己查詞性                                     */
/* ------------------------------------------------------------------ */
exports.translateWord = onCall(
  {
    region: "asia-east1",
    memory: "256MiB",
    timeoutSeconds: 15
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入");
    }
    const { text, sentence } = request.data || {};
    if (typeof text !== "string" || !text.trim()) {
      throw new HttpsError("invalid-argument", "缺少要翻譯的文字");
    }
    let translation = "";
    let pos = "";
    try {
      const [t] = await translateClient.translate(text.trim(), "zh-TW");
      translation = t;
    } catch (err) {
      console.error("translateWord translate error", err);
      throw new HttpsError("internal", "翻譯失敗，請自己輸入中文意思");
    }
    // 詞性分析是加分項目，這步失敗不影響翻譯結果，靜靜失敗即可
    if (typeof sentence === "string" && sentence.trim()) {
      try {
        const [result] = await languageClient.analyzeSyntax({
          document: { content: sentence, type: "PLAIN_TEXT" },
          encodingType: "UTF8"
        });
        const target = text.trim().toLowerCase();
        const match = (result.tokens || []).find(tok => ((tok.text && tok.text.content) || "").toLowerCase() === target);
        if (match && match.partOfSpeech && match.partOfSpeech.tag) {
          pos = POS_MAP[match.partOfSpeech.tag] || "";
        }
      } catch (err) {
        console.error("translateWord analyzeSyntax error", err);
      }
    }
    return { translation, pos };
  }
);

// Merriam-Webster 官方字典 API（個人非商業用途免費，每天 1000 次）。
// 比 dictionaryapi.dev 這類無金鑰的免費服務穩定很多，缺點是回傳格式比較
// 複雜（巢狀的 sseq 結構＋自己的排版標記），下面兩個函式負責解析、清理。
// 兩本字典都查：Learner's Dictionary 是給英語學習者用的，例句比較生活化、
// 也直接附標準 IPA 音標，優先查這本；查不到才退回查 Collegiate Dictionary
// （比較學術正式，但涵蓋的字更多、更冷門的字也查得到）。
const MW_LEARNERS_KEY = "6219f3ab-1539-4fe7-88b8-886e084c4298";
const MERRIAM_WEBSTER_KEY = "bd628020-37b6-4667-b4ae-c3ba57244aa6";

// 把 Merriam-Webster 文字裡的排版標記（例如 {it}斜體{/it}、{wi}headword{/wi}）
// 清掉，只留下純文字給使用者看
function cleanMwText(s) {
  if (!s) return "";
  return s
    .replace(/\{ldquo\}/g, "“")
    .replace(/\{rdquo\}/g, "”")
    .replace(/\{[^}]*\}/g, "")
    .trim();
}

// entry 裡的例句藏在 def[].sseq 很深的巢狀陣列裡（[["vis", [{t:"..."}]]] 這種
// 結構），直接遞迴整個物件找第一個 vis 例句，不用去猜確切的巢狀層數
function findMwExample(node) {
  if (!node) return null;
  if (Array.isArray(node)) {
    if (node[0] === "vis" && Array.isArray(node[1]) && node[1][0] && node[1][0].t) {
      return node[1][0].t;
    }
    for (const item of node) {
      const found = findMwExample(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof node === "object") {
    for (const key of Object.keys(node)) {
      const found = findMwExample(node[key]);
      if (found) return found;
    }
  }
  return null;
}

function mapMwPos(fl) {
  if (!fl) return "";
  const f = fl.toLowerCase();
  if (f.includes("verb")) return "v.";
  if (f.includes("noun")) return "n.";
  if (f.includes("adjective")) return "a.";
  if (f.includes("adverb")) return "adv.";
  if (f.includes("pronoun")) return "pron.";
  if (f.includes("preposition")) return "prep.";
  if (f.includes("conjunction")) return "conj.";
  if (f.includes("interjection")) return "int.";
  if (f.includes("determiner") || f.includes("article")) return "det.";
  if (f.includes("numeral")) return "num.";
  return "";
}

/* ------------------------------------------------------------------ */
/* 自訂生字（手動新增）：填了英文單字/片語後，自動查字典帶出詞性、        */
/* 例句，再翻譯成中文，查不到就回報「查無此字」讓使用者自己輸入。        */
/* 字典用 Merriam-Webster 官方 API，中文意思／例句翻譯用 Cloud Translation。*/
/* ------------------------------------------------------------------ */
exports.lookupWord = onCall(
  {
    region: "asia-east1",
    memory: "256MiB",
    timeoutSeconds: 30
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入");
    }
    const { text } = request.data || {};
    if (typeof text !== "string" || !text.trim()) {
      throw new HttpsError("invalid-argument", "缺少要查詢的文字");
    }
    const query = text.trim();

    async function fetchMwEntry(refPath, key) {
      try {
        const res = await fetch(`https://www.dictionaryapi.com/api/v3/references/${refPath}/json/${encodeURIComponent(query)}?key=${key}`);
        if (!res.ok) return null;
        const data = await res.json();
        // 字典查不到確切的字時，MW 回傳的是「拼字建議」字串陣列，不是真正的字義物件；
        // 只有陣列第一項是物件（有 meta 欄位）才代表真的查到了
        return Array.isArray(data) && data.length && typeof data[0] === "object" && data[0].meta ? data[0] : null;
      } catch (err) {
        console.error(`lookupWord Merriam-Webster fetch error (${refPath})`, err);
        return null;
      }
    }

    let entry = await fetchMwEntry("learners", MW_LEARNERS_KEY);
    let ipa = "";
    if (entry) {
      const prs = entry.hwi && entry.hwi.prs && entry.hwi.prs[0];
      if (prs && prs.ipa) ipa = prs.ipa;
    } else {
      entry = await fetchMwEntry("collegiate", MERRIAM_WEBSTER_KEY);
    }

    if (!entry) {
      return { found: false };
    }

    const pos = mapMwPos(entry.fl);
    const rawExample = findMwExample(entry.def);
    const exampleEn = cleanMwText(rawExample);
    // 一字多義的字，字典通常會列好幾條主要字義（同詞性），各自翻成中文
    // 給使用者參考，比「只翻單一個字」更容易挑到跟例句對得上的說法
    const shortdefs = Array.isArray(entry.shortdef) ? entry.shortdef.slice(0, 3).map(cleanMwText).filter(Boolean) : [];

    // 每一段翻譯互不相關，平行呼叫比較快
    const [zh, exampleZh, senses] = await Promise.all([
      translateClient.translate(query, "zh-TW").then(([t]) => t).catch(err => {
        console.error("lookupWord translate word error", err);
        return "";
      }),
      exampleEn ? translateClient.translate(exampleEn, "zh-TW").then(([t]) => t).catch(err => {
        console.error("lookupWord translate example error", err);
        return "";
      }) : Promise.resolve(""),
      shortdefs.length ? Promise.all(shortdefs.map(d => translateClient.translate(d, "zh-TW").then(([t]) => t).catch(err => {
        console.error("lookupWord translate shortdef error", err);
        return "";
      }))).then(list => list.filter(Boolean)) : Promise.resolve([])
    ]);

    return {
      found: true,
      pos,
      zh,
      senses,
      ex_en: exampleEn,
      ex_zh: exampleZh,
      ipa
    };
  }
);

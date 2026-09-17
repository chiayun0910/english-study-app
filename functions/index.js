/* ------------------------------------------------------------------ */
/* 字卡島 Word Island - Cloud Functions                                  */
/*                                                                      */
/* translateWord / lookupWord：自訂生字的自動翻譯、查字典（詞性、例句、   */
/*   音標、原形判斷）。                                                 */
/* listViewableFamilyMembers / getFamilyProgress：家長檢視。            */
/*                                                                      */
/* 跟讀語音辨識已改成全部在瀏覽器／裝置端進行（Web Speech API 與       */
/* 裝置端 Whisper），不再經過這裡，也不會產生 Speech-to-Text 費用。     */
/* ------------------------------------------------------------------ */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { Translate } = require("@google-cloud/translate").v2;
const language = require("@google-cloud/language");

admin.initializeApp();
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
    let lemma = "";
    let inflectionNote = "";
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
        // lemma 是這個字在字典裡查得到的原形（例如 received → receive，
        // cats → cat）。使用者點例句裡的字新增生字時，句子裡出現的常常是
        // 變化形而非原形，練習時改用原形比較合理，所以把原形跟變化說明
        // 一起回傳，前端決定要不要採用
        const rawLemma = match && match.lemma;
        if (rawLemma && rawLemma.toLowerCase() !== target) {
          lemma = rawLemma;
          inflectionNote = describeInflection(text.trim(), lemma, match.partOfSpeech || {});
        }
      } catch (err) {
        console.error("translateWord analyzeSyntax error", err);
      }
    }
    return { translation, pos, lemma, inflectionNote };
  }
);

// 描述「句子裡的變化形」跟「原形」的關係，用來在自訂生字加上說明註解，
// 例如：received 是 receive 的過去式；cats 是 cat 的複數形。
// 涵蓋不到的情況就給一個通用但誠實的說法，不假裝知道確切的文法變化。
function describeInflection(surfaceForm, lemma, partOfSpeech) {
  const tag = partOfSpeech.tag;
  const tense = partOfSpeech.tense;
  const number = partOfSpeech.number;
  const person = partOfSpeech.person;
  if (tag === "VERB") {
    if (tense === "PAST") return `本例句用「${surfaceForm}」，是「${lemma}」的過去式（或過去分詞），練習時以「${lemma}」為主。`;
    if (person === "THIRD" && number === "SINGULAR") return `本例句用「${surfaceForm}」，是「${lemma}」的第三人稱單數形，練習時以「${lemma}」為主。`;
    if (/ing$/i.test(surfaceForm)) return `本例句用「${surfaceForm}」，是「${lemma}」的現在分詞（V-ing），練習時以「${lemma}」為主。`;
  }
  if (tag === "NOUN" && number === "PLURAL") return `本例句用「${surfaceForm}」，是「${lemma}」的複數形，練習時以「${lemma}」為主。`;
  if (tag === "ADJ" && /ing$/i.test(surfaceForm)) return `本例句用「${surfaceForm}」，是「${lemma}」的現在分詞（當形容詞用），練習時以「${lemma}」為主。`;
  if (tag === "ADJ" && /(ed|en)$/i.test(surfaceForm)) return `本例句用「${surfaceForm}」，是「${lemma}」的過去分詞（當形容詞用），練習時以「${lemma}」為主。`;
  return `本例句用「${surfaceForm}」，是「${lemma}」的變化形，練習時以「${lemma}」為主。`;
}

// Merriam-Webster 官方字典 API（個人非商業用途免費，每天 1000 次）。
// 比 dictionaryapi.dev 這類無金鑰的免費服務穩定很多，缺點是回傳格式比較
// 複雜（巢狀的 sseq 結構＋自己的排版標記），下面兩個函式負責解析、清理。
// 兩本字典都查：Learner's Dictionary 是給英語學習者用的，例句比較生活化、
// 也直接附標準 IPA 音標，優先查這本；查不到才退回查 Collegiate Dictionary
// （比較學術正式，但涵蓋的字更多、更冷門的字也查得到）。
// 兩把 API 金鑰放在 Firebase Secret Manager（用 firebase functions:secrets:set
// 設定），不寫在程式碼裡——這個 repo 是公開的，寫在這裡等於把鑰匙貼在門上。
// 函式啟動時由平台注入，只有在 onCall 選項的 secrets 裡列出的函式拿得到。
const MW_LEARNERS_KEY = defineSecret("MW_LEARNERS_KEY");
const MW_COLLEGIATE_KEY = defineSecret("MW_COLLEGIATE_KEY");

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
    timeoutSeconds: 30,
    secrets: [MW_LEARNERS_KEY, MW_COLLEGIATE_KEY]
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

    // 回傳「全部」查到的字義物件（不是只回傳第一個），因為像 received 這種
    // 查詢字，MW 常常同時回傳好幾個條目（例如 received 本身當形容詞的用法、
    // 還有 receive 這個動詞原形），第一個條目不一定有附音標，但後面的條目
    // 可能有，所以查音標時要把每個條目都看過一輪
    async function fetchMwEntries(refPath, key) {
      try {
        const res = await fetch(`https://www.dictionaryapi.com/api/v3/references/${refPath}/json/${encodeURIComponent(query)}?key=${key}`);
        if (!res.ok) return [];
        const data = await res.json();
        // 字典查不到確切的字時，MW 回傳的是「拼字建議」字串陣列，不是真正的字義物件；
        // 只有陣列項目是物件（有 meta 欄位）才代表真的查到了
        return Array.isArray(data) ? data.filter(d => d && typeof d === "object" && d.meta) : [];
      } catch (err) {
        console.error(`lookupWord Merriam-Webster fetch error (${refPath})`, err);
        return [];
      }
    }
    // 音標可能放在 hwi.prs（一般發音），也可能放在 hwi.altprs（例如 received
    // 這種由動詞變化來的詞條，本身沒有 prs，只在 altprs 附了音標）
    function entryIpa(e) {
      const prs = (e.hwi && e.hwi.prs && e.hwi.prs[0]) || (e.hwi && e.hwi.altprs && e.hwi.altprs[0]);
      return prs && prs.ipa ? prs.ipa : "";
    }

    const learnersEntries = await fetchMwEntries("learners", MW_LEARNERS_KEY.value());
    let entry = learnersEntries[0] || null;
    let ipa = "";
    for (const e of learnersEntries) {
      ipa = entryIpa(e);
      if (ipa) break;
    }
    if (!entry) {
      const collegiateEntries = await fetchMwEntries("collegiate", MW_COLLEGIATE_KEY.value());
      entry = collegiateEntries[0] || null;
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

/* ------------------------------------------------------------------ */
/* 家長檢視：只有白名單裡的帳號能查看其他家人的學習進度摘要。用固定的     */
/* 白名單明確限制「誰能看誰」，不是開放任何登入者互看；資料透過 Admin    */
/* SDK 讀取（不受一般使用者只能讀自己文件的 Firestore 安全規則限制），   */
/* 但只回傳整理過的摘要數字，不會把對方完整的原始進度資料整包丟出去。    */
/* ------------------------------------------------------------------ */
const FAMILY_VIEW_MAP = {
  patricia910: ["patricia910", "vivi611", "polly1215", "alicia1003", "sam312", "michael1215"]
};

function usernameFromAuth(request) {
  const email = (request.auth && request.auth.token && request.auth.token.email) || "";
  return email.split("@")[0].toLowerCase();
}

exports.listViewableFamilyMembers = onCall(
  {
    region: "asia-east1",
    memory: "128MiB",
    timeoutSeconds: 10
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入");
    }
    const viewer = usernameFromAuth(request);
    return { viewable: FAMILY_VIEW_MAP[viewer] || [] };
  }
);

// 把某人 progress 文件的原始資料整理成給「家長檢視」畫面看的摘要數字，
// 欄位名稱都對應 index.html 裡 markStamp/recordWordResult/markWordLearned
// 實際寫入 Firestore 的資料結構
// 用 Asia/Taipei 時區算「今天」的日期字串（YYYY-MM-DD），不管 Cloud
// Function 執行主機本身在哪個時區（Google Cloud 預設是 UTC）。這裡的
// 格式要跟 index.html 裡 todayStr()（用使用者裝置本機時間算今天）完全
// 一致，兩邊才能正確比對是不是同一天。
function taiwanTodayStr() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function buildFamilyProgressSummary(data) {
  const stamps = data.stamps || {};
  const learnedWords = data.learnedWords || {};
  const mistakes = data.mistakes || {};

  // 「今天」的每日暫存資料（dailyStamps/dailyMistakes/dailyLearnedWords）
  // 只有在使用者的裝置重新打開 App 時才會被清空重置（ensureDailyReset）。
  // 如果他昨晚練習完就沒再打開過 App，家長現在查看時，這些欄位裡還留著
  // 「昨天」的資料，但沒有一起存「這份資料是哪一天的」——只有一個
  // dailyResetDate 欄位記錄「最後一次重置是哪一天」。用這個欄位跟台灣
  // 時區的今天比對，如果對不上，代表這些 daily 欄位其實是舊資料，
  // 今天實際上還沒有任何練習紀錄，不能直接拿來當「今天」的數字顯示。
  const isTodayFresh = data.dailyResetDate === taiwanTodayStr();
  const dailyStamps = isTodayFresh ? (data.dailyStamps || {}) : {};
  const dailyLearnedWords = isTodayFresh ? (data.dailyLearnedWords || {}) : {};
  const dailyMistakes = isTodayFresh ? (data.dailyMistakes || {}) : {};

  let todayActivitiesDone = 0;
  const todayActivityList = [];
  Object.entries(dailyStamps).forEach(([unitId, acts]) => {
    Object.entries(acts || {}).forEach(([activityKey, entry]) => {
      todayActivitiesDone++;
      todayActivityList.push({ unitId, activityKey, score: entry.lastScore || null, at: entry.lastAt || 0 });
    });
  });
  todayActivityList.sort((a, b) => b.at - a.at);

  // 「最近一次練習」要看永久紀錄（stamps），不能只看 dailyStamps——
  // dailyStamps 每天都會被清空，如果只看它，一旦跨過午夜、使用者還沒
  // 重新打開過 App，這裡就會變成「還沒有紀錄」，即使他昨晚才練習過。
  let lastActiveAt = 0;
  let totalActivitiesDone = 0;
  Object.values(stamps).forEach(acts => {
    Object.values(acts || {}).forEach(entry => {
      totalActivitiesDone++;
      const at = entry.lastAt || 0;
      if (at > lastActiveAt) lastActiveAt = at;
    });
  });

  const now = Date.now();
  const dueMistakeCount = Object.values(mistakes).filter(m => m.nextReview <= now).length;
  const todayMistakeList = Object.values(dailyMistakes)
    .sort((a, b) => (b.at || 0) - (a.at || 0))
    .slice(0, 15)
    .map(m => ({ en: m.en, zh: m.zh, pos: m.pos }));

  return {
    lastActiveAt: lastActiveAt || null,
    todayActivitiesDone,
    // 之前只回傳最近 10 筆，練習量比較大的日子（例如一天做了 20 項）會把
    // 比較早的紀錄截斷、看不到，改成整天都回傳，讓家長能看到完整一天的紀錄
    todayActivityList,
    todayWordsLearned: Object.keys(dailyLearnedWords).length,
    // 原始的「今天字卡跟讀完成」單字清單（key 格式是 unitId::en），
    // 前端已經有每個單元的完整單字表，交給前端依單元分組、算出
    // 「Part 1 已練習 n 個字／共 X 字」這種畫面，後端不用另外存一份
    // 課本內容資料
    todayLearnedWordKeys: Object.keys(dailyLearnedWords),
    todayMistakeCount: Object.keys(dailyMistakes).length,
    todayMistakeList,
    totalActivitiesDone,
    totalWordsLearnedOnce: Object.keys(learnedWords).length,
    totalMistakeCount: Object.keys(mistakes).length,
    dueMistakeCount,
    customWordCount: (data.customWords || []).length
  };
}

exports.getFamilyProgress = onCall(
  {
    region: "asia-east1",
    memory: "256MiB",
    timeoutSeconds: 15
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "請先登入");
    }
    const { username } = request.data || {};
    if (typeof username !== "string" || !username.trim()) {
      throw new HttpsError("invalid-argument", "缺少要查詢的帳號");
    }
    const target = username.trim().toLowerCase();
    const viewer = usernameFromAuth(request);
    const allowed = FAMILY_VIEW_MAP[viewer] || [];
    if (!allowed.includes(target)) {
      throw new HttpsError("permission-denied", "沒有權限查看這個帳號");
    }
    let targetUser;
    try {
      targetUser = await admin.auth().getUserByEmail(`${target}@word-island.app`);
    } catch (err) {
      throw new HttpsError("not-found", "找不到這個帳號");
    }
    const snap = await admin.firestore().collection("progress").doc(targetUser.uid).get();
    const summary = buildFamilyProgressSummary(snap.exists ? snap.data() : {});
    return { summary };
  }
);

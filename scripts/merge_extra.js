// 合併「額外例句 + 文法解釋」補充內容進 data/lessons.json
// 用法：node scripts/merge_extra.js <textbookId> <patchFile.json>
// patchFile 格式：[{ lessonId, units: [{ unitId, words: [{ en, ex2_en, ex2_zh, ex3_en, ex3_zh, grammar?, ex_grammar?, ex2_grammar?, ex3_grammar? }] }] }]
// grammar：單字本身的通則說明（不規則動詞、多詞性等），不論抽到哪組例句都會顯示。
// ex_grammar / ex2_grammar / ex3_grammar：只針對「該組例句」裡出現的搭配用法做說明
// （例如某句用到 spring break，就把說明寫在 ex2_grammar，只有抽到那句時才會出現）。
const fs = require('fs');
const path = require('path');

const [, , textbookId, patchFile] = process.argv;
if (!textbookId || !patchFile) {
  console.error('用法：node scripts/merge_extra.js <textbookId> <patchFile.json>');
  process.exit(1);
}

const dataPath = path.join(__dirname, '..', 'data', 'lessons.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchFile, 'utf8'));

const tb = data.textbooks.find(t => t.id === textbookId);
if (!tb) {
  console.error('找不到 textbook:', textbookId);
  process.exit(1);
}

let updated = 0;
let notFound = [];

for (const pLesson of patch) {
  const lesson = tb.lessons.find(l => l.id === pLesson.lessonId);
  if (!lesson) {
    notFound.push(`lesson ${pLesson.lessonId}`);
    continue;
  }
  for (const pUnit of pLesson.units) {
    const unit = lesson.units.find(u => u.id === pUnit.unitId);
    if (!unit) {
      notFound.push(`unit ${pUnit.unitId}`);
      continue;
    }
    for (const pWord of pUnit.words) {
      const word = unit.words.find(w => w.en === pWord.en);
      if (!word) {
        notFound.push(`word "${pWord.en}" in ${pUnit.unitId}`);
        continue;
      }
      if (pWord.ex2_en) word.ex2_en = pWord.ex2_en;
      if (pWord.ex2_zh) word.ex2_zh = pWord.ex2_zh;
      if (pWord.ex2_blank) word.ex2_blank = pWord.ex2_blank;
      if (pWord.ex3_en) word.ex3_en = pWord.ex3_en;
      if (pWord.ex3_zh) word.ex3_zh = pWord.ex3_zh;
      if (pWord.ex3_blank) word.ex3_blank = pWord.ex3_blank;
      if (pWord.grammar) word.grammar = pWord.grammar;
      if (pWord.ex_grammar) word.ex_grammar = pWord.ex_grammar;
      if (pWord.ex2_grammar) word.ex2_grammar = pWord.ex2_grammar;
      if (pWord.ex3_grammar) word.ex3_grammar = pWord.ex3_grammar;
      updated++;
    }
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated words:', updated);
if (notFound.length) {
  console.log('NOT FOUND (' + notFound.length + '):');
  notFound.forEach(n => console.log(' -', n));
}

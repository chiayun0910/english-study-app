// 合併「額外例句 + 文法解釋」補充內容進 data/lessons.json
// 用法：node scripts/merge_extra.js <textbookId> <patchFile.json>
// patchFile 格式：[{ lessonId, units: [{ unitId, words: [{ en, ex2_en, ex2_zh, ex3_en, ex3_zh, grammar? }] }] }]
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

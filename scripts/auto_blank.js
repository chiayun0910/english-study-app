// 自動幫 ex2_en / ex3_en 產生對應的挖空版本 (ex2_blank / ex3_blank)。
// 策略：依序嘗試「單字定義的所有型態（wordForms，包含 base / altform 的兩邊）」，
// 對每個型態再嘗試常見規則變化（原形、+s、+es、+ed、+d、+ing、去y+ies），
// 用最長、大小寫不敏感、有單字邊界(\b)的比對，找到後把整段換成 "____"。
// 找不到的單字會印出來，由人工補上正確的 ex2_blank/ex3_blank。
const fs = require('fs');
const path = require('path');

const [, , textbookId] = process.argv;
if (!textbookId) {
  console.error('用法：node scripts/auto_blank.js <textbookId>');
  process.exit(1);
}

const dataPath = path.join(__dirname, '..', 'data', 'lessons.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const tb = data.textbooks.find(t => t.id === textbookId);
if (!tb) {
  console.error('找不到 textbook:', textbookId);
  process.exit(1);
}

function wordForms(en) {
  return en.split(' / ').map(s => s.trim()).filter(Boolean);
}

function candidateForms(base) {
  const forms = new Set([base]);
  const lower = base.toLowerCase();
  // 只對「單一英文字」（不含空白）做規則變化猜測；片語不猜變化，只用原形比對
  if (!/\s/.test(base)) {
    forms.add(base + 's');
    forms.add(base + 'es');
    forms.add(base + 'ed');
    forms.add(base + 'd');
    forms.add(base + 'ing');
    if (/[^aeiou]y$/i.test(base)) {
      forms.add(base.slice(0, -1) + 'ies');
      forms.add(base.slice(0, -1) + 'ied');
    }
    if (/e$/i.test(base)) {
      forms.add(base.slice(0, -1) + 'ing');
    }
  }
  return [...forms];
}

function blankSentence(sentence, en) {
  const bases = wordForms(en);
  let allForms = [];
  for (const b of bases) allForms.push(...candidateForms(b));
  // 最長優先，避免短字先比對到（例如 "cat" 比對到 "category" 的一部分）
  allForms.sort((a, b) => b.length - a.length);
  for (const form of allForms) {
    const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\b' + escaped + '\\b', 'i');
    if (re.test(sentence)) {
      return sentence.replace(re, '____');
    }
  }
  return null;
}

let filled = 0;
let failed = [];

for (const lesson of tb.lessons) {
  for (const unit of lesson.units) {
    for (const word of unit.words) {
      if (word.ex2_en && !word.ex2_blank) {
        const blanked = blankSentence(word.ex2_en, word.en);
        if (blanked) {
          word.ex2_blank = blanked;
          filled++;
        } else {
          failed.push(`${unit.id} / "${word.en}" / ex2: ${word.ex2_en}`);
        }
      }
      if (word.ex3_en && !word.ex3_blank) {
        const blanked = blankSentence(word.ex3_en, word.en);
        if (blanked) {
          word.ex3_blank = blanked;
          filled++;
        } else {
          failed.push(`${unit.id} / "${word.en}" / ex3: ${word.ex3_en}`);
        }
      }
    }
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Auto-filled:', filled);
if (failed.length) {
  console.log('FAILED (' + failed.length + '), 需要人工補上 ex2_blank/ex3_blank:');
  failed.forEach(f => console.log(' -', f));
}

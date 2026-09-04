import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Star, Check, X, ArrowLeft, RotateCcw, Trophy, Home as HomeIcon, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* 內容資料：康軒八年級 3 課（U1~U3），依「第 n 課」分組，每課再分 4 個小節 */
/* 同形詞（如 report/far/above、middle n./adj.）合併為一筆單字            */
/* ------------------------------------------------------------------ */
const LESSONS = [
  {
    id: "lesson1",
    title: "第1課",
    zh: "天氣與自然 Weather & Nature",
    units: [
      {
        id: "u1-1",
        title: "Part 1",
        zh: "天氣與季節",
        color: "#E8604C",
        words: [
          { en: "season", pos: "n.", zh: "季節", ex_en: "My favorite season is autumn because of the cool weather.", ex_zh: "我最喜歡的季節是秋天，因為天氣涼爽。", ex_blank: "My favorite ____ is autumn because of the cool weather." },
          { en: "weather", pos: "n.", zh: "天氣", ex_en: "The weather in the mountains can change very quickly.", ex_zh: "山上的天氣變化非常快。", ex_blank: "The ____ in the mountains can change very quickly." },
          { en: "rainy", pos: "adj.", zh: "下雨的", ex_en: "I love to read a book at home on a rainy day.", ex_zh: "我喜歡在下雨天待在家裡看書。", ex_blank: "I love to read a book at home on a ____ day." },
          { en: "wet", pos: "adj.", zh: "溼的", ex_en: "My shoes are still wet from the morning rain.", ex_zh: "我的鞋子因為早上的雨還是溼的。", ex_blank: "My shoes are still ____ from the morning rain." },
          { en: "sunny", pos: "adj.", zh: "晴朗的", ex_en: "Let's have a picnic if it's a sunny weekend.", ex_zh: "如果週末天氣晴朗，我們就去野餐吧。", ex_blank: "Let's have a picnic if it's a ____ weekend." },
          { en: "cloudy", pos: "adj.", zh: "多雲的", ex_en: "It was cloudy this morning, but the sun came out later.", ex_zh: "今天早上多雲，但後來太陽出來了。", ex_blank: "It was ____ this morning, but the sun came out later." },
          { en: "windy", pos: "adj.", zh: "風大的", ex_en: "It's a bit windy today, so hold on to your hat.", ex_zh: "今天風有點大，扶好你的帽子。", ex_blank: "It's a bit ____ today, so hold on to your hat." },
          { en: "snowy", pos: "adj.", zh: "下雪的", ex_en: "We had a very snowy winter this year.", ex_zh: "我們今年冬天下了很多雪。", ex_blank: "We had a very ____ winter this year." },
          { en: "spring", pos: "n.", zh: "春天", ex_en: "Flowers start to bloom everywhere in the spring.", ex_zh: "春天時到處的花都開始綻放。", ex_blank: "Flowers start to bloom everywhere in the ____." },
          { en: "summer", pos: "n.", zh: "夏天", ex_en: "We often go swimming in the lake during the summer.", ex_zh: "我們夏天常常去湖裡游泳。", ex_blank: "We often go swimming in the lake during the ____." },
        ],
      },
      {
        id: "u1-2",
        title: "Part 2",
        zh: "感覺與周遭",
        color: "#3B6E8F",
        words: [
          { en: "autumn / fall", pos: "n.", zh: "秋天", ex_en: "The leaves on the trees turn red and yellow in autumn.", ex_zh: "秋天時樹上的葉子會變成紅色和黃色。", ex_blank: "The leaves on the trees turn red and yellow in ____." },
          { en: "winter", pos: "n.", zh: "冬天", ex_en: "Many animals sleep through the cold winter.", ex_zh: "許多動物會在寒冬中冬眠。", ex_blank: "Many animals sleep through the cold ____." },
          { en: "sky", pos: "n.", zh: "天空", ex_en: "The sky was full of bright stars last night.", ex_zh: "昨晚天空布滿了明亮的星星。", ex_blank: "The ____ was full of bright stars last night." },
          { en: "feel / felt", pos: "v.", zh: "感覺", ex_en: "She felt a little nervous before her big speech.", ex_zh: "她在重要演講前感到有點緊張。", ex_blank: "She ____ a little nervous before her big speech.", grammar: "feel 的過去式是 felt，feel + 形容詞 表示「感覺…」。" },
          { en: "air", pos: "n.", zh: "空氣", ex_en: "Let's open the window to get some fresh air.", ex_zh: "我們把窗戶打開，呼吸一些新鮮空氣吧。", ex_blank: "Let's open the window to get some fresh ____." },
          { en: "common", pos: "adj.", zh: "普遍的", ex_en: "It is common for students to feel tired on Monday mornings.", ex_zh: "學生在星期一早上感到疲累是很常見的。", ex_blank: "It is ____ for students to feel tired on Monday mornings." },
          { en: "dark", pos: "adj.", zh: "黑暗的；深色的", ex_en: "He has dark brown hair and blue eyes.", ex_zh: "他有深棕色的頭髮和藍色的眼睛。", ex_blank: "He has ____ brown hair and blue eyes." },
          { en: "forget / forgot", pos: "v.", zh: "忘記", ex_en: "Don't forget to lock the door when you leave.", ex_zh: "你離開時別忘了鎖門。", ex_blank: "Don't ____ to lock the door when you leave.", grammar: "forget 的過去式是 forgot，forget to V 表示「忘記要做」，forget Ving 表示「忘記做過」。" },
          { en: "umbrella", pos: "n.", zh: "雨傘", ex_en: "I think I left my umbrella on the bus.", ex_zh: "我想我把雨傘忘在公車上了。", ex_blank: "I think I left my ____ on the bus." },
        ],
      },
      {
        id: "u1-3",
        title: "Part 3",
        zh: "危險與解決",
        color: "#4CAF7D",
        words: [
          { en: "afraid", pos: "adj.", zh: "害怕的", ex_en: "My little brother is afraid of the dark.", ex_zh: "我弟弟怕黑。", ex_blank: "My little brother is ____ of the dark." },
          { en: "heavy", pos: "adj.", zh: "大量的；重的", ex_en: "The box was too heavy for me to lift.", ex_zh: "這個箱子太重了，我搬不動。", ex_blank: "The box was too ____ for me to lift." },
          { en: "shower", pos: "n.", zh: "陣雨；淋浴", ex_en: "I'll take a quick shower before we go out.", ex_zh: "我們出門前我會先快速淋個浴。", ex_blank: "I'll take a quick ____ before we go out." },
          { en: "report", pos: "n./v.", blankPos: "n.", zh: "報導；報告", ex_en: "The teacher asked us to write a book report.", ex_zh: "老師要我們寫一篇讀書報告。", ex_blank: "The teacher asked us to write a book ____.", grammar: "report 當名詞是「報告、報導」，當動詞是「報告、通報」，如 report to + 人。" },
          { en: "sea level", pos: "n.", zh: "海平面", ex_en: "This city is located 10 meters below sea level.", ex_zh: "這座城市位於海平面下10公尺。", ex_blank: "This city is located 10 meters below ____." },
          { en: "danger", pos: "n.", zh: "危險", ex_en: "Driving too fast puts everyone in danger.", ex_zh: "開車太快會讓大家陷入危險。", ex_blank: "Driving too fast puts everyone in ____." },
          { en: "fix", pos: "v.", zh: "解決(問題)；修理", ex_en: "Can you help me fix my broken computer?", ex_zh: "你可以幫我修好壞掉的電腦嗎？", ex_blank: "Can you help me ____ my broken computer?" },
          { en: "build / built", pos: "v.", zh: "建造", ex_en: "They plan to build a new bridge over the river.", ex_zh: "他們計畫在河上建造一座新橋。", ex_blank: "They plan to ____ a new bridge over the river.", grammar: "build 的過去式是 built。" },
          { en: "far", pos: "adv./adj.", blankPos: "adv.", zh: "遙遠地；遙遠的", ex_en: "How far is the station from here?", ex_zh: "車站離這裡有多遠？", ex_blank: "How ____ is the station from here?", grammar: "far 當副詞修飾動詞或距離，如 How far…?；當形容詞直接修飾名詞，如 a far country。" },
        ],
      },
      {
        id: "u1-4",
        title: "Part 4",
        zh: "自然與保護",
        color: "#B07CC6",
        words: [
          { en: "fisherman", pos: "n.", zh: "漁夫", ex_en: "The old fisherman went out to sea early every morning.", ex_zh: "這位老漁夫每天一大早就出海。", ex_blank: "The old ____ went out to sea early every morning." },
          { en: "become / became", pos: "v.", zh: "變成", ex_en: "The little caterpillar will soon become a beautiful butterfly.", ex_zh: "這隻小毛毛蟲很快就會變成美麗的蝴蝶。", ex_blank: "The little caterpillar will soon ____ a beautiful butterfly.", grammar: "become 的過去式是 became，後面直接接名詞或形容詞，不加 to。" },
          { en: "cry", pos: "v.", zh: "哭泣", ex_en: "The sad movie made me want to cry.", ex_zh: "這部悲傷的電影讓我想哭。", ex_blank: "The sad movie made me want to ____." },
          { en: "live", pos: "v.", zh: "生活；居住", ex_en: "Where do your grandparents live?", ex_zh: "你的祖父母住在哪裡？", ex_blank: "Where do your grandparents ____?" },
          { en: "safe", pos: "adj.", zh: "安全的", ex_en: "Please keep your money in a safe place.", ex_zh: "請把你的錢放在安全的地方。", ex_blank: "Please keep your money in a ____ place." },
          { en: "protect", pos: "v.", zh: "保護", ex_en: "A good coat will protect you from the cold wind.", ex_zh: "一件好外套能保護你免受寒風侵襲。", ex_blank: "A good coat will ____ you from the cold wind." },
          { en: "nature", pos: "n.", zh: "大自然", ex_en: "We went for a long walk to enjoy nature.", ex_zh: "我們去散了很久的步，享受大自然。", ex_blank: "We went for a long walk to enjoy ____." },
          { en: "above", pos: "adv./prep.", blankPos: "adv.", zh: "在上面；在……上面", ex_en: "The birds were flying high above in the sky.", ex_zh: "鳥兒在天空高高地飛翔。", ex_blank: "The birds were flying high ____ in the sky.", grammar: "above 當副詞單獨使用表示「在上方」；當介系詞後面要接名詞，如 above the line。" },
          { en: "lead to / led to", pos: "phr.", zh: "導致", ex_en: "The heavy rain led to serious floods in the city.", ex_zh: "豪雨導致這座城市發生嚴重水災。", ex_blank: "The heavy rain ____ serious floods in the city.", grammar: "lead to 的過去式是 led to，後面接原因造成的結果，相當於 cause。" },
        ],
      },
    ],
  },
  {
    id: "lesson2",
    title: "第2課",
    zh: "身體與健康 Body & Health",
    units: [
      {
        id: "u2-1",
        title: "Part 1",
        zh: "身體部位",
        color: "#E8604C",
        words: [
          { en: "head", pos: "n.", zh: "頭", ex_en: "He nodded his head to show that he agreed.", ex_zh: "他點頭表示同意。", ex_blank: "He nodded his ____ to show that he agreed." },
          { en: "hair", pos: "n.", zh: "頭髮", ex_en: "My sister has long, black hair.", ex_zh: "我妹妹有一頭又長又黑的頭髮。", ex_blank: "My sister has long, black ____." },
          { en: "shoulder", pos: "n.", zh: "肩膀", ex_en: "He carried the heavy bag over his shoulder.", ex_zh: "他把沉重的包包扛在肩上。", ex_blank: "He carried the heavy bag over his ____." },
          { en: "stomach", pos: "n.", zh: "肚子；胃", ex_en: "I ate too much, and now my stomach hurts.", ex_zh: "我吃太多了，現在肚子好痛。", ex_blank: "I ate too much, and now my ____ hurts." },
          { en: "arm", pos: "n.", zh: "手臂", ex_en: "She broke her arm when she fell off the bike.", ex_zh: "她騎腳踏車摔倒時摔斷了手臂。", ex_blank: "She broke her ____ when she fell off the bike." },
          { en: "hand", pos: "n.", zh: "手", ex_en: "Please raise your hand if you have a question.", ex_zh: "如果有問題請舉手。", ex_blank: "Please raise your ____ if you have a question." },
          { en: "knee", pos: "n.", zh: "膝蓋", ex_en: "He got a scrape on his knee from playing outside.", ex_zh: "他在外面玩耍時膝蓋擦傷了。", ex_blank: "He got a scrape on his ____ from playing outside." },
          { en: "leg", pos: "n.", zh: "腿", ex_en: "The table has one broken leg.", ex_zh: "這張桌子有一隻腳斷了。", ex_blank: "The table has one broken ____." },
          { en: "toe", pos: "n.", zh: "腳趾", ex_en: "I accidentally hit my toe on the table corner.", ex_zh: "我不小心把腳趾撞到桌角。", ex_blank: "I accidentally hit my ____ on the table corner." },
          { en: "neck", pos: "n.", zh: "脖子", ex_en: "She wore a beautiful scarf around her neck.", ex_zh: "她的脖子上圍了一條漂亮的圍巾。", ex_blank: "She wore a beautiful scarf around her ____." },
        ],
      },
      {
        id: "u2-2",
        title: "Part 2",
        zh: "生病與看醫生",
        color: "#3B6E8F",
        words: [
          { en: "catch / caught a cold", pos: "phr.", zh: "感冒", ex_en: "I think I caught a cold from my little sister.", ex_zh: "我想我是被我妹妹傳染感冒了。", ex_blank: "I think I ____ from my little sister.", grammar: "catch a cold 的過去式是 caught a cold，表示「感冒了」這個動作。" },
          { en: "fever", pos: "n.", zh: "發燒", ex_en: "The child has a high fever and needs to see a doctor.", ex_zh: "這孩子發高燒，需要看醫生。", ex_blank: "The child has a high ____ and needs to see a doctor." },
          { en: "headache", pos: "n.", zh: "頭痛", ex_en: "I often get a headache when I'm tired.", ex_zh: "我累的時候常常會頭痛。", ex_blank: "I often get a ____ when I'm tired." },
          { en: "sore throat", pos: "n.", zh: "喉嚨痛", ex_en: "Drinking warm water can help a sore throat.", ex_zh: "喝溫水有助於舒緩喉嚨痛。", ex_blank: "Drinking warm water can help a ____." },
          { en: "sick", pos: "adj.", zh: "生病的", ex_en: "My cat was sick yesterday, but she is better now.", ex_zh: "我的貓昨天生病了，但現在好多了。", ex_blank: "My cat was ____ yesterday, but she is better now." },
          { en: "medicine", pos: "n.", zh: "藥", ex_en: "Don't forget to take your medicine after the meal.", ex_zh: "別忘了飯後吃藥。", ex_blank: "Don't forget to take your ____ after the meal." },
          { en: "treat", pos: "v.", zh: "治療；對待", ex_en: "The doctor is trying to treat his illness.", ex_zh: "醫生正試著治療他的病。", ex_blank: "The doctor is trying to ____ his illness." },
          { en: "hurt", pos: "v./adj.", blankPos: "adj.", zh: "疼痛；受傷的", ex_en: "My arm is hurt and I can't write.", ex_zh: "我的手臂受傷了，沒辦法寫字。", ex_blank: "My arm is ____ and I can't write.", grammar: "hurt 的現在式、過去式、過去分詞同形（hurt-hurt-hurt）；當形容詞常搭配 be 動詞，表示「受傷的」。" },
          { en: "stay", pos: "v./n.", blankPos: "v.", zh: "停留", ex_en: "Can you stay for dinner tonight?", ex_zh: "你今晚可以留下來吃晚餐嗎？", ex_blank: "Can you ____ for dinner tonight?", grammar: "stay 當動詞是「停留、留下」；當名詞表示「停留（的時間）」。" },
          { en: "mask", pos: "n.", zh: "口罩；面具", ex_en: "You should wear a mask on the train.", ex_zh: "你在火車上應該戴口罩。", ex_blank: "You should wear a ____ on the train." },
          { en: "call", pos: "v./n.", blankPos: "v.", zh: "打電話；呼喊", ex_en: "I will call you back in five minutes.", ex_zh: "我五分鐘後會回電給你。", ex_blank: "I will ____ you back in five minutes.", grammar: "call 當動詞是「打電話、呼喊」；當名詞表示「一通電話、呼喊聲」。" },
        ],
      },
      {
        id: "u2-3",
        title: "Part 3",
        zh: "溝通與說明",
        color: "#4CAF7D",
        words: [
          { en: "speak / spoke", pos: "v.", zh: "說話；講", ex_en: "He spoke to the manager about the problem.", ex_zh: "他向經理談了這個問題。", ex_blank: "He ____ to the manager about the problem.", grammar: "speak 的過去式是 spoke，speak to/with + 人 表示「和某人說話」。" },
          { en: "send / sent", pos: "v.", zh: "寄；送", ex_en: "Have you sent the email to Mr. Wang yet?", ex_zh: "你把電子郵件寄給王先生了嗎？", ex_blank: "Have you ____ the email to Mr. Wang yet?", grammar: "send 的過去式是 sent，send + 物 + to + 人 表示「把…寄給…」。" },
          { en: "message", pos: "n.", zh: "訊息", ex_en: "I'll leave a message for him on his desk.", ex_zh: "我會把訊息留在他的桌上。", ex_blank: "I'll leave a ____ for him on his desk." },
          { en: "why", pos: "adv.", zh: "為什麼", ex_en: "Can you tell me why you were late?", ex_zh: "你可以告訴我你為什麼遲到嗎？", ex_blank: "Can you tell me ____ you were late?" },
          { en: "because", pos: "conj.", zh: "因為", ex_en: "She was happy because she passed the exam.", ex_zh: "她因為通過考試而感到開心。", ex_blank: "She was happy ____ she passed the exam." },
          { en: "so", pos: "conj.", zh: "所以", ex_en: "It started to rain, so we went inside.", ex_zh: "開始下雨了，所以我們就進去了。", ex_blank: "It started to rain, ____ we went inside." },
          { en: "as", pos: "prep.", zh: "如同", ex_en: "He works as a waiter in that restaurant.", ex_zh: "他在那間餐廳當服務生。", ex_blank: "He works ____ a waiter in that restaurant." },
          { en: "as for", pos: "phr.", zh: "至於", ex_en: "I'm ready to go. As for Tom, I'm not sure.", ex_zh: "我準備好要走了。至於湯姆，我還不確定。", ex_blank: "I'm ready to go. ____ Tom, I'm not sure.", grammar: "as for + 名詞，用來轉換話題，表示「至於…」。" },
          { en: "country", pos: "n.", zh: "國家；鄉間", ex_en: "Japan is a beautiful country to visit in the spring.", ex_zh: "日本是春天很適合造訪的美麗國家。", ex_blank: "Japan is a beautiful ____ to visit in the spring." },
          { en: "serious", pos: "adj.", zh: "嚴重的；認真的", ex_en: "Pollution is a serious problem in many big cities.", ex_zh: "污染在許多大城市是個嚴重的問題。", ex_blank: "Pollution is a ____ problem in many big cities." },
          { en: "health", pos: "n.", zh: "健康", ex_en: "Eating fruits and vegetables is good for your health.", ex_zh: "吃水果和蔬菜對健康有益。", ex_blank: "Eating fruits and vegetables is good for your ____." },
        ],
      },
      {
        id: "u2-4",
        title: "Part 4",
        zh: "生活與其他",
        color: "#B07CC6",
        words: [
          { en: "ice cream", pos: "n.", zh: "冰淇淋", ex_en: "What's your favorite flavor of ice cream?", ex_zh: "你最喜歡的冰淇淋口味是什麼？", ex_blank: "What's your favorite flavor of ____?" },
          { en: "too bad", pos: "phr.", zh: "太糟了", ex_en: "It's too bad you can't come to the party.", ex_zh: "你不能來派對真是太可惜了。", ex_blank: "It's ____ you can't come to the party.", grammar: "It's too bad (that) + 子句，用來表示同情或惋惜，口語上常省略 It's。" },
          { en: "coat", pos: "n.", zh: "大衣", ex_en: "You should wear a warm coat because it's cold outside.", ex_zh: "外面很冷，你應該穿件保暖的大衣。", ex_blank: "You should wear a warm ____ because it's cold outside." },
          { en: "healthy", pos: "adj.", zh: "健康的", ex_en: "A healthy diet includes lots of different foods.", ex_zh: "健康的飲食包含許多不同的食物。", ex_blank: "A ____ diet includes lots of different foods." },
          { en: "body", pos: "n.", zh: "身體", ex_en: "Exercise is important for a strong body.", ex_zh: "運動對強健的身體很重要。", ex_blank: "Exercise is important for a strong ____." },
          { en: "clothes", pos: "n.", zh: "衣服", ex_en: "I need to buy some new clothes for the new season.", ex_zh: "我需要為新的季節買一些新衣服。", ex_blank: "I need to buy some new ____ for the new season." },
          { en: "strong", pos: "adj.", zh: "強壯的；堅固的", ex_en: "He is strong enough to lift that heavy box.", ex_zh: "他強壯到可以舉起那個重箱子。", ex_blank: "He is ____ enough to lift that heavy box." },
          { en: "maybe", pos: "adv.", zh: "也許", ex_en: "Maybe we can go to the movies this weekend.", ex_zh: "也許我們這個週末可以去看電影。", ex_blank: "____ we can go to the movies this weekend." },
          { en: "try", pos: "v./n.", blankPos: "v.", zh: "嘗試", ex_en: "You should try this cake; it's very delicious.", ex_zh: "你應該試試這個蛋糕，非常好吃。", ex_blank: "You should ____ this cake; it's very delicious.", grammar: "try 當動詞是「嘗試」，後接 to V 或 Ving；當名詞表示「一次嘗試」。" },
          { en: "put on", pos: "phr.", zh: "穿上", ex_en: "Please put on your shoes before you go out.", ex_zh: "出門前請穿上你的鞋子。", ex_blank: "Please ____ your shoes before you go out.", grammar: "put on 表示穿上的動作，wear 則表示穿著的狀態。" },
        ],
      },
    ],
  },
  {
    id: "lesson3",
    title: "第3課",
    zh: "動物與生活 Animals & Daily Life",
    units: [
      {
        id: "u3-1",
        title: "Part 1",
        zh: "動物與地圖",
        color: "#E8604C",
        words: [
          { en: "chicken", pos: "n.", zh: "雞；雞肉", ex_en: "My mom is cooking chicken soup for dinner.", ex_zh: "我媽媽正在煮雞湯當晚餐。", ex_blank: "My mom is cooking ____ soup for dinner." },
          { en: "ant", pos: "n.", zh: "螞蟻", ex_en: "A tiny ant is crawling on the table.", ex_zh: "一隻小螞蟻正在桌上爬。", ex_blank: "A tiny ____ is crawling on the table." },
          { en: "ugly", pos: "adj.", zh: "醜陋的", ex_en: "The story is about an ugly duckling that becomes a swan.", ex_zh: "這個故事是在講一隻變成天鵝的醜小鴨。", ex_blank: "The story is about an ____ duckling that becomes a swan." },
          { en: "duck", pos: "n.", zh: "鴨子", ex_en: "A mother duck is swimming with her babies in the pond.", ex_zh: "一隻母鴨正帶著牠的寶寶們在池塘裡游泳。", ex_blank: "A mother ____ is swimming with her babies in the pond." },
          { en: "goose", pos: "n.", zh: "鵝(複數 geese)", ex_en: "The farmer has a big white goose on his farm.", ex_zh: "這位農夫的農場裡有一隻很大的白鵝。", ex_blank: "The farmer has a big white ____ on his farm." },
          { en: "frog", pos: "n.", zh: "青蛙", ex_en: "You can hear the sound of a frog near the river at night.", ex_zh: "晚上你可以在河邊聽到青蛙的叫聲。", ex_blank: "You can hear the sound of a ____ near the river at night." },
          { en: "cow", pos: "n.", zh: "母牛", ex_en: "The black and white cow is eating grass in the field.", ex_zh: "那隻黑白相間的母牛正在田裡吃草。", ex_blank: "The black and white ____ is eating grass in the field." },
          { en: "map", pos: "n.", zh: "地圖", ex_en: "Let's look at the map to find the shortest way.", ex_zh: "我們來看地圖找出最短的路。", ex_blank: "Let's look at the ____ to find the shortest way." },
          { en: "beginning", pos: "n.", zh: "開頭", ex_en: "The beginning of the movie was a little slow.", ex_zh: "這部電影的開頭有點慢。", ex_blank: "The ____ of the movie was a little slow." },
          { en: "middle", pos: "n./adj.", blankPos: "n.", zh: "中間；中間的", ex_en: "He was standing in the middle of the room.", ex_zh: "他站在房間的中間。", ex_blank: "He was standing in the ____ of the room.", grammar: "middle 當名詞常用 in the middle of + N；當形容詞直接修飾名詞，如 the middle child。" },
        ],
      },
      {
        id: "u3-2",
        title: "Part 2",
        zh: "森林與物品",
        color: "#3B6E8F",
        words: [
          { en: "quarter", pos: "n.", zh: "十五分鐘；四分之一", ex_en: "I only ate a quarter of the pizza.", ex_zh: "我只吃了四分之一的披薩。", ex_blank: "I only ate a ____ of the pizza." },
          { en: "along", pos: "prep.", zh: "沿著", ex_en: "We walked along the beach and watched the sunset.", ex_zh: "我們沿著海灘散步，看著夕陽。", ex_blank: "We walked ____ the beach and watched the sunset." },
          { en: "clear", pos: "adj.", zh: "晴朗的；清楚的", ex_en: "The water in the lake is so clear you can see the fish.", ex_zh: "湖水非常清澈，可以看見裡面的魚。", ex_blank: "The water in the lake is so ____ you can see the fish." },
          { en: "pass", pos: "v.", zh: "經過；通過", ex_en: "A car tried to pass us on the narrow road.", ex_zh: "一輛車試圖在窄路上超越我們。", ex_blank: "A car tried to ____ us on the narrow road." },
          { en: "forest", pos: "n.", zh: "森林", ex_en: "It's easy to get lost in the dark forest.", ex_zh: "在黑暗的森林裡很容易迷路。", ex_blank: "It's easy to get lost in the dark ____." },
          { en: "dry", pos: "adj./v.", blankPos: "v.", zh: "乾燥的；(使)變乾", ex_en: "Please help me dry the dishes after dinner.", ex_zh: "晚餐後請幫我把碗盤擦乾。", ex_blank: "Please help me ____ the dishes after dinner.", grammar: "dry 當形容詞是「乾燥的」；當動詞是「把…弄乾、變乾」。" },
          { en: "something", pos: "pron.", zh: "某物；某事", ex_en: "There is something strange in that box.", ex_zh: "那個箱子裡有些奇怪的東西。", ex_blank: "There is ____ strange in that box." },
          { en: "jar", pos: "n.", zh: "罐子", ex_en: "She keeps her cookies in a big glass jar.", ex_zh: "她把餅乾放在一個大玻璃罐裡。", ex_blank: "She keeps her cookies in a big glass ____." },
          { en: "beak", pos: "n.", zh: "鳥嘴", ex_en: "The parrot has a strong beak for cracking nuts.", ex_zh: "這隻鸚鵡有一個強壯的鳥嘴可以敲開堅果。", ex_blank: "The parrot has a strong ____ for cracking nuts." },
          { en: "reach", pos: "v.", zh: "達到；伸出手臂(拿)", ex_en: "I can't reach the book on the top shelf.", ex_zh: "我搆不到最上層架子上的書。", ex_blank: "I can't ____ the book on the top shelf." },
        ],
      },
      {
        id: "u3-3",
        title: "Part 3",
        zh: "動作與方向",
        color: "#4CAF7D",
        words: [
          { en: "rock", pos: "n./v.", blankPos: "n.", zh: "岩石；搖動", ex_en: "He sat on a large rock by the river.", ex_zh: "他坐在河邊一顆大岩石上。", ex_blank: "He sat on a large ____ by the river.", grammar: "rock 當名詞是「岩石」；當動詞是「搖動」。" },
          { en: "fly / flew", pos: "v.", zh: "飛行；駕駛(飛機)", ex_en: "The birds flew south for the winter.", ex_zh: "鳥兒們飛往南方過冬。", ex_blank: "The birds ____ south for the winter.", grammar: "fly 的過去式是 flew。" },
          { en: "pick up", pos: "phr.", zh: "撿起", ex_en: "Can you pick up that pen from the floor?", ex_zh: "你可以把地上那支筆撿起來嗎？", ex_blank: "Can you ____ that pen from the floor?", grammar: "pick up 表示「撿起、拿起」，也可表示「接送某人」。" },
          { en: "back", pos: "adv./n./adj.", blankPos: "adv.", zh: "回原處；後面(的)", ex_en: "She is going back to her hometown for the holidays.", ex_zh: "她要回家鄉過節了。", ex_blank: "She is going ____ to her hometown for the holidays.", grammar: "back 當副詞是「回原處」，如 go back；當名詞或形容詞則表示「後面(的)」。" },
          { en: "drop", pos: "v.", zh: "丟下；落下", ex_en: "Be careful not to drop the glass.", ex_zh: "小心別把玻璃杯摔了。", ex_blank: "Be careful not to ____ the glass." },
          { en: "into", pos: "prep.", zh: "到……裡面；進入", ex_en: "He jumped into the swimming pool.", ex_zh: "他跳進了游泳池。", ex_blank: "He jumped ____ the swimming pool." },
          { en: "Good job!", pos: "phr.", zh: "做得好!", ex_en: "You finished all your homework. Good job!", ex_zh: "你把作業都寫完了，做得好！", ex_blank: "You finished all your homework. ____", grammar: "Good job! 用來稱讚別人做得好，是常用的口語鼓勵語。" },
          { en: "be proud of", pos: "phr.", zh: "以……為榮", ex_en: "Your parents must be very proud of you.", ex_zh: "你的父母一定以你為榮。", ex_blank: "Your parents must be very ____ you.", grammar: "be proud of + 人/事，表示「以…為榮」。" },
          { en: "back and forth", pos: "phr.", zh: "來回地", ex_en: "The lion walked back and forth in its cage.", ex_zh: "那隻獅子在籠子裡來回踱步。", ex_blank: "The lion walked ____ in its cage.", grammar: "back and forth 表示「來回地」，常放在動詞後面修飾動作。" },
          { en: "finally", pos: "adv.", zh: "最後", ex_en: "After a long wait, the bus finally arrived.", ex_zh: "經過一段長時間的等待，公車終於到了。", ex_blank: "After a long wait, the bus ____ arrived." },
        ],
      },
      {
        id: "u3-4",
        title: "Part 4",
        zh: "情緒與時間",
        color: "#B07CC6",
        words: [
          { en: "top", pos: "n./adj.", blankPos: "n.", zh: "頂端；最好的", ex_en: "We climbed to the top of the hill.", ex_zh: "我們爬到了山頂。", ex_blank: "We climbed to the ____ of the hill.", grammar: "top 當名詞是「頂端」；當形容詞是「最好的、頂尖的」。" },
          { en: "past", pos: "prep./n.", blankPos: "prep.", zh: "經過；過去", ex_en: "The library is just past the police station.", ex_zh: "圖書館就在警察局過去一點的地方。", ex_blank: "The library is just ____ the police station.", grammar: "past 當介系詞是「經過」，後面接地點；當名詞是「過去」。" },
          { en: "finish", pos: "v.", zh: "完成；結束", ex_en: "What time do you finish work today?", ex_zh: "你今天幾點下班？", ex_blank: "What time do you ____ work today?" },
          { en: "anything", pos: "pron.", zh: "任何事物", ex_en: "Do you need anything from the store?", ex_zh: "你需要從商店買什麼東西嗎？", ex_blank: "Do you need ____ from the store?" },
          { en: "shout", pos: "v.", zh: "喊叫", ex_en: "There's no need to shout, I can hear you clearly.", ex_zh: "不需要大喊，我聽得很清楚。", ex_blank: "There's no need to ____, I can hear you clearly." },
          { en: "joy", pos: "n.", zh: "喜悅", ex_en: "Her face was full of joy when she saw the gift.", ex_zh: "她看到禮物時臉上充滿喜悅。", ex_blank: "Her face was full of ____ when she saw the gift." },
          { en: "pool", pos: "n.", zh: "水池；游泳池", ex_en: "The kids are playing in the swimming pool.", ex_zh: "孩子們正在游泳池裡玩耍。", ex_blank: "The kids are playing in the swimming ____." },
          { en: "when", pos: "conj.", zh: "當……時", ex_en: "I was reading a book when the phone rang.", ex_zh: "電話響起時我正在看書。", ex_blank: "I was reading a book ____ the phone rang." },
          { en: "close", pos: "adv.", zh: "接近地", ex_en: "Don't stand so close to the fire.", ex_zh: "別站得離火那麼近。", ex_blank: "Don't stand so ____ to the fire." },
        ],
      },
    ],
  },
  {
    id: "lesson4",
    title: "第4課",
    zh: "職業與才藝 Jobs & Talents",
    units: [
      {
        id: "u4-1",
        title: "Part 1",
        zh: "職業",
        color: "#E8604C",
        words: [
          { en: "waiter", pos: "n.", zh: "男服務生", ex_en: "The waiter took our order and brought us water.", ex_zh: "服務生幫我們點餐並端水過來。", ex_blank: "The ____ took our order and brought us water." },
          { en: "waitress", pos: "n.", zh: "女服務生", ex_en: "The waitress recommended the special dish of the day.", ex_zh: "女服務生推薦了今日特餐。", ex_blank: "The ____ recommended the special dish of the day." },
          { en: "housewife", pos: "n.", zh: "家庭主婦", ex_en: "My aunt is a housewife and a great cook.", ex_zh: "我阿姨是家庭主婦，也很會做菜。", ex_blank: "My aunt is a ____ and a great cook." },
          { en: "mailman / mail carrier", pos: "n.", zh: "郵差", ex_en: "The mailman usually comes around 10 a.m.", ex_zh: "郵差通常在早上十點左右來。", ex_blank: "The ____ usually comes around 10 a.m." },
          { en: "police officer", pos: "n.", zh: "警察", ex_en: "A police officer is directing traffic on the busy street.", ex_zh: "一位警察正在繁忙的街上指揮交通。", ex_blank: "A ____ is directing traffic on the busy street." },
          { en: "secretary", pos: "n.", zh: "祕書", ex_en: "The secretary is busy answering phone calls.", ex_zh: "秘書正忙著接電話。", ex_blank: "The ____ is busy answering phone calls." },
          { en: "factory worker", pos: "n.", zh: "工廠工人", ex_en: "He has been a factory worker for over twenty years.", ex_zh: "他當工廠工人已經超過二十年了。", ex_blank: "He has been a ____ for over twenty years." },
          { en: "actor", pos: "n.", zh: "男演員", ex_en: "He is a famous actor in Hollywood.", ex_zh: "他是好萊塢知名的男演員。", ex_blank: "He is a famous ____ in Hollywood." },
          { en: "actress", pos: "n.", zh: "女演員", ex_en: "That young actress won an award for her new movie.", ex_zh: "那位年輕女演員以新片獲獎。", ex_blank: "That young ____ won an award for her new movie." },
          { en: "reporter", pos: "n.", zh: "記者", ex_en: "A reporter from the local newspaper interviewed the mayor.", ex_zh: "當地報社的一名記者採訪了市長。", ex_blank: "A ____ from the local newspaper interviewed the mayor." },
        ],
      },
      {
        id: "u4-2",
        title: "Part 2",
        zh: "才藝與媒體",
        color: "#3B6E8F",
        words: [
          { en: "singer", pos: "n.", zh: "歌手", ex_en: "She has a beautiful voice and wants to be a singer.", ex_zh: "她嗓音優美，想成為歌手。", ex_blank: "She has a beautiful voice and wants to be a ____." },
          { en: "writer", pos: "n.", zh: "作家；作者", ex_en: "My favorite writer just published a new book.", ex_zh: "我最喜歡的作家剛出了一本新書。", ex_blank: "My favorite ____ just published a new book." },
          { en: "music", pos: "n.", zh: "音樂", ex_en: "What kind of music do you like to listen to?", ex_zh: "你喜歡聽什麼樣的音樂？", ex_blank: "What kind of ____ do you like to listen to?" },
          { en: "guitar", pos: "n.", zh: "吉他", ex_en: "He is learning to play the electric guitar.", ex_zh: "他正在學彈電吉他。", ex_blank: "He is learning to play the electric ____." },
          { en: "drum", pos: "n.", zh: "鼓", ex_en: "The beat of the drum made everyone want to dance.", ex_zh: "鼓的節奏讓大家都想跳舞。", ex_blank: "The beat of the ____ made everyone want to dance." },
          { en: "future", pos: "n.", zh: "未來", ex_en: "What are your plans for the future?", ex_zh: "你對未來有什麼計畫？", ex_blank: "What are your plans for the ____?" },
          { en: "interesting", pos: "adj.", zh: "有趣的", ex_en: "I read a very interesting article this morning.", ex_zh: "我今天早上讀了一篇很有趣的文章。", ex_blank: "I read a very ____ article this morning." },
          { en: "camera", pos: "n.", zh: "攝影機；相機", ex_en: "This new camera takes amazing pictures.", ex_zh: "這台新相機拍出來的照片很棒。", ex_blank: "This new ____ takes amazing pictures." },
          { en: "important", pos: "adj.", zh: "重要的", ex_en: "It is important to get enough sleep every night.", ex_zh: "每晚睡眠充足很重要。", ex_blank: "It is ____ to get enough sleep every night." },
          { en: "popular", pos: "adj.", zh: "受歡迎的", ex_en: "This song is very popular among young people.", ex_zh: "這首歌在年輕人之間很受歡迎。", ex_blank: "This song is very ____ among young people." },
        ],
      },
      {
        id: "u4-3",
        title: "Part 3",
        zh: "夢想與情緒",
        color: "#4CAF7D",
        words: [
          { en: "gift", pos: "n.", zh: "天分；禮物", ex_en: "I need to buy a birthday gift for my friend.", ex_zh: "我需要買一份生日禮物給朋友。", ex_blank: "I need to buy a birthday ____ for my friend." },
          { en: "tell / told", pos: "v.", zh: "講；告訴", ex_en: "He told me a funny story about his dog.", ex_zh: "他告訴我一個關於他的狗的有趣故事。", ex_blank: "He ____ me a funny story about his dog.", grammar: "tell 的過去式是 told，常接雙受詞：tell + 人 + 事。" },
          { en: "funny", pos: "adj.", zh: "好笑的；滑稽的", ex_en: "My dad always tells funny jokes at dinner.", ex_zh: "我爸爸吃晚餐時總是講好笑的笑話。", ex_blank: "My dad always tells ____ jokes at dinner." },
          { en: "plan", pos: "v./n.", blankPos: "v.", zh: "計畫", ex_en: "We need to plan our trip carefully.", ex_zh: "我們需要仔細規劃這趟旅行。", ex_blank: "We need to ____ our trip carefully.", grammar: "plan 可當動詞（計畫）或名詞（計畫、方案），要看句子結構判斷詞性。" },
          { en: "star", pos: "n.", zh: "明星；星星", ex_en: "She hopes to become a famous movie star one day.", ex_zh: "她希望有一天能成為知名電影明星。", ex_blank: "She hopes to become a famous movie ____ one day." },
          { en: "without", pos: "prep.", zh: "沒有", ex_en: "I can't drink coffee without sugar.", ex_zh: "我不能喝沒有加糖的咖啡。", ex_blank: "I can't drink coffee ____ sugar." },
          { en: "dream", pos: "n./v.", blankPos: "n.", zh: "夢(想)；夢見", ex_en: "My dream is to travel around the world.", ex_zh: "我的夢想是環遊世界。", ex_blank: "My ____ is to travel around the world.", grammar: "dream 當名詞是「夢想」，當動詞是「做夢」，如 dream about/of + Ving。" },
          { en: "teenager", pos: "n.", zh: "青少年", ex_en: "Being a teenager can be both exciting and difficult.", ex_zh: "當青少年既刺激又充滿挑戰。", ex_blank: "Being a ____ can be both exciting and difficult." },
          { en: "exciting", pos: "adj.", zh: "刺激的；令人興奮的", ex_en: "The final part of the game was very exciting.", ex_zh: "比賽的最後階段非常刺激。", ex_blank: "The final part of the game was very ____." },
          { en: "fight / fought", pos: "v.", zh: "對抗；打架", ex_en: "The two brothers always fight over small things.", ex_zh: "這對兄弟總是為了小事打架。", ex_blank: "The two brothers always ____ over small things.", grammar: "fight 的過去式是 fought，fight over + 事情 表示「為了…而爭吵」。" },
        ],
      },
      {
        id: "u4-4",
        title: "Part 4",
        zh: "人際與日常片語",
        color: "#B07CC6",
        words: [
          { en: "one another", pos: "pron.", zh: "彼此", ex_en: "The team members always help one another.", ex_zh: "隊員們總是互相幫忙。", ex_blank: "The team members always help ____.", grammar: "one another 多用於三人以上互相；each other 多用於兩者之間，口語上常可互換。" },
          { en: "money", pos: "n.", zh: "錢", ex_en: "He is saving money to buy a new car.", ex_zh: "他正在存錢買新車。", ex_blank: "He is saving ____ to buy a new car." },
          { en: "famous", pos: "adj.", zh: "有名的", ex_en: "Paris is famous for the Eiffel Tower.", ex_zh: "巴黎以艾菲爾鐵塔聞名。", ex_blank: "Paris is ____ for the Eiffel Tower.", grammar: "be famous for + 原因，表示「以…聞名」。" },
          { en: "train", pos: "v./n.", blankPos: "v.", zh: "訓練；火車", ex_en: "She is trying to train her new puppy.", ex_zh: "她正試著訓練她的新小狗。", ex_blank: "She is trying to ____ her new puppy.", grammar: "train 當動詞是「訓練」，當名詞是「火車」，要看上下文判斷詞性。" },
          { en: "sadly", pos: "adv.", zh: "令人遺憾地", ex_en: "Sadly, we have to cancel our picnic because of the rain.", ex_zh: "很遺憾，我們因為下雨必須取消野餐。", ex_blank: "____, we have to cancel our picnic because of the rain." },
          { en: "team up with", pos: "phr.", zh: "跟……組隊", ex_en: "The company decided to team up with a famous designer.", ex_zh: "這間公司決定和一位知名設計師合作。", ex_blank: "The company decided to ____ a famous designer.", grammar: "team up with + 對象，表示「和…合作、組隊」。" },
          { en: "have to", pos: "phr.", zh: "必須", ex_en: "I have to finish this report by Friday.", ex_zh: "我必須在星期五前完成這份報告。", ex_blank: "I ____ finish this report by Friday.", grammar: "have to 是準助動詞，表示「必須」，第三人稱單數用 has to，過去式用 had to。" },
          { en: "stay up", pos: "phr.", zh: "熬夜", ex_en: "I often stay up late to study for exams.", ex_zh: "我常常熬夜念書準備考試。", ex_blank: "I often ____ late to study for exams.", grammar: "stay up 表示「熬夜」，後面常接 late 加強語氣。" },
        ],
      },
    ],
  },
  {
    id: "lesson5",
    title: "第5課",
    zh: "地點與消費 Places & Shopping",
    units: [
      {
        id: "u5-1",
        title: "Part 1",
        zh: "地點與商店",
        color: "#E8604C",
        words: [
          { en: "temple", pos: "n.", zh: "寺廟", ex_en: "We visited an ancient temple on our trip.", ex_zh: "我們在旅途中參觀了一座古老的寺廟。", ex_blank: "We visited an ancient ____ on our trip." },
          { en: "supermarket", pos: "n.", zh: "超級市場", ex_en: "I need to go to the supermarket to buy some milk.", ex_zh: "我需要去超市買一些牛奶。", ex_blank: "I need to go to the ____ to buy some milk." },
          { en: "restaurant", pos: "n.", zh: "餐廳", ex_en: "Let's try that new Italian restaurant tonight.", ex_zh: "我們今晚去試試那間新的義大利餐廳吧。", ex_blank: "Let's try that new Italian ____ tonight." },
          { en: "bank", pos: "n.", zh: "銀行", ex_en: "I need to go to the bank to deposit some money.", ex_zh: "我需要去銀行存一些錢。", ex_blank: "I need to go to the ____ to deposit some money." },
          { en: "church", pos: "n.", zh: "教堂", ex_en: "The old church on the hill is a famous landmark.", ex_zh: "山丘上那座古老的教堂是知名地標。", ex_blank: "The old ____ on the hill is a famous landmark." },
          { en: "bakery", pos: "n.", zh: "麵包店", ex_en: "The smell from the bakery is wonderful.", ex_zh: "麵包店飄來的香味很棒。", ex_blank: "The smell from the ____ is wonderful." },
          { en: "bridge", pos: "n.", zh: "橋", ex_en: "The Golden Gate Bridge is a famous landmark in San Francisco.", ex_zh: "金門大橋是舊金山知名的地標。", ex_blank: "The Golden Gate ____ is a famous landmark in San Francisco." },
          { en: "hotel", pos: "n.", zh: "飯店", ex_en: "We stayed at a nice hotel near the beach.", ex_zh: "我們住在海灘附近一間不錯的飯店。", ex_blank: "We stayed at a nice ____ near the beach." },
          { en: "department store", pos: "n.", zh: "百貨公司", ex_en: "You can buy almost everything at a department store.", ex_zh: "你幾乎可以在百貨公司買到所有東西。", ex_blank: "You can buy almost everything at a ____." },
          { en: "metro station", pos: "n.", zh: "捷運站", ex_en: "Which exit should I take at this metro station?", ex_zh: "這個捷運站我應該走哪個出口？", ex_blank: "Which exit should I take at this ____?" },
          { en: "bookstore", pos: "n.", zh: "書店", ex_en: "I can spend hours just looking around in a bookstore.", ex_zh: "我可以在書店逛好幾個小時。", ex_blank: "I can spend hours just looking around in a ____." },
        ],
      },
      {
        id: "u5-2",
        title: "Part 2",
        zh: "旅遊與計畫",
        color: "#3B6E8F",
        words: [
          { en: "post office", pos: "n.", zh: "郵局", ex_en: "Can you mail this letter at the post office for me?", ex_zh: "你可以幫我在郵局寄這封信嗎？", ex_blank: "Can you mail this letter at the ____ for me?" },
          { en: "flower shop", pos: "n.", zh: "花店", ex_en: "I bought these beautiful roses from that flower shop.", ex_zh: "我從那間花店買了這些漂亮的玫瑰。", ex_blank: "I bought these beautiful roses from that ____." },
          { en: "trip", pos: "n.", zh: "旅行", ex_en: "Our family is planning a road trip this summer.", ex_zh: "我們家今年夏天正在計畫一趟公路旅行。", ex_blank: "Our family is planning a road ____ this summer." },
          { en: "during", pos: "prep.", zh: "在……期間", ex_en: "Please be quiet during the movie.", ex_zh: "電影播放期間請保持安靜。", ex_blank: "Please be quiet ____ the movie.", grammar: "during 後面接名詞，表示「在…期間」；若要接子句則改用 while。" },
          { en: "vacation", pos: "n.", zh: "假期", ex_en: "Where are you going for your winter vacation?", ex_zh: "你寒假要去哪裡？", ex_blank: "Where are you going for your winter ____?" },
          { en: "will / would", pos: "aux.", zh: "將", ex_en: "I will be there at 7 o'clock sharp.", ex_zh: "我七點整會到那裡。", ex_blank: "I ____ be there at 7 o'clock sharp.", grammar: "will 是未來式助動詞，would 是其過去式，也常用於委婉語氣，如 Would you…?" },
          { en: "own", pos: "pron./adj./v.", blankPos: "v.", zh: "自己的；擁有", ex_en: "My uncle used to own a small restaurant.", ex_zh: "我叔叔以前擁有一間小餐廳。", ex_blank: "My uncle used to ____ a small restaurant.", grammar: "own 當動詞是「擁有」；當形容詞用 my/your/his own 等所有格加強「自己的」語氣。" },
          { en: "local", pos: "adj.", zh: "當地的", ex_en: "We tried some local food at the night market.", ex_zh: "我們在夜市嚐了一些當地美食。", ex_blank: "We tried some ____ food at the night market." },
          { en: "tour", pos: "n.", zh: "旅遊行程", ex_en: "We joined a guided tour of the city.", ex_zh: "我們參加了這座城市的導覽行程。", ex_blank: "We joined a guided ____ of the city." },
          { en: "spend / spent", pos: "v.", zh: "花費(金錢；時間)", ex_en: "How much time do you spend on homework every day?", ex_zh: "你每天花多少時間寫作業？", ex_blank: "How much time do you ____ on homework every day?", grammar: "spend 的過去式是 spent，常用句型 spend + 時間/金錢 + on N 或 + Ving。" },
        ],
      },
      {
        id: "u5-3",
        title: "Part 3",
        zh: "數量與時間",
        color: "#4CAF7D",
        words: [
          { en: "thousand", pos: "n.", zh: "千", ex_en: "The concert tickets cost over a thousand dollars.", ex_zh: "演唱會門票要價超過一千元。", ex_blank: "The concert tickets cost over a ____ dollars." },
          { en: "each", pos: "adj./pron.", blankPos: "adj.", zh: "每個(的)", ex_en: "Please give each person one of these papers.", ex_zh: "請給每個人一張這種紙。", ex_blank: "Please give ____ person one of these papers.", grammar: "each 當形容詞後面接單數名詞（each person）；當代名詞可單獨使用（each of them）。" },
          { en: "pay / paid", pos: "v.", zh: "付錢", ex_en: "Did you remember to pay the electricity bill?", ex_zh: "你有記得繳電費嗎？", ex_blank: "Did you remember to ____ the electricity bill?", grammar: "pay 的過去式是 paid，pay for + 東西 表示「付錢買…」。" },
          { en: "tomorrow", pos: "adv./n.", blankPos: "n.", zh: "明天", ex_en: "Tomorrow is the first day of the new year.", ex_zh: "明天是新年的第一天。", ex_blank: "____ is the first day of the new year." },
          { en: "almost", pos: "adv.", zh: "幾乎", ex_en: "I'm almost finished with my work.", ex_zh: "我的工作幾乎完成了。", ex_blank: "I'm ____ finished with my work." },
          { en: "decide", pos: "v.", zh: "決定", ex_en: "Have you decided where to go for dinner?", ex_zh: "你決定好要去哪裡吃晚餐了嗎？", ex_blank: "Have you ____ where to go for dinner?" },
          { en: "cost / cost", pos: "v.", zh: "花費(金錢)", ex_en: "How much did your new phone cost?", ex_zh: "你的新手機花了多少錢？", ex_blank: "How much did your new phone ____?", grammar: "cost 現在式與過去式同形（cost-cost-cost），主詞通常是物品或事情。" },
          { en: "fan", pos: "n.", zh: "……迷；電扇", ex_en: "It's hot in here; could you please turn on the fan?", ex_zh: "這裡好熱，可以請你打開電扇嗎？", ex_blank: "It's hot in here; could you please turn on the ____?" },
          { en: "leave for", pos: "phr.", zh: "前往", ex_en: "What time do we need to leave for the airport?", ex_zh: "我們幾點需要出發前往機場？", ex_blank: "What time do we need to ____ the airport?", grammar: "leave for + 地方 表示「前往、動身去…」，注意與 leave + 地方（離開某地）意思不同。" },
          { en: "vendor", pos: "n.", zh: "攤販", ex_en: "The street vendor sells delicious hot dogs.", ex_zh: "那個街頭攤販賣的熱狗很好吃。", ex_blank: "The street ____ sells delicious hot dogs." },
        ],
      },
      {
        id: "u5-4",
        title: "Part 4",
        zh: "市集與交易",
        color: "#B07CC6",
        words: [
          { en: "quick", pos: "adj.", zh: "迅速的", ex_en: "We had a quick lunch before going back to work.", ex_zh: "我們在回去工作前快速吃了午餐。", ex_blank: "We had a ____ lunch before going back to work." },
          { en: "stall", pos: "n.", zh: "攤位", ex_en: "My favorite food stall is the one that sells noodles.", ex_zh: "我最喜歡的美食攤位是賣麵的那家。", ex_blank: "My favorite food ____ is the one that sells noodles." },
          { en: "careful", pos: "adj.", zh: "小心的", ex_en: "You need to be careful when you cross the street.", ex_zh: "過馬路時你需要小心。", ex_blank: "You need to be ____ when you cross the street." },
          { en: "boat", pos: "n.", zh: "小船", ex_en: "We rented a small boat to go fishing on the lake.", ex_zh: "我們租了一艘小船到湖上釣魚。", ex_blank: "We rented a small ____ to go fishing on the lake." },
          { en: "sell / sold", pos: "v.", zh: "賣；出售", ex_en: "That shop used to sell old books and magazines.", ex_zh: "那間店以前賣舊書和雜誌。", ex_blank: "That shop used to ____ old books and magazines.", grammar: "sell 的過去式是 sold，sell 的主詞是賣家；buy 才是買家。" },
          { en: "low", pos: "adj.", zh: "低的；矮的", ex_en: "He spoke in a low voice so no one could hear.", ex_zh: "他用很低的聲音說話，沒人聽得到。", ex_blank: "He spoke in a ____ voice so no one could hear." },
          { en: "price", pos: "n.", zh: "價格；代價", ex_en: "The price of gas has gone up again.", ex_zh: "油價又上漲了。", ex_blank: "The ____ of gas has gone up again." },
          { en: "remember", pos: "v.", zh: "記得", ex_en: "I can't remember where I put my keys.", ex_zh: "我不記得我把鑰匙放在哪裡了。", ex_blank: "I can't ____ where I put my keys." },
          { en: "cash", pos: "n.", zh: "現金", ex_en: "Do you prefer to pay by cash or credit card?", ex_zh: "你比較喜歡付現金還是刷卡？", ex_blank: "Do you prefer to pay by ____ or credit card?" },
          { en: "wonderful", pos: "adj.", zh: "美好的", ex_en: "We had a wonderful time at the party last night.", ex_zh: "我們昨晚在派對上度過了美好的時光。", ex_blank: "We had a ____ time at the party last night." },
        ],
      },
    ],
  },
  {
    id: "lesson6",
    title: "第6課",
    zh: "交通與問路 Transportation & Directions",
    units: [
      {
        id: "u6-1",
        title: "Part 1",
        zh: "交通工具與方向①",
        color: "#E8604C",
        words: [
          { en: "airplane / plane", pos: "n.", zh: "飛機", ex_en: "The airplane is preparing for takeoff.", ex_zh: "飛機正準備起飛。", ex_blank: "The ____ is preparing for takeoff." },
          { en: "bicycle / bike", pos: "n.", zh: "腳踏車", ex_en: "Riding a bicycle is a great form of exercise.", ex_zh: "騎腳踏車是很好的運動方式。", ex_blank: "Riding a ____ is a great form of exercise." },
          { en: "truck", pos: "n.", zh: "卡車", ex_en: "A big red truck was parked in front of our house.", ex_zh: "一輛紅色大卡車停在我們家門前。", ex_blank: "A big red ____ was parked in front of our house." },
          { en: "scooter", pos: "n.", zh: "輕型機車", ex_en: "It's more convenient to ride a scooter in the city.", ex_zh: "在城市裡騎輕型機車比較方便。", ex_blank: "It's more convenient to ride a ____ in the city." },
          { en: "motorcycle", pos: "n.", zh: "重型機車", ex_en: "He loves the speed and sound of his new motorcycle.", ex_zh: "他喜歡他新重機的速度感和聲音。", ex_blank: "He loves the speed and sound of his new ____." },
          { en: "taxi", pos: "n.", zh: "計程車", ex_en: "It's raining; let's just call a taxi.", ex_zh: "下雨了，我們就叫計程車吧。", ex_blank: "It's raining; let's just call a ____." },
          { en: "ship", pos: "n.", zh: "船；艦", ex_en: "The large ship is carrying goods from other countries.", ex_zh: "這艘大船正載運著來自其他國家的貨物。", ex_blank: "The large ____ is carrying goods from other countries." },
          { en: "north", pos: "n./adj./adv.", blankPos: "n.", zh: "北方(的)；朝北", ex_en: "The wind is coming from the north today.", ex_zh: "今天風是從北方吹來的。", ex_blank: "The wind is coming from the ____ today.", grammar: "north 可當名詞（北方）、形容詞（北方的）或副詞（朝北），依句中位置判斷詞性。" },
          { en: "west", pos: "n./adj./adv.", blankPos: "n.", zh: "西方(的)；朝西", ex_en: "The sun sets in the west.", ex_zh: "太陽從西方落下。", ex_blank: "The sun sets in the ____." },
        ],
      },
      {
        id: "u6-2",
        title: "Part 2",
        zh: "方向與問路",
        color: "#3B6E8F",
        words: [
          { en: "south", pos: "n./adj./adv.", blankPos: "adv.", zh: "南方(的)；朝南", ex_en: "The birds are flying south for the winter.", ex_zh: "鳥兒正飛往南方過冬。", ex_blank: "The birds are flying ____ for the winter.", grammar: "south/north/east/west 當副詞時直接放在動詞後面，不需加介系詞，如 fly south。" },
          { en: "east", pos: "n./adj./adv.", blankPos: "n.", zh: "東方(的)；朝東", ex_en: "The sun rises in the east.", ex_zh: "太陽從東方升起。", ex_blank: "The sun rises in the ____." },
          { en: "drive / drove", pos: "v.", zh: "駕駛(車)", ex_en: "My father drove us to the airport.", ex_zh: "我爸爸開車載我們去機場。", ex_blank: "My father ____ us to the airport.", grammar: "drive 的過去式是 drove，drive + 人 + to + 地方 表示「開車載某人去…」。" },
          { en: "ride / rode", pos: "v./n.", blankPos: "v.", zh: "騎(車；馬)；搭乘", ex_en: "We rode our bikes all the way to the park.", ex_zh: "我們一路騎腳踏車到公園。", ex_blank: "We ____ our bikes all the way to the park.", grammar: "ride 當動詞的過去式是 rode；當名詞表示「搭乘、乘坐一趟」，如 go for a ride。" },
          { en: "row", pos: "v.", zh: "划(船)", ex_en: "We need to row the boat together to make it move.", ex_zh: "我們需要一起划船才能讓船前進。", ex_blank: "We need to ____ the boat together to make it move." },
          { en: "Excuse me.", pos: "phr.", zh: "不好意思。", ex_en: "Excuse me, do you know where the post office is?", ex_zh: "不好意思，請問你知道郵局在哪裡嗎？", ex_blank: "____, do you know where the post office is?" },
          { en: "sir", pos: "n.", zh: "先生", ex_en: "Can I see your ticket, sir?", ex_zh: "先生，我可以看一下你的票嗎？", ex_blank: "Can I see your ticket, ____?" },
          { en: "turn left", pos: "phr.", zh: "左轉", ex_en: "Go straight for two blocks, and then turn left.", ex_zh: "直走兩個街區，然後左轉。", ex_blank: "Go straight for two blocks, and then ____.", grammar: "turn left / turn right 表示「左轉／右轉」，是問路常用的指令句。" },
          { en: "corner", pos: "n.", zh: "轉角", ex_en: "There is a coffee shop on that corner.", ex_zh: "那個轉角有一間咖啡店。", ex_blank: "There is a coffee shop on that ____." },
        ],
      },
      {
        id: "u6-3",
        title: "Part 3",
        zh: "位置與規定",
        color: "#4CAF7D",
        words: [
          { en: "straight", pos: "adv./adj.", blankPos: "adv.", zh: "直地；直的", ex_en: "You need to walk straight for about five minutes.", ex_zh: "你需要直走大約五分鐘。", ex_blank: "You need to walk ____ for about five minutes." },
          { en: "block", pos: "n.", zh: "街區", ex_en: "My office is just one block away from here.", ex_zh: "我的辦公室離這裡只有一個街區遠。", ex_blank: "My office is just one ____ away from here." },
          { en: "across from", pos: "phr.", zh: "在……對面", ex_en: "The library is right across from the park.", ex_zh: "圖書館就在公園的正對面。", ex_blank: "The library is right ____ the park.", grammar: "across from + 地點，表示「在…的對面」，常用於問路與描述位置。" },
          { en: "bottom", pos: "n./adj.", blankPos: "n.", zh: "底部(的)", ex_en: "His name was at the bottom of the list.", ex_zh: "他的名字在名單的最底部。", ex_blank: "His name was at the ____ of the list." },
          { en: "rule", pos: "n.", zh: "規定", ex_en: "You must follow the classroom rule.", ex_zh: "你必須遵守班規。", ex_blank: "You must follow the classroom ____." },
          { en: "broken", pos: "adj.", zh: "破損的", ex_en: "My favorite cup is broken.", ex_zh: "我最喜歡的杯子破了。", ex_blank: "My favorite cup is ____." },
          { en: "shake / shook hands", pos: "phr.", zh: "握手", ex_en: "The two leaders shook hands after the meeting.", ex_zh: "兩位領導人在會後握手。", ex_blank: "The two leaders ____ after the meeting.", grammar: "shake hands（握手）的過去式是 shook hands，shake hands with + 人 表示「和某人握手」。" },
          { en: "favorite", pos: "adj.", zh: "最喜愛的", ex_en: "What is your favorite movie of all time?", ex_zh: "你有史以來最喜歡的電影是什麼？", ex_blank: "What is your ____ movie of all time?" },
          { en: "pocket", pos: "n.", zh: "口袋", ex_en: "He put his hands in his pocket to keep them warm.", ex_zh: "他把手放進口袋裡保暖。", ex_blank: "He put his hands in his ____ to keep them warm." },
        ],
      },
      {
        id: "u6-4",
        title: "Part 4",
        zh: "人物與生活",
        color: "#B07CC6",
        words: [
          { en: "monster", pos: "n.", zh: "怪獸", ex_en: "The scary monster in the movie was actually very friendly.", ex_zh: "電影裡那隻可怕的怪獸其實非常友善。", ex_blank: "The scary ____ in the movie was actually very friendly." },
          { en: "clerk", pos: "n.", zh: "店員", ex_en: "The hotel clerk gave us our room key.", ex_zh: "飯店店員給了我們房間鑰匙。", ex_blank: "The hotel ____ gave us our room key." },
          { en: "convenient", pos: "adj.", zh: "方便的", ex_en: "Living near a metro station is very convenient.", ex_zh: "住在捷運站附近非常方便。", ex_blank: "Living near a metro station is very ____." },
          { en: "mistake", pos: "n.", zh: "錯誤", ex_en: "It's okay to make a mistake as long as you learn from it.", ex_zh: "只要能從中學習，犯錯也沒關係。", ex_blank: "It's okay to make a ____ as long as you learn from it." },
          { en: "parking space", pos: "phr.", zh: "停車位", ex_en: "It is difficult to find a parking space in this area.", ex_zh: "在這一區很難找到停車位。", ex_blank: "It is difficult to find a ____ in this area." },
          { en: "visitor", pos: "n.", zh: "訪客", ex_en: "The museum has thousands of visitors every day.", ex_zh: "這間博物館每天都有成千上萬的訪客。", ex_blank: "The museum has thousands of ____ every day." },
          { en: "cheap", pos: "adj.", zh: "便宜的", ex_en: "I bought a very cheap T-shirt at the market.", ex_zh: "我在市場買了一件很便宜的T恤。", ex_blank: "I bought a very ____ T-shirt at the market." },
          { en: "beef", pos: "n.", zh: "牛肉", ex_en: "Would you like some beef noodles for lunch?", ex_zh: "你午餐想吃牛肉麵嗎？", ex_blank: "Would you like some ____ noodles for lunch?" },
        ],
      },
    ],
  },
];

const UNITS = LESSONS.flatMap((lesson) => lesson.units.map((u) => ({ ...u, lessonId: lesson.id })));

const ACTIVITIES = [
  { key: "flashcards", label: "字卡", zh: "先看過一輪單字" },
  { key: "quiz", label: "測驗", zh: "選出正確中文意思" },
  { key: "matching", label: "配對遊戲", zh: "配對英文與中文" },
  { key: "fillblank", label: "例句填空", zh: "把單字填進句子裡" },
  { key: "typing", label: "拼字練習", zh: "聽發音，自己拼出單字" },
  { key: "mastery", label: "複習到全對", zh: "答錯的字重複出現，全對才算過關" },
];

const STORAGE_KEY = "progress-v1";

/* 萊特納複習間隔（分鐘）：答錯 → 10分鐘後；答對一次 → 1天後；再對 → 3天；再對 → 7天後畢業 */
const LEITNER_MINUTES = [10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7];

/* 把 "autumn / fall"、"feel / felt" 這種多型態單字拆成陣列，每個型態都能各自發音 */
function wordForms(word) {
  return word.en.split(" / ").map((s) => s.trim()).filter(Boolean);
}

const ALL_WORDS = UNITS.flatMap((u) => u.words.map((w) => ({ ...w, unitId: u.id })));

function findWord(unitId, en) {
  const unit = UNITS.find((u) => u.id === unitId);
  return unit ? unit.words.find((w) => w.en === en) : null;
}

function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

function isCorrectSpelling(word, input) {
  const norm = normalizeAnswer(input);
  return wordForms(word).some((f) => normalizeAnswer(f) === norm);
}

/* 產生提示字串：保留開頭1~2個字母（短字只給1個），其餘字母換成底線，空格保留 */
function hintLetters(text) {
  const revealCount = text.replace(/\s/g, "").length <= 3 ? 1 : 2;
  let shown = 0;
  return text
    .split("")
    .map((ch) => {
      if (ch === " ") return " ";
      if (shown < revealCount) {
        shown++;
        return ch;
      }
      return "_";
    })
    .join("");
}

let speechUnlocked = false;
let currentSpeechRate = 0.9;

function setGlobalSpeechRate(rate) {
  currentSpeechRate = rate;
}

function unlockSpeech() {
  // 部分瀏覽器（尤其手機版 WebView）需要在使用者第一次點擊時，
  // 用一段極短的靜音發音「解鎖」語音合成，之後才能正常出聲。
  if (speechUnlocked || !window.speechSynthesis) return;
  try {
    const silent = new SpeechSynthesisUtterance(" ");
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
    speechUnlocked = true;
  } catch (e) {
    // ignore
  }
}

function speak(text, rateOverride) {
  try {
    if (!window.speechSynthesis) {
      console.error("此瀏覽器不支援語音合成");
      return;
    }
    const synth = window.speechSynthesis;
    unlockSpeech();
    // Chrome 系瀏覽器閒置一段時間後語音合成會被暫停，speak 前先 resume 喚醒
    synth.resume();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rateOverride || currentSpeechRate;
    u.pitch = 1;
    u.volume = 1;
    u.onerror = (e) => console.error("speech utterance error", e.error);
    // 給 cancel() 一點時間完成，避免在部分手機瀏覽器上 speak 被吃掉
    setTimeout(() => {
      synth.speak(u);
    }, 30);
  } catch (e) {
    console.error("speech error", e);
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/* Speaker 按鈕                                                        */
/* ------------------------------------------------------------------ */
function SpeakerButton({ text, size = 20 }) {
  return (
    <button
      className="speaker-btn"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      aria-label={`Play pronunciation of ${text}`}
      type="button"
    >
      <Volume2 size={size} />
    </button>
  );
}

/* 顯示單字的每個型態，並各自附上喇叭按鈕（例：feel 🔊 / felt 🔊） */
function FormsSpeaker({ word, size = 18, wordClassName = "" }) {
  const forms = wordForms(word);
  return (
    <span className="forms-row">
      {forms.map((f, i) => (
        <span className="form-item" key={f}>
          <span className={wordClassName}>{f}</span>
          <SpeakerButton text={f} size={size} />
          {i < forms.length - 1 && <span className="form-sep">/</span>}
        </span>
      ))}
    </span>
  );
}

const SPEECH_RATES = [
  { label: "慢", value: 0.6 },
  { label: "正常", value: 0.9 },
  { label: "快", value: 1.2 },
];

/* 語速切換元件：切換後會立即套用到全站所有發音，並記住選擇直到重新整理頁面 */
function RateControl() {
  const [rate, setRate] = useState(currentSpeechRate);
  return (
    <div className="rate-row">
      <span className="rate-label">語速</span>
      {SPEECH_RATES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={`rate-btn ${rate === r.value ? "active" : ""}`}
          onClick={() => {
            setRate(r.value);
            setGlobalSpeechRate(r.value);
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主 App                                                              */
/* ------------------------------------------------------------------ */
export default function EnglishStudyApp() {
  const [screen, setScreen] = useState({ view: "home" });
  const [progress, setProgress] = useState({ stamps: {}, wordStats: {}, mistakes: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 保活機制：部分瀏覽器（尤其 Chrome 系）閒置一段時間後會把語音合成暫停，
    // 定期 pause/resume 可避免下次點喇叭時發不出聲音。
    if (!window.speechSynthesis) return;
    const keepAlive = setInterval(() => {
      try {
        if (!window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      } catch (e) {
        // ignore
      }
    }, 8000);
    return () => clearInterval(keepAlive);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setProgress({ stamps: {}, wordStats: {}, mistakes: {}, ...parsed });
        }
      } catch (e) {
        // key not found yet, ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const saveProgress = useCallback(async (next) => {
    setProgress(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      console.error("save error", e);
    }
  }, []);

  const markStamp = (unitId, activityKey) => {
    const next = {
      ...progress,
      stamps: {
        ...progress.stamps,
        [unitId]: { ...(progress.stamps[unitId] || {}), [activityKey]: true },
      },
    };
    saveProgress(next);
  };

  const recordWordResult = (unit, word, correct) => {
    const key = `${unit.id}::${word.en}`;
    const prevStat = progress.wordStats[key] || { correct: 0, total: 0 };
    const wordStats = {
      ...progress.wordStats,
      [key]: { correct: prevStat.correct + (correct ? 1 : 0), total: prevStat.total + 1 },
    };

    const mistakes = { ...progress.mistakes };
    if (!correct) {
      // 答錯：放進複習佇列，10 分鐘後才會再次出現
      mistakes[key] = {
        unitId: unit.id,
        en: word.en,
        box: 0,
        nextReview: Date.now() + LEITNER_MINUTES[0] * 60000,
        lastWrong: Date.now(),
      };
    } else if (mistakes[key]) {
      // 這個字之前答錯過，這次答對了：延後下次複習的時間，答對到頂就從錯題本畢業
      const cur = mistakes[key];
      const nextBox = cur.box + 1;
      if (nextBox >= LEITNER_MINUTES.length) {
        delete mistakes[key];
      } else {
        mistakes[key] = { ...cur, box: nextBox, nextReview: Date.now() + LEITNER_MINUTES[nextBox] * 60000 };
      }
    }

    saveProgress({ ...progress, wordStats, mistakes });
  };

  const totalStamps = Object.values(progress.stamps).reduce(
    (sum, u) => sum + Object.values(u).filter(Boolean).length,
    0
  );

  const importInputRef = useRef(null);

  const exportProgress = () => {
    try {
      const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `word-island-progress-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("export error", e);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const next = { stamps: {}, wordStats: {}, mistakes: {}, ...parsed };
        saveProgress(next);
      } catch (err) {
        console.error("import error", err);
      }
    };
    reader.readAsText(file);
  };

  const resetProgress = () => {
    const ok = window.confirm("確定要重置所有學習進度嗎？\n\n所有印章、答對答錯紀錄、複習清單都會清空，且無法復原。\n建議重置前先點「備份進度」保留一份。");
    if (ok) {
      saveProgress({ stamps: {}, wordStats: {}, mistakes: {} });
    }
  };

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap');

        .app-root {
          --ink: #232C4D;
          --paper: #F2F0EA;
          --card: #FFFFFF;
          --accent: #FFC857;
          --accent-ink: #6B4A00;
          --green: #4CAF7D;
          --red: #E8604C;
          --line: #DAD6C9;
          font-family: 'Noto Sans TC', sans-serif;
          color: var(--ink);
          background: var(--paper);
          min-height: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 16px 16px 40px;
          box-sizing: border-box;
        }
        .app-root * { box-sizing: border-box; }
        .app-root h1, .app-root h2, .app-root h3 {
          font-family: 'Baloo 2', 'Noto Sans TC', sans-serif;
          margin: 0;
        }

        .top-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .brand {
          display: flex; align-items: baseline; gap: 8px;
        }
        .brand h1 { font-size: 22px; font-weight: 700; }
        .brand span { font-size: 13px; color: #6B6A5E; }
        .stamp-badge {
          display: flex; align-items: center; gap: 5px;
          background: var(--card); border: 1.5px solid var(--line);
          border-radius: 999px; padding: 6px 12px; font-size: 13px; font-weight: 600;
        }
        .stamp-badge svg { color: var(--accent); fill: var(--accent); }

        .back-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
          cursor: pointer; color: #6B6A5E; font-size: 14px; font-weight: 500;
        }
        .back-row:hover { color: var(--ink); }

        .backup-row {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 14px; font-size: 12px;
        }
        .text-link {
          background: none; border: none; color: #6B6A5E; text-decoration: underline;
          font-size: 12px; cursor: pointer; padding: 0; font-family: 'Noto Sans TC', sans-serif;
        }
        .dot-sep { opacity: 0.5; color: #6B6A5E; }
        .text-link-danger { color: var(--red); }

        /* Home: unit list */
        .unit-list { display: flex; flex-direction: column; gap: 12px; }
        .unit-card {
          background: var(--card);
          border-radius: 14px;
          border-left: 6px solid var(--unit-color, var(--accent));
          padding: 16px 16px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          transition: transform .12s ease;
        }
        .unit-card:active { transform: scale(0.98); }
        .unit-card-title { font-weight: 700; font-size: 17px; }
        .unit-card-sub { font-size: 13px; color: #6B6A5E; margin-top: 2px; }
        .unit-stamps { display: flex; gap: 4px; margin-top: 8px; }
        .mini-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--line);
        }
        .mini-dot.filled { background: var(--unit-color, var(--accent)); }

        /* Activity picker */
        .activity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .activity-card {
          background: var(--card); border-radius: 14px; padding: 16px 14px;
          cursor: pointer; border: 2px solid transparent;
          display: flex; flex-direction: column; gap: 4px;
        }
        .activity-card:active { border-color: var(--unit-color); }
        .activity-card .label { font-weight: 700; font-size: 16px; font-family: 'Baloo 2', sans-serif; }
        .activity-card .desc { font-size: 12px; color: #6B6A5E; }
        .activity-card .check { align-self: flex-end; color: var(--green); }

        /* Flashcards */
        .card-stage { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .flip-card {
          width: 100%; max-width: 340px; height: 220px;
          perspective: 1000px; cursor: pointer;
        }
        .flip-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform .5s; transform-style: preserve-3d;
        }
        .flipped .flip-inner { transform: rotateY(180deg); }
        .flip-face {
          position: absolute; inset: 0; backface-visibility: hidden;
          border-radius: 18px; background: var(--card);
          border: 2px solid var(--line);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px; text-align: center; gap: 10px;
        }
        .flip-face.back { transform: rotateY(180deg); background: var(--unit-color); color: white; border: none; }
        .flip-face .en-word { font-family: 'Baloo 2', sans-serif; font-size: 24px; font-weight: 700; }
        .flip-face .pos { font-size: 12px; color: #6B6A5E; }
        .flip-face.back .pos { color: rgba(255,255,255,0.8); }
        .flip-face .zh-word { font-size: 22px; font-weight: 700; }
        .flip-face .ex { font-size: 13px; margin-top: 6px; line-height: 1.5; opacity: 0.95; }
        .nav-row { display: flex; align-items: center; gap: 18px; }
        .nav-btn {
          background: var(--card); border: 1.5px solid var(--line);
          border-radius: 999px; padding: 10px 18px; font-weight: 600; cursor: pointer;
          font-family: 'Noto Sans TC', sans-serif; font-size: 14px;
        }
        .nav-btn:active { transform: scale(0.96); }
        .progress-text { font-size: 13px; color: #6B6A5E; }

        /* Quiz */
        .quiz-word { text-align: center; margin-bottom: 22px; }
        .quiz-word .en-word { font-family: 'Baloo 2', sans-serif; font-size: 24px; font-weight: 700; }
        .options { display: flex; flex-direction: column; gap: 10px; }
        .option-btn {
          background: var(--card); border: 2px solid var(--line); border-radius: 12px;
          padding: 14px 16px; font-size: 16px; text-align: left; cursor: pointer;
          font-family: 'Noto Sans TC', sans-serif; display: flex; justify-content: space-between; align-items: center;
        }
        .option-btn.correct { border-color: var(--green); background: #EAF6EF; }
        .option-btn.wrong { border-color: var(--red); background: #FBEAE7; }
        .option-btn:disabled { cursor: default; }

        /* Matching */
        .match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .match-tile {
          background: var(--card); border: 2px solid var(--line); border-radius: 12px;
          padding: 14px 10px; text-align: center; cursor: pointer; font-weight: 600; font-size: 15px;
          min-height: 54px; display: flex; align-items: center; justify-content: center;
        }
        .match-tile.selected { border-color: var(--accent); background: #FFF7E4; }
        .match-tile.matched { border-color: var(--green); background: #EAF6EF; opacity: 0.55; cursor: default; }

        /* Fill blank */
        .sentence-box {
          background: var(--card); border-radius: 14px; padding: 20px 16px; text-align: center;
          font-size: 17px; line-height: 1.7; margin-bottom: 18px;
        }
        .sentence-zh { font-size: 14px; color: #6B6A5E; margin-top: 6px; line-height: 1.6; }
        .blank {
          display: inline-block; min-width: 70px; border-bottom: 2px solid var(--ink);
          font-weight: 700; color: var(--unit-color);
        }
        .word-bank { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .bank-chip {
          background: var(--card); border: 2px solid var(--line); border-radius: 999px;
          padding: 10px 16px; font-size: 15px; font-weight: 600; cursor: pointer;
          font-family: 'Noto Sans TC', sans-serif;
        }
        .bank-chip.correct { border-color: var(--green); background: #EAF6EF; }
        .bank-chip.wrong { border-color: var(--red); background: #FBEAE7; }

        .speaker-btn {
          background: var(--ink); color: white; border: none; border-radius: 50%;
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
        .speaker-btn:active { transform: scale(0.92); }

        /* 多型態單字（例：feel / felt）各自附上發音按鈕 */
        .forms-row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px 8px; }
        .form-item { display: inline-flex; align-items: center; gap: 4px; }
        .form-sep { opacity: 0.4; font-weight: 400; margin: 0 2px; }
        .flip-face.back .form-sep { opacity: 0.7; }

        .ex-speaker-row { margin-top: 8px; display: flex; justify-content: center; }
        .ex-speaker-row .speaker-btn { background: rgba(255,255,255,0.25); }

        .rate-row {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 12px; flex-wrap: wrap;
        }
        .rate-label { font-size: 12px; color: #6B6A5E; margin-right: 2px; }
        .rate-btn {
          background: var(--card); border: 1.5px solid var(--line); border-radius: 999px;
          padding: 4px 12px; font-size: 12px; font-weight: 600; color: #6B6A5E; cursor: pointer;
          font-family: 'Noto Sans TC', sans-serif;
        }
        .rate-btn.active { border-color: var(--accent); background: #FFF7E4; color: var(--accent-ink); }
        .rate-btn:active { transform: scale(0.95); }

        /* 複習錯題卡片 */
        .review-card {
          background: var(--ink); color: white; border-radius: 14px; padding: 16px 16px;
          cursor: pointer; display: flex; align-items: center; justify-content: space-between;
        }
        .review-card:active { transform: scale(0.98); }
        .review-title { font-weight: 700; font-size: 16px; font-family: 'Baloo 2', sans-serif; }
        .review-sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }
        .due-badge {
          background: var(--accent); color: var(--accent-ink); font-weight: 700; font-size: 13px;
          border-radius: 999px; min-width: 26px; height: 26px; padding: 0 8px;
          display: flex; align-items: center; justify-content: center;
        }

        /* 拼字練習 */
        .typing-form { display: flex; flex-direction: column; align-items: center; }
        .typing-input {
          width: 100%; max-width: 280px; border: 2px solid var(--line); border-radius: 12px;
          padding: 14px 16px; font-size: 18px; text-align: center; font-family: 'Noto Sans TC', sans-serif;
          background: var(--card); color: var(--ink);
        }
        .typing-input:focus { outline: none; border-color: var(--unit-color, var(--accent)); }
        .typing-input.correct { border-color: var(--green); background: #EAF6EF; }
        .typing-input.wrong { border-color: var(--red); background: #FBEAE7; }
        .typing-display {
          min-height: 54px; display: flex; align-items: center; justify-content: center;
          cursor: default; letter-spacing: 1px;
        }
        .typing-display:focus { outline: none; border-color: var(--unit-color, var(--accent)); }
        .typing-placeholder { color: #B9B6A6; font-size: 14px; letter-spacing: 0; }

        /* 自建虛擬鍵盤：避免在手機上叫出系統輸入法與預測選字列 */
        .osk {
          margin: 16px -16px 0; padding: 0 8px; box-sizing: border-box;
          display: flex; flex-direction: column; gap: 8px; align-items: stretch; width: calc(100% + 32px);
        }
        .osk-row { display: flex; gap: 5px; justify-content: center; }
        .osk-key {
          background: var(--card); border: 1.5px solid var(--line); border-radius: 10px;
          flex: 1 1 0; min-width: 28px; max-width: 42px; padding: 16px 0;
          font-size: 18px; font-weight: 700; color: var(--ink);
          cursor: pointer; font-family: 'Noto Sans TC', sans-serif;
        }
        .osk-key:active { background: var(--paper); transform: scale(0.92); }
        .osk-key:disabled { opacity: 0.4; cursor: default; }
        .osk-bottom { margin-top: 2px; }
        .osk-space { flex: 3 1 0; max-width: 220px; }
        .osk-backspace { flex: 1.4 1 0; max-width: 72px; font-size: 22px; }
        .typing-actions { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .hint-btn {
          background: var(--card); border: 1.5px solid var(--accent); color: var(--accent-ink);
          border-radius: 999px; padding: 10px 18px; font-weight: 700; cursor: pointer; font-size: 14px;
          font-family: 'Noto Sans TC', sans-serif;
        }
        .hint-btn:active { transform: scale(0.96); }
        .hint-btn:disabled { opacity: 0.5; cursor: default; }
        .hint-text { margin-top: 10px; font-size: 13px; color: #6B6A5E; text-align: center; }
        .hint-letters {
          font-family: 'Baloo 2', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 3px;
          color: var(--ink); margin-left: 2px;
        }
        .typing-feedback {
          text-align: center; margin-top: 14px; font-size: 14px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;
        }
        .typing-feedback.correct { color: var(--green); }
        .typing-feedback.wrong { color: var(--red); }
        .typing-answer { font-weight: 700; color: var(--ink); }

        /* 詞性標籤（填空題用，標示這個空格該填哪個詞性） */
        .blank-pos-tag {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--paper); border: 1px solid var(--line); border-radius: 999px;
          padding: 3px 10px; font-size: 12px; font-weight: 600; color: #6B6A5E;
        }

        /* 文法解說框 */
        .grammar-note {
          margin-top: 14px; background: #FFF7E4; border: 1.5px solid var(--accent);
          border-radius: 12px; padding: 10px 14px; font-size: 13px; line-height: 1.6;
          color: var(--accent-ink); text-align: left;
        }
        .ex-grammar {
          font-size: 12px; margin-top: 8px; opacity: 0.95; font-style: italic; line-height: 1.5;
        }

        .result-banner {
          text-align: center; padding: 28px 16px; background: var(--card); border-radius: 16px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .result-banner .stars { display: flex; gap: 4px; }
        .mistake-list {
          width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 6px;
          margin-top: 6px; text-align: left;
        }
        .mistake-row {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--paper); border-radius: 10px; padding: 8px 12px; font-size: 14px;
        }
        .mistake-row span:first-child { font-weight: 600; }
        .mistake-count { color: var(--red); font-weight: 600; font-size: 13px; }
        .primary-btn {
          background: var(--ink); color: white; border: none; border-radius: 999px;
          padding: 12px 24px; font-weight: 700; cursor: pointer; font-size: 15px;
          font-family: 'Noto Sans TC', sans-serif; margin-top: 6px;
        }
        .primary-btn:active { transform: scale(0.96); }
        .empty-note { text-align: center; color: #6B6A5E; font-size: 13px; padding: 20px; }
      `}</style>

      <div className="top-bar">
        <div className="brand">
          <h1>字卡島</h1>
          <span>Word Island</span>
        </div>
        <div className="stamp-badge">
          <Star size={15} />
          {totalStamps}
        </div>
      </div>

      {loaded && screen.view === "home" && (
        <div className="backup-row">
          <button type="button" className="text-link" onClick={exportProgress}>備份進度</button>
          <span className="dot-sep">·</span>
          <button type="button" className="text-link" onClick={() => importInputRef.current && importInputRef.current.click()}>還原進度</button>
          <input ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImportFile} />
          <span className="dot-sep">·</span>
          <button type="button" className="text-link text-link-danger" onClick={resetProgress}>重置進度</button>
        </div>
      )}

      {!loaded ? (
        <div className="empty-note">載入進度中…</div>
      ) : screen.view === "home" ? (
        <HomeScreen
          progress={progress}
          onOpenLesson={(l) => setScreen({ view: "lesson", lessonId: l.id })}
          onOpenReview={() => setScreen({ view: "review" })}
        />
      ) : screen.view === "lesson" ? (
        <LessonScreen
          lesson={LESSONS.find((l) => l.id === screen.lessonId)}
          progress={progress}
          onBack={() => setScreen({ view: "home" })}
          onOpenUnit={(u) => setScreen({ view: "unit", unitId: u.id, lessonId: screen.lessonId })}
        />
      ) : screen.view === "unit" ? (
        <UnitScreen
          unit={UNITS.find((u) => u.id === screen.unitId)}
          lesson={LESSONS.find((l) => l.id === screen.lessonId)}
          progress={progress}
          onBack={() => setScreen({ view: "lesson", lessonId: screen.lessonId })}
          onOpenActivity={(activityKey) =>
            setScreen({ view: "activity", unitId: screen.unitId, lessonId: screen.lessonId, activityKey })
          }
        />
      ) : screen.view === "review" ? (
        <ReviewSession
          mistakes={progress.mistakes || {}}
          onBack={() => setScreen({ view: "home" })}
          onWordResult={recordWordResult}
        />
      ) : (
        <ActivityScreen
          unit={UNITS.find((u) => u.id === screen.unitId)}
          activityKey={screen.activityKey}
          onBack={() => setScreen({ view: "unit", unitId: screen.unitId, lessonId: screen.lessonId })}
          onFinish={() => {
            markStamp(screen.unitId, screen.activityKey);
          }}
          onWordResult={recordWordResult}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home：課程（第 n 課）列表                                            */
/* ------------------------------------------------------------------ */
function HomeScreen({ progress, onOpenLesson, onOpenReview }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const mistakeList = Object.values(progress.mistakes || {});
  const now = Date.now();
  const dueCount = mistakeList.filter((m) => m.nextReview <= now).length;
  const totalMistakes = mistakeList.length;

  return (
    <div className="unit-list">
      <div className="review-card" onClick={onOpenReview}>
        <div>
          <div className="review-title">複習錯題</div>
          <div className="review-sub">
            {dueCount > 0
              ? `${dueCount} 個單字到期，該複習囉`
              : totalMistakes > 0
              ? `目前沒有到期的複習，共 ${totalMistakes} 個字在複習清單`
              : "還沒有需要複習的單字"}
          </div>
        </div>
        {dueCount > 0 ? <span className="due-badge">{dueCount}</span> : <ChevronRight color="rgba(255,255,255,0.6)" />}
      </div>

      {LESSONS.map((lesson) => {
        const stampMap = progress.stamps || {};
        const totalActs = lesson.units.length * ACTIVITIES.length;
        let earnedActs = 0;
        lesson.units.forEach((u) => {
          const m = stampMap[u.id] || {};
          earnedActs += ACTIVITIES.filter((a) => m[a.key]).length;
        });
        const totalWords = lesson.units.reduce((s, u) => s + u.words.length, 0);
        return (
          <div
            key={lesson.id}
            className="unit-card"
            style={{ "--unit-color": lesson.units[0]?.color }}
            onClick={() => onOpenLesson(lesson)}
          >
            <div>
              <div className="unit-card-title">{lesson.title}</div>
              <div className="unit-card-sub">{lesson.zh} · {totalWords} 個單字</div>
              <div className="unit-stamps">
                {lesson.units.map((u) => {
                  const m = stampMap[u.id] || {};
                  const allDone = ACTIVITIES.every((a) => m[a.key]);
                  return <span key={u.id} className={`mini-dot ${allDone ? "filled" : ""}`} style={{ "--unit-color": u.color }} />;
                })}
              </div>
              <div className="unit-card-sub" style={{ marginTop: 4 }}>已完成 {earnedActs} / {totalActs} 項練習</div>
            </div>
            <ChevronRight color="#B9B6A6" />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson：某一課內的小節（Part）列表                                     */
/* ------------------------------------------------------------------ */
function LessonScreen({ lesson, progress, onBack, onOpenUnit }) {
  return (
    <div>
      <div className="back-row" onClick={onBack}>
        <ArrowLeft size={16} /> 回課程列表
      </div>
      <h2 style={{ fontSize: 20, marginBottom: 2 }}>{lesson.title}</h2>
      <p style={{ fontSize: 13, color: "#6B6A5E", marginBottom: 16 }}>{lesson.zh} · 選一個小節開始練習</p>
      <div className="unit-list">
        {lesson.units.map((u) => {
          const stampMap = progress.stamps[u.id] || {};
          return (
            <div
              key={u.id}
              className="unit-card"
              style={{ "--unit-color": u.color }}
              onClick={() => onOpenUnit(u)}
            >
              <div>
                <div className="unit-card-title">{u.title}</div>
                <div className="unit-card-sub">{u.zh} · {u.words.length} 個單字</div>
                <div className="unit-stamps">
                  {ACTIVITIES.map((a) => (
                    <span key={a.key} className={`mini-dot ${stampMap[a.key] ? "filled" : ""}`} style={{ "--unit-color": u.color }} />
                  ))}
                </div>
              </div>
              <ChevronRight color="#B9B6A6" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Unit：選擇練習方式                                                   */
/* ------------------------------------------------------------------ */
function UnitScreen({ unit, lesson, progress, onBack, onOpenActivity }) {
  const stampMap = progress.stamps[unit.id] || {};
  return (
    <div style={{ "--unit-color": unit.color }}>
      <div className="back-row" onClick={onBack}>
        <ArrowLeft size={16} /> 回 {lesson ? lesson.title : "課程"}小節列表
      </div>
      <h2 style={{ fontSize: 20, marginBottom: 2 }}>{lesson ? `${lesson.title} · ${unit.title}` : unit.title}</h2>
      <p style={{ fontSize: 13, color: "#6B6A5E", marginBottom: 16 }}>{unit.zh} · 選一個方式開始練習</p>
      <div className="activity-grid">
        {ACTIVITIES.map((a) => (
          <div key={a.key} className="activity-card" style={{ "--unit-color": unit.color }} onClick={() => onOpenActivity(a.key)}>
            <div className="label">{a.label}</div>
            <div className="desc">{a.zh}</div>
            {stampMap[a.key] && <Check size={16} className="check" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Activity 路由                                                       */
/* ------------------------------------------------------------------ */
function ActivityScreen({ unit, activityKey, onBack, onFinish, onWordResult }) {
  const commonProps = { unit, onBack, onFinish, onWordResult };
  return (
    <div style={{ "--unit-color": unit.color }}>
      <div className="back-row" onClick={onBack}>
        <ArrowLeft size={16} /> 回 {unit.title}
      </div>
      {activityKey === "flashcards" && <Flashcards {...commonProps} />}
      {activityKey === "quiz" && <Quiz {...commonProps} />}
      {activityKey === "matching" && <Matching {...commonProps} />}
      {activityKey === "fillblank" && <FillBlank {...commonProps} />}
      {activityKey === "typing" && <Typing {...commonProps} />}
      {activityKey === "mastery" && <UnitMastery {...commonProps} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Flashcards                                                       */
/* ------------------------------------------------------------------ */
function Flashcards({ unit, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const word = unit.words[idx];

  if (done) return <ResultBanner label="字卡看完了！" onRestart={() => { setIdx(0); setFlipped(false); setDone(false); }} />;

  return (
    <div className="card-stage">
      <div className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flip-inner">
          <div className="flip-face front">
            <FormsSpeaker word={word} size={18} wordClassName="en-word" />
            <div className="pos">{word.pos}</div>
          </div>
          <div className="flip-face back" style={{ "--unit-color": unit.color }}>
            <div className="zh-word">{word.zh}</div>
            <div className="ex">{word.ex_en}<br />{word.ex_zh}</div>
            <div className="ex-speaker-row" onClick={(e) => e.stopPropagation()}>
              <SpeakerButton text={word.ex_en} size={18} />
            </div>
            {word.grammar && <div className="ex-grammar">💡 {word.grammar}</div>}
          </div>
        </div>
      </div>
      <div className="progress-text">{idx + 1} / {unit.words.length} · 點卡片可翻面</div>
      <div className="nav-row">
        <button className="nav-btn" disabled={idx === 0} onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }}>上一個</button>
        <button
          className="nav-btn"
          onClick={() => {
            if (idx + 1 >= unit.words.length) {
              onFinish();
              setDone(true);
            } else {
              setIdx((i) => i + 1);
              setFlipped(false);
            }
          }}
        >
          {idx + 1 >= unit.words.length ? "完成" : "下一個"}
        </button>
      </div>
      <RateControl />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Quiz：選出正確中文意思                                            */
/* ------------------------------------------------------------------ */
function Quiz({ unit, onFinish, onWordResult }) {
  const [order] = useState(() => shuffle(unit.words));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (idx >= order.length) return;
    const correct = order[idx];
    const others = shuffle(unit.words.filter((w) => w.en !== correct.en)).slice(0, 3);
    setOptions(shuffle([correct, ...others]));
    setSelected(null);
  }, [idx]);

  if (done) return <ResultBanner label={`答對 ${score} / ${order.length} 題`} onRestart={() => { setIdx(0); setScore(0); setDone(false); }} />;
  if (idx >= order.length) return null;

  const word = order[idx];

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt.en);
    const correct = opt.en === word.en;
    if (correct) {
      setScore((s) => s + 1);
      speak(wordForms(word)[0]);
    }
    onWordResult(unit, word, correct);
    setTimeout(() => {
      if (idx + 1 >= order.length) {
        onFinish();
        setDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, 800);
  };

  return (
    <div>
      <div className="quiz-word">
        <FormsSpeaker word={word} size={18} wordClassName="en-word" />
        <div style={{ fontSize: 13, color: "#6B6A5E", marginTop: 6 }}>這個單字的中文意思是？（{idx + 1}/{order.length}）</div>
      </div>
      <div className="options">
        {options.map((opt) => {
          let cls = "";
          if (selected) {
            if (opt.en === word.en) cls = "correct";
            else if (opt.en === selected) cls = "wrong";
          }
          return (
            <button key={opt.en} className={`option-btn ${cls}`} disabled={!!selected} onClick={() => choose(opt)}>
              {opt.zh}
              {selected && opt.en === word.en && <Check size={16} color="#4CAF7D" />}
              {selected === opt.en && opt.en !== word.en && <X size={16} color="#E8604C" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Matching 配對遊戲                                                  */
/* ------------------------------------------------------------------ */
function Matching({ unit, onFinish }) {
  const pairCount = Math.min(6, unit.words.length);
  const [words] = useState(() => shuffle(unit.words).slice(0, pairCount));
  const [enTiles] = useState(() => shuffle(words.map((w) => ({ key: w.en, label: w.en }))));
  const [zhTiles] = useState(() => shuffle(words.map((w) => ({ key: w.en, label: w.zh }))));
  const [selectedEn, setSelectedEn] = useState(null);
  const [selectedZh, setSelectedZh] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (selectedEn && selectedZh) {
      if (selectedEn === selectedZh) {
        const nextMatched = [...matched, selectedEn];
        setMatched(nextMatched);
        setSelectedEn(null);
        setSelectedZh(null);
        const matchedWord = words.find((w) => w.en === selectedEn);
        if (matchedWord) speak(wordForms(matchedWord)[0]);
        if (nextMatched.length === pairCount) {
          onFinish();
          setTimeout(() => setDone(true), 400);
        }
      } else {
        setWrongPair([selectedEn, selectedZh]);
        setTimeout(() => {
          setWrongPair(null);
          setSelectedEn(null);
          setSelectedZh(null);
        }, 500);
      }
    }
  }, [selectedEn, selectedZh]);

  if (done) return <ResultBanner label="全部配對成功！" onRestart={() => window.location.reload()} note="重新整理即可再玩一次" />;

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6A5E", marginBottom: 12, textAlign: "center" }}>
        點選英文與對應的中文意思（{matched.length}/{pairCount}）
      </p>
      <div className="match-grid">
        {enTiles.map((t) => {
          const isMatched = matched.includes(t.key);
          const isSelected = selectedEn === t.key;
          const isWrong = wrongPair && wrongPair[0] === t.key;
          return (
            <div
              key={t.key}
              className={`match-tile ${isMatched ? "matched" : isSelected || isWrong ? "selected" : ""}`}
              onClick={() => !isMatched && !selectedEn && setSelectedEn(t.key)}
            >
              {t.label}
            </div>
          );
        })}
        {zhTiles.map((t, i) => {
          const isMatched = matched.includes(t.key);
          const isSelected = selectedZh === t.key;
          const isWrong = wrongPair && wrongPair[1] === t.key;
          return (
            <div
              key={t.key + i}
              className={`match-tile ${isMatched ? "matched" : isSelected || isWrong ? "selected" : ""}`}
              onClick={() => !isMatched && !selectedZh && setSelectedZh(t.key)}
            >
              {t.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Fill in the blank                                                */
/* ------------------------------------------------------------------ */
function FillBlank({ unit, onFinish, onWordResult }) {
  const [order] = useState(() => shuffle(unit.words));
  const [modes] = useState(() => order.map(() => (Math.random() < 0.5 ? "choice" : "spell")));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setAnswered(false);
  }, [idx]);

  if (done) return <ResultBanner label={`答對 ${score} / ${order.length} 題`} onRestart={() => { setIdx(0); setScore(0); setDone(false); }} />;
  if (idx >= order.length) return null;

  const word = order[idx];
  const mode = modes[idx];
  const blankPos = word.blankPos || word.pos;
  const blanked = word.ex_blank || word.ex_en.replace(new RegExp(word.en, "i"), "____");

  const handleResult = (correct) => {
    setAnswered(true);
    if (correct) setScore((s) => s + 1);
    onWordResult(unit, word, correct);
    setTimeout(() => {
      if (idx + 1 >= order.length) {
        onFinish();
        setDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, correct ? 900 : 1800);
  };

  return (
    <div>
      <div className="sentence-box">
        {blanked}
        <div className="sentence-zh">{word.ex_zh}</div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <SpeakerButton text={word.ex_en} />
          <span className="blank-pos-tag">此處詞性：{blankPos}</span>
        </div>
        <RateControl />
      </div>
      {mode === "choice" ? (
        <>
          <p style={{ fontSize: 13, color: "#6B6A5E", textAlign: "center", marginBottom: 12 }}>
            選出正確的單字填入空格（{idx + 1}/{order.length}）
          </p>
          <FillBlankChoice key={idx} unit={unit} word={word} onResult={handleResult} />
          {answered && word.grammar && <div className="grammar-note">📘 {word.grammar}</div>}
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#6B6A5E", textAlign: "center", marginBottom: 12 }}>
            拼出正確的單字，填入空格（{idx + 1}/{order.length}）
          </p>
          <SpellingCard key={idx} word={word} onResult={handleResult} hidePrompt />
        </>
      )}
    </div>
  );
}

function FillBlankChoice({ unit, word, onResult }) {
  const [selected, setSelected] = useState(null);
  const [options] = useState(() => {
    const others = shuffle(unit.words.filter((w) => w.en !== word.en)).slice(0, 3);
    return shuffle([word, ...others]);
  });

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt.en);
    const correct = opt.en === word.en;
    if (correct) speak(wordForms(word)[0]);
    onResult(correct);
  };

  return (
    <div className="word-bank">
      {options.map((opt) => {
        let cls = "";
        if (selected) {
          if (opt.en === word.en) cls = "correct";
          else if (opt.en === selected) cls = "wrong";
        }
        return (
          <button key={opt.en} className={`bank-chip ${cls}`} disabled={!!selected} onClick={() => choose(opt)}>
            {opt.en}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Typing 拼字練習：聽發音、看中文，自己打出英文單字                 */
/* ------------------------------------------------------------------ */
function OnScreenKeyboard({ onKey, onBackspace, onSpace, disabled }) {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];
  return (
    <div className="osk">
      {rows.map((row, i) => (
        <div className="osk-row" key={i}>
          {row.map((k) => (
            <button key={k} type="button" className="osk-key" disabled={disabled} onClick={() => onKey(k)}>
              {k}
            </button>
          ))}
        </div>
      ))}
      <div className="osk-row osk-bottom">
        <button type="button" className="osk-key osk-space" disabled={disabled} onClick={onSpace}>
          space
        </button>
        <button type="button" className="osk-key osk-backspace" disabled={disabled} onClick={onBackspace} aria-label="刪除">
          ⌫
        </button>
      </div>
    </div>
  );
}

function SpellingCard({ word, onResult, hidePrompt = false }) {
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(null); // null | true | false
  const [hintOn, setHintOn] = useState(false);
  const displayRef = useRef(null);
  const forms = wordForms(word);

  useEffect(() => {
    if (displayRef.current) displayRef.current.focus();
  }, []);

  const submit = () => {
    if (checked !== null || !input.trim()) return;
    const correct = isCorrectSpelling(word, input);
    setChecked(correct);
    if (correct) speak(forms[0]);
    onResult(correct);
  };

  const appendChar = (ch) => {
    if (checked !== null) return;
    setInput((prev) => prev + ch);
  };
  const backspace = () => {
    if (checked !== null) return;
    setInput((prev) => prev.slice(0, -1));
  };

  // 支援電腦實體鍵盤輸入：這是一個「非原生 input」的可聚焦區塊，
  // 手機上點擊它不會叫出系統輸入法（也就不會有預測選字列），
  // 但桌機瀏覽器仍可用實體鍵盤直接打字。
  const handleKeyDown = (e) => {
    if (checked !== null) return;
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      backspace();
    } else if (e.key === " ") {
      e.preventDefault();
      appendChar(" ");
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      appendChar(e.key.toLowerCase());
    }
  };

  return (
    <div>
      {!hidePrompt && (
        <div className="sentence-box">
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{word.zh}</div>
          <div style={{ fontSize: 12, color: "#6B6A5E", marginBottom: 10 }}>{word.pos}</div>
          <SpeakerButton text={forms[0]} size={22} />
        </div>
      )}
      <div className="typing-form">
        <div
          ref={displayRef}
          tabIndex={0}
          role="textbox"
          aria-label="輸入英文拼字"
          className={`typing-input typing-display ${checked === true ? "correct" : checked === false ? "wrong" : ""}`}
          onKeyDown={handleKeyDown}
        >
          {input ? input : <span className="typing-placeholder">用下方鍵盤輸入</span>}
        </div>
        <OnScreenKeyboard disabled={checked !== null} onKey={appendChar} onSpace={() => appendChar(" ")} onBackspace={backspace} />
        {checked === null && (
          <div className="typing-actions">
            <button type="button" className="primary-btn" onClick={submit}>
              確認答案
            </button>
            <button
              type="button"
              className="hint-btn"
              onClick={() => setHintOn(true)}
              disabled={hintOn}
            >
              💡 提示
            </button>
          </div>
        )}
        {hintOn && checked === null && (
          <div className="hint-text">
            開頭提示：<span className="hint-letters">{hintLetters(forms[0])}</span>
          </div>
        )}
      </div>
      {checked !== null && (
        <div className={`typing-feedback ${checked ? "correct" : "wrong"}`}>
          {checked ? (
            "答對了！"
          ) : (
            <>
              正確拼法是：
              <FormsSpeaker word={word} size={16} wordClassName="typing-answer" />
            </>
          )}
        </div>
      )}
      {checked !== null && word.grammar && <div className="grammar-note">📘 {word.grammar}</div>}
    </div>
  );
}

function Typing({ unit, onFinish, onWordResult }) {
  const [order] = useState(() => shuffle(unit.words));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (done) return <ResultBanner label={`答對 ${score} / ${order.length} 題`} onRestart={() => { setIdx(0); setScore(0); setDone(false); }} />;
  if (idx >= order.length) return null;

  const word = order[idx];

  const handleResult = (correct) => {
    if (correct) setScore((s) => s + 1);
    onWordResult(unit, word, correct);
    setTimeout(() => {
      if (idx + 1 >= order.length) {
        onFinish();
        setDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, correct ? 900 : 1800);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6A5E", textAlign: "center", marginBottom: 12 }}>
        點喇叭聽發音，拼出正確的英文單字（{idx + 1}/{order.length}）
      </p>
      <SpellingCard key={idx} word={word} onResult={handleResult} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5b. 複習到全對：這個小節裡答錯的字會重複出現，直到每個字都答對一次    */
/* ------------------------------------------------------------------ */
function UnitMastery({ unit, onFinish, onWordResult }) {
  const [queue, setQueue] = useState(() =>
    shuffle(unit.words).map((w) => ({ word: w, mode: Math.random() < 0.5 ? "choice" : "type" }))
  );
  const [wrongCounts, setWrongCounts] = useState({});
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (queue.length === 0 && !done) {
      onFinish();
      setDone(true);
    }
  }, [queue, done]);

  if (done) {
    const missed = Object.entries(wrongCounts).sort((a, b) => b[1] - a[1]);
    const totalMistakes = missed.reduce((sum, [, count]) => sum + count, 0);
    return (
      <div className="result-banner">
        <Trophy size={36} color="#FFC857" />
        <h3 style={{ fontSize: 18 }}>這個小節全部答對了！</h3>
        <div className="stars">
          <Star size={18} color="#FFC857" fill="#FFC857" />
          <Star size={18} color="#FFC857" fill="#FFC857" />
          <Star size={18} color="#FFC857" fill="#FFC857" />
        </div>
        {missed.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6B6A5E" }}>太厲害了，一次就全對，完全沒答錯！</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#6B6A5E" }}>
              這次共有 {missed.length} 個字答錯過，總共錯了 {totalMistakes} 次
            </p>
            <div className="mistake-list">
              {missed.map(([en, count]) => (
                <div key={en} className="mistake-row">
                  <span>{en}</span>
                  <span className="mistake-count">錯 {count} 次</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button
          className="primary-btn"
          onClick={() => {
            setQueue(shuffle(unit.words).map((w) => ({ word: w, mode: Math.random() < 0.5 ? "choice" : "type" })));
            setWrongCounts({});
            setRound(0);
            setDone(false);
          }}
        >
          <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          再複習一次
        </button>
      </div>
    );
  }

  if (queue.length === 0) return null;
  const current = queue[0];
  const remaining = queue.length;

  const handleResult = (correct) => {
    const word = current.word;
    onWordResult(unit, word, correct);
    if (!correct) {
      setWrongCounts((prev) => ({ ...prev, [word.en]: (prev[word.en] || 0) + 1 }));
    }
    setTimeout(() => {
      setRound((r) => r + 1);
      setQueue((prevQueue) => {
        const rest = prevQueue.slice(1);
        if (correct) return rest;
        const insertAt = Math.min(rest.length, 3);
        const requeued = { word, mode: Math.random() < 0.5 ? "choice" : "type" };
        return [...rest.slice(0, insertAt), requeued, ...rest.slice(insertAt)];
      });
    }, correct ? 900 : 1800);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6A5E", textAlign: "center", marginBottom: 12 }}>
        還剩 {remaining} 題才能全部過關，答錯的字會再考一次
      </p>
      {current.mode === "choice" ? (
        <ReviewChoice key={round} word={current.word} onResult={handleResult} />
      ) : (
        <ReviewTyping key={round} word={current.word} onResult={handleResult} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. 複習錯題：答錯的單字會依萊特納間隔，過一段時間後隨機再次出現       */
/* ------------------------------------------------------------------ */
function ReviewChoice({ word, onResult }) {
  const [selected, setSelected] = useState(null);
  const [options] = useState(() => {
    const others = shuffle(ALL_WORDS.filter((w) => w.en !== word.en)).slice(0, 3);
    return shuffle([word, ...others]);
  });

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt.en);
    const correct = opt.en === word.en;
    if (correct) speak(wordForms(word)[0]);
    onResult(correct);
  };

  return (
    <div>
      <div className="quiz-word">
        <FormsSpeaker word={word} size={18} wordClassName="en-word" />
        <div style={{ fontSize: 13, color: "#6B6A5E", marginTop: 6 }}>這個單字的中文意思是？</div>
      </div>
      <div className="options">
        {options.map((opt) => {
          let cls = "";
          if (selected) {
            if (opt.en === word.en) cls = "correct";
            else if (opt.en === selected) cls = "wrong";
          }
          return (
            <button key={opt.en} className={`option-btn ${cls}`} disabled={!!selected} onClick={() => choose(opt)}>
              {opt.zh}
              {selected && opt.en === word.en && <Check size={16} color="#4CAF7D" />}
              {selected === opt.en && opt.en !== word.en && <X size={16} color="#E8604C" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewTyping({ word, onResult }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6A5E", textAlign: "center", marginBottom: 12 }}>
        點喇叭聽發音，拼出正確的英文單字
      </p>
      <SpellingCard word={word} onResult={onResult} />
    </div>
  );
}

function ReviewSession({ mistakes, onBack, onWordResult }) {
  const [pool] = useState(() => {
    const now = Date.now();
    const due = Object.values(mistakes)
      .filter((m) => m.nextReview <= now)
      .map((m) => {
        const word = findWord(m.unitId, m.en);
        const unit = UNITS.find((u) => u.id === m.unitId);
        return word && unit ? { unit, word, mode: Math.random() < 0.5 ? "choice" : "type" } : null;
      })
      .filter(Boolean);
    return shuffle(due);
  });
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (pool.length === 0) {
    return (
      <div>
        <div className="back-row" onClick={onBack}>
          <ArrowLeft size={16} /> 回首頁
        </div>
        <ResultBanner label="太棒了！沒有到期的複習單字" onRestart={onBack} note="去多練習幾個新單字，答錯的字會自動排入複習" />
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <div className="back-row" onClick={onBack}>
          <ArrowLeft size={16} /> 回首頁
        </div>
        <ResultBanner label={`複習了 ${pool.length} 個單字，答對 ${score} 題`} onRestart={onBack} note="點按鈕回首頁" />
      </div>
    );
  }

  const current = pool[idx];

  const handleResult = (correct) => {
    if (correct) setScore((s) => s + 1);
    onWordResult(current.unit, current.word, correct);
    setTimeout(() => {
      if (idx + 1 >= pool.length) {
        setDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, correct ? 800 : 1600);
  };

  return (
    <div>
      <div className="back-row" onClick={onBack}>
        <ArrowLeft size={16} /> 回首頁
      </div>
      <p style={{ fontSize: 13, color: "#6B6A5E", textAlign: "center", marginBottom: 10 }}>
        複習中（{idx + 1}/{pool.length}）
      </p>
      {current.mode === "choice" ? (
        <ReviewChoice key={idx} word={current.word} onResult={handleResult} />
      ) : (
        <ReviewTyping key={idx} word={current.word} onResult={handleResult} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 結果畫面                                                             */
/* ------------------------------------------------------------------ */
function ResultBanner({ label, onRestart, note }) {
  return (
    <div className="result-banner">
      <Trophy size={36} color="#FFC857" />
      <h3 style={{ fontSize: 18 }}>{label}</h3>
      <div className="stars">
        <Star size={18} color="#FFC857" fill="#FFC857" />
        <Star size={18} color="#FFC857" fill="#FFC857" />
        <Star size={18} color="#FFC857" fill="#FFC857" />
      </div>
      {note && <p style={{ fontSize: 12, color: "#6B6A5E" }}>{note}</p>}
      <button className="primary-btn" onClick={onRestart}>
        <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
        再練一次
      </button>
    </div>
  );
}

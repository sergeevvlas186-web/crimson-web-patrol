(() => {
"use strict";

const BUILD_VERSION="0.20.0";
const STORAGE_KEY="crimson_web_patrol_v20";
const LEGACY_STORAGE_KEYS=["crimson_web_patrol_v19","crimson_web_patrol_v18_1","crimson_web_patrol_v18"];
const SUPPORTED_GAME_LANGS=["ru"];
const PRESTIGE_REQUIREMENT=9000000;
const BOOST_MS=2*60*1000;
const CHEST_MS=10*60*1000;
const DAY_MS=24*60*60*1000;
const THEMES=["red","dark","light","neon"];
const TRACKS=[
  {name:"Шёлк над крышами",icon:"🌙",tempo:420,bpm:72,root:110,pattern:[0,4,7,11,7,4,2,7],bass:[0,0,5,4],energy:1},
  {name:"Багровый вальс",icon:"🔴",tempo:360,bpm:84,root:98,pattern:[0,7,11,14,9,7,4,2],bass:[0,4,5,2],energy:2},
  {name:"Неоновая акварель",icon:"🌃",tempo:330,bpm:91,root:123.47,pattern:[0,4,9,11,7,4,2,9],bass:[0,5,4,2],energy:2},
  {name:"Дождь на антеннах",icon:"🌧️",tempo:390,bpm:77,root:116.54,pattern:[0,7,9,14,11,7,4,2],bass:[0,4,2,5],energy:2},
  {name:"Хрустальный воздух",icon:"❄️",tempo:450,bpm:67,root:103.83,pattern:[0,4,7,14,11,9,7,2],bass:[0,5,4,2],energy:1},
  {name:"Орбита света",icon:"🪐",tempo:375,bpm:80,root:130.81,pattern:[0,7,11,16,14,11,7,4],bass:[0,4,5,2],energy:2},
  {name:"Тонкая тревога",icon:"🚨",tempo:285,bpm:105,root:110,pattern:[0,2,7,6,11,9,7,4],bass:[0,2,0,5],energy:3,eventOnly:true},
  {name:"Корона бездны",icon:"👑",tempo:260,bpm:115,root:82.41,pattern:[0,3,7,11,10,7,15,12],bass:[0,0,3,7],energy:4,bossOnly:true},
  {name:"Эхо Нексуса",icon:"🕳️",tempo:350,bpm:86,root:92.50,pattern:[0,7,11,4,14,11,16,9],bass:[0,4,0,7],energy:3,premium:true},
  {name:"Бархатный неон",icon:"💠",tempo:320,bpm:94,root:103.83,pattern:[0,4,11,7,14,11,16,9],bass:[0,0,5,7],energy:3,premium:true},
  {name:"Звёздный салон",icon:"✨",tempo:405,bpm:74,root:116.54,pattern:[0,7,11,16,14,9,18,14],bass:[0,7,5,4],energy:3,premium:true}
];

const upgrades={
 thread:{icon:"🧵",name:"Энергетическая нить",desc:"+1 к силе выпуска",base:12,growth:1.15,click:1,passive:0,unlockLevel:1},
 gauntlet:{icon:"🧤",name:"Импульсная перчатка",desc:"+6 к силе выпуска",base:100,growth:1.17,click:6,passive:0,unlockLevel:2},
 scanner:{icon:"📡",name:"Сканер переулков",desc:"+1 дозор/сек",base:20,growth:1.15,click:0,passive:1,unlockLevel:1},
 rooftop:{icon:"🌃",name:"Пост на крышах",desc:"+8 дозор/сек",base:220,growth:1.16,click:0,passive:8,unlockLevel:3},
 drone:{icon:"🛸",name:"Нитедрон",desc:"+60 дозор/сек",base:1800,growth:1.17,click:0,passive:60,unlockLevel:6},
 sentinel:{icon:"🦾",name:"Красный Страж",desc:"+450 дозор/сек",base:15000,growth:1.18,click:0,passive:450,unlockLevel:9},
 riders:{icon:"🏍️",name:"Ночной отряд",desc:"+3.5K дозор/сек",base:120000,growth:1.19,click:0,passive:3500,unlockLevel:13},
 wardens:{icon:"🛡️",name:"Стражи Сети",desc:"+28K дозор/сек",base:1000000,growth:1.20,click:0,passive:28000,unlockLevel:18},
 nexus:{icon:"🌌",name:"Нексус мегаполиса",desc:"+240K дозор/сек",base:9000000,growth:1.21,click:0,passive:240000,unlockLevel:25}
};

const achievementDefs=[
 {id:"first",icon:"✦",title:"Первый импульс",desc:"Выпусти сеть впервые",reward:30,check:s=>s.clicks>=1},
 {id:"level5",icon:"⬆️",title:"Растущая сила",desc:"Достигни 5 уровня",reward:1500,check:s=>s.level>=5},
 {id:"combo",icon:"⚡",title:"Без остановки",desc:"Сделай 500 выпусков сети",reward:3000,check:s=>s.clicks>=500},
 {id:"drone",icon:"🛸",title:"Технологический скачок",desc:"Купи первый Нитедрон",reward:12000,check:s=>s.levels.drone>=1},
 {id:"100k",icon:"🌆",title:"Город замечает тебя",desc:"Нейтрализуй 100K угроз",reward:20000,check:s=>s.lifetime>=100000},
 {id:"prestige",icon:"◆",title:"Наследие начинается",desc:"Сделай первый новый цикл",reward:70000,check:s=>s.prestige>=1},
 {id:"level20",icon:"🔥",title:"Багровый ветеран",desc:"Достигни 20 уровня",reward:250000,check:s=>s.level>=20},
 {id:"nexus",icon:"🌌",title:"Сеть жива",desc:"Построй Нексус мегаполиса",reward:1500000,check:s=>s.levels.nexus>=1}
];

const dailyRewardTable=[250,450,800,1400,2500,4200,7000];
const MISSION_ICONS={clicks:"🕸️",earn:"🎯",purchases:"🛠️",chests:"🧰",levels:"⭐"};

const LEVEL_ICONS=["🕯️","🧵","🔻","🌙","🛸","⚡","🦅","🦾","🔥","◆","🌃","🏍️","🔴","🛰️","👁️","🌪️","🛡️","🌌","⚔️","👑","💫","☄️","🧿","🗼","🔱","🌠","🦁","💥","🌐","🏆"];
const LEVEL_TITLES=["Новобранец","Нить пробуждается","Красный след","Ночной бегун","Техно-дозор","Импульс","Глаз крыш","Страж","Багровый огонь","Защитник района","Хозяин крыш","Командир отряда","Красный сигнал","Охотник сети","Всевидящий","Шторм улиц","Щит города","Хранитель неба","Клинок сети","Легенда","Сверхзаряд","Падающая звезда","Оракул","Башня дозора","Страж портала","Звёздный дозор","Сердце города","Живая молния","Единая сеть","Легенда мегаполиса"];

const CITY_EVENTS=[
 {icon:"👻",name:"Фантомный налёт",desc:"Неизвестные фантомы захлестнули крыши."},
 {icon:"🤖",name:"Сбой охранных дронов",desc:"Городские машины вышли из-под контроля."},
 {icon:"🦂",name:"Алый Скорпион",desc:"Бронированный наёмник прорывается в центр."},
 {icon:"🌪️",name:"Разрыв над кварталом",desc:"Энергетическая буря пожирает сигналы сети."},
 {icon:"🧪",name:"Токсичный след",desc:"Опасный выброс движется по подземным туннелям."},
 {icon:"🎭",name:"Маска Тени",desc:"Элитный преступник глушит датчики дозора."}
];

const DANGER_TIERS=[
 {label:"I",hp:1.00,reward:1.00},
 {label:"II",hp:1.25,reward:1.18},
 {label:"III",hp:1.55,reward:1.42},
 {label:"IV",hp:1.90,reward:1.72},
 {label:"V",hp:2.35,reward:2.10}
];

const HERO_LINES=["Город ещё не спит.","Вижу движение на крышах.","Сеть чувствует угрозу.","Ещё один квартал под защитой.","Нельзя терять темп.","Слышишь сирены? Я уже там.","Сегодня город будет тише.","Держим линию.","Есть контакт. Работаем.","Крыши — лучший наблюдательный пункт."];

const CHIBI_ASSETS={arsen:"assets/chibi/arsen.webp",nika:"assets/chibi/nika.webp",rey:"assets/chibi/rey.webp",mira:"assets/chibi/mira.webp",kai:"assets/chibi/kai.webp",umbra:"assets/chibi/umbra.webp"};
const VILLAIN_ASSETS={morana:"assets/villains/morana.webp",volt:"assets/villains/volt.webp",magnetron:"assets/villains/magnetron.webp",burrower:"assets/villains/burrower.webp",grimoire:"assets/villains/grimoire.webp",cryon:"assets/villains/cryon.webp",onyx:"assets/villains/onyx.webp",singular:"assets/villains/singular.webp"};
const VILLAIN_PROFILES={
 morana:{asset:"morana",name:"Морана · Алый Мираж",skin:"#9d1835",dark:"#260913",glow:"#ff5aa9",stroke:"#ffd2eb",accent:"#ff3f83",motion:"stalker"},
 volt:{asset:"volt",name:"Вольт · Нулевой Импульс",skin:"#155e72",dark:"#061c28",glow:"#63f4ff",stroke:"#dbfdff",accent:"#2fccec",motion:"glitch"},
 magnetron:{asset:"magnetron",name:"Магнетрон · Владыка Доков",skin:"#126d82",dark:"#061b29",glow:"#48edff",stroke:"#dbfdff",accent:"#ff3cae",motion:"orbit"},
 burrower:{asset:"burrower",name:"Бур · Железный Крот",skin:"#286b43",dark:"#071d16",glow:"#8cff43",stroke:"#e2ffd1",accent:"#f2a83b",motion:"crusher"},
 grimoire:{asset:"grimoire",name:"Гримуар · Фантом Тумана",skin:"#60458e",dark:"#160d2e",glow:"#d9a5ff",stroke:"#f8efff",accent:"#8ef4ff",motion:"specter"},
 cryon:{asset:"cryon",name:"Крион-Ноль · Сердце Купола",skin:"#337eaa",dark:"#071d38",glow:"#78efff",stroke:"#edfdff",accent:"#86a8ff",motion:"crusher"},
 onyx:{asset:"onyx",name:"Оникс · Пожиратель Света",skin:"#36205e",dark:"#0c0717",glow:"#cf6cff",stroke:"#f2ddff",accent:"#9d45ef",motion:"crusher"},
 singular:{asset:"singular",name:"Сингуляр · Орбитальный Разум",skin:"#24345d",dark:"#050913",glow:"#ffe39a",stroke:"#fff6d8",accent:"#d6a84c",motion:"orbit"}
};

const CHARACTERS=[
 {id:"arsen",name:"Арсен",codename:"Багровый",species:"Человек",form:"humanMale",icon:"◆",unlock:1,accent:"#ef233c",skinA:"#efbd98",skinB:"#a96149",hair:"#191216",bonus:"Универсал: +5% ко всему",all:1.05,click:1,passive:1,boss:1,event:1,reward:1},
 {id:"nika",name:"Ника",codename:"Искра",species:"Человек",form:"humanFemale",icon:"✦",unlock:1,accent:"#ff5577",skinA:"#f3c2a0",skinB:"#ad684f",hair:"#31151d",bonus:"+18% к паутине, +4% крит",all:1,click:1.18,passive:1,boss:1,event:1,reward:1,crit:.04},
 {id:"rey",name:"Рэй",codename:"Контур",species:"Биоэлектрический хищник",form:"wraith",icon:"ϟ",unlock:8,accent:"#21dff3",bonus:"+22% к пассивной сети",all:1,click:1,passive:1.22,boss:1,event:1,reward:1},
 {id:"mira",name:"Мира",codename:"Сова",species:"Крылатая ночная тварь",form:"owlbeast",icon:"◉",unlock:15,accent:"#a77cff",bonus:"+20% урона боссам, +10% наград",all:1,click:1,passive:1,boss:1.20,event:1,reward:1.10},
 {id:"kai",name:"Кай",codename:"Вектор",species:"Кристаллический зверь",form:"crystal",icon:"◇",unlock:24,accent:"#ffc14d",bonus:"+18% по событиям, +3 сек.",all:1,click:1,passive:1,boss:1,event:1.18,reward:1,timer:3},
 {id:"umbra",name:"Умбра",codename:"Бездна",species:"Теневой голем",form:"umbra",icon:"⬢",unlock:999,premium:"umbra_character",accent:"#d946ef",bonus:"Альтернатива: +10% события, +2% крит, −6% пассив",all:1,click:1,passive:.94,boss:1,event:1.10,reward:1,crit:.02}
];

const HERO_ULTIMATES={
 arsen:{icon:"◆",name:"Багровый рывок",desc:"Серия усиленных сетевых ударов.",damage:.34,burst:1.5},
 nika:{icon:"✦",name:"Искровой купол",desc:"Электрическая сеть накрывает цель.",damage:.29,burst:1.8},
 rey:{icon:"ϟ",name:"Перегрузка ядра",desc:"Контур сбрасывает накопленный заряд.",damage:.31,burst:2.15},
 mira:{icon:"◉",name:"Ночной вихрь",desc:"Сова обрушивает крылья Сети.",damage:.37,burst:1.55},
 kai:{icon:"◇",name:"Кристальный удар",desc:"Вектор создаёт разрушительный резонанс.",damage:.40,burst:1.4},
 umbra:{icon:"⬢",name:"Поглощение Бездны",desc:"Тень пожирает часть энергии цели.",damage:.36,burst:1.75}
};
const DISTRICTS=[
 {id:"roofs",city:"crimson",icon:"🏙️",name:"Красные Крыши",desc:"Ночные высотки, антенны и скоростные погони.",unlock:1,accent:"#ef233c",boss:"Морана · Алый Мираж",bossAsset:"morana",bossIcon:"🕷️",bossDesc:"Теневая охотница копирует движения героев и режет сеть алыми клинками.",bossHp:75,power:35,reward:3500,xp:300,shards:6},
 {id:"zero",city:"crimson",icon:"🏢",name:"Нулевой Сектор",desc:"Закрытый административный квартал под контролем машин.",unlock:7,accent:"#ff7b36",boss:"Вольт · Нулевой Импульс",bossAsset:"volt",bossIcon:"⚡",bossDesc:"Скоростной техно-злодей глушит сеть и отвечает импульсом на каждую атаку.",bossHp:240,power:220,reward:45000,xp:900,shards:8},

 {id:"docks",city:"neon",icon:"⚓",name:"Неоновые Докы",desc:"Контрабандные терминалы и автономные грузовые краны.",unlock:10,accent:"#16d9ff",boss:"Магнетрон · Владыка Доков",bossAsset:"magnetron",bossIcon:"🧲",bossDesc:"Магнитный контрабандист поднимает краны и контейнеры одной мыслью.",bossHp:480,power:520,reward:150000,xp:1600,shards:10},
 {id:"underground",city:"neon",icon:"🚇",name:"Подземный Контур",desc:"Заброшенные линии метро скрывают нелегальные лаборатории.",unlock:16,accent:"#21d18a",boss:"Бур · Железный Крот",bossAsset:"burrower",bossIcon:"🦡",bossDesc:"Буровой организм в тяжёлом экзоскелете проламывает линии Сети.",bossHp:1100,power:1600,reward:1200000,xp:3400,shards:12},

 {id:"mist",city:"frost",icon:"🌫️",name:"Белый Туман",desc:"Замёрзшие башни теряются в оптических миражах.",unlock:22,accent:"#a77cff",boss:"Гримуар · Фантом Тумана",bossAsset:"grimoire",bossIcon:"🎭",bossDesc:"Элегантный фантом расщепляет себя на ледяные ложные цели.",bossHp:2200,power:4500,reward:6000000,xp:7200,shards:16},
 {id:"frost",city:"frost",icon:"❄️",name:"Ледяной Купол",desc:"Криогенный промышленный пояс вокруг климатического ядра.",unlock:28,accent:"#7fd8ff",boss:"Крион-Ноль · Сердце Купола",bossAsset:"cryon",bossIcon:"🧊",bossDesc:"Живой криокристалл замораживает энергетическую сеть изнутри.",bossHp:4800,power:13000,reward:30000000,xp:15000,shards:20},

 {id:"nexus",city:"astra",icon:"🌌",name:"Разлом Нексуса",desc:"Гравитационные провалы и нестабильные линии реальности.",unlock:34,accent:"#d946ef",boss:"Оникс · Пожиратель Света",bossAsset:"onyx",bossIcon:"⬢",bossDesc:"Обсидиановый двойник Кая поглощает свет и накапливает энергию в ядре Бездны.",bossHp:10000,power:36000,reward:160000000,xp:30000,shards:25},
 {id:"orbital",city:"astra",icon:"🛰️",name:"Орбитальный Узел",desc:"Последняя платформа сети над атмосферой города.",unlock:42,accent:"#ffc14d",boss:"Сингуляр · Орбитальный Разум",bossAsset:"singular",bossIcon:"☀️",bossDesc:"Звёздный разум сжимает свет и гравитацию в своём ядре.",bossHp:22000,power:100000,reward:900000000,xp:60000,shards:35}
];

const CITIES=[
 {id:"crimson",icon:"🌆",name:"Багровый Мегаполис",unlock:1,accent:"#ef233c",weather:"Тёплый дождь",risk:"Агрессивный",special:"Клики / события",contract:"Красная тревога",desc:"Вертикальный мегаполис сирен, крыш и скоростных погонь.",contractDesc:"Ручная паутина сильнее, события появляются чаще, а риск растёт быстрее.",click:1.14,passive:1.00,reward:1.08,shop:1.00,eventDelay:.78,timer:1.00,xp:1.00,track:1,resource:"Устранено угроз",passiveLabel:"Патруль / сек",chest:"Контейнер на крыше",shopTitle:"Уличный арсенал",shopSubtitle:"Скорость, паутина и мобильные посты",chips:["+14% к клику","+8% награды","события чаще"],districts:["roofs","zero"]},
 {id:"neon",icon:"🌃",name:"Неоновая Гавань",unlock:10,accent:"#16d9ff",weather:"Ионный смог",risk:"Техничный",special:"Пассивная сеть",contract:"Автоматизация",desc:"Портовый техногород, где сеть можно превратить в автономную систему.",contractDesc:"Дозор приносит больше, улучшения дешевле, а события происходят чуть реже.",click:1.00,passive:1.20,reward:1.04,shop:.94,eventDelay:1.12,timer:1.00,xp:1.00,track:2,resource:"Перехвачено целей",passiveLabel:"Сеть / сек",chest:"Грузовой кэш",shopTitle:"Техно-лаборатория",shopSubtitle:"Дроны, сенсоры и автономные узлы",chips:["+20% пассивно","−6% цены","спокойнее события"],districts:["docks","underground"]},
 {id:"frost",icon:"❄️",name:"Полярный Ковчег",unlock:22,accent:"#8bdefd",weather:"Криоснег",risk:"Выживательный",special:"XP / время",contract:"Холодный расчёт",desc:"Изолированная аркология под ледяным куполом и вечной метелью.",contractDesc:"Больше времени на события, больше XP, но обычные награды немного ниже.",click:1.02,passive:1.04,reward:.94,shop:.98,eventDelay:1.04,timer:1.16,xp:1.22,track:4,resource:"Стабилизировано аномалий",passiveLabel:"Стабилизация / сек",chest:"Криокапсула",shopTitle:"Крио-мастерская",shopSubtitle:"Защита, стабилизация и холодные модули",chips:["+16% таймер","+22% XP","−6% наград"],districts:["mist","frost"]},
 {id:"astra",icon:"🪐",name:"Астра-Сити",unlock:34,accent:"#ffc14d",weather:"Звёздная пыль",risk:"Эндгейм",special:"Боссы / лут",contract:"Высшая охота",desc:"Орбитальная столица, где городская сеть касается космических разломов.",contractDesc:"Боссы и события опаснее, зато охотничьи награды значительно выше.",click:1.06,passive:1.06,reward:1.28,shop:1.05,eventDelay:.92,timer:.96,xp:1.10,track:5,resource:"Закрыто разломов",passiveLabel:"Резонанс / сек",chest:"Орбитальный контейнер",shopTitle:"Астральный арсенал",shopSubtitle:"Резонаторы, порталы и высокоэнергетические узлы",chips:["+28% награды","+10% XP","дороже магазин"],districts:["nexus","orbital"]}
];


const CITY_HERO_LINES={
 crimson:["Дождь скрывает шаги. Мне подходит.","Крыши снова шумят.","Красная тревога. Работаем быстро."],
 neon:["Сеть порта уже у меня на ладони.","Слишком много сигнала. Найдём нужный.","Пусть дроны делают часть работы."],
 frost:["Холод замедляет всё, кроме нас.","В метели слух полезнее зрения.","Держим купол стабильным."],
 astra:["Здесь город заканчивается, а охота — нет.","Гравитация ведёт себя странно.","Нексус снова смотрит в нашу сторону."]
};
const CITY_EVENT_POOLS={
 crimson:[
 {icon:"🐺",name:"Стая на крышах",desc:"Бронированные рейдеры захватывают верхние уровни."},
 {icon:"🚨",name:"Красный конвой",desc:"Преступный караван прорывается через центр."},
 {icon:"🦂",name:"Алый Скорпион",desc:"Наёмник в панцире охотится на патруль."},
  {icon:"🎭",name:"Маска Тени",desc:"Диверсант глушит камеры и ложные маяки."},
  {icon:"🕷️",name:"Вторжение Алого Миража",desc:"Морана вышла на охоту и зеркалит атаки патруля.",villainAsset:"morana"}
 ],
 neon:[
  {icon:"🤖",name:"Рой дронов",desc:"Портовые машины синхронно вышли из-под контроля.",villainAsset:"magnetron"},
  {icon:"🧲",name:"Магнитный шторм",desc:"Контейнеры и краны сорвались с креплений.",villainAsset:"magnetron"},
  {icon:"⚡",name:"Перегрузка сети",desc:"Неоновая инфраструктура работает на критическом напряжении."},
  {icon:"🧪",name:"Лабораторная утечка",desc:"Из подземного комплекса вырвался экспериментальный организм.",villainAsset:"burrower"},
  {icon:"⚡",name:"Нулевой Импульс",desc:"Вольт перехватил энергосеть порта и вызывает перегрузки.",villainAsset:"volt"}
 ],
 frost:[
  {icon:"🌫️",name:"Белый фантом",desc:"Аномалия скрывает целый сектор в ледяном тумане.",villainAsset:"grimoire"},
  {icon:"🧊",name:"Крио-голем",desc:"Замёрзший промышленный автомат ожил.",villainAsset:"cryon"},
  {icon:"🌨️",name:"Сверхметель",desc:"Сеть теряет связь между секторами.",villainAsset:"grimoire"},
  {icon:"👁️",name:"Полярный наблюдатель",desc:"Неизвестное существо следит из снежной стены.",villainAsset:"cryon"}
 ],
 astra:[
  {icon:"🕳️",name:"Малый разлом",desc:"Пространство рвётся прямо над жилым сектором."},
  {icon:"☄️",name:"Осколочный дождь",desc:"Орбитальный мусор пробивает защитные поля.",villainAsset:"singular"},
  {icon:"🧿",name:"Глаз Нексуса",desc:"Сеть сама выбирает цели и перестаёт слушаться.",villainAsset:"singular"},
  {icon:"👾",name:"Звёздный паразит",desc:"Чужая форма жизни закрепилась на энергетическом узле.",villainAsset:"onyx"},
  {icon:"⬢",name:"Пожиратель Света",desc:"Оникс вышел из разлома и гасит орбитальные маяки.",villainAsset:"onyx"}
 ]
};




const PREMIUM_PRODUCTS=[
 {id:"shards_80",icon:"💎",title:"80 Осколков",desc:"Небольшой запас Осколков Нексуса.",type:"consumable",accent:"#71e8ff",grant:{shards:80}},
 {id:"shards_250",icon:"💎",title:"250 Осколков",desc:"Запас для нескольких редких эффектов.",type:"consumable",accent:"#47d9ff",grant:{shards:250}},
 {id:"shards_700",icon:"💠",title:"700 Осколков",desc:"Большой запас для коллекции.",type:"consumable",accent:"#b17cff",grant:{shards:700}},
 {id:"founder_pack",icon:"👑",title:"Набор Основателя",desc:"Красная паутина, 120 Осколков и значок профиля.",type:"permanent",accent:"#ff6578",entitlement:"founder"},
 {id:"umbra_character",icon:"⬢",title:"Умбра · Бездна",desc:"Коллекционная форма теневого голема с альтернативной сборкой.",type:"permanent",accent:"#d946ef",entitlement:"umbra"},
 {id:"void_web_fx",icon:"🕸️",title:"Паутина Бездны",desc:"Фиолетовый пространственный эффект паутины.",type:"permanent",accent:"#d946ef",entitlement:"voidWeb"},
 {id:"music_pack_night",icon:"🎧",title:"Ночные Частоты",desc:"Три дополнительных изящных саундтрека.",type:"permanent",accent:"#21dff3",entitlement:"nightMusic"}
];

const WEB_FX=[
 {id:"classic",name:"Классическая",icon:"🕸️",color:"#bff7ff",glow:"#68ddff"},
 {id:"neon",name:"Неоновая",icon:"⚡",color:"#65fff0",glow:"#16d9ff"},
 {id:"frost",name:"Ледяная",icon:"❄️",color:"#e3f8ff",glow:"#84dfff"},
 {id:"solar",name:"Солнечная",icon:"☀️",color:"#ffe8a0",glow:"#ffc14d"},
 {id:"void",name:"Бездна",icon:"🕳️",color:"#f19bff",glow:"#d946ef"},
 {id:"founder",name:"Основатель",icon:"👑",color:"#ff9daf",glow:"#ef233c"}
];

const SHARD_STORE_ITEMS=[
 {id:"web_neon",kind:"webfx",value:"neon",icon:"⚡",name:"Неоновая паутина",desc:"Бирюзовый электрический след.",cost:100},
 {id:"web_frost",kind:"webfx",value:"frost",icon:"❄️",name:"Ледяная паутина",desc:"Холодные светлые нити.",cost:130},
 {id:"web_solar",kind:"webfx",value:"solar",icon:"☀️",name:"Солнечная паутина",desc:"Золотые энергетические нити.",cost:180}
];

const fresh=()=>({
 threats:0,lifetime:0,clicks:0,purchases:0,prestige:0,
 level:1,xp:0,levelsGained:0,
 boostUntil:0,nextChestAt:0,chestsOpened:0,
 eventWins:0,eventStreak:0,eventNextAt:Date.now()+25000,feverUntil:0,bossWins:0,
 dangerTier:1,dangerWins:0,tactics:{striker:0,network:0,hunter:0},
 selectedDistrict:0,districtsCleared:[],
 selectedCharacter:"arsen",charactersUnlocked:["arsen","nika"],selectedCity:"crimson",
 levels:Object.fromEntries(Object.keys(upgrades).map(k=>[k,0])),
 achievementClaimed:[],
 dailyKey:"",dailyMissions:[],dailyClaimed:[],dailyBase:null,
 lastDailyAt:0,dailyStreak:0,
 theme:"red",sfxEnabled:true,musicEnabled:true,musicAuto:true,selectedTrack:0,
 nexusShards:0,premiumEntitlements:[],processedPurchaseTokens:[],ownedWebFx:["classic"],activeWebFx:"classic",shardItemsOwned:[],founderBadge:false,onboardingDone:false,
 tutorialDone:false,tutorialStep:0,tutorialClicks:0,ultimateCharge:0,
 buyMode:1,
 riftCharge:0,riftRuns:0,lastRiftClaimAt:0,
 savedAt:Date.now(),incomingRef:"",refProcessed:false
});

let state=fresh();
let ysdk=null,player=null,payments=null,sdkReady=false,paymentsReady=false,adBusy=false,gameplayStopped=true;
let lastTick=performance.now(),lastHeavy=0,combo=1,comboClicks=0,lastClick=0;
let toastTimer=null,cloudTimer=null,playerId="",audioCtx=null,musicBus=null,musicTimer=null,trackTimer=null,trackIndex=0,musicStarted=false;
let activeCityEvent=null,heroSpeechTimer=null,lastMusicContext="normal",eventAutoAccumulator=0,paymentCatalog=new Map();
let eventClearTimer=null,tutorialActive=false,tutorialFocusEl=null;
let platformPaused=false,gameReadySent=false,platformLanguage="ru",resolvedGameLanguage="ru",cloudLoaded=false,playableUiActivated=false;
const rcDebug=new URLSearchParams(location.search).get("rc-debug")==="1";

const $=id=>document.getElementById(id);
const el={
 heroStage:document.querySelector(".hero-stage"),comicBg:document.querySelector(".comic-bg"),
 threats:$("threats"),perSecond:$("perSecond"),clickPower:$("clickPower"),topThreats:$("topThreats"),topPerSecond:$("topPerSecond"),centerThreats:$("centerThreats"),centerGain:$("centerGain"),topHeroAvatar:$("topHeroAvatar"),topCityIcon:$("topCityIcon"),topCityName:$("topCityName"),topDistrictName:$("topDistrictName"),
 totalClicks:$("totalClicks"),lifetimeThreats:$("lifetimeThreats"),totalPurchases:$("totalPurchases"),eventWins:$("eventWins"),prestigeCount:$("prestigeCount"),
 rankText:$("rankText"),rankFill:$("rankFill"),xpText:$("xpText"),levelBonus:$("levelBonus"),levelUpBtn:$("levelUpBtn"),
 boostBadge:$("boostBadge"),boostTime:$("boostTime"),prestigeBadge:$("prestigeBadge"),dangerBadge:$("dangerBadge"),feverBadge:$("feverBadge"),comboBadge:$("comboBadge"),heroBadge:$("heroBadge"),cityBadge:$("cityBadge"),districtBadge:$("districtBadge"),trackBadge:$("trackBadge"),
 heroButton:$("heroButton"),heroVisual:$("heroVisual"),enemyVisual:$("enemyVisual"),targetPulse:$("targetPulse"),screenWebOverlay:$("screenWebOverlay"),
 ultimatePanel:$("ultimatePanel"),ultimateBtn:$("ultimateBtn"),ultimateIcon:$("ultimateIcon"),ultimateName:$("ultimateName"),ultimateHint:$("ultimateHint"),ultimateFill:$("ultimateFill"),ultimatePercent:$("ultimatePercent"),
 rewardBtn:$("rewardBtn"),rewardHint:$("rewardHint"),chestBtn:$("chestBtn"),chestHint:$("chestHint"),dailyBtn:$("dailyBtn"),dailyHint:$("dailyHint"),
 riftTitle:$("riftTitle"),riftHint:$("riftHint"),riftFill:$("riftFill"),riftBtn:$("riftBtn"),bossRushBtn:$("bossRushBtn"),bossRushName:$("bossRushName"),bossRushHint:$("bossRushHint"),bossRushVisual:$("bossRushVisual"),
 shopList:$("shopList"),dailyMissionList:$("dailyMissionList"),worldSwitcher:$("worldSwitcher"),districtList:$("districtList"),mapProgress:$("mapProgress"),characterList:$("characterList"),heroCollectionStatus:$("heroCollectionStatus"),
 resourceLabel:$("resourceLabel"),passiveLabel:$("passiveLabel"),chestTitle:$("chestTitle"),shopWorldTitle:$("shopWorldTitle"),shopWorldSubtitle:$("shopWorldSubtitle"),
 mapWorldTitle:$("mapWorldTitle"),mapWorldSubtitle:$("mapWorldSubtitle"),worldContractIcon:$("worldContractIcon"),worldContractTitle:$("worldContractTitle"),worldContractDesc:$("worldContractDesc"),worldModifierChips:$("worldModifierChips"),levelList:$("levelList"),levelPathStatus:$("levelPathStatus"),tacticPoints:$("tacticPoints"),strikerInfo:$("strikerInfo"),networkInfo:$("networkInfo"),hunterInfo:$("hunterInfo"),achievementList:$("achievementList"),
 dailyDot:$("dailyDot"),achievementDot:$("achievementDot"),dailyDateText:$("dailyDateText"),sideGiftDot:$("sideGiftDot"),
 prestigeBtn:$("prestigeBtn"),prestigeDesc:$("prestigeDesc"),buyModeBtn:$("buyModeBtn"),
 vaultBtn:$("vaultBtn"),shardBalanceTop:$("shardBalanceTop"),inviteBtn:$("inviteBtn"),themeBtn:$("themeBtn"),mobileThemeBtn:$("mobileThemeBtn"),musicBtn:$("musicBtn"),soundBtn:$("soundBtn"),infoBtn:$("infoBtn"),
 musicModal:$("musicModal"),themeModal:$("themeModal"),dailyModal:$("dailyModal"),inviteModal:$("inviteModal"),welcomeModal:$("welcomeModal"),victoryModal:$("victoryModal"),infoModal:$("infoModal"),
 victoryBossVisual:$("victoryBossVisual"),victoryBossName:$("victoryBossName"),victoryBossText:$("victoryBossText"),victoryReward:$("victoryReward"),victoryXp:$("victoryXp"),victoryUnlockBox:$("victoryUnlockBox"),victoryUnlock:$("victoryUnlock"),victoryContinueBtn:$("victoryContinueBtn"),
 tutorialOverlay:$("tutorialOverlay"),tutorialEyebrow:$("tutorialEyebrow"),tutorialTitle:$("tutorialTitle"),tutorialText:$("tutorialText"),tutorialProgressFill:$("tutorialProgressFill"),tutorialProgressText:$("tutorialProgressText"),tutorialSkipBtn:$("tutorialSkipBtn"),
 eventClearBanner:$("eventClearBanner"),eventClearIcon:$("eventClearIcon"),eventClearTitle:$("eventClearTitle"),eventClearReward:$("eventClearReward"),levelBurst:$("levelBurst"),levelBurstValue:$("levelBurstValue"),levelBurstReward:$("levelBurstReward"),
 releaseSplash:$("releaseSplash"),releaseLoadFill:$("releaseLoadFill"),releaseLoadText:$("releaseLoadText"),
 rcDiagnostics:$("rcDiagnostics"),rcDiagClose:$("rcDiagClose"),diagSdk:$("diagSdk"),diagReady:$("diagReady"),diagLang:$("diagLang"),diagPlayer:$("diagPlayer"),diagCloud:$("diagCloud"),diagPayments:$("diagPayments"),diagGameplay:$("diagGameplay"),diagFocus:$("diagFocus"),
 musicToggleBtn:$("musicToggleBtn"),musicAutoBtn:$("musicAutoBtn"),musicTrackList:$("musicTrackList"),
 shardBalance:$("shardBalance"),iapStatus:$("iapStatus"),iapProductList:$("iapProductList"),shardStoreList:$("shardStoreList"),webFxPicker:$("webFxPicker"),restorePurchasesBtn:$("restorePurchasesBtn"),welcomeGuestBtn:$("welcomeGuestBtn"),welcomeAuthBtn:$("welcomeAuthBtn"),
 dailyRewardDays:$("dailyRewardDays"),dailyRewardText:$("dailyRewardText"),claimDailyBtn:$("claimDailyBtn"),
 inviteCode:$("inviteCode"),shareInviteBtn:$("shareInviteBtn"),authBtn:$("authBtn"),referralStatus:$("referralStatus"),
 cityEvent:$("cityEvent"),eventIcon:$("eventIcon"),eventName:$("eventName"),eventDesc:$("eventDesc"),eventTimer:$("eventTimer"),eventHpFill:$("eventHpFill"),eventHpText:$("eventHpText"),eventReward:$("eventReward"),heroSpeech:$("heroSpeech"),
 resetBtn:$("resetBtn"),toast:$("toast")
};

function safeNum(v){v=Number(v);return Number.isFinite(v)&&v>=0?v:0}
function sanitize(raw){
  const d=fresh();if(!raw||typeof raw!=="object")return d;
  for(const k of["threats","lifetime","clicks","purchases","prestige","level","xp","levelsGained","boostUntil","nextChestAt","chestsOpened","eventWins","eventStreak","eventNextAt","feverUntil","bossWins","dangerTier","dangerWins","selectedDistrict","lastDailyAt","dailyStreak","savedAt","riftCharge","riftRuns","lastRiftClaimAt"]) d[k]=safeNum(raw[k]);
  d.level=Math.max(1,Math.floor(d.level));d.clicks=Math.floor(d.clicks);d.purchases=Math.floor(d.purchases);d.prestige=Math.floor(d.prestige);d.levelsGained=Math.floor(d.levelsGained);d.chestsOpened=Math.floor(d.chestsOpened);d.eventWins=Math.floor(d.eventWins);d.eventStreak=Math.floor(d.eventStreak);d.bossWins=Math.floor(d.bossWins);d.dangerTier=Math.min(5,Math.max(1,Math.floor(d.dangerTier||1)));d.dangerWins=Math.floor(d.dangerWins);d.selectedDistrict=Math.min(DISTRICTS.length-1,Math.floor(d.selectedDistrict));d.dailyStreak=Math.floor(d.dailyStreak);
  d.tactics={striker:Math.floor(safeNum(raw.tactics?.striker)),network:Math.floor(safeNum(raw.tactics?.network)),hunter:Math.floor(safeNum(raw.tactics?.hunter))};
  if(!d.eventNextAt)d.eventNextAt=Date.now()+25000;
  for(const k of Object.keys(upgrades)) d.levels[k]=Math.floor(safeNum(raw.levels?.[k]));
  d.achievementClaimed=Array.isArray(raw.achievementClaimed)?raw.achievementClaimed.filter(id=>achievementDefs.some(a=>a.id===id)):[];
  d.dailyKey=typeof raw.dailyKey==="string"?raw.dailyKey:"";
  d.dailyMissions=Array.isArray(raw.dailyMissions)?raw.dailyMissions:[];
  d.dailyClaimed=Array.isArray(raw.dailyClaimed)?raw.dailyClaimed:[];
  d.dailyBase=raw.dailyBase&&typeof raw.dailyBase==="object"?raw.dailyBase:null;
  d.theme=THEMES.includes(raw.theme)?raw.theme:"red";
  d.sfxEnabled=raw.sfxEnabled!==false;d.musicEnabled=raw.musicEnabled!==false;d.musicAuto=raw.musicAuto!==false;
  d.selectedTrack=Math.min(TRACKS.length-1,Math.floor(safeNum(raw.selectedTrack)));
  d.districtsCleared=Array.isArray(raw.districtsCleared)?raw.districtsCleared.filter(id=>DISTRICTS.some(x=>x.id===id)):[];
  d.charactersUnlocked=Array.isArray(raw.charactersUnlocked)?raw.charactersUnlocked.filter(id=>CHARACTERS.some(x=>x.id===id)):["arsen","nika"];
  for(const c of CHARACTERS)if(!c.premium&&d.level>=c.unlock&&!d.charactersUnlocked.includes(c.id))d.charactersUnlocked.push(c.id);
  if(!d.charactersUnlocked.includes("arsen"))d.charactersUnlocked.unshift("arsen");
  if(!d.charactersUnlocked.includes("nika"))d.charactersUnlocked.push("nika");
  d.selectedCharacter=d.charactersUnlocked.includes(raw.selectedCharacter)?raw.selectedCharacter:"arsen";
  d.selectedCity=CITIES.some(c=>c.id===raw.selectedCity)?raw.selectedCity:"crimson";
  d.nexusShards=Math.floor(safeNum(raw.nexusShards));
  d.premiumEntitlements=Array.isArray(raw.premiumEntitlements)?raw.premiumEntitlements.filter(x=>typeof x==="string"):[];
  d.processedPurchaseTokens=Array.isArray(raw.processedPurchaseTokens)?raw.processedPurchaseTokens.filter(x=>typeof x==="string").slice(-120):[];
  d.ownedWebFx=Array.isArray(raw.ownedWebFx)?raw.ownedWebFx.filter(id=>WEB_FX.some(x=>x.id===id)):["classic"];
  if(!d.ownedWebFx.includes("classic"))d.ownedWebFx.unshift("classic");
  d.activeWebFx=d.ownedWebFx.includes(raw.activeWebFx)?raw.activeWebFx:"classic";
  d.shardItemsOwned=Array.isArray(raw.shardItemsOwned)?raw.shardItemsOwned.filter(x=>typeof x==="string"):[];
  d.founderBadge=!!raw.founderBadge;d.onboardingDone=!!raw.onboardingDone;
  d.tutorialDone=!!raw.tutorialDone;d.tutorialStep=Math.min(4,Math.floor(safeNum(raw.tutorialStep)));d.tutorialClicks=Math.floor(safeNum(raw.tutorialClicks));d.ultimateCharge=Math.min(100,safeNum(raw.ultimateCharge));
  d.buyMode=[1,10,25].includes(raw.buyMode)?raw.buyMode:1;
  d.riftCharge=Math.max(0,Math.min(100,safeNum(raw.riftCharge)));d.riftRuns=Math.floor(safeNum(raw.riftRuns));d.lastRiftClaimAt=safeNum(raw.lastRiftClaimAt);
  d.incomingRef=typeof raw.incomingRef==="string"?raw.incomingRef:"";d.refProcessed=!!raw.refProcessed;
  return d;
}

function fmt(n){
  n=safeNum(n);if(n<1000)return Math.floor(n).toLocaleString("ru-RU");
  for(const[v,s]of[[1e18,"Qi"],[1e15,"Q"],[1e12,"T"],[1e9,"B"],[1e6,"M"],[1e3,"K"]]){
    if(n>=v){const x=n/v,d=x>=100?0:x>=10?1:2;return x.toFixed(d).replace(".",",")+s}
  }return String(Math.floor(n));
}
function localDateKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function secondsUntilMidnight(){
  const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0);
  return Math.max(0,Math.floor((next-now)/1000));
}
function xpNeed(level=state.level){return Math.floor(100+95*Math.pow(level-1,1.35))}

function riftGainBase(){return .55+state.tactics.hunter*.08+(activeCityEvent?.boss?0.35:0)}
function addRiftCharge(amount){
  const before=state.riftCharge||0;
  state.riftCharge=Math.max(0,Math.min(100,before+amount));
  if(before<100&&state.riftCharge>=100){
    toast("Тёмный Разлом стабилизирован! Открой сверхнаграду.");
    showHeroSpeech("Разлом открыт. Забираем добычу, пока он не погас.");
    sfx("claim");
  }
}
function currentDistrictBoss(){return selectedDistrictDef()}
function canStartCurrentBoss(){const d=currentDistrictBoss();return !!(d&&d.city===state.selectedCity&&state.level>=d.unlock&&!activeCityEvent)}
function claimRift(){
  if((state.riftCharge||0)<100)return;
  const base=Math.max(250,Math.floor((combatRating()+state.level*40)*(1+state.riftRuns*.04)));
  const shard=4+Math.floor(state.riftRuns/3)+(Math.random()<.25?3:0);
  const xp=30+state.level*8+Math.floor(Math.random()*20);
  const jackpots=["Стабильное ядро","Элитный импульс","Редкий след охоты","Фантомный осколок"];
  const rare=Math.random()<.28?jackpots[Math.floor(Math.random()*jackpots.length)]:"";
  addThreats(base); gainXp(xp); state.nexusShards+=shard; state.riftRuns=(state.riftRuns||0)+1; state.lastRiftClaimAt=Date.now(); state.riftCharge=0;
  if(rare)toast(`Тёмный Разлом: +${fmt(base)} угроз, +${xp} XP, +${shard} оск. и бонус «${rare}»`);
  else toast(`Тёмный Разлом: +${fmt(base)} угроз, +${xp} XP и +${shard} оск.`);
  showHeroSpeech(rare?`Разлом выбросил артефакт: ${rare}. Неплохо.`:"Разлом схлопнулся. Добыча у нас.");
  persist(true); renderAll();
}
function updateStage3DFromPoint(clientX,clientY){
  if(!el.heroStage)return;
  const rect=el.heroStage.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const dx=Math.max(-1,Math.min(1,(clientX-cx)/(rect.width/2)));
  const dy=Math.max(-1,Math.min(1,(clientY-cy)/(rect.height/2)));
  document.documentElement.style.setProperty('--stage-tilt-y',`${(-dx*9).toFixed(2)}deg`);
  document.documentElement.style.setProperty('--stage-tilt-x',`${(dy*5.5).toFixed(2)}deg`);
  document.documentElement.style.setProperty('--stage-counter-y',`${(dx*10.8).toFixed(2)}deg`);
  document.documentElement.style.setProperty('--stage-counter-x',`${(-dy*3.6).toFixed(2)}deg`);
  document.documentElement.style.setProperty('--parallax-x',`${(dx*14).toFixed(1)}px`);
  document.documentElement.style.setProperty('--parallax-y',`${(dy*8).toFixed(1)}px`);
  document.documentElement.style.setProperty('--figure-look-x',`${(dx*5.5).toFixed(2)}deg`);
  document.documentElement.style.setProperty('--figure-look-y',`${(-dy*3.5).toFixed(2)}deg`);
}
function resetStage3D(){
  document.documentElement.style.setProperty('--stage-tilt-y','0deg');
  document.documentElement.style.setProperty('--stage-tilt-x','0deg');
  document.documentElement.style.setProperty('--stage-counter-y','0deg');
  document.documentElement.style.setProperty('--stage-counter-x','0deg');
  document.documentElement.style.setProperty('--parallax-x','0px');
  document.documentElement.style.setProperty('--parallax-y','0px');
  document.documentElement.style.setProperty('--figure-look-x','0deg');
  document.documentElement.style.setProperty('--figure-look-y','0deg');
}


function selectedCityDef(s=state){return CITIES.find(c=>c.id===s.selectedCity)||CITIES[0]}
function cityClickMult(){return selectedCityDef().click}
function cityPassiveMult(s=state){return selectedCityDef(s).passive}
function cityRewardMult(){return selectedCityDef().reward}
function cityShopMult(){return selectedCityDef().shop}
function cityTimerMult(){return selectedCityDef().timer}
function cityXpMult(){return selectedCityDef().xp}
function cityEventDelayMult(){return selectedCityDef().eventDelay}
function cityDistricts(){const c=selectedCityDef();return DISTRICTS.filter(d=>c.districts.includes(d.id))}
function unlockCitiesForLevel(){return CITIES.filter(c=>state.level>=c.unlock)}

function selectedCharacterDef(s=state){return CHARACTERS.find(c=>c.id===s.selectedCharacter)||CHARACTERS[0]}
function characterAllMult(s=state){return selectedCharacterDef(s).all||1}
function characterClickMult(){return selectedCharacterDef().click||1}
function characterPassiveMult(s=state){return selectedCharacterDef(s).passive||1}
function characterBossMult(){return selectedCharacterDef().boss||1}
function characterEventMult(){return selectedCharacterDef().event||1}
function characterRewardMult(){return selectedCharacterDef().reward||1}
function characterCritBonus(){return selectedCharacterDef().crit||0}
function characterTimerBonus(){return selectedCharacterDef().timer||0}
function unlockCharactersForLevel(){
  let changed=false;
  for(const c of CHARACTERS){
    if(!c.premium&&state.level>=c.unlock&&!state.charactersUnlocked.includes(c.id)){state.charactersUnlocked.push(c.id);changed=true;toast(`Новый герой: ${c.name} «${c.codename}»`)}
  }
  if(changed)persist(true);
}

function levelMultiplier(s=state){return 1+(s.level-1)*.045}
function prestigeMultiplier(s=state){return 1+s.prestige*.45}
function boosted(){return Date.now()<state.boostUntil}
function cityFever(){return Date.now()<state.feverUntil}
function totalMultiplier(){return levelMultiplier()*prestigeMultiplier()*characterAllMult()*(boosted()?2:1)*(cityFever()?1.5:1)}
function baseClick(s=state){return 1+Object.entries(upgrades).reduce((sum,[k,u])=>sum+s.levels[k]*u.click,0)}
function basePassive(s=state){return Object.entries(upgrades).reduce((sum,[k,u])=>sum+s.levels[k]*u.passive,0)}
function clickPower(){return baseClick()*totalMultiplier()*(1+state.tactics.striker*.12)*characterClickMult()*cityClickMult()}
function passive(){return basePassive()*totalMultiplier()*(1+state.tactics.network*.14)*characterPassiveMult()*cityPassiveMult()}

function tacticPointsEarned(){return Math.floor(state.level/5)}
function tacticPointsSpent(){return state.tactics.striker+state.tactics.network+state.tactics.hunter}
function tacticPointsAvailable(){return Math.max(0,tacticPointsEarned()-tacticPointsSpent())}
function dangerDef(){return DANGER_TIERS[Math.min(4,Math.max(0,state.dangerTier-1))]}
function hunterRewardMultiplier(){return (1+state.tactics.hunter*.12)*characterRewardMult()*cityRewardMult()}
function critChance(){return Math.min(.38,.06+state.tactics.striker*.025+(activeCityEvent?.boss?state.tactics.hunter*.01:0)+characterCritBonus())}
function combatRating(){
  return Math.floor(clickPower()*4+Math.sqrt(passive()+1)*20+state.level*5+tacticPointsSpent()*18);
}
function combatHitDamage(){
  let dmg=Math.max(1,Math.floor(1+Math.pow(clickPower(),.50)*1.20*combo));
  let crit=Math.random()<critChance();
  if(crit)dmg=Math.floor(dmg*2.05);
  dmg=Math.floor(dmg*(activeCityEvent?.boss?characterBossMult():characterEventMult()));
  if(activeCityEvent?.boss&&activeCityEvent.hp/activeCityEvent.maxHp<.5)dmg=Math.max(1,Math.floor(dmg*.86));
  return {damage:dmg,crit};
}
function supportDamagePerSecond(){
  if(passive()<=0)return 0;
  return Math.max(1,Math.floor(Math.pow(passive()+1,.42)*.45*(1+state.tactics.network*.04)));
}
function economyBenchmark(){
  return Math.max(100,passive()*45+clickPower()*110);
}
function dailyRewardValue(index){
  const mult=[1,1.4,2,2.8,4,6,10][index]||1;
  return Math.floor(Math.max(dailyRewardTable[index]||250,economyBenchmark()*mult));
}
function missionEconomyReward(factor){
  return Math.floor(Math.max(250,economyBenchmark()*factor));
}
function upgradeTactic(kind){
  if(!["striker","network","hunter"].includes(kind)||tacticPointsAvailable()<=0)return;
  state.tactics[kind]++;
  sfx("level");toast(`Модуль улучшен: ${kind==="striker"?"Штурмовик":kind==="network"?"Сеть":"Охотник"}`);
  persist(true);renderAll();
}


function currentUltimate(){return HERO_ULTIMATES[state.selectedCharacter]||HERO_ULTIMATES.arsen}
function addUltimateCharge(amount){
  state.ultimateCharge=Math.min(100,state.ultimateCharge+Math.max(0,amount));
}
function renderUltimate(){
  if(!el.ultimateBtn)return;
  const u=currentUltimate(),pct=Math.floor(state.ultimateCharge);
  el.ultimateIcon.textContent=u.icon;el.ultimateName.textContent=u.name;el.ultimateFill.style.width=`${pct}%`;el.ultimatePercent.textContent=`${pct}%`;
  const ready=pct>=100;el.ultimateBtn.disabled=!ready;el.ultimateBtn.classList.toggle("ready",ready);
  el.ultimateHint.textContent=ready?(activeCityEvent?"СУПЕРПРИЁМ ГОТОВ · нанести мощный урон":"СУПЕРПРИЁМ ГОТОВ · ресурсный импульс"):`${100-pct}% до готовности`;
}
function castUltimate(){
  if(state.ultimateCharge<100)return;
  userGestureAudio();const u=currentUltimate();state.ultimateCharge=0;
  el.heroButton.classList.add("ultimate-cast");setTimeout(()=>el.heroButton.classList.remove("ultimate-cast"),580);
  triggerScreenWeb(window.innerWidth/2,window.innerHeight*.42);
  if(activeCityEvent){
    const floor=Math.ceil(activeCityEvent.maxHp*u.damage);
    const scaled=Math.ceil(Math.pow(clickPower()+1,.56)*18*(1+state.level*.018));
    const damage=Math.max(floor,scaled);
    activeCityEvent.hp=Math.max(0,activeCityEvent.hp-damage);
    spawnCombatImpact(window.innerWidth/2,window.innerHeight*.38,damage,true);
    showHeroSpeech(`${u.name}!`);
    if(activeCityEvent.hp<=0)completeCityEvent();
  }else{
    const reward=Math.floor(Math.max(500,economyBenchmark()*u.burst));
    addThreats(reward);gainXp(Math.max(20,Math.floor(state.level*8)));
    floatGain(window.innerWidth/2,window.innerHeight*.42,reward,true);showHeroSpeech(`${u.name}: сеть усилена.`);
  }
  sfx("ultimate");persist(true);renderAll();
}
function spawnCombatImpact(x,y,damage=0,strong=false){
  const wrap=document.createElement("div");wrap.className="combat-impact";wrap.style.left=`${x}px`;wrap.style.top=`${y}px`;
  const colors=strong?["#ffd45e","#ff5270","#fff1b1"]:["#ffffff","#80efff","#ff6986"];
  for(let i=0;i<(strong?10:6);i++){const dot=document.createElement("i");dot.style.setProperty("--r",`${i*(360/(strong?10:6))+Math.random()*20}deg`);dot.style.setProperty("--impact-color",colors[i%colors.length]);wrap.appendChild(dot)}
  if(damage){const t=document.createElement("strong");t.textContent=strong?`СУПЕР ${fmt(damage)}`:`${fmt(damage)}`;wrap.appendChild(t)}
  document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),520);
}
function showEventClear(e){
  clearTimeout(eventClearTimer);el.eventClearIcon.textContent=e.elite?"⭐":"✓";el.eventClearTitle.textContent=e.elite?"ЭЛИТНАЯ ЦЕЛЬ УСТРАНЕНА":"СЕКТОР ЗАЧИЩЕН";el.eventClearReward.textContent=`+${fmt(e.reward)} · +${fmt(e.xp)} XP`;
  el.eventClearBanner.classList.remove("hidden");void el.eventClearBanner.offsetWidth;
  eventClearTimer=setTimeout(()=>el.eventClearBanner.classList.add("hidden"),2200);
}
function showLevelBurst(level,reward,milestone=false){
  el.levelBurstValue.textContent=level;el.levelBurstReward.textContent=`+${fmt(reward)} · ${milestone?"ЭПИЧЕСКАЯ ВЕХА":"сила героя выросла"}`;
  el.levelBurst.classList.remove("hidden");void el.levelBurst.offsetWidth;setTimeout(()=>el.levelBurst.classList.add("hidden"),1700);
}
function showBossVictory(e,d,first,visual){
  el.victoryBossVisual.innerHTML=visual||`<div style="font-size:90px">${d?.bossIcon||"👹"}</div>`;
  el.victoryBossName.textContent=`${d?.boss||"Босс"} повержен`;
  el.victoryBossText.textContent=first?`${d?.name||"Район"} освобождён. Открыта новая награда.`:"Цель снова остановлена. Патруль продолжается.";
  el.victoryReward.textContent=`+${fmt(e.reward)}`;el.victoryXp.textContent=`+${fmt(e.xp)} XP`;
  el.victoryUnlockBox.classList.toggle("hidden",!first);el.victoryUnlock.textContent=first?`+${d?.shards||0} Осколков`:"—";
  setTimeout(()=>openModal("victoryModal"),180);
}

function applyPlatformLanguage(rawLang){
  platformLanguage=(rawLang||"ru").toLowerCase().split("-")[0];
  resolvedGameLanguage=SUPPORTED_GAME_LANGS.includes(platformLanguage)?platformLanguage:"ru";
  document.documentElement.lang=resolvedGameLanguage;
  document.documentElement.dataset.platformLang=platformLanguage;
  document.documentElement.dataset.gameLang=resolvedGameLanguage;
  updateRcDiagnostics();
  return resolvedGameLanguage;
}
function diagClass(node,status){
  if(!node)return;node.classList.remove("rc-ok","rc-warn","rc-bad");
  node.classList.add(status==="ok"?"rc-ok":status==="bad"?"rc-bad":"rc-warn");
}
function updateRcDiagnostics(){
  if(!el.rcDiagnostics||!rcDebug)return;
  el.rcDiagnostics.classList.remove("hidden");
  if(el.diagSdk){el.diagSdk.textContent=sdkReady?"ready":(ysdk?"init":"waiting");diagClass(el.diagSdk,sdkReady?"ok":"warn")}
  if(el.diagReady){el.diagReady.textContent=gameReadySent?"sent":"no";diagClass(el.diagReady,gameReadySent?"ok":"warn")}
  if(el.diagLang){el.diagLang.textContent=`${platformLanguage} → ${resolvedGameLanguage}`;diagClass(el.diagLang,"ok")}
  if(el.diagPlayer){const auth=!!player?.isAuthorized?.();el.diagPlayer.textContent=auth?"authorized":"guest";diagClass(el.diagPlayer,player?"ok":"warn")}
  if(el.diagCloud){el.diagCloud.textContent=cloudLoaded?"loaded":(player?"waiting":"local");diagClass(el.diagCloud,cloudLoaded?"ok":"warn")}
  if(el.diagPayments){el.diagPayments.textContent=paymentsReady?"ready":"waiting";diagClass(el.diagPayments,paymentsReady?"ok":"warn")}
  if(el.diagGameplay){el.diagGameplay.textContent=gameplayStopped?"stopped":"running";diagClass(el.diagGameplay,gameplayStopped?"warn":"ok")}
  if(el.diagFocus){const active=!document.hidden&&!platformPaused;el.diagFocus.textContent=active?"active":"paused";diagClass(el.diagFocus,active?"ok":"warn")}
}
function waitForCriticalAssets(timeoutMs=4500){
  const imgs=[...document.querySelectorAll("img")].filter(img=>img.src&&img.closest(".release-splash,.hud,.hero-picker,.character-list"));
  const pending=imgs.filter(img=>!img.complete);
  if(!pending.length)return Promise.resolve();
  return Promise.race([
    Promise.all(pending.map(img=>new Promise(resolve=>{img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true})}))),
    new Promise(resolve=>setTimeout(resolve,timeoutMs))
  ]);
}
function activatePlayableUi(){
  if(playableUiActivated)return;playableUiActivated=true;
  hideSplash();
  setTimeout(()=>{
    if(!state.onboardingDone)openModal("welcomeModal");
    else{
      if(noModalOpen()&&!platformPaused&&!document.hidden)startGameplay();
      if(!state.tutorialDone)setTimeout(()=>startTutorial(),180);
    }
  },360);
  updateRcDiagnostics();
}

function updateSplash(pct,text){
  if(!el.releaseSplash)return;el.releaseLoadFill.style.width=`${Math.max(8,Math.min(100,pct))}%`;if(text)el.releaseLoadText.textContent=text;
}
function hideSplash(){if(!el.releaseSplash)return;updateSplash(100,`Сеть готова · RC ${BUILD_VERSION}`);setTimeout(()=>el.releaseSplash.classList.add("hide"),220);setTimeout(()=>el.releaseSplash.remove(),850)}

function addThreats(x){if(!Number.isFinite(x)||x<=0)return;state.threats+=x;state.lifetime+=x}
function gainXp(x){state.xp+=Math.max(0,x)*cityXpMult()}
function priceAt(k,lv=state.levels[k]){const u=upgrades[k];return Math.floor(u.base*Math.pow(u.growth,lv)*cityShopMult())}
function bulkPrice(k,amount){let total=0;for(let i=0;i<amount;i++)total+=priceAt(k,state.levels[k]+i);return total}
function unlocked(k){return state.level>=upgrades[k].unlockLevel}

function hashString(str){
  let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0).toString(36).toUpperCase().padStart(7,"0").slice(0,7);
}
function seededRandom(seedText){
  let x=0;for(let i=0;i<seedText.length;i++)x=(x*31+seedText.charCodeAt(i))>>>0;
  return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
}

function missionTemplates(){
  const lvl=state.level;
  const clickBase=Math.max(70,Math.floor(90+lvl*22));
  const earnBase=Math.max(650,Math.floor(economyBenchmark()*(4.5+lvl*.08)));
  return [
    {kind:"clicks",title:"Ритм Сети",desc:`Сделай ${fmt(clickBase)} выпусков сети`,target:clickBase,reward:missionEconomyReward(.9)},
    {kind:"earn",title:"Чистый сектор",desc:`Нейтрализуй ${fmt(earnBase)} новых угроз`,target:earnBase,reward:missionEconomyReward(1.35)},
    {kind:"purchases",title:"Модернизация",desc:`Купи ${Math.min(18,4+Math.floor(lvl/3))} улучшений`,target:Math.min(18,4+Math.floor(lvl/3)),reward:missionEconomyReward(1.55)},
    {kind:"chests",title:"Секретный тайник",desc:"Открой 1 тайник дозора",target:1,reward:missionEconomyReward(1.8)},
    {kind:"levels",title:"Новый предел",desc:"Повысь уровень хотя бы 1 раз",target:1,reward:missionEconomyReward(2.1)}
  ];
}
function generateDailyMissions(key){
  const rnd=seededRandom(key+"|"+Math.floor(state.level/3));
  const pool=missionTemplates().slice();
  const chosen=[];
  while(chosen.length<3&&pool.length){
    const i=Math.floor(rnd()*pool.length);
    chosen.push(pool.splice(i,1)[0]);
  }
  return chosen.map((m,i)=>({...m,id:`${key}-${m.kind}-${i}`}));
}
function resetDailyMissions(key,showNotice=false){
  state.dailyKey=key;
  state.dailyMissions=generateDailyMissions(key);
  state.dailyClaimed=[];
  state.dailyBase={clicks:state.clicks,lifetime:state.lifetime,purchases:state.purchases,chests:state.chestsOpened,levels:state.levelsGained};
  if(showNotice)toast("Новый день: миссии и награды обновлены");
  persist(true);
}
function ensureDaily(){
  const key=localDateKey();
  if(state.dailyKey!==key||!state.dailyBase||!Array.isArray(state.dailyMissions)||state.dailyMissions.length!==3){
    resetDailyMissions(key,state.dailyKey!=="");
  }
}
function missionProgress(m){
  const b=state.dailyBase||{clicks:0,lifetime:0,purchases:0,chests:0,levels:0};
  if(m.kind==="clicks")return Math.max(0,state.clicks-b.clicks);
  if(m.kind==="earn")return Math.max(0,state.lifetime-b.lifetime);
  if(m.kind==="purchases")return Math.max(0,state.purchases-b.purchases);
  if(m.kind==="chests")return Math.max(0,state.chestsOpened-b.chests);
  if(m.kind==="levels")return Math.max(0,state.levelsGained-b.levels);
  return 0;
}
function dailyRewardAvailable(){
  if(!state.lastDailyAt)return true;
  const n=new Date(),l=new Date(state.lastDailyAt);
  return n.getFullYear()!==l.getFullYear()||n.getMonth()!==l.getMonth()||n.getDate()!==l.getDate();
}




function humanCharacterSvg(c,female=false){
  const skinA=c.id==="nika"?"#f1c09d":"#efbd98",skinB=c.id==="nika"?"#aa624c":"#a96149",hair=c.id==="nika"?"#35141e":"#181115";
  const jaw=female?50:54,shoulder=female?112:102,waist=female?238:246;
  const hairPath=female
    ?"M126 103c7-46 91-68 119-10 7 30 1 59-10 83-3-31-13-54-27-68-24-16-48-16-82-5z"
    :"M128 101c10-43 89-61 116-7-16-10-35-14-55-12-22 1-39 8-61 19z";
  return `<svg class="hero-svg human-hero premium-human" viewBox="0 0 360 360" role="img" aria-label="${c.name}">
    <defs>
      <radialGradient id="aura_${c.id}" cx="50%" cy="42%"><stop offset="0" stop-color="${c.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient>
      <linearGradient id="skin_${c.id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${skinA}"/><stop offset="1" stop-color="${skinB}"/></linearGradient>
      <linearGradient id="suit_${c.id}" x1="0" x2="1"><stop offset="0" stop-color="#18050a"/><stop offset=".48" stop-color="${c.accent}"/><stop offset="1" stop-color="#350812"/></linearGradient>
    </defs>
    <circle cx="180" cy="180" r="148" fill="url(#aura_${c.id})" class="hero-aura"/>
    <ellipse cx="180" cy="323" rx="78" ry="16" fill="rgba(0,0,0,.25)"/>
    <g class="human-body">
      <path d="M${female?118:108} 304 C116 236 132 188 180 168 C229 149 274 187 ${female?286:296} 304 Z" fill="url(#suit_${c.id})"/>
      <path d="M164 166h34v39h-34z" fill="url(#skin_${c.id})"/>
      <path d="M126 184c21 17 39 23 56 23 22 0 44-9 65-27" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5" stroke-linecap="round"/>
      <path d="M181 208v92M148 236c18 8 48 8 67 0M145 270c17 6 57 6 73 0" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="4" stroke-linecap="round"/>
      <path d="M111 211c-36 20-56 51-70 84M248 213c29 3 49 15 78-2" fill="none" stroke="${c.accent}" stroke-width="${female?25:29}" stroke-linecap="round"/>
    </g>
    <g class="human-head">
      <ellipse cx="181" cy="119" rx="${jaw}" ry="65" fill="url(#skin_${c.id})"/>
      <ellipse cx="${181-jaw}" cy="125" rx="7" ry="14" fill="${skinB}"/><ellipse cx="${181+jaw}" cy="125" rx="7" ry="14" fill="${skinB}"/>
      <path d="${hairPath}" fill="${hair}"/><path d="M145 91c13-10 29-15 45-15 14 0 29 5 42 13" fill="none" stroke="${female?"#5b2634":"#3b252a"}" stroke-width="4" stroke-linecap="round"/>
      <path d="M137 129c9-8 20-8 30 0-8 10-21 10-30 0zM195 129c9-8 20-8 30 0-8 10-21 10-30 0z" fill="#f7fbff"/>
      <circle cx="152" cy="130" r="5.3" fill="${c.id==="nika"?"#49744f":"#253b51"}"/><circle cx="210" cy="130" r="5.3" fill="${c.id==="nika"?"#49744f":"#253b51"}"/>
      <circle cx="153" cy="129" r="1.6" fill="#fff"/><circle cx="211" cy="129" r="1.6" fill="#fff"/>
      <g class="eye-group"><rect x="136" y="124" width="32" height="11" rx="4" fill="url(#skin_${c.id})"/></g><g class="eye-group"><rect x="194" y="124" width="32" height="11" rx="4" fill="url(#skin_${c.id})"/></g>
      <path d="M137 114c10-6 21-7 31-2M195 112c10-5 20-4 30 2M182 133c-4 12-4 19 4 23M165 165c10 7 23 8 33 0" fill="none" stroke="#815044" stroke-width="3" stroke-linecap="round"/>
      <path d="M134 109c16-16 78-17 94 0l-6 17c-8-8-16-10-26-10-6 3-12 3-18 0-9 0-18 3-26 10z" fill="${c.accent}" opacity=".88"/>
      <path d="M148 117c8-5 15-6 23-2M195 115c8-4 15-3 23 2" fill="none" stroke="#aef3ff" stroke-width="2.2" stroke-linecap="round"/>
    </g>
    <g class="human-hand"><circle cx="317" cy="221" r="18" fill="url(#skin_${c.id})"/><path d="M290 203h21c6 0 11 5 11 11v14c0 6-5 11-11 11h-21z" fill="url(#suit_${c.id})"/><rect x="303" y="207" width="18" height="12" rx="5" fill="#aef7ff" class="emitter"/></g>
    <circle cx="330" cy="215" r="7" class="web-core"/><path d="M335 212c20-22 30-44 41-68M336 217c21 3 31 8 40 16" class="web-shot"/>
  </svg>`;
}
function wraithSvg(c){
  return `<svg class="hero-svg monster-hero rey-monster" viewBox="0 0 360 360" role="img" aria-label="Рэй, биоэлектрический хищник">
    <defs><radialGradient id="reyCore"><stop offset="0" stop-color="#e5ffff"/><stop offset=".35" stop-color="#37e8ff"/><stop offset="1" stop-color="#087b91"/></radialGradient><linearGradient id="reyBody" x1="0" x2="1"><stop offset="0" stop-color="#061219"/><stop offset=".5" stop-color="#0a4d5d"/><stop offset="1" stop-color="#02080d"/></linearGradient></defs>
    <ellipse cx="180" cy="318" rx="76" ry="15" fill="rgba(0,0,0,.28)"/>
    <g class="monster-body">
      <path d="M116 304c9-82 27-126 66-143 42-18 83 11 99 61 9 28 12 55 12 82z" fill="url(#reyBody)"/>
      <path d="M118 198c-45 15-70 45-84 92M248 197c45 13 69 42 81 91" fill="none" stroke="#0a4d5d" stroke-width="27" stroke-linecap="round"/>
      <path d="M111 204c-25 24-34 53-27 80M253 203c25 24 35 53 29 80" class="rey-tendril" fill="none" stroke="#28d8ed" stroke-width="5" stroke-linecap="round" opacity=".45"/>
      <path d="M129 137c0-48 22-77 53-77 35 0 57 31 57 78 0 42-22 68-57 68-33 0-53-27-53-69z" fill="url(#reyBody)"/>
      <path d="M144 128l26-9-12 24-20 2zM218 128l-26-9 12 24 20 2z" fill="#bdfaff"/>
      <circle cx="181" cy="214" r="30" fill="rgba(33,223,243,.08)" stroke="#21dff3" stroke-width="3"/>
      <circle cx="181" cy="214" r="14" fill="url(#reyCore)" class="monster-core"/>
      <path d="M181 197v-33M181 231v36M164 214h-32M198 214h34" fill="none" stroke="#50eaff" stroke-width="4" stroke-linecap="round" opacity=".65"/>
      <path d="M148 161c17 11 48 11 66 0" fill="none" stroke="#1bd9ef" stroke-width="3" stroke-linecap="round"/>
      <path d="M278 222c27-4 40 5 54 22" fill="none" stroke="#21dff3" stroke-width="16" stroke-linecap="round"/>
      <circle cx="330" cy="244" r="8" class="web-core"/>
    </g>
  </svg>`;
}
function owlBeastSvg(c){
  return `<svg class="hero-svg monster-hero mira-monster" viewBox="0 0 360 360" role="img" aria-label="Мира, крылатая ночная тварь">
    <defs><linearGradient id="miraFeather" x1="0" x2="1"><stop offset="0" stop-color="#180d27"/><stop offset=".5" stop-color="#65409b"/><stop offset="1" stop-color="#11091c"/></linearGradient><radialGradient id="miraEye"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#d9c0ff"/><stop offset="1" stop-color="#8b5cf6"/></radialGradient></defs>
    <ellipse cx="180" cy="320" rx="80" ry="15" fill="rgba(0,0,0,.28)"/>
    <g class="mira-wing-left"><path d="M150 184C91 160 45 175 20 230c45-22 79-22 112-4-34 1-63 18-81 53 46-25 83-27 111-12z" fill="url(#miraFeather)" stroke="#8d67bd" stroke-width="2"/></g>
    <g class="mira-wing-right"><path d="M211 184c59-24 105-9 130 46-45-22-79-22-112-4 34 1 63 18 81 53-46-25-83-27-111-12z" fill="url(#miraFeather)" stroke="#8d67bd" stroke-width="2"/></g>
    <path d="M123 303c7-78 23-122 58-139 42-20 83 17 93 80 4 25 5 43 5 59z" fill="url(#miraFeather)"/>
    <g class="human-head">
      <path d="M125 129c0-53 23-83 56-83 34 0 58 31 58 83 0 48-25 78-58 78-32 0-56-31-56-78z" fill="#25153b"/>
      <path d="M124 91l31 18-27 19zM238 91l-31 18 27 19z" fill="#7653a6"/>
      <circle cx="157" cy="132" r="21" fill="#eee7ff"/><circle cx="207" cy="132" r="21" fill="#eee7ff"/>
      <circle cx="157" cy="132" r="10" fill="url(#miraEye)" class="owl-eye"/><circle cx="207" cy="132" r="10" fill="url(#miraEye)" class="owl-eye"/>
      <circle cx="157" cy="132" r="4" fill="#09060f"/><circle cx="207" cy="132" r="4" fill="#09060f"/>
      <path d="M172 148l10 17 10-17-10 5z" fill="#d3a85f"/>
      <path d="M144 174c23 13 52 13 75 0" fill="none" stroke="#a77cff" stroke-width="3" stroke-linecap="round"/>
    </g>
    <path d="M151 204l-14 90M213 204l15 90" fill="none" stroke="#4b2b70" stroke-width="18" stroke-linecap="round"/>
    <path d="M135 298l-13 19 20-8 11 11M230 298l13 19-20-8-11 11" fill="none" stroke="#d3a85f" stroke-width="5" stroke-linecap="round"/>
    <circle cx="278" cy="230" r="12" fill="#a77cff" class="monster-core"/><path d="M278 230c24 5 37 17 49 35" fill="none" stroke="#cbb4ff" stroke-width="7" stroke-linecap="round"/>
  </svg>`;
}
function crystalBeastSvg(c){
  return `<svg class="hero-svg monster-hero kai-monster" viewBox="0 0 360 360" role="img" aria-label="Кай, кристаллический космический зверь">
    <defs><linearGradient id="kaiCrystal" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".35" stop-color="#ffc14d"/><stop offset=".7" stop-color="#8a4b1a"/><stop offset="1" stop-color="#24110a"/></linearGradient><radialGradient id="kaiCore"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#ffe28a"/><stop offset="1" stop-color="#f28b2c"/></radialGradient></defs>
    <ellipse cx="181" cy="320" rx="90" ry="16" fill="rgba(0,0,0,.3)"/>
    <g class="monster-body">
      <path d="M110 305c10-77 30-116 70-135 51-25 101 13 110 97l2 38z" fill="#21120b"/>
      <path d="M132 274l-36-72 54 19 4-66 33 45 30-61 10 75 57-28-37 87z" fill="url(#kaiCrystal)" opacity=".88"/>
      <path d="M132 134l29-71 21 49 38-65 2 80 44-24-25 65z" fill="url(#kaiCrystal)" class="crystal-shard"/>
      <path d="M126 150c6-50 28-76 59-76 36 0 61 31 61 79 0 42-24 69-62 69-35 0-58-27-58-72z" fill="#2b180c" stroke="#ffc14d" stroke-width="3"/>
      <path d="M142 142l31-13-12 27-25 3zM226 142l-31-13 12 27 25 3z" fill="#fff0aa"/>
      <circle cx="184" cy="226" r="31" fill="rgba(255,193,77,.08)" stroke="#ffc14d" stroke-width="3"/><circle cx="184" cy="226" r="14" fill="url(#kaiCore)" class="monster-core"/>
      <path d="M118 220c-37 17-58 45-71 77M250 216c38 12 62 38 76 74" fill="none" stroke="#7a451b" stroke-width="30" stroke-linecap="round"/>
      <path d="M293 252l29-22 10 35-23 20z" fill="url(#kaiCrystal)" class="crystal-shard"/>
      <circle cx="323" cy="260" r="8" class="web-core"/>
    </g>
  </svg>`;
}
function umbraSvg(c){
  return `<svg class="hero-svg monster-hero umbra-monster" viewBox="0 0 360 360" role="img" aria-label="Умбра, теневой голем">
    <defs><radialGradient id="umbraCore"><stop offset="0" stop-color="#fff"/><stop offset=".28" stop-color="#f19bff"/><stop offset="1" stop-color="#6d1a83"/></radialGradient><linearGradient id="umbraBody" x1="0" x2="1"><stop offset="0" stop-color="#06040a"/><stop offset=".52" stop-color="#281035"/><stop offset="1" stop-color="#08040d"/></linearGradient></defs>
    <ellipse cx="181" cy="321" rx="90" ry="16" fill="rgba(0,0,0,.35)"/>
    <g class="monster-body">
      <path d="M94 304c11-91 31-130 87-145 65-18 103 30 112 145z" fill="url(#umbraBody)" stroke="#6b2d7e" stroke-width="3"/>
      <path d="M112 215c-44 15-67 45-83 82M252 211c43 11 69 39 82 79" fill="none" stroke="#25102f" stroke-width="37" stroke-linecap="round"/>
      <path d="M125 139c0-57 23-88 57-88 37 0 61 34 61 90 0 51-24 79-61 79-35 0-57-31-57-81z" fill="#0c0711" stroke="#673076" stroke-width="3"/>
      <path d="M136 132l35-14-14 31-29 3zM229 132l-35-14 14 31 29 3z" fill="#f4c7ff" opacity=".95"/>
      <circle cx="182" cy="231" r="38" fill="rgba(217,70,239,.06)" stroke="#913ca5" stroke-width="3"/>
      <circle cx="182" cy="231" r="16" fill="url(#umbraCore)" class="monster-core"/>
      <path d="M182 209v-39M182 252v42M160 231h-42M204 231h43" fill="none" stroke="#d946ef" stroke-width="5" stroke-linecap="round" opacity=".58"/>
      <path d="M113 180c-28-22-39-47-33-75M250 179c30-24 39-49 32-78" fill="none" stroke="#8d3aa1" stroke-width="8" stroke-linecap="round" class="rey-tendril"/>
      <circle cx="310" cy="242" r="10" class="web-core"/><path d="M267 221c23 1 32 7 43 21" fill="none" stroke="#d946ef" stroke-width="18" stroke-linecap="round"/>
    </g>
  </svg>`;
}
function characterSvgMarkup(c){
  if(c.form==="humanMale")return humanCharacterSvg(c,false);
  if(c.form==="humanFemale")return humanCharacterSvg(c,true);
  if(c.form==="wraith")return wraithSvg(c);
  if(c.form==="owlbeast")return owlBeastSvg(c);
  if(c.form==="umbra")return umbraSvg(c);
  return crystalBeastSvg(c);
}
function characterPortraitMarkup(c){
  if(c.form==="humanMale"||c.form==="humanFemale"){
    const skin=c.form==="humanFemale"?"#efbd9d":"#e8b28e";
    return `<svg viewBox="0 0 80 80"><circle cx="40" cy="41" r="25" fill="${skin}"/><path d="M16 38c2-27 47-38 52-5-15-9-34-8-52 5z" fill="${c.form==="humanFemale"?"#35141e":"#191216"}"/><path d="M22 62c7-15 29-18 38 0z" fill="${c.accent}"/><circle cx="32" cy="42" r="3" fill="#26384a"/><circle cx="49" cy="42" r="3" fill="#26384a"/></svg>`;
  }
  if(c.form==="wraith")return `<svg viewBox="0 0 80 80"><path d="M19 68c2-30 7-51 21-57 17 6 23 26 22 57z" fill="#092b35"/><path d="M24 29c4-18 27-22 34 1-8-5-27-5-34-1z" fill="#116477"/><path d="M28 35l12-5-5 11zM53 35l-12-5 5 11z" fill="#baffff"/><circle cx="41" cy="55" r="7" fill="#21dff3"/></svg>`;
  if(c.form==="owlbeast")return `<svg viewBox="0 0 80 80"><path d="M9 65c9-19 18-28 29-30-9-10-11-20 2-29 14 9 12 20 2 29 13 2 22 11 29 30z" fill="#34204d"/><circle cx="31" cy="29" r="9" fill="#efe8ff"/><circle cx="49" cy="29" r="9" fill="#efe8ff"/><circle cx="31" cy="29" r="4" fill="#a77cff"/><circle cx="49" cy="29" r="4" fill="#a77cff"/><path d="M36 39l4 8 5-8-5 2z" fill="#d3a85f"/></svg>`;
  if(c.form==="umbra")return `<svg viewBox="0 0 80 80"><path d="M10 69c3-39 13-57 31-60 21 4 29 25 29 60z" fill="#16091d"/><path d="M18 29c7-19 38-25 47 0-14-8-33-8-47 0z" fill="#371044"/><path d="M23 36l18-8-8 16zM59 36l-18-8 8 16z" fill="#f2c5ff"/><circle cx="41" cy="56" r="9" fill="#d946ef"/></svg>`;
  return `<svg viewBox="0 0 80 80"><path d="M11 68l8-37 13 10 8-31 9 28 15-17 5 47z" fill="#6c3e18"/><path d="M23 38l12-29 8 22 15-25 1 35z" fill="#ffc14d"/><path d="M28 45l12-5-5 12zM54 45l-12-5 5 12z" fill="#fff0aa"/><circle cx="41" cy="59" r="7" fill="#ffc14d"/></svg>`;
}
function renderCharacterVisual(){
  if(!el.heroVisual)return;
  const c=selectedCharacterDef(),asset=CHIBI_ASSETS[c.id];
  if(el.heroVisual.dataset.character===c.id)return;
  el.heroVisual.dataset.character=c.id;
  if(asset)el.heroVisual.innerHTML=`<div class="hero-model living-figure" data-model="${c.id}" style="--modelAccent:${c.accent}">
    <span class="model-aura figure-depth depth-back"></span><span class="model-shadow"></span>
    <span class="figure-extrusion" aria-hidden="true"><img src="${asset}" alt="" draggable="false"></span>
    <span class="figure-body-plane"><img class="chibi-sprite" src="${asset}" alt="${c.name} · ${c.codename}" draggable="false"></span>
    <span class="model-energy-ring figure-depth depth-mid"></span><span class="model-glint figure-depth depth-front"></span>
    <span class="figure-specular" aria-hidden="true"></span><span class="figure-eye-flash" aria-hidden="true"></span>
  </div>`;
  else el.heroVisual.innerHTML=characterSvgMarkup(c);
  if(el.topHeroAvatar&&asset)el.topHeroAvatar.src=asset;
}
function animateHeroLife(){
  const model=activeCityEvent?el.enemyVisual?.querySelector(".villain-card"):el.heroVisual?.querySelector(".hero-model");
  if(!model||document.hidden)return;
  const moods=activeCityEvent?["figure-observe","figure-focus","figure-prowl"]:["hero-glance","hero-charge","hero-ready"],mood=moods[Math.floor(Math.random()*moods.length)];
  model.classList.remove(...moods);void model.offsetWidth;model.classList.add(mood);
  setTimeout(()=>model.classList.remove(mood),950);
}
function renderCharacters(){
  const unlocked=new Set(state.charactersUnlocked);
  el.heroCollectionStatus.textContent=`${unlocked.size} / ${CHARACTERS.length}`;
  el.characterList.innerHTML=CHARACTERS.map(c=>{
    const open=unlocked.has(c.id),selected=state.selectedCharacter===c.id,monster=!c.form.startsWith("human");
    return `<button class="character-card ${monster?"monster":""} ${selected?"selected":""} ${open?"":"locked"}" style="--char-accent:${c.accent}" data-character-choice="${c.id}" ${open&&!activeCityEvent?"":"disabled"}>
      <span class="character-avatar">${CHIBI_ASSETS[c.id]?`<img src="${CHIBI_ASSETS[c.id]}" alt="${c.name}">`:characterPortraitMarkup(c)}</span>${open?"":`<span class="character-lock">${c.premium?"💎 Хранилище":`ур. ${c.unlock}`}</span>`}
      <b>${c.name} · ${c.codename}</b><small class="character-species">${c.species}</small><small>${open?"Доступен для выбора":c.premium?"Коллекционная форма из Хранилища":`Откроется на уровне ${c.unlock}`}</small><small class="character-passive">${c.bonus}</small>
    </button>`;
  }).join("");
  el.characterList.querySelectorAll("[data-character-choice]").forEach(b=>b.addEventListener("click",()=>selectCharacter(b.dataset.characterChoice)));
}
function selectCharacter(id){
  if(activeCityEvent||!state.charactersUnlocked.includes(id))return;
  const c=CHARACTERS.find(x=>x.id===id);if(!c)return;
  state.selectedCharacter=id;el.heroVisual.dataset.character="";applyWorldStyle();sfx("heroSwap");showHeroSpeech(`${c.name} вступает в дозор.`);persist(true);renderAll();
}

function selectedDistrictDef(){return DISTRICTS[state.selectedDistrict]||DISTRICTS[0]}

function renderCities(){
  const current=selectedCityDef();
  if(el.worldContractIcon)el.worldContractIcon.textContent=current.icon;
  if(el.worldContractTitle)el.worldContractTitle.textContent=current.contract;
  if(el.worldContractDesc)el.worldContractDesc.textContent=current.contractDesc;
  if(el.worldModifierChips)el.worldModifierChips.innerHTML=current.chips.map(x=>`<span class="world-modifier-chip">${x}</span>`).join("");
  if(!el.worldSwitcher)return;
  el.worldSwitcher.innerHTML=CITIES.map(c=>{
    const open=state.level>=c.unlock,selected=state.selectedCity===c.id;
    return `<button class="world-chip ${selected?"selected":""} ${open?"":"locked"}" style="--world-chip-accent:${c.accent}" data-city-choice="${c.id}" aria-pressed="${selected}" ${open&&!activeCityEvent?"":"disabled"}>
      <span>${c.icon}</span><b>${c.name}</b><small>${open?(selected?"текущий мир":c.special):`ур. ${c.unlock}`}</small>
    </button>`;
  }).join("");
  el.worldSwitcher.querySelectorAll("[data-city-choice]").forEach(b=>b.addEventListener("click",()=>selectCity(b.dataset.cityChoice)));
}
function selectCity(id){
  if(activeCityEvent)return;
  const city=CITIES.find(c=>c.id===id);if(!city||state.level<city.unlock)return;
  state.selectedCity=id;
  const first=DISTRICTS.findIndex(d=>d.id===city.districts[0]);
  if(first>=0)state.selectedDistrict=first;
  trackIndex=city.track;
  applyWorldStyle();sfx("heroSwap");showHeroSpeech(`Новый город: ${city.name}. Правила изменились.`);
  persist(true);renderAll();if(state.musicAuto)restartMusicForContext();
}

function applyWorldStyle(){
  const city=selectedCityDef();
  if(!DISTRICTS[state.selectedDistrict]||DISTRICTS[state.selectedDistrict].city!==city.id){const first=DISTRICTS.findIndex(d=>city.districts.includes(d.id));if(first>=0)state.selectedDistrict=first}
  const district=selectedDistrictDef(),ch=selectedCharacterDef();
  document.documentElement.dataset.cityWorld=city.id;
  document.documentElement.dataset.district=String(state.selectedDistrict);
  el.heroButton.dataset.character=state.selectedCharacter||"arsen";
  el.heroBadge.textContent=`${state.founderBadge?"👑":ch.icon} ${ch.name} · ${ch.codename}`;
  el.cityBadge.textContent=`${city.icon} ${city.name}`;
  el.districtBadge.textContent=`📍 ${district?.name||city.name}`;
  if(el.topCityIcon)el.topCityIcon.textContent=city.icon;if(el.topCityName)el.topCityName.textContent=city.name;if(el.topDistrictName)el.topDistrictName.textContent=district?.name||city.name;
  el.resourceLabel.textContent=city.resource;el.passiveLabel.textContent=city.passiveLabel;el.chestTitle.textContent=city.chest;
  el.shopWorldTitle.textContent=city.shopTitle;el.shopWorldSubtitle.textContent=city.shopSubtitle;
  el.mapWorldTitle.textContent=`Районы: ${city.name}`;el.mapWorldSubtitle.textContent=`${city.weather} · ${city.contract} · ${city.desc}`;
  renderCharacterVisual();
}
function renderDistricts(){
  const cleared=new Set(state.districtsCleared),list=cityDistricts();
  el.mapProgress.textContent=`${list.filter(d=>cleared.has(d.id)).length} / ${list.length}`;
  el.districtList.innerHTML=list.map(d=>{
    const i=DISTRICTS.findIndex(x=>x.id===d.id),open=state.level>=d.unlock,done=cleared.has(d.id),selected=i===state.selectedDistrict;
    const villainAsset=d.bossAsset&&VILLAIN_ASSETS[d.bossAsset];
    return `<div class="district-card ${open?"":"locked"} ${done?"cleared":""} ${selected?"selected":""}" style="--district-accent:${d.accent}">
      <div class="district-top"><div class="district-icon ${villainAsset?"has-villain":""}">${villainAsset?`<img src="${villainAsset}" alt="${d.boss}"><i>LIVE</i>`:d.icon}</div><div class="district-copy"><b>${d.name}</b><small>${open?d.desc:`Откроется на уровне ${d.unlock}`}</small><em>${open?`Босс: ${d.boss}`:""}</em></div><span class="district-state">${done?"БОСС ПОБЕЖДЁН":open?"ОТКРЫТ":"🔒"}</span></div>
      <div class="district-actions">
        <button data-select-district="${i}" ${open?"":"disabled"}>${selected?"✓ Текущий район":"Перейти"}</button>
        <button class="boss-btn" data-boss="${d.id}" ${open&&!activeCityEvent?"":"disabled"}>${done?"Повторить босса":`Босс: ${d.boss}`}</button>
        <span class="district-reward"><b>${fmt(d.reward)} ◆</b><br>💎 ${d.shards} за первое освобождение<span class="district-power ${combatRating()>=d.power?"good":"low"}">Сила ${fmt(combatRating())} / рек. ${fmt(d.power)}</span></span>
      </div>
    </div>`;
  }).join("");
  el.districtList.querySelectorAll("[data-select-district]").forEach(b=>b.addEventListener("click",()=>selectDistrict(Number(b.dataset.selectDistrict))));
  el.districtList.querySelectorAll("[data-boss]").forEach(b=>b.addEventListener("click",()=>startBoss(b.dataset.boss)));
}
function selectDistrict(index){
  if(!DISTRICTS[index]||DISTRICTS[index].city!==state.selectedCity||state.level<DISTRICTS[index].unlock)return;
  state.selectedDistrict=index;applyWorldStyle();sfx("theme");persist();renderDistricts();
  showHeroSpeech(`Переходим: ${DISTRICTS[index].name}.`);
  if(state.musicAuto&&!activeCityEvent)restartMusicForContext();
}
function startBoss(id){
  if(activeCityEvent)return;
  const d=DISTRICTS.find(x=>x.id===id);if(!d||d.city!==state.selectedCity||state.level<d.unlock)return;
  const repeat=state.districtsCleared.includes(d.id);
  const danger=dangerDef();
  const hp=Math.floor(d.bossHp*danger.hp*(1+state.bossWins*.015));
  const reward=Math.floor(d.reward*(repeat?.32:1)*prestigeMultiplier()*danger.reward*hunterRewardMultiplier());
  const underpowered=combatRating()<d.power;
  activeCityEvent={boss:true,districtId:d.id,icon:d.bossIcon,name:`БОСС: ${d.boss}`,desc:d.bossDesc,maxHp:hp,hp,endsAt:Date.now()+Math.floor((underpowered?36000:42000)*cityTimerMult())+characterTimerBonus()*1000,reward,xp:Math.floor(d.xp*(repeat?.55:1)),enraged:false};
  document.body.classList.add("event-active","boss-active");
  showHeroSpeech(underpowered?`Сильный противник. Придётся работать идеально.`:`Это ${d.boss}. Не отступаем.`);
  sfx("bossStart");restartMusicForContext();renderTargetVisual();renderCityEvent();renderDistricts();
}
function renderMusicPanel(){
  el.musicToggleBtn.textContent=state.musicEnabled?"Музыка: включена":"Музыка: выключена";
  el.musicAutoBtn.textContent=state.musicAuto?"Режим: Авто":"Режим: вручную";
  const normal=[0,1,2,3,4,5],premium=hasEntitlement("nightMusic")?[8,9,10]:[];
  const indices=[...normal,...premium];
  el.musicTrackList.innerHTML=indices.map(i=>{const t=TRACKS[i];return `<button class="music-track ${!state.musicAuto&&state.selectedTrack===i?"active":""}" data-track="${i}">
    <span class="track-icon">${t.icon}</span><span><b>${t.name}</b><small>${t.premium?"премиальный · ":""}${t.energy>=3?"энергичный":"ритмичный"} саундтрек</small></span><span class="bpm">${t.bpm} BPM</span>
  </button>`}).join("")+(hasEntitlement("nightMusic")?"":`<div class="music-track locked"><span class="track-icon">🔒</span><span><b>Ночные Частоты</b><small>Ещё 3 трека открываются в Хранилище Сети</small></span><span class="bpm">+3</span></div>`);
  el.musicTrackList.querySelectorAll("[data-track]").forEach(b=>b.addEventListener("click",()=>chooseTrack(Number(b.dataset.track))));
}
function chooseTrack(index){
  if(index<0||index>=TRACKS.length||TRACKS[index]?.eventOnly||TRACKS[index]?.bossOnly)return;
  if(TRACKS[index]?.premium&&!hasEntitlement("nightMusic"))return;state.selectedTrack=index;state.musicAuto=false;trackIndex=index;saveLocal();renderMusicPanel();restartMusicForContext();
}
function toggleMusicAuto(){
  state.musicAuto=!state.musicAuto;if(state.musicAuto)trackIndex=selectedCityDef().track%6;saveLocal();renderMusicPanel();restartMusicForContext();
}
function musicContext(){
  if(activeCityEvent?.boss)return "boss";
  if(activeCityEvent)return "event";
  return "normal";
}
function contextTrackIndex(){
  if(activeCityEvent?.boss)return 7;
  if(activeCityEvent)return 6;
  if(!state.musicAuto){const i=state.selectedTrack;return TRACKS[i]&&!TRACKS[i].eventOnly&&!TRACKS[i].bossOnly&&(!TRACKS[i].premium||hasEntitlement("nightMusic"))?i:0;}
  return trackIndex%6;
}
function restartMusicForContext(){
  if(!state.musicEnabled)return;
  const ctx=musicContext();
  if(ctx==="normal"&&state.musicAuto&&lastMusicContext!=="normal")trackIndex=selectedCityDef().track%6;
  lastMusicContext=ctx;
  startMusic();
}
function levelReward(level){
  const base=Math.floor(180*Math.pow(level,1.65));
  const milestone=level%5===0?3:1;
  return Math.floor(base*milestone*prestigeMultiplier());
}
function renderLevelPath(){
  const maxLevel=Math.max(30,state.level+4);
  const items=[];
  for(let lvl=1;lvl<=maxLevel;lvl++){
    const complete=lvl<state.level;
    const current=lvl===state.level;
    const status=complete?"complete":current?"current":"locked";
    const icon=LEVEL_ICONS[(lvl-1)%LEVEL_ICONS.length];
    const title=LEVEL_TITLES[(lvl-1)%LEVEL_TITLES.length]||`Уровень ${lvl}`;
    const reward=lvl===1?0:levelReward(lvl);
    items.push(`<div class="level-path-item ${status}">
      <div class="level-icon">${icon}</div>
      <div class="level-copy"><b>Уровень ${lvl} · ${title}</b><small>Постоянно +${Math.round((lvl-1)*5)}% эффективности${lvl%5===0?" · усиленная веха":""}</small></div>
      <div class="level-reward">${lvl===1?"СТАРТ":complete?"✓ Получено":fmt(reward)+" ◆"}<small>${current?"Текущий уровень":lvl%5===0?"Бонус x2.5":"награда"}</small></div>
    </div>`);
  }
  el.levelList.innerHTML=items.join("");
  el.levelPathStatus.textContent=`${state.level} / ${maxLevel}`;
}

function scheduleNextCityEvent(initial=false){
  const base=initial?25000:60000+Math.floor(Math.random()*45000);
  state.eventNextAt=Date.now()+Math.floor(base*cityEventDelayMult());
  saveLocal();
}
function startCityEvent(){
  if(activeCityEvent||document.hidden||gameplayStopped||adBusy)return;
  const pool=CITY_EVENT_POOLS[state.selectedCity]||CITY_EVENTS;const def=pool[Math.floor(Math.random()*pool.length)];
  const elite=state.level>=8&&Math.random()<Math.min(.34,.12+state.level*.008);
  const danger=dangerDef();
  const eliteHp=elite?1.65:1;
  const eliteReward=elite?2.05:1;
  const hp=Math.floor(Math.max(22,22+state.level*3.4+Math.sqrt(state.eventWins)*5)*danger.hp*eliteHp);
  const reward=Math.floor(Math.max(900,economyBenchmark()*2.7,clickPower()*hp*3.5)*danger.reward*eliteReward*hunterRewardMultiplier());
  activeCityEvent={...def,elite,maxHp:hp,hp,endsAt:Date.now()+Math.floor((elite?19000:23000)*cityTimerMult())+characterTimerBonus()*1000,reward,xp:Math.floor((100+state.level*20)*(elite?1.7:1)),enraged:false};
  document.body.classList.add("event-active");
  showHeroSpeech(elite?"Элитная цель. Не даём ей уйти!":"Тревога! Беру цель.");
  sfx("alarm");restartMusicForContext();renderTargetVisual();renderCityEvent();
}
function hitCityEvent(){
  if(!activeCityEvent)return;
  const hit=combatHitDamage();
  activeCityEvent.hp=Math.max(0,activeCityEvent.hp-hit.damage);
  if(hit.crit){
    addUltimateCharge(8);
    el.heroButton.classList.add("critical-hit");
    setTimeout(()=>el.heroButton.classList.remove("critical-hit"),260);
    floatGain((window.innerWidth/2)+Math.random()*40-20,(window.innerHeight/2)-20,hit.damage,true);
  }
  if(activeCityEvent.boss&&!activeCityEvent.enraged&&activeCityEvent.hp/activeCityEvent.maxHp<=.5){
    activeCityEvent.enraged=true;
    toast("Босс входит во вторую фазу: защита усилена!");
    sfx("alarm");
  }
  if(activeCityEvent.hp<=0)completeCityEvent();
}
function completeCityEvent(){
  if(!activeCityEvent)return;
  const e=activeCityEvent;
  const defeatedVisual=e.boss?enemyVisualMarkup(enemyVisualSpec()):"";
  addThreats(e.reward);gainXp(e.xp);state.eventWins++;state.eventStreak++;
  addRiftCharge(e.boss?38:14);
  if(!e.boss){state.dangerWins++;if(state.dangerWins>=2&&state.dangerTier<5){state.dangerTier++;state.dangerWins=0;toast(`Эскалация: уровень угрозы ${dangerDef().label}. Награды выросли.`)}}

  let bossDistrict=null,bossFirst=false;
  if(e.boss){
    state.bossWins++;
    const d=DISTRICTS.find(x=>x.id===e.districtId);bossDistrict=d;
    const first=d&&!state.districtsCleared.includes(d.id);bossFirst=first;
    if(first){
      state.districtsCleared.push(d.id);
      state.nexusShards+=d.shards||0;
      toast(`Район освобождён! +${fmt(e.reward)} · +${d.shards||0} Осколков`);
    }else{
      toast(`Босс снова побеждён: +${fmt(e.reward)} и +${fmt(e.xp)} XP`);
    }
  }else if(state.eventStreak%3===0){
    state.feverUntil=Date.now()+60000;
    toast(`Серия из 3 спасений! «Город в сети» x1.5 на 60 секунд`);
  }else{
    toast(`Угроза остановлена: +${fmt(e.reward)} и +${fmt(e.xp)} XP`);
  }

  activeCityEvent=null;
  renderTargetVisual();
  document.body.classList.remove("event-active","boss-active");
  document.body.classList.add("event-success");
  setTimeout(()=>document.body.classList.remove("event-success"),600);
  scheduleNextCityEvent(false);sfx(e.boss?"bossWin":"eventWin");persist(true);
  restartMusicForContext();renderAll();
  if(e.boss)showBossVictory(e,bossDistrict,bossFirst,defeatedVisual);else showEventClear(e);
}
function failCityEvent(){
  if(!activeCityEvent)return;
  const wasBoss=!!activeCityEvent.boss;
  activeCityEvent=null;state.eventStreak=0;state.dangerWins=0;if(state.dangerTier>1)state.dangerTier--;
  renderTargetVisual();
  document.body.classList.remove("event-active","boss-active");
  scheduleNextCityEvent(false);sfx(wasBoss?"bossFail":"eventFail");
  toast(wasBoss?"Босс отступил. Можно вызвать его снова с карты.":"Угроза ушла. Серия спасений сброшена.");
  persist();restartMusicForContext();renderAll();
}

function enemyVisualSpec(){
  if(!activeCityEvent)return null;
  if(activeCityEvent.boss){
    const district=DISTRICTS.find(d=>d.id===activeCityEvent.districtId);
    if(district?.bossAsset&&VILLAIN_PROFILES[district.bossAsset]){
      return {...VILLAIN_PROFILES[district.bossAsset],tone:"boss",icon:district.bossIcon};
    }
    const bosses={
      roofs:{tone:"boss",name:"Клык",icon:"🐺",skin:"#9a1829",dark:"#4b0b15",glow:"#ffba49",stroke:"#ffdca0",head:"wolf",accent:"#ff744d"},
      docks:{tone:"boss",name:"Магнит",icon:"🧲",skin:"#0b7f94",dark:"#083c4a",glow:"#72f2ff",stroke:"#b8f9ff",head:"magnet",accent:"#3ec4ff"},
      mist:{tone:"boss",name:"Грим",icon:"🎭",skin:"#6a38a8",dark:"#26103a",glow:"#d8a8ff",stroke:"#f1ddff",head:"mask",accent:"#a46fff"},
      zero:{tone:"boss",name:"Архонт",icon:"🦾",skin:"#c86c10",dark:"#56240b",glow:"#ffd277",stroke:"#ffe6ba",head:"archon",accent:"#ff9e4f"},
      nexus:{tone:"boss",name:"Пустотник",icon:"🕳️",skin:"#ae1bc0",dark:"#2a0d36",glow:"#ff7cf6",stroke:"#ffd0fb",head:"void",accent:"#ea4dff"},
      underground:{tone:"boss",name:"Крот",icon:"🦡",skin:"#17825e",dark:"#07362a",glow:"#71ffc2",stroke:"#d8ffef",head:"archon",accent:"#24c78e"},
      frost:{tone:"boss",name:"Ноль",icon:"🧊",skin:"#3f9bc0",dark:"#0b3549",glow:"#b8f4ff",stroke:"#edfdff",head:"mask",accent:"#79dcff"},
      orbital:{tone:"boss",name:"Сингуляр",icon:"☀️",skin:"#bd751a",dark:"#4a2709",glow:"#ffe384",stroke:"#fff0bd",head:"void",accent:"#ffc14d"}
    };
    return bosses[activeCityEvent.districtId]||bosses.roofs;
  }
  if(activeCityEvent.villainAsset&&VILLAIN_PROFILES[activeCityEvent.villainAsset]){
    return {...VILLAIN_PROFILES[activeCityEvent.villainAsset],tone:"threat",name:activeCityEvent.name};
  }
  const k=(activeCityEvent.icon||"")+" "+(activeCityEvent.name||"");
  if(k.includes("🐺"))return {tone:"threat",name:"Крышный хищник",icon:"🐺",skin:"#8f2535",dark:"#3c0b13",glow:"#ffbf70",stroke:"#ffe1ab",head:"wolf",accent:"#ff7653"};
  if(k.includes("🚨"))return {tone:"threat",name:"Красный рейдер",icon:"🚨",skin:"#9f1d32",dark:"#3f0913",glow:"#ff8675",stroke:"#ffd2ca",head:"archon",accent:"#ff5369"};
  if(k.includes("🤖"))return {tone:"threat",name:"Сбой дрона",icon:"🤖",skin:"#2d6c8f",dark:"#0d2535",glow:"#6fe7ff",stroke:"#d5fbff",head:"drone",accent:"#3cb6ff"};
  if(k.includes("🧲"))return {tone:"threat",name:"Магнитный фантом",icon:"🧲",skin:"#127d93",dark:"#073744",glow:"#75f7ff",stroke:"#d9fdff",head:"magnet",accent:"#34e3f7"};
  if(k.includes("⚡"))return {tone:"threat",name:"Электро-разряд",icon:"⚡",skin:"#126f82",dark:"#062d38",glow:"#a4ffff",stroke:"#e8ffff",head:"storm",accent:"#45efff"};
  if(k.includes("🌫")||k.includes("🌨"))return {tone:"threat",name:"Полярный фантом",icon:"🌫️",skin:"#586b99",dark:"#17223b",glow:"#c9f5ff",stroke:"#effdff",head:"phantom",accent:"#8bdefd"};
  if(k.includes("🧊"))return {tone:"threat",name:"Крио-голем",icon:"🧊",skin:"#4d91aa",dark:"#123746",glow:"#c5f7ff",stroke:"#f0fdff",head:"archon",accent:"#80dcff"};
  if(k.includes("👁")||k.includes("🧿")||k.includes("🕳"))return {tone:"threat",name:"Наблюдатель",icon:"👁️",skin:"#8e35a4",dark:"#240a30",glow:"#ff9cf5",stroke:"#ffe2fb",head:"void",accent:"#d946ef"};
  if(k.includes("☄"))return {tone:"threat",name:"Осколочная сущность",icon:"☄️",skin:"#b76b1a",dark:"#3b1e08",glow:"#ffe08b",stroke:"#fff0c4",head:"storm",accent:"#ffc14d"};
  if(k.includes("👾"))return {tone:"threat",name:"Звёздный паразит",icon:"👾",skin:"#8e319d",dark:"#290b35",glow:"#eaa2ff",stroke:"#f7dcff",head:"toxin",accent:"#d946ef"};
  if(k.includes("🦂"))return {tone:"threat",name:"Алый Скорпион",icon:"🦂",skin:"#a61a2e",dark:"#4b0c16",glow:"#ff8f66",stroke:"#ffd2c1",head:"scorpion",accent:"#ff6c5a"};
  if(k.includes("🌪️"))return {tone:"threat",name:"Энергетический шторм",icon:"🌪️",skin:"#5b38ad",dark:"#23114a",glow:"#9fd0ff",stroke:"#dfeeff",head:"storm",accent:"#88b6ff"};
  if(k.includes("🧪"))return {tone:"threat",name:"Токсик",icon:"🧪",skin:"#1a8d64",dark:"#0d3a2e",glow:"#83ffcb",stroke:"#d5fff0",head:"toxin",accent:"#4be1ad"};
  if(k.includes("🎭"))return {tone:"threat",name:"Маска Тени",icon:"🎭",skin:"#6b3cab",dark:"#261239",glow:"#d8b4ff",stroke:"#f1dbff",head:"mask",accent:"#b16fff"};
  return {tone:"threat",name:"Фантом",icon:"👻",skin:"#6f3ca7",dark:"#281143",glow:"#7cecff",stroke:"#dcf8ff",head:"phantom",accent:"#5fd8ff"};
}
function enemyVisualMarkup(spec){
  const boss=spec.tone==="boss";
  if(spec.asset&&VILLAIN_ASSETS[spec.asset])return `<div class="villain-card asset-villain living-figure enemy-button-${spec.tone}" data-villain="${spec.asset}" data-motion="${spec.motion||"stalker"}" style="--villainGlow:${spec.glow};--villainAccent:${spec.accent};">
    <span class="villain-portal figure-depth depth-back"></span><span class="villain-shadow"></span>
    <span class="figure-extrusion villain-extrusion" aria-hidden="true"><img src="${VILLAIN_ASSETS[spec.asset]}" alt="" draggable="false"></span>
    <span class="figure-body-plane"><img class="villain-sprite" src="${VILLAIN_ASSETS[spec.asset]}" alt="${spec.name}" draggable="false"></span>
    <span class="villain-core-flare figure-depth depth-mid"></span><span class="villain-scan figure-depth depth-front"></span>
    <span class="figure-specular" aria-hidden="true"></span><span class="figure-eye-flash" aria-hidden="true"></span>
  </div>`;
  const deco = spec.head==="wolf" ? `<path d="M132 95l-18-18-7 28" class="enemy-crown"/><path d="M227 95l18-18 7 28" class="enemy-crown"/>` :
    spec.head==="magnet" ? `<path d="M125 108c0-24 17-41 39-41h9v17h-7c-11 0-20 9-20 20v20h-21zm110 0c0-24-17-41-39-41h-9v17h7c11 0 20 9 20 20v20h21z" class="enemy-crown"/>` :
    spec.head==="mask" ? `<path d="M134 110c18-15 74-15 92 0l-10 16c-13-6-24-8-36-8-14 0-25 2-36 8z" class="enemy-crown"/>` :
    spec.head==="archon" ? `<path d="M130 92h100l-15 26h-70z" class="enemy-crown"/><circle cx="180" cy="97" r="9" class="enemy-core"/>` :
    spec.head==="void" ? `<circle cx="180" cy="128" r="62" fill="rgba(8,8,16,.24)"/><circle cx="180" cy="128" r="30" fill="#130818"/><circle cx="180" cy="128" r="12" class="enemy-core"/>` :
    spec.head==="drone" ? `<path d="M126 104h-18M252 104h-18" class="enemy-aura-line"/><rect x="122" y="92" width="116" height="34" rx="17" fill="rgba(255,255,255,.08)"/>` :
    spec.head==="scorpion" ? `<path d="M248 214c32 5 43 39 22 58" class="enemy-tail"/>` :
    spec.head==="storm" ? `<path d="M134 92l16 20M226 92l-16 20M180 70l0 22" class="enemy-aura-line"/>` :
    spec.head==="toxin" ? `<path d="M142 92c8 7 12 16 14 27M218 92c-8 7-12 16-14 27" class="enemy-aura-line"/><circle cx="228" cy="198" r="10" class="enemy-core"/>` :
    `<path d="M136 96c13-9 28-13 44-13 18 0 34 5 45 14" class="enemy-aura-line"/>`;
  return `<div class="villain-card enemy-button-${spec.tone}"><svg class="enemy-svg" viewBox="0 0 360 360" role="img" aria-label="${spec.name}" style="--villainSkin:${spec.skin};--villainDark:${spec.dark};--villainGlow:${spec.glow};--villainStroke:${spec.stroke};--villainAccent:${spec.accent};">
    <defs>
      <linearGradient id="enemyMain" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="color-mix(in srgb,var(--villainSkin) 90%,white 8%)"/><stop offset="1" stop-color="var(--villainDark)"/></linearGradient>
      <linearGradient id="enemyDark" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="color-mix(in srgb,var(--villainDark) 65%,black)"/><stop offset="1" stop-color="color-mix(in srgb,var(--villainDark) 90%,black)"/></linearGradient>
      <radialGradient id="enemyFaceGlow" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="rgba(255,255,255,.18)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <ellipse cx="180" cy="320" rx="72" ry="15" class="enemy-shadow"/>
    <path d="M108 287c25-16 113-22 144 0l-6 18H113z" class="enemy-shell"/>
    <path d="M128 268c2-43 19-72 52-84 34-12 59 1 72 28 9 19 13 36 16 56z" class="enemy-cape"/>
    <path d="M134 285c8-54 24-87 49-99 30-14 56-1 70 24 9 17 15 41 17 75z" class="enemy-body-dark"/>
    <path d="M142 280c8-48 22-76 43-87 27-13 47-3 60 18 10 15 16 37 18 69z" class="enemy-body-main"/>
    <path d="M152 215c13 11 25 15 39 15 18 0 32-5 47-16" class="enemy-outline-soft"/>
    <path d="M180 231v47M160 250c13 5 28 5 40 0" class="enemy-outline" opacity=".36"/>
    <path d="M130 225c-23 8-39 22-53 45" class="enemy-aura-line"/>
    <path d="M230 226c24 7 41 20 56 6" class="enemy-aura-line"/>
    <circle cx="273" cy="229" r="${boss?14:11}" class="enemy-core"/>
    <g class="enemy-head">
      <ellipse cx="180" cy="136" rx="66" ry="64" class="enemy-body-dark"/>
      <ellipse cx="180" cy="130" rx="58" ry="56" class="enemy-body-main"/>
      <ellipse cx="180" cy="122" rx="48" ry="38" fill="url(#enemyFaceGlow)"/>
      ${deco}
      <path d="M136 124c17-24 74-31 93-5" class="enemy-outline-soft" opacity=".45"/>
      <rect x="136" y="124" width="88" height="28" rx="14" class="enemy-visor"/>
      <ellipse cx="156" cy="138" rx="11" ry="7" class="enemy-eye"/>
      <ellipse cx="204" cy="138" rx="11" ry="7" class="enemy-eye"/>
      <path d="M146 112c10-5 20-6 29-1M186 111c10-5 19-4 29 1" class="enemy-outline" opacity=".42"/>
      <path d="M178 145c-4 10-2 15 2 19" class="enemy-outline" opacity=".4"/>
      <path d="M161 169c11 7 26 7 39-1" class="enemy-smirk"/>
      <circle cx="167" cy="178" r="5" class="enemy-core" opacity=".8"/>
      <circle cx="195" cy="178" r="5" class="enemy-core" opacity=".8"/>
      <path d="M152 186c13 8 43 8 56 0" class="enemy-outline-soft" opacity=".45"/>
    </g>
  </svg></div>`;
}
function renderTargetVisual(){
  const spec=enemyVisualSpec();
  if(!spec){
    el.heroButton.classList.remove("threat-mode");
    el.heroButton.dataset.villainTone="";
    el.enemyVisual.classList.add("hidden");
    el.targetPulse.classList.add("hidden");
    el.enemyVisual.innerHTML="";
    el.enemyVisual.dataset.key="";
    el.heroStage?.classList.remove("enemy-present");
    el.heroVisual?.removeAttribute("aria-hidden");
    el.heroButton.setAttribute("aria-label","Запустить энергетическую сеть");
    return;
  }
  el.heroButton.classList.add("threat-mode");
  el.heroButton.dataset.villainTone=spec.tone;
  el.enemyVisual.classList.remove("hidden");
  el.targetPulse.classList.remove("hidden");
  el.heroStage?.classList.add("enemy-present");
  el.heroVisual?.setAttribute("aria-hidden","true");
  if(el.enemyVisual.dataset.key!==spec.name){
    el.enemyVisual.dataset.key=spec.name;
    el.enemyVisual.innerHTML=enemyVisualMarkup(spec);
  }
  el.heroButton.setAttribute("aria-label",`Атаковать: ${spec.name}`);
}
function triggerScreenWeb(pointerX=null,pointerY=null){
  const overlay=el.screenWebOverlay;
  applyActiveWebFx();
  overlay.classList.add("active");
  overlay.innerHTML="";

  const w=window.innerWidth,h=window.innerHeight;
  const clusterCount=2+Math.floor(Math.random()*3);
  const points=[];

  if(Number.isFinite(pointerX)&&Number.isFinite(pointerY))points.push([pointerX,pointerY]);
  while(points.length<clusterCount){
    const edge=Math.floor(Math.random()*4);
    const pad=25+Math.random()*60;
    if(edge===0)points.push([Math.random()*w,pad]);
    else if(edge===1)points.push([w-pad,Math.random()*h]);
    else if(edge===2)points.push([Math.random()*w,h-pad]);
    else points.push([pad,Math.random()*h]);
  }

  for(const [x,y] of points){
    const cluster=document.createElement("div");
    cluster.className="dynamic-web-cluster";
    cluster.style.left=`${x}px`;cluster.style.top=`${y}px`;
    const strands=4+Math.floor(Math.random()*5);
    const base=Math.random()*360;
    for(let i=0;i<strands;i++){
      const th=document.createElement("span");th.className="dynamic-web-thread";
      const angle=base+(360/strands)*i+(Math.random()*24-12);
      const len=65+Math.random()*155;
      th.style.setProperty("--angle",`${angle}deg`);
      th.style.width=`${len}px`;
      th.style.animationDelay=`${Math.random()*35}ms`;
      cluster.appendChild(th);
    }
    const node=document.createElement("span");node.className="dynamic-web-node";
    const size=38+Math.random()*75;node.style.width=`${size}px`;node.style.height=`${size}px`;cluster.appendChild(node);

    if(Math.random()>.35){
      const arc=document.createElement("span");arc.className="dynamic-web-arc";
      const as=55+Math.random()*90;arc.style.width=`${as}px`;arc.style.height=`${as}px`;arc.style.setProperty("--arc-rot",`${Math.random()*360}deg`);cluster.appendChild(arc);
    }
    overlay.appendChild(cluster);
  }

  const dot=document.createElement("span");dot.className="web-impact-dot";
  dot.style.left=`${Number.isFinite(pointerX)?pointerX:w*(.25+Math.random()*.5)}px`;
  dot.style.top=`${Number.isFinite(pointerY)?pointerY:h*(.2+Math.random()*.6)}px`;
  overlay.appendChild(dot);

  el.heroButton.classList.remove("web-kick");void el.heroButton.offsetWidth;el.heroButton.classList.add("web-kick");
  clearTimeout(triggerScreenWeb.t);
  triggerScreenWeb.t=setTimeout(()=>{overlay.classList.remove("active");overlay.innerHTML="";el.heroButton.classList.remove("web-kick")},620);
}
triggerScreenWeb.t=0;

function renderCityEvent(){
  if(!activeCityEvent){
    el.cityEvent.classList.add("hidden");
    renderTargetVisual();
    return;
  }
  const remain=Math.max(0,Math.ceil((activeCityEvent.endsAt-Date.now())/1000));
  if(remain<=0){failCityEvent();return}
  el.cityEvent.classList.remove("hidden");
  el.cityEvent.classList.toggle("boss-event",!!activeCityEvent.boss);
  el.cityEvent.classList.toggle("elite-event",!!activeCityEvent.elite);
  el.cityEvent.classList.toggle("enraged",!!activeCityEvent.enraged);
  el.eventIcon.textContent=activeCityEvent.elite?"⭐":activeCityEvent.icon;el.eventName.textContent=`${activeCityEvent.elite?"ЭЛИТА: ":""}${activeCityEvent.name}`;el.eventDesc.textContent=activeCityEvent.desc;
  el.eventTimer.textContent=`${remain}с`;
  el.eventHpFill.style.width=`${Math.max(0,activeCityEvent.hp/activeCityEvent.maxHp*100)}%`;
  el.eventHpText.textContent=`${activeCityEvent.boss?"Босс":"Угроза"}: осталось ${activeCityEvent.hp} попаданий`;
  el.eventReward.textContent=`Награда: ${fmt(activeCityEvent.reward)} + ${fmt(activeCityEvent.xp)} XP`;
  renderTargetVisual();
}
function showHeroSpeech(text=null){
  clearTimeout(heroSpeechTimer);
  el.heroSpeech.textContent=text||HERO_LINES[Math.floor(Math.random()*HERO_LINES.length)];
  el.heroSpeech.classList.add("show");
  heroSpeechTimer=setTimeout(()=>el.heroSpeech.classList.remove("show"),3200);
}
function maybeHeroSpeech(){
  if(!activeCityEvent&&Math.random()<.72){const pool=[...HERO_LINES,...(CITY_HERO_LINES[state.selectedCity]||[])];showHeroSpeech(pool[Math.floor(Math.random()*pool.length)])}
}


const TUTORIAL_STEPS=[
 {title:"Проверь паутину",text:"Нажми на героя 5 раз. Каждый бросок приносит ресурс и заряжает суперприём.",target:()=>el.heroButton,progress:()=>Math.min(5,state.tutorialClicks),goal:5},
 {title:"Первое усиление",text:"Купи любое доступное улучшение. Это начнёт формировать твою сборку.",target:()=>document.querySelector(".shop-item:not(:disabled)"),progress:()=>state.purchases>0?1:0,goal:1},
 {title:"Забери тайник",text:"Открой бесплатный тайник справа. Это один из регулярных источников ускорения.",target:()=>$("sideFreeBtn")||el.chestBtn,progress:()=>state.chestsOpened>0?1:0,goal:1},
 {title:"Найди босса",text:"Открой раздел «Районы». Вверху переключаются миры, ниже всегда видны боссы и награды.",target:()=>document.querySelector('.dock-btn[data-bottom-target="map"]'),progress:()=>state.tutorialStep>=4?1:0,goal:1},
 {title:"Первый патруль завершён",text:"Готово. Развивай героя, реагируй на тревоги и открывай новых боссов. За обучение — стартовая награда.",target:()=>null,progress:()=>1,goal:1}
];
function clearTutorialFocus(){if(tutorialFocusEl){tutorialFocusEl.classList.remove("tutorial-focus");tutorialFocusEl=null}}
function startTutorial(force=false){
  if(state.tutorialDone&&!force)return;
  tutorialActive=true;state.tutorialStep=Math.min(state.tutorialStep,4);el.tutorialOverlay.classList.remove("hidden");setTab("shop");renderTutorial();
}
function renderTutorial(){
  if(!tutorialActive)return;clearTutorialFocus();
  const i=Math.min(4,state.tutorialStep),step=TUTORIAL_STEPS[i],value=Math.min(step.goal,step.progress());
  el.tutorialEyebrow.textContent=`ПЕРВЫЙ ПАТРУЛЬ · ${i+1}/5`;el.tutorialTitle.textContent=step.title;el.tutorialText.textContent=step.text;
  el.tutorialProgressFill.style.width=`${Math.min(100,value/step.goal*100)}%`;el.tutorialProgressText.textContent=i===4?"Награда: 500 ресурсов + 100 XP":`${value} / ${step.goal}`;
  const target=step.target();if(target){target.classList.add("tutorial-focus");tutorialFocusEl=target}
  if(i===4){el.tutorialSkipBtn.textContent="Завершить";el.tutorialSkipBtn.onclick=finishTutorial}else{el.tutorialSkipBtn.textContent="Пропустить";el.tutorialSkipBtn.onclick=()=>finishTutorial(true)}
}
function tutorialCheck(kind){
  if(!tutorialActive)return;
  if(state.tutorialStep===0&&kind==="click"){state.tutorialClicks++;if(state.tutorialClicks>=5){state.tutorialStep=1;addThreats(80);setTab("shop")}}
  else if(state.tutorialStep===1&&kind==="buy"){state.tutorialStep=2;gainXp(25)}
  else if(state.tutorialStep===2&&kind==="chest"){state.tutorialStep=3;gainXp(25)}
  else if(state.tutorialStep===3&&kind==="cities"){state.tutorialStep=4}
  persist();renderTutorial();
}
function finishTutorial(skipped=false){
  if(!skipped){addThreats(500);gainXp(100);sfx("claim");toast("Первый патруль завершён: +500 и +100 XP")}
  state.tutorialDone=true;state.tutorialStep=4;tutorialActive=false;clearTutorialFocus();el.tutorialOverlay.classList.add("hidden");persist(true);renderAll();
}

function renderCore(){
  ensureDaily();
  el.threats.textContent=fmt(state.threats);el.perSecond.textContent=fmt(passive());el.clickPower.textContent=`+${fmt(clickPower())} за выпуск сети`;
  if(el.topThreats)el.topThreats.textContent=fmt(state.threats);if(el.topPerSecond)el.topPerSecond.textContent=`+${fmt(passive())}/сек`;if(el.centerThreats)el.centerThreats.textContent=fmt(state.threats);if(el.centerGain)el.centerGain.textContent=`+${fmt(clickPower())} за выпуск`;
  el.totalClicks.textContent=fmt(state.clicks);el.lifetimeThreats.textContent=fmt(state.lifetime);el.totalPurchases.textContent=fmt(state.purchases);el.eventWins.textContent=fmt(state.eventWins);el.prestigeCount.textContent=state.prestige;
  const need=xpNeed();const pct=Math.min(100,state.xp/need*100);
  el.rankText.textContent=`${state.level}`;el.rankFill.style.width=`${pct}%`;el.xpText.textContent=`${fmt(state.xp)} / ${fmt(need)} XP`;
  el.levelBonus.textContent=`+${Math.round((levelMultiplier()-1)*100)}% к эффективности дозора`;
  el.levelUpBtn.disabled=state.xp<need;el.levelUpBtn.textContent=state.xp>=need?"Повысить уровень":`Нужно ${fmt(need-state.xp)} XP`;
  el.prestigeBadge.textContent=`◆ Наследие x${prestigeMultiplier().toFixed(2)}`;
  const dd=dangerDef();el.dangerBadge.textContent=`⚠ Угроза ${dd.label} · x${dd.reward.toFixed(2)}`;el.dangerBadge.classList.toggle("high",state.dangerTier>=4);
  el.feverBadge.classList.toggle("hidden",!cityFever());
  if(cityFever())el.feverBadge.textContent=`🔥 Город в сети x1.5`;
  el.soundBtn.textContent=state.sfxEnabled?"🔊":"🔇";el.musicBtn.textContent=state.musicEnabled?"🎵":"🎶×";
  const shownTrack=TRACKS[contextTrackIndex()]||TRACKS[0];
  el.trackBadge.textContent=`♫ ${shownTrack.name}`;
  applyWorldStyle();
  renderTargetVisual();renderUltimate();

  if(boosted()){
    const s=Math.max(0,Math.ceil((state.boostUntil-Date.now())/1000));el.boostBadge.classList.remove("hidden");el.boostTime.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`
  }else el.boostBadge.classList.add("hidden");

  el.rewardBtn.disabled=!sdkReady||adBusy||boosted();
  el.rewardHint.textContent=boosted()?"ускорение уже активно":!sdkReady?"доступно в Яндекс Играх":adBusy?"открываем рекламу…":"ускорить дозор на 2 минуты";

  const rem=state.nextChestAt-Date.now();el.chestBtn.disabled=rem>0;
  el.chestHint.textContent=rem>0?`через ${Math.floor(rem/60000)}:${String(Math.floor(rem/1000)%60).padStart(2,"0")}`:"открыть сейчас";
  el.dailyHint.textContent=dailyRewardAvailable()?"забрать трофей":"уже получено сегодня";

  const riftPct=Math.max(0,Math.min(100,state.riftCharge||0));
  if(el.riftFill)el.riftFill.style.width=`${riftPct}%`;
  if(el.riftBtn){el.riftBtn.textContent=riftPct>=100?"ОТКРЫТЬ":""+Math.floor(riftPct)+"%";el.riftBtn.disabled=riftPct<100;el.riftBtn.classList.toggle("ready",riftPct>=100)}
  if(el.riftHint)el.riftHint.textContent=riftPct>=100?`Разлом готов. Заходов завершено: ${state.riftRuns||0}.`:`Заряд ${Math.floor(riftPct)}%. Боссы и победы наполняют его быстрее.`;
  const boss=currentDistrictBoss();
  if(el.bossRushName&&boss)el.bossRushName.textContent=`${boss.boss} · ${boss.name}`;
  if(el.bossRushHint&&boss){const open=state.level>=boss.unlock;el.bossRushHint.textContent=open?`Реком. сила ${fmt(boss.power)} · награда ${fmt(boss.reward)} ◆`:`Откроется на уровне ${boss.unlock}`;}
  if(el.bossRushVisual&&boss){const asset=boss.bossAsset&&VILLAIN_ASSETS[boss.bossAsset];el.bossRushVisual.innerHTML=asset?`<img src="${asset}" alt="">`:`<span>${boss.bossIcon}</span>`;el.bossRushVisual.style.setProperty("--boss-accent",boss.accent);}
  if(el.bossRushBtn&&boss){el.bossRushBtn.disabled=!canStartCurrentBoss();el.bossRushBtn.textContent=activeCityEvent?"В БОЮ":state.level>=boss.unlock?`БОСС`:`ур. ${boss.unlock}`;}

  const canPrestige=state.lifetime>=PRESTIGE_REQUIREMENT&&state.level>=20;
  el.prestigeBtn.disabled=!canPrestige;
  el.prestigeDesc.textContent=canPrestige
    ?`Сбросить арсенал → постоянный множитель x${(prestigeMultiplier()+.30).toFixed(2)}`
    :`Нужно: уровень 20 и ${fmt(PRESTIGE_REQUIREMENT)} угроз за всё время`;

  el.buyModeBtn.textContent=`x${state.buyMode}`;
  const pts=tacticPointsAvailable();el.tacticPoints.textContent=`${pts} очк.`;el.strikerInfo.textContent=`ур. ${state.tactics.striker} · +${state.tactics.striker*12}% к клику · крит ${Math.round(critChance()*100)}%`;el.networkInfo.textContent=`ур. ${state.tactics.network} · +${state.tactics.network*14}% к дозору`;el.hunterInfo.textContent=`ур. ${state.tactics.hunter} · +${state.tactics.hunter*12}% к наградам`;
  document.querySelectorAll("[data-tactic]").forEach(b=>b.disabled=pts<=0);
  const sec=secondsUntilMidnight();el.dailyDateText.textContent=`Новый набор через ${Math.floor(sec/3600)}ч ${Math.floor((sec%3600)/60)}м`;
  renderCityEvent();
}

function worldUpgradeText(key,u){
  const city=state.selectedCity;
  const names={
    crimson:{thread:["Быстрая нить","+1 к ручному броску"],gauntlet:["Ударный браслет","+6 к силе паутины"],scanner:["Уличный сенсор","+1 патруль/сек"],rooftop:["Пост на крыше","+8 патруль/сек"],drone:["Штурм-дрон","+60 патруль/сек"],sentinel:["Красный Страж","+450 патруль/сек"],riders:["Ночной отряд","+3.5K патруль/сек"],wardens:["Городская гвардия","+28K патруль/сек"],nexus:["Центральный штаб","+240K патруль/сек"]},
    neon:{thread:["Оптоволоконная нить","+1 к ручному импульсу"],gauntlet:["Неон-перчатка","+6 к импульсу"],scanner:["Портовый радар","+1 сеть/сек"],rooftop:["Релейный узел","+8 сеть/сек"],drone:["Грузовой дрон","+60 сеть/сек"],sentinel:["Автомат-охранник","+450 сеть/сек"],riders:["Рой курьеров","+3.5K сеть/сек"],wardens:["Портовый кластер","+28K сеть/сек"],nexus:["Квантовый сервер","+240K сеть/сек"]},
    frost:{thread:["Термонить","+1 к ручной стабилизации"],gauntlet:["Крио-перчатка","+6 к стабилизации"],scanner:["Тепловой датчик","+1 стабилизация/сек"],rooftop:["Тепловой маяк","+8 стабилизация/сек"],drone:["Снего-дрон","+60 стабилизация/сек"],sentinel:["Крио-страж","+450 стабилизация/сек"],riders:["Экспедиция","+3.5K стабилизация/сек"],wardens:["Купольный контур","+28K стабилизация/сек"],nexus:["Климатическое ядро","+240K стабилизация/сек"]},
    astra:{thread:["Резонансная нить","+1 к ручному резонансу"],gauntlet:["Грави-браслет","+6 к резонансу"],scanner:["Спектральный сканер","+1 резонанс/сек"],rooftop:["Орбитальный маяк","+8 резонанс/сек"],drone:["Плазма-дрон","+60 резонанс/сек"],sentinel:["Астра-страж","+450 резонанс/сек"],riders:["Звёздный отряд","+3.5K резонанс/сек"],wardens:["Портальная решётка","+28K резонанс/сек"],nexus:["Сингулярный узел","+240K резонанс/сек"]}
  };
  return names[city]?.[key]||[u.name,u.desc];
}

function renderShop(){
  el.shopList.innerHTML=Object.entries(upgrades).map(([k,u])=>{
    const lock=!unlocked(k),price=bulkPrice(k,state.buyMode),can=!lock&&state.threats>=price;
    const wt=worldUpgradeText(k,u),txt=lock?`Откроется на уровне ${u.unlockLevel}`:wt[1];
    return `<button class="shop-item ${lock?"locked-item":""}" data-buy="${k}" ${can?"":"disabled"}>
      <span class="item-icon">${u.icon}</span>
      <span class="item-main"><span class="item-title-row"><b>${wt[0]}</b><span class="level-pill">ур. ${state.levels[k]}</span></span><small>${txt}</small></span>
      <span class="item-price">${lock?"🔒":fmt(price)+" ◆"}</span>
    </button>`;
  }).join("");
  el.shopList.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>buyUpgrade(b.dataset.buy)));
}
function renderDailyMissions(){
  let ready=0;
  el.dailyMissionList.innerHTML=state.dailyMissions.map(m=>{
    const p=missionProgress(m),done=p>=m.target,claimed=state.dailyClaimed.includes(m.id);if(done&&!claimed)ready++;
    return `<div class="mission-item ${claimed?"claimed":""}">
      <div class="mission-icon">${MISSION_ICONS[m.kind]||"✦"}</div>
      <div class="mission-copy"><div class="mission-title-row"><h3>${m.title}</h3><span>${fmt(Math.min(p,m.target))} / ${fmt(m.target)}</span></div><p>${m.desc}</p><div class="progress-line"><div style="width:${Math.min(100,p/m.target*100)}%"></div></div><p class="reward-label"><span>✦ ${fmt(m.reward)}</span><span>⭐ ${Math.floor(m.reward/8)} XP</span></p></div>
      <button class="claim-btn ${done&&!claimed?"ready":""}" data-mission="${m.id}" ${done&&!claimed?"":"disabled"}>${claimed?"Получено":done?"Забрать":fmt(p)+"/"+fmt(m.target)}</button>
    </div>`;
  }).join("");
  el.dailyDot.classList.toggle("hidden",ready===0);
  $("sideDailyDot")?.classList.toggle("hidden",ready===0);
  el.dailyMissionList.querySelectorAll("[data-mission]").forEach(b=>b.addEventListener("click",()=>claimMission(b.dataset.mission)));
}
function renderAchievements(){
  let ready=0;
  el.achievementList.innerHTML=achievementDefs.map(a=>{
    const ok=a.check(state),claimed=state.achievementClaimed.includes(a.id);if(ok&&!claimed)ready++;
    return `<div class="achievement-item ${claimed?"claimed":""}">
      <div class="mission-icon trophy-icon">${a.icon}</div><div class="mission-copy"><h3>${a.title}</h3><p>${a.desc}</p><p class="reward-label"><span>✦ ${fmt(a.reward)}</span><span>трофей</span></p></div>
      <button class="claim-btn ${ok&&!claimed?"ready":""}" data-ach="${a.id}" ${ok&&!claimed?"":"disabled"}>${claimed?"Получено":ok?"Забрать":"Закрыто"}</button>
    </div>`;
  }).join("");
  el.achievementDot.classList.toggle("hidden",ready===0);
  el.achievementList.querySelectorAll("[data-ach]").forEach(b=>b.addEventListener("click",()=>claimAchievement(b.dataset.ach)));
}
function renderDailyReward(){
  const streak=Math.min(6,state.dailyStreak),avail=dailyRewardAvailable();
  el.dailyRewardDays.innerHTML=dailyRewardTable.map((r,i)=>`<div class="daily-day ${i===streak?"active":""}"><b>Д${i+1}</b><small>${fmt(dailyRewardValue(i))}</small></div>`).join("");
  el.claimDailyBtn.disabled=!avail;el.claimDailyBtn.textContent=avail?`Забрать ${fmt(dailyRewardValue(streak))}`:"Сегодня уже получено";
  el.dailyRewardText.textContent=avail?"Серия повышает награду. Не пропускай больше одного дня.":"Следующий трофей станет доступен завтра.";
  el.sideGiftDot?.classList.toggle("hidden",!avail);
}
function renderReferral(){
  const code=playerId?hashString(playerId):"ГОСТЬ";
  el.inviteCode.textContent=code;
  if(player&&player.isAuthorized&&player.isAuthorized()){
    el.authBtn.textContent="Яндекс ID подключён";el.authBtn.disabled=true;
    el.referralStatus.textContent="Код готов. Награды пригласившему заработают после подключения серверного реферального учёта.";
  }else{
    el.authBtn.textContent="Войти с Яндекс ID для рефералов";el.authBtn.disabled=!sdkReady;
    el.referralStatus.textContent=state.incomingRef?`Обнаружен код приглашения ${state.incomingRef}. Для безопасной выплаты нужен сервер.`:"Серверные реферальные награды пока не активированы.";
  }
}

function hasEntitlement(id){return state.premiumEntitlements.includes(id)}
function addEntitlement(id){if(!hasEntitlement(id))state.premiumEntitlements.push(id)}
function premiumProduct(id){return PREMIUM_PRODUCTS.find(x=>x.id===id)}
function catalogProduct(id){return paymentCatalog.get(id)||null}
function applyPermanentEntitlement(productID){
  const p=premiumProduct(productID);if(!p||p.type!=="permanent")return false;
  addEntitlement(p.entitlement||productID);
  if(productID==="founder_pack"){
    state.founderBadge=true;
    if(!state.ownedWebFx.includes("founder"))state.ownedWebFx.push("founder");
    if(!hasEntitlement("founderShardGrant")){state.nexusShards+=120;addEntitlement("founderShardGrant")}
  }else if(productID==="umbra_character"){
    if(!state.charactersUnlocked.includes("umbra"))state.charactersUnlocked.push("umbra");
  }else if(productID==="void_web_fx"){
    if(!state.ownedWebFx.includes("void"))state.ownedWebFx.push("void");
  }
  return true;
}
function grantConsumableProduct(productID){
  const p=premiumProduct(productID);if(!p||p.type!=="consumable")return false;
  if(p.grant?.shards)state.nexusShards+=p.grant.shards;
  return true;
}
async function commitPurchaseState(){
  saveLocal();
  if(player){
    state.savedAt=Date.now();
    await player.setData({crimsonWebV20:snapshot()},true);
  }
}
async function handleConsumablePurchase(purchase){
  if(!purchase?.purchaseToken||!purchase?.productID)return;
  if(!state.processedPurchaseTokens.includes(purchase.purchaseToken)){
    grantConsumableProduct(purchase.productID);
    state.processedPurchaseTokens.push(purchase.purchaseToken);
    state.processedPurchaseTokens=state.processedPurchaseTokens.slice(-120);
    await commitPurchaseState();
  }
  if(payments)await payments.consumePurchase(purchase.purchaseToken);
}
async function reconcilePurchases(showToast=false){
  if(!payments)return;
  try{
    const list=await payments.getPurchases();
    for(const purchase of list){
      const product=premiumProduct(purchase.productID);
      if(!product)continue;
      if(product.type==="permanent"){
        applyPermanentEntitlement(product.id);
      }else{
        await handleConsumablePurchase(purchase);
      }
    }
    saveLocal();if(player)await saveCloud(true);
    if(showToast)toast("Покупки восстановлены");
    renderAll();
  }catch(e){
    console.warn("restore purchases",e);
    if(showToast)toast("Не удалось проверить покупки");
  }
}
async function initPayments(){
  if(!ysdk)return;
  try{
    payments=await ysdk.getPayments();
    paymentsReady=true;updateRcDiagnostics();
    const catalog=await payments.getCatalog();
    paymentCatalog=new Map(catalog.map(p=>[p.id,p]));
    await reconcilePurchases(false);
    renderVault();
  }catch(e){
    payments=null;paymentsReady=false;updateRcDiagnostics();console.warn("payments init",e);renderVault();
  }
}
async function buyPremiumProduct(id){
  const product=premiumProduct(id);
  if(!product)return;
  if(product.type==="permanent"&&hasEntitlement(product.entitlement||id)){toast("Этот предмет уже принадлежит тебе");return}
  if(!paymentsReady||!payments){toast("Покупки доступны после запуска через Яндекс Игры");return}
  stopGameplay();pauseAudio();
  try{
    const purchase=await payments.purchase({id});
    if(product.type==="permanent"){
      applyPermanentEntitlement(id);
      await commitPurchaseState();
      toast(`Получено: ${product.title}`);
    }else{
      await handleConsumablePurchase(purchase);
      toast(`Получено: ${product.title}`);
    }
    renderAll();
  }catch(e){
    console.warn("purchase",e);
    toast("Покупка не завершена");
  }finally{
    if(noModalOpen()&&!adBusy)startGameplay();
    resumeAudioAfterFocus();
  }
}
function renderVault(){
  if(!el.shardBalance)return;
  el.shardBalance.textContent=fmt(state.nexusShards);el.shardBalanceTop.textContent=fmt(state.nexusShards);
  el.iapStatus.textContent=paymentsReady?"SDK покупок: подключён":location.protocol==="file:"?"SDK покупок: локальный предпросмотр":"SDK покупок: недоступен";
  el.iapStatus.classList.toggle("ready",paymentsReady);el.iapStatus.classList.toggle("error",!paymentsReady&&location.protocol!=="file:");

  el.iapProductList.innerHTML=PREMIUM_PRODUCTS.map(p=>{
    const cp=catalogProduct(p.id),owned=p.type==="permanent"&&hasEntitlement(p.entitlement||p.id);
    let priceText=cp?.price||"Цена появится в Яндекс Играх",currencyIcon="";
    try{if(cp?.getPriceCurrencyImage)currencyIcon=`<img class="iap-price-icon" src="${cp.getPriceCurrencyImage("small")}" alt="">`}catch(_){}
    return `<div class="iap-card ${p.type}" style="--product-accent:${p.accent}">
      <span class="iap-type">${p.type==="permanent"?"НАВСЕГДА":"РАСХОДУЕМОЕ"}</span>
      <span class="iap-icon">${p.icon}</span>
      <span class="iap-copy"><b>${p.title}</b><small>${p.desc}</small>${owned?`<small class="iap-owned">✓ Уже получено</small>`:""}</span>
      <button class="iap-buy-btn ${cp?"":"iap-price-unavailable"}" data-iap="${p.id}" ${owned||!paymentsReady||!cp?"disabled":""}>${owned?"Получено":`${currencyIcon}<span>${priceText}</span>`}</button>
    </div>`;
  }).join("");
  el.iapProductList.querySelectorAll("[data-iap]").forEach(b=>b.addEventListener("click",()=>buyPremiumProduct(b.dataset.iap)));

  el.shardStoreList.innerHTML=SHARD_STORE_ITEMS.map(item=>{
    const owned=state.shardItemsOwned.includes(item.id);
    const can=!owned&&state.nexusShards>=item.cost;
    return `<button class="shard-item ${owned?"owned":""}" data-shard-item="${item.id}" ${owned||!can?"disabled":""}>
      <span class="shard-item-icon">${item.icon}</span><span><b>${item.name}</b><small>${item.desc}</small></span>
      <span class="shard-item-price">${owned?"✓ Получено":`💎 ${item.cost}`}</span>
    </button>`;
  }).join("");
  el.shardStoreList.querySelectorAll("[data-shard-item]").forEach(b=>b.addEventListener("click",()=>buyShardItem(b.dataset.shardItem)));

  el.webFxPicker.innerHTML=WEB_FX.map(fx=>{
    const owned=state.ownedWebFx.includes(fx.id),selected=state.activeWebFx===fx.id;
    return `<button class="web-fx-choice ${selected?"selected":""}" style="--fx-color:${fx.color}" data-webfx="${fx.id}" ${owned?"":"disabled"}><b>${fx.icon} ${fx.name}</b><small>${selected?"Активна":owned?"Выбрать":"Не открыта"}</small></button>`;
  }).join("");
  el.webFxPicker.querySelectorAll("[data-webfx]").forEach(b=>b.addEventListener("click",()=>equipWebFx(b.dataset.webfx)));
}
function equipWebFx(id){
  if(!state.ownedWebFx.includes(id))return;
  state.activeWebFx=id;applyActiveWebFx();sfx("theme");persist(true);renderVault();toast("Эффект паутины изменён");
}
function buyShardItem(id){
  const item=SHARD_STORE_ITEMS.find(x=>x.id===id);
  if(!item||state.shardItemsOwned.includes(id)||state.nexusShards<item.cost)return;
  state.nexusShards-=item.cost;state.shardItemsOwned.push(id);
  if(item.kind==="webfx"){
    if(!state.ownedWebFx.includes(item.value))state.ownedWebFx.push(item.value);
    state.activeWebFx=item.value;
  }
  sfx("claim");persist(true);renderAll();toast(`Получено: ${item.name}`);
}
function applyActiveWebFx(){
  const fx=WEB_FX.find(x=>x.id===state.activeWebFx)||WEB_FX[0];
  el.screenWebOverlay.className=`screen-web-overlay web-fx-${fx.id}`;
  el.screenWebOverlay.style.setProperty("--webFxColor",fx.color);
  el.screenWebOverlay.style.setProperty("--webFxGlow",fx.glow);
}

function renderAll(){unlockCharactersForLevel();renderCore();renderShop();renderDailyMissions();renderCities();renderDistricts();renderCharacters();renderLevelPath();renderAchievements();renderDailyReward();renderReferral();renderMusicPanel();renderVault();applyActiveWebFx();document.querySelectorAll("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===state.theme))}

function buyUpgrade(k){
  if(!upgrades[k]||!unlocked(k))return;
  const amount=state.buyMode,price=bulkPrice(k,amount);if(state.threats<price)return;
  state.threats-=price;state.levels[k]+=amount;state.purchases+=amount;gainXp(6*amount);
  sfx("buy");tutorialCheck("buy");persist();renderAll();
}
function heroClick(e){
  userGestureAudio();
  const now=performance.now();
  if(now-lastClick<620){comboClicks++;combo=Math.min(3,1+Math.floor(comboClicks/12)*.2)}else{comboClicks=0;combo=1}
  lastClick=now;
  const amount=clickPower()*combo;addThreats(amount);state.clicks++;gainXp(Math.max(1,Math.ceil(combo)));
  addRiftCharge(riftGainBase()+combo*.08);
  const target=activeCityEvent,beforeHp=target?.hp??0;hitCityEvent();const dealt=target?Math.max(0,beforeHp-target.hp):0;
  addUltimateCharge(2.5+combo+(dealt>0?1:0));
  floatGain(e?.clientX??innerWidth/2,e?.clientY??innerHeight/2,amount);
  if(target)spawnCombatImpact(e?.clientX??innerWidth/2,e?.clientY??innerHeight*.42,dealt,false);
  triggerScreenWeb(e?.clientX??null,e?.clientY??null);
  const attackClass=`attack-${state.selectedCharacter}`;el.heroButton.classList.add("pressed","shooting",attackClass);setTimeout(()=>el.heroButton.classList.remove("pressed"),70);setTimeout(()=>el.heroButton.classList.remove("shooting",attackClass),360);
  tutorialCheck("click");
  if(combo>1){el.comboBadge.textContent=`✦ Серия x${combo.toFixed(2)}`;el.comboBadge.classList.remove("hidden")}else el.comboBadge.classList.add("hidden");
  sfx("web");saveLocal();scheduleCloud();renderCore();
  if(state.clicks%8===0){renderDailyMissions();renderAchievements()}
}
function levelUp(){
  const need=xpNeed();if(state.xp<need)return;
  state.xp-=need;state.level++;state.levelsGained++;unlockCharactersForLevel();
  const unlockedCity=CITIES.find(c=>c.unlock===state.level);if(unlockedCity)setTimeout(()=>showHeroSpeech(`Открыт новый мир: ${unlockedCity.name}.`),700);
  const reward=levelReward(state.level);
  addThreats(reward);
  const milestone=state.level%5===0;
  sfx("level");
  showHeroSpeech(milestone?"Вот это скачок силы!":"Становимся сильнее.");showLevelBurst(state.level,reward,milestone);
  toast(`Уровень ${state.level}! +${fmt(reward)} угроз${milestone?" · усиленная награда!":""}`);
  persist(true);renderAll();
}
function claimMission(id){
  const m=state.dailyMissions.find(x=>x.id===id);if(!m||state.dailyClaimed.includes(id)||missionProgress(m)<m.target)return;
  state.dailyClaimed.push(id);addThreats(m.reward);gainXp(45+state.level*12);sfx("claim");toast(`Миссия дня выполнена: +${fmt(m.reward)} угроз`);
  persist(true);renderAll();
}
function claimAchievement(id){
  const a=achievementDefs.find(x=>x.id===id);if(!a||state.achievementClaimed.includes(id)||!a.check(state))return;
  state.achievementClaimed.push(id);addThreats(a.reward);gainXp(55+state.level*15);sfx("claim");toast(`Трофей получен: +${fmt(a.reward)}`);
  persist(true);renderAll();
}
function openChest(){
  if(Date.now()<state.nextChestAt)return;
  const base=Math.max(300,basePassive()*50,baseClick()*70);const mult=[1,1.5,2,3][Math.floor(Math.random()*4)],reward=Math.floor(base*mult);
  addThreats(reward);gainXp(35+state.level*5);state.chestsOpened++;state.nextChestAt=Date.now()+CHEST_MS;
  sfx("chest");toast(`Тайник дозора: +${fmt(reward)} угроз`);tutorialCheck("chest");persist();renderAll();
}
function claimDailyReward(){
  if(!dailyRewardAvailable())return;
  const now=Date.now();
  if(state.lastDailyAt){
    const diff=now-state.lastDailyAt;
    if(diff>2*DAY_MS)state.dailyStreak=0;else state.dailyStreak=Math.min(6,state.dailyStreak+1);
  }else state.dailyStreak=0;
  const reward=dailyRewardValue(state.dailyStreak);addThreats(reward);gainXp(60+state.dailyStreak*25+state.level*8);state.lastDailyAt=now;
  sfx("claim");toast(`Трофей дня: +${fmt(reward)} угроз`);persist(true);renderAll();
}
function prestige(){
  const can=state.lifetime>=PRESTIGE_REQUIREMENT&&state.level>=20;if(!can)return;
  state.prestige++;state.threats=0;state.level=1;state.xp=0;state.boostUntil=0;state.feverUntil=0;state.eventStreak=0;state.dangerTier=1;state.dangerWins=0;state.tactics={striker:0,network:0,hunter:0};
  for(const k of Object.keys(state.levels))state.levels[k]=0;
  resetDailyMissions(localDateKey());sfx("prestige");toast(`Наследие ${state.prestige}: постоянный множитель x${prestigeMultiplier().toFixed(2)}`);
  persist(true);renderAll();
}

const THEME_BROWSER_COLORS={red:"#16070d",dark:"#080b12",light:"#eef4ff",neon:"#090819"};
function syncBrowserThemeColor(theme=state.theme){
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute("content",THEME_BROWSER_COLORS[theme]||THEME_BROWSER_COLORS.red);
  document.documentElement.style.colorScheme=theme==="light"?"light":"dark";
}

function setTheme(theme){
  if(!THEMES.includes(theme))return;
  state.theme=theme;
  document.documentElement.dataset.theme=theme;
  syncBrowserThemeColor(theme);
  saveLocal();sfx("theme");renderAll();
  document.querySelectorAll("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===theme));
  toast(`Тема: ${{red:"Багровая",dark:"Графит",light:"Дневная",neon:"Неоновая"}[theme]||theme}`);
}
function setTab(name){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
  const target=$(name+"Tab");if(target)target.classList.add("active");
  const dockMap={shop:"shop",map:"map",heroes:"heroes",vault:"vault",daily:"daily",levels:"heroes",achievements:"heroes",cities:"map"};
  document.querySelectorAll(".dock-btn").forEach(b=>b.classList.toggle("active",b.dataset.bottomTarget===dockMap[name]));
  document.body.dataset.activeTab=name;
  if(window.matchMedia("(max-width:900px)").matches)requestAnimationFrame(()=>{
    const app=document.querySelector(".app");
    if(name==="shop")app?.scrollTo({top:0,behavior:"smooth"});
    else document.querySelector(".panel")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
  if(name==="map")tutorialCheck("cities");
}
function openModal(id){$(id).classList.remove("hidden");stopGameplay();if(id==="dailyModal")renderDailyReward();if(id==="inviteModal")renderReferral();if(id==="musicModal")renderMusicPanel()}
function closeModal(id){$(id).classList.add("hidden");if(noModalOpen()&&!adBusy)startGameplay()}
function noModalOpen(){return ["musicModal","themeModal","dailyModal","inviteModal","welcomeModal","victoryModal","infoModal"].every(id=>$(id).classList.contains("hidden"))}

async function shareInvite(){
  if(location.protocol==="file:"){toast("После публикации кнопка будет делиться ссылкой на игру");return}
  const code=playerId?hashString(playerId):"";
  const url=new URL(location.href);url.searchParams.delete("ref");if(code)url.searchParams.set("ref",code);
  try{
    if(navigator.share){await navigator.share({title:"Багровая Сеть: Дозор",text:"Присоединяйся к моему дозору!",url:url.toString()});toast("Приглашение отправлено");return}
  }catch(_){}
  try{await navigator.clipboard.writeText(url.toString());toast("Ссылка приглашения скопирована")}catch(_){toast("Не удалось скопировать ссылку")}
}
async function authorize(){
  if(!ysdk||!sdkReady)return;
  try{
    if(player?.isAuthorized?.()){toast("Яндекс ID уже подключён");return}
    await ysdk.auth.openAuthDialog();
    player=await ysdk.getPlayer();playerId=player.getUniqueID?.()||"";renderReferral();await saveCloud(true);toast("Яндекс ID подключён");
  }catch(e){console.warn(e);toast("Авторизация не завершена")}
}

function initIncomingRef(){
  try{
    const ref=new URL(location.href).searchParams.get("ref");
    if(ref&&/^[A-Z0-9]{5,12}$/i.test(ref))state.incomingRef=ref.toUpperCase();
  }catch(_){}
}

function ensureAudio(){
  if(audioCtx)return audioCtx;
  try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch(_){return null}
  return audioCtx;
}
function userGestureAudio(){
  const a=ensureAudio();if(a?.state==="suspended")a.resume();
  if(state.musicEnabled&&!musicStarted)startMusic();
}
function tone(freq,dur=.08,type="sine",gainValue=.035,when=0){
  const a=ensureAudio();if(!a)return;
  const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,a.currentTime+when);
  g.gain.setValueAtTime(gainValue,a.currentTime+when);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+when+dur);
  o.connect(g);g.connect(a.destination);o.start(a.currentTime+when);o.stop(a.currentTime+when+dur);
}
function ensureMusicBus(){
  const a=ensureAudio();if(!a)return null;if(musicBus)return musicBus;
  const input=a.createGain(),warmth=a.createBiquadFilter(),compressor=a.createDynamicsCompressor(),master=a.createGain(),delay=a.createDelay(.8),feedback=a.createGain(),wet=a.createGain();
  input.gain.value=.82;warmth.type="lowpass";warmth.frequency.value=4200;warmth.Q.value=.32;
  compressor.threshold.value=-22;compressor.knee.value=18;compressor.ratio.value=3;compressor.attack.value=.025;compressor.release.value=.32;
  master.gain.value=.42;delay.delayTime.value=.27;feedback.gain.value=.18;wet.gain.value=.19;
  input.connect(warmth);warmth.connect(compressor);compressor.connect(master);input.connect(delay);delay.connect(wet);wet.connect(master);delay.connect(feedback);feedback.connect(delay);master.connect(a.destination);
  musicBus={input,master};return musicBus;
}
function musicTone(freq,dur=.3,type="sine",gainValue=.014,when=0,pan=0){
  const a=ensureAudio(),bus=ensureMusicBus();if(!a||!bus)return;
  const start=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);
  g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gainValue),start+Math.min(.08,dur*.22));g.gain.exponentialRampToValueAtTime(.0001,start+dur);
  o.connect(g);
  if(a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(bus.input)}else g.connect(bus.input);
  o.start(start);o.stop(start+dur+.03);
}
function noiseBurst(dur=.045,gainValue=.018){
  const a=ensureAudio();if(!a)return;
  const len=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,len,a.sampleRate),data=buf.getChannelData(0);
  for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);
  const src=a.createBufferSource(),g=a.createGain();src.buffer=buf;g.gain.value=gainValue;src.connect(g);g.connect(a.destination);src.start();
}

function webThwip(){
  const a=ensureAudio();if(!a)return;
  const now=a.currentTime;

  // Mechanical snap.
  const click=a.createOscillator(),cg=a.createGain();
  click.type="square";click.frequency.setValueAtTime(720,now);click.frequency.exponentialRampToValueAtTime(230,now+.045);
  cg.gain.setValueAtTime(.022,now);cg.gain.exponentialRampToValueAtTime(.001,now+.052);
  click.connect(cg);cg.connect(a.destination);click.start(now);click.stop(now+.055);

  // Elastic whistle.
  const whip=a.createOscillator(),wg=a.createGain(),filter=a.createBiquadFilter();
  whip.type="triangle";whip.frequency.setValueAtTime(410,now+.012);whip.frequency.exponentialRampToValueAtTime(1220,now+.07);whip.frequency.exponentialRampToValueAtTime(590,now+.14);
  filter.type="bandpass";filter.frequency.value=950;filter.Q.value=1.2;
  wg.gain.setValueAtTime(.001,now);wg.gain.linearRampToValueAtTime(.025,now+.02);wg.gain.exponentialRampToValueAtTime(.001,now+.15);
  whip.connect(filter);filter.connect(wg);wg.connect(a.destination);whip.start(now);whip.stop(now+.16);

  // Air/fiber tail.
  const len=Math.floor(a.sampleRate*.12),buf=a.createBuffer(1,len,a.sampleRate),data=buf.getChannelData(0);
  for(let i=0;i<len;i++){const t=i/len;data[i]=(Math.random()*2-1)*Math.pow(1-t,2.3)}
  const src=a.createBufferSource(),hp=a.createBiquadFilter(),ng=a.createGain();
  hp.type="highpass";hp.frequency.value=1500;ng.gain.setValueAtTime(.012,now+.015);ng.gain.exponentialRampToValueAtTime(.001,now+.12);
  src.buffer=buf;src.connect(hp);hp.connect(ng);ng.connect(a.destination);src.start(now+.015);
}

function sfx(kind){
  if(!state.sfxEnabled||document.hidden)return;
  userGestureAudio();
  if(kind==="web"){webThwip()}
  else if(kind==="buy"){tone(330,.05,"square",.018);tone(494,.06,"triangle",.018,.045)}
  else if(kind==="claim"){tone(523,.06,"sine",.025);tone(659,.07,"sine",.023,.07);tone(784,.1,"sine",.02,.14)}
  else if(kind==="level"){tone(392,.08,"triangle",.03);tone(523,.08,"triangle",.03,.09);tone(784,.13,"sine",.028,.18)}
  else if(kind==="chest"){noiseBurst(.08,.02);tone(220,.07,"triangle",.025);tone(660,.14,"sine",.025,.08)}
  else if(kind==="prestige"){tone(196,.12,"sawtooth",.02);tone(392,.12,"triangle",.025,.12);tone(784,.2,"sine",.028,.24)}
  else if(kind==="alarm"){tone(280,.09,"square",.018);tone(210,.1,"square",.018,.12);tone(280,.09,"square",.018,.25)}
  else if(kind==="eventWin"){tone(392,.07,"triangle",.024);tone(587,.08,"triangle",.024,.07);tone(880,.16,"sine",.026,.15)}
  else if(kind==="eventFail"){tone(190,.12,"sawtooth",.014);tone(145,.18,"sine",.016,.1)}
  else if(kind==="bossStart"){tone(82,.25,"sawtooth",.026);tone(164,.16,"square",.018,.18);noiseBurst(.12,.025)}
  else if(kind==="bossWin"){tone(196,.08,"triangle",.024);tone(392,.09,"triangle",.025,.08);tone(587,.1,"triangle",.025,.17);tone(988,.24,"sine",.027,.27)}
  else if(kind==="bossFail"){tone(110,.2,"sawtooth",.017);tone(73,.28,"sine",.018,.14)}
  else if(kind==="ultimate"){tone(164,.09,"sawtooth",.025);tone(328,.11,"triangle",.028,.07);tone(656,.15,"sine",.026,.16);noiseBurst(.14,.024)}
  else if(kind==="heroSwap"){tone(330,.05,"triangle",.018);tone(660,.08,"sine",.018,.05)}
  else if(kind==="theme"){tone(440,.05,"sine",.018)}
}
function noteFrequency(root,semitones){return root*Math.pow(2,semitones/12)}
function kick(strength=.012){
  const a=ensureAudio();if(!a)return;
  const o=a.createOscillator(),g=a.createGain();o.type="sine";
  o.frequency.setValueAtTime(120,a.currentTime);o.frequency.exponentialRampToValueAtTime(42,a.currentTime+.11);
  g.gain.setValueAtTime(strength,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.12);
  o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.13);
}
function hat(strength=.006){noiseBurst(.025,strength)}
function snare(strength=.009){noiseBurst(.055,strength);tone(190,.045,"triangle",strength*.55)}
function playMusicStep(){
  if(!state.musicEnabled||document.hidden||gameplayStopped||adBusy)return;
  const ti=contextTrackIndex(),tr=TRACKS[ti],step=playMusicStep.step++%tr.pattern.length;
  const lead=noteFrequency(tr.root,tr.pattern[step]),bass=noteFrequency(tr.root/2,tr.bass[step%tr.bass.length]);
  const beat=tr.tempo/1000,boost=tr.energy>=4?1.18:1;
  musicTone(lead,.28+(tr.energy<=1?.16:0),step%3===0?"sine":"triangle",.014*boost,0,(step%2?1:-1)*.24);
  if(step%2===0)musicTone(lead*2,.17,"sine",.0055*boost,.025,(step%4===0?-.42:.42));
  if(step%2===0)musicTone(bass,beat*1.75,"sine",.015*boost,0,-.08);
  if(step%4===0){
    const root=noteFrequency(tr.root/2,tr.bass[step%tr.bass.length]);
    musicTone(root,beat*3.7,"sine",.0085*boost,0,-.28);
    musicTone(root*Math.pow(2,7/12),beat*3.5,"triangle",.0055*boost,.035,.18);
    musicTone(root*Math.pow(2,11/12),beat*3.3,"sine",.0045*boost,.07,.36);
  }
  if(tr.energy>=3&&step%4===2)musicTone(bass*2,.12,"triangle",.006*boost,0,.12);
  if(tr.energy>=4&&step%4===0)kick(.0065*boost);
}
playMusicStep.step=0;
function startMusic(){
  if(!state.musicEnabled)return;
  userGestureAudioBase();
  stopMusicTimers();
  musicStarted=true;playMusicStep.step=0;
  const idx=contextTrackIndex(),tr=TRACKS[idx];
  el.trackBadge.textContent=`♫ ${tr.name}`;
  musicTimer=setInterval(playMusicStep,tr.tempo);
  if(musicContext()==="normal"&&state.musicAuto){
    trackTimer=setTimeout(()=>{
      trackIndex=(trackIndex+1)%6;
      stopMusicTimers();musicStarted=false;startMusic();
    },24000);
  }
}
function userGestureAudioBase(){const a=ensureAudio();if(a?.state==="suspended")a.resume()}
function stopMusicTimers(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}if(trackTimer){clearInterval(trackTimer);trackTimer=null}}
function pauseAudio(){stopMusicTimers();musicStarted=false;try{if(audioCtx?.state==="running")audioCtx.suspend()}catch(_){}}
function resumeAudioAfterFocus(){if(state.musicEnabled&&audioCtx){audioCtx.resume().then(()=>startMusic()).catch(()=>{})}}

function toggleMusic(){
  state.musicEnabled=!state.musicEnabled;saveLocal();
  if(state.musicEnabled){userGestureAudioBase();startMusic()}else{stopMusicTimers();musicStarted=false}
  renderCore();renderMusicPanel();
}
function toggleSfx(){state.sfxEnabled=!state.sfxEnabled;saveLocal();renderCore();if(state.sfxEnabled)sfx("theme")}

function floatGain(x,y,a,crit=false){const d=document.createElement("div");d.className=`float-gain${crit?" crit":""}`;d.textContent=crit?`КРИТ ${fmt(a)}!`:`+${fmt(a)}`;d.style.left=x+"px";d.style.top=y+"px";document.body.appendChild(d);setTimeout(()=>d.remove(),730)}
function toast(text){clearTimeout(toastTimer);el.toast.textContent=text;el.toast.classList.add("show");toastTimer=setTimeout(()=>el.toast.classList.remove("show"),2300)}

function snapshot(){state.savedAt=Date.now();return {...state,levels:{...state.levels},achievementClaimed:[...state.achievementClaimed],dailyMissions:state.dailyMissions.map(x=>({...x})),dailyClaimed:[...state.dailyClaimed],dailyBase:{...(state.dailyBase||{})}}}
function saveLocal(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot()))}catch(_){}}
function loadLocal(){try{const raw=localStorage.getItem(STORAGE_KEY)||LEGACY_STORAGE_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);return raw?sanitize(JSON.parse(raw)):null}catch(_){return null}}
async function saveCloud(flush=false){if(!player)return;try{await player.setData({crimsonWebV20:snapshot()},!!flush)}catch(e){console.warn("cloud save",e)}}
function scheduleCloud(){if(!player||cloudTimer)return;cloudTimer=setTimeout(()=>{cloudTimer=null;saveCloud(false)},7000)}
function persist(force=false){saveLocal();if(force){clearTimeout(cloudTimer);cloudTimer=null;saveCloud(true)}else scheduleCloud()}
function applyOffline(s){
  const secs=Math.min(Math.max((Date.now()-s.savedAt)/1000,0),6*3600);if(secs<5)return s;
  const boostedSecs=s.boostUntil>s.savedAt?Math.min(secs,Math.max(0,(s.boostUntil-s.savedAt)/1000)):0,normal=secs-boostedSecs;
  const base=basePassive(s)*levelMultiplier(s)*prestigeMultiplier(s)*characterAllMult(s)*characterPassiveMult(s)*cityPassiveMult(s),earned=base*normal+base*2*boostedSecs;
  if(earned>0){s.threats+=earned;s.lifetime+=earned;s._offline=earned}s.savedAt=Date.now();return s;
}

async function initSDK(){
  const localPreview=location.protocol==="file:"||["localhost","127.0.0.1"].includes(location.hostname);
  if(localPreview){
    sdkReady=false;applyPlatformLanguage(navigator.language||"ru");cloudLoaded=false;
    updateSplash(78,"Локальный предпросмотр…");renderAll();
    await waitForCriticalAssets();activatePlayableUi();updateRcDiagnostics();return;
  }
  try{
    updateSplash(28,"Инициализируем SDK Яндекс Игр…");
    await new Promise((resolve,reject)=>{
      if(typeof YaGames!=="undefined")return resolve();
      const sc=document.createElement("script");sc.src="/sdk.js";sc.onload=resolve;sc.onerror=reject;document.head.appendChild(sc)
    });
    ysdk=await YaGames.init();
    applyPlatformLanguage(ysdk.environment?.i18n?.lang||"ru");
    sdkReady=true;updateRcDiagnostics();

    const pauseCallback=()=>{
      platformPaused=true;stopGameplay();pauseAudio();saveLocal();updateRcDiagnostics()
    };
    const resumeCallback=()=>{
      platformPaused=false;lastTick=performance.now();
      if(playableUiActivated&&noModalOpen()&&!adBusy&&!document.hidden)startGameplay();
      resumeAudioAfterFocus();updateRcDiagnostics()
    };
    try{
      ysdk.on?.("game_api_pause",pauseCallback);
      ysdk.on?.("game_api_resume",resumeCallback);
    }catch(e){console.warn("platform events",e)}

    updateSplash(45,"Загружаем профиль и прогресс…");
    try{
      player=await ysdk.getPlayer();
      playerId=player.getUniqueID?.()||"";
    }catch(e){console.warn("player",e)}
    updateRcDiagnostics();

    if(player){
      try{
        const data=await player.getData(["crimsonWebV20","crimsonWebV19","crimsonWebV18_1","crimsonWebV18"]);
        const cloudRaw=data?.crimsonWebV20||data?.crimsonWebV19||data?.crimsonWebV18_1||data?.crimsonWebV18;
        if(cloudRaw){
          const cloud=sanitize(cloudRaw);
          if(cloud.savedAt>state.savedAt){
            state=applyOffline(cloud);document.documentElement.dataset.theme=state.theme;syncBrowserThemeColor(state.theme);ensureDaily();saveLocal()
          }
        }
        cloudLoaded=true;
      }catch(e){console.warn("cloud load",e)}
    }

    updateSplash(70,"Готовим интерфейс…");
    renderAll();
    await waitForCriticalAssets();

    // Game Ready is sent only after progress is loaded and the critical UI/assets are usable.
    try{
      ysdk.features?.LoadingAPI?.ready();
      gameReadySent=true;
    }catch(e){console.warn("LoadingAPI.ready",e)}
    updateRcDiagnostics();

    // Purchases are initialized immediately after Game Ready so a slow catalog cannot block gameplay.
    initPayments().catch(e=>console.warn("payments deferred",e));

    activatePlayableUi();
  }catch(e){
    sdkReady=false;console.warn("sdk init",e);
    applyPlatformLanguage(navigator.language||"ru");
    updateSplash(86,"SDK недоступен — запускаем резервный режим…");
    renderAll();await waitForCriticalAssets();activatePlayableUi();updateRcDiagnostics()
  }
}
function startGameplay(){
  if(!playableUiActivated||platformPaused||document.hidden||adBusy)return;
  try{ysdk?.features?.GameplayAPI?.start()}catch(_){}
  gameplayStopped=false;updateRcDiagnostics()
}
function stopGameplay(){
  try{ysdk?.features?.GameplayAPI?.stop()}catch(_){}
  gameplayStopped=true;updateRcDiagnostics()
}
function rewarded(){
  userGestureAudio();
  if(!sdkReady||!ysdk||adBusy||boosted()){if(!sdkReady)toast("Rewarded-реклама заработает после запуска в Яндекс Играх");return}
  adBusy=true;renderCore();stopGameplay();pauseAudio();let rewardedFlag=false;
  try{
    ysdk.adv.showRewardedVideo({callbacks:{
      onRewarded:()=>{rewardedFlag=true;state.boostUntil=Date.now()+BOOST_MS;persist(true)},
      onClose:()=>{adBusy=false;startGameplay();resumeAudioAfterFocus();renderAll();toast(rewardedFlag?"Адреналин x2 активирован!":"Награда не активирована")},
      onError:e=>{console.warn(e);adBusy=false;startGameplay();resumeAudioAfterFocus();renderCore();toast("Реклама сейчас недоступна")}
    }})
  }catch(e){console.warn(e);adBusy=false;startGameplay();resumeAudioAfterFocus();renderCore();toast("Реклама сейчас недоступна")}
}

function bind(){
  el.heroButton.addEventListener("pointerdown",heroClick);
  el.heroButton.addEventListener("pointermove",e=>updateStage3DFromPoint(e.clientX,e.clientY));
  el.heroButton.addEventListener("pointerleave",resetStage3D);
  el.heroButton.addEventListener("pointerup",resetStage3D);
  el.ultimateBtn.addEventListener("click",castUltimate);
  el.victoryContinueBtn.addEventListener("click",()=>closeModal("victoryModal"));
  el.tutorialSkipBtn.addEventListener("click",()=>finishTutorial(true));
  el.rcDiagClose?.addEventListener("click",()=>el.rcDiagnostics?.classList.add("hidden"));

  document.querySelectorAll("[data-bottom-target]").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.bottomTarget)));
  document.querySelectorAll("[data-home-focus]").forEach(b=>b.addEventListener("click",()=>setTab("shop")));
  $("sideGiftBtn")?.addEventListener("click",()=>openModal("dailyModal"));
  $("sideSpinBtn")?.addEventListener("click",rewarded);
  $("sideFreeBtn")?.addEventListener("click",openChest);
  document.addEventListener("keydown",e=>{if(e.target!==document.body&&e.target!==el.heroButton)return;if((e.code==="Space"||e.code==="Enter")&&noModalOpen()){e.preventDefault();heroClick()}});
  el.levelUpBtn.addEventListener("click",levelUp);el.rewardBtn.addEventListener("click",rewarded);el.chestBtn.addEventListener("click",openChest);el.dailyBtn.addEventListener("click",()=>openModal("dailyModal"));
  el.prestigeBtn.addEventListener("click",prestige);el.buyModeBtn.addEventListener("click",()=>{state.buyMode=state.buyMode===1?10:state.buyMode===10?25:1;saveLocal();renderAll()});
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>setTab(t.dataset.tab)));
  document.querySelectorAll("[data-tactic]").forEach(b=>b.addEventListener("click",()=>upgradeTactic(b.dataset.tactic)));
  el.vaultBtn.addEventListener("click",()=>setTab("vault"));
  el.riftBtn?.addEventListener("click",claimRift);
  el.bossRushBtn?.addEventListener("click",()=>{const d=currentDistrictBoss(); if(d) startBoss(d.id)});
  el.inviteBtn.addEventListener("click",()=>openModal("inviteModal"));el.themeBtn.addEventListener("click",()=>openModal("themeModal"));el.mobileThemeBtn?.addEventListener("click",()=>openModal("themeModal"));el.infoBtn.addEventListener("click",()=>openModal("infoModal"));
  el.musicBtn.addEventListener("click",()=>{userGestureAudio();openModal("musicModal");renderMusicPanel()});el.soundBtn.addEventListener("click",toggleSfx);
  el.musicToggleBtn.addEventListener("click",toggleMusic);el.musicAutoBtn.addEventListener("click",toggleMusicAuto);
  el.restorePurchasesBtn.addEventListener("click",()=>reconcilePurchases(true));
  el.welcomeGuestBtn.addEventListener("click",()=>{state.onboardingDone=true;persist(true);closeModal("welcomeModal");setTimeout(()=>startTutorial(),220)});
  el.welcomeAuthBtn.addEventListener("click",async()=>{if(!sdkReady){toast("Яндекс ID доступен после запуска в Яндекс Играх");return}await authorize();state.onboardingDone=true;persist(true);closeModal("welcomeModal");setTimeout(()=>startTutorial(),220)});
  document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
  document.querySelectorAll(".modal").forEach(m=>m.addEventListener("pointerdown",e=>{if(e.target===m)closeModal(m.id)}));
  document.querySelectorAll("[data-theme-choice]").forEach(b=>b.addEventListener("click",()=>{setTheme(b.dataset.themeChoice);closeModal("themeModal")}));
  el.claimDailyBtn.addEventListener("click",claimDailyReward);el.shareInviteBtn.addEventListener("click",shareInvite);el.authBtn.addEventListener("click",authorize);
  el.resetBtn.addEventListener("click",async()=>{if(!confirm("Удалить весь прогресс?"))return;state=fresh();initIncomingRef();document.documentElement.dataset.theme=state.theme;syncBrowserThemeColor(state.theme);ensureDaily();saveLocal();if(player)try{await player.setData({crimsonWebV20:state},true)}catch(_){}closeModal("infoModal");renderAll();toast("Прогресс сброшен")});
  window.addEventListener("contextmenu",e=>e.preventDefault());
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){stopGameplay();pauseAudio();saveLocal();saveCloud(true)}
    else{lastTick=performance.now();if(!platformPaused&&noModalOpen()&&!adBusy)startGameplay();resumeAudioAfterFocus()}
    updateRcDiagnostics();
  });
  window.addEventListener("blur",()=>{stopGameplay();pauseAudio();updateRcDiagnostics()});
  window.addEventListener("focus",()=>{lastTick=performance.now();if(playableUiActivated&&!platformPaused&&!document.hidden&&noModalOpen()&&!adBusy)startGameplay();resumeAudioAfterFocus();updateRcDiagnostics()});
  window.addEventListener("pagehide",()=>{saveLocal();saveCloud(true);pauseAudio()});
}

function loop(now){
  const dt=Math.min((now-lastTick)/1000,1);lastTick=now;
  if(!document.hidden&&!gameplayStopped&&!adBusy){
    const inc=passive()*dt;if(inc>0)addThreats(inc);
    if(activeCityEvent&&passive()>0){
      eventAutoAccumulator+=dt;
      if(eventAutoAccumulator>=1){
        eventAutoAccumulator-=1;
        const support=supportDamagePerSecond();
        if(support>0){activeCityEvent.hp=Math.max(0,activeCityEvent.hp-support);if(activeCityEvent.hp<=0)completeCityEvent()}
      }
    }else eventAutoAccumulator=0;
    if(!activeCityEvent&&Date.now()>=state.eventNextAt)startCityEvent();
    renderCore();
    if(now-lastHeavy>1000){renderShop();renderDailyMissions();renderDistricts();renderAchievements();renderLevelPath();lastHeavy=now}
  }
  requestAnimationFrame(loop);
}
function boot(){
  applyPlatformLanguage("ru"); // safe loading fallback; platform language is resolved immediately after SDK init.
  updateSplash(12,"Запускаем WebGL Patrol…");
  initIncomingRef();
  const local=loadLocal();
  if(local){
    const incoming=state.incomingRef;state=applyOffline(local);
    if(incoming&&!state.incomingRef)state.incomingRef=incoming
  }
  updateSplash(22,"Загружаем локальный прогресс…");
  document.documentElement.dataset.theme=state.theme;syncBrowserThemeColor(state.theme);ensureDaily();applyWorldStyle();
  document.body.dataset.activeTab="shop";
  if(!state.eventNextAt||state.eventNextAt<Date.now()-60000)scheduleNextCityEvent(true);
  bind();renderAll();saveLocal();
  if(rcDebug)el.rcDiagnostics?.classList.remove("hidden");
  if(state._offline){setTimeout(()=>{toast(`Офлайн-дозор: +${fmt(state._offline)} угроз`);delete state._offline},1200)}
  requestAnimationFrame(loop);
  setInterval(()=>{ensureDaily();saveLocal();scheduleCloud()},5000);
  setInterval(maybeHeroSpeech,12000);
  setInterval(animateHeroLife,3900);
  setTimeout(()=>showHeroSpeech("Я на связи. Проверяю кварталы."),1800);
  updateRcDiagnostics();
  initSDK();
}
boot();
})();

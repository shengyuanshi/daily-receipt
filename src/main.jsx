import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  BookOpen,
  CalendarDays,
  Check,
  Download,
  FileText,
  MessageSquareText,
  Mic2,
  Pause,
  Palette,
  Play,
  Printer,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Stamp,
  Trash2,
  LockKeyhole,
  X,
} from 'lucide-react';
import paperDragSound from './assets/audio/paper-drag.mp3';
import polaroidPrintSound from './assets/audio/polaroid-print.mp3';
import './styles.css';

const DAY_API_URL = import.meta.env.VITE_DAILY_RECEIPT_API_URL || 'http://localhost:5174/api/day';
const PRIVATE_DAY_API_URL = import.meta.env.VITE_PRIVATE_DAILY_RECEIPT_API_URL || DAY_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

const themeOptions = [
  { key: 'green', label: '浅绿', swatch: '#dfe5d8' },
  { key: 'blue', label: '浅蓝', swatch: '#dce7ef' },
  { key: 'pink', label: '浅粉', swatch: '#efdfe4' },
  { key: 'yellow', label: '浅黄', swatch: '#efe8cf' },
];

const demoMetricBaseline = {
  order: 'DEMO-0001',
  title: 'Daily Receipt',
  messages: 128,
  messagesSent: 640,
  meetingHours: 4.5,
  docs: 6,
  weeklyDocsAdded: 9,
  words: 4200,
  corpusWords: 48200,
  chineseChars: 34800,
  englishWords: 13400,
  transcriptWords: 5200,
  books: 2,
  highlights: 12,
  focusBlocks: 7,
  people: ['notes', 'calendar', 'documents', 'reading'],
  themes: ['daily accounting', 'quiet focus', 'reading memory'],
  booksRead: ['《时间的秩序》', '《小王子》'],
  quote: '把一天拆成可数的东西，焦虑就少了一点神秘感。',
  quoteFrom: 'Reading note',
  quoteBook: '《时间的秩序》',
  quoteAuthor: '卡洛·罗韦利',
  summary: '今天的你把很多散落的上下文收拢成了可以被看见的形状。',
  energy: 74,
  firstActivity: '09:10',
  lastActivity: '20:42',
  activeSpanHours: 11.5,
  messageBursts: 24,
  peakWindow: '14:00-15:00',
};

const metricsByDate = {};

const pixelImageModules = import.meta.glob('./assets/pixel-days/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const pixelImages = Object.entries(pixelImageModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const dailyContexts = [
  {
    imageCaption: 'ringed planet',
    themes: ['message load', 'daily accounting', 'quiet restart', 'reading margin'],
    booksRead: ['《时间的秩序》', '《置身事内》', '《始于极限》'],
    quote: '把一天拆成可数的东西，焦虑就少了一点神秘感。',
    quoteFrom: 'Reading note',
    quoteBook: '《时间的秩序》',
    quoteAuthor: '卡洛·罗韦利',
  },
  {
    imageCaption: 'crescent moon',
    themes: ['sales sync', 'meeting gravity', 'decision trace', 'aftertaste'],
    booksRead: ['《可能性的艺术》', '《组织的逻辑》'],
    quote: '真正难的不是表达观点，是在嘈杂里保留判断力。',
    quoteFrom: 'Reading note',
    quoteBook: '《可能性的艺术》',
    quoteAuthor: '刘瑜',
  },
  {
    imageCaption: 'coffee cup',
    themes: ['doc archaeology', 'word count', 'project memory', 'cleanup'],
    booksRead: ['《纳瓦尔宝典》', '《写作是门手艺》'],
    quote: '文字不是把事情变漂亮，是把事情变得可以被再次理解。',
    quoteFrom: 'Reading note',
    quoteBook: '《写作是门手艺》',
    quoteAuthor: '刘军强',
  },
  {
    imageCaption: 'potted plant',
    themes: ['late reading', 'soft landing', 'self repair', 'tiny reward'],
    booksRead: ['《悉达多》', '《长安的荔枝》'],
    quote: '人需要一点没被工作征用的光，才能把自己找回来。',
    quoteFrom: 'Reading note',
    quoteBook: '《悉达多》',
    quoteAuthor: '赫尔曼·黑塞',
  },
  {
    imageCaption: 'laptop',
    themes: ['transcript mining', 'oral memory', 'signal cleanup', 'note ritual'],
    booksRead: ['《思考，快与慢》', '《蛤蟆先生去看心理医生》'],
    quote: '说出口的东西会散，记下来的东西才开始长骨头。',
    quoteFrom: 'Reading note',
    quoteBook: '《思考，快与慢》',
    quoteAuthor: '丹尼尔·卡尼曼',
  },
  {
    imageCaption: 'notebook',
    themes: ['calendar density', 'context switch', 'time blocking', 'recovery'],
    booksRead: ['《深度工作》', '《最重要的事只有一件》'],
    quote: '日程不是生活本身，只是生活被外界借走的索引。',
    quoteFrom: 'Reading note',
    quoteBook: '《深度工作》',
    quoteAuthor: '卡尔·纽波特',
  },
  {
    imageCaption: 'vintage mac',
    themes: ['api flow', 'builder notes', 'handoff', 'small launch'],
    booksRead: ['《黑客与画家》', '《创新者的窘境》'],
    quote: '好系统像水管，最好用的时候，没人想起它曾经漏过。',
    quoteFrom: 'Reading note',
    quoteBook: '《黑客与画家》',
    quoteAuthor: '保罗·格雷厄姆',
  },
  {
    imageCaption: 'fountain pen',
    themes: ['focus blocks', 'attention budget', 're-entry', 'slow thinking'],
    booksRead: ['《心流》', '《被讨厌的勇气》'],
    quote: '专注不是憋住不动，而是一次次把自己温柔地带回来。',
    quoteFrom: 'Reading note',
    quoteBook: '《心流》',
    quoteAuthor: '米哈里·契克森米哈赖',
  },
  {
    imageCaption: 'document stack',
    themes: ['corpus growth', 'language split', 'knowledge base', 'index'],
    booksRead: ['《如何阅读一本书》', '《金字塔原理》'],
    quote: '真正的积累不是堆高资料，而是让资料愿意回答问题。',
    quoteFrom: 'Reading note',
    quoteBook: '《如何阅读一本书》',
    quoteAuthor: '莫提默·艾德勒',
  },
  {
    imageCaption: 'calendar page',
    themes: ['chat search', 'lost context', 'retrieval', 'pattern'],
    booksRead: ['《事实》', '《原则》'],
    quote: '查找是一种诚实：承认记忆有限，也承认线索还在。',
    quoteFrom: 'Reading note',
    quoteBook: '《事实》',
    quoteAuthor: '汉斯·罗斯林',
  },
  {
    imageCaption: 'satellite',
    themes: ['short sprint', 'coffee logic', 'drafting', 'lightness'],
    booksRead: ['《小王子》', '《一只特立独行的猪》'],
    quote: '有些认真不必板着脸，带一点玩心反而更能走远。',
    quoteFrom: 'Reading note',
    quoteBook: '《小王子》',
    quoteAuthor: '安托万·德·圣-埃克苏佩里',
  },
  {
    imageCaption: 'star cluster',
    themes: ['launch prep', 'ship list', 'builder queue', 'repair dock'],
    booksRead: ['《从优秀到卓越》', '《重来》'],
    quote: '把船造出来之前，先允许满地都是木屑和草图。',
    quoteFrom: 'Reading note',
    quoteBook: '《重来》',
    quoteAuthor: 'Jason Fried',
  },
  {
    imageCaption: 'desk lamp',
    themes: ['inbox storm', 'reply orbit', 'signal flare', 'boundary'],
    booksRead: ['《有限与无限的游戏》', '《也许你该找个人聊聊》'],
    quote: '不是每条消息都要立刻接住，有些只是在天空划过。',
    quoteFrom: 'Reading note',
    quoteBook: '《有限与无限的游戏》',
    quoteAuthor: '詹姆斯·卡斯',
  },
  {
    imageCaption: 'keyboard',
    themes: ['idea routing', 'meeting memory', 'connection', 'builder map'],
    booksRead: ['《系统之美》', '《复杂》'],
    quote: '理解一件事，常常是看见它和别的事怎样互相牵着。',
    quoteFrom: 'Reading note',
    quoteBook: '《系统之美》',
    quoteAuthor: '德内拉·梅多斯',
  },
  {
    imageCaption: 'headphones',
    themes: ['cli garden', 'automation', 'debug trail', 'small harvest'],
    booksRead: ['《禅与摩托车维修艺术》', '《程序员修炼之道》'],
    quote: '工具顺手的那一刻，人会忽然多出一点自由。',
    quoteFrom: 'Reading note',
    quoteBook: '《禅与摩托车维修艺术》',
    quoteAuthor: '罗伯特·波西格',
  },
  {
    imageCaption: 'hourglass',
    themes: ['reading stars', 'highlight fetch', 'night note', 'private fuel'],
    booksRead: ['《百年孤独》', '《献给阿尔吉侬的花束》'],
    quote: '读到一句话像被人轻轻拍肩：原来我不是一个人。',
    quoteFrom: 'Reading note',
    quoteBook: '《献给阿尔吉侬的花束》',
    quoteAuthor: '丹尼尔·凯斯',
  },
  {
    imageCaption: 'telescope',
    themes: ['cn/en ledger', 'translation brain', 'doc weave', 'naming'],
    booksRead: ['《翻译乃大道》', '《风格感觉》'],
    quote: '在两种语言之间来回走，脑子会累，但也会更有弹性。',
    quoteFrom: 'Reading note',
    quoteBook: '《风格感觉》',
    quoteAuthor: 'Steven Pinker',
  },
  {
    imageCaption: 'battery',
    themes: ['archive day', 'closing loops', 'handover', 'index cards'],
    booksRead: ['《清单革命》', '《搞定》'],
    quote: '收纳不是把事物藏起来，是给未来的自己留一条路。',
    quoteFrom: 'Reading note',
    quoteBook: '《清单革命》',
    quoteAuthor: '阿图·葛文德',
  },
  {
    imageCaption: 'cloud server',
    themes: ['late desk', 'daily close', 'screen glow', 'soft shutdown'],
    booksRead: ['《瓦尔登湖》', '《人生的智慧》'],
    quote: '一天结束时，最要紧的不是清空列表，是把自己还给自己。',
    quoteFrom: 'Reading note',
    quoteBook: '《瓦尔登湖》',
    quoteAuthor: '亨利·戴维·梭罗',
  },
  {
    imageCaption: 'moon bed',
    themes: ['brain battery', 'recharge', 'tomorrow queue', 'mercy'],
    booksRead: ['《倦怠社会》', '《为什么我们睡觉》'],
    quote: '休息不是生产力的反面，休息是第二天还能喜欢世界的条件。',
    quoteFrom: 'Reading note',
    quoteBook: '《为什么我们睡觉》',
    quoteAuthor: '马修·沃克',
  },
];

const summaryTemplates = [
  (data) => `今天的信息密度约等于 ${Math.max(1, Math.round(data.messagesSent / 360))}/5 部《时间简史》，脑子真的辛苦了。今晚别再开新宇宙了，睡个好觉吧～`,
  (data) => `${data.meetingHours || 0} 小时会议像一场桌面版《奥德赛》，你带着判断力返航了。把船靠岸，剩下的明天再说。`,
  (data) => `文档和消息一起叠成了小型巴别塔，但你没有被语言砸晕。今日宜关机，宜喝水，宜对自己宽容。`,
  (data) => `这天像在给大脑跑索引：${number(data.messagesSent)} 条信号被收编，混沌少了一点，秩序多了一格。`,
  (data) => `如果把每个上下文切换折成纸飞机，今天大概能飞过半个会议室。飞完了，飞行员该下班。`,
  (data) => `今天不是“忙完了”，更像《清明上河图》里每个人都找你问路。你居然还把路牌扶正了，厉害。`,
  (data) => `这一天的脑力消耗约等于给 ${Math.max(3, Math.round(data.messageBursts / 5))} 个抽屉贴标签。抽屉还在，标签也在，你可以休息了。`,
  (data) => `会议、消息、文档轮番登场，像一部低配《三体》广播剧。地球暂时安全，你也该安全入睡。`,
  (data) => `今天的工作像熬一锅信息浓汤：火候不小，汤底很厚。收锅吧，明天再加葱花。`,
  (data) => `你把 ${number(data.corpusWords)} 字的知识山又削平了一点点。愚公本人看了都想给你递杯热茶。`,
  (data) => `这一天像给注意力做体能训练：不一定优雅，但很有效。肌肉会酸，成长也会酸。`,
  (data) => `今日份大脑像开了很多标签页，好消息是：没有死机。坏消息是：该合盖了。`,
  (data) => `从 ${data.firstActivity} 到 ${data.lastActivity}，你像一台温柔但过载的索引机。索引完成，机器该降温。`,
  (data) => `如果消息是雨点，今天你撑的不是伞，是一座小型水利工程。辛苦了，工程师请收工。`,
  (data) => `今天大概消耗了 ${Math.max(1, Math.round((data.meetingHours || 0) + data.focusBlocks / 3))} 块精神电池。不是脆弱，是用得很认真。`,
  (data) => `这一张小票证明：你不是虚度了一天，你是在跟复杂世界进行有来有回的摔跤。现在可以松手。`,
  (data) => `中文、英文、会议、消息混在一起，像一场跨语种爵士即兴。你跟上拍了，耳朵也该休息。`,
  (data) => `今天的上下文足够喂饱一只小型知识库。知识库吃饱了，你也该吃点真正的东西。`,
  (data) => `你把很多“等会儿再说”变成了“已经处理”。这不是魔法，是耐心。给耐心放个假吧。`,
  (data) => `今天的大脑像电量剩 19% 还坚持导航到家的手机。到家了，插上充电器，晚安。`,
];

const PRINT_OUT_MS = 4200;
const SETTLE_MS = 900;

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayNumber(date) {
  const [year, month, day] = date.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function positiveModulo(value, length) {
  return ((value % length) + length) % length;
}

function dayIndex(date, length = dailyContexts.length) {
  return positiveModulo(dayNumber(date) - dayNumber('2026-06-14'), length);
}

function receiptTitle(date) {
  return `Daily Receipt ${date.slice(5)}`;
}

function getDailyContext(date) {
  const index = dayIndex(date);
  const context = dailyContexts[index];
  return {
    ...context,
    title: receiptTitle(date),
    pixelImage: pixelImages[index],
    pixelCaption: context.imageCaption,
    books: context.booksRead.length,
    highlights: 12 + positiveModulo(dayNumber(date) * 7, 18),
  };
}

function buildDaySummary(date, data) {
  return summaryTemplates[dayIndex(date, summaryTemplates.length)](data);
}

function cleanRemoteData(payload) {
  if (!payload) return null;
  const { title, summary, ...rest } = payload;
  return rest;
}

function buildDayApiUrl(date, isPrivate = false) {
  const url = new URL(isPrivate ? PRIVATE_DAY_API_URL : DAY_API_URL);
  url.searchParams.set('date', date);
  url.searchParams.set('_', String(Date.now()));
  return url.toString();
}

function getFallbackData(date) {
  const seed = dayNumber(date);
  const preset = metricsByDate[date] ?? {
    ...demoMetricBaseline,
    order: date.replaceAll('-', '') + '-0001',
    messages: 80 + positiveModulo(seed * 13, 180),
    messagesSent: 260 + positiveModulo(seed * 41, 940),
    meetingHours: Math.round((1.5 + positiveModulo(seed * 17, 80) / 10) * 100) / 100,
    docs: 3 + positiveModulo(seed, 8),
    words: 2600 + positiveModulo(seed * 137, 6200),
    transcriptWords: 1800 + positiveModulo(seed * 211, 7600),
    focusBlocks: 4 + positiveModulo(seed, 10),
    firstActivity: `${String(8 + positiveModulo(seed, 3)).padStart(2, '0')}:${String(positiveModulo(seed * 7, 60)).padStart(2, '0')}`,
    lastActivity: `${String(19 + positiveModulo(seed, 5)).padStart(2, '0')}:${String(positiveModulo(seed * 11, 60)).padStart(2, '0')}`,
    activeSpanHours: Math.round((8 + positiveModulo(seed, 70) / 10) * 10) / 10,
    messageBursts: 12 + positiveModulo(seed * 5, 28),
    peakWindow: `${String(10 + positiveModulo(seed, 8)).padStart(2, '0')}:00-${String(11 + positiveModulo(seed, 8)).padStart(2, '0')}:00`,
  };
  return {
    ...preset,
    order: `${date.replaceAll('-', '')}-0001`,
  };
}

function buildSourceItems(data, apiState) {
  return [
    { key: 'voice', label: 'Voice transcripts', detail: `${number(data.transcriptWords)} words indexed`, icon: Mic2, status: 'ready' },
    {
      key: 'messages',
      label: 'Messages',
      detail: apiState.loading ? `fetching ${apiState.date} live` : `${number(data.messagesSent)} sent`,
      icon: MessageSquareText,
      status: apiState.error ? 'error' : apiState.loading ? 'loading' : 'ready',
    },
    {
      key: 'docs',
      label: 'Documents',
      detail: `${data.weeklyDocsAdded} docs, ${number(data.corpusWords)} words`,
      icon: FileText,
      status: apiState.error ? 'error' : 'ready',
    },
    {
      key: 'reading',
      label: 'Reading line',
      detail: `${data.quoteBook} / sample note ready`,
      icon: BookOpen,
      status: 'ready',
    },
  ];
}

function formatDateLabel(value) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    weekday: 'short',
  });
}

function number(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function App() {
  const today = useMemo(() => todayInputValue(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [remoteData, setRemoteData] = useState(null);
  const [apiState, setApiState] = useState({ loading: false, error: '', meta: null, date: today });
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signature, setSignature] = useState('Yuanyuan');
  const [trayReceipts, setTrayReceipts] = useState([]);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [authSession, setAuthSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [uiTheme, setUiTheme] = useState('green');
  const dragStateRef = useRef(null);
  const requestSeqRef = useRef(0);
  const nextZRef = useRef(1);

  function playSound(src, volume = 0.72) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }

  const data = useMemo(() => {
    const merged = {
      ...getFallbackData(selectedDate),
      ...getDailyContext(selectedDate),
      ...(cleanRemoteData(remoteData) || {}),
    };
    return {
      ...merged,
      title: receiptTitle(selectedDate),
      summary: buildDaySummary(selectedDate, merged),
    };
  }, [selectedDate, remoteData]);
  const sourceItems = useMemo(() => buildSourceItems(data, apiState), [data, apiState]);

  async function fetchReceiptDate(date) {
    const requestId = requestSeqRef.current + 1;
    requestSeqRef.current = requestId;
    setApiState({ loading: true, error: '', meta: null, date });
    try {
      const token = authSession?.access_token;
      const response = await fetch(buildDayApiUrl(date, Boolean(token)), {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json();
      if (requestSeqRef.current !== requestId) return;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'API query failed');
      }
      setRemoteData(payload.data);
      setApiState({ loading: false, error: payload.meta?.errors?.[0]?.error || '', meta: payload.meta, date });
    } catch (error) {
      if (requestSeqRef.current !== requestId) return;
      setRemoteData(null);
      setApiState({ loading: false, error: error.message, meta: null, date });
    }
  }

  useEffect(() => {
    fetchReceiptDate(selectedDate);
  }, [selectedDate, authSession?.access_token]);

  useEffect(() => {
    if (!supabase) return undefined;
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setAuthSession(session);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
      setRemoteData(null);
    });
    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(event) {
    event.preventDefault();
    if (!supabase || !authEmail.trim()) return;
    setAuthMessage('Sending magic link...');
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    setAuthMessage(error ? error.message : 'Check your email for the login link.');
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthSession(null);
    setRemoteData(null);
    setAuthMessage('Signed out.');
  }

  function handlePrint() {
    if (isPrinting) return;
    playSound(polaroidPrintSound, 0.78);
    setIsPrinting(true);
    const id = crypto.randomUUID();
    const z = nextZRef.current + 1;
    nextZRef.current = z;
    setSelectedReceiptId(id);
    setTrayReceipts((items) => [
      ...items,
      {
        id,
        date: selectedDate,
        data: structuredClone(data),
        signature,
        isSigned,
        phase: 'printing',
        x: ((items.length % 3) - 1) * 28,
        y: 28 + (items.length % 4) * 18,
        r: ((items.length % 5) - 2) * 1.8,
        z,
      },
    ]);
    window.setTimeout(() => {
      setTrayReceipts((items) => items.map((item) => (
        item.id === id ? { ...item, phase: 'settling' } : item
      )));
    }, PRINT_OUT_MS);
    window.setTimeout(() => {
      setTrayReceipts((items) => items.map((item) => (
        item.id === id ? { ...item, phase: 'rest', z: nextZRef.current + 1 } : item
      )));
      nextZRef.current += 1;
      setSelectedReceiptId(id);
      setIsPrinting(false);
    }, PRINT_OUT_MS + SETTLE_MS);
  }

  function startDrag(event, id) {
    const item = trayReceipts.find((receipt) => receipt.id === id);
    if (!item) return;
    if (item.phase && item.phase !== 'rest') return;
    event.preventDefault();
    playSound(paperDragSound, 0.68);
    const z = nextZRef.current + 1;
    nextZRef.current = z;
    setSelectedReceiptId(id);
    setTrayReceipts((items) => items.map((receipt) => (
      receipt.id === id ? { ...receipt, z } : receipt
    )));
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    element.classList.add('is-dragging');

    dragStateRef.current = {
      id,
      pointerId: event.pointerId,
      element,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      nextX: item.x,
      nextY: item.y,
    };

    window.addEventListener('pointermove', dragReceipt, { passive: false });
    window.addEventListener('pointerup', stopDrag, { passive: false });
    window.addEventListener('pointercancel', stopDrag, { passive: false });
  }

  function dragReceipt(event) {
    const dragState = dragStateRef.current;
    if (!dragState) return;
    event.preventDefault();
    const nextX = dragState.originX + event.clientX - dragState.startX;
    const nextY = dragState.originY + event.clientY - dragState.startY;
    dragState.nextX = nextX;
    dragState.nextY = nextY;
    dragState.element.style.setProperty('--x', `${nextX}px`);
    dragState.element.style.setProperty('--y', `${nextY}px`);
  }

  function stopDrag() {
    const dragState = dragStateRef.current;
    if (!dragState) return;
    window.removeEventListener('pointermove', dragReceipt);
    window.removeEventListener('pointerup', stopDrag);
    window.removeEventListener('pointercancel', stopDrag);
    if (dragState.element.hasPointerCapture?.(dragState.pointerId)) {
      dragState.element.releasePointerCapture(dragState.pointerId);
    }
    dragState.element.classList.remove('is-dragging');
    const z = nextZRef.current + 1;
    nextZRef.current = z;
    setSelectedReceiptId(dragState.id);
    setTrayReceipts((items) => items.map((item) => (
      item.id === dragState.id ? { ...item, x: dragState.nextX, y: dragState.nextY, z } : item
    )));
    dragStateRef.current = null;
  }

  async function handleExport() {
    const selectedReceipt = trayReceipts.find((item) => item.id === selectedReceiptId && item.phase !== 'printing')
      || trayReceipts.filter((item) => item.phase !== 'printing').sort((a, b) => (b.z || 0) - (a.z || 0))[0]
      || {
        id: 'current',
        date: selectedDate,
        data,
        signature,
        isSigned,
      };
    setIsExporting(true);
    const mount = document.createElement('div');
    mount.className = 'receipt-export-capture';
    document.body.appendChild(mount);
    const root = createRoot(mount);

    try {
      root.render(
        <article className="receipt receipt-export-card">
          <div className="receipt-tear top" />
          <ReceiptContent
            data={selectedReceipt.data}
            selectedDate={selectedReceipt.date}
            apiState={{ loading: false, error: '', meta: null }}
            signature={selectedReceipt.signature}
            isSigned={selectedReceipt.isSigned}
          />
          <div className="receipt-tear bottom" />
        </article>,
      );
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const receipt = mount.querySelector('.receipt-export-card');
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(receipt, {
        backgroundColor: null,
        scale: Math.min(window.devicePixelRatio || 2, 3),
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `daily-receipt-${selectedReceipt.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      root.unmount();
      mount.remove();
      setIsExporting(false);
    }
  }

  return (
    <main className="app-shell" data-theme={uiTheme}>
      <div className="ambient-grid" />
      <header className="topbar">
        <div className="brand">
          <ReceiptText size={32} strokeWidth={1.5} />
          <span>DAILY RECEIPTS</span>
        </div>
        <div className="creator">
          <span>Created by yuanyuan</span>
          <span>Inspired by @sumins.studio</span>
        </div>
      </header>

      <section className="workspace">
        <aside className="control-rail" aria-label="Daily receipt controls">
          <div className="lcd-module">
            <div className="lcd-topline">
              <CalendarDays size={16} strokeWidth={1.5} />
              <label htmlFor="receipt-date">Choose date</label>
            </div>
            <input
              id="receipt-date"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setRemoteData(null);
              }}
              aria-label="Choose receipt date"
            />
            <div className="lcd-time">
              <span>{selectedDate.slice(5).replace('-', '.')}</span>
              <small>{data.focusBlocks} focus blocks</small>
            </div>
            <div className="lcd-actions">
              <button type="button" className="soft-button" onClick={handlePrint} aria-label="Print receipt">
                <Play size={20} fill="currentColor" strokeWidth={1.5} />
              </button>
              <button type="button" className="soft-button" onClick={() => setIsPrinting(false)} aria-label="Pause printing">
                <Pause size={20} fill="currentColor" strokeWidth={1.5} />
              </button>
              <button type="button" className="soft-button" onClick={() => setSignatureOpen(true)} aria-label="Sign receipt">
                <Check size={21} strokeWidth={1.7} />
              </button>
            </div>
            <div className="theme-panel" aria-label="Interface color theme">
              <div className="theme-label">
                <Palette size={14} strokeWidth={1.6} />
                <span>Theme</span>
              </div>
              <div className="theme-swatches">
                {themeOptions.map((theme) => (
                  <button
                    type="button"
                    className={`theme-choice ${uiTheme === theme.key ? 'is-active' : ''}`}
                    key={theme.key}
                    onClick={() => setUiTheme(theme.key)}
                    aria-pressed={uiTheme === theme.key}
                    aria-label={`Switch to ${theme.label}`}
                    style={{ '--swatch': theme.swatch }}
                  >
                    <span className="theme-dot" />
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="source-panel">
            <div className="section-title">
              <span>CONTEXT LIST</span>
              <button type="button" aria-label="Refresh context" onClick={() => fetchReceiptDate(selectedDate)}>
                <RefreshCw size={16} strokeWidth={1.6} />
              </button>
            </div>
            <div className="source-list">
              {sourceItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div className={`source-row is-${item.status}`} key={item.key} style={{ '--i': index }}>
                    <div className="source-icon"><Icon size={18} strokeWidth={1.5} /></div>
                    <div>
                      <span>{item.label}</span>
                      <small>{item.detail}</small>
                    </div>
                    <div className="status-dot" aria-label={item.status} />
                  </div>
                );
              })}
            </div>
          </div>

          <form className="auth-panel" onSubmit={handleSignIn}>
            <div className="auth-title">
              <LockKeyhole size={16} strokeWidth={1.6} />
              <span>{authSession ? 'PRIVATE MODE' : 'PRIVATE LOGIN'}</span>
            </div>
            {authSession ? (
              <button type="button" className="auth-button" onClick={handleSignOut}>
                Sign out
              </button>
            ) : (
              <>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="email"
                  aria-label="Email"
                />
                <button type="submit" className="auth-button" disabled={!supabase}>
                  Send link
                </button>
              </>
            )}
            {authMessage && <p>{authMessage}</p>}
          </form>
        </aside>

        <section className="printer-stage" aria-label="Daily receipt preview">
          <div className="stage-header">
            <span>RECEIPT DESK</span>
            <button type="button" className="quiet-button" onClick={handlePrint}>
              <Printer size={16} strokeWidth={1.6} />
              Print
            </button>
            <button type="button" className="quiet-button" onClick={() => {
              setTrayReceipts([]);
              setSelectedReceiptId(null);
            }}>
              <Trash2 size={16} strokeWidth={1.6} />
              Clear
            </button>
            <button type="button" className="quiet-button" onClick={handleExport}>
              <Download size={16} strokeWidth={1.6} />
              {isExporting ? 'Saving' : 'Save PNG'}
            </button>
          </div>

          <div className="printer-body">
            <div className="slot-mask" />
            <div className="paper-slot" />
            <div className="print-window" aria-hidden="true">
              {trayReceipts.filter((item) => item.phase === 'printing').map((item) => (
                <article
                  className={`receipt tray-receipt is-${item.phase}`}
                  key={item.id}
                  style={{
                    '--x': `${item.x}px`,
                    '--y': `${item.y}px`,
                    '--r': `${item.r}deg`,
                    '--z': item.z || 1,
                  }}
                >
                  <div className="receipt-tear top" />
                  <ReceiptContent
                    data={item.data}
                    selectedDate={item.date}
                    apiState={{ loading: false, error: '', meta: null }}
                    signature={item.signature}
                    isSigned={item.isSigned}
                  />
                  <div className="receipt-tear bottom" />
                </article>
              ))}
            </div>
            <div className="tray-stack" aria-label="Printed receipts kept in tray">
              {trayReceipts.filter((item) => item.phase !== 'printing').map((item) => (
                <article
                  className={`receipt tray-receipt is-${item.phase || 'rest'}`}
                  key={item.id}
                  onPointerDown={(event) => startDrag(event, item.id)}
                  onClick={() => setSelectedReceiptId(item.id)}
                  style={{
                    '--x': `${item.x}px`,
                    '--y': `${item.y}px`,
                    '--r': `${item.r}deg`,
                    '--z': item.z || 1,
                  }}
                >
                  <div className="receipt-tear top" />
                  <ReceiptContent
                    data={item.data}
                    selectedDate={item.date}
                    apiState={{ loading: false, error: '', meta: null }}
                    signature={item.signature}
                    isSigned={item.isSigned}
                  />
                  <div className="receipt-tear bottom" />
                </article>
              ))}
            </div>
            <div className="tray-shadow" />
          </div>
        </section>
      </section>

      {signatureOpen && (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Sign today">
          <div className="signature-modal">
            <button type="button" className="close-button" onClick={() => setSignatureOpen(false)} aria-label="Close signature">
              <X size={17} strokeWidth={1.6} />
            </button>
            <div className="scribble-area">
              <span>{signature || 'Sign'}</span>
              <div className="scribble-line" />
            </div>
            <div className="modal-actions">
              <div className="input-block">
                <label htmlFor="signature">签名</label>
                <input
                  id="signature"
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="stamp-button"
                onClick={() => {
                  setIsSigned(true);
                  setSignatureOpen(false);
                }}
              >
                <Stamp size={18} strokeWidth={1.6} />
                SIGN OFF
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ReceiptContent({ data, selectedDate, apiState, signature, isSigned }) {
  return (
    <div className="receipt-content">
      <div className="receipt-kicker">DAILY RECEIPT</div>
      <h1>{data.title}</h1>
      <p className="receipt-date">{formatDateLabel(selectedDate)} / ORDER {data.order}</p>

      <div className="dither-photo" aria-label={data.pixelCaption}>
        <img src={data.pixelImage} alt="" draggable="false" />
      </div>

      <div className="metric-table">
        <Metric label="Messages handled" value={number(data.messages)} />
        <Metric label="Messages sent" value={number(data.messagesSent)} />
        <Metric label="Meeting hours" value={`${data.meetingHours}h`} />
        <Metric label="Docs touched" value={data.docs} />
        <Metric label="Words written" value={number(data.words)} />
        <Metric label="Voice transcript" value={number(data.transcriptWords)} />
        <Metric label="Books read" value={data.books} />
      </div>

      <section className="receipt-section time-ledger">
        <h2>TIME LEDGER</h2>
        <Metric label="First activity" value={data.firstActivity} />
        <Metric label="Last activity" value={data.lastActivity} />
        <Metric label="Active span" value={`${data.activeSpanHours}h`} />
        <Metric label="Message bursts" value={data.messageBursts} />
        {apiState.loading && <p className="receipt-hint">fetching receipt api...</p>}
        {apiState.meta && (
          <p className="receipt-hint">
            live query: {apiState.meta.date} / {apiState.meta.counts?.messages ?? 0} signals
          </p>
        )}
        {apiState.error && <p className="receipt-hint">API note: {apiState.error}</p>}
      </section>

      <section className="receipt-section workload-section">
        <h2>MESSAGES / DOC LEDGER</h2>
        <div className="workload-stamps">
          <div>
            <span>MESSAGES SENT</span>
            <strong>{number(data.messagesSent)}</strong>
            <small>messages</small>
          </div>
          <div>
            <span>MEETINGS</span>
            <strong>{data.meetingHours}</strong>
            <small>hours</small>
          </div>
        </div>
        <div className="doc-ledger">
          <Metric label="New doc/docx" value={`${data.weeklyDocsAdded} pcs`} />
          <Metric label="Words count" value={number(data.corpusWords)} />
          <Metric label="Chinese words" value={number(data.chineseChars)} />
          <Metric label="English words" value={number(data.englishWords)} />
        </div>
        <div className="language-split" aria-label="Chinese and English writing split">
          <i style={{ '--portion': `${(data.chineseChars / data.corpusWords) * 100}%` }} />
        </div>
        <div className="split-caption">
          <span>中文 {Math.round((data.chineseChars / data.corpusWords) * 100)}%</span>
          <span>EN {Math.round((data.englishWords / data.corpusWords) * 100)}%</span>
        </div>
      </section>

      <section className="receipt-section">
        <h2>READING LINES</h2>
        <p className="quote">{data.quote}</p>
        <p className="quote-from">-- {data.quoteAuthor} / {data.quoteBook} / {data.quoteFrom}</p>
      </section>

      <section className="receipt-section">
        <h2>BOOKS</h2>
        {data.booksRead.map((book) => (
          <div className="line-item" key={book}>
            <span>read</span>
            <strong>{book}</strong>
          </div>
        ))}
      </section>

      <div className="day-note">
        <Sparkles size={17} strokeWidth={1.6} />
        <span>{data.summary}</span>
      </div>

      <div className="signature-line">
        <span>SIGNATURE</span>
        <strong>{isSigned ? signature : 'pending'}</strong>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

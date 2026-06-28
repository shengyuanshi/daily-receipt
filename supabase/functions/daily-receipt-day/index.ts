const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const readingLines = [
  {
    booksRead: ['《时间的秩序》', '《小王子》'],
    quote: '把一天拆成可数的东西，焦虑就少了一点神秘感。',
    quoteBook: '《时间的秩序》',
    quoteAuthor: '卡洛·罗韦利',
  },
  {
    booksRead: ['《可能性的艺术》', '《组织的逻辑》'],
    quote: '真正难的不是表达观点，是在嘈杂里保留判断力。',
    quoteBook: '《可能性的艺术》',
    quoteAuthor: '刘瑜',
  },
  {
    booksRead: ['《写作是门手艺》', '《深度工作》'],
    quote: '文字不是把事情变漂亮，是把事情变得可以被再次理解。',
    quoteBook: '《写作是门手艺》',
    quoteAuthor: '刘军强',
  },
  {
    booksRead: ['《清单革命》', '《搞定》'],
    quote: '收纳不是把事物藏起来，是给未来的自己留一条路。',
    quoteBook: '《清单革命》',
    quoteAuthor: '阿图·葛文德',
  },
  {
    booksRead: ['《为什么我们睡觉》', '《瓦尔登湖》'],
    quote: '休息不是生产力的反面，休息是第二天还能喜欢世界的条件。',
    quoteBook: '《为什么我们睡觉》',
    quoteAuthor: '马修·沃克',
  },
];

const summaryTemplates = [
  (data: DayData) => `今天的信息密度约等于 ${Math.max(1, Math.round(data.messagesSent / 360))}/5 部《时间简史》，脑子真的辛苦了。今晚别再开新宇宙了，睡个好觉吧～`,
  (data: DayData) => `${data.meetingHours || 0} 小时会议像一场桌面版《奥德赛》，你带着判断力返航了。把船靠岸，剩下的明天再说。`,
  (data: DayData) => `文档和消息一起叠成了小型巴别塔，但你没有被语言砸晕。今日宜关机，宜喝水，宜对自己宽容。`,
  (data: DayData) => `这天像在给大脑跑索引：${formatNumber(data.messagesSent)} 条信号被收编，混沌少了一点，秩序多了一格。`,
  (data: DayData) => `今天大概消耗了 ${Math.max(1, Math.round((data.meetingHours || 0) + data.focusBlocks / 3))} 块精神电池。不是脆弱，是用得很认真。`,
];

type DayData = {
  order: string;
  title: string;
  messages: number;
  messagesSent: number;
  meetingHours: number;
  docs: number;
  weeklyDocsAdded: number;
  words: number;
  corpusWords: number;
  chineseChars: number;
  englishWords: number;
  transcriptWords: number;
  books: number;
  highlights: number;
  focusBlocks: number;
  booksRead: string[];
  quote: string;
  quoteFrom: string;
  quoteBook: string;
  quoteAuthor: string;
  summary: string;
  firstActivity: string;
  lastActivity: string;
  activeSpanHours: number;
  messageBursts: number;
};

function dayNumber(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function buildData(date: string) {
  const seed = dayNumber(date);
  const reading = readingLines[positiveModulo(seed, readingLines.length)];
  const messagesSent = 260 + positiveModulo(seed * 41, 940);
  const meetingHours = Math.round((1.5 + positiveModulo(seed * 17, 80) / 10) * 100) / 100;
  const corpusWords = 42000 + positiveModulo(seed * 997, 78000);
  const chineseChars = Math.round(corpusWords * (0.62 + positiveModulo(seed, 14) / 100));
  const data: DayData = {
    order: `${date.replaceAll('-', '')}-PUBLIC`,
    title: `Daily Receipt ${date.slice(5)}`,
    messages: 80 + positiveModulo(seed * 13, 180),
    messagesSent,
    meetingHours,
    docs: 3 + positiveModulo(seed, 8),
    weeklyDocsAdded: 4 + positiveModulo(seed * 3, 18),
    words: 2600 + positiveModulo(seed * 137, 6200),
    corpusWords,
    chineseChars,
    englishWords: corpusWords - chineseChars,
    transcriptWords: 1800 + positiveModulo(seed * 211, 7600),
    books: reading.booksRead.length,
    highlights: 8 + positiveModulo(seed * 7, 18),
    focusBlocks: 4 + positiveModulo(seed, 10),
    booksRead: reading.booksRead,
    quote: reading.quote,
    quoteFrom: 'Reading note',
    quoteBook: reading.quoteBook,
    quoteAuthor: reading.quoteAuthor,
    summary: '',
    firstActivity: `${String(8 + positiveModulo(seed, 3)).padStart(2, '0')}:${String(positiveModulo(seed * 7, 60)).padStart(2, '0')}`,
    lastActivity: `${String(19 + positiveModulo(seed, 5)).padStart(2, '0')}:${String(positiveModulo(seed * 11, 60)).padStart(2, '0')}`,
    activeSpanHours: Math.round((8 + positiveModulo(seed, 70) / 10) * 10) / 10,
    messageBursts: 12 + positiveModulo(seed * 5, 28),
  };
  data.summary = summaryTemplates[positiveModulo(seed, summaryTemplates.length)](data);
  return data;
}

Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'GET') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ ok: false, error: 'Expected date=YYYY-MM-DD' }, { status: 400, headers: corsHeaders });
  }

  const data = buildData(date);
  return Response.json({
    ok: true,
    data,
    meta: {
      date,
      source: 'public-demo',
      counts: {
        messages: data.messages,
        documents: data.weeklyDocsAdded,
        readingLines: data.highlights,
      },
      errors: [],
    },
  }, { headers: corsHeaders });
});

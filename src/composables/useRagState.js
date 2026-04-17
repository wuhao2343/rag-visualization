import { ref, reactive } from 'vue';
import { EMBED_CONFIG } from '../config/embed.js';
import { CHUNK_CONFIG } from '../config/chunk.js';
import { INDEX_CONFIG } from '../config/index-algo.js';
import { DB_CONFIG, DB_QUESTIONS, DB_RECS } from '../config/db.js';
import { RETRIEVAL_CONFIG } from '../config/retrieval.js';
import { LLM_CONFIG } from '../config/llm.js';
import { CHUNK_TEXTS_MAP, CHUNK_TOKENS, RESULT_TEXTS, DIM_SEMANTICS, PRESET_TEXTS, RECALL_POOL, RERANK_ORDER } from '../data/index.js';

export const STAGES = [
  {name: '文档导入', sub: '解析 · 清洗 · 分块', icon: '📄', iconBg: 'var(--accent-bg)', iconColor: 'var(--accent2)'},
  {name: 'Embedding', sub: '语义编码 · 向量化', icon: '⚡', iconBg: 'var(--amber-bg)', iconColor: 'var(--amber)'},
  {name: '向量索引', sub: 'HNSW · IVF · 存储', icon: '🗄️', iconBg: 'var(--purple-bg)', iconColor: 'var(--purple)'},
  {name: '检索', sub: 'ANN 搜索 · 重排序', icon: '🔍', iconBg: 'var(--green-bg)', iconColor: 'var(--green)'},
  {name: '增强生成', sub: 'Prompt · LLM · 答案', icon: '✨', iconBg: 'var(--coral-bg)', iconColor: 'var(--coral)'},
];

export const TRACE_STAGES = ['文档导入', 'Embedding', '向量索引', '检索', '增强生成'];
export const TRACE_DURATION = 3500;

export function useRagState() {
  const state = reactive({
    currentStage: 0,
    isWhiteBg: false,
    globalQuery: '太和殿有多高，有哪些历史典故？',
    selChunk: 'fixed',
    selEmbed: 'te3s',
    selDb: 'milvus',
    selIndex: 'hnsw',
    selRetrieval: 'rerank',
    selLlm: 'gpt4o',
    scoreThreshold: 0,
    promptTab: 0,
    autoTraceVisible: false,
    traceProgress: 0,
    traceStatusText: '准备开始...',
    traceStageDotsHtml: '',
    dimDetailVisible: false,
    dimSimilarChunksHtml: '',
    dbRecommendVisible: false,
    dbRecContentHtml: '',
    thresholdWarnVisible: false,
    thresholdResultHtml: '',
    goodQueryBoxHtml: '',
    badQueryBoxHtml: '',
    goodResultsHtml: '',
    badResultsHtml: '',
    // Panel 0
    p0InputHtml: '',
    p0OutputHtml: '',
    chunkCompareHtml: '',
    overlapHtml: '',
    chunkListHtml: '',
    p0MetricsHtml: '',
    p0HighlightHtml: '',
    // Panel 1
    p1InputHtml: '',
    p1OutputHtml: '',
    tokenBreakdownHtml: '',
    vecBarsHtml: '',
    p1ModelInfoHtml: '',
    cosinePairsHtml: '',
    dimSampleHtml: '',
    dimClickBarsHtml: '',
    presetTextBtnsHtml: '',
    customEmbedLabelHtml: '',
    p1HighlightHtml: '',
    // Panel 2
    p2InputHtml: '',
    p2OutputHtml: '',
    indexStatsHtml: '',
    p2MetricsHtml: '',
    p2HighlightHtml: '',
    algoCardsHtml: '',
    dbDecisionTreeHtml: '',
    // Panel 3
    p3InputHtml: '',
    p3OutputHtml: '',
    resultListHtml: '',
    scoreChartHtml: '',
    algoCompareHtml: '',
    recallPoolHtml: '',
    rerankResultsHtml: '',
    bm25ResultsHtml: '',
    vectorResultsHtml: '',
    rrfResultsHtml: '',
    hybridNoteHtml: '',
    p3HighlightHtml: '',
    // Panel 4
    p4InputHtml: '',
    p4OutputHtml: '',
    promptSysHtml: '',
    promptCtxHtml: '',
    promptFullHtml: '',
    promptApiHtml: '',
    finalAnswerHtml: '',
    p4MetricsHtml: '',
    noRagAnswerHtml: '',
    noRagProblemsHtml: '',
    ragAnswerHtml: '',
    ragBenefitsHtml: '',
    errorPatternsHtml: '',
  });

  const internalState = reactive({
    timers: [],
    indexAnimFrame: null,
    autoTraceTimer: null,
    activePresetIdx: -1,
    revealedPresets: new Set(),
    dbAnswers: {},
    dbCurrentQ: 'q1',
  });

  function getState() {
    return {
      chunk: state.selChunk,
      embed: state.selEmbed,
      db: state.selDb,
      index: state.selIndex,
      retrieval: state.selRetrieval,
      llm: state.selLlm,
      query: state.globalQuery || '太和殿有多高，有哪些历史典故？',
    };
  }

  function setTimeout(fn, ms) {
    const id = window.setTimeout(fn, ms);
    internalState.timers.push(id);
    return id;
  }

  function clearAll() {
    internalState.timers.forEach(clearTimeout);
    internalState.timers.length = 0;
  }

  function toggleBg() {
    state.isWhiteBg = !state.isWhiteBg;
  }

  return {
    state,
    internalState,
    getState,
    setTimeout,
    clearAll,
    toggleBg,
    // Config exports
    EMBED_CONFIG,
    CHUNK_CONFIG,
    INDEX_CONFIG,
    DB_CONFIG,
    DB_QUESTIONS,
    DB_RECS,
    RETRIEVAL_CONFIG,
    LLM_CONFIG,
    CHUNK_TEXTS_MAP,
    CHUNK_TOKENS,
    RESULT_TEXTS,
    DIM_SEMANTICS,
    PRESET_TEXTS,
    RECALL_POOL,
    RERANK_ORDER,
    STAGES,
    TRACE_STAGES,
    TRACE_DURATION,
  };
}
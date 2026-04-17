export const RETRIEVAL_CONFIG = {
  semantic: {
    name: '语义搜索',
    algo: '余弦相似度',
    topk: 5,
    scores: [0.94, 0.87, 0.81, 0.73, 0.61],
    note: '纯向量搜索，速度快，适合语义相似查询'
  },
  hybrid: {
    name: '混合搜索',
    algo: '语义 + BM25 / RRF融合',
    topk: 5,
    scores: [0.96, 0.91, 0.83, 0.72, 0.58],
    note: '融合语义与关键词，兼顾精确匹配'
  },
  rerank: {
    name: '语义+重排序',
    algo: '双阶段: ANN + Cross-encoder',
    topk: 5,
    scores: [0.98, 0.89, 0.79, 0.67, 0.54],
    note: '初步检索后用精排模型二次评分'
  },
  mmr: {
    name: 'MMR多样性',
    algo: '最大边际相关性',
    topk: 5,
    scores: [0.93, 0.85, 0.79, 0.74, 0.68],
    note: '降低结果冗余，提升覆盖面'
  },
};
export const DB_CONFIG = {
  milvus: {
    name: 'Milvus',
    type: '开源',
    filter: '标量过滤',
    scale: '百亿向量+',
    note: 'LF AI 基金会项目，支持 HNSW/IVF/DiskANN，分布式架构，国内使用最广泛的开源向量数据库'
  },
  pinecone: {
    name: 'Pinecone',
    type: '托管服务',
    filter: '元数据过滤',
    scale: '10亿向量+',
    note: '全托管云服务，无需运维，开箱即用，适合快速上线'
  },
  weaviate: {
    name: 'Weaviate',
    type: '开源/云',
    filter: 'GraphQL',
    scale: '亿级',
    note: '内置多模态支持，GraphQL 接口，可插拔向量化模块'
  },
  qdrant: {
    name: 'Qdrant',
    type: '开源',
    filter: 'Payload过滤',
    scale: '亿级',
    note: 'Rust 编写，低延迟，Payload 过滤性能出色'
  },
  pgvector: {
    name: 'pgvector',
    type: 'PostgreSQL扩展',
    filter: 'SQL',
    scale: '千万级',
    note: '直接在 Postgres 里加向量能力，不引入新基础设施，适合已有 PG 用户'
  },
  chroma: {
    name: 'ChromaDB',
    type: '开源',
    filter: '元数据',
    scale: '百万级',
    note: 'Python 原生，极易上手，适合本地开发和原型验证'
  },
  es: {
    name: 'Elasticsearch',
    type: '开源/云',
    filter: 'DSL 查询',
    scale: '亿级',
    note: '在原有全文检索基础上加了 dense_vector 支持，适合已有 ES 基础设施的团队'
  },
};

export const DB_QUESTIONS = [
  {
    id: 'q1', text: '你的数据规模大概是多少？',
    options: [
      {label: '< 100万向量', next: 'q2', tag: 'small'},
      {label: '100万 ~ 1亿', next: 'q3', tag: 'mid'},
      {label: '> 1亿', next: 'q4', tag: 'large'},
    ]
  },
  {
    id: 'q2', text: '你的部署偏好是？',
    options: [
      {label: '本地开发 / 快速原型', rec: 'chroma', tag: 'local'},
      {label: '已有 PostgreSQL', rec: 'pgvector', tag: 'pg'},
      {label: '生产环境 · 需要托管', rec: 'pinecone', tag: 'cloud'},
    ]
  },
  {
    id: 'q3', text: '团队是否有运维能力？',
    options: [
      {label: '有，可以自己部署维护', next: 'q3b', tag: 'ops'},
      {label: '没有，希望全托管服务', rec: 'pinecone', tag: 'managed'},
    ]
  },
  {
    id: 'q3b', text: '对技术栈有偏好吗？',
    options: [
      {label: '开源国产，社区活跃', rec: 'milvus', tag: 'cn'},
      {label: '极低延迟，Rust栈', rec: 'qdrant', tag: 'perf'},
      {label: '已有 Elasticsearch', rec: 'es', tag: 'es'},
      {label: '多模态/GraphQL', rec: 'weaviate', tag: 'mm'},
    ]
  },
  {
    id: 'q4', text: '查询吞吐量要求？',
    options: [
      {label: '高吞吐，分布式架构', rec: 'milvus', tag: 'hpc'},
      {label: '低延迟，单机大规模', rec: 'qdrant', tag: 'lt'},
    ]
  },
];

export const DB_RECS = {
  chroma: {
    name: 'ChromaDB',
    color: '#10b981',
    reason: '本地无依赖启动，Python 一行代码上手，适合快速验证想法',
    tradeoff: '不适合生产环境大规模部署'
  },
  pgvector: {
    name: 'pgvector',
    color: '#3b82f6',
    reason: '直接在现有 PostgreSQL 中加一个扩展，零新基础设施，SQL 查询过滤天然支持',
    tradeoff: '规模超过千万向量后需要考虑迁移'
  },
  pinecone: {
    name: 'Pinecone',
    color: '#8b5cf6',
    reason: '全托管 SaaS，API 直接调用，无运维负担，自动扩缩容',
    tradeoff: '数据在云端，有合规要求的场景需谨慎'
  },
  milvus: {
    name: 'Milvus',
    color: '#f59e0b',
    reason: 'LF AI 基金会项目，支持 HNSW/IVF/DiskANN，分布式架构，国内社区最活跃，百亿向量级别可稳定运行',
    tradeoff: '部署和运维复杂度相对较高'
  },
  qdrant: {
    name: 'Qdrant',
    color: '#f43f5e',
    reason: 'Rust 编写，内存效率高，延迟极低，Payload 过滤性能出色',
    tradeoff: '中文社区相对较小'
  },
  es: {
    name: 'Elasticsearch',
    color: '#4a5568',
    reason: '在现有 ES 基础设施上加 dense_vector 字段即可，全文检索与向量检索天然混合',
    tradeoff: '向量搜索性能不及专用向量数据库'
  },
  weaviate: {
    name: 'Weaviate',
    color: '#06b6d4',
    reason: '内置多模态向量化模块，GraphQL API，支持图像/文本混合索引',
    tradeoff: '资源占用相对较多'
  },
};
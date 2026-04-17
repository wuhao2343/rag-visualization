export const EMBED_CONFIG = {
  te3s: {
    name: 'text-embedding-3-small',
    dim: 1536,
    provider: 'OpenAI',
    speed: '~15ms',
    cost: '$0.02/M',
    norm: true,
    seed: 1
  },
  te3l: {
    name: 'text-embedding-3-large',
    dim: 3072,
    provider: 'OpenAI',
    speed: '~25ms',
    cost: '$0.13/M',
    norm: true,
    seed: 2
  },
  bge: {name: 'BGE-M3', dim: 1024, provider: 'BAAI', speed: '~8ms', cost: '自托管', norm: true, seed: 3},
  e5: {
    name: 'E5-large-v2',
    dim: 1024,
    provider: 'Microsoft',
    speed: '~10ms',
    cost: '自托管',
    norm: true,
    seed: 4
  },
  jina: {
    name: 'jina-embeddings-v3',
    dim: 1024,
    provider: 'Jina AI',
    speed: '~12ms',
    cost: '$0.018/M',
    norm: true,
    seed: 5
  },
};
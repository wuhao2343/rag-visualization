export const INDEX_CONFIG = {
  hnsw: {
    name: 'HNSW',
    full: 'Hierarchical Navigable Small World',
    search: 'O(log n)',
    build: '中等',
    recall: '98%',
    mem: '较高',
    qps: '高',
    color: '#3b82f6'
  },
  flat: {
    name: 'Flat',
    full: 'Brute Force精确搜索',
    search: 'O(n)',
    build: '极低',
    recall: '100%',
    mem: '低',
    qps: '低',
    color: '#10b981'
  },
  ivf: {
    name: 'IVF',
    full: 'Inverted File Index',
    search: 'O(√n)',
    build: '较高',
    recall: '94%',
    mem: '中等',
    qps: '极高',
    color: '#8b5cf6'
  },
};
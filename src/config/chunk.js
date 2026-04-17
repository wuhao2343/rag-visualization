export const CHUNK_CONFIG = {
  fixed: {size: 512, overlap: 128, count: 3, name: '固定大小分块', sep: '字符边界'},
  paragraph: {size: 320, overlap: 0, count: 4, name: '段落分割', sep: '段落边界（双换行/自然段）'},
  semantic: {size: 380, overlap: 80, count: 3, name: '语义分块', sep: '语义边界'},
  sentence: {size: 210, overlap: 30, count: 4, name: '句子分割', sep: '句子边界'},
  recursive: {size: 450, overlap: 100, count: 3, name: '递归字符分割', sep: '段落/句子/字符'},
};
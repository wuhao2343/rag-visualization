import { useRagState } from './useRagState.js';
import { drawEmbedSpace, drawCosineVis, drawIndexCanvas, drawRetrievalCanvas, drawCustomEmbedMulti } from '../utils/canvas.js';

export function usePanelRender(canvasRefs) {
  const {
    state,
    internalState,
    getState,
    setTimeout,
    clearAll,
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
  } = useRagState();

  function renderPanel0(s) {
    const cc = CHUNK_CONFIG[s.chunk];
    const chunks = CHUNK_TEXTS_MAP[s.chunk] || CHUNK_TEXTS_MAP.paragraph;
    const chunkCount = chunks.length;

    state.p0InputHtml = `{
  <span class="c-key">"filename"</span>: <span class="c-str">"gugong_intro.pdf"</span>,
  <span class="c-key">"type"</span>: <span class="c-str">"application/pdf"</span>,
  <span class="c-key">"pages"</span>: <span class="c-num">8</span>,
  <span class="c-key">"size_bytes"</span>: <span class="c-num">286720</span>,
  <span class="c-key">"raw_text_chars"</span>: <span class="c-num">12680</span>,
  <span class="c-key">"language"</span>: <span class="c-str">"zh-CN"</span>,
  <span class="c-key">"metadata"</span>: {
    <span class="c-key">"title"</span>: <span class="c-str">"故宫博物院介绍"</span>,
    <span class="c-key">"source"</span>: <span class="c-str">"palace-museum.org.cn"</span>,
    <span class="c-key">"created"</span>: <span class="c-str">"2024-09-15"</span>
  }
}`;

    state.p0OutputHtml = `<span class="c-cmt">// Array<Chunk>, length: ${chunkCount}</span>\n[\n` +
        chunks.map((t, i) => `  {\n    <span class="c-key">"id"</span>: <span class="c-str">"chunk_00${i + 1}"</span>,\n    <span class="c-key">"chars"</span>: <span class="c-num">${t.length}</span>,\n    <span class="c-key">"overlap"</span>: <span class="c-num">${cc.overlap}</span>,\n    <span class="c-key">"page"</span>: <span class="c-num">${i * 2 + 1}</span>\n  }`).join(',\n') + '\n]';

    // Chunk comparison grid
    const SOURCE = '故宫，正式名称为紫禁城，位于北京市中心，是中国明清两代的皇家宫殿。故宫始建于明朝永乐四年（1406年），历时十四年建成，于永乐十八年（1420年）正式启用。故宫占地面积约72万平方米，建筑面积约15万平方米，共有宫殿七十余座。太和殿俗称金銮殿，是故宫中最大的殿宇，殿高35.05米，面积2377平方米。故宫博物院成立于1925年，现已收藏文物超过180万件。';
    const strategies = [
      {key: 'fixed', name: '固定大小', color: '#3b82f6', desc: '每 80 字强制切断，不管语义边界', cuts: [80, 160, 240, 320, 400], badge: '最简单'},
      {key: 'paragraph', name: '段落分割', color: '#06b6d4', desc: '以自然段（双换行/句号+换行）为切割单元', cuts: [SOURCE.indexOf('。故宫始建') + 1, SOURCE.indexOf('。故宫占地') + 1, SOURCE.indexOf('。太和殿') + 1, SOURCE.indexOf('。故宫博物院') + 1].filter(c => c > 0), badge: '自然段'},
      {key: 'sentence', name: '句子分割', color: '#10b981', desc: '按句号、问号等标点切割', cuts: [SOURCE.indexOf('。', 10) + 1, SOURCE.indexOf('。', SOURCE.indexOf('。', 10) + 1) + 1, SOURCE.indexOf('。', SOURCE.indexOf('米', 130)) + 1, SOURCE.indexOf('。', SOURCE.indexOf('平方米', 200)) + 1].filter(Boolean), badge: '常用'},
      {key: 'semantic', name: '语义分块', color: '#8b5cf6', desc: '检测话题转折点切割（NLP）', cuts: [SOURCE.indexOf('故宫占地'), SOURCE.indexOf('太和殿'), SOURCE.indexOf('故宫博物院')], badge: '效果好'},
      {key: 'recursive', name: '递归分割', color: '#f59e0b', desc: '段落→句子→字符，优先保留完整段落', cuts: [SOURCE.indexOf('故宫占地'), SOURCE.indexOf('故宫博物院')], badge: '平衡'},
    ];

    state.chunkCompareHtml = strategies.map(st => {
      const cuts = [...new Set(st.cuts.filter(c => c > 0 && c < SOURCE.length))].sort((a, b) => a - b);
      const segments = [];
      let prev = 0;
      cuts.forEach(cut => {
        segments.push({text: SOURCE.slice(prev, cut), idx: segments.length});
        prev = cut;
      });
      segments.push({text: SOURCE.slice(prev), idx: segments.length});
      const segHtml = segments.map((seg, i) => {
        const bg = ['#3b82f618', '#10b98118', '#8b5cf618', '#f59e0b18', '#f43f5e18'][i % 5];
        const br = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'][i % 5];
        return `<span style="background:${bg};border-bottom:2px solid ${br};border-radius:2px 2px 0 0;position:relative">${seg.text}</span><span style="display:inline-block;width:2px;height:14px;background:${br};vertical-align:middle;margin:0 1px;opacity:0.8"></span>`;
      });
      const isActive = st.key === s.chunk;
      return `<div data-chunkkey="${st.key}" style="background:${isActive ? 'var(--accent-bg)' : 'var(--bg3)'};border:1px solid ${isActive ? 'var(--accent-border)' : 'var(--border)'};border-radius:8px;padding:12px;cursor:pointer;transition:all 0.15s" onclick="this.__vue__.selectChunk(this.dataset.chunkkey)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:11px;font-weight:600;font-family:var(--mono);color:${isActive ? 'var(--accent2)' : 'var(--text)'}">${st.name}</span>
          <span style="font-size:9px;font-family:var(--mono);padding:2px 6px;border-radius:10px;background:${st.color}22;color:${st.color};border:1px solid ${st.color}44">${st.badge}</span>
        </div>
        <div style="font-size:11px;line-height:1.7;color:var(--text2);font-family:var(--mono);margin-bottom:8px;word-break:break-all">${segHtml.join('')}</div>
        <div style="font-size:10px;color:var(--text3);font-family:var(--mono)">${st.desc} · <span style="color:${st.color}">${cuts.length + 1} chunks</span></div>
      </div>`;
    }).join('');

    state.chunkListHtml = chunks.map((t, i) => {
      const colors = ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'];
      const c = colors[i % colors.length];
      return `<div class="chunk-item" style="border-left-color:${c}">
        <div class="chunk-meta">
          <span class="chunk-id" style="color:${c}">chunk_00${i + 1}</span>
          <span class="chunk-stat">${t.length} chars</span>
          <span class="chunk-stat">overlap: ${cc.overlap}</span>
          <span class="chunk-stat">page ${i * 2 + 1}</span>
        </div>
        <div class="chunk-text">${t}</div>
      </div>`;
    }).join('');

    state.p0MetricsHtml = [
      ['文档总字符', '12,680', ''],
      ['生成块数量', chunkCount, 'accent'],
      ['平均块大小', Math.round(chunks.reduce((s, t) => s + t.length, 0) / chunkCount) + ' chars', ''],
      ['重叠率', cc.overlap > 0 ? Math.round(cc.overlap / (chunks[0]?.length || 300) * 100) + '%' : '无重叠', ''],
    ].map(([l, v, c]) => `<div class="metric-card"><div class="metric-label">${l}</div><div class="metric-val ${c}">${v}</div></div>`).join('');

    state.p0HighlightHtml = `<strong>对比说明：</strong> 上方卡片展示同一段故宫原文在不同策略下的切割位置，竖线为切割点，不同颜色代表不同 chunk。点击任意卡片可切换策略，下方"当前策略生成的 Chunks"会实时更新。<br>` +
        `<strong>当前（${cc.name}）：</strong>` +
        (s.chunk === 'fixed' ? '每 512 字强制切断，实现最简单速度最快，但容易在句子中间截断，损失语义完整性——注意块内容被截断的位置。' :
            s.chunk === 'paragraph' ? '以自然段落为切割单元，每个自然段是一个独立 chunk，无重叠。段落边界天然对应语义主题切换，非常适合结构清晰的文档。' :
                s.chunk === 'semantic' ? '用 NLP 模型检测话题转折点（如从"历史沿革"切换到"建筑规模"），语义边界最准确，块大小不均匀，但内容最连贯。' :
                    s.chunk === 'sentence' ? '以句号/问号/感叹号为切割边界，每个 chunk 是完整的若干句话，粒度最细，适合精确事实型 QA。' :
                        '按段落→句子→字符三级优先级递归切割，在长度约束下尽量保留最完整的语义单元，是 LangChain 的默认策略。');
  }

  function renderOverlapVis(cc) {
    const src = '故宫，正式名称为紫禁城，位于北京市中心，是中国明清两代的皇家宫殿。故宫始建于明朝永乐四年（1406年），历时十四年建成，于永乐十八年（1420年）正式启用。故宫占地面积约72万平方米。';
    const sz = Math.min(120, src.length / 2 | 0);
    const ov = Math.round(sz * cc.overlap / cc.size);
    const c1 = src.slice(0, sz);
    const overlap = src.slice(sz - ov, sz);
    const c2 = src.slice(sz - ov, sz + sz - ov);
    state.overlapHtml = `
      <div style="margin-bottom:8px">
        <div style="font-size:9px;font-family:var(--mono);color:#3b82f6;margin-bottom:3px">CHUNK 1</div>
        <div style="background:#3b82f610;border:1px solid #3b82f655;border-radius:4px;padding:8px;word-break:break-all">
          <span style="color:var(--text2)">${c1.slice(0, sz - ov)}</span><span style="background:#8b5cf633;border-bottom:2px solid #8b5cf6;color:#a78bfa;font-weight:500">${overlap}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0 8px;padding-left:16px">
        <div style="font-size:9px;font-family:var(--mono);color:#8b5cf6">↑↓ 共享 ${ov} 个字符 — 防止语义在边界断裂</div>
      </div>
      <div>
        <div style="font-size:9px;font-family:var(--mono);color:#10b981;margin-bottom:3px">CHUNK 2</div>
        <div style="background:#10b98110;border:1px solid #10b98155;border-radius:4px;padding:8px;word-break:break-all">
          <span style="background:#8b5cf633;border-bottom:2px solid #8b5cf6;color:#a78bfa;font-weight:500">${overlap}</span><span style="color:var(--text2)">${c2.slice(ov)}</span>
        </div>
      </div>`;
  }

  function renderPanel1(s) {
    const ec = EMBED_CONFIG[s.embed];
    const cc = CHUNK_CONFIG[s.chunk];
    const chunkIdx = 0;
    const pseudoTokens = CHUNK_TOKENS[chunkIdx];
    const tokenColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899'];

    state.p1InputHtml = `<span class="c-cmt">// Chunk 文本（示例）</span>\n<span class="c-str">"${CHUNK_TEXTS_MAP.paragraph[0].substring(0, 120)}..."</span>\n\n<span class="c-key">length</span>: <span class="c-num">${cc.size}</span> chars\n<span class="c-key">model</span>: <span class="c-str">"${ec.name}"</span>`;

    const sampleVecs = Array.from({length: 12}, (_, i) => ((Math.sin(i * 7.3 + ec.seed * 2.1) * 0.8)).toFixed(6));
    state.p1OutputHtml = `<span class="c-cmt">// float32[${ec.dim}]</span>\n[\n  <span class="c-num">${sampleVecs.slice(0, 6).join(',\n  ')}</span>,\n  <span class="c-cmt">  // ...${ec.dim} dims total</span>\n  <span class="c-num">${sampleVecs.slice(6).join(',\n  ')}</span>,\n  <span class="c-cmt">  // ...</span>\n]`;

    state.tokenBreakdownHtml = pseudoTokens.map((tk, i) =>
            `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:2px">
        <span style="background:${tokenColors[i % tokenColors.length]}22;border:1px solid ${tokenColors[i % tokenColors.length]}55;color:${tokenColors[i % tokenColors.length]};font-size:12px;font-family:var(--mono);padding:4px 8px;border-radius:4px;white-space:nowrap">${tk.t}</span>
        <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${tk.id}</span>
      </span>`
      ).join('<span style="color:var(--text3);font-size:14px;align-self:center;margin-top:-10px">›</span>') +
      `<span style="color:var(--text3);font-size:14px;align-self:center;margin-top:-10px">→</span>
       <span style="display:inline-flex;flex-direction:column;align-items:center;gap:2px">
         <span style="background:var(--bg4);border:1px solid var(--border2);color:var(--text2);font-size:11px;font-family:var(--mono);padding:4px 10px;border-radius:4px">[${ec.dim}d 向量]</span>
         <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">float32[]</span>
       </span>`;

    const bars = Array.from({length: 64}, (_, i) => {
      const h = Math.abs(Math.sin(i * 7.3 + ec.seed * 3.1) * 46 + Math.cos(i * 2.1 + ec.seed) * 20 + 24);
      const colors = ['#3b82f6', '#60a5fa', '#1d9e75', '#10b981', '#8b5cf6', '#f59e0b'];
      return `<div class="vbar" style="height:${Math.min(76, Math.max(3, h))}px;background:${colors[i % colors.length]};opacity:${0.4 + h / 120}"></div>`;
    });
    state.vecBarsHtml = bars.join('');

    state.p1ModelInfoHtml = [
      ['模型名称', ec.name],
      ['向量维度', ec.dim],
      ['提供方', ec.provider],
      ['推理延迟', ec.speed],
      ['计费单价', ec.cost],
      ['向量归一化', ec.norm ? '✓ 是' : '✗ 否'],
    ].map(([l, v]) => `<div class="vec-info-row"><span class="vec-info-label">${l}</span><span class="vec-info-val">${v}</span></div>`).join('');

    const dimVals = Array.from({length: 20}, (_, i) => {
      const v = Math.sin(i * 7.3 + ec.seed * 2.1) * 0.8;
      return `<span class="dim-val ${v > 0 ? 'pos' : 'neg'}">${v.toFixed(4)}</span>`;
    });
    state.dimSampleHtml = dimVals.join('');

    state.p1HighlightHtml = `<strong>技术说明：</strong> ${ec.name} 将文本通过 Transformer 编码为 ${ec.dim} 维向量，每个维度都捕获了语义的某个抽象特征。` +
        (s.embed === 'te3s' ? '维度 1536，性能与成本平衡最佳，推荐大多数场景首选。' :
            s.embed === 'te3l' ? '维度 3072，语义表达力更强，适合高精度要求场景，存储成本约 2×。' :
                s.embed === 'bge' ? 'BAAI 开源，中英双语效果出众，可自托管完全免费，延迟低。' :
                    s.embed === 'e5' ? '支持 instruction prefix 引导不同任务，泛化能力强。' :
                        'Jina v3 支持 Task LoRA，同一模型适配检索/分类/聚类多种任务。');

    state.cosinePairsHtml = [
      {label: '"太和殿建筑高度介绍"（高度相关）', score: 0.94, color: '#10b981'},
      {label: '"紫禁城历史沿革"（部分相关）', score: 0.72, color: '#3b82f6'},
      {label: '"北京地铁线路图"（无关内容）', score: 0.18, color: '#4a5568'},
    ].map(p => `
      <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
        <div>
          <div style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-bottom:3px">${p.label}</div>
          <div style="height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${p.score * 100}%;background:${p.color};border-radius:2px;transition:width 0.5s"></div>
          </div>
        </div>
        <span style="font-size:13px;font-family:var(--mono);font-weight:500;color:${p.color}">${p.score}</span>
      </div>`).join('');
  }

  function renderDimClickBars(seed) {
    state.dimClickBarsHtml = DIM_SEMANTICS.map((d, i) => {
      const val = Math.abs(Math.sin(d.id * 0.73 + seed * 0.31) * 0.7 + 0.2);
      const pct = Math.round(val * 100);
      const color = val > 0.6 ? '#3b82f6' : val > 0.4 ? '#8b5cf6' : '#4a5568';
      return `<div onclick="this.__vue__.showDimDetail(${i},${seed.toFixed(2)})" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 6px;border-radius:6px;border:1px solid transparent;transition:all 0.15s" id="dimbar-${i}">
        <div style="width:28px;height:${Math.max(8, pct * 0.6)}px;background:${color};border-radius:3px;transition:height 0.3s ease"></div>
        <div style="font-size:8px;font-family:var(--mono);color:var(--text3);white-space:nowrap">D${d.id}</div>
      </div>`;
    }).join('');
  }

  function showDimDetail(idx, seed) {
    const d = DIM_SEMANTICS[idx];
    const val = Math.abs(Math.sin(d.id * 0.73 + seed * 0.31) * 0.7 + 0.2);
    state.dimDetailVisible = true;
    state.dimSimilarChunksHtml = d.relChunks.map(c =>
        `<span style="font-size:10px;font-family:var(--mono);padding:2px 8px;background:var(--bg4);border:1px solid var(--border);border-radius:4px;color:var(--text2)">${c}</span>`
    ).join('');
  }

  function renderPresetButtons() {
    const groups = {};
    PRESET_TEXTS.forEach((p, i) => {
      if (!groups[p.cluster]) groups[p.cluster] = [];
      groups[p.cluster].push(i);
    });
    state.presetTextBtnsHtml = Object.entries(groups).map(([cluster, idxs]) =>
        `<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">
        <span style="font-size:9px;font-family:var(--mono);color:${PRESET_TEXTS[idxs[0]].color};min-width:52px">${cluster}</span>
        ${idxs.map(i => {
          const p = PRESET_TEXTS[i];
          const active = i === internalState.activePresetIdx;
          return `<button id="pbt-${i}" onclick="this.__vue__.embedPreset(${i})" style="font-size:11px;font-family:var(--mono);padding:4px 10px;border-radius:5px;border:1px solid ${p.color}${active ? 'cc' : '44'};background:${active ? p.color + '33' : 'var(--bg3)'};color:${active ? p.color : 'var(--text2)'};cursor:pointer;transition:all 0.15s;white-space:nowrap">${p.text.slice(0, 22)}${p.text.length > 22 ? '…' : ''}</button>`;
        }).join('')}
      </div>`
    ).join('');
  }

  function embedPreset(idx) {
    internalState.activePresetIdx = idx;
    internalState.revealedPresets.add(idx);
    renderPresetButtons();
    const p = PRESET_TEXTS[idx];
    state.customEmbedLabelHtml = `<span style="color:${p.color};font-weight:600">▶ "${p.text}"</span> → 落入「${p.cluster}」簇${p.cluster.includes('无关') ? ' — 与故宫知识库语义距离很远，检索时得分极低' : ' — 与相同主题的文档向量聚在一起，检索时得分高'}`;
  }

  function renderPanel2(s) {
    const ic = INDEX_CONFIG[s.index];
    const ec = EMBED_CONFIG[s.embed];
    const dc = DB_CONFIG[s.db];
    const cc = CHUNK_CONFIG[s.chunk];

    state.p2InputHtml = `<span class="c-cmt">// 批量向量 Upsert</span>\n{\n  <span class="c-key">"vectors"</span>: [\n    {\n      <span class="c-key">"id"</span>: <span class="c-str">"chunk_001"</span>,\n      <span class="c-key">"values"</span>: [<span class="c-num">0.234, -0.118...</span>],\n      <span class="c-key">"metadata"</span>: {\n        <span class="c-key">"source"</span>: <span class="c-str">"gugong_intro.pdf"</span>,\n        <span class="c-key">"page"</span>: <span class="c-num">1</span>\n      }\n    },\n    <span class="c-cmt">// ${cc.count} vectors, dim=${ec.dim}</span>\n  ]\n}`;

    state.p2OutputHtml = `<span class="c-cmt">// 索引元数据</span>\n{\n  <span class="c-key">"index_type"</span>: <span class="c-str">"${ic.name}"</span>,\n  <span class="c-key">"dimension"</span>: <span class="c-num">${ec.dim}</span>,\n  <span class="c-key">"total_vectors"</span>: <span class="c-num">${cc.count}</span>,\n  <span class="c-key">"metric"</span>: <span class="c-str">"cosine"</span>,\n  <span class="c-key">"recall_rate"</span>: <span class="c-str">"${ic.recall}"</span>,\n  <span class="c-key">"db"</span>: <span class="c-str">"${dc.name}"</span>,\n  <span class="c-key">"status"</span>: <span class="c-str">"ready"</span>\n}`;

    state.indexStatsHtml = [
      ['索引算法', ic.full, ''],
      ['搜索复杂度', ic.search, 'accent'],
      ['理论召回率', ic.recall, ic.recall === '100%' ? 'good' : ''],
      ['构建开销', ic.build, ''],
      ['查询 QPS', ic.qps, ic.qps === '高' || ic.qps === '极高' ? 'good' : ''],
      ['内存占用', ic.mem, ''],
      ['向量数据库', dc.name, ''],
      ['部署方式', dc.type, ''],
      ['过滤方式', dc.filter, ''],
      ['支持规模', dc.scale, 'good'],
    ].map(([l, v, c]) => `<div class="stat-row"><span class="stat-label">${l}</span><span class="stat-val ${c}">${v}</span></div>`).join('');

    state.p2MetricsHtml = [
      ['向量维度', ec.dim, 'accent'],
      ['索引向量数', cc.count, ''],
      ['召回率', ic.recall, 'green'],
      ['写入耗时', cc.count + '×3ms', ''],
    ].map(([l, v, c]) => `<div class="metric-card"><div class="metric-label">${l}</div><div class="metric-val ${c}">${v}</div></div>`).join('');

    state.p2HighlightHtml = `<strong>索引算法：</strong> ${ic.name} (${ic.full}) 以 ${ic.search} 的搜索复杂度实现近似最近邻搜索，` +
        (s.index === 'hnsw' ? '通过多层图结构在召回率和速度之间取得最佳平衡，是生产环境最常用的算法。' :
            s.index === 'flat' ? '精确暴力搜索，100% 召回率，但对海量数据场景性能下降严重。' :
                '通过聚类将向量分组，大幅提升查询吞吐，适合千万级以上规模，但召回率略有损失。') +
        `<br><br><strong>向量数据库：</strong> ${dc.note}`;

    const algoCards = [
      {key: 'hnsw', name: 'HNSW', color: '#3b82f6', full: 'Hierarchical Navigable Small World', how: '构建多层图结构，搜索时从顶层粗定位，逐层下降精确定位，像"缩小搜索范围"', complexity: 'O(log n)', recall: '~98%', speed: '极快', best: '生产首选'},
      {key: 'flat', name: 'Flat', color: '#10b981', full: '暴力精确搜索', how: '每次查询都和库中所有向量逐一计算相似度，没有任何捷径，保证 100% 精确', complexity: 'O(n)', recall: '100%', speed: '慢', best: '小规模/验证'},
      {key: 'ivf', name: 'IVF', color: '#8b5cf6', full: 'Inverted File Index', how: '用 K-Means 把向量预先聚成若干簇，查询时只在最近的簇里找，跳过大部分数据', complexity: 'O(√n)', recall: '~94%', speed: '很快', best: '超大规模'},
    ];
    state.algoCardsHtml = algoCards.map(a => {
      const active = a.key === s.index;
      return `<div data-indexkey="${a.key}" style="background:${active ? a.color + '18' : 'var(--bg3)'};border:1px solid ${active ? a.color + '55' : 'var(--border)'};border-radius:8px;padding:14px;cursor:pointer;transition:all 0.15s" onclick="this.__vue__.selectIndex(this.dataset.indexkey)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:15px;font-weight:700;font-family:var(--mono);color:${a.color}">${a.name}</span>
          ${active ? `<span style="font-size:9px;padding:2px 6px;border-radius:10px;background:${a.color}33;color:${a.color};font-family:var(--mono)">当前选中</span>` : ''}
        </div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:8px">${a.full}</div>
        <div style="font-size:11px;font-family:var(--mono);color:var(--text2);line-height:1.6;margin-bottom:10px;padding:8px;background:var(--bg4);border-radius:4px">${a.how}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
          ${[['搜索复杂度', a.complexity], ['召回率', a.recall], ['速度', a.speed], ['最适场景', a.best]].map(([k, v]) =>
          `<div style="background:var(--bg4);border-radius:4px;padding:4px 8px"><div style="font-size:9px;color:var(--text3);font-family:var(--mono)">${k}</div><div style="font-size:11px;font-weight:600;color:${active ? a.color : 'var(--text)'};font-family:var(--mono)">${v}</div></div>`
      ).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function renderDbDecisionTree() {
    const q = DB_QUESTIONS.find(q => q.id === internalState.dbCurrentQ);
    if (!q) return;
    const breadcrumb = Object.entries(internalState.dbAnswers).map(([qid, ans]) => {
      const qq = DB_QUESTIONS.find(q => q.id === qid);
      return `<span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${qq?.text.slice(0, 20)}… → <span style="color:var(--accent2)">${ans}</span></span>`;
    }).join(' › ');
    state.dbDecisionTreeHtml = `
      ${breadcrumb ? `<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:12px;padding:6px 10px;background:var(--bg3);border-radius:5px">${breadcrumb}</div>` : ''}
      <div style="font-size:13px;font-family:var(--mono);color:var(--text);margin-bottom:10px;font-weight:500">${q.text}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${q.options.map(opt =>
        `<button onclick="this.__vue__.answerDbQuestion('${q.id}','${opt.label}','${opt.next || ''}','${opt.rec || ''}')"
          style="font-size:11px;font-family:var(--mono);padding:8px 14px;border-radius:6px;border:1px solid var(--border2);background:var(--bg3);color:var(--text2);cursor:pointer;transition:all 0.15s"
        >${opt.label}</button>`
    ).join('')}
      </div>`;
  }

  function answerDbQuestion(qid, label, next, rec) {
    internalState.dbAnswers[qid] = label;
    if (rec) {
      showDbRecommendation(rec);
    } else if (next) {
      internalState.dbCurrentQ = next;
      renderDbDecisionTree();
    }
  }

  function showDbRecommendation(rec) {
    const db = DB_RECS[rec];
    state.dbRecommendVisible = true;
    state.dbRecContentHtml = `
      <span style="font-size:15px;font-weight:700;color:${db.color};font-family:var(--mono)">${db.name}</span>
      <div style="margin-top:6px;color:var(--text2)">${db.reason}</div>
      <div style="margin-top:6px;color:var(--text3);font-size:10px">⚠ 权衡：${db.tradeoff}</div>`;
  }

  function resetDbDecision() {
    internalState.dbAnswers = {};
    internalState.dbCurrentQ = 'q1';
    state.dbRecommendVisible = false;
    state.dbRecContentHtml = '';
    renderDbDecisionTree();
  }

  function renderPanel3(s) {
    const rc = RETRIEVAL_CONFIG[s.retrieval];
    const q = s.query;
    const ec = EMBED_CONFIG[s.embed];

    state.p3InputHtml = `<span class="c-cmt">// 查询向量化</span>\n<span class="c-key">query</span>: <span class="c-str">"${q}"</span>\n\n↓ embed(query)\n\n<span class="c-cmt">// float32[${ec.dim}]</span>\n[<span class="c-num">0.234, -0.118,\n 0.089,  0.312,\n-0.201,  0.445, ...</span>]\n\n<span class="c-key">top_k</span>: <span class="c-num">${rc.topk}</span>\n<span class="c-key">metric</span>: <span class="c-str">"cosine"</span>`;

    state.p3OutputHtml = `<span class="c-cmt">// Top-${rc.topk} 结果</span>\n` +
        rc.scores.map((sc, i) => `{\n  <span class="c-key">"id"</span>: <span class="c-str">"chunk_00${i + 1}"</span>,\n  <span class="c-key">"score"</span>: <span class="c-num">${sc}</span>\n}`).join(',\n');

    state.resultListHtml = rc.scores.map((sc, i) =>
        `<div class="result-item ${i === 0 ? 'top1' : ''}">
        <div class="result-rank">#${i + 1}</div>
        <div class="result-text-block">
          <div class="result-id">chunk_00${i + 1} · page ${i * 3 + 1}</div>
          <div class="result-text">${RESULT_TEXTS[i]}</div>
        </div>
        <div class="result-score-col">
          <div class="result-score-val">${sc.toFixed(3)}</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:${sc * 100}%"></div></div>
        </div>
      </div>`
    ).join('');

    state.scoreChartHtml = rc.scores.map((sc, i) => {
      const color = i === 0 ? '#10b981' : i < 3 ? '#3b82f6' : '#4a5568';
      return `<div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:10px;font-family:var(--mono);color:var(--text3)">chunk_00${i + 1}</span>
          <span style="font-size:11px;font-family:var(--mono);color:${color};font-weight:500">${sc.toFixed(3)}</span>
        </div>
        <div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${sc * 100}%;background:${color};border-radius:3px;transition:width 0.5s ${i * 0.08}s"></div>
        </div>
      </div>`;
    }).join('');

    const algoRows = [
      {name: '语义搜索', speed: '⚡⚡⚡', recall: '★★★☆☆', cost: '低'},
      {name: '混合搜索', speed: '⚡⚡', recall: '★★★★☆', cost: '中'},
      {name: '语义+重排', speed: '⚡', recall: '★★★★★', cost: '高'},
      {name: 'MMR多样性', speed: '⚡⚡', recall: '★★★☆☆', cost: '中'},
    ];
    state.algoCompareHtml = algoRows.map((a, i) => {
      const cur = ['semantic', 'hybrid', 'rerank', 'mmr'][i] === s.retrieval;
      return `<div style="display:grid;grid-template-columns:80px 1fr 1fr 30px;gap:6px;align-items:center;padding:4px 6px;border-radius:4px;background:${cur ? 'var(--accent-bg)' : 'transparent'};border:1px solid ${cur ? 'var(--accent-border)' : 'transparent'}">
        <span style="font-size:10px;font-family:var(--mono);color:${cur ? 'var(--accent2)' : 'var(--text3)'}">${a.name}</span>
        <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${a.speed}</span>
        <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${a.recall}</span>
        <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${a.cost}</span>
      </div>`;
    }).join('');

    state.p3HighlightHtml = `<strong>技术说明：</strong> ${rc.algo}。${rc.note}。` +
        (s.retrieval === 'hybrid' ? ' RRF（Reciprocal Rank Fusion）融合两路排序结果，有效提升边界查询的精度。' :
            s.retrieval === 'rerank' ? ' Cross-encoder 精排模型逐对计算 query-doc 相关性，精度高于双塔检索，但延迟约增加 30-50ms。' :
                s.retrieval === 'mmr' ? ' MMR 在最大相关性的基础上对高相似度结果进行惩罚，适合摘要类任务。' : '');
  }

  function renderTwoStageRetrieval(retrieval) {
    const isRerank = retrieval === 'rerank';
    state.recallPoolHtml = RECALL_POOL.map((c, i) => {
      const inFinalTop5 = isRerank ? RERANK_ORDER.includes(i) : i < 5;
      const finalRank = isRerank ? RERANK_ORDER.indexOf(i) : (i < 5 ? i : -1);
      const borderColor = inFinalTop5 ? (finalRank >= 0 ? '#10b981' : '#3b82f6') : 'var(--border)';
      const opacity = i >= 10 ? '0.5' : '1';
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:4px;background:var(--bg3);border:1px solid ${borderColor};opacity:${opacity};transition:all 0.3s ${i * 0.02}s" class="anim-result">
        <span style="font-size:9px;font-family:var(--mono);color:var(--text3);min-width:14px">#${i + 1}</span>
        <span style="font-size:10px;font-family:var(--mono);color:${inFinalTop5 ? 'var(--text)' : 'var(--text3)'};flex:1">${c.topic}</span>
        <div style="width:50px;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${c.vecScore * 100}%;background:${inFinalTop5 ? '#10b981' : '#3b82f6'};border-radius:2px"></div>
        </div>
        <span style="font-size:9px;font-family:var(--mono);color:${inFinalTop5 ? 'var(--green)' : 'var(--text3)'};">${c.vecScore.toFixed(2)}</span>
      </div>`;
    }).join('');

    if (isRerank) {
      state.rerankResultsHtml = RERANK_ORDER.map((poolIdx, rank) => {
        const c = RECALL_POOL[poolIdx];
        const vecRank = poolIdx;
        const rankChange = vecRank - rank;
        const arrow = rankChange > 0 ? `<span style="color:#f59e0b">↑${rankChange}</span>` :
            rankChange < 0 ? `<span style="color:#6b7280">↓${Math.abs(rankChange)}</span>` :
                `<span style="color:#4a5568">—</span>`;
        const rerankScore = [0.96, 0.91, 0.88, 0.84, 0.79][rank];
        return `<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:4px;background:var(--bg3);border:1px solid ${rank === 0 ? 'var(--green-border)' : 'var(--border)'};animation:resultSlide 0.3s ease ${rank * 0.08}s both">
          <span style="font-size:9px;font-family:var(--mono);color:var(--purple);min-width:14px">#${rank + 1}</span>
          <span style="font-size:10px;font-family:var(--mono);color:var(--text);flex:1">${c.topic}</span>
          <span style="font-size:9px;font-family:var(--mono)">${arrow}</span>
          <div style="width:50px;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${rerankScore * 100}%;background:var(--purple);border-radius:2px"></div>
          </div>
          <span style="font-size:9px;font-family:var(--mono);color:var(--purple)">${rerankScore.toFixed(2)}</span>
        </div>`;
      }).join('');
    } else {
      state.rerankResultsHtml = `<div style="padding:20px;text-align:center;font-size:11px;font-family:var(--mono);color:var(--text3)">选择"语义+重排序"策略<br>查看精排前后排名变化</div>`;
    }
  }

  function renderHybridSearch(retrieval) {
    const bm25Order = [
      {id: 'chunk_003', topic: '太和殿建筑', score: 0.91, highlight: true},
      {id: 'chunk_007', topic: '宫殿礼仪制度', score: 0.81, highlight: true},
      {id: 'chunk_002', topic: '故宫空间布局', score: 0.72, highlight: false},
      {id: 'chunk_009', topic: '紫禁城命名', score: 0.62, highlight: false},
      {id: 'chunk_001', topic: '故宫历史建成', score: 0.68, highlight: false},
    ];
    const vecOrder = [
      {id: 'chunk_003', topic: '太和殿建筑', score: 0.94},
      {id: 'chunk_002', topic: '故宫空间布局', score: 0.87},
      {id: 'chunk_001', topic: '故宫历史建成', score: 0.81},
      {id: 'chunk_004', topic: '故宫文物收藏', score: 0.73},
      {id: 'chunk_007', topic: '宫殿礼仪制度', score: 0.69},
    ];
    const K = 60;
    const allChunks = [...new Set([...bm25Order, ...vecOrder].map(c => c.id))];
    const rrfScores = allChunks.map(id => {
      const b = bm25Order.findIndex(c => c.id === id);
      const v = vecOrder.findIndex(c => c.id === id);
      const score = (b >= 0 ? 1 / (K + b + 1) : 0) + (v >= 0 ? 1 / (K + v + 1) : 0);
      const item = bm25Order.find(c => c.id === id) || vecOrder.find(c => c.id === id);
      return {id, topic: item?.topic || id, score};
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    const colorFn = (i) => i === 0 ? 'var(--green)' : i < 3 ? 'var(--text)' : 'var(--text3)';
    const isHybrid = retrieval === 'hybrid';

    const renderList = (items) => items.map((c, i) =>
        `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;transition:all 0.2s ${i * 0.06}s">
        <span style="font-size:9px;font-family:var(--mono);color:var(--text3);min-width:14px">#${i + 1}</span>
        <span style="font-size:10px;font-family:var(--mono);color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.topic}</span>
        ${c.highlight ? '<span style="font-size:8px;font-family:var(--mono);background:var(--amber-bg);color:var(--amber);padding:0 4px;border-radius:3px">词命中</span>' : ''}
        <span style="font-size:9px;font-family:var(--mono);color:${colorFn(i)}">${c.score.toFixed(3)}</span>
      </div>`
    ).join('');

    state.bm25ResultsHtml = renderList(bm25Order);
    state.vectorResultsHtml = renderList(vecOrder);
    state.rrfResultsHtml = rrfScores.map((c, i) => {
      const br = bm25Order.findIndex(x => x.id === c.id) + 1;
      const vr = vecOrder.findIndex(x => x.id === c.id) + 1;
      const rankStr = `BM25:#${br || '–'} 向量:#${vr || '–'}`;
      return `<div style="display:flex;flex-direction:column;gap:2px;padding:5px 8px;background:${i < 3 ? 'var(--green-bg)' : 'var(--bg3)'};border:1px solid ${i < 3 ? 'var(--green-border)' : 'var(--border)'};border-radius:4px;transition:all 0.2s ${i * 0.06}s">
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-size:9px;font-family:var(--mono);color:var(--green);min-width:14px">#${i + 1}</span>
          <span style="font-size:10px;font-family:var(--mono);color:var(--text);flex:1">${c.topic}</span>
          <span style="font-size:9px;font-family:var(--mono);color:var(--green)">${c.score.toFixed(4)}</span>
        </div>
        <div style="font-size:8px;font-family:var(--mono);color:var(--text3);padding-left:18px">${rankStr}</div>
      </div>`;
    }).join('');

    if (isHybrid) {
      state.hybridNoteHtml = `<strong>chunk_007（宫殿礼仪制度）</strong> 在 BM25 排名第2（含关键词），但在向量排名第5（语义稍弱）。RRF融合后综合了两路排名，最终排到第4位 — 这就是混合检索的价值：防止纯语义检索错过关键词精确匹配的结果。`;
    } else {
      state.hybridNoteHtml = `切换到「<strong>混合搜索 (Hybrid)</strong>」策略后，可看到 BM25 和向量两路排名如何通过 RRF 融合。注意 <strong>chunk_007</strong> 在两路中排名的差异。`;
    }
  }

  function updateThreshold() {
    const threshold = state.scoreThreshold / 100;
    const s = getState();
    const rc = RETRIEVAL_CONFIG[s.retrieval];
    const filtered = rc.scores.map((sc, i) => ({sc, i})).filter(x => x.sc >= threshold);
    if (filtered.length === 0) {
      state.thresholdWarnVisible = true;
      state.thresholdResultHtml = `<div style="font-size:11px;font-family:var(--mono);color:var(--text3);text-align:center;padding:12px">全部 ${rc.scores.length} 个结果被过滤 — Prompt 中将没有参考资料</div>`;
    } else {
      state.thresholdWarnVisible = false;
      state.thresholdResultHtml = rc.scores.map((sc, i) => {
        const pass = sc >= threshold;
        return `<div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:6px;background:${pass ? 'var(--bg3)' : 'var(--bg4)'};border:1px solid ${pass ? 'var(--border)' : 'transparent'};opacity:${pass ? 1 : 0.35};transition:all 0.3s">
          <span style="font-size:10px;font-family:var(--mono);color:${pass ? 'var(--accent2)' : 'var(--text3)'}">chunk_00${i + 1}</span>
          <div style="flex:1;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${sc * 100}%;background:${pass ? 'var(--accent)' : 'var(--text3)'};border-radius:2px"></div>
          </div>
          <span style="font-size:11px;font-family:var(--mono);color:${pass ? 'var(--text)' : 'var(--text3)'};">${sc.toFixed(3)}</span>
          <span style="font-size:9px;font-family:var(--mono);padding:1px 6px;border-radius:10px;background:${pass ? 'var(--green-bg)' : 'var(--bg4)'};color:${pass ? 'var(--green)' : 'var(--text3)'};">${pass ? '通过' : '过滤'}</span>
        </div>`;
      }).join('');
    }
  }

  function renderBadCaseContrast(s) {
    const q = s.query;
    state.goodQueryBoxHtml = `查询："${q}"`;
    const badQ = q.includes('太和殿') || q.includes('高') ? '"北京有哪些高楼？"' :
        q.includes('文物') ? '"中国有哪些艺术品？"' : '"宫廷建筑有什么特点？"';
    state.badQueryBoxHtml = `查询：${badQ}`;

    const goodScores = [0.94, 0.87, 0.81];
    const badScores = [0.41, 0.33, 0.27];

    state.goodResultsHtml = goodScores.map((sc, i) =>
        `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--bg3);border:1px solid var(--green-border);border-radius:5px">
        <span style="font-size:10px;font-family:var(--mono);color:var(--green)">chunk_00${i + 1}</span>
        <div style="flex:1;height:3px;background:var(--bg4);border-radius:2px"><div style="height:100%;width:${sc * 100}%;background:var(--green);border-radius:2px"></div></div>
        <span style="font-size:10px;font-family:var(--mono);color:var(--green)">${sc.toFixed(2)}</span>
      </div>`
    ).join('');

    state.badResultsHtml = badScores.map((sc, i) =>
        `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--bg3);border:1px solid var(--coral-border);border-radius:5px">
        <span style="font-size:10px;font-family:var(--mono);color:var(--coral)">chunk_00${i + 1}</span>
        <div style="flex:1;height:3px;background:var(--bg4);border-radius:2px"><div style="height:100%;width:${sc * 100}%;background:var(--coral);border-radius:2px"></div></div>
        <span style="font-size:10px;font-family:var(--mono);color:var(--coral)">${sc.toFixed(2)}</span>
      </div>`
    ).join('');
  }

  function renderPanel4(s) {
    const lc = LLM_CONFIG[s.llm];
    const rc = RETRIEVAL_CONFIG[s.retrieval];
    const q = s.query;

    state.p4InputHtml = `<span class="c-cmt">// RAG 输入组装</span>\n{\n  <span class="c-key">"query"</span>: <span class="c-str">"${q}"</span>,\n  <span class="c-key">"contexts"</span>: [\n    <span class="c-cmt">// Top-${rc.topk} 检索结果</span>\n    { <span class="c-key">"id"</span>: <span class="c-str">"chunk_003"</span>, <span class="c-key">"score"</span>: <span class="c-num">${rc.scores[0]}</span> },\n    { <span class="c-key">"id"</span>: <span class="c-str">"chunk_002"</span>, <span class="c-key">"score"</span>: <span class="c-num">${rc.scores[1]}</span> },\n    <span class="c-cmt">// ...</span>\n  ]\n}`;

    state.p4OutputHtml = `<span class="c-cmt">// LLM 响应</span>\n{\n  <span class="c-key">"model"</span>: <span class="c-str">"${lc.name}"</span>,\n  <span class="c-key">"usage"</span>: {\n    <span class="c-key">"prompt_tokens"</span>: <span class="c-num">1024</span>,\n    <span class="c-key">"completion_tokens"</span>: <span class="c-num">248</span>\n  },\n  <span class="c-key">"latency_ms"</span>: <span class="c-num">1860</span>,\n  <span class="c-key">"finish_reason"</span>: <span class="c-str">"stop"</span>\n}`;

    const sys = `你是一个故宫知识库问答助手。请严格基于以下参考资料回答用户问题。\n如果参考资料中没有相关信息，请明确告知，不要编造内容。\n回答应简洁、准确，并标注信息来源。`;
    const ctx = `[参考资料 1 — chunk_003, score: ${rc.scores[0]}]\n${CHUNK_TEXTS_MAP.paragraph[2]}\n\n[参考资料 2 — chunk_002, score: ${rc.scores[1]}]\n${CHUNK_TEXTS_MAP.paragraph[1]}\n\n[参考资料 3 — chunk_001, score: ${rc.scores[2]}]\n${CHUNK_TEXTS_MAP.paragraph[0]}`;

    state.promptSysHtml = sys;
    state.promptCtxHtml = ctx;
    state.promptFullHtml = `<span class="p-sys">【System Prompt】\n${sys}\n\n</span><span class="p-ctx">【检索到的上下文】\n${ctx}\n\n</span><span class="p-q">【用户问题】\n${q}</span>`;
    state.promptApiHtml = `{\n  <span class="c-key">"model"</span>: <span class="c-str">"${lc.name.toLowerCase().replace(/ /g, '-')}"</span>,\n  <span class="c-key">"max_tokens"</span>: <span class="c-num">1024</span>,\n  <span class="c-key">"temperature"</span>: <span class="c-num">${lc.temp}</span>,\n  <span class="c-key">"messages"</span>: [\n    {\n      <span class="c-key">"role"</span>: <span class="c-str">"system"</span>,\n      <span class="c-key">"content"</span>: <span class="c-str">"你是故宫知识库问答助手..."</span>\n    },\n    {\n      <span class="c-key">"role"</span>: <span class="c-str">"user"</span>,\n      <span class="c-key">"content"</span>: <span class="c-str">"[3段故宫文献 + 用户问题，共1024 tokens]"</span>\n    }\n  ]\n}`;

    const isHeightQuery = q.includes('多高') || q.includes('高度') || q.includes('太和殿');
    const answerSteps = isHeightQuery ? [
      {num: '建筑高度', text: '太和殿殿高 35.05 米，是故宫中最高的殿宇，也是中国现存最大的木结构大殿。'},
      {num: '建筑规模', text: '太和殿面积 2377 平方米，殿内有 72 根大柱支撑，规制宏伟。'},
      {num: '历史功能', text: '太和殿俗称"金銮殿"，是举行皇帝登基、颁发诏书等重大典礼的核心场所。'},
      {num: '建筑背景', text: '太和殿位于故宫中轴线核心，始建于明永乐年间，现存建筑为清代重建。'},
    ] : [
      {num: '概述', text: '故宫，正式名称紫禁城，明清两代皇宫，始建于1406年，占地约72万平方米。'},
      {num: '建筑', text: '共有宫殿七十余座、房屋九千余间，以太和殿为核心，坐北朝南沿中轴线排列。'},
      {num: '文物', text: '故宫博物院收藏文物超180万件，含陶瓷、书画、青铜器等，一级文物6万余件。'},
      {num: '地位', text: '世界上现存规模最大、保存最完整的木质结构古建筑群，列入世界文化遗产。'},
    ];

    state.finalAnswerHtml = answerSteps.map(a =>
            `<div class="answer-step"><span class="answer-step-num">${a.num}</span><span class="answer-step-text">${a.text}</span></div>`
        ).join('') +
        `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;font-family:var(--mono);color:var(--text3)">📎 来源: chunk_003 (score:${rc.scores[0]}) · chunk_002 (score:${rc.scores[1]}) · chunk_001 (score:${rc.scores[2]}) | 模型: ${lc.name} | 延迟: ${lc.latency}</div>`;

    state.p4MetricsHtml = [
      ['上下文 Tokens', '1,024', 'accent'],
      ['生成 Tokens', '248', ''],
      ['端到端延迟', lc.latency, 'amber'],
      ['上下文窗口', lc.ctx, ''],
    ].map(([l, v, c]) => `<div class="metric-card"><div class="metric-label">${l}</div><div class="metric-val ${c}">${v}</div></div>`).join('');
  }

  function renderRagComparison(s) {
    const q = s.query;
    const isHeight = q.includes('多高') || q.includes('高度') || q.includes('太和殿');

    state.noRagAnswerHtml = isHeight
        ? `太和殿是故宫中著名的大殿，<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">大约有30多米高</span>，建于明代，是皇帝举行朝会的地方。殿内装饰金碧辉煌，<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">据说有108根柱子</span>，是中国古代建筑的代表作。`
        : `故宫是中国北京的著名历史建筑，<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">建于约1400年左右</span>，是明清两代皇帝的宫殿。<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">占地面积大约100万平方米</span>，内有各种宫殿建筑和文物。`;

    state.ragAnswerHtml = isHeight
        ? `太和殿殿高 <span style="color:var(--green);font-weight:600">35.05 米</span>，是故宫中最大的殿宇，也是中国现存最大的木结构大殿。面积 <span style="color:var(--green);font-weight:600">2377 平方米</span>，殿内有 <span style="color:var(--green);font-weight:600">72 根</span>大柱支撑，中央设有皇帝宝座，是举行皇帝登基、颁发诏书等重大典礼的场所。<span style="font-size:10px;color:var(--text3)">【来源: chunk_003, score: 0.94】</span>`
        : `故宫占地面积约 <span style="color:var(--green);font-weight:600">72万平方米</span>，共有大小宫殿七十余座，房屋九千余间。故宫博物院成立于 <span style="color:var(--green);font-weight:600">1925年</span>，现已收藏文物超过 <span style="color:var(--green);font-weight:600">180万件</span>。<span style="font-size:10px;color:var(--text3)">【来源: chunk_001+chunk_004, score: 0.94/0.87】</span>`;

    state.noRagProblemsHtml = [
      {icon: '⚠', text: '数据不精确（约30米 ≠ 35.05米）', color: 'var(--coral)'},
      {icon: '⚠', text: '关键细节错误（108根 ≠ 72根）', color: 'var(--coral)'},
      {icon: 'ℹ', text: '无来源引用，无法溯源验证', color: 'var(--amber)'},
    ].map(p => `<div style="display:flex;align-items:center;gap:6px;font-size:10px;font-family:var(--mono);color:${p.color}">${p.icon} ${p.text}</div>`).join('');

    state.ragBenefitsHtml = [
      {icon: '✓', text: '精确数据，来自检索文献', color: 'var(--green)'},
      {icon: '✓', text: '每条信息标注来源 chunk', color: 'var(--green)'},
      {icon: '✓', text: '知识可热更新，无需重训', color: 'var(--green)'},
    ].map(p => `<div style="display:flex;align-items:center;gap:6px;font-size:10px;font-family:var(--mono);color:${p.color}">${p.icon} ${p.text}</div>`).join('');
  }

  function renderErrorPatterns() {
    const patterns = [
      {title: 'Chunk 过大', icon: '📦', color: '#f59e0b', symptom: '检索结果得分普遍偏低', cause: '向量包含太多混杂语义，相似度被稀释', fix: '缩小 chunk_size 至 256~512，增加 overlap', score: [0.55, 0.48, 0.42]},
      {title: 'Chunk 过小', icon: '✂', color: '#8b5cf6', symptom: '回答残缺、缺乏上下文', cause: '单块文本太短，关键信息被截断在多块中', fix: '增大 chunk_size，确保包含完整语义单元', score: [0.91, 0.88, 0.86]},
      {title: '嵌入模型弱', icon: '⚡', color: '#f43f5e', symptom: '语义相关结果排名靠后', cause: '模型对专业领域词汇理解不足', fix: '换用领域微调模型或更大维度模型', score: [0.71, 0.69, 0.68]},
      {title: '知识库缺失', icon: '🔍', color: '#4a5568', symptom: '得分全部低于 0.5', cause: '知识库中根本没有相关文档', fix: '扩充知识库，或在 System Prompt 中说明"不知道"', score: [0.38, 0.31, 0.27]},
    ];
    state.errorPatternsHtml = patterns.map(p => `
      <div style="background:var(--bg3);border:1px solid ${p.color}44;border-left:3px solid ${p.color};border-radius:0 8px 8px 0;padding:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:16px">${p.icon}</span>
          <span style="font-size:12px;font-weight:600;font-family:var(--mono);color:${p.color}">${p.title}</span>
        </div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">现象</div>
        <div style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-bottom:8px">${p.symptom}</div>
        <div style="display:flex;gap:3px;margin-bottom:8px">
          ${p.score.map(sc => `<div style="flex:1;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden"><div style="height:100%;width:${sc * 100}%;background:${p.color};border-radius:2px"></div></div><span style="font-size:8px;font-family:var(--mono);color:${p.color}">${sc}</span>`).join('')}
        </div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">根因</div>
        <div style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-bottom:8px">${p.cause}</div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">修复</div>
        <div style="font-size:11px;font-family:var(--mono);color:${p.color}">${p.fix}</div>
      </div>`).join('');
  }

  // Canvas drawing wrappers
  function drawEmbedSpace(seed) {
    drawEmbedSpace(canvasRefs.embedSpaceCanvas?.value, seed);
  }

  function drawCosineVis(seed) {
    drawCosineVis(canvasRefs.cosineCanvas?.value, seed);
  }

  function drawIndexCanvas(indexType) {
    drawIndexCanvas(canvasRefs.indexCanvas?.value, indexType);
  }

  function drawRetrievalCanvas(scores, retrieval) {
    drawRetrievalCanvas(canvasRefs.retrievalCanvas?.value, scores, retrieval);
  }

  function drawCustomEmbedMulti() {
    drawCustomEmbedMulti(canvasRefs.customEmbedCanvas?.value, PRESET_TEXTS, internalState.revealedPresets, internalState.activePresetIdx);
  }

  return {
    renderPanel0,
    renderOverlapVis,
    renderPanel1,
    renderDimClickBars,
    showDimDetail,
    renderPresetButtons,
    embedPreset,
    renderPanel2,
    renderDbDecisionTree,
    answerDbQuestion,
    resetDbDecision,
    renderPanel3,
    renderTwoStageRetrieval,
    renderHybridSearch,
    updateThreshold,
    renderBadCaseContrast,
    renderPanel4,
    renderRagComparison,
    renderErrorPatterns,
    drawEmbedSpace,
    drawCosineVis,
    drawIndexCanvas,
    drawRetrievalCanvas,
    drawCustomEmbedMulti,
  };
}
<template>
  <div class="rag-visualizer-wrapper" :class="{ 'white-bg': isWhiteBg }">
    <div class="app" :class="{ 'white-bg': isWhiteBg }">
      <!-- ═══ TOPBAR ═══ -->
      <header class="topbar">
        <div class="topbar-logo">
          <div class="dot"></div>
          RAG 可视化演示系统
        </div>
        <div class="query-bar">
          <span class="q-label">查询&nbsp;›</span>
          <input type="text" v-model="globalQuery" placeholder="输入查询问题...">
        </div>
        <button class="run-btn" @click="updateAll">全程追踪 →</button>
        <button @click="startAutoTrace" class="auto-trace-btn">▶ 自动演示</button>
        <div class="topbar-sep"></div>
        <div class="topbar-badge">模拟演示</div>
        <button class="toggle-bg-btn" @click="toggleBg" :title="isWhiteBg ? '切换为默认背景' : '切换为白色背景'">
          <svg v-if="!isWhiteBg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </header>

      <!-- ═══ SIDEBAR ═══ -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-label">流程阶段</div>
          <div
              v-for="(stage, i) in stages"
              :key="i"
              :class="['stage-nav-item', { active: currentStage === i }]"
              :id="'nav' + i"
              @click="goTo(i)"
          >
            <div class="stage-icon" :style="{ background: stage.iconBg, color: stage.iconColor }">
              {{ stage.icon }}
            </div>
            <div class="stage-nav-text">
              <span class="stage-nav-name">{{ stage.name }}</span>
              <span class="stage-nav-sub">{{ stage.sub }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-divider"></div>

        <div class="tech-panel">
          <div class="tech-panel-title">技术选型</div>

          <div class="tech-select-row">
            <label class="tech-select-label">分块策略</label>
            <select class="tech-select" v-model="selChunk" @change="updateAll">
              <option value="fixed">固定大小 (512 chars)</option>
              <option value="paragraph">段落分割</option>
              <option value="semantic">语义分块</option>
              <option value="sentence">句子分割</option>
              <option value="recursive">递归分割</option>
            </select>
          </div>

          <div class="tech-select-row">
            <label class="tech-select-label">嵌入模型</label>
            <select class="tech-select" v-model="selEmbed" @change="updateAll">
              <option value="te3s">text-embedding-3-small</option>
              <option value="te3l">text-embedding-3-large</option>
              <option value="bge">BGE-M3 (BAAI)</option>
              <option value="e5">E5-large-v2</option>
              <option value="jina">Jina-v3</option>
            </select>
          </div>

          <div class="tech-select-row">
            <label class="tech-select-label">向量数据库</label>
            <select class="tech-select" v-model="selDb" @change="updateAll">
              <option value="milvus">Milvus (默认)</option>
              <option value="pinecone">Pinecone</option>
              <option value="weaviate">Weaviate</option>
              <option value="qdrant">Qdrant</option>
              <option value="pgvector">pgvector</option>
              <option value="chroma">ChromaDB</option>
              <option value="es">Elasticsearch</option>
            </select>
          </div>

          <div class="tech-select-row">
            <label class="tech-select-label">索引算法</label>
            <select class="tech-select" v-model="selIndex" @change="updateAll">
              <option value="hnsw">HNSW (推荐)</option>
              <option value="flat">Flat / 精确搜索</option>
              <option value="ivf">IVF (大规模)</option>
            </select>
          </div>

          <div class="tech-select-row">
            <label class="tech-select-label">检索策略</label>
            <select class="tech-select" v-model="selRetrieval" @change="updateAll">
              <option value="semantic">纯语义搜索</option>
              <option value="hybrid">混合搜索 (Hybrid)</option>
              <option value="rerank" selected>语义 + 重排序</option>
              <option value="mmr">MMR 多样性检索</option>
            </select>
          </div>

          <div class="tech-select-row">
            <label class="tech-select-label">语言模型</label>
            <select class="tech-select" v-model="selLlm" @change="updateAll">
              <option value="gpt4o">GPT-4o</option>
              <option value="claude35">Claude 3.5 Sonnet</option>
              <option value="gemini">Gemini 1.5 Pro</option>
              <option value="llama3">Llama-3.1 70B</option>
              <option value="qwen">Qwen2.5 72B</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- ═══ MAIN ═══ -->
      <main class="main">
        <!-- PIPELINE OVERVIEW BAR -->
        <div class="pipeline-overview">
          <div
              v-for="(stage, i) in stages"
              :key="i"
              :class="['pipe-step', { active: currentStage === i }]"
              :id="'pipe' + i"
              @click="goTo(i)"
          >
            <div class="pipe-step-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="pipe-step-name">{{ stage.name }}</div>
          </div>
          <template v-for="(stage, i) in stages.slice(0, -1)" :key="'sep-' + i">
            <div class="pipe-sep">›</div>
          </template>
        </div>

        <!-- ═══════════ PANEL 0: 文档导入 ═══════════ -->
        <div class="panel" :class="{ active: currentStage === 0 }" id="panel0">
          <div class="panel-head">
            <div class="panel-head-row">
              <div>
                <div class="panel-num">阶段 01 / 05</div>
                <div class="panel-title">文档导入与分块</div>
                <div class="panel-desc" id="p0-desc">将原始文档解析、清洗，按策略切分为语义单元（Chunks）</div>
              </div>
              <span class="tag tag-blue" id="p0-tag">固定分块 · 512 chars</span>
            </div>
          </div>

          <!-- IO 数据流总览 -->
          <div style="margin-bottom:16px">
            <div class="io-flow">
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">INPUT — 原始文档</span>
                  <span class="io-type-badge">File</span>
                </div>
                <div class="io-body" v-html="p0InputHtml"></div>
              </div>
              <div class="flow-arrow-col">
                <svg class="flow-arrow-svg" viewBox="0 0 40 24" fill="none">
                  <path d="M4 12 H32 M24 5 L32 12 L24 19" stroke="#374151" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flow-arrow-label" id="p0-arrow">分块</div>
              </div>
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">OUTPUT — Chunk 数组</span>
                  <span class="io-type-badge" id="p0-out-type">Chunk[]</span>
                </div>
                <div class="io-body" id="p0-output" v-html="p0OutputHtml"></div>
              </div>
            </div>
          </div>

          <!-- STEP 1: 分块策略选择 -->
          <div class="step-group active-step">
            <div class="step-label" style="color:var(--accent2)">
            <span class="step-num"
                  style="color:var(--accent2);border-color:var(--accent-border);background:var(--accent-bg)">STEP 1</span>
              分块策略对比 — 同一原文，五种切法
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px"
                   id="chunk-compare-grid" v-html="chunkCompareHtml"></div>
              <div style="font-size:10px;color:var(--text3);font-family:var(--mono)">每种颜色 = 一个独立 Chunk ·
                颜色边界 = 切割点 · 点击卡片切换策略
              </div>
            </div>
          </div>

          <!-- STEP 2: Overlap 可视化 -->
          <div class="step-group amber-step">
            <div class="step-label" style="color:var(--amber)">
            <span class="step-num"
                  style="color:var(--amber);border-color:var(--amber-border);background:var(--amber-bg)">STEP 2</span>
              Overlap 重叠区 — 为什么相邻块要共享内容
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="font-size:11px;font-family:var(--mono);color:var(--text3)"
                    id="p0-overlap-label"></span>
              </div>
              <div id="overlap-vis" v-html="overlapHtml"
                   style="font-family:var(--mono);font-size:12px;line-height:1.8;color:var(--text2)"></div>
              <div style="display:flex;gap:16px;margin-top:10px;flex-wrap:wrap">
              <span
                  style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                  style="width:12px;height:8px;background:#3b82f633;border:1px solid #3b82f6;border-radius:2px;display:inline-block"></span>Chunk 1</span>
                <span
                    style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                    style="width:12px;height:8px;background:#10b98133;border:1px solid #10b981;border-radius:2px;display:inline-block"></span>Chunk 2</span>
                <span
                    style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                    style="width:12px;height:8px;background:#8b5cf633;border:1px solid #8b5cf6;border-radius:2px;display:inline-block"></span>重叠区（两个 chunk 共享）</span>
              </div>
            </div>
          </div>

          <!-- STEP 3: 当前策略生成结果 -->
          <div class="step-group green-step">
            <div class="step-label" style="color:var(--green)">
            <span class="step-num"
                  style="color:var(--green);border-color:var(--green-border);background:var(--green-bg)">STEP 3</span>
              当前策略输出 — 实际生成的 Chunk 内容
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div style="font-size:11px;font-family:var(--mono);color:var(--text3)"
                     id="p0-chunk-stats"></div>
              </div>
              <div class="chunk-list" id="chunk-list" v-html="chunkListHtml"></div>
              <div class="grid4" style="margin-top:16px" id="p0-metrics" v-html="p0MetricsHtml"></div>
            </div>
          </div>

          <div class="highlight-box" id="p0-highlight" v-html="p0HighlightHtml"></div>
        </div>

        <!-- ═══════════ PANEL 1: EMBEDDING ═══════════ -->
        <div class="panel" :class="{ active: currentStage === 1 }" id="panel1">
          <div class="panel-head">
            <div class="panel-head-row">
              <div>
                <div class="panel-num">阶段 02 / 05</div>
                <div class="panel-title">向量 Embedding</div>
                <div class="panel-desc" id="p1-desc">将文本块编码为高维稠密向量，捕获语义信息</div>
              </div>
              <span class="tag tag-amber" id="p1-tag">1536 维</span>
            </div>
          </div>

          <!-- IO 数据流总览 -->
          <div style="margin-bottom:16px">
            <div class="io-flow" style="margin-bottom:12px">
              <div class="io-card">
                <div class="io-card-head"><span class="io-card-title">INPUT — 文本块</span><span
                    class="io-type-badge">string</span></div>
                <div class="io-body" id="p1-input" v-html="p1InputHtml"></div>
              </div>
              <div class="flow-arrow-col">
                <svg class="flow-arrow-svg" viewBox="0 0 40 24" fill="none">
                  <path d="M4 12 H32 M24 5 L32 12 L24 19" stroke="#374151" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flow-arrow-label" id="p1-arrow-label">Embed</div>
              </div>
              <div class="io-card">
                <div class="io-card-head"><span class="io-card-title">OUTPUT — 向量</span><span
                    class="io-type-badge" id="p1-out-type">float32[]</span></div>
                <div class="io-body" id="p1-output" v-html="p1OutputHtml"></div>
              </div>
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div class="section-card-title" style="margin-bottom:10px">文本 → Token ID 序列（模型真正的输入）
              </div>
              <div id="token-breakdown" v-html="tokenBreakdownHtml"
                   style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:36px"></div>
              <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:10px">每个色块 = 一个
                Token（子词单元）· 下方数字是词表 ID · 模型处理的是 ID 序列而非原始字符
              </div>
            </div>
          </div>

          <!-- STEP 1: Transformer 推理 -->
          <div class="step-group active-step">
            <div class="step-label" style="color:var(--accent2)">
            <span class="step-num"
                  style="color:var(--accent2);border-color:var(--accent-border);background:var(--accent-bg)">STEP 1</span>
              Transformer 推理 — 生成高维向量表示
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:0">
              <div class="section-card" style="margin-bottom:0">
                <div class="section-card-title">语义向量空间（2D 投影）</div>
                <div style="position:relative;height:240px;background:var(--bg3);border-radius:8px;overflow:hidden">
                  <canvas ref="embedSpaceCanvas" style="width:100%;height:100%;display:block"></canvas>
                  <div
                      style="position:absolute;bottom:8px;right:10px;font-size:9px;font-family:var(--mono);color:var(--text3)">
                    t-SNE 降维示意 · 相似文本距离近
                  </div>
                </div>
                <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap">
                <span
                    style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                    style="width:8px;height:8px;border-radius:50%;background:#3b82f6;display:inline-block"></span>文档 Chunk</span>
                  <span
                      style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                      style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block"></span>当前高亮</span>
                </div>
              </div>
              <div class="section-card" style="margin-bottom:0">
                <div class="section-card-title">维度值分布（前64维）</div>
                <div class="vec-bars" id="vec-bars" v-html="vecBarsHtml" style="height:80px"></div>
                <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:8px"
                     id="vec-desc"></div>
                <div style="margin-top:14px">
                  <div class="section-card-title" style="margin-bottom:8px">模型参数</div>
                  <div class="vec-info" id="p1-model-info" v-html="p1ModelInfoHtml"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: 向量归一化 & 相似度定义 -->
          <div class="step-group amber-step">
            <div class="step-label" style="color:var(--amber)">
            <span class="step-num"
                  style="color:var(--amber);border-color:var(--amber-border);background:var(--amber-bg)">STEP 2</span>
              向量归一化 & 相似度度量 — 如何比较两个向量
            </div>
            <div style="display:grid;grid-template-columns:1fr 200px;gap:16px;align-items:center;margin-bottom:12px">
              <div class="section-card" style="margin-bottom:0">
                <div class="section-card-title" style="margin-bottom:10px">余弦相似度示例（故宫知识库）</div>
                <div style="display:flex;flex-direction:column;gap:8px" id="cosine-pairs"
                     v-html="cosinePairsHtml"></div>
                <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:10px">余弦相似度
                  = 两向量夹角余弦值（1=完全相同，0=正交，-1=相反）· 只看方向，不看长度
                </div>
              </div>
              <div style="position:relative;height:160px;background:var(--bg3);border-radius:8px;overflow:hidden">
                <canvas ref="cosineCanvas" style="width:100%;height:100%;display:block"></canvas>
              </div>
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div class="section-card-title" style="margin-bottom:8px">向量维度样本（前20维）</div>
              <div class="dim-sample" id="dim-sample" v-html="dimSampleHtml"></div>
            </div>
          </div>

          <!-- STEP 3: 深入探索 -->
          <div class="step-group green-step">
            <div class="step-label" style="color:var(--green)">
            <span class="step-num"
                  style="color:var(--green);border-color:var(--green-border);background:var(--green-bg)">STEP 3</span>
              深入理解 — 维度的语义含义 & 聚类效果
            </div>
            <div class="section-card" style="margin-bottom:12px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div class="section-card-title" style="margin-bottom:0">维度语义探索 —
                  点击任意维度查看它捕获的含义
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px" id="dim-click-bars"
                   v-html="dimClickBarsHtml"></div>
              <div id="dim-detail-box"
                   style="background:var(--bg3);border:1px solid var(--accent-border);border-radius:8px;padding:12px;min-height:60px;display:none"
                   :style="{ display: dimDetailVisible ? 'block' : 'none' }">
                <div style="display:flex;align-items:center;gap:12px">
                  <div>
                    <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:4px"
                         id="dim-detail-id">维度 #
                    </div>
                    <div style="font-size:13px;font-family:var(--mono);color:var(--accent2);font-weight:600"
                         id="dim-detail-label">语义含义
                    </div>
                    <div style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-top:4px"
                         id="dim-detail-desc">描述
                    </div>
                  </div>
                  <div style="margin-left:auto;text-align:right">
                    <div style="font-size:10px;font-family:var(--mono);color:var(--text3)">当前值</div>
                    <div style="font-size:20px;font-weight:700;font-family:var(--mono)" id="dim-detail-val">
                      0.000
                    </div>
                  </div>
                </div>
                <div style="margin-top:10px">
                  <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:4px">
                    相似语义的其他 chunk
                  </div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap" id="dim-similar-chunks"
                       v-html="dimSimilarChunksHtml"></div>
                </div>
              </div>
              <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:8px">
                注：维度语义为模拟示例，真实模型维度无法直接解释，但确实编码了语义信息
              </div>
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div class="section-card-title" style="margin-bottom:12px">语义聚类演示 —
                点击不同主题文本，观察在向量空间中的落点
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px" id="preset-text-btns"
                   v-html="presetTextBtnsHtml"></div>
              <div style="position:relative;height:220px;background:var(--bg3);border-radius:8px;overflow:hidden">
                <canvas ref="customEmbedCanvas" style="width:100%;height:100%;display:block"></canvas>
              </div>
              <div id="custom-embed-label"
                   style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-top:8px;min-height:18px"
                   v-html="customEmbedLabelHtml"></div>
              <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:4px">同类主题 →
                向量空间中聚在一起；不同主题 → 相互远离。这正是向量检索能工作的基础。
              </div>
            </div>
          </div>

          <div class="highlight-box" id="p1-highlight" v-html="p1HighlightHtml"></div>
        </div>

        <!-- ═══════════ PANEL 2: 向量索引 ═══════════ -->
        <div class="panel" :class="{ active: currentStage === 2 }" id="panel2">
          <div class="panel-head">
            <div class="panel-head-row">
              <div>
                <div class="panel-num">阶段 03 / 05</div>
                <div class="panel-title">向量索引构建</div>
                <div class="panel-desc" id="p2-desc">将所有向量组织为高效可搜索的索引结构，存入向量数据库</div>
              </div>
              <span class="tag tag-purple" id="p2-tag">HNSW · Pinecone</span>
            </div>
          </div>

          <!-- IO 数据流总览 -->
          <div style="margin-bottom:16px">
            <div class="io-flow">
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">INPUT — 向量集合</span>
                  <span class="io-type-badge">Vector[]</span>
                </div>
                <div class="io-body" id="p2-input" v-html="p2InputHtml"></div>
              </div>
              <div class="flow-arrow-col">
                <svg class="flow-arrow-svg" viewBox="0 0 40 24" fill="none">
                  <path d="M4 12 H32 M24 5 L32 12 L24 19" stroke="#374151" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flow-arrow-label" id="p2-arrow-label">索引</div>
              </div>
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">OUTPUT — 索引元数据</span>
                  <span class="io-type-badge">IndexInfo</span>
                </div>
                <div class="io-body" id="p2-output" v-html="p2OutputHtml"></div>
              </div>
            </div>
          </div>

          <!-- STEP 1: 索引算法 -->
          <div class="step-group active-step">
            <div class="step-label" style="color:var(--accent2)">
            <span class="step-num"
                  style="color:var(--accent2);border-color:var(--accent-border);background:var(--accent-bg)">STEP 1</span>
              图结构构建 — 索引算法可视化
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">
              <div class="section-card" style="margin-bottom:0">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                  <div class="section-card-title" style="margin-bottom:0" id="p2-vis-title">HNSW
                    检索路径动画
                  </div>
                  <button @click="replayIndexAnim"
                          style="font-size:10px;font-family:var(--mono);padding:3px 10px;border-radius:4px;border:1px solid var(--border2);background:var(--bg3);color:var(--text2);cursor:pointer">
                    ▶ 重放
                  </button>
                </div>
                <div class="index-canvas-wrap" style="height:240px">
                  <canvas ref="indexCanvas"></canvas>
                </div>
                <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:8px"
                     id="p2-anim-desc">查询向量进入索引，从顶层开始逐层缩小搜索范围
                </div>
              </div>
              <div class="section-card" style="margin-bottom:0">
                <div class="section-card-title">索引性能指标</div>
                <div class="index-stats" id="index-stats" v-html="indexStatsHtml"></div>
              </div>
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div class="section-card-title" style="margin-bottom:12px">三种索引算法 · 工作原理对比</div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px" id="algo-cards"
                   v-html="algoCardsHtml"></div>
            </div>
          </div>

          <!-- STEP 2: 持久化 & 性能 -->
          <div class="step-group purple-step">
            <div class="step-label" style="color:var(--purple)">
            <span class="step-num"
                  style="color:var(--purple);border-color:var(--purple-border);background:var(--purple-bg)">STEP 2</span>
              持久化存储 — 指标与技术说明
            </div>
            <div class="grid4" id="p2-metrics" v-html="p2MetricsHtml"></div>
            <div class="highlight-box" id="p2-highlight" v-html="p2HighlightHtml"></div>
          </div>

          <!-- STEP 3: 数据库选型 -->
          <div class="step-group amber-step">
            <div class="step-label" style="color:var(--amber)">
            <span class="step-num"
                  style="color:var(--amber);border-color:var(--amber-border);background:var(--amber-bg)">STEP 3</span>
              向量数据库选型 — 根据你的场景决策
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div id="db-decision-tree" v-html="dbDecisionTreeHtml"></div>
              <div id="db-recommendation"
                   style="display:none;margin-top:14px;padding:14px;background:var(--green-bg);border:1px solid var(--green-border);border-radius:8px"
                   :style="{ display: dbRecommendVisible ? 'block' : 'none' }">
                <div
                    style="font-size:11px;font-family:var(--mono);color:var(--green);margin-bottom:6px;font-weight:600">
                  ✓ 推荐方案
                </div>
                <div id="db-rec-content" v-html="dbRecContentHtml"
                     style="font-size:12px;font-family:var(--mono);color:var(--text2);line-height:1.7"></div>
              </div>
              <button @click="resetDbDecision"
                      style="margin-top:10px;font-size:11px;font-family:var(--mono);padding:5px 12px;border-radius:5px;border:1px solid var(--border2);background:transparent;color:var(--text3);cursor:pointer">
                ↺ 重新选择
              </button>
            </div>
          </div>
        </div>

        <!-- ═══════════ PANEL 3: 检索 ═══════════ -->
        <div class="panel" :class="{ active: currentStage === 3 }" id="panel3">
          <div class="panel-head">
            <div class="panel-head-row">
              <div>
                <div class="panel-num">阶段 04 / 05</div>
                <div class="panel-title">语义检索</div>
                <div class="panel-desc" id="p3-desc">将查询编码为向量，在索引中搜索最相似的文档块</div>
              </div>
              <span class="tag tag-green" id="p3-tag">Top-5 · 语义搜索</span>
            </div>
          </div>

          <!-- IO 数据流总览 -->
          <div style="margin-bottom:16px">
            <div class="io-flow">
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">INPUT — 用户查询</span>
                  <span class="io-type-badge">Query</span>
                </div>
                <div class="io-body" id="p3-input" v-html="p3InputHtml"></div>
              </div>
              <div class="flow-arrow-col">
                <svg class="flow-arrow-svg" viewBox="0 0 40 24" fill="none">
                  <path d="M4 12 H32 M24 5 L32 12 L24 19" stroke="#374151" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flow-arrow-label" id="p3-arrow-label">检索</div>
              </div>
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">OUTPUT — 相关文档</span>
                  <span class="io-type-badge">Result[]</span>
                </div>
                <div class="io-body" id="p3-output" v-html="p3OutputHtml"></div>
              </div>
            </div>
          </div>

          <!-- STEP 1: ANN 搜索 -->
          <div class="step-group active-step">
            <div class="step-label" style="color:var(--accent2)">
            <span class="step-num"
                  style="color:var(--accent2);border-color:var(--accent-border);background:var(--accent-bg)">STEP 1</span>
              ANN 近似搜索 — 向量空间中找最近邻
            </div>
            <div class="section-card" style="margin-bottom:12px">
              <div class="section-card-title" id="p3-results-title">检索结果（按相关度排序）</div>
              <div class="result-list" id="result-list" v-html="resultListHtml"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="section-card" style="margin-bottom:0">
                <div class="section-card-title">向量空间检索过程（2D 投影）</div>
                <div style="position:relative;height:240px;background:var(--bg3);border-radius:8px;overflow:hidden">
                  <canvas ref="retrievalCanvas" style="width:100%;height:100%;display:block"></canvas>
                </div>
                <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap">
                <span
                    style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                    style="width:8px;height:8px;border-radius:50%;background:#3b82f6;display:inline-block"></span>文档向量</span>
                  <span
                      style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                      style="width:10px;height:10px;background:#f43f5e;border-radius:2px;transform:rotate(45deg);display:inline-block"></span>查询向量</span>
                  <span
                      style="font-size:10px;font-family:var(--mono);color:var(--text3);display:flex;align-items:center;gap:4px"><span
                      style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block"></span>Top-K 命中</span>
                </div>
              </div>
              <div class="section-card" style="margin-bottom:0">
                <div class="section-card-title">相似度得分分布</div>
                <div id="score-chart" v-html="scoreChartHtml"
                     style="display:flex;flex-direction:column;gap:10px;padding:4px 0"></div>
                <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
                  <div class="section-card-title" style="margin-bottom:8px">检索策略对比</div>
                  <div id="algo-compare" v-html="algoCompareHtml"
                       style="display:flex;flex-direction:column;gap:6px"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: 召回 → 精排 -->
          <div class="step-group purple-step">
            <div class="step-label" style="color:var(--purple)">
            <span class="step-num"
                  style="color:var(--purple);border-color:var(--purple-border);background:var(--purple-bg)">STEP 2</span>
              两阶段检索 — 粗召回 → Cross-encoder 精排
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
                <div style="font-size:11px;font-family:var(--mono);color:var(--text2)">Top-20 粗召回候选 → Top-5
                  精排结果
                </div>
                <span style="font-size:10px;font-family:var(--mono);color:var(--text3)"
                      id="two-stage-desc"></span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 40px 1fr;gap:0;align-items:start">
                <div>
                  <div
                      style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span
                        style="background:var(--bg4);padding:1px 6px;border-radius:3px;color:var(--accent2)">阶段①</span>
                    向量 ANN 粗召回（Top-20）
                  </div>
                  <div id="recall-pool" v-html="recallPoolHtml"
                       style="display:flex;flex-direction:column;gap:3px;max-height:300px;overflow-y:auto"></div>
                </div>
                <div
                    style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:60px;gap:4px">
                  <div style="font-size:18px;color:var(--purple)">→</div>
                  <div
                      style="font-size:8px;font-family:var(--mono);color:var(--text3);text-align:center;writing-mode:vertical-lr;transform:rotate(180deg)">
                    精排
                  </div>
                </div>
                <div>
                  <div
                      style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span
                        style="background:var(--purple-bg);padding:1px 6px;border-radius:3px;color:var(--purple)">阶段②</span>
                    Cross-encoder 精排（Top-5）
                  </div>
                  <div id="rerank-results" v-html="rerankResultsHtml"
                       style="display:flex;flex-direction:column;gap:3px"></div>
                </div>
              </div>
              <div style="margin-top:10px;font-size:10px;color:var(--text3);font-family:var(--mono)">↑ 橙色 =
                精排后排名上升 · — 蓝色 = 排名不变 · 灰色 = 被过滤的候选
              </div>
            </div>
          </div>

          <!-- STEP 3: 混合检索 -->
          <div class="step-group amber-step">
            <div class="step-label" style="color:var(--amber)">
            <span class="step-num"
                  style="color:var(--amber);border-color:var(--amber-border);background:var(--amber-bg)">STEP 3</span>
              混合检索 — BM25 关键词 + 向量语义 → RRF 融合
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div style="display:grid;grid-template-columns:1fr 28px 1fr 28px 1fr;gap:0;align-items:start">
                <div>
                  <div
                      style="font-size:10px;font-family:var(--mono);color:var(--amber);margin-bottom:8px;font-weight:600">
                    BM25 关键词排名
                  </div>
                  <div id="bm25-results" v-html="bm25ResultsHtml"
                       style="display:flex;flex-direction:column;gap:4px"></div>
                  <div style="margin-top:8px;font-size:9px;font-family:var(--mono);color:var(--text3)">
                    精确匹配词频，偏好含查询词的文档
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;padding-top:40px;gap:2px">
                  <div style="font-size:16px;color:var(--text3)">+</div>
                </div>
                <div>
                  <div
                      style="font-size:10px;font-family:var(--mono);color:var(--accent2);margin-bottom:8px;font-weight:600">
                    向量语义排名
                  </div>
                  <div id="vector-results" v-html="vectorResultsHtml"
                       style="display:flex;flex-direction:column;gap:4px"></div>
                  <div style="margin-top:8px;font-size:9px;font-family:var(--mono);color:var(--text3)">
                    余弦相似度，捕获语义相关性
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;padding-top:40px;gap:2px">
                  <div style="font-size:16px;color:var(--green)">→</div>
                </div>
                <div>
                  <div
                      style="font-size:10px;font-family:var(--mono);color:var(--green);margin-bottom:8px;font-weight:600">
                    RRF 融合结果
                  </div>
                  <div id="rrf-results" v-html="rrfResultsHtml"
                       style="display:flex;flex-direction:column;gap:4px"></div>
                  <div style="margin-top:8px;font-size:9px;font-family:var(--mono);color:var(--text3)">score=Σ
                    1/(k+rank), k=60
                  </div>
                </div>
              </div>
              <div id="hybrid-note" v-html="hybridNoteHtml"
                   style="margin-top:12px;padding:8px 12px;background:var(--bg3);border-radius:6px;font-size:11px;font-family:var(--mono);color:var(--text2)"></div>
            </div>
          </div>

          <!-- STEP 4: 质量控制 -->
          <div class="step-group green-step">
            <div class="step-label" style="color:var(--green)">
            <span class="step-num"
                  style="color:var(--green);border-color:var(--green-border);background:var(--green-bg)">STEP 4</span>
              质量控制 — 阈值过滤 & 查询质量分析
            </div>
            <div class="section-card" style="margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span style="font-size:11px;font-family:var(--mono);color:var(--text3)">min_score 阈值</span>
                <input type="range" v-model="scoreThreshold" @input="updateThreshold" min="0" max="100" value="0"
                       step="5" style="flex:1">
                <span
                    style="font-size:13px;font-family:var(--mono);font-weight:600;color:var(--accent2);min-width:36px;text-align:right"
                    id="threshold-val">{{ (scoreThreshold / 100).toFixed(2) }}</span>
              </div>
              <div id="threshold-result-list" v-html="thresholdResultHtml"
                   style="display:flex;flex-direction:column;gap:6px"></div>
              <div id="threshold-warn"
                   style="display:none;margin-top:10px;padding:8px 12px;background:var(--coral-bg);border:1px solid var(--coral-border);border-radius:6px;font-size:11px;font-family:var(--mono);color:var(--coral)"
                   :style="{ display: thresholdWarnVisible ? 'block' : 'none' }">
                ⚠ 阈值过高导致所有结果被过滤，LLM 将无上下文可参考，容易产生幻觉
              </div>
            </div>
            <div class="section-card" style="margin-bottom:12px">
              <div class="section-card-title" style="margin-bottom:12px">查询质量对比 — 精准查询 vs 模糊查询</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <div
                      style="font-size:11px;font-family:var(--mono);color:var(--green);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span
                        style="width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block"></span>精准查询
                    — 高相关度
                  </div>
                  <div id="good-query-box"
                       style="background:var(--bg3);border:1px solid var(--green-border);border-radius:6px;padding:10px;font-size:11px;font-family:var(--mono);color:var(--text2);margin-bottom:8px"
                       v-html="goodQueryBoxHtml"></div>
                  <div id="good-results" v-html="goodResultsHtml"
                       style="display:flex;flex-direction:column;gap:5px"></div>
                </div>
                <div>
                  <div
                      style="font-size:11px;font-family:var(--mono);color:var(--coral);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span
                        style="width:6px;height:6px;border-radius:50%;background:var(--coral);display:inline-block"></span>模糊查询
                    — 低相关度 / 偏移
                  </div>
                  <div id="bad-query-box"
                       style="background:var(--bg3);border:1px solid var(--coral-border);border-radius:6px;padding:10px;font-size:11px;font-family:var(--mono);color:var(--text2);margin-bottom:8px"
                       v-html="badQueryBoxHtml"></div>
                  <div id="bad-results" v-html="badResultsHtml"
                       style="display:flex;flex-direction:column;gap:5px"></div>
                </div>
              </div>
              <div style="margin-top:10px;font-size:10px;color:var(--text3);font-family:var(--mono)">相同查询 ·
                不同查询措辞 → 结果差异显著 · 查询改写（Query Rewriting）可有效改善
              </div>
            </div>
            <div class="highlight-box" id="p3-highlight" v-html="p3HighlightHtml"></div>
          </div>
        </div>

        <!-- ═══════════ PANEL 4: 增强生成 ═══════════ -->
        <div class="panel" :class="{ active: currentStage === 4 }" id="panel4">
          <div class="panel-head">
            <div class="panel-head-row">
              <div>
                <div class="panel-num">阶段 05 / 05</div>
                <div class="panel-title">Prompt 构建与增强生成</div>
                <div class="panel-desc" id="p4-desc">将检索结果注入 Prompt，发送给 LLM 生成最终答案</div>
              </div>
              <span class="tag tag-coral" id="p4-tag">GPT-4o · 标准模板</span>
            </div>
          </div>

          <!-- IO 数据流总览 -->
          <div style="margin-bottom:16px">
            <div class="io-flow">
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">INPUT — 检索结果 + 查询</span>
                  <span class="io-type-badge">RAGInput</span>
                </div>
                <div class="io-body" id="p4-input" v-html="p4InputHtml"></div>
              </div>
              <div class="flow-arrow-col">
                <svg class="flow-arrow-svg" viewBox="0 0 40 24" fill="none">
                  <path d="M4 12 H32 M24 5 L32 12 L24 19" stroke="#374151" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flow-arrow-label" id="p4-arrow-label">LLM</div>
              </div>
              <div class="io-card">
                <div class="io-card-head">
                  <span class="io-card-title">OUTPUT — LLM 答案</span>
                  <span class="io-type-badge" id="p4-out-type">Response</span>
                </div>
                <div class="io-body" id="p4-output" v-html="p4OutputHtml"></div>
              </div>
            </div>
          </div>

          <!-- STEP 1: Prompt 结构 -->
          <div class="step-group active-step">
            <div class="step-label" style="color:var(--accent2)">
            <span class="step-num"
                  style="color:var(--accent2);border-color:var(--accent-border);background:var(--accent-bg)">STEP 1</span>
              Prompt 结构 — 系统提示词 · 检索上下文 · 用户问题
            </div>
            <div class="prompt-builder" id="prompt-builder">
              <div class="prompt-tabs">
                <div :class="['prompt-tab', { active: promptTab === 0 }]" @click="promptTab = 0">系统提示词</div>
                <div :class="['prompt-tab', { active: promptTab === 1 }]" @click="promptTab = 1">检索上下文</div>
                <div :class="['prompt-tab', { active: promptTab === 2 }]" @click="promptTab = 2">完整 Prompt</div>
                <div :class="['prompt-tab', { active: promptTab === 3 }]" @click="promptTab = 3">API 请求体</div>
              </div>
              <div class="prompt-tab-content" :class="{ active: promptTab === 0 }" id="ptab0">
                <div class="prompt-block p-sys" id="prompt-sys" v-html="promptSysHtml"></div>
              </div>
              <div class="prompt-tab-content" :class="{ active: promptTab === 1 }" id="ptab1">
                <div class="prompt-block p-ctx" id="prompt-ctx" v-html="promptCtxHtml"></div>
              </div>
              <div class="prompt-tab-content" :class="{ active: promptTab === 2 }" id="ptab2">
                <div class="prompt-block" id="prompt-full" v-html="promptFullHtml"></div>
              </div>
              <div class="prompt-tab-content" :class="{ active: promptTab === 3 }" id="ptab3">
                <div class="prompt-block" id="prompt-api" v-html="promptApiHtml"></div>
              </div>
            </div>
          </div>

          <!-- STEP 2: LLM 推理 & 答案生成 -->
          <div class="step-group amber-step">
            <div class="step-label" style="color:var(--amber)">
            <span class="step-num"
                  style="color:var(--amber);border-color:var(--amber-border);background:var(--amber-bg)">STEP 2</span>
              LLM 推理 & 答案生成
            </div>
            <div class="final-answer">
              <div class="final-answer-head">
                <div class="final-answer-dot"></div>
                <div class="final-answer-title" id="p4-llm-name">GPT-4o 生成答案</div>
              </div>
              <div id="final-answer-body" v-html="finalAnswerHtml"></div>
            </div>
            <div class="grid4" id="p4-metrics" v-html="p4MetricsHtml"></div>
          </div>

          <!-- STEP 3: RAG 价值对比 & 错误分析 -->
          <div class="step-group green-step">
            <div class="step-label" style="color:var(--green)">
            <span class="step-num"
                  style="color:var(--green);border-color:var(--green-border);background:var(--green-bg)">STEP 3</span>
              价值验证 — 有 RAG vs 无 RAG · 常见错误诊断
            </div>
            <div class="section-card" style="margin-bottom:12px">
              <div class="section-card-title" style="margin-bottom:14px">有 RAG vs 无 RAG — 大模型输出对比</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                <div>
                  <div
                      style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span
                        style="width:6px;height:6px;border-radius:50%;background:var(--text3);display:inline-block"></span>纯
                    LLM（无检索 · 依赖参数记忆）
                  </div>
                  <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px">
                    <div id="no-rag-answer" v-html="noRagAnswerHtml"
                         style="font-size:12px;font-family:var(--mono);color:var(--text2);line-height:1.8"></div>
                    <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
                      <div id="no-rag-problems" v-html="noRagProblemsHtml"
                           style="display:flex;flex-direction:column;gap:5px"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div
                      style="font-size:11px;font-family:var(--mono);color:var(--green);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                    <span
                        style="width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block"></span>RAG
                    增强（基于检索文献 · 可溯源）
                  </div>
                  <div
                      style="background:var(--bg3);border:1px solid var(--green-border);border-radius:8px;padding:14px">
                    <div id="rag-answer" v-html="ragAnswerHtml"
                         style="font-size:12px;font-family:var(--mono);color:var(--text2);line-height:1.8"></div>
                    <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--green-border)">
                      <div id="rag-benefits" v-html="ragBenefitsHtml"
                           style="display:flex;flex-direction:column;gap:5px"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="section-card" style="margin-bottom:0">
              <div class="section-card-title" style="margin-bottom:14px">常见错误模式 — RAG 链路中的典型问题</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" id="error-patterns-grid"
                   v-html="errorPatternsHtml"></div>
              <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-top:10px">
                诊断方向：先检查检索结果质量 → 再看 Prompt 结构 → 最后看 LLM 选型与温度参数
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- AUTO-TRACE OVERLAY -->
      <div id="auto-trace-overlay"
           style="display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--purple-border);border-radius:12px;padding:16px 24px;z-index:1000;min-width:360px;box-shadow:0 8px 32px rgba(0,0,0,0.5)"
           :style="{ display: autoTraceVisible ? 'block' : 'none' }">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:12px;font-family:var(--mono);color:var(--purple);font-weight:600">▶ 自动演示模式</div>
          <button @click="stopAutoTrace"
                  style="font-size:11px;font-family:var(--mono);padding:3px 10px;border-radius:4px;border:1px solid var(--border2);background:transparent;color:var(--text3);cursor:pointer">
            ■ 停止
          </button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:10px" id="trace-stage-dots" v-html="traceStageDotsHtml"></div>
        <div style="height:3px;background:var(--bg4);border-radius:2px;overflow:hidden">
          <div id="trace-progress-bar"
               style="height:100%;background:var(--purple);border-radius:2px;transition:width 0.3s linear;width:0%"
               :style="{ width: traceProgress + '%' }"></div>
        </div>
        <div style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-top:8px" id="trace-status-text">
          {{ traceStatusText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import configs
import { EMBED_CONFIG } from './config/embed.js';
import { CHUNK_CONFIG } from './config/chunk.js';
import { INDEX_CONFIG } from './config/index-algo.js';
import { DB_CONFIG, DB_QUESTIONS, DB_RECS } from './config/db.js';
import { RETRIEVAL_CONFIG } from './config/retrieval.js';
import { LLM_CONFIG } from './config/llm.js';

// Import data
import { CHUNK_TEXTS_MAP, CHUNK_TOKENS, RESULT_TEXTS, DIM_SEMANTICS, PRESET_TEXTS, RECALL_POOL, RERANK_ORDER } from './data/index.js';

// Import canvas utils
import { drawEmbedSpace, drawCosineVis, drawIndexCanvas, drawRetrievalCanvas, drawCustomEmbedMulti } from './utils/canvas.js';

// Stage definitions
const STAGES = [
  {name: '文档导入', sub: '解析 · 清洗 · 分块', icon: '📄', iconBg: 'var(--accent-bg)', iconColor: 'var(--accent2)'},
  {name: 'Embedding', sub: '语义编码 · 向量化', icon: '⚡', iconBg: 'var(--amber-bg)', iconColor: 'var(--amber)'},
  {name: '向量索引', sub: 'HNSW · IVF · 存储', icon: '🗄️', iconBg: 'var(--purple-bg)', iconColor: 'var(--purple)'},
  {name: '检索', sub: 'ANN 搜索 · 重排序', icon: '🔍', iconBg: 'var(--green-bg)', iconColor: 'var(--green)'},
  {name: '增强生成', sub: 'Prompt · LLM · 答案', icon: '✨', iconBg: 'var(--coral-bg)', iconColor: 'var(--coral)'},
];

const TRACE_STAGES = ['文档导入', 'Embedding', '向量索引', '检索', '增强生成'];
const TRACE_DURATION = 3500;

export default {
  name: 'RagVisualizer',
  data() {
    return {
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
      // Internal state
      _timers: [],
      _indexAnimFrame: null,
      _autoTraceTimer: null,
      _activePresetIdx: -1,
      _revealedPresets: new Set(),
      _dbAnswers: {},
      _dbCurrentQ: 'q1',
      stages: STAGES,
      // Config maps (imported)
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
      TRACE_STAGES,
      TRACE_DURATION,
    };
  },
  mounted() {
    this.updateAll();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this._clearAll();
    if (this._indexAnimFrame) {
      cancelAnimationFrame(this._indexAnimFrame);
    }
    if (this._autoTraceTimer) {
      cancelAnimationFrame(this._autoTraceTimer);
    }
  },
  methods: {
    toggleBg() {
      this.isWhiteBg = !this.isWhiteBg;
    },
    getState() {
      return {
        chunk: this.selChunk,
        embed: this.selEmbed,
        db: this.selDb,
        index: this.selIndex,
        retrieval: this.selRetrieval,
        llm: this.selLlm,
        query: this.globalQuery || '太和殿有多高，有哪些历史典故？',
      };
    },
    _setTimeout(fn, ms) {
      const id = setTimeout(fn, ms);
      this._timers.push(id);
      return id;
    },
    _clearAll() {
      this._timers.forEach(clearTimeout);
      this._timers.length = 0;
    },
    goTo(i) {
      this._clearAll();
      if (this._indexAnimFrame) {
        cancelAnimationFrame(this._indexAnimFrame);
        this._indexAnimFrame = null;
      }
      this.currentStage = i;
      const s = this.getState();
      this.$nextTick(() => {
        if (i === 1) {
          this.drawEmbedSpace(this.EMBED_CONFIG[s.embed].seed);
          this.drawCosineVis(this.EMBED_CONFIG[s.embed].seed);
        }
        if (i === 2) this.drawIndexCanvas(s.index);
        if (i === 3) this.drawRetrievalCanvas(this.RETRIEVAL_CONFIG[s.retrieval].scores, s.retrieval);
      });
    },
    handleResize() {
      const s = this.getState();
      if (this.currentStage === 1) {
        this.drawEmbedSpace(this.EMBED_CONFIG[s.embed].seed);
        this.drawCosineVis(this.EMBED_CONFIG[s.embed].seed);
      }
      if (this.currentStage === 2) this.drawIndexCanvas(s.index);
      if (this.currentStage === 3) this.drawRetrievalCanvas(this.RETRIEVAL_CONFIG[s.retrieval].scores, s.retrieval);
    },
    updateAll() {
      const s = this.getState();
      this.renderPanel0(s);
      this.renderOverlapVis(this.CHUNK_CONFIG[s.chunk]);
      this._activePresetIdx = -1;
      this._revealedPresets = new Set();
      this.renderPanel1(s);
      this.renderDimClickBars(this.EMBED_CONFIG[s.embed].seed);
      this.renderPresetButtons();
      this.renderPanel2(s);
      this.renderDbDecisionTree();
      this.renderPanel3(s);
      this.renderTwoStageRetrieval(s.retrieval);
      this.renderHybridSearch(s.retrieval);
      this.updateThreshold();
      this.renderBadCaseContrast(s);
      this.renderPanel4(s);
      this.renderRagComparison(s);
      this.renderErrorPatterns();
      this.$nextTick(() => {
        this.drawIndexCanvas(s.index);
        if (this.currentStage === 1) {
          this.drawEmbedSpace(this.EMBED_CONFIG[s.embed].seed);
          this.drawCosineVis(this.EMBED_CONFIG[s.embed].seed);
          this.drawCustomEmbedMulti();
        }
        if (this.currentStage === 3) this.drawRetrievalCanvas(this.RETRIEVAL_CONFIG[s.retrieval].scores, s.retrieval);
      });
    },
    // Panel 0 render
    renderPanel0(s) {
      const cc = this.CHUNK_CONFIG[s.chunk];
      const chunks = this.CHUNK_TEXTS_MAP[s.chunk] || this.CHUNK_TEXTS_MAP.paragraph;
      const chunkCount = chunks.length;

      this.p0InputHtml = `{
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

      this.p0OutputHtml = `<span class="c-cmt">// Array<Chunk>, length: ${chunkCount}</span>\n[\n` +
          chunks.map((t, i) => `  {\n    <span class="c-key">"id"</span>: <span class="c-str">"chunk_00${i + 1}"</span>,\n    <span class="c-key">"chars"</span>: <span class="c-num">${t.length}</span>,\n    <span class="c-key">"overlap"</span>: <span class="c-num">${cc.overlap}</span>,\n    <span class="c-key">"page"</span>: <span class="c-num">${i * 2 + 1}</span>\n  }`).join(',\n') + '\n]';

      // Chunk comparison grid
      const SOURCE = '故宫，正式名称为紫禁城，位于北京市中心，是中国明清两代的皇家宫殿。故宫始建于明朝永乐四年（1406年），历时十四年建成，于永乐十八年（1420年）正式启用。故宫占地面积约72万平方米，建筑面积约15万平方米，共有宫殿七十余座。太和殿俗称金銮殿，是故宫中最大的殿宇，殿高35.05米，面积2377平方米。故宫博物院成立于1925年，现已收藏文物超过180万件。';
      const strategies = [
        {
          key: 'fixed',
          name: '固定大小',
          color: '#3b82f6',
          desc: '每 80 字强制切断，不管语义边界',
          cuts: [80, 160, 240, 320, 400],
          badge: '最简单'
        },
        {
          key: 'paragraph',
          name: '段落分割',
          color: '#06b6d4',
          desc: '以自然段（双换行/句号+换行）为切割单元',
          cuts: [SOURCE.indexOf('。故宫始建') + 1, SOURCE.indexOf('。故宫占地') + 1, SOURCE.indexOf('。太和殿') + 1, SOURCE.indexOf('。故宫博物院') + 1].filter(c => c > 0),
          badge: '自然段'
        },
        {
          key: 'sentence',
          name: '句子分割',
          color: '#10b981',
          desc: '按句号、问号等标点切割',
          cuts: [SOURCE.indexOf('。', 10) + 1, SOURCE.indexOf('。', SOURCE.indexOf('。', 10) + 1) + 1, SOURCE.indexOf('。', SOURCE.indexOf('米', 130)) + 1, SOURCE.indexOf('。', SOURCE.indexOf('平方米', 200)) + 1].filter(Boolean),
          badge: '常用'
        },
        {
          key: 'semantic',
          name: '语义分块',
          color: '#8b5cf6',
          desc: '检测话题转折点切割（NLP）',
          cuts: [SOURCE.indexOf('故宫占地'), SOURCE.indexOf('太和殿'), SOURCE.indexOf('故宫博物院')],
          badge: '效果好'
        },
        {
          key: 'recursive',
          name: '递归分割',
          color: '#f59e0b',
          desc: '段落→句子→字符，优先保留完整段落',
          cuts: [SOURCE.indexOf('故宫占地'), SOURCE.indexOf('故宫博物院')],
          badge: '平衡'
        },
      ];

      this.chunkCompareHtml = strategies.map(st => {
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

      // Chunk list
      this.chunkListHtml = chunks.map((t, i) => {
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

      this.p0MetricsHtml = [
        ['文档总字符', '12,680', ''],
        ['生成块数量', chunkCount, 'accent'],
        ['平均块大小', Math.round(chunks.reduce((s, t) => s + t.length, 0) / chunkCount) + ' chars', ''],
        ['重叠率', cc.overlap > 0 ? Math.round(cc.overlap / (chunks[0]?.length || 300) * 100) + '%' : '无重叠', ''],
      ].map(([l, v, c]) => `<div class="metric-card"><div class="metric-label">${l}</div><div class="metric-val ${c}">${v}</div></div>`).join('');

      this.p0HighlightHtml = `<strong>对比说明：</strong> 上方卡片展示同一段故宫原文在不同策略下的切割位置，竖线为切割点，不同颜色代表不同 chunk。点击任意卡片可切换策略，下方"当前策略生成的 Chunks"会实时更新。<br>` +
          `<strong>当前（${cc.name}）：</strong>` +
          (s.chunk === 'fixed' ? '每 512 字强制切断，实现最简单速度最快，但容易在句子中间截断，损失语义完整性——注意块内容被截断的位置。' :
              s.chunk === 'paragraph' ? '以自然段落为切割单元，每个自然段是一个独立 chunk，无重叠。段落边界天然对应语义主题切换，非常适合结构清晰的文档。' :
                  s.chunk === 'semantic' ? '用 NLP 模型检测话题转折点（如从"历史沿革"切换到"建筑规模"），语义边界最准确，块大小不均匀，但内容最连贯。' :
                      s.chunk === 'sentence' ? '以句号/问号/感叹号为切割边界，每个 chunk 是完整的若干句话，粒度最细，适合精确事实型 QA。' :
                          '按段落→句子→字符三级优先级递归切割，在长度约束下尽量保留最完整的语义单元，是 LangChain 的默认策略。');
    },
    selectChunk(key) {
      this.selChunk = key;
      this.updateAll();
    },
    selectIndex(key) {
      this.selIndex = key;
      this.updateAll();
    },
    renderOverlapVis(cc) {
      const src = '故宫，正式名称为紫禁城，位于北京市中心，是中国明清两代的皇家宫殿。故宫始建于明朝永乐四年（1406年），历时十四年建成，于永乐十八年（1420年）正式启用。故宫占地面积约72万平方米。';
      const sz = Math.min(120, src.length / 2 | 0);
      const ov = Math.round(sz * cc.overlap / cc.size);
      const c1 = src.slice(0, sz);
      const overlap = src.slice(sz - ov, sz);
      const c2 = src.slice(sz - ov, sz + sz - ov);
      this.overlapHtml = `
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
    },
    // Panel 1 render
    renderPanel1(s) {
      const ec = this.EMBED_CONFIG[s.embed];
      const cc = this.CHUNK_CONFIG[s.chunk];
      const chunkIdx = 0;
      const pseudoTokens = this.CHUNK_TOKENS[chunkIdx];
      const tokenColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899'];

      this.p1InputHtml = `<span class="c-cmt">// Chunk 文本（示例）</span>\n<span class="c-str">"${this.CHUNK_TEXTS_MAP.paragraph[0].substring(0, 120)}..."</span>\n\n<span class="c-key">length</span>: <span class="c-num">${cc.size}</span> chars\n<span class="c-key">model</span>: <span class="c-str">"${ec.name}"</span>`;

      const sampleVecs = Array.from({length: 12}, (_, i) => ((Math.sin(i * 7.3 + ec.seed * 2.1) * 0.8)).toFixed(6));
      this.p1OutputHtml = `<span class="c-cmt">// float32[${ec.dim}]</span>\n[\n  <span class="c-num">${sampleVecs.slice(0, 6).join(',\n  ')}</span>,\n  <span class="c-cmt">  // ...${ec.dim} dims total</span>\n  <span class="c-num">${sampleVecs.slice(6).join(',\n  ')}</span>,\n  <span class="c-cmt">  // ...</span>\n]`;

      this.tokenBreakdownHtml = pseudoTokens.map((tk, i) =>
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
      this.vecBarsHtml = bars.join('');

      this.p1ModelInfoHtml = [
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
      this.dimSampleHtml = dimVals.join('');

      this.p1HighlightHtml = `<strong>技术说明：</strong> ${ec.name} 将文本通过 Transformer 编码为 ${ec.dim} 维向量，每个维度都捕获了语义的某个抽象特征。` +
          (s.embed === 'te3s' ? '维度 1536，性能与成本平衡最佳，推荐大多数场景首选。' :
              s.embed === 'te3l' ? '维度 3072，语义表达力更强，适合高精度要求场景，存储成本约 2×。' :
                  s.embed === 'bge' ? 'BAAI 开源，中英双语效果出众，可自托管完全免费，延迟低。' :
                      s.embed === 'e5' ? '支持 instruction prefix 引导不同任务，泛化能力强。' :
                          'Jina v3 支持 Task LoRA，同一模型适配检索/分类/聚类多种任务。');

      this.cosinePairsHtml = [
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
    },
    renderDimClickBars(seed) {
      this.dimClickBarsHtml = this.DIM_SEMANTICS.map((d, i) => {
        const val = Math.abs(Math.sin(d.id * 0.73 + seed * 0.31) * 0.7 + 0.2);
        const pct = Math.round(val * 100);
        const color = val > 0.6 ? '#3b82f6' : val > 0.4 ? '#8b5cf6' : '#4a5568';
        return `<div onclick="this.__vue__.showDimDetail(${i},${seed.toFixed(2)})" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 6px;border-radius:6px;border:1px solid transparent;transition:all 0.15s" id="dimbar-${i}">
          <div style="width:28px;height:${Math.max(8, pct * 0.6)}px;background:${color};border-radius:3px;transition:height 0.3s ease"></div>
          <div style="font-size:8px;font-family:var(--mono);color:var(--text3);white-space:nowrap">D${d.id}</div>
        </div>`;
      }).join('');
    },
    showDimDetail(idx, seed) {
      const d = this.DIM_SEMANTICS[idx];
      const val = Math.abs(Math.sin(d.id * 0.73 + seed * 0.31) * 0.7 + 0.2);
      this.dimDetailVisible = true;
      this.$nextTick(() => {
        const idEl = document.getElementById('dim-detail-id');
        const labelEl = document.getElementById('dim-detail-label');
        const descEl = document.getElementById('dim-detail-desc');
        const valEl = document.getElementById('dim-detail-val');
        if (idEl) idEl.textContent = `维度 #${d.id} / 1536`;
        if (labelEl) labelEl.textContent = d.label;
        if (descEl) descEl.textContent = d.desc;
        if (valEl) {
          valEl.textContent = val.toFixed(4);
          valEl.style.color = val > 0.6 ? 'var(--accent2)' : val > 0.4 ? 'var(--purple)' : 'var(--text3)';
        }
      });
      this.dimSimilarChunksHtml = d.relChunks.map(c =>
          `<span style="font-size:10px;font-family:var(--mono);padding:2px 8px;background:var(--bg4);border:1px solid var(--border);border-radius:4px;color:var(--text2)">${c}</span>`
      ).join('');
    },
    renderPresetButtons() {
      const groups = {};
      this.PRESET_TEXTS.forEach((p, i) => {
        if (!groups[p.cluster]) groups[p.cluster] = [];
        groups[p.cluster].push(i);
      });
      this.presetTextBtnsHtml = Object.entries(groups).map(([cluster, idxs]) =>
          `<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">
          <span style="font-size:9px;font-family:var(--mono);color:${this.PRESET_TEXTS[idxs[0]].color};min-width:52px">${cluster}</span>
          ${idxs.map(i => {
            const p = this.PRESET_TEXTS[i];
            const active = i === this._activePresetIdx;
            return `<button id="pbt-${i}" onclick="this.__vue__.embedPreset(${i})" style="font-size:11px;font-family:var(--mono);padding:4px 10px;border-radius:5px;border:1px solid ${p.color}${active ? 'cc' : '44'};background:${active ? p.color + '33' : 'var(--bg3)'};color:${active ? p.color : 'var(--text2)'};cursor:pointer;transition:all 0.15s;white-space:nowrap">${p.text.slice(0, 22)}${p.text.length > 22 ? '…' : ''}</button>`;
          }).join('')}
        </div>`
      ).join('');
    },
    embedPreset(idx) {
      this._activePresetIdx = idx;
      this._revealedPresets.add(idx);
      this.renderPresetButtons();
      const p = this.PRESET_TEXTS[idx];
      this.$nextTick(() => {
        this.drawCustomEmbedMulti();
        const label = document.getElementById('custom-embed-label');
        if (label) {
          label.innerHTML = `<span style="color:${p.color};font-weight:600">▶ "${p.text}"</span> → 落入「${p.cluster}」簇${p.cluster.includes('无关') ? ' — 与故宫知识库语义距离很远，检索时得分极低' : ' — 与相同主题的文档向量聚在一起，检索时得分高'}`;
        }
      });
    },
    // Panel 2 render
    renderPanel2(s) {
      const ic = this.INDEX_CONFIG[s.index];
      const ec = this.EMBED_CONFIG[s.embed];
      const dc = this.DB_CONFIG[s.db];
      const cc = this.CHUNK_CONFIG[s.chunk];

      this.p2InputHtml = `<span class="c-cmt">// 批量向量 Upsert</span>\n{\n  <span class="c-key">"vectors"</span>: [\n    {\n      <span class="c-key">"id"</span>: <span class="c-str">"chunk_001"</span>,\n      <span class="c-key">"values"</span>: [<span class="c-num">0.234, -0.118...</span>],\n      <span class="c-key">"metadata"</span>: {\n        <span class="c-key">"source"</span>: <span class="c-str">"gugong_intro.pdf"</span>,\n        <span class="c-key">"page"</span>: <span class="c-num">1</span>\n      }\n    },\n    <span class="c-cmt">// ${cc.count} vectors, dim=${ec.dim}</span>\n  ]\n}`;

      this.p2OutputHtml = `<span class="c-cmt">// 索引元数据</span>\n{\n  <span class="c-key">"index_type"</span>: <span class="c-str">"${ic.name}"</span>,\n  <span class="c-key">"dimension"</span>: <span class="c-num">${ec.dim}</span>,\n  <span class="c-key">"total_vectors"</span>: <span class="c-num">${cc.count}</span>,\n  <span class="c-key">"metric"</span>: <span class="c-str">"cosine"</span>,\n  <span class="c-key">"recall_rate"</span>: <span class="c-str">"${ic.recall}"</span>,\n  <span class="c-key">"db"</span>: <span class="c-str">"${dc.name}"</span>,\n  <span class="c-key">"status"</span>: <span class="c-str">"ready"</span>\n}`;

      this.indexStatsHtml = [
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

      this.p2MetricsHtml = [
        ['向量维度', ec.dim, 'accent'],
        ['索引向量数', cc.count, ''],
        ['召回率', ic.recall, 'green'],
        ['写入耗时', cc.count + '×3ms', ''],
      ].map(([l, v, c]) => `<div class="metric-card"><div class="metric-label">${l}</div><div class="metric-val ${c}">${v}</div></div>`).join('');

      this.p2HighlightHtml = `<strong>索引算法：</strong> ${ic.name} (${ic.full}) 以 ${ic.search} 的搜索复杂度实现近似最近邻搜索，` +
          (s.index === 'hnsw' ? '通过多层图结构在召回率和速度之间取得最佳平衡，是生产环境最常用的算法。' :
              s.index === 'flat' ? '精确暴力搜索，100% 召回率，但对海量数据场景性能下降严重。' :
                  '通过聚类将向量分组，大幅提升查询吞吐，适合千万级以上规模，但召回率略有损失。') +
          `<br><br><strong>向量数据库：</strong> ${dc.note}`;

      const algoCards = [
        {
          key: 'hnsw',
          name: 'HNSW',
          color: '#3b82f6',
          full: 'Hierarchical Navigable Small World',
          how: '构建多层图结构，搜索时从顶层粗定位，逐层下降精确定位，像"缩小搜索范围"',
          complexity: 'O(log n)',
          recall: '~98%',
          speed: '极快',
          best: '生产首选'
        },
        {
          key: 'flat',
          name: 'Flat',
          color: '#10b981',
          full: '暴力精确搜索',
          how: '每次查询都和库中所有向量逐一计算相似度，没有任何捷径，保证 100% 精确',
          complexity: 'O(n)',
          recall: '100%',
          speed: '慢',
          best: '小规模/验证'
        },
        {
          key: 'ivf',
          name: 'IVF',
          color: '#8b5cf6',
          full: 'Inverted File Index',
          how: '用 K-Means 把向量预先聚成若干簇，查询时只在最近的簇里找，跳过大部分数据',
          complexity: 'O(√n)',
          recall: '~94%',
          speed: '很快',
          best: '超大规模'
        },
      ];
      this.algoCardsHtml = algoCards.map(a => {
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
    },
    replayIndexAnim() {
      const s = this.getState();
      this.drawIndexCanvas(s.index);
    },
    renderDbDecisionTree() {
      const q = this.DB_QUESTIONS.find(q => q.id === this._dbCurrentQ);
      if (!q) return;
      const breadcrumb = Object.entries(this._dbAnswers).map(([qid, ans]) => {
        const qq = this.DB_QUESTIONS.find(q => q.id === qid);
        return `<span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${qq?.text.slice(0, 20)}… → <span style="color:var(--accent2)">${ans}</span></span>`;
      }).join(' › ');
      this.dbDecisionTreeHtml = `
        ${breadcrumb ? `<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:12px;padding:6px 10px;background:var(--bg3);border-radius:5px">${breadcrumb}</div>` : ''}
        <div style="font-size:13px;font-family:var(--mono);color:var(--text);margin-bottom:10px;font-weight:500">${q.text}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${q.options.map(opt =>
          `<button onclick="this.__vue__.answerDbQuestion('${q.id}','${opt.label}','${opt.next || ''}','${opt.rec || ''}')"
            style="font-size:11px;font-family:var(--mono);padding:8px 14px;border-radius:6px;border:1px solid var(--border2);background:var(--bg3);color:var(--text2);cursor:pointer;transition:all 0.15s"
          >${opt.label}</button>`
      ).join('')}
        </div>`;
    },
    answerDbQuestion(qid, label, next, rec) {
      this._dbAnswers[qid] = label;
      if (rec) {
        this.showDbRecommendation(rec);
      } else if (next) {
        this._dbCurrentQ = next;
        this.renderDbDecisionTree();
      }
    },
    showDbRecommendation(rec) {
      const db = this.DB_RECS[rec];
      this.dbRecommendVisible = true;
      this.dbRecContentHtml = `
        <span style="font-size:15px;font-weight:700;color:${db.color};font-family:var(--mono)">${db.name}</span>
        <div style="margin-top:6px;color:var(--text2)">${db.reason}</div>
        <div style="margin-top:6px;color:var(--text3);font-size:10px">⚠ 权衡：${db.tradeoff}</div>`;
    },
    resetDbDecision() {
      this._dbAnswers = {};
      this._dbCurrentQ = 'q1';
      this.dbRecommendVisible = false;
      this.dbRecContentHtml = '';
      this.renderDbDecisionTree();
    },
    // Panel 3 render
    renderPanel3(s) {
      const rc = this.RETRIEVAL_CONFIG[s.retrieval];
      const q = s.query;
      const ec = this.EMBED_CONFIG[s.embed];

      this.p3InputHtml = `<span class="c-cmt">// 查询向量化</span>\n<span class="c-key">query</span>: <span class="c-str">"${q}"</span>\n\n↓ embed(query)\n\n<span class="c-cmt">// float32[${ec.dim}]</span>\n[<span class="c-num">0.234, -0.118,\n 0.089,  0.312,\n-0.201,  0.445, ...</span>]\n\n<span class="c-key">top_k</span>: <span class="c-num">${rc.topk}</span>\n<span class="c-key">metric</span>: <span class="c-str">"cosine"</span>`;

      this.p3OutputHtml = `<span class="c-cmt">// Top-${rc.topk} 结果</span>\n` +
          rc.scores.map((sc, i) => `{\n  <span class="c-key">"id"</span>: <span class="c-str">"chunk_00${i + 1}"</span>,\n  <span class="c-key">"score"</span>: <span class="c-num">${sc}</span>\n}`).join(',\n');

      this.resultListHtml = rc.scores.map((sc, i) =>
          `<div class="result-item ${i === 0 ? 'top1' : ''}">
          <div class="result-rank">#${i + 1}</div>
          <div class="result-text-block">
            <div class="result-id">chunk_00${i + 1} · page ${i * 3 + 1}</div>
            <div class="result-text">${this.RESULT_TEXTS[i]}</div>
          </div>
          <div class="result-score-col">
            <div class="result-score-val">${sc.toFixed(3)}</div>
            <div class="score-bar-bg"><div class="score-bar-fill" style="width:${sc * 100}%"></div></div>
          </div>
        </div>`
      ).join('');

      this.scoreChartHtml = rc.scores.map((sc, i) => {
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
      this.algoCompareHtml = algoRows.map((a, i) => {
        const cur = ['semantic', 'hybrid', 'rerank', 'mmr'][i] === s.retrieval;
        return `<div style="display:grid;grid-template-columns:80px 1fr 1fr 30px;gap:6px;align-items:center;padding:4px 6px;border-radius:4px;background:${cur ? 'var(--accent-bg)' : 'transparent'};border:1px solid ${cur ? 'var(--accent-border)' : 'transparent'}">
          <span style="font-size:10px;font-family:var(--mono);color:${cur ? 'var(--accent2)' : 'var(--text3)'}">${a.name}</span>
          <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${a.speed}</span>
          <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${a.recall}</span>
          <span style="font-size:9px;font-family:var(--mono);color:var(--text3)">${a.cost}</span>
        </div>`;
      }).join('');

      this.p3HighlightHtml = `<strong>技术说明：</strong> ${rc.algo}。${rc.note}。` +
          (s.retrieval === 'hybrid' ? ' RRF（Reciprocal Rank Fusion）融合两路排序结果，有效提升边界查询的精度。' :
              s.retrieval === 'rerank' ? ' Cross-encoder 精排模型逐对计算 query-doc 相关性，精度高于双塔检索，但延迟约增加 30-50ms。' :
                  s.retrieval === 'mmr' ? ' MMR 在最大相关性的基础上对高相似度结果进行惩罚，适合摘要类任务。' : '');
    },
    renderTwoStageRetrieval(retrieval) {
      const isRerank = retrieval === 'rerank';
      this.recallPoolHtml = this.RECALL_POOL.map((c, i) => {
        const inFinalTop5 = isRerank ? this.RERANK_ORDER.includes(i) : i < 5;
        const finalRank = isRerank ? this.RERANK_ORDER.indexOf(i) : (i < 5 ? i : -1);
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
        this.rerankResultsHtml = this.RERANK_ORDER.map((poolIdx, rank) => {
          const c = this.RECALL_POOL[poolIdx];
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
        this.rerankResultsHtml = `<div style="padding:20px;text-align:center;font-size:11px;font-family:var(--mono);color:var(--text3)">选择"语义+重排序"策略<br>查看精排前后排名变化</div>`;
      }
    },
    renderHybridSearch(retrieval) {
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
      const dimStyle = isHybrid ? '' : 'opacity:0.5;pointer-events:none';

      const renderList = (items) => items.map((c, i) =>
          `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;transition:all 0.2s ${i * 0.06}s">
          <span style="font-size:9px;font-family:var(--mono);color:var(--text3);min-width:14px">#${i + 1}</span>
          <span style="font-size:10px;font-family:var(--mono);color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.topic}</span>
          ${c.highlight ? '<span style="font-size:8px;font-family:var(--mono);background:var(--amber-bg);color:var(--amber);padding:0 4px;border-radius:3px">词命中</span>' : ''}
          <span style="font-size:9px;font-family:var(--mono);color:${colorFn(i)}">${c.score.toFixed(3)}</span>
        </div>`
      ).join('');

      this.bm25ResultsHtml = renderList(bm25Order);
      this.vectorResultsHtml = renderList(vecOrder);
      this.rrfResultsHtml = rrfScores.map((c, i) => {
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
        this.hybridNoteHtml = `<strong>chunk_007（宫殿礼仪制度）</strong> 在 BM25 排名第2（含关键词），但在向量排名第5（语义稍弱）。RRF融合后综合了两路排名，最终排到第4位 — 这就是混合检索的价值：防止纯语义检索错过关键词精确匹配的结果。`;
      } else {
        this.hybridNoteHtml = `切换到「<strong>混合搜索 (Hybrid)</strong>」策略后，可看到 BM25 和向量两路排名如何通过 RRF 融合。注意 <strong>chunk_007</strong> 在两路中排名的差异。`;
      }
    },
    updateThreshold() {
      const threshold = this.scoreThreshold / 100;
      const s = this.getState();
      const rc = this.RETRIEVAL_CONFIG[s.retrieval];
      const filtered = rc.scores.map((sc, i) => ({sc, i})).filter(x => x.sc >= threshold);
      if (filtered.length === 0) {
        this.thresholdWarnVisible = true;
        this.thresholdResultHtml = `<div style="font-size:11px;font-family:var(--mono);color:var(--text3);text-align:center;padding:12px">全部 ${rc.scores.length} 个结果被过滤 — Prompt 中将没有参考资料</div>`;
      } else {
        this.thresholdWarnVisible = false;
        this.thresholdResultHtml = rc.scores.map((sc, i) => {
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
    },
    renderBadCaseContrast(s) {
      const q = s.query;
      this.goodQueryBoxHtml = `查询："${q}"`;
      const badQ = q.includes('太和殿') || q.includes('高') ? '"北京有哪些高楼？"' :
          q.includes('文物') ? '"中国有哪些艺术品？"' : '"宫廷建筑有什么特点？"';
      this.badQueryBoxHtml = `查询：${badQ}`;

      const goodScores = [0.94, 0.87, 0.81];
      const badScores = [0.41, 0.33, 0.27];

      this.goodResultsHtml = goodScores.map((sc, i) =>
          `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--bg3);border:1px solid var(--green-border);border-radius:5px">
          <span style="font-size:10px;font-family:var(--mono);color:var(--green)">chunk_00${i + 1}</span>
          <div style="flex:1;height:3px;background:var(--bg4);border-radius:2px"><div style="height:100%;width:${sc * 100}%;background:var(--green);border-radius:2px"></div></div>
          <span style="font-size:10px;font-family:var(--mono);color:var(--green)">${sc.toFixed(2)}</span>
        </div>`
      ).join('');

      this.badResultsHtml = badScores.map((sc, i) =>
          `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--bg3);border:1px solid var(--coral-border);border-radius:5px">
          <span style="font-size:10px;font-family:var(--mono);color:var(--coral)">chunk_00${i + 1}</span>
          <div style="flex:1;height:3px;background:var(--bg4);border-radius:2px"><div style="height:100%;width:${sc * 100}%;background:var(--coral);border-radius:2px"></div></div>
          <span style="font-size:10px;font-family:var(--mono);color:var(--coral)">${sc.toFixed(2)}</span>
        </div>`
      ).join('');
    },
    // Panel 4 render
    renderPanel4(s) {
      const lc = this.LLM_CONFIG[s.llm];
      const rc = this.RETRIEVAL_CONFIG[s.retrieval];
      const q = s.query;

      this.p4InputHtml = `<span class="c-cmt">// RAG 输入组装</span>\n{\n  <span class="c-key">"query"</span>: <span class="c-str">"${q}"</span>,\n  <span class="c-key">"contexts"</span>: [\n    <span class="c-cmt">// Top-${rc.topk} 检索结果</span>\n    { <span class="c-key">"id"</span>: <span class="c-str">"chunk_003"</span>, <span class="c-key">"score"</span>: <span class="c-num">${rc.scores[0]}</span> },\n    { <span class="c-key">"id"</span>: <span class="c-str">"chunk_002"</span>, <span class="c-key">"score"</span>: <span class="c-num">${rc.scores[1]}</span> },\n    <span class="c-cmt">// ...</span>\n  ]\n}`;

      this.p4OutputHtml = `<span class="c-cmt">// LLM 响应</span>\n{\n  <span class="c-key">"model"</span>: <span class="c-str">"${lc.name}"</span>,\n  <span class="c-key">"usage"</span>: {\n    <span class="c-key">"prompt_tokens"</span>: <span class="c-num">1024</span>,\n    <span class="c-key">"completion_tokens"</span>: <span class="c-num">248</span>\n  },\n  <span class="c-key">"latency_ms"</span>: <span class="c-num">1860</span>,\n  <span class="c-key">"finish_reason"</span>: <span class="c-str">"stop"</span>\n}`;

      const sys = `你是一个故宫知识库问答助手。请严格基于以下参考资料回答用户问题。\n如果参考资料中没有相关信息，请明确告知，不要编造内容。\n回答应简洁、准确，并标注信息来源。`;
      const ctx = `[参考资料 1 — chunk_003, score: ${rc.scores[0]}]\n${this.CHUNK_TEXTS_MAP.paragraph[2]}\n\n[参考资料 2 — chunk_002, score: ${rc.scores[1]}]\n${this.CHUNK_TEXTS_MAP.paragraph[1]}\n\n[参考资料 3 — chunk_001, score: ${rc.scores[2]}]\n${this.CHUNK_TEXTS_MAP.paragraph[0]}`;

      this.promptSysHtml = sys;
      this.promptCtxHtml = ctx;
      this.promptFullHtml = `<span class="p-sys">【System Prompt】\n${sys}\n\n</span><span class="p-ctx">【检索到的上下文】\n${ctx}\n\n</span><span class="p-q">【用户问题】\n${q}</span>`;
      this.promptApiHtml = `{\n  <span class="c-key">"model"</span>: <span class="c-str">"${lc.name.toLowerCase().replace(/ /g, '-')}"</span>,\n  <span class="c-key">"max_tokens"</span>: <span class="c-num">1024</span>,\n  <span class="c-key">"temperature"</span>: <span class="c-num">${lc.temp}</span>,\n  <span class="c-key">"messages"</span>: [\n    {\n      <span class="c-key">"role"</span>: <span class="c-str">"system"</span>,\n      <span class="c-key">"content"</span>: <span class="c-str">"你是故宫知识库问答助手..."</span>\n    },\n    {\n      <span class="c-key">"role"</span>: <span class="c-str">"user"</span>,\n      <span class="c-key">"content"</span>: <span class="c-str">"[3段故宫文献 + 用户问题，共1024 tokens]"</span>\n    }\n  ]\n}`;

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

      this.finalAnswerHtml = answerSteps.map(a =>
              `<div class="answer-step"><span class="answer-step-num">${a.num}</span><span class="answer-step-text">${a.text}</span></div>`
          ).join('') +
          `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;font-family:var(--mono);color:var(--text3)">📎 来源: chunk_003 (score:${rc.scores[0]}) · chunk_002 (score:${rc.scores[1]}) · chunk_001 (score:${rc.scores[2]}) | 模型: ${lc.name} | 延迟: ${lc.latency}</div>`;

      this.p4MetricsHtml = [
        ['上下文 Tokens', '1,024', 'accent'],
        ['生成 Tokens', '248', ''],
        ['端到端延迟', lc.latency, 'amber'],
        ['上下文窗口', lc.ctx, ''],
      ].map(([l, v, c]) => `<div class="metric-card"><div class="metric-label">${l}</div><div class="metric-val ${c}">${v}</div></div>`).join('');
    },
    renderRagComparison(s) {
      const q = s.query;
      const isHeight = q.includes('多高') || q.includes('高度') || q.includes('太和殿');

      this.noRagAnswerHtml = isHeight
          ? `太和殿是故宫中著名的大殿，<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">大约有30多米高</span>，建于明代，是皇帝举行朝会的地方。殿内装饰金碧辉煌，<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">据说有108根柱子</span>，是中国古代建筑的代表作。`
          : `故宫是中国北京的著名历史建筑，<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">建于约1400年左右</span>，是明清两代皇帝的宫殿。<span style="background:var(--coral-bg);border-bottom:1px solid var(--coral);border-radius:2px;padding:0 2px;color:var(--coral)">占地面积大约100万平方米</span>，内有各种宫殿建筑和文物。`;

      this.ragAnswerHtml = isHeight
          ? `太和殿殿高 <span style="color:var(--green);font-weight:600">35.05 米</span>，是故宫中最大的殿宇，也是中国现存最大的木结构大殿。面积 <span style="color:var(--green);font-weight:600">2377 平方米</span>，殿内有 <span style="color:var(--green);font-weight:600">72 根</span>大柱支撑，中央设有皇帝宝座，是举行皇帝登基、颁发诏书等重大典礼的场所。<span style="font-size:10px;color:var(--text3)">【来源: chunk_003, score: 0.94】</span>`
          : `故宫占地面积约 <span style="color:var(--green);font-weight:600">72万平方米</span>，共有大小宫殿七十余座，房屋九千余间。故宫博物院成立于 <span style="color:var(--green);font-weight:600">1925年</span>，现已收藏文物超过 <span style="color:var(--green);font-weight:600">180万件</span>。<span style="font-size:10px;color:var(--text3)">【来源: chunk_001+chunk_004, score: 0.94/0.87】</span>`;

      this.noRagProblemsHtml = [
        {icon: '⚠', text: '数据不精确（约30米 ≠ 35.05米）', color: 'var(--coral)'},
        {icon: '⚠', text: '关键细节错误（108根 ≠ 72根）', color: 'var(--coral)'},
        {icon: 'ℹ', text: '无来源引用，无法溯源验证', color: 'var(--amber)'},
      ].map(p => `<div style="display:flex;align-items:center;gap:6px;font-size:10px;font-family:var(--mono);color:${p.color}">${p.icon} ${p.text}</div>`).join('');

      this.ragBenefitsHtml = [
        {icon: '✓', text: '精确数据，来自检索文献', color: 'var(--green)'},
        {icon: '✓', text: '每条信息标注来源 chunk', color: 'var(--green)'},
        {icon: '✓', text: '知识可热更新，无需重训', color: 'var(--green)'},
      ].map(p => `<div style="display:flex;align-items:center;gap:6px;font-size:10px;font-family:var(--mono);color:${p.color}">${p.icon} ${p.text}</div>`).join('');
    },
    renderErrorPatterns() {
      const patterns = [
        {
          title: 'Chunk 过大',
          icon: '📦',
          color: '#f59e0b',
          symptom: '检索结果得分普遍偏低',
          cause: '向量包含太多混杂语义，相似度被稀释',
          fix: '缩小 chunk_size 至 256~512，增加 overlap',
          score: [0.55, 0.48, 0.42]
        },
        {
          title: 'Chunk 过小',
          icon: '✂',
          color: '#8b5cf6',
          symptom: '回答残缺、缺乏上下文',
          cause: '单块文本太短，关键信息被截断在多块中',
          fix: '增大 chunk_size，确保包含完整语义单元',
          score: [0.91, 0.88, 0.86]
        },
        {
          title: '嵌入模型弱',
          icon: '⚡',
          color: '#f43f5e',
          symptom: '语义相关结果排名靠后',
          cause: '模型对专业领域词汇理解不足',
          fix: '换用领域微调模型或更大维度模型',
          score: [0.71, 0.69, 0.68]
        },
        {
          title: '知识库缺失',
          icon: '🔍',
          color: '#4a5568',
          symptom: '得分全部低于 0.5',
          cause: '知识库中根本没有相关文档',
          fix: '扩充知识库，或在 System Prompt 中说明"不知道"',
          score: [0.38, 0.31, 0.27]
        },
      ];
      this.errorPatternsHtml = patterns.map(p => `
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
    },
    // Auto trace
    startAutoTrace() {
      this.stopAutoTrace();
      this.autoTraceVisible = true;
      this.traceStageDotsHtml = this.TRACE_STAGES.map((name, i) =>
          `<div id="tdot-${i}" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:20px;font-size:10px;font-family:var(--mono);background:var(--bg3);color:var(--text3);transition:all 0.3s">
          <span id="tdot-icon-${i}">○</span>${name}
        </div>`
      ).join('');

      let stage = 0;
      let stageStart = performance.now();

      const tick = () => {
        const now = performance.now();
        const elapsed = now - stageStart;
        const pct = Math.min(100, (elapsed / this.TRACE_DURATION) * 100);
        const overallPct = ((stage + pct / 100) / this.TRACE_STAGES.length) * 100;
        this.traceProgress = overallPct;

        const stageNames = ['解析文档，按策略分块...', '将文本块转换为向量...', '构建 HNSW 索引...', '检索 Top-K 相关文档...', '构建 Prompt，调用 LLM...'];
        this.traceStatusText = stage < this.TRACE_STAGES.length ? `[${stage + 1}/5] ${stageNames[stage]}` : '✓ 完成！';

        if (elapsed >= this.TRACE_DURATION) {
          this.goTo(stage);
          stage++;
          stageStart = now;
          if (stage >= this.TRACE_STAGES.length) {
            this.stopAutoTrace();
            return;
          }
        }
        this._autoTraceTimer = requestAnimationFrame(tick);
      };

      this.goTo(0);
      this._autoTraceTimer = requestAnimationFrame(tick);
    },
    stopAutoTrace() {
      if (this._autoTraceTimer) {
        cancelAnimationFrame(this._autoTraceTimer);
        this._autoTraceTimer = null;
      }
      this.autoTraceVisible = false;
    },
    // Canvas drawing methods
    drawEmbedSpace(seed) {
      drawEmbedSpace(this.$refs.embedSpaceCanvas, seed);
    },
    drawCosineVis(seed) {
      drawCosineVis(this.$refs.cosineCanvas, seed);
    },
    drawIndexCanvas(indexType) {
      drawIndexCanvas(this.$refs.indexCanvas, indexType);
    },
    drawRetrievalCanvas(scores, retrieval) {
      drawRetrievalCanvas(this.$refs.retrievalCanvas, scores, retrieval);
    },
    drawCustomEmbedMulti() {
      drawCustomEmbedMulti(this.$refs.customEmbedCanvas, this.PRESET_TEXTS, this._revealedPresets, this._activePresetIdx);
    },
  },
};
</script>

<style>
/* Global CSS variables for RAG Visualizer - Eye-friendly Light Theme */
.rag-visualizer-wrapper {
  --bg: #f5f2eb;
  --bg2: #ede8df;
  --bg3: #e5e0d6;
  --bg4: #d8d2c6;
  --border: rgba(0, 0, 0, 0.08);
  --border2: rgba(0, 0, 0, 0.12);
  --text: #3d3d3d;
  --text2: #5a5a5a;
  --text3: #7a7a7a;
  --accent: #4a7fd4;
  --accent2: #3b6bb5;
  --accent-bg: rgba(74, 127, 212, 0.12);
  --accent-border: rgba(74, 127, 212, 0.25);
  --green: #2d9a6e;
  --green-bg: rgba(45, 154, 110, 0.12);
  --green-border: rgba(45, 154, 110, 0.25);
  --amber: #c48a1a;
  --amber-bg: rgba(196, 138, 26, 0.12);
  --amber-border: rgba(196, 138, 26, 0.25);
  --purple: #7c5cbf;
  --purple-bg: rgba(124, 92, 191, 0.12);
  --purple-border: rgba(124, 92, 191, 0.25);
  --coral: #d45a6a;
  --coral-bg: rgba(212, 90, 106, 0.12);
  --coral-border: rgba(212, 90, 106, 0.25);
  --mono: 'JetBrains Mono', monospace;
  --sans: 'Syne', sans-serif;
}

.rag-visualizer-wrapper * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr;
  min-height: 100vh;
  background: #f5f2eb;
  color: #3d3d3d;
  font-family: 'Syne', sans-serif;
}

.app.white-bg {
  background: #ffffff;
}

.app.white-bg .topbar {
  background: #f5f5f5;
}

.app.white-bg .sidebar {
  background: #fafafa;
}

.app.white-bg .pipeline-overview {
  background: #f5f5f5;
}

/* ═══ WHITE THEME ═══ */
.rag-visualizer-wrapper.white-bg {
  --bg: #ffffff;
  --bg2: #f5f5f5;
  --bg3: #ebebeb;
  --bg4: #dcdcdc;
  --border: rgba(0, 0, 0, 0.08);
  --border2: rgba(0, 0, 0, 0.12);
}

.rag-visualizer-wrapper.white-bg .app {
  background: #ffffff;
}

.rag-visualizer-wrapper.white-bg .topbar {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .sidebar {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .main {
  background: #ffffff;
}

.rag-visualizer-wrapper.white-bg .topbar-badge {
  background: #e0e0e0;
}

.rag-visualizer-wrapper.white-bg .query-bar {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .query-bar input {
  background: #ffffff;
}

.rag-visualizer-wrapper.white-bg .stage-nav-item:hover {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .tech-select {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .tech-select option {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .io-card {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .io-card-head {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .io-type-badge {
  background: #dcdcdc;
}

.rag-visualizer-wrapper.white-bg .io-body::-webkit-scrollbar-thumb {
  background: #dcdcdc;
}

.rag-visualizer-wrapper.white-bg .section-card {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .chunk-item {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .metric-mini-badge {
  background: #dcdcdc;
}

.rag-visualizer-wrapper.white-bg .index-canvas-wrap {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .result-item {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .result-item:hover {
  background: #dcdcdc;
}

.rag-visualizer-wrapper.white-bg .score-bar-bg {
  background: #dcdcdc;
}

.rag-visualizer-wrapper.white-bg .prompt-builder {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .prompt-tabs {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .final-answer {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .pipeline-overview {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .pipe-step:hover {
  background: #ebebeb;
}

.rag-visualizer-wrapper.white-bg .metric-card {
  background: #f5f5f5;
}

.rag-visualizer-wrapper.white-bg .dot {
  background: #ede8df;
}

.topbar {
  grid-column: 1/-1;
  background: #ede8df;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
}

.topbar-logo {
  font-weight: 800;
  font-size: 15px;
  color: #3d3d3d;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-logo .dot {
  width: 8px;
  height: 8px;
  background: #4a7fd4;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1
  }
  50% {
    opacity: 0.4
  }
}

.topbar-sep {
  flex: 1;
}

.topbar-badge {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  background: #e5e0d6;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px 10px;
  border-radius: 4px;
}

.app.white-bg .topbar-badge {
  background: #e8e8e8;
}

.toggle-bg-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  color: #5a5a5a;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-bg-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #3d3d3d;
}

.query-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e5e0d6;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  padding: 6px 10px 6px 12px;
  flex: 1;
  max-width: 440px;
}

.query-bar input {
  background: none;
  border: none;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #3d3d3d;
  flex: 1;
  min-width: 0;
}

.query-bar input::placeholder {
  color: #7a7a7a;
}

.query-bar .q-label {
  font-size: 10px;
  color: #7a7a7a;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}

.run-btn {
  background: #4a7fd4;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.run-btn:hover {
  background: #3b6bb5;
  transform: translateY(-1px);
}

.run-btn:active {
  transform: none;
}

.auto-trace-btn {
  background: rgba(124, 92, 191, 0.12);
  border: 1px solid rgba(124, 92, 191, 0.25);
  border-radius: 5px;
  color: #7c5cbf;
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 4px;
}

.sidebar {
  background: #ede8df;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.sidebar-section {
  padding: 0 16px;
  margin-bottom: 8px;
}

.sidebar-section-label {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding: 0 4px;
}

.stage-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  position: relative;
}

.stage-nav-item:hover {
  background: #e5e0d6;
}

.stage-nav-item.active {
  background: rgba(74, 127, 212, 0.12);
  border-color: rgba(74, 127, 212, 0.25);
}

.stage-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.stage-nav-text {
  flex: 1;
  min-width: 0;
}

.stage-nav-name {
  font-size: 12px;
  font-weight: 600;
  color: #3d3d3d;
  display: block;
}

.stage-nav-item.active .stage-nav-name {
  color: #3b6bb5;
}

.stage-nav-sub {
  font-size: 10px;
  color: #7a7a7a;
  font-family: 'JetBrains Mono', monospace;
  display: block;
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 8px 16px;
}

.tech-panel {
  padding: 12px 16px;
}

.tech-panel-title {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.tech-select-row {
  margin-bottom: 8px;
}

.tech-select-label {
  font-size: 11px;
  color: #5a5a5a;
  margin-bottom: 4px;
  display: block;
}

.tech-select {
  width: 100%;
  background: #e5e0d6;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  color: #3d3d3d;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 6px 8px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237a7a7a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

.tech-select:focus {
  border-color: rgba(74, 127, 212, 0.25);
}

.tech-select option {
  background: #ede8df;
}

.main {
  overflow-y: auto;
  padding: 28px 32px;
  background: #f5f2eb;
}

.panel {
  display: none;
}

.panel.active {
  display: block;
  animation: panelIn 0.25s ease;
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.panel-head {
  margin-bottom: 28px;
}

.panel-head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #7a7a7a;
  margin-bottom: 6px;
}

.panel-title {
  font-size: 24px;
  font-weight: 800;
  color: #3d3d3d;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.panel-desc {
  font-size: 13px;
  color: #5a5a5a;
  margin-top: 8px;
  line-height: 1.6;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
  max-width: 560px;
}

.tag {
  display: inline-block;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid;
}

.tag-blue {
  color: #4a7fd4;
  background: rgba(74, 127, 212, 0.12);
  border-color: rgba(74, 127, 212, 0.25);
}

.tag-green {
  color: #2d9a6e;
  background: rgba(45, 154, 110, 0.12);
  border-color: rgba(45, 154, 110, 0.25);
}

.tag-amber {
  color: #c48a1a;
  background: rgba(196, 138, 26, 0.12);
  border-color: rgba(196, 138, 26, 0.25);
}

.tag-purple {
  color: #7c5cbf;
  background: rgba(124, 92, 191, 0.12);
  border-color: rgba(124, 92, 191, 0.25);
}

.tag-coral {
  color: #d45a6a;
  background: rgba(212, 90, 106, 0.12);
  border-color: rgba(212, 90, 106, 0.25);
}

.io-flow {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 0;
  margin-bottom: 24px;
  align-items: stretch;
}

.io-card {
  background: #ede8df;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.io-card-head {
  padding: 10px 16px;
  background: #e5e0d6;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.io-card-title {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.io-type-badge {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 7px;
  border-radius: 3px;
  background: #d8d2c6;
  color: #5a5a5a;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.io-body {
  padding: 14px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.8;
  color: #5a5a5a;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 160px;
  max-height: 220px;
  overflow-y: auto;
}

.io-body::-webkit-scrollbar {
  width: 4px;
}

.io-body::-webkit-scrollbar-track {
  background: transparent;
}

.io-body::-webkit-scrollbar-thumb {
  background: #d8d2c6;
  border-radius: 2px;
}

.c-key {
  color: #4a7fd4;
}

.c-str {
  color: #2d9a6e;
}

.c-num {
  color: #c48a1a;
}

.c-cmt {
  color: #9a9a9a;
}

.c-type {
  color: #7c5cbf;
}

.c-hi {
  color: #3b6bb5;
  font-weight: 500;
}

.flow-arrow-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 0;
}

.flow-arrow-svg {
  width: 40px;
  height: 24px;
}

.flow-arrow-label {
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  text-align: center;
  line-height: 1.4;
}

.section-card {
  background: #ede8df;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 16px;
}

.section-card-title {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.chunk-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chunk-item {
  background: #e5e0d6;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-left: 3px solid #4a7fd4;
  border-radius: 0 6px 6px 0;
  padding: 10px 14px;
  transition: border-color 0.15s;
}

.chunk-item:hover {
  border-left-color: #3b6bb5;
}

.chunk-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.chunk-id {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #3b6bb5;
}

.chunk-stat {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
}

.chunk-text {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #5a5a5a;
  line-height: 1.6;
}

.vec-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 72px;
  padding: 4px 0 0;
}

.vbar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  min-height: 3px;
  transition: height 0.4s ease, background 0.3s;
}

.vec-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.vec-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vec-info-label {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
}

.vec-info-val {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #3d3d3d;
  font-weight: 500;
}

.dim-sample {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dim-val {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 6px;
  border-radius: 3px;
  background: #d8d2c6;
  color: #5a5a5a;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dim-val.pos {
  color: #2d9a6e;
  border-color: rgba(45, 154, 110, 0.25);
  background: rgba(45, 154, 110, 0.12);
}

.dim-val.neg {
  color: #d45a6a;
  border-color: rgba(212, 90, 106, 0.25);
  background: rgba(212, 90, 106, 0.12);
}

.index-canvas-wrap {
  background: #e5e0d6;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  height: 200px;
  position: relative;
}

.index-canvas-wrap canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.index-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
}

.stat-val {
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: #3d3d3d;
  font-weight: 500;
}

.stat-val.good {
  color: #2d9a6e;
}

.stat-val.warn {
  color: #c48a1a;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  background: #e5e0d6;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px 14px;
  transition: all 0.15s;
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 12px;
  align-items: start;
}

.result-item:hover {
  border-color: rgba(0, 0, 0, 0.12);
  background: #d8d2c6;
}

.result-rank {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  padding-top: 2px;
}

.result-item.top1 .result-rank {
  color: #3b6bb5;
}

.result-text-block {
  min-width: 0;
}

.result-id {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #4a7fd4;
  margin-bottom: 4px;
}

.result-text {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #5a5a5a;
  line-height: 1.6;
}

.result-score-col {
  min-width: 100px;
}

.result-score-val {
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  color: #3d3d3d;
  text-align: right;
  margin-bottom: 4px;
}

.result-item.top1 .result-score-val {
  color: #2d9a6e;
}

.score-bar-bg {
  height: 4px;
  background: #d8d2c6;
  border-radius: 2px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: #4a7fd4;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-item.top1 .score-bar-fill {
  background: #2d9a6e;
}

.prompt-builder {
  background: #ede8df;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
}

.prompt-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #e5e0d6;
}

.prompt-tab {
  padding: 10px 16px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.prompt-tab:hover {
  color: #5a5a5a;
}

.prompt-tab.active {
  color: #3b6bb5;
  border-bottom-color: #4a7fd4;
}

.prompt-tab-content {
  display: none;
  padding: 16px;
}

.prompt-tab-content.active {
  display: block;
}

.prompt-block {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.8;
  color: #5a5a5a;
  white-space: pre-wrap;
}

.p-sys {
  color: #7a7a7a;
}

.p-ctx {
  color: #2d9a6e;
}

.p-q {
  color: #3b6bb5;
}

.p-hi {
  color: #c48a1a;
}

.final-answer {
  background: #ede8df;
  border: 1px solid rgba(45, 154, 110, 0.25);
  border-radius: 10px;
  padding: 20px 22px;
  margin-bottom: 16px;
}

.final-answer-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.final-answer-dot {
  width: 8px;
  height: 8px;
  background: #2d9a6e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.final-answer-title {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #2d9a6e;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.final-answer-text {
  font-size: 13px;
  color: #3d3d3d;
  line-height: 1.8;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
}

.answer-step {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  align-items: flex-start;
}

.answer-step-num {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #3b6bb5;
  background: rgba(74, 127, 212, 0.12);
  border: 1px solid rgba(74, 127, 212, 0.25);
  border-radius: 3px;
  padding: 1px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.answer-step-text {
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: #5a5a5a;
  line-height: 1.6;
}

.pipeline-overview {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
  background: #ede8df;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 4px;
  overflow-x: auto;
}

.pipe-step {
  flex: 1;
  min-width: 100px;
  padding: 10px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.pipe-step:hover {
  background: #e5e0d6;
}

.pipe-step.active {
  background: rgba(74, 127, 212, 0.12);
}

.pipe-step-num {
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  margin-bottom: 3px;
}

.pipe-step.active .pipe-step-num {
  color: #4a7fd4;
}

.pipe-step-name {
  font-size: 12px;
  font-weight: 600;
  color: #5a5a5a;
  white-space: nowrap;
}

.pipe-step.active .pipe-step-name {
  color: #3b6bb5;
}

.pipe-sep {
  font-size: 16px;
  color: #7a7a7a;
  flex-shrink: 0;
  padding: 0 2px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.grid3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.grid4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.metric-card {
  background: #ede8df;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
}

.metric-label {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.metric-val {
  font-size: 20px;
  font-weight: 700;
  color: #3d3d3d;
}

.metric-val.accent {
  color: #3b6bb5;
}

.metric-val.green {
  color: #2d9a6e;
}

.metric-val.amber {
  color: #c48a1a;
}

.metric-sub {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #7a7a7a;
  margin-top: 3px;
}

.highlight-box {
  background: rgba(74, 127, 212, 0.12);
  border: 1px solid rgba(74, 127, 212, 0.25);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #5a5a5a;
  line-height: 1.7;
}

.highlight-box strong {
  color: #3b6bb5;
  font-weight: 500;
}

.step-group {
  border-left: 2px solid rgba(0, 0, 0, 0.12);
  margin-bottom: 28px;
  padding-left: 20px;
  position: relative;
}

.step-group::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ede8df;
  border: 2px solid rgba(0, 0, 0, 0.12);
}

.step-group.active-step {
  border-left-color: #4a7fd4;
}

.step-group.active-step::before {
  background: #4a7fd4;
  border-color: #4a7fd4;
  box-shadow: 0 0 0 3px rgba(74, 127, 212, 0.15);
}

.step-group.green-step {
  border-left-color: #2d9a6e;
}

.step-group.green-step::before {
  background: #2d9a6e;
  border-color: #2d9a6e;
  box-shadow: 0 0 0 3px rgba(45, 154, 110, 0.15);
}

.step-group.purple-step {
  border-left-color: #7c5cbf;
}

.step-group.purple-step::before {
  background: #7c5cbf;
  border-color: #7c5cbf;
  box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.15);
}

.step-group.amber-step {
  border-left-color: #c48a1a;
}

.step-group.amber-step::before {
  background: #c48a1a;
  border-color: #c48a1a;
  box-shadow: 0 0 0 3px rgba(196, 138, 26, 0.15);
}

.step-label {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-num {
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  padding: 1px 7px;
  border-radius: 10px;
  border: 1px solid;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #c4bfb3;
  border-radius: 3px;
}

.anim-result {
  animation: resultSlide 0.3s ease both;
}

@keyframes resultSlide {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
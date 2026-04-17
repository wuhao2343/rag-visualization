/**
 * Canvas 绘图工具函数
 * 包含嵌入空间、余弦相似度、索引、检索等可视化绘图函数
 */

/**
 * 绘制嵌入空间可视化（2D 投影）
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {number} seed - 随机种子
 */
export function drawEmbedSpace(canvas, seed) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = (rect.width > 10 ? rect.width : 320);
  const h = (rect.height > 10 ? rect.height : 240);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // 网格背景
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 坐标轴标签
  ctx.fillStyle = 'rgba(74,85,104,0.6)';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('语义维度1', w - 54, h - 6);
  ctx.save();
  ctx.translate(10, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('语义维度2', 0, 0);
  ctx.restore();

  // 聚类中心
  const clusters = [
    {label: '建筑结构', cx: w * 0.30, cy: h * 0.32, color: '#3b82f6', points: 5},
    {label: '历史沿革', cx: w * 0.62, cy: h * 0.50, color: '#8b5cf6', points: 4},
    {label: '文物收藏', cx: w * 0.25, cy: h * 0.68, color: '#10b981', points: 4},
    {label: '宫殿典礼', cx: w * 0.70, cy: h * 0.25, color: '#f59e0b', points: 3},
  ];

  const allPoints = [];
  clusters.forEach((cl, ci) => {
    const pts = [];
    for (let i = 0; i < cl.points; i++) {
      const angle = (i / cl.points) * Math.PI * 2 + seed * 0.3 + ci * 0.8;
      const r = 16 + Math.abs(Math.sin(i * 3.7 + seed + ci)) * 14;
      pts.push({x: cl.cx + Math.cos(angle) * r, y: cl.cy + Math.sin(angle) * r, color: cl.color, cluster: ci});
    }
    // 绘制聚类内连线
    pts.forEach((p, i) => pts.forEach((q, j) => {
      if (j <= i) return;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = cl.color + '25';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }));
    allPoints.push(...pts);
  });

  // 绘制点
  allPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = p.color + 'cc';
    ctx.fill();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 高亮点
  const hi = allPoints[1];
  ctx.beginPath();
  ctx.arc(hi.x, hi.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('chunk_001', hi.x + 11, hi.y + 3);

  // 聚类标签
  clusters.forEach(cl => {
    ctx.fillStyle = cl.color + 'dd';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText(cl.label, cl.cx - 18, cl.cy - 32);
  });
}

/**
 * 绘制余弦相似度可视化
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {number} seed - 随机种子
 */
export function drawCosineVis(canvas, seed) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 200;
  const h = rect.height > 10 ? rect.height : 160;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2 + 10, r = Math.min(w, h) * 0.36;
  
  // 圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 坐标轴
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - r - 8, cy);
  ctx.lineTo(cx + r + 8, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r - 8);
  ctx.lineTo(cx, cy + r + 8);
  ctx.stroke();

  // 向量
  const vectors = [
    {angle: 0.2, color: '#10b981', label: '高相似 0.94', cos: 0.94},
    {angle: 0.2 + 1.1, color: '#3b82f6', label: '中等 0.72', cos: 0.72},
    {angle: 0.2 + Math.PI * 0.48, color: '#f59e0b', label: '低相似 0.18', cos: 0.18},
  ];
  const queryAngle = 0.2;
  const qx = cx + Math.cos(queryAngle) * r, qy = cy - Math.sin(queryAngle) * r;

  // 查询向量
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(qx, qy);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(qx, qy, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#f43f5e';
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('查询', qx + 5, qy - 4);

  // 其他向量
  vectors.forEach(v => {
    const vx = cx + Math.cos(v.angle) * r, vy = cy - Math.sin(v.angle) * r;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vx, vy);
    ctx.strokeStyle = v.color + '99';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(vx, vy, 3, 0, Math.PI * 2);
    ctx.fillStyle = v.color;
    ctx.fill();
    // 角度弧
    const startA = -queryAngle, endA = -(v.angle);
    ctx.beginPath();
    ctx.arc(cx, cy, 18, startA, endA, v.angle < queryAngle);
    ctx.strokeStyle = v.color + '55';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/**
 * 绘制索引可视化
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {string} indexType - 索引类型 (hnsw, flat, ivf)
 * @param {Function} onAnimFrame - 动画帧回调
 * @returns {Function} 取消动画的函数
 */
export function drawIndexCanvas(canvas, indexType, onAnimFrame) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 300;
  const h = rect.height > 10 ? rect.height : 260;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  let animFrameId = null;

  if (indexType === 'hnsw') {
    drawHNSW(ctx, w, h, (frameId) => { animFrameId = frameId; }, onAnimFrame);
  } else if (indexType === 'flat') {
    drawFlat(ctx, w, h, (frameId) => { animFrameId = frameId; }, onAnimFrame);
  } else {
    drawIVF(ctx, w, h, (frameId) => { animFrameId = frameId; }, onAnimFrame);
  }

  return () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  };
}

function drawHNSW(ctx, w, h, setFrameId, onAnimFrame) {
  const layers = [
    {y: h * 0.14, nodes: 3, color: '#8b5cf6', r: 6, label: 'Layer 2 — 稀疏导航层'},
    {y: h * 0.42, nodes: 7, color: '#3b82f6', r: 5.5, label: 'Layer 1 — 中间层'},
    {y: h * 0.74, nodes: 14, color: '#10b981', r: 4.5, label: 'Layer 0 — 全量节点'},
  ];
  const allNodes = layers.map((layer, li) => {
    const positions = [];
    for (let i = 0; i < layer.nodes; i++) {
      const x = (i + 0.8) * (w / (layer.nodes + 0.6));
      positions.push({x, y: layer.y, li, ni: i});
    }
    return positions;
  });
  const TARGET_NI = 8;
  const searchPath = [
    {li: 0, ni: 1}, {li: 1, ni: 3}, {li: 1, ni: 5}, {li: 2, ni: 6}, {li: 2, ni: TARGET_NI},
  ];
  const STEP_DUR = 700;
  const TOTAL = (searchPath.length + 1) * STEP_DUR;
  const startTime = performance.now();
  const stepLabels = ['从顶层入口节点进入', 'Layer 2: 快速定位大致方向', 'Layer 1: 缩小搜索范围', '降入 Layer 0 全量节点', '找到最近邻！返回结果'];

  const drawFrame = (now) => {
    const elapsed = now - startTime;
    const stepF = Math.min(elapsed / STEP_DUR, searchPath.length);
    const stepIdx = Math.min(Math.floor(stepF), searchPath.length - 1);
    const stepProg = stepF - Math.floor(stepF);
    ctx.clearRect(0, 0, w, h);

    // 绘制节点连线
    allNodes.forEach((layer, li) => {
      layer.forEach((n, ni) => {
        for (let j = ni + 1; j < Math.min(layer.length, ni + 3); j++) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(layer[j].x, layer[j].y);
          ctx.strokeStyle = layers[li].color + '18';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });
      if (li < allNodes.length - 1) {
        layer.forEach((n, ni) => {
          const below = allNodes[li + 1];
          const closest = below.reduce((a, b) => Math.abs(a.x - n.x) < Math.abs(b.x - n.x) ? a : b);
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(closest.x, closest.y);
          ctx.strokeStyle = '#ffffff08';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      }
    });

    // 绘制节点
    allNodes.forEach((layer, li) => {
      layer.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, layers[li].r, 0, Math.PI * 2);
        ctx.fillStyle = layers[li].color + '55';
        ctx.fill();
        ctx.strokeStyle = layers[li].color + '88';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
      ctx.fillStyle = layers[li].color + 'aa';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(layers[li].label, 4, layers[li].y - 12);
    });

    // 搜索路径
    for (let i = 0; i <= stepIdx; i++) {
      const sp = searchPath[i];
      const node = allNodes[sp.li][sp.ni];
      const alpha = i < stepIdx ? 'cc' : Math.round((0.4 + stepProg * 0.6) * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(node.x, node.y, layers[sp.li].r + 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b' + alpha;
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (i < stepIdx) {
        const next = searchPath[i + 1];
        const nextNode = allNodes[next.li][next.ni];
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(nextNode.x, nextNode.y);
        ctx.strokeStyle = '#f59e0b99';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 目标节点脉冲
    if (stepIdx === searchPath.length - 1) {
      const target = allNodes[2][TARGET_NI];
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 0.008);
      ctx.beginPath();
      ctx.arc(target.x, target.y, layers[2].r + 6 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText('✓ 最近邻', target.x + 8, target.y - 8);
    }

    // 描述
    const desc = stepLabels[Math.min(stepIdx, stepLabels.length - 1)];
    if (onAnimFrame) onAnimFrame({desc, stepIdx, totalSteps: searchPath.length});

    if (elapsed < TOTAL + 500) {
      const frameId = requestAnimationFrame(drawFrame);
      setFrameId(frameId);
    }
  };
  const frameId = requestAnimationFrame(drawFrame);
  setFrameId(frameId);
}

function drawFlat(ctx, w, h, setFrameId, onAnimFrame) {
  const cols = 9, rows = 5;
  const cxStep = w / (cols + 1), cyStep = (h * 0.85) / (rows + 1);
  const qx = w * 0.5, qy = h * 0.1;
  const allPts = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      allPts.push({x: (c + 1) * cxStep, y: h * 0.2 + (r + 1) * cyStep});
  const startTime = performance.now();
  
  const drawFlat = (now) => {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, w, h);
    const revealed = Math.min(allPts.length, Math.floor(elapsed / 40));
    allPts.forEach((p, i) => {
      const done = i < revealed;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = done ? '#10b981cc' : '#374151';
      ctx.fill();
      if (done) {
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(16,185,129,0.07)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
    ctx.beginPath();
    ctx.arc(qx, qy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('查询向量', qx + 12, qy + 4);
    ctx.fillStyle = '#4a5568';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(`已比较 ${revealed}/${allPts.length} 个向量 — 100% 召回率`, 6, h - 6);
    if (onAnimFrame) onAnimFrame({
      desc: revealed < allPts.length ? `正在与第 ${revealed + 1} 个向量计算余弦相似度...` : '全部遍历完成，返回最相似结果',
      revealed,
      total: allPts.length
    });
    if (revealed < allPts.length) {
      const frameId = requestAnimationFrame(drawFlat);
      setFrameId(frameId);
    }
  };
  const frameId = requestAnimationFrame(drawFlat);
  setFrameId(frameId);
}

function drawIVF(ctx, w, h, setFrameId, onAnimFrame) {
  const clusters = [
    {cx: w * 0.25, cy: h * 0.32, color: '#3b82f6', n: 8, label: '太和殿相关'},
    {cx: w * 0.68, cy: h * 0.24, color: '#8b5cf6', n: 7, label: '文物收藏'},
    {cx: w * 0.42, cy: h * 0.68, color: '#10b981', n: 9, label: '建筑布局'},
    {cx: w * 0.78, cy: h * 0.65, color: '#f59e0b', n: 6, label: '历史沿革'},
  ];
  const clusterPts = clusters.map(cl => {
    const pts = [];
    for (let i = 0; i < cl.n; i++) {
      const a = (i / cl.n) * Math.PI * 2 + cl.cx * 0.1;
      const d = 20 + (i % 3) * 8;
      pts.push({x: cl.cx + Math.cos(a) * d, y: cl.cy + Math.sin(a) * d});
    }
    return pts;
  });
  const startTime = performance.now();
  const PHASES = [800, 1600, 2600];
  
  const drawIVF = (now) => {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, w, h);
    const phase = elapsed < PHASES[0] ? 0 : elapsed < PHASES[1] ? 1 : 2;
    clusters.forEach((cl, ci) => {
      const isTarget = ci === 0;
      const highlight = phase >= 1 && isTarget;
      const dim = phase >= 1 && !isTarget;
      ctx.beginPath();
      ctx.arc(cl.cx, cl.cy, 36, 0, Math.PI * 2);
      ctx.strokeStyle = highlight ? cl.color : cl.color + (dim ? '22' : '44');
      ctx.lineWidth = highlight ? 2 : 0.8;
      ctx.setLineDash(highlight ? [] : [3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = highlight ? cl.color + '18' : cl.color + (dim ? '06' : '0c');
      ctx.fill();
      clusterPts[ci].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dim ? '#374151' : cl.color + (highlight ? 'cc' : '88');
        ctx.fill();
      });
      ctx.beginPath();
      ctx.arc(cl.cx, cl.cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = dim ? '#374151' : cl.color;
      ctx.fill();
      ctx.fillStyle = dim ? '#374151' : cl.color + 'dd';
      ctx.font = (highlight ? 'bold ' : '') + '9px JetBrains Mono, monospace';
      ctx.fillText(cl.label, cl.cx - 18, cl.cy - 42);
    });
    const qx = w * 0.5, qy = h * 0.48;
    ctx.save();
    ctx.translate(qx, qy);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-7, -7, 14, 14);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fb7185';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('查询', qx + 12, qy + 4);
    if (phase >= 1) {
      const tc = clusters[0];
      const prog = phase === 1 ? Math.min((elapsed - PHASES[0]) / (PHASES[1] - PHASES[0]), 1) : 1;
      const ex = qx + (tc.cx - qx) * prog, ey = qy + (tc.cy - qy) * prog;
      ctx.beginPath();
      ctx.moveTo(qx, qy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = '#f43f5e99';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#4a5568';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('找最近聚类中心', qx - 10, qy - 14);
    }
    if (onAnimFrame) onAnimFrame({
      desc: phase >= 2 ? '只搜索最近的"太和殿相关"簇，跳过其余3个簇，速度大幅提升' :
           phase === 1 ? '查询向量正在寻找最近的聚类中心...' :
           'IVF 先用K-Means将向量聚成4个簇，每簇对应一类语义',
      phase
    });
    ctx.fillStyle = '#4a5568';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(`IVF — 只搜索最近簇，跳过 ${clusters.length - 1}/${clusters.length} 个簇`, 6, h - 6);
    if (elapsed < 4000) {
      const frameId = requestAnimationFrame(drawIVF);
      setFrameId(frameId);
    }
  };
  const frameId = requestAnimationFrame(drawIVF);
  setFrameId(frameId);
}

/**
 * 绘制检索过程可视化
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {number[]} scores - 相似度分数数组
 * @param {string} retrieval - 检索策略
 */
export function drawRetrievalCanvas(canvas, scores, retrieval) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 400;
  const h = rect.height > 10 ? rect.height : 280;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // 网格
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const chunkTopics = ['太和殿高度', '故宫布局', '建筑典礼', '文物收藏', '历史沿革', '城墙防御', '御花园', '东西六宫', '寝宫制度', '建造工艺'];
  const docPoints = [
    {x: w * 0.38, y: h * 0.38, label: 'chunk_001', topic: chunkTopics[0], score: scores[0]},
    {x: w * 0.45, y: h * 0.50, label: 'chunk_002', topic: chunkTopics[1], score: scores[1]},
    {x: w * 0.52, y: h * 0.32, label: 'chunk_003', topic: chunkTopics[2], score: scores[2]},
    {x: w * 0.22, y: h * 0.55, label: 'chunk_004', topic: chunkTopics[3], score: scores[3]},
    {x: w * 0.60, y: h * 0.62, label: 'chunk_005', topic: chunkTopics[4], score: scores[4]},
    {x: w * 0.15, y: h * 0.20, label: 'chunk_006', topic: chunkTopics[5], score: 0.21},
    {x: w * 0.75, y: h * 0.18, label: 'chunk_007', topic: chunkTopics[6], score: 0.18},
    {x: w * 0.80, y: h * 0.72, label: 'chunk_008', topic: chunkTopics[7], score: 0.15},
    {x: w * 0.28, y: h * 0.80, label: 'chunk_009', topic: chunkTopics[8], score: 0.19},
    {x: w * 0.68, y: h * 0.82, label: 'chunk_010', topic: chunkTopics[9], score: 0.13},
  ];
  const qx = w * 0.42, qy = h * 0.42;
  const radius = w * 0.28;
  
  // 搜索范围圆
  ctx.beginPath();
  ctx.arc(qx, qy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(59,130,246,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(59,130,246,0.04)';
  ctx.fill();

  // 连线
  docPoints.slice(0, 5).forEach((p, i) => {
    ctx.beginPath();
    ctx.moveTo(qx, qy);
    ctx.lineTo(p.x, p.y);
    const alpha = 0.15 + p.score * 0.5;
    ctx.strokeStyle = i === 0 ? `rgba(16,185,129,${alpha + 0.2})` : `rgba(59,130,246,${alpha})`;
    ctx.lineWidth = i === 0 ? 1.5 : 0.8;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    const mx = (qx + p.x) / 2, my = (qy + p.y) / 2;
    ctx.fillStyle = i === 0 ? '#10b981' : '#4a5568';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(p.score.toFixed(2), mx + 4, my);
  });

  // 点
  docPoints.forEach((p, i) => {
    const isTopK = i < 5;
    const isTop1 = i === 0;
    const r = isTop1 ? 7 : isTopK ? 5.5 : 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isTop1 ? '#10b981' : isTopK ? '#3b82f6cc' : '#374151';
    ctx.fill();
    if (isTop1) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (isTopK) {
      ctx.fillStyle = isTop1 ? '#10b981' : '#3b82f6';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(p.topic, p.x + 8, p.y - 2);
      ctx.fillStyle = '#4a5568';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(p.label, p.x + 8, p.y + 8);
    }
  });

  // 查询向量
  ctx.save();
  ctx.translate(qx, qy);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.rect(-7, -7, 14, 14);
  ctx.fillStyle = '#f43f5e';
  ctx.fill();
  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#fb7185';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText('查询向量', qx + 10, qy - 8);
  const shortQ = retrieval === 'semantic' ? '"太和殿有多高？"' : '"太和殿..."';
  ctx.fillStyle = '#4a5568';
  ctx.font = '8px JetBrains Mono, monospace';
  ctx.fillText(shortQ, qx + 10, qy + 3);
  ctx.fillStyle = '#4a5568';
  ctx.font = '9px JetBrains Mono, monospace';
  const strategyLabel = retrieval === 'hybrid' ? '混合检索（语义+BM25）' : retrieval === 'rerank' ? '语义+重排序' : retrieval === 'mmr' ? 'MMR多样性' : '纯语义搜索';
  ctx.fillText('策略: ' + strategyLabel, 8, h - 8);
}

/**
 * 绘制自定义嵌入多文本可视化
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {Array} presetTexts - 预设文本数组
 * @param {Set} revealedPresets - 已揭示的预设集合
 * @param {number} activePresetIdx - 当前激活的预设索引
 */
export function drawCustomEmbedMulti(canvas, presetTexts, revealedPresets, activePresetIdx) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 400, h = rect.height > 10 ? rect.height : 220;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // 网格
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 聚类中心
  const clusterCenters = {
    '建筑结构': {cx: 0.30, cy: 0.35, color: '#3b82f6'},
    '历史沿革': {cx: 0.62, cy: 0.50, color: '#8b5cf6'},
    '文物收藏': {cx: 0.25, cy: 0.68, color: '#10b981'},
    '宫殿典礼': {cx: 0.72, cy: 0.28, color: '#f59e0b'},
  };
  Object.entries(clusterCenters).forEach(([name, cl]) => {
    ctx.beginPath();
    ctx.arc(cl.cx * w, cl.cy * h, 44, 0, Math.PI * 2);
    ctx.fillStyle = cl.color + '14';
    ctx.fill();
    ctx.strokeStyle = cl.color + '33';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cl.color + 'cc';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, cl.cx * w, cl.cy * h - 50);
    ctx.textAlign = 'left';
  });

  // 文档点
  const docPts = [
    [0.32, 0.35, '#3b82f6'], [0.27, 0.42, '#3b82f6'], [0.36, 0.28, '#3b82f6'],
    [0.64, 0.52, '#8b5cf6'], [0.60, 0.46, '#8b5cf6'], [0.67, 0.57, '#8b5cf6'],
    [0.22, 0.66, '#10b981'], [0.28, 0.72, '#10b981'], [0.31, 0.60, '#10b981'],
    [0.68, 0.27, '#f59e0b'], [0.74, 0.33, '#f59e0b'],
  ];
  docPts.forEach(([x, y, c]) => {
    ctx.beginPath();
    ctx.arc(x * w, y * h, 4, 0, Math.PI * 2);
    ctx.fillStyle = c + '55';
    ctx.fill();
  });

  // 预设文本点
  presetTexts.forEach((p, i) => {
    if (!revealedPresets.has(i)) return;
    const active = i === activePresetIdx;
    const nx = p.px * w, ny = p.py * h;
    if (active) {
      ctx.beginPath();
      ctx.arc(nx, ny, 18, 0, Math.PI * 2);
      ctx.strokeStyle = p.color + '44';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(nx, ny, active ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = p.color + (active ? 'ff' : 'bb');
    ctx.fill();
    if (active) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = p.color;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(p.text.slice(0, 18) + (p.text.length > 18 ? '…' : ''), nx + 12, ny + 3);
    }
  });

  ctx.fillStyle = '#4a5568';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('● 文档 chunk  ●●+ 已选文本', 8, h - 8);
}
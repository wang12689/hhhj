
(function(){
  const THEME_KEY = 'web16_theme';
  const CAT_KEY = 'category';
  const state = { all: [], filtered: [], category: '全部', keyword: '' };

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙';
  }
  document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem(THEME_KEY, cur);
    document.getElementById('themeToggle').textContent = cur === 'dark' ? '☀️' : '🌙';
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.cat;
      render();
    });
  });

  function doSearch() {
    state.keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    render();
  }
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  document.getElementById('searchInput').addEventListener('input', () => {
    state.keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    render();
  });

  function filterData() {
    state.filtered = state.all.filter(item => {
      const catVal = item[CAT_KEY] || item.category || '';
      if (state.category !== '全部' && catVal !== state.category) return false;
      if (state.keyword) {
        const hay = Object.values(item).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ').toLowerCase();
        if (!hay.includes(state.keyword)) return false;
      }
      return true;
    });
  }

  const META_KEYS = {
    '美食菜谱食谱大全': ['difficulty', 'time', 'calories'],
    '旅游景点攻略打卡': ['season', 'days', 'budget'],
    '经典电影台词珍藏馆': ['year', 'director', 'rating'],
    '名人名言金句每日': ['source'],
    '编程每日一题算法站': ['difficulty', 'passRate'],
    '萌宠猫狗图鉴百科': ['origin', 'life', 'size'],
    '书籍读书笔记推荐': ['author', 'rating', 'pages'],
    '音乐歌单专辑推荐': ['artist', 'year', 'rating'],
    '配色灵感色卡设计站': ['scene', 'contrast'],
    '成语典故中华大词典': ['pinyin'],
    '数码产品参数评测': ['brand', 'price', 'rating'],
    '健身动作训练计划': ['level', 'sets', 'calories'],
    '二十四节气养生天气': ['date'],
    '网络热梗表情包百科': ['year', 'viral'],
    '游戏评分推荐百科': ['developer', 'year', 'score']
  };

  function cardMeta(item, siteName) {
    const keys = META_KEYS[siteName] || Object.keys(item).slice(1, 5);
    return keys.filter(k => item[k] !== undefined && item[k] !== '')
               .map(k => `<span class="meta-chip">${escapeHtml(labelOf(k))}：${escapeHtml(Array.isArray(item[k]) ? item[k].slice(0,3).join(' / ') : item[k])}</span>`).join('');
  }

  const LABEL_MAP = {
    title:'标题', category:'分类', era:'朝代', author:'作者', source:'来源', rating:'评分', year:'年份',
    date:'日期', price:'价格', brand:'品牌', difficulty:'难度', time:'时长', calories:'热量', season:'季节',
    days:'天数', budget:'预算', pinyin:'拼音', origin:'产地', life:'寿命', size:'尺寸', pages:'页数',
    level:'级别', sets:'组数', views:'阅读', passRate:'通过率', scene:'场景', contrast:'对比度',
    platform:'平台', developer:'开发商', score:'评分', playtime:'通关时长', chips:'小标签',
    symbol:'节气', climate:'气候', health:'养生要点', diet:'饮食要点', usage:'用法', viral:'热度',
    genre:'类型', director:'导演', actor:'主演', artist:'歌手', temperament:'性格', muscles:'主要肌群',
    equipment:'所需器械', recommend:'推荐', summary:'简介', highlights:'亮点', chips2:'', meaning:'释义',
    origin2:'出处', example:'例句', screen:'屏幕', chip:'芯片', battery:'电池', weight:'重量',
    pros:'优点', cons:'缺点', steps:'步骤', tips:'注意事项', highlights2:'', highlights3:'',
    tracks:'曲目数', scene2:'场景', symbol2:'节气图标', climate2:'气候特征', acceptance:'AC人数',
    highlights4:'', highlights5:'', dynasty:'朝代', content:'内容', quote:'台词', scene_desc:'场景',
    ingredients:'食材', itinerary:'行程', solution:'思路', code:'示例代码', tags:'标签', highlights6:''
  };

  function labelOf(k) { return LABEL_MAP[k] || k; }

  function firstChip(item) {
    // 卡片上显示的左侧小标签
    for (const k of ['category', 'type', 'season', 'platform', 'style', 'genre', 'part']) {
      if (item[k]) return item[k];
    }
    return item[CAT_KEY] || '推荐';
  }

  function highlightField(item) {
    // 卡片右下角的强调数字
    for (const k of ['rating', 'score', 'views', 'price', 'acceptance']) {
      if (item[k] !== undefined) {
        let v = item[k];
        if (typeof v === 'number' && k === 'views') v = Math.floor(v/10000).toFixed(0) + 'w';
        if (k === 'price') v = '¥' + v;
        return labelOf(k) + '：<span class="highlight">' + v + '</span>';
      }
    }
    return '';
  }

  function descField(item) {
    for (const k of ['desc', 'summary', 'content', 'quote', 'meaning', 'review', 'tips']) {
      if (item[k]) return String(item[k]);
    }
    return '（暂无介绍）';
  }

  function render() {
    filterData();
    const grid = document.getElementById('cardGrid');
    const empty = document.getElementById('emptyState');
    document.getElementById('totalCount').textContent = '共 ' + state.filtered.length + ' 条内容';
    if (state.filtered.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    grid.innerHTML = state.filtered.map((item, idx) => `
      <article class="data-card" data-idx="${idx}">
        <span class="card-tag">${escapeHtml(firstChip(item))}</span>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <div class="card-meta">${cardMeta(item, '美食菜谱食谱大全')}</div>
        <p class="card-desc">${escapeHtml(descField(item))}</p>
        <div class="card-footer">
          <span>${escapeHtml(Object.keys(state.all[0]).slice(0,1).length ? '' : '')}</span>
          <span>${highlightField(item)}</span>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.data-card').forEach(c => {
      c.addEventListener('click', () => openModal(state.filtered[parseInt(c.dataset.idx, 10)]));
    });
  }

  function openModal(item) {
    document.getElementById('modalTag').innerHTML = `<span>${escapeHtml(firstChip(item))}</span>`;
    document.getElementById('modalTitle').textContent = item.title;
    const body = document.getElementById('modalBody');
    let html = '';

    // 数字评分项目用大分数
    if (item.score !== undefined) {
      html += `<div style="text-align:center;margin-bottom:14px;"><span class="score-big">${item.score}</span><span style="color:var(--text-secondary);"> / 100 · ${labelOf('score')}</span></div>`;
    } else if (item.rating !== undefined && typeof item.rating === 'number') {
      html += `<div style="text-align:center;margin-bottom:14px;"><span class="score-big">${item.rating}</span><span style="color:var(--text-secondary);"> ★ / ${labelOf('rating')}</span></div>`;
    }

    const kvRows = [];
    const listExclude = new Set(['title', 'score', 'rating', 'desc', 'summary', 'quote', 'meaning', 'review']);
    const listFields = { 'pros':'👍 优点', 'cons':'⚠️ 缺点', 'steps':'📋 步骤', 'itinerary':'🗺️ 行程', 'tags':'🏷️ 标签',
                        'highlights':'⭐ 亮点曲目/要点', 'ingredients':'🥬 食材清单', 'examples':'💬 例句' };
    const bigSections = {
      'desc':'📝 简介', 'summary':'📝 简介', 'quote':'🎬 经典台词', 'content':'📖 内容',
      'meaning':'💡 释义', 'origin':'📜 出处/起源', 'example':'💬 使用例句',
      'ingredients':'🥬 食材清单', 'steps':'📋 做法步骤', 'itinerary':'🗺️ 行程安排',
      'tips':'💡 注意事项', 'pros':'👍 优点', 'cons':'⚠️ 缺点', 'review':'✍️ 点评',
      'health':'🌿 养生要点', 'diet':'🍽️ 饮食要点', 'recommend':'⭐ 每日推荐',
      'usage':'🙋 使用方式', 'highlights':'⭐ 亮点', 'notes':'📖 笔记要点',
      'code':'💻 示例代码', 'solution':'🧠 解题思路',
      'climate':'🌤️ 气候特点', 'workout':'🏋️ 主要训练', 'solution2':'',
    };

    // KV 行：短字段
    for (const [k, v] of Object.entries(item)) {
      if (listExclude.has(k)) continue;
      if (k in listFields) continue;
      if (k in bigSections) continue;
      const display = Array.isArray(v) ? v.slice(0, 6).join('、') : v;
      if (typeof display === 'string' && display.length > 80) continue;
      if (String(display).trim() === '') continue;
      kvRows.push(`<div class="kv-row"><div class="kv-k">${labelOf(k)}</div><div class="kv-v">${escapeHtml(String(display))}</div></div>`);
    }
    if (kvRows.length) html += `<div style="background:var(--bg-color);padding:14px 18px;border-radius:12px;margin-bottom:18px;">${kvRows.join('')}</div>`;

    // 大段落
    for (const k of ['summary', 'desc', 'quote', 'meaning', 'content', 'origin', 'review',
                     'climate', 'health', 'diet', 'recommend', 'usage', 'tips', 'notes',
                     'solution', 'ingredients', 'steps', 'itinerary', 'highlights', 'example',
                     'code', 'pros', 'cons']) {
      if (item[k] === undefined) continue;
      const v = item[k];
      const title = bigSections[k] || labelOf(k);
      html += `<h4>${title}</h4>`;
      if (Array.isArray(v)) {
        html += '<ul>' + v.map(x => `<li>${escapeHtml(String(x))}</li>`).join('') + '</ul>';
      } else if (k === 'code') {
        html += `<pre style="background:var(--bg-color);border:1px solid var(--border-color);border-radius:10px;padding:14px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;font-family:Consolas,Menlo,monospace;font-size:13px;line-height:1.6;">${escapeHtml(String(v))}</pre>`;
      } else {
        html += `<div>${escapeHtml(String(v)).replace(/\\n/g, '<br>')}</div>`;
      }
    }

    body.innerHTML = html;
    document.getElementById('cardModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('cardModal').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('cardModal').addEventListener('click', e => {
    if (e.target.dataset.close === '1') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function loadData() {
    const loading = document.getElementById('loadingState');
    loading.style.display = 'block';
    try {
      const base = (document.querySelector('base') && document.querySelector('base').href) || '';
      const res = await fetch(base + 'data/data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      state.all = data.items || [];
      if (data.lastUpdate) document.getElementById('lastUpdate').textContent = '最后更新：' + data.lastUpdate;
      render();
    } catch (e) {
      document.getElementById('cardGrid').innerHTML = `<div class="empty-state"><p>⚠️ 数据加载失败，请稍后重试</p></div>`;
    } finally {
      loading.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
  });
})();

/* ============================================================
   高考志愿填报辅助系统 v3.0 (独立整合版)
   福建 2026 | 5 层阈值 | 院校分层 | 张雪峰 | 倒计时 | 招生计划
   ============================================================ */
const DATA = { plan: null, tiers: {}, admission: null, admissionHistory: null, dist2026: null, distHistory: null, control: null, config: null };
let LAST_RESULT = null; // for report generation
const fmt = n => (n==null||Number.isNaN(Number(n)))?'—':Number(n).toLocaleString('zh-CN');
const FUJIAN_CITIES = ['福州','厦门','泉州','漳州','莆田','龙岩','三明','南平','宁德'];
function isFujianCollege(collegeName, city) {
  const ti = DATA.tiers[collegeName];
  if (ti && ti.is_provincial_fujian === true) return true;
  if (ti && ti.is_provincial_fujian === false) return false;
  // fallback: check city field from plan data
  return FUJIAN_CITIES.some(c => (city||'').includes(c));
}
const $ = id => document.getElementById(id);


/* ======== 专业数据库 (20个常见专业) ======== */
var MAJOR_DB = {
  "计算机科学与技术": {cat:"工学-计算机", degree:"工学/理学学士", dur:"四年", courses:"数据结构·操作系统·计算机网络·组成原理·数据库", careers:"软件开发·算法·系统架构·AI研发", salary:"15-40万", certs:"软考·AWS·CKA", pros:"就业面最宽、薪资天花板高", cons:"竞争激烈、技术迭代快需要持续学习",适合:"逻辑强·自学能力好·对编程有热情"},
  "软件工程": {cat:"工学-计算机", degree:"工学学士", dur:"四年", courses:"软件工程·面向对象·Web开发·数据库·项目管理", careers:"前端/后端开发·测试·DevOps·项目经理", salary:"12-35万", certs:"软考·PMP·Scrum", pros:"就业直接对口的码农专业", cons:"35岁危机被讨论最多",适合:"喜欢写代码·团队协作"},
  "人工智能": {cat:"工学-计算机/AI", degree:"工学学士", dur:"四年", courses:"机器学习·深度学习·NLP·CV·强化学习·数学", careers:"AI算法·数据科学·AI产品", salary:"20-50万", certs:"TensorFlow·AWS ML", pros:"前沿热门，薪资天花板极高", cons:"竞争极其激烈，建议读研",适合:"数学好·有研究精神·能读研"},
  "数据科学与大数据技术": {cat:"工学/理学-数据", degree:"工学/理学学士", dur:"四年", courses:"统计学·机器学习·数据库·数据可视化·Python", careers:"数据分析·数据工程·数据科学", salary:"12-35万", certs:"CDA·CAP·AWS数据", pros:"各行各业都需要数据人才", cons:"入门容易精通难",适合:"数学好·业务理解力强"},
  "电气工程及其自动化": {cat:"工学-电气", degree:"工学学士", dur:"四年", courses:"电路·电机学·电力系统·自动控制·PLC", careers:"国家电网·南方电网·设计院·电气工程师", salary:"8-20万", certs:"注册电气工程师", pros:"国企就业主力，极其稳定", cons:"薪资涨幅有限，一线城市机会少",适合:"求稳·想进国企·不排斥传统工科"},
  "自动化": {cat:"工学-控制", degree:"工学学士", dur:"四年", courses:"自动控制·传感器·PLC·机器人·智能控制", careers:"自动化工程·机器人·工业互联网", salary:"8-22万", certs:"注册自动化工程师", pros:"软硬结合，转型空间大", cons:"课程难度大，本科不够用",适合:"动手能力强·软硬通吃"},
  "电子信息工程": {cat:"工学-电子", degree:"工学学士", dur:"四年", courses:"电路·信号与系统·通信原理·嵌入式·FPGA", careers:"硬件工程·嵌入式·通信·芯片设计", salary:"10-30万", certs:"华为认证·嵌入式", pros:"芯片风口，就业前景好", cons:"课程难度大，需持续学习"},
  "通信工程": {cat:"工学-通信", degree:"工学学士", dur:"四年", courses:"通信原理·信号处理·网络·5G·光纤通信", careers:"通信工程师·网络规划·运营商", salary:"8-25万", certs:"华为/思科认证", pros:"5G/6G时代需求稳定", cons:"运营商体系较稳定但天花板有限"},
  "临床医学": {cat:"医学-临床", degree:"医学学士", dur:"五年(5+3+X)", courses:"人体解剖·生理·病理·药理·内外妇儿", careers:"医生·临床研究·医药企业医学部", salary:"8-30万(后期)", certs:"医师资格证·规培证", pros:"社会地位高·越老越吃香", cons:"培养周期极长(8-12年)·压力大",适合:"能吃苦·有耐心·家庭支持"},
  "口腔医学": {cat:"医学-口腔", degree:"医学学士", dur:"五年", courses:"口腔解剖·口腔病理·修复·正畸·种植", careers:"口腔医生·私人诊所", salary:"10-50万", certs:"医师资格证", pros:"收入高·可创业开诊所", cons:"培养周期长·体力要求高",适合:"动手能力强·想高收入"},
  "护理学": {cat:"医学-护理", degree:"理学学士", dur:"四年", courses:"基础护理·内科护理·外科护理·急危重症", careers:"护士·护理管理·临床研究", salary:"6-15万", certs:"护士执业证", pros:"就业率极高·本科进三甲机会大", cons:"辛苦·夜班·职业上升空间有限"},
  "金融学": {cat:"经济学-金融", degree:"经济学学士", dur:"四年", courses:"微观/宏观经济学·金融学·投资学·公司金融", careers:"银行·券商·基金·投行·保险", salary:"10-40万", certs:"CFA·证券从业·基金从业", pros:"薪资天花板高·金融中心机会多", cons:"极其看院校出身·名校硕士起步",适合:"数学好·家庭有资源·名校"},
  "会计学": {cat:"管理学-会计", degree:"管理学学士", dur:"四年", courses:"会计学·审计·财务管理·税法·成本会计", careers:"会计·审计·财务分析·CFO", salary:"7-20万", certs:"CPA(核心)·ACCA·CMA", pros:"越老越吃香·各行各业都需要", cons:"AI替代风险·初期薪资偏低",适合:"细心·耐心·求稳"},
  "法学": {cat:"法学-法学", degree:"法学学士", dur:"四年", courses:"法理学·宪法·民法·刑法·诉讼法·经济法", careers:"律师·法务·检察官·法官·公务员", salary:"6-30万(差异极大)", certs:"法律职业资格证(A证)", pros:"社会地位高·考公优势大", cons:"法考通过率低(约15%)·就业两极分化",适合:"口才好·逻辑强·能考证"},
  "师范类(物理)": {cat:"教育学-学科", degree:"理学学士", dur:"四年", courses:"物理学·力学·电磁学·量子力学·教材教法·心理学", careers:"中学物理教师·教研员·教育机构", salary:"6-15万", certs:"教师资格证", pros:"就业确定·寒暑假·稳定性高", cons:"薪资一般·上升空间有限"},
  "师范类(数学)": {cat:"教育学-学科", degree:"理学学士", dur:"四年", courses:"数学分析·高代·几何·概率论·教材教法", careers:"中学数学教师·教研员", salary:"6-15万", certs:"教师资格证", pros:"数学老师需求大·稳定", cons:"薪资有限·评职称竞争"},
  "土木工程": {cat:"工学-土木", degree:"工学学士", dur:"四年", courses:"力学·结构力学·混凝土·钢结构·施工", careers:"设计院·施工单位·地产·监理·检测", salary:"6-18万", certs:"注册结构/岩土/建造师", pros:"老牌工科·经验值钱", cons:"行业下行·工作环境一般·出差多",适合:"能吃苦·不介意工地"},
  "机械设计制造及其自动化": {cat:"工学-机械", degree:"工学学士", dur:"四年", courses:"机械制图·力学·机械设计·CAD/CAM·数控", careers:"机械设计·制造工程·设备管理", salary:"6-15万", certs:"机械工程师", pros:"制造业基石·就业面广", cons:"薪资偏低·发展空间有限"},
  "经济学": {cat:"经济学-理论", degree:"经济学学士", dur:"四年", courses:"微观经济学·宏观经济学·计量经济学·政经·博弈论", careers:"政策研究·银行·券商·高校(需博士)", salary:"6-12万(起)", certs:"CFA·证券从业", pros:"理论功底扎实", cons:"就业不如金融学实用",适合:"数学好·对政策有兴趣"},
  "工商管理": {cat:"管理学-工商", degree:"管理学学士", dur:"四年", courses:"管理学·市场营销·人力资源·战略·运营管理", careers:"管理培训生·项目经理·创业", salary:"6-15万", certs:"MBA(后期)·PMP", pros:"面广·适合不确定方向的人", cons:"本科就业竞争力弱·万金油",适合:"性格外向·综合素质好"},
  "英语": {cat:"文学-外语", degree:"文学学士", dur:"四年", courses:"综合英语·翻译·语言学·英美文学·跨文化", careers:"翻译·外贸·教育·海外市场", salary:"6-15万", certs:"专八·CATTI·雅思托福", pros:"基础学科·可跨界", cons:"AI翻译冲击大·纯语言竞争力下降",适合:"语言天赋好·可复合其他专业"}
};

/* ======== 数据加载 ======== */
async function loadAllData() {
  try {
    const [plan, tiers, adm, admH, dist, distH, control, cfg] = await Promise.all([
      fetch('./data/official_2026_plan/merged/plan_data.json').then(r=>r.json()).catch(()=>null),
      fetch('./data/college_tiers.json').then(r=>r.json()).catch(()=>null),
      fetch('./data/fujian_2025_physics_undergrad_admission_merged_v2_with_rank.csv').then(r=>r.text()).catch(()=>null),
      fetch('./data/fujian_2025_history_undergrad_admission_merged_v1.csv').then(r=>r.text()).catch(()=>null),
      fetch('./data/fujian_2026_physics_score_distribution.csv').then(r=>r.text()).catch(()=>null),
      fetch('./data/fujian_2026_history_score_distribution.csv').then(r=>r.text()).catch(()=>null),
      fetch('./data/fujian_2026_control_lines.json').then(r=>r.json()).catch(()=>null),
      fetch('./data/config.json').then(r=>r.json()).catch(()=>null)
    ]);
    DATA.plan = plan; DATA.tiers = tiers || {};
    DATA.admission = adm ? parseCSV(adm) : [];
    DATA.admissionHistory = admH ? parseCSV(admH) : [];
    DATA.dist2026 = dist ? parseCSV(dist) : [];
    DATA.distHistory = distH ? parseCSV(distH) : [];
    DATA.control = control; DATA.config = cfg;
    console.log(`Loaded: plan=${plan?.length||0} tiers=${Object.keys(tiers||{}).length} adm=${DATA.admission.length} dist=${DATA.dist2026.length}`);
  } catch(e) { console.error('Load error:', e); }
  renderStatus(); renderControlLines(); populatePlanBrowser(); initCountdown();
  const se = $('score');
  if (se) se.addEventListener('input', () => {
    const s = Number(se.value);
    const h = $('rankHint');
    if (h) h.textContent = (s && DATA.dist2026.length) ? `约${fmt(scoreToRank(s, $('subject')?.value || '物理科目组'))}名` : '';
  });
  $('subject')?.addEventListener('change', () => {
    const s = Number($('score')?.value);
    const h = $('rankHint');
    if (h && s) h.textContent = `约${fmt(scoreToRank(s, $('subject')?.value || '物理科目组'))}名`;
  });
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const h = lines[0].split(',').map(x=>x.trim());
  const r = [];
  for (let i=1; i<lines.length; i++) {
    const v = lines[i].split(',');
    const o = {};
    h.forEach((k,j) => o[k] = (v[j]||'').trim());
    r.push(o);
  }
  return r;
}

function renderStatus() {
  const el = $('status');
  if (!el) return;
  const p = [];
  if (DATA.plan?.length) p.push(`✅ 招生${fmt(DATA.plan.length)}条`);
  if (DATA.admission?.length) p.push(`✅ 物理投档线${fmt(DATA.admission.length)}条`);
  if (DATA.admissionHistory?.length) p.push(`✅ 历史投档线${fmt(DATA.admissionHistory.length)}条`);
  if (DATA.dist2026?.length) p.push(`✅ 一分一段表`);
  if (DATA.control) p.push(`✅ 省控线`);
  if (Object.keys(DATA.tiers).length) p.push(`✅ 院校分层`);
  el.textContent = p.length ? p.join(' | ') : '⏳ 加载中…';
}

function renderControlLines() {
  const box = $('officialBox');
  if (!box || !DATA.control) return;
  const rec = DATA.control.records || [];
  const cats = ['普通类本科批','普通类高职（专科）批','普通类特殊类型招生'];
  const rows = rec.filter(r => cats.includes(r.category));
  const bt = {};
  rows.forEach(r => { if (!bt[r.track]) bt[r.track] = []; bt[r.track].push(r); });
  box.innerHTML = `<h3>📊 ${DATA.control.meta.year} 福建省省控线</h3>
    <div class="control-grid">${
      Object.entries(bt).map(([tr, items]) => `
        <div class="track-group"><div class="track-label">${tr}</div>
        <div class="track-lines">${
          items.map(i => `<span class="control-item"><b>${i.category.replace('普通类','').replace('批','')}</b> ${i.control_line}分</span>`).join('')
        }</div></div>`).join('')
    }</div>`;
}

/* ======== 倒计时 ======== */
function initCountdown() {
  const el = $('countdown');
  if (!el) return;
  function upd() {
    const n = new Date();
    const tp = new Date('2026-06-30T08:00:00+08:00');
    const bk = new Date('2026-07-03T08:00:00+08:00');
    if (n < tp) { const d=tp-n; el.textContent=`⏰ 提前批还有 ${Math.floor(d/3600000)}h${Math.floor((d%3600000)/60000)}m`; }
    else if (n < bk) { const d=bk-n; el.textContent=`⏰ 本科批还有 ${Math.floor(d/3600000)}h${Math.floor((d%3600000)/60000)}m`; }
    else el.textContent='⏰ 本科批填报中！';
  }
  upd(); setInterval(upd, 60000);
}

/* ======== 分数→位次 ======== */
function scoreToRank(score, subject) {
  const dist = subject==='历史科目组' ? DATA.distHistory : DATA.dist2026;
  if (!dist?.length) return null;
  const rf = dist[0].rank_high !== undefined ? 'rank_high' : 'cumulative_rank';
  for (const r of dist) if (parseInt(r.score) === score) return parseInt(r[rf]);
  let closest = null, minD = Infinity;
  for (const r of dist) { const d = Math.abs(parseInt(r.score)-score); if (d<minD) { minD=d; closest=parseInt(r.score); } }
  if (closest == null) return null;
  for (const r of dist) if (parseInt(r.score) === closest) return parseInt(r[rf]);
  return null;
}

/* ======== 张雪峰 ======== */
const ZHANG = {
  rt(rank) {
    if (rank<1500) return ['S','985顶尖（厦大以上）'];
    if (rank<6000) return ['A','985/211'];
    if (rank<18000) return ['B','211/双一流'];
    if (rank<50000) return ['C','一本'];
    if (rank<100000) return ['D','公办二本'];
    if (rank<180000) return ['E','民办二本/学院'];
    return ['F','专科/高职'];
  },
  analyze(score, rank, income) {
    const [tk, tn] = this.rt(rank);
    let fl = '寒门', fs = '普通家庭别追热爱，选能吃饭的专业。看就业中位数。';
    if (income != null) {
      if (income>=80) { fl='富裕'; fs='可以追热爱。金融、管理、艺术。有家底。'; }
      else if (income>=30) { fl='中产'; fs='选有壁垒的专业，临床、口腔、电子、通信。'; }
      else if (income>=10) { fl='小康'; fs='可以看保研率和行业门槛。医学、法学、计算机。'; }
    }
    const sgs = [];
    if (fl==='寒门'||fl==='小康') {
      sgs.push('🏠 普通/小康家庭：选工科（计算机/电气/护理），避开生化环材');
      sgs.push('🏠 院校优先于城市：学历是第一块敲门砖');
      if (['D','E','F'].includes(tk)) sgs.push('🏠 专业比学校重要：学硬手艺，毕业不愁吃饭');
    } else if (fl==='中产') {
      sgs.push('🏠 中产家庭：追求保研率高的学校和专业');
      sgs.push('🏠 临床/口腔/法学/电子——行业门槛是中产的安全区');
    } else sgs.push('🏠 富裕家庭：可以追热爱，也得看回报率');
    if (['S','A'].includes(tk)) sgs.push('🎓 学校牌子硬，选科兼顾兴趣和就业');
    else if (tk==='B'||tk==='C') sgs.push('🎓 一本线上：专业比学校名气重要');
    else if (tk==='D') sgs.push('🎓 公办二本：选有技能壁垒的专业');
    else sgs.push('🎓 考虑专升本路径或就业导向专业');
    return { tk, tn, fl, fs, sgs };
  }
};

/* ======== 核心推荐算法 ======== */
function tierRank(tier) {
  return {'985':0,'211':1,'双一流':2,'省属重点':3,'普通本科':4,'专科':5}[tier]??6;
}

function tierBadge(tier) {
  const m = {'985':'t-985','211':'t-211','双一流':'t-syl','省属重点':'t-zd','普通本科':'t-pt','专科':'t-zk'};
  return `<span class="tb ${m[tier]||'t-pt'}">${tier}</span>`;
}

function ownBadge(own) {
  if (!own) return '';
  const m = {'公办':'ob-gb','民办':'ob-mb','中外合作办学':'ob-zw'};
  return `<span class="ob ${m[own]||''}">${own}</span>`;
}

function probBadge(p) {
  const m = {'高':'pb-h','较高':'pb-gj','中等':'pb-zd','较低':'pb-dj','低':'pb-d','参考':'pb-ck','未知':'pb-wz'};
  return `<span class="pb ${m[p]||'pb-wz'}">${p}</span>`;
}

function stratBadge(s) {
  return `<span class="sb sb-${s}">${s}</span>`;
}

/* ======== 主推荐 ======== */
function generate() {
  const score = Number($('score')?.value);
  const subject = $('subject')?.value || '物理科目组';
  const income = Number($('income')?.value) || null;
  const perLayer = Number($('perLayer')?.value) || 8;
  const tierFilter = $('tierFilter')?.value || 'all';
  const ownershipFilter = $('ownershipFilter')?.value || 'all';
  const provinceFilter = $('provinceFilter')?.value || 'all';
  const firstSub = $('firstSubject')?.value || '';
  const secondSub = $('secondSubject')?.value || '';
  const majorFilter = ($('majorFilter')?.value||'').trim();
  const priority = $('priority')?.value || 'school';

  if (!score || score<200 || score>750) { $('status').textContent='请输入有效分数(200-750)'; return; }

  // 估算位次
  const myRank = scoreToRank(score, subject);
  if (!myRank) { $('status').textContent='暂无该科目组一分一段表'; return; }

  // 本科线预警
  const el = $('warnLine');
  if (el) {
    if (myRank > 100000) el.innerHTML = '⚠️ 本科线预警：位次偏高，建议重点关注专科批和民办本科';
    else if (myRank > 50000) el.innerHTML = '⚠️ 位次在本科线附近，建议冲稳保搭配';
    else el.innerHTML = '';
  }

  // 过滤招生计划
  let candidates = (DATA.plan||[]).filter(r => {
    if (r.subject_group !== subject) return false;
    if (r.batch && !r.batch.includes('本科')) return false;
    if (firstSub && !(r.subject_requirement||'').includes(firstSub)) return false;
    if (secondSub) {
      if (secondSub.includes('+')) {
        for (const s of secondSub.split('+')) if (!(r.subject_requirement||'').includes(s)) return false;
      } else if (!(r.subject_requirement||'').includes(secondSub)) return false;
    }
    const ti = DATA.tiers[r.college_name] || { tier: '普通本科' };
    if (tierFilter !== 'all' && ti.tier !== tierFilter) return false;
    if (ownershipFilter !== 'all' && r.ownership !== ownershipFilter) return false;
    if (provinceFilter !== 'all') {
      if (provinceFilter === 'fujian' && !isFujianCollege(r.college_name, r.city)) return false;
      if (provinceFilter === 'outside' && isFujianCollege(r.college_name, r.city)) return false;
    }
    return true;
    });
  // 按专业名称筛选
  if (majorFilter) {
    const keywords = majorFilter.split(/[/,、\\s]+/).filter(Boolean);
    candidates = candidates.filter(r => {
      const mn = r.major_name || '';
      return keywords.some(kw => mn.includes(kw));
    });
  }

  // 计算每个候选的投档位次
  const admIdx = {};
  const admNameIdx = {};
  const admData = subject === '历史科目组' && DATA.admissionHistory ? DATA.admissionHistory : DATA.admission;
  (admData||[]).forEach(r => {
    // BUG-1 fix: strip brackets instead of replacing with （特殊）
    // BUG-5 fix: normalize empty subject_requirement to 不限选考科目
    const strippedName = (r.college_name||'').replace(/[（(].*?[）)]/g, '').trim();
    const normalizedSubj = r.subject_requirement || '不限选考科目';
    const keys = [
      `${r.college_name}|${r.major_group_code}|${normalizedSubj}`,
      `${r.college_code}|${r.major_group_code}|${normalizedSubj}`,
      `${strippedName}|${r.major_group_code}|${normalizedSubj}`
    ];
    keys.forEach(k => { if (!admIdx[k]) admIdx[k] = { min_score: parseInt(r.min_score), rank: r.estimated_cumulative_rank_from_score_distribution ? parseInt(r.estimated_cumulative_rank_from_score_distribution) : null }; });
  });

  const scored = candidates.map(r => {
    const normalizedSubj = r.subject_requirement || '不限选考科目';
    let ai = admIdx[`${r.college_name}|${r.major_group_code}|${normalizedSubj}`];
    if (!ai) ai = admIdx[`${r.college_code}|${r.major_group_code}|${normalizedSubj}`];
    if (!ai) {
      const nn = (r.college_name||'').replace(/[（(].*?[）)]/g, '').trim();
      ai = admIdx[`${nn}|${r.major_group_code}|${normalizedSubj}`];
    }
    const ms = ai?.min_score || null;
    const cr = ai?.min_score ? scoreToRank(ai.min_score, subject) : null;
    const rg = (myRank && cr) ? cr - myRank : null;
    const sg = (score && ms) ? score - ms : null;
    let strategy = null, prob = '未知';
    if (rg != null) {
      let cMin, cMax, wMax, bMin;
      if (myRank > 80000) { cMin=-20000; cMax=-5000; wMax=5000; bMin=5000; }
      else if (myRank > 50000) { cMin=-25000; cMax=-3000; wMax=5000; bMin=3000; }
      else if (myRank > 30000) { cMin=-30000; cMax=-3000; wMax=3000; bMin=3000; }
      else { cMin=-20000; cMax=-2000; wMax=2000; bMin=2000; }
      if (rg >= 5000) { strategy='保'; prob='高'; }
      else if (rg >= bMin) { strategy='保'; prob='较高'; }
      else if (rg >= -wMax) { strategy='稳'; prob='中等'; }
      else if (rg >= cMax) { strategy='冲'; prob='较低'; }
      else if (rg >= cMin) { strategy='冲'; prob='低'; }
      else return null;
    }
    const ti = DATA.tiers[r.college_name] || { tier: '普通本科' };
    return { ...r, _ms: ms, _cr: cr, _rg: rg, _sg: sg, _strategy: strategy, _prob: prob, _ti: ti.tier };
  }).filter(Boolean);

  // 专科兜底
  const baoCount = scored.filter(c => c._strategy==='保').length;
  const wenCount = scored.filter(c => c._strategy==='稳').length;
  if ((baoCount+wenCount) < 5 || myRank > 100000) {
    const zk = (DATA.plan||[]).filter(r => {
      if (r.subject_group !== subject) return false;
      if (!r.batch || !r.batch.includes('专科')) return false;
      if (firstSub && !(r.subject_requirement||'').includes(firstSub)) return false;
      if (secondSub) {
        if (secondSub.includes('+')) {
          for (const s of secondSub.split('+')) if (!(r.subject_requirement||'').includes(s)) return false;
        } else if (!(r.subject_requirement||'').includes(secondSub)) return false;
      }
      if (provinceFilter !== 'all') {
        if (provinceFilter === 'fujian' && !isFujianCollege(r.college_name, r.city)) return false;
        if (provinceFilter === 'outside' && isFujianCollege(r.college_name, r.city)) return false;
      }
      return true;
    });
    const seen = new Set();
    for (const r of zk) {
      const key = r.college_name+'|'+(r.major_name||'');
      if (seen.has(key)) continue;
      seen.add(key);
      const ti = DATA.tiers[r.college_name] || { tier: '专科' };
      if (ti.tier==='985'||ti.tier==='211'||ti.tier==='双一流') continue;
      scored.push({ ...r, _ms: null, _cr: null, _rg: null, _sg: null, _strategy: '保', _prob: '参考', _ti: '专科' });
      if (scored.length > 50) break;
    }
  }

  // 排序（根据优先策略）
  if (priority === 'major') {
    // 专业优先：先按位次差排序，位次差接近时再按学校层次
    scored.sort((a,b) => {
      const rg = (b._rg??-99999) - (a._rg??-99999);
      if (Math.abs(rg) > 1000) return rg;
      return tierRank(a._ti) - tierRank(b._ti);
    });
  } else {
    // 学校优先（默认）：先按学校层次，再按位次差
    scored.sort((a,b) => {
      const t = tierRank(a._ti) - tierRank(b._ti);
      if (t !== 0) return t;
      return (b._rg??-99999) - (a._rg??-99999);
    });
  }

  // 分层
  // 去重（学校优先按院校去重，专业优先按院校+专业去重）
  function dedupByCollege(arr, max=2) {
    const seen = {};
    return arr.filter(r => {
      const k = priority === 'major' ? r.college_name+'|'+(r.major_name||'') : r.college_name;
      seen[k] = (seen[k]||0) + 1;
      return seen[k] <= max;
    });
  }
  const chong = dedupByCollege(scored.filter(c => c._strategy==='冲')).slice(0, perLayer);
  const wen = dedupByCollege(scored.filter(c => c._strategy==='稳')).slice(0, perLayer);
  const bao = dedupByCollege(scored.filter(c => c._strategy==='保')).slice(0, perLayer);

  $('status').innerHTML = `✅ 位次 ${fmt(myRank)} | 冲${chong.length} 稳${wen.length} 保${bao.length} 共${chong.length+wen.length+bao.length}条`;

  // 张雪峰
  const zx = ZHANG.analyze(score, myRank, income);
  const zxEl = $('zhangAnalysis');
  zxEl.innerHTML = `
    <h3>🎓 张雪峰视角</h3>
    <div class="zx-grid">
      <div class="zx-card"><div class="zx-label">学校梯队</div><div class="zx-value">${zx.tk} · ${zx.tn}</div></div>
      <div class="zx-card"><div class="zx-label">家庭分档</div><div class="zx-value">${zx.fl}</div></div>
      <div class="zx-card full"><div class="zx-label">策略</div><div class="zx-value">${zx.fs}</div></div>
    </div>
    <ul class="zx-suggestions">${zx.sgs.map(s=>`<li>${s}</li>`).join('')}</ul>`;

  // 渲染结果表
  const renderLayer = (list, title, color) => {
    if (!list.length) return '';
    let h = `<h3 style="margin:18px 0 8px;color:#${color}">${title} (${list.length}所)</h3>`;
    h += '<div class="table-wrap"><table><thead><tr><th>策略</th><th>层次</th><th>院校</th><th>专业</th><th>选科</th><th>计划</th><th>学费</th><th>办学</th><th>2025分</th><th>分差</th><th>位次差</th><th>概率</th></tr></thead><tbody>';
    list.forEach(r => {
      const gc = r._rg==null?'':(r._rg>0?'gc-pos':'gc-neg');
      h += `<tr><td>${stratBadge(r._strategy)}</td>
        <td>${tierBadge(r._ti)}</td>
        <td><b>${r.college_name}</b>${r.city?`<br><span class="muted">${r.city}</span>`:''}</td>
        <td>${r.major_name||'—'}</td>
        <td>${r.subject_requirement||'不限'}</td>
        <td>${r.plan_count||'—'}</td>
        <td>${r.tuition?fmt(parseInt(r.tuition))+'/年':'—'}</td>
        <td>${ownBadge(r.ownership)}</td>
        <td>${r._ms||'—'}</td>
        <td class="${gc}">${r._sg!=null?(r._sg>0?'+'+r._sg:r._sg):'—'}</td>
        <td class="${gc}">${r._rg!=null?(r._rg>0?'+'+fmt(r._rg):fmt(r._rg)):'—'}</td>
        <td>${probBadge(r._prob)}</td></tr>`;
    });
    h += '</tbody></table></div>';
    return h;
  };

  $('summaryCards').innerHTML = `
    <div class="summary-grid" style="grid-template-columns:repeat(5,1fr)">
      <div class="metric" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff">
        <span style="font-size:13px">分数</span><b style="font-size:24px;color:#fff">${score}</b></div>
      <div class="metric">估位次<b>${fmt(myRank)}</b></div>
      <div class="metric">冲<b>${chong.length}</b></div>
      <div class="metric">稳<b>${wen.length}</b></div>
      <div class="metric">保<b>${bao.length}</b></div>
    </div>`;
  $('recommendations').innerHTML = renderLayer(chong, '🔴 冲（冲刺院校，需要运气）', 'c62828') +
    renderLayer(wen, '🟡 稳（稳妥院校，险进）', '1565c0') +
    renderLayer(bao, '🟢 保（保底院校，稳进）', '2e7d32');

  // Store for report
  LAST_RESULT = { score, myRank, subject, income, firstSub: $('firstSubject')?.value||'', secondSub: $('secondSubject')?.value||'', tierFilter: $('tierFilter')?.value||'all', ownershipFilter: $('ownershipFilter')?.value||'all', perLayer: Number($('perLayer')?.value)||8, majorFilter, priority, chong, wen, bao, zx };
  $('reportBtn').style.display = 'block';
}

/* ======== 招生计划浏览 ======== */
function populatePlanBrowser() {
  const tb = $('planTbody');
  if (!tb || !DATA.plan) return;
  $('planCount').textContent = `共 ${fmt(DATA.plan.length)} 条`;
  renderPlanTable(DATA.plan);
  ['planFilterTrack','planFilterCollege','planFilterMajor','planFilterSubject','planFilterTier','planFilterOwn'].forEach(id => {
    const el = $(id);
    if (el) { el.addEventListener('change', applyPlanFilter); el.addEventListener('input', applyPlanFilter); }
  });
}
function applyPlanFilter() {
  let f = DATA.plan || [];
  const t = $('planFilterTrack')?.value;
  if (t && t!=='all') f = f.filter(r => r.subject_group === t);
  const c = ($('planFilterCollege')?.value||'').toLowerCase();
  if (c) f = f.filter(r => r.college_name.toLowerCase().includes(c));
  const m = ($('planFilterMajor')?.value||'').toLowerCase();
  if (m) f = f.filter(r => (r.major_name||'').toLowerCase().includes(m));
  const s = $('planFilterSubject')?.value;
  if (s && s!=='all') f = f.filter(r => r.subject_requirement === s);
  const ti = $('planFilterTier')?.value;
  if (ti && ti!=='all') f = f.filter(r => (DATA.tiers[r.college_name]||{tier:'普通本科'}).tier === ti);
  const ow = $('planFilterOwn')?.value;
  if (ow && ow!=='all') f = f.filter(r => r.ownership === ow);
  $('planCount').textContent = `共 ${fmt(DATA.plan.length)} 条，筛选后 ${fmt(f.length)} 条`;
  renderPlanTable(f);
}
function renderPlanTable(data) {
  const tb = $('planTbody');
  if (!tb) return;
  const grp = {};
  for (const r of data) {
    const k = `${r.subject_group}|${r.college_code}|${r.college_name}|${r.major_group_code}`;
    if (!grp[k]) grp[k] = { ...r, majors: [] };
    grp[k].majors.push(r);
  }
  const list = Object.values(grp).slice(0, 200);
  tb.innerHTML = list.length ? list.map(g => {
    const ti = DATA.tiers[g.college_name]||{tier:'普通本科'};
    return `<tr><td>${tierBadge(ti.tier)}</td>
      <td>${g.college_code}</td><td><b>${g.college_name}</b>${g.city?`<br><span class="muted">${g.city}</span>`:''}</td>
      <td>${g.major_group_code}</td><td>${g.majors.length}个</td>
      <td>${g.subject_requirement||'不限'}</td>
      <td>${g.majors.reduce((s,m)=>s+(m.plan_count||0),0)}</td>
      <td>${g.tuition?fmt(parseInt(g.tuition))+'/年':'—'}</td>
      <td>${ownBadge(g.ownership)}</td>
      <td class="muted">${g.notes||'—'}</td></tr>
      <tr class="sub-row"><td colspan="10"><div class="major-list">${
        g.majors.map(m => `<span class="major-chip">${m.major_name}<small>(${m.plan_count||0}人)</small></span>`).join('')
      }</div></td></tr>`;
  }).join('') : '<tr><td colspan="10">无匹配结果</td></tr>';
}

/* ======== 报告标签内容渲染 ======== */
function renderReportTab() {
  const el = $('reportContent');
  if (!el) return;
  const r = LAST_RESULT;
  if (!r) {
    el.innerHTML = '<p class="muted">请先在"志愿推荐"页输入分数并点击"获取推荐"，然后返回此页查看报告。</p>';
    return;
  }
  const isPhysics = r.subject === '物理科目组';
  const planCount = DATA.plan ? DATA.plan.length : 0;
  const uniqueColleges = DATA.plan ? new Set(DATA.plan.map(p => p.college_name)).size : 0;
  const totalQuota = DATA.plan ? DATA.plan.reduce((s, p) => s + (parseInt(p.plan_count) || 0), 0) : 0;
  let controlHtml = '—';
  if (DATA.control) {
    const rec = DATA.control.records || [];
    controlHtml = rec.filter(r2 => ['普通类本科批','普通类高职（专科）批'].includes(r2.category))
      .map(i => `${i.category.replace('普通类','')} ${i.control_line}分`).join(' / ') || '—';
  }

  function renderList(list, label, color) {
    if (!list.length) return '<p style="color:#999;margin:8px 0">无推荐</p>';
    let h = `<h3 style="color:#${color};margin:16px 0 8px">${label}（${list.length}所）</h3>`;
    h += '<div class="table-wrap"><table><thead><tr><th>层次</th><th>院校</th><th>专业</th><th>选科</th><th>计划</th><th>学费</th><th>办学</th><th>2025分</th></tr></thead><tbody>';
    list.forEach(c => {
      h += `<tr><td>${tierBadge(c._ti)}</td>
        <td><b>${c.college_name}</b></td>
        <td>${c.major_name||'—'}</td>
        <td>${c.subject_requirement||'不限'}</td>
        <td>${c.plan_count||'—'}</td>
        <td>${c.tuition?parseInt(c.tuition)+'/年':'—'}</td>
        <td>${c.ownership||'—'}</td>
        <td>${c._ms||'—'}</td></tr>`;
    });
    h += '</tbody></table></div>';
    return h;
  }


  // 构建分析数据
  const sa = deepStrategyAnalysis(r);

  function buildAnalysisHTML() {
    const tierItems = Object.entries(sa.tierDist).sort((a,b) => {
      const order = {'985':0,'211':1,'双一流':2,'省属重点':3,'普通本科':4,'专科':5};
      return (order[a[0]]||9) - (order[b[0]]||9);
    }).map(([k,v]) => `<span class="tb ${k==='985'?'t-985':k==='211'?'t-211':k==='双一流'?'t-syl':k==='省属重点'?'t-zd':'t-pt'}">${k} ${v}所</span>`).join(' ');

    const allItems = [...r.chong, ...r.wen, ...r.bao];
    const safety = getSafetyRate(r.chong, r.wen, r.bao);
    const cityDist = getCityDistribution(allItems);
    const riskTags = new Set();
    allItems.forEach(c => {
      const a = deepItemAnalysis(c, r.myRank, r.income);
      a.tags.forEach(t => riskTags.add(t));
    });

    return `
    <div class="zx-card full" style="margin:14px 0">
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:10px">
        <span style="font-size:14px;font-weight:600">📊 志愿梯度评估</span>
        <span style="font-size:13px;padding:3px 10px;border-radius:999px;background:#e8f5e9;color:#2e7d32;font-weight:600">${sa.gradientGrade}</span>
      </div>
      <p style="font-size:14px;margin:6px 0;line-height:1.7">${sa.gradientAdvice}</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">
        <div style="text-align:center;padding:8px;background:#ffebee;border-radius:8px"><div style="font-size:11px;color:#999">冲刺</div><div style="font-size:18px;font-weight:700;color:#c62828">${sa.cRatio}%</div></div>
        <div style="text-align:center;padding:8px;background:#e3f2fd;border-radius:8px"><div style="font-size:11px;color:#999">稳妥</div><div style="font-size:18px;font-weight:700;color:#1565c0">${sa.wRatio}%</div></div>
        <div style="text-align:center;padding:8px;background:#e8f5e9;border-radius:8px"><div style="font-size:11px;color:#999">保底</div><div style="font-size:18px;font-weight:700;color:#2e7d32">${sa.bRatio}%</div></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0">
        <span style="font-size:12px;color:#666;margin-right:4px">层次分布：</span>${tierItems || '<span class="muted">—</span>'}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0">
        <span style="font-size:12px;color:#666;margin-right:4px">热门专业方向：</span><span style="font-size:13px;font-weight:600">"计算机/软件 等"</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0">
        <span style="font-size:12px;color:#666;margin-right:4px">院校地域：</span><span style="font-size:13px">省内 ${sa.provinceItems} 所 (${Math.round(sa.provinceItems/Math.max(r.chong.length+r.wen.length+r.bao.length,1)*100)}%) · 省外 (${r.chong.length+r.wen.length+r.bao.length-sa.provinceItems}) 所</span>
      </div>
      ${riskTags.size ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0"><span style="font-size:12px;color:#666;margin-right:4px">涉及风险标签：</span>${[...riskTags].map(t => `<span style="font-size:11px;padding:2px 8px;background:#fff3e0;border-radius:4px;color:#e65100">${t}</span>`).join('')}</div>` : ''}
      
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin:12px 0">
        <div style="flex:1;min-width:180px;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center">
          <div style="font-size:12px;color:#999">安全率</div>
          <div style="font-size:24px;font-weight:700;color:${safety.color}">${safety.rate}%</div>
          <div style="font-size:12px;color:${safety.color}">${safety.grade}</div>
          <div style="font-size:11px;color:#999;margin-top:4px">保底×1 + 稳妥×0.6</div>
        </div>
        <div style="flex:2;min-width:220px;padding:12px;background:#f5f5f5;border-radius:8px">
          <div style="font-size:12px;color:#999;margin-bottom:6px">🌆 城市分布 Top ${Math.min(cityDist.top3.length,3)}</div>
          ${cityDist.top3.length ? cityDist.top3.map(function(c){return '<div style="display:flex;justify-content:space-between;padding:2px 0"><span>'+c[0]+'</span><span style="font-weight:600">'+c[1]+'所</span></div>';}).join('') : '<span style="color:#999">—</span>'}
          ${cityDist.all.length > 3 ? '<div style="font-size:11px;color:#999;margin-top:4px">共覆盖 '+cityDist.all.length+' 个城市</div>' : ''}
        </div>
        <div style="flex:1;min-width:130px;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center">
          <div style="font-size:12px;color:#999">院校总数</div>
          <div style="font-size:24px;font-weight:700">${allItems.length}</div>
          <div style="font-size:12px;color:#c62828">冲 ${r.chong.length}</div>
          <div style="font-size:12px;color:#1565c0">稳 ${r.wen.length}</div>
          <div style="font-size:12px;color:#2e7d32">保 ${r.bao.length}</div>
        </div>
      </div>
    </div>`;
  }

  // Build detailed per-item analysis
  function buildDetailedList(list, label, color) {
    if (!list.length) return '<p style="color:#999;margin:8px 0">无推荐</p>';
    let h = `<h3 style="color:#${color};margin:18px 0 8px">${label}（${list.length}所）</h3>`;
    h += `${list.map(c => {
      const an = deepItemAnalysis(c, r.myRank, r.income);
      return `<div style="margin:6px 0;padding:10px 12px;border:1px solid #eee;border-radius:8px;background:#fafafa">
        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap">
          <div>
            <span class="sb sb-${c._strategy}" style="margin-right:6px">${c._strategy}</span>
            <span class="tb ${c._ti==='985'?'t-985':c._ti==='211'?'t-211':c._ti==='双一流'?'t-syl':c._ti==='省属重点'?'t-zd':'t-pt'}">${c._ti}</span>
            <b style="font-size:14px;margin-left:6px">${c.college_name}</b>
            <span style="font-size:12px;color:#999;margin-left:4px">${c.major_name||'—'}</span>
          </div>
          <div style="font-size:12px;color:#666;white-space:nowrap">
            2025投档 ${c._ms||'—'}分 · <span class="${c._rg>0?'gc-pos':'gc-neg'}">${c._rg>0?'+'+fmt(c._rg):fmt(c._rg)}位</span> · 概率 ${c._prob}
          </div>
        </div>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;align-items:center">
          ${an.tags.map(t => `<span style="font-size:11px;padding:2px 7px;border-radius:4px;background:#f0f0f0;color:#555">${t}</span>`).join('')}
          <span style="font-size:12px;color:#888;margin-left:4px">${an.notes[0]}</span>
        </div>
      </div>`;
    }).join('')}`;
    return h;
  }

  el.innerHTML = `
    <div class="report-preview">
      <div class="report-actions">
        <button onclick="generateReport()" style="width:auto;padding:10px 24px;display:inline-flex;align-items:center;gap:6px">🖨️ 在新窗口打开（可打印）</button>
        <button onclick="generateReport()" style="width:auto;padding:10px 24px;display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#2e7d32,#1b5e20)">📥 打印/导出 PDF</button>
      </div>
      <div class="report-summary">
        <div class="info-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0">
          <div class="metric"><span style="font-size:13px;color:var(--muted)">分数</span><b>${r.score}</b></div>
          <div class="metric"><span style="font-size:13px;color:var(--muted)">位次</span><b>${fmt(r.myRank)}</b></div>
          <div class="metric"><span style="font-size:13px;color:var(--muted)">冲/稳/保</span><b style="color:#c62828">${r.chong.length}</b> / <b style="color:#1565c0">${r.wen.length}</b> / <b style="color:#2e7d32">${r.bao.length}</b></div>
          <div class="metric"><span style="font-size:13px;color:var(--muted)">梯队</span><b>${r.zx.tk} · ${r.zx.tn}</b></div>
        </div>
      </div>
      ${buildAnalysisHTML()}
      ${buildDetailedList(r.chong, '🔴 冲一冲（冲刺院校）', 'c62828')}
      ${buildDetailedList(r.wen, '🟡 稳一稳（稳妥院校）', '1565c0')}
      ${buildDetailedList(r.bao, '🟢 保一保（保底院校）', '2e7d32')}
      
      ${(() => {
        const allI = [...r.chong, ...r.wen, ...r.bao];
        return renderMajorAnalysis(allI);
      })()}

      <div style="margin:14px 0;padding:16px;background:#f3e5f5;border:1px solid #ce93d8;border-radius:10px">
        <h3 style="margin:0 0 10px;color:#6a1b9a;font-size:16px">📅 志愿填报时间表</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          <div style="padding:10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #ff9800">
            <div style="font-size:13px;font-weight:700;color:#e65100">提前批</div>
            <div style="font-size:14px">6/30 8:00 - 7/2 18:00</div>
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #2196f3">
            <div style="font-size:13px;font-weight:700;color:#1565c0">本科批 🎯</div>
            <div style="font-size:14px">7/3 8:00 - 7/6 18:00</div>
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #4caf50">
            <div style="font-size:13px;font-weight:700;color:#2e7d32">高职(专科)批</div>
            <div style="font-size:14px">7/29 8:00 - 8/1 18:00</div>
          </div>
        </div>
      </div>

      <div style="margin:14px 0;padding:16px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:10px">
        <h3 style="margin:0 0 10px;color:#1b5e20;font-size:16px">💡 填报小贴士</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5">
            <b style="color:#e65100">①</b> 专业组顺序按"冲稳保"降序，不要把"冲"放第一个然后全部填"冲"
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5">
            <b style="color:#1565c0">②</b> "稳"和"保"的院校强烈建议勾选<u>服从调剂</u>，否则退档直接掉到下一批
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5">
            <b style="color:#2e7d32">③</b> 体检限制：色盲/色弱避开化学/生物/医学，近视避开飞行/航海
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5">
            <b style="color:#6a1b9a">④</b> 部分专业要求数学/英语单科分数，务必查看目标院校《招生章程》
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5">
            <b style="color:#00838f">⑤</b> 录取时间：7/10起可查，7/12左右征集志愿
          </div>
        </div>
      </div>

      <div style="margin-top:16px;padding:12px;background:#fff8e1;border-left:4px solid #ffc107;border-radius:0 8px 8px 0">
        <p><strong>🎓 张雪峰视角：</strong>${r.zx.fl} · ${r.zx.tn}</p>
        <ul style="margin:8px 0 0 16px;font-size:13px">
          ${r.zx.sgs.map(s => '<li>'+s+'</li>').join('')}
        </ul>
      </div>
    </div>`;
}

/* ======== 深度分析引擎 v2 ======== */
function deepItemAnalysis(item, rank, income) {
  var tags = [], notes = [], warnings = [];
  var own = item.ownership || '';
  var name = item.college_name || '';
  var major = item.major_name || '';
  var tuition = parseInt(item.tuition) || 0;
  var city = item.city || '';
  var tier = item._ti || '普通本科';
  var rg = item._rg;
  var strategy = item._strategy || '';

  // 办学性质
  if (own.indexOf('公办') >= 0 && own.indexOf('民办') < 0) tags.push('♦️ 公办');
  if (own.indexOf('民办') >= 0) tags.push('□ 民办');
  if (tuition > 50000) tags.push('⚠️ 超高收费');
  else if (tuition > 30000) tags.push('⚠️ 高收费');

  // 专业方向
  var med = ['临床医学','口腔医学','麻醉学','护理','药学'];
  if (med.some(function(k) { return major.indexOf(k) >= 0; })) {
    tags.push('医学类');
    if (major.indexOf('临床') >= 0) notes.push('临床医学为长学制专业(5+3+3)，需做好长期学习准备');
  }
  var eng = ['计算机','软件','电子','电气','自动化','通信'];
  if (eng.some(function(k) { return major.indexOf(k) >= 0; })) {
    tags.push('工科热门');
    if (major.indexOf('计算机') >= 0) notes.push('计算机类就业面宽，薪资水平领先');
  }
  var fin = ['金融','经济','会计','财务'];
  if (fin.some(function(k) { return major.indexOf(k) >= 0; })) tags.push('经管类');
  if (major.indexOf('法学') >= 0) tags.push('法学类');
  if (major.indexOf('师范') >= 0 || major.indexOf('教育') >= 0) tags.push('师范类');
  if (major.indexOf('生物') >= 0) tags.push('生物类');
  if (major.indexOf('材料') >= 0) tags.push('材料类');
  if (major.indexOf('环境') >= 0) tags.push('环境类');

  // 特殊院校
  if (name.indexOf('警察') >= 0 || name.indexOf('公安') >= 0) {
    tags.push('警校/政审');
    warnings.push('需参加政审、面试和体能测试，请确认自身条件');
  }
  if (name.indexOf('中外') >= 0 || (item.notes && item.notes.indexOf('中外合作') >= 0)) {
    tags.push('中外合作');
    warnings.push('学费较高，确认家庭经济承受能力');
  }
  if (item.notes && item.notes.indexOf('定向') >= 0) {
    tags.push('定向培养');
    warnings.push('有服务期限制，毕业后需到指定单位工作');
  }

  // 录取概率分析
  if (strategy === '冲') {
    if (rg < -15000) notes.push('位次差距较大，录取概率低（<20%），仅作冲刺');
    else if (rg < -5000) notes.push('位次有一定差距，概率中等偏低（20-40%），可尝试冲刺');
    else notes.push('位次接近，值得一冲（40-60%）');
  } else if (strategy === '稳') {
    if (rg > 8000) notes.push('位次大幅超出，录取概率很高（>90%）');
    else if (rg > 2000) notes.push('位次有安全余量，录取概率高（70-90%）');
    else notes.push('位次相当，录取概率中等偏上（60-80%）');
  } else if (strategy === '保') {
    if (rg > 10000) notes.push('位次大幅领先，保底可靠（>95%）');
    else notes.push('位次有优势，保底可用（>85%）');
  }

  // 性价比分析
  if (tier === '985' || tier === '211') {
    notes.push('名校平台好，学历含金量高');
  } else if (tier === '省属重点') {
    notes.push('省属重点院校，省内就业认可度好');
  }

  if (income && tuition > 0) {
    var ratio = tuition / (income * 10000) * 100;
    if (ratio > 25) warnings.push('⚠ 学费占家庭年收入' + Math.round(ratio) + '%，请确认经济承受能力');
  }

  return { tags: tags, notes: notes, warnings: warnings };
}

function deepStrategyAnalysis(r){var t=r.chong.length+r.wen.length+r.bao.length;if(t===0)return null;var a=[].concat(r.chong,r.wen,r.bao);var c=Math.round(r.chong.length/t*100),w=Math.round(r.wen.length/t*100),b=Math.round(r.bao.length/t*100);var s=50,g='',v='';if(r.chong.length>=2&&r.wen.length>=2&&r.bao.length>=2){s=88;g='优秀';v='冲稳保三层完整，梯度合理。';}else if(r.chong.length>=1&&r.wen.length>=1&&r.bao.length>=1){s=72;g='良好';v='三层基本完整，建议适当增加志愿数量。';}else if(r.bao.length===0&&t>3){s=30;g='需改进';v='缺少保底院校！请增加2-3所保底防止滑档。';}else if(r.chong.length===0){s=45;g='偏保守';v='没有冲刺院校，建议增加1-3所冲刺。';}else if(r.wen.length===0){s=40;g='结构缺陷';v='缺少稳妥层院校！';}var td={};a.forEach(function(x){td[x._ti]=(td[x._ti]||0)+1;});var pi=a.filter(function(x){return isFujianCollege(x.college_name,x.city);}).length;var mm={};a.forEach(function(x){var n=x.major_name||'';if(n.indexOf('计算机')>=0||n.indexOf('软件')>=0)mm['CS']=(mm['CS']||0)+1;else if(n.indexOf('电子')>=0)mm['EE']=(mm['EE']||0)+1;else if(n.indexOf('临床')>=0||n.indexOf('护理')>=0)mm['MED']=(mm['MED']||0)+1;else if(n.indexOf('金融')>=0||n.indexOf('会计')>=0)mm['FIN']=(mm['FIN']||0)+1;else mm['OTH']=(mm['OTH']||0)+1;});var cn='';if(typeof DATA!=='undefined'&&DATA.control){var rec=DATA.control.records||[];var bl=rec.find(function(x){return x.track===r.subject&&x.category.indexOf('本科批')>=0;});if(bl){var gap=r.score-parseInt(bl.control_line);if(gap>100)cn='高于本科线'+gap+'分，位次优势明显。';else if(gap>50)cn='高于本科线'+gap+'分，选择空间中等。';else cn='高于本科线'+gap+'分，务必确保保底充足。';}}return{gradientScore:s,gradientGrade:g,gradientAdvice:v,cRatio:c,wRatio:w,bRatio:b,tierDist:td,provinceItems:pi,majorMap:mm,controlNote:cn};}
function renderGradientChart(s){
  if(!s) return "";
  var c = s.gradientScore >= 80 ? "#2e7d32" : s.gradientScore >= 60 ? "#e65100" : "#c62828";
  var l = s.gradientScore >= 80 ? "优秀" : s.gradientScore >= 60 ? "良好" : "需改进";
  var h = "<div style='margin:6px 0'><div style='display:flex;height:28px;border-radius:14px;overflow:hidden;margin:8px 0'>";
  h += "<div style='flex:" + s.cRatio + ";background:#ef5350;color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center'>冲" + s.cRatio + "%</div>";
  h += "<div style='flex:" + s.wRatio + ";background:#42a5f5;color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center'>稳" + s.wRatio + "%</div>";
  h += "<div style='flex:" + s.bRatio + ";background:#66bb6a;color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center'>保" + s.bRatio + "%</div></div>";
  h += "<div style='text-align:center'><span style='font-size:12px;padding:2px 10px;border-radius:999px;background:#f0f0f0;color:" + c + ";font-weight:600'>梯度评分: " + l + " (" + s.gradientScore + "/100)</span></div></div>";
  return h;
}/* ======== 一键生成报告（新窗口） ======== */

/* ======== 安全率计算 ======== */
function getSafetyRate(chong, wen, bao) {
  var total = chong.length + wen.length + bao.length;
  if (total === 0) return { rate: 0, grade: '无数据', color: '#999' };
  var score = bao.length * 1.0 + wen.length * 0.6;
  var rate = Math.round(score / total * 100);
  var grade = rate >= 80 ? '安全' : rate >= 60 ? '中等' : rate >= 40 ? '偏低' : '危险';
  var color = rate >= 80 ? '#2e7d32' : rate >= 60 ? '#e65100' : rate >= 40 ? '#ef6c00' : '#c62828';
  return { rate: rate, grade: grade, color: color, score: score };
}

/* ======== 城市分布统计 ======== */
function getCityDistribution(items) {
  var cityCount = {};
  items.forEach(function(c) {
    var city = c.city || c.college_city || '其他';
    if ((city === '其他' || !city) && c.college_name) {
      if (c.college_name.indexOf('北京') >= 0) city = '北京市';
      else if (c.college_name.indexOf('上海') >= 0) city = '上海市';
      else if (c.college_name.indexOf('广州') >= 0 || c.college_name.indexOf('广东') >= 0) city = '广州市';
      else city = '其他';
    }
    cityCount[city] = (cityCount[city] || 0) + 1;
  });
  var sorted = Object.entries(cityCount).sort(function(a, b) { return b[1] - a[1]; });
  var top3 = sorted.slice(0, 3);
  return { top3: top3, all: sorted };
}

/* ======== 专业深度分析 (基于MAJOR_DB) ======== */
function renderMajorAnalysis(items) {
  var majors = {};
  items.forEach(function(c) {
    var mn = (c.major_name || '').trim();
    if (!mn || mn === '—' || mn === '-') return;
    if (!majors[mn]) majors[mn] = [];
    majors[mn].push(c.college_name || '—');
  });
  var matched = [];
  Object.keys(majors).forEach(function(mn) {
    var colleges = majors[mn];
    var found = null;
    var foundKey = '';
    Object.keys(MAJOR_DB).forEach(function(key) {
      if (mn.indexOf(key) >= 0 || key.indexOf(mn) >= 0) {
        found = MAJOR_DB[key]; foundKey = key;
      }
    });
    if (!found) {
      Object.keys(MAJOR_DB).forEach(function(key) {
        var parts = key.replace(/[()]/g,'').split(/[（(]/);
        if (parts.length > 1) {
          var base = parts[0].trim();
          if (mn.indexOf(base) >= 0) { found = MAJOR_DB[key]; foundKey = key; }
        }
      });
    }
    matched.push({ name: mn, colleges: colleges, db: found, key: foundKey });
  });
  
  if (matched.length === 0) return '';
  
  var h = '<div class="card"><h2>📚 重点专业深度分析</h2>';
  matched.forEach(function(m) {
    if (!m.db) {
      h += '<div style="margin:10px 0;padding:10px 12px;border:1px solid #eee;border-radius:8px">';
      h += '<div style="font-weight:600">' + m.name + '</div>';
      h += '<div style="font-size:12px;color:#999;margin-top:4px">（暂无详细数据）</div></div>';
      return;
    }
    var d = m.db;
    h += '<div style="margin:12px 0;padding:14px 16px;border:1px solid #e0e0e0;border-radius:10px;background:#fafafa">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">';
    h += '<div><b style="font-size:15px">' + m.name + '</b>';
    h += '<span style="font-size:12px;color:#888;margin-left:8px">' + d.cat + ' · ' + d.dur + ' / ' + d.degree + '</span></div>';
    h += '<span style="font-size:13px;font-weight:600;color:#1565c0">出现在 ' + m.colleges.length + ' 所院校</span></div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0;font-size:13px">';
    h += '<div><span style="color:#999">核心课程</span><br><b>' + d.courses + '</b></div>';
    h += '<div><span style="color:#999">主要职业</span><br><b>' + d.careers + '</b></div>';
    h += '<div><span style="color:#999">薪资范围</span><br><b>' + d.salary + '</b></div>';
    h += '<div><span style="color:#999">从业证书</span><br><b>' + d.certs + '</b></div></div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin:6px 0">';
    h += '<span style="font-size:12px;padding:3px 10px;border-radius:999px;background:#00e676;color:#1b5e20">✅ 优势：' + d.pros + '</span>';
    h += '<span style="font-size:12px;padding:3px 10px;border-radius:999px;background:#ffcdd2;color:#b71c1c">⚠️ 劣势：' + d.cons + '</span></div>';
    if (d['适合']) {
      h += '<div style="font-size:12px;padding:4px 10px;background:#e3f2fd;border-radius:6px;color:#1565c0;margin-top:4px">👤 适合谁：' + d['适合'] + '</div>';
    }
    var gradPath = '考研：相关专业硕士';
    if (d.cat.indexOf('医学') >= 0) gradPath = '考研/规培率高，建议读研并完成规培';
    else if (d.cat.indexOf('工学') >= 0) gradPath = '读研比例较高，硕士起薪明显优于本科';
    else if (d.cat.indexOf('法学') >= 0) gradPath = '建议法考+读研，提升就业竞争力';
    else if (d.cat.indexOf('教育') >= 0) gradPath = '读研有利于评职称和进入重点学校';
    h += '<div style="font-size:12px;padding:4px 10px;background:#fff3e0;border-radius:6px;color:#e65100;margin-top:4px">📚 读研路径：' + gradPath + '</div>';
    h += '<div style="font-size:11px;color:#999;margin-top:6px">💡 常见误区：' + d.cat + (d.cat.indexOf('工学')>=0?' 并非所有工学都适合所有人，需结合兴趣和就业前景':' 需甄别院校培养方向差异') + '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}
function generateReport() {
  const r = LAST_RESULT;
  if (!r) { alert('请先在"志愿推荐"页生成推荐结果'); return; }

  const isPhysics = r.subject === '物理科目组';
  const title = `2026 福建${isPhysics ? '物理' : '历史'}组志愿填报报告`;
  const now = new Date().toLocaleString('zh-CN');

  const tierNames = { 'all':'全部','985':'985','211':'211','双一流':'双一流','省属重点':'省属重点','普通本科':'普通本科' };
  const ownNames = { 'all':'全部','公办':'公办','民办':'民办','中外合作办学':'中外合作办学' };

  const planCount = DATA.plan ? DATA.plan.length : 0;
  const uniqueColleges = DATA.plan ? new Set(DATA.plan.map(p => p.college_name)).size : 0;
  const totalQuota = DATA.plan ? DATA.plan.reduce((s, p) => s + (parseInt(p.plan_count) || 0), 0) : 0;

  let controlHtml = '—';
  if (DATA.control) {
    const rec = DATA.control.records || [];
    controlHtml = rec.filter(r2 => ['普通类本科批','普通类高职（专科）批'].includes(r2.category))
      .map(i => `${i.category.replace('普通类','')} ${i.control_line}分`).join(' / ') || '—';
  }

  function renderList(list, label, color) {
    if (!list.length) return '';
    let h = `<h3 style="color:#${color};margin:16px 0 8px;padding:8px 12px;background:#${color}15;border-radius:6px">${label}（${list.length}所）</h3>`;
    h += '<table><thead><tr><th>院校</th><th>专业</th><th>选科</th><th>计划</th><th>学费</th><th>办学</th><th>2025分</th><th>分差</th><th>位次差</th><th>概率</th></tr></thead><tbody>';
    list.forEach(c => {
      h += `<tr><td><b>${c.college_name}</b></td>
        <td>${c.major_name||'—'}</td>
        <td>${c.subject_requirement||'不限'}</td>
        <td>${c.plan_count||'—'}</td>
        <td>${c.tuition?parseInt(c.tuition)+'元/年':'—'}</td>
        <td>${c.ownership||'—'}</td>
        <td>${c._ms||'—'}</td>
        <td>${c._sg!=null?(c._sg>0?'+'+c._sg:c._sg):'—'}</td>
        <td>${c._rg!=null?(c._rg>0?'+'+c._rg:c._rg):'—'}</td>
        <td>${c._prob||'—'}</td></tr>`;
    });
    h += '</tbody></table>';
    return h;
  }

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; background: #f5f5f5; color: #333; }
  .header { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); color: #fff; padding: 40px 20px; text-align: center; }
  .header h1 { font-size: 26px; margin-bottom: 8px; }
  .header .subtitle { font-size: 13px; opacity: 0.8; }
  .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
  .card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .card h2 { font-size: 18px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #e8e8e8; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f8f9fa; padding: 8px 6px; text-align: left; border-bottom: 2px solid #dee2e6; white-space: nowrap; }
  td { padding: 6px; border-bottom: 1px solid #eee; }
  tr:hover { background: #f8f9fa; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-item { padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 8px; }
  .info-item .label { font-size: 12px; color: #999; }
  .info-item .value { font-size: 16px; font-weight: 600; margin-top: 2px; }
  .analysis-box { background: #fff8e1; border-left: 4px solid #ffc107; padding: 16px; border-radius: 0 8px 8px 0; line-height: 1.8; }
  .analysis-box ul { padding-left: 20px; }
  .analysis-box li { margin-bottom: 4px; }
  .risk-box { background: #ffebee; border-left: 4px solid #c62828; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; margin-top: 12px; }
  .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  .report-toolbar { position: sticky; top: 0; z-index: 999; background: #1a1a2e; color: #fff; padding: 12px 20px; display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .report-toolbar button { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
  .report-toolbar button:hover { background: rgba(255,255,255,0.25); }
  @media print { .report-toolbar { display: none !important; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .card { break-inside: avoid; } body { background: #fff; } table { font-size: 11px; } th, td { padding: 4px; } }
  @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <div class="subtitle">基于2026招生计划 + 2025录取数据 + 张雪峰思维框架 | 生成时间：${now}</div>
</div>
<div class="report-toolbar">
  <span style="font-size:13px;opacity:0.8">📄 报告操作</span>
  <button onclick="window.print()">🖨️ 打印 / 导出 PDF</button>
  <button onclick="window.close()">✖️ 关闭</button>
  <span style="font-size:12px;opacity:0.6">提示：打印时可选择"另存为 PDF"</span>
</div>
<div class="container">

  <div class="card">
    <h2>📋 考生画像</h2>
    <div class="info-grid">
      <div class="info-item"><div class="label">分数</div><div class="value">${r.score} 分</div></div>
      <div class="info-item"><div class="label">全省位次</div><div class="value">${fmt(r.myRank)} 名</div></div>
      <div class="info-item"><div class="label">科目组</div><div class="value">${r.subject}</div></div>
      <div class="info-item"><div class="label">选科组合</div><div class="value">${r.firstSub || '不限'} ${r.secondSub ? '+ '+r.secondSub : ''}</div></div>
      <div class="info-item"><div class="label">院校层次</div><div class="value">${tierNames[r.tierFilter] || '全部'}</div></div>
      <div class="info-item"><div class="label">办学性质</div><div class="value">${ownNames[r.ownershipFilter] || '全部'}</div></div>
      <div class="info-item"><div class="label">家庭年收入</div><div class="value">${r.income ? r.income + ' 万' : '未填写'}</div></div>
      <div class="info-item"><div class="label">省控线</div><div class="value">${controlHtml}</div></div>
    </div>
  </div>


  <div class="card">
    <h2>🎯 推荐概览</h2>
    <div class="info-grid">
      <div class="info-item" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff">
        <div class="label" style="color:rgba(255,255,255,0.8)">推荐策略</div>
        <div class="value" style="color:#fff">冲 ${r.chong.length} / 稳 ${r.wen.length} / 保 ${r.bao.length}</div>
      </div>
      <div class="info-item"><div class="label">学校梯队</div><div class="value">${r.zx.tk} · ${r.zx.tn}</div></div>
      <div class="info-item"><div class="label">家庭分档</div><div class="value">${r.zx.fl}</div></div>
      <div class="info-item"><div class="label">推荐总数</div><div class="value">${r.chong.length + r.wen.length + r.bao.length} 条</div></div>
    </div>
  </div>

  <div class="card">
    <h2>📊 志愿策略分析</h2>
    ${(() => { const sa = deepStrategyAnalysis(r);
      const tierItems = Object.entries(sa.tierDist).sort((a,b)=>{const o={'985':0,'211':1,'双一流':2,'省属重点':3,'普通本科':4,'专科':5};return(o[a[0]]||9)-(o[b[0]]||9)}).map(([k,v])=>`<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${k==='985'?'#fff3e0':k==='211'?'#e3f2fd':k==='双一流'?'#f3e5f5':k==='省属重点'?'#e8f5e9':'#f5f5f5'};color:${k==='985'?'#e65100':k==='211'?'#1565c0':k==='双一流'?'#7b1fa2':k==='省属重点'?'#2e7d32':'#666'}">${k} ${v}所</span>`).join(' ');
      const allItems = [...r.chong, ...r.wen, ...r.bao];
      const riskTags = new Set();
      const safety = getSafetyRate(r.chong, r.wen, r.bao);
      const cityDist = getCityDistribution(allItems);
      allItems.forEach(c => { deepItemAnalysis(c, r.myRank, r.income).tags.forEach(t => riskTags.add(t)); });
      return `
    <p style="font-size:14px;margin-bottom:10px;line-height:1.7"><strong>梯度评估：</strong>${sa.gradientGrade} — ${sa.gradientAdvice}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0">
      <div style="text-align:center;padding:10px;background:#ffebee;border-radius:8px"><div style="font-size:11px;color:#999">冲刺占比</div><div style="font-size:20px;font-weight:700;color:#c62828">${sa.cRatio}%</div></div>
      <div style="text-align:center;padding:10px;background:#e3f2fd;border-radius:8px"><div style="font-size:11px;color:#999">稳妥占比</div><div style="font-size:20px;font-weight:700;color:#1565c0">${sa.wRatio}%</div></div>
      <div style="text-align:center;padding:10px;background:#e8f5e9;border-radius:8px"><div style="font-size:11px;color:#999">保底占比</div><div style="font-size:20px;font-weight:700;color:#2e7d32">${sa.bRatio}%</div></div>
    </div>
    <div style="margin:8px 0"><span style="font-size:12px;color:#666">院校层次分布：</span>${tierItems}</div>
    <div style="margin:4px 0"><span style="font-size:12px;color:#666">热门专业方向：</span><span style="font-size:13px;font-weight:600">"计算机/软件 等"</span></div>
    <div style="margin:4px 0"><span style="font-size:12px;color:#666">院校地域：</span><span style="font-size:13px">省内 ${sa.provinceItems} 所 (${Math.round(sa.provinceItems/Math.max(r.chong.length+r.wen.length+r.bao.length,1)*100)}%) · 省外 (r.chong.length+r.wen.length+r.bao.length-sa.provinceItems) 所</span></div>
    ${riskTags.size ? `<div style="margin:8px 0"><span style="font-size:12px;color:#666">涉及风险标签：</span>${[...riskTags].map(t => `<span style="display:inline-block;font-size:11px;padding:2px 8px;margin:2px;background:#fff3e0;border-radius:4px;color:#e65100">${t}</span>`).join('')}</div>` : ''}

    <div style="display:flex;flex-wrap:wrap;gap:12px;margin:12px 0">
      <div style="flex:1;min-width:180px;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center">
        <div style="font-size:12px;color:#999">安全率</div>
        <div style="font-size:24px;font-weight:700;color:${safety.color}">${safety.rate}%</div>
        <div style="font-size:12px;color:${safety.color}">${safety.grade}</div>
        <div style="font-size:11px;color:#999;margin-top:4px">保底×1 + 稳妥×0.6</div>
      </div>
      <div style="flex:2;min-width:220px;padding:12px;background:#f5f5f5;border-radius:8px">
        <div style="font-size:12px;color:#999;margin-bottom:6px">🌆 城市分布 Top ${Math.min(cityDist.top3.length,3)}</div>
        ${cityDist.top3.length ? cityDist.top3.map(function(c){return '<div style="display:flex;justify-content:space-between;padding:2px 0"><span>'+c[0]+'</span><span style="font-weight:600">'+c[1]+'所</span></div>';}).join('') : '<span style="color:#999">—</span>'}
        ${cityDist.all.length > 3 ? '<div style="font-size:11px;color:#999;margin-top:4px">共覆盖 '+cityDist.all.length+' 个城市</div>' : ''}
      </div>
      <div style="flex:1;min-width:130px;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center">
        <div style="font-size:12px;color:#999">院校总数</div>
        <div style="font-size:24px;font-weight:700">${allItems.length}</div>
        <div style="font-size:12px;color:#c62828">冲 ${r.chong.length}</div>
        <div style="font-size:12px;color:#1565c0">稳 ${r.wen.length}</div>
        <div style="font-size:12px;color:#2e7d32">保 ${r.bao.length}</div>
      </div>
    </div>
  
    `;
    })()}
  </div>

  <div class="card">
    <h2>🎓 张雪峰视角分析</h2>
    <div class="analysis-box">
      <p><strong>学校梯队：</strong> ${r.zx.tk} · ${r.zx.tn}</p>
      <p><strong>家庭分档：</strong> ${r.zx.fl}</p>
      <p><strong>核心策略：</strong> ${r.zx.fs}</p>
      <p><strong>建议明细：</strong></p>
      <ul>${r.zx.sgs.map(s => '<li>'+s+'</li>').join('')}</ul>
      <p style="margin-top:12px;font-size:13px;color:#888">结合以上分析：${r.zx.fl === '富裕' ? '家庭条件优越，可重点考虑名校品牌和专业前景兼备的方向。' : r.zx.fl === '中产' ? '家庭条件较好，建议优先考虑有行业门槛的专业（临床/口腔/法学/电子），同时关注保研率。' : r.zx.fl === '小康' ? '建议以就业为导向，选择计算机、电气、护理等实用型专业，可关注省外公办院校的性价比。' : '建议优先考虑就业明确、学费适中的专业和院校，医学定向、师范类、农林类等值得重点关注。'} ${['S','A'].includes(r.zx.tk) ? '学校牌子是最大优势，选科可兼顾兴趣和就业前景。' : ['B','C'].includes(r.zx.tk) ? '专业选择比学校名气更重要，建议避开"天坑"专业。' : '建议重点关注就业率高的实用型专业，可考虑专升本路径。'}</p>
    </div>
  </div>

  <div class="card">
    <h2>📊 冲稳保志愿推荐</h2>
    ${(() => {
      function buildDetailedList(list, label, color) {
        if (!list.length) return '<p style="color:#999">无推荐</p>';
        let h = `<h3 style="color:#${color};margin:16px 0 8px;padding:8px 12px;background:#${color}15;border-radius:6px">${label}（${list.length}所）</h3>`;
        list.forEach(c => {
          const an = deepItemAnalysis(c, r.myRank, r.income);
          h += `<div style="margin:6px 0;padding:10px 12px;border:1px solid #eee;border-radius:8px;background:#fafafa">
            <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap">
              <div><b>${c.college_name}</b> <span style="color:#999;font-size:12px">${c.major_name||'—'}</span></div>
              <div style="font-size:12px;color:#666;white-space:nowrap">${c._ms||'—'}分 · ${c._rg>0?'+'+fmt(c._rg):fmt(c._rg)}位 · ${c._prob}</div>
            </div>
            <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;align-items:center">
              ${an.tags.map(t => `<span style="font-size:11px;padding:2px 7px;border-radius:4px;background:#f0f0f0;color:#555">${t}</span>`).join('')}
              <span style="font-size:12px;color:#888">${an.notes[0]}</span>
            </div>
          </div>`;
        });
        return h;
      }
      return (r.chong.length ? buildDetailedList(r.chong, '🔴 冲一冲（冲刺院校，需要运气）', 'c62828') : '') +
        (r.wen.length ? buildDetailedList(r.wen, '🟡 稳一稳（稳妥院校）', '1565c0') : '') +
        (r.bao.length ? buildDetailedList(r.bao, '🟢 保一保（保底院校）', '2e7d32') : '');
    })()}
  </div>

  <div class="card">
      ${(() => { const allI = [...r.chong, ...r.wen, ...r.bao]; return renderMajorAnalysis(allI); })()}

      <div style="margin:14px 0;padding:16px;background:#f3e5f5;border:1px solid #ce93d8;border-radius:10px">
        <h3 style="margin:0 0 10px;color:#6a1b9a;font-size:16px">📅 志愿填报时间表</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          <div style="padding:10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #ff9800">
            <div style="font-size:13px;font-weight:700;color:#e65100">提前批</div><div style="font-size:14px">6/30 8:00 - 7/2 18:00</div>
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #2196f3">
            <div style="font-size:13px;font-weight:700;color:#1565c0">本科批 🎯</div><div style="font-size:14px">7/3 8:00 - 7/6 18:00</div>
          </div>
          <div style="padding:10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #4caf50">
            <div style="font-size:13px;font-weight:700;color:#2e7d32">高职(专科)批</div><div style="font-size:14px">7/29 8:00 - 8/1 18:00</div>
          </div>
        </div>
      </div>

      <div style="margin:14px 0;padding:16px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:10px">
        <h3 style="margin:0 0 10px;color:#1b5e20;font-size:16px">💡 填报小贴士</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5"><b style="color:#e65100">①</b> 专业组顺序按"冲稳保"降序</div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5"><b style="color:#1565c0">②</b> "稳""保"建议勾选<u>服从调剂</u>，防退档</div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5"><b style="color:#2e7d32">③</b> 体检限制：色盲/色弱避开化学/生物/医学</div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5"><b style="color:#6a1b9a">④</b> 留意单科分数要求，查看《招生章程》</div>
          <div style="padding:10px;background:#fff;border-radius:8px;font-size:13px;line-height:1.5"><b style="color:#00838f">⑤</b> 7/10起查录取结果，7/12左右征集志愿</div>
        </div>
      </div>

    <h2>📈 招生计划数据概览</h2>
    <div class="info-grid">
      <div class="info-item"><div class="label">招生院校数</div><div class="value">${fmt(uniqueColleges)} 所</div></div>
      <div class="info-item"><div class="label">招生专业数</div><div class="value">${fmt(planCount)} 个</div></div>
      <div class="info-item"><div class="label">计划招生总数</div><div class="value">${fmt(totalQuota)} 人</div></div>
    </div>
  </div>

  <div class="card">
    <h2>⚠️ 风险提示</h2>
    <div class="risk-box">
      <p>⚠️ 本报告由 AI 辅助生成，仅供参考，不替代官方志愿填报系统。</p>
      <p>⚠️ 投档线数据参考 2025 年录取结果，2026 年实际录取可能有偏差。</p>
      <p>⚠️ 所有推荐结果需二次核查目标院校《招生章程》。</p>
      <p>⚠️ 正式填报前请以福建省教育考试院官方数据为准。</p>
    </div>
  </div>

</div>
<div class="footer">
  数据来源：2026 年福建省普通高校招生计划 · 2025 年福建省投档线 | 由 高考志愿填报系统 生成<br>
  建议使用 Chrome / Edge 浏览器打印为 PDF 保存
</div>
</body>
</html>`);
  win.document.close();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  $('generateBtn')?.addEventListener('click', generate);
  $('reportBtn')?.addEventListener('click', generateReport);
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn,.tab-panel').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      $(btn.dataset.tab)?.classList.add('active');
      if (btn.dataset.tab === 'tabReport') {
        renderReportTab();
      }
    });
  });
});

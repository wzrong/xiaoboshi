// workspace_paper.jsx — 出卷子：配置 → 组卷蓝图 → 成卷 → 精修 的完整流程
const { useState: pS, useEffect: pE, useRef: pR } = React;

// ── 题库（演示数据，覆盖记忆默认：人教版 · 七年级 · 数学《有理数》）──
// 每题：type choice|blank|solve · diff 1易/2中/3难 · kp 知识点 · answer · analysis
const PAPER_BANK = {
  "有理数": {
    choice: [
      { stem: "下列各数中，是负数的是（　）", options: ["+3", "0", "−2.5", "|−4|"], answer: "C", analysis: "−2.5 前有负号且不为 0，是负数；|−4|=4 为正数。", kp: "正负数的概念", diff: 1 },
      { stem: "−(−5) 的值是（　）", options: ["−5", "5", "0", "±5"], answer: "B", analysis: "一个数的相反数的相反数等于它本身，−(−5)=5。", kp: "相反数", diff: 1 },
      { stem: "若 |a|=3，则 a 等于（　）", options: ["3", "−3", "±3", "9"], answer: "C", analysis: "绝对值为 3 的数有 3 和 −3 两个。", kp: "绝对值", diff: 2 },
      { stem: "在数轴上，到原点距离为 2 的点表示的数是（　）", options: ["2", "−2", "±2", "4"], answer: "C", analysis: "数轴上到原点距离为 2 的点有两个，分别表示 2 和 −2。", kp: "数轴与绝对值", diff: 2 },
      { stem: "比较大小，下列正确的是（　）", options: ["−3 > −2", "−|−5| > 0", "−0.1 < −0.01", "−2 > 1"], answer: "C", analysis: "两负数比较，绝对值大的反而小，0.1>0.01，故 −0.1<−0.01。", kp: "有理数大小比较", diff: 2 },
      { stem: "计算 (−2)³ 的结果是（　）", options: ["−6", "6", "−8", "8"], answer: "C", analysis: "(−2)³=(−2)×(−2)×(−2)=−8，奇数个负因数，积为负。", kp: "有理数的乘方", diff: 2 },
      { stem: "下列运算结果为正数的是（　）", options: ["(−1)⁵", "(−3)+2", "(−4)×(−2)", "0−7"], answer: "C", analysis: "(−4)×(−2)=8>0；其余结果分别为 −1、−1、−7。", kp: "有理数的混合运算", diff: 2 },
      { stem: "若 a、b 互为相反数且都不为 0，则 a+b 与 a/b 的值分别是（　）", options: ["0，1", "0，−1", "1，−1", "−1，0"], answer: "B", analysis: "互为相反数之和为 0；a=−b，a/b=−1。", kp: "相反数的性质", diff: 3 },
    ],
    blank: [
      { stem: "−7 的相反数是 ______，绝对值是 ______。", answer: "7；7", analysis: "相反数改变符号；绝对值表示到原点的距离。", kp: "相反数与绝对值", diff: 1 },
      { stem: "比较大小：−2/3 ______ −3/4（填 > 或 <）。", answer: ">", analysis: "通分得 −8/12 与 −9/12，绝对值小的反而大。", kp: "有理数大小比较", diff: 2 },
      { stem: "数轴上点 A 表示 −3，将 A 向右移动 5 个单位后表示的数是 ______。", answer: "2", analysis: "−3+5=2。", kp: "数轴", diff: 2 },
      { stem: "计算：(−12)+(+5)+(−8)+10 = ______。", answer: "−5", analysis: "同号相加再异号相加：−20+15=−5。", kp: "有理数加法", diff: 2 },
      { stem: "若 |x−1|=2，则 x = ______。", answer: "3 或 −1", analysis: "x−1=±2，解得 x=3 或 x=−1。", kp: "绝对值方程", diff: 3 },
    ],
    solve: [
      { stem: "计算：(−8)+(−6)−(−10)+(−3)。", answer: "−7", analysis: "原式 =−8−6+10−3 =−7。先把减法化为加法，再同号相加。", kp: "有理数加减", diff: 1, score: 8 },
      { stem: "计算：(−2)² × 3 − (−18) ÷ (−3)。", answer: "6", analysis: "原式 =4×3 − 6 =12−6 =6。注意乘方优先、除法符号。", kp: "有理数混合运算", diff: 2, score: 9 },
      { stem: "计算：−1⁴ − [(−2)³ + (−3)² × (−1)] ÷ (−3)。", answer: "−1/3 的辨析见解析", analysis: "−1⁴=−1；中括号内 =−8+9×(−1)=−17；−17÷(−3)=17/3；原式 =−1−17/3=−20/3。", kp: "有理数混合运算", diff: 3, score: 10 },
      { stem: "某地一天early晨气温为 −3℃，中午上升了 8℃，傍晚又下降了 5℃。求傍晚的气温。", answer: "0℃", analysis: "−3+8−5=0（℃）。用正负数表示升降，列式计算。", kp: "有理数的实际应用", diff: 2, score: 8 },
      { stem: "已知 a 是最小的正整数，b 是绝对值最小的有理数，c 是最大的负整数，求 a−b+c 的值。", answer: "0", analysis: "a=1，b=0，c=−1，故 a−b+c=1−0+(−1)=0。", kp: "特殊有理数", diff: 3, score: 10 },
    ],
  },
};

const TYPE_META_P = {
  choice: { label: "选择题", short: "选择", defScore: 3 },
  blank: { label: "填空题", short: "填空", defScore: 3 },
  solve: { label: "解答题", short: "解答", defScore: 9 },
};
const NUM_CN = ["一", "二", "三", "四", "五", "六"];

function parsePaperQuery(q) {
  const t = q || "";
  const edition = (t.match(/(人教版|北师大版|部编版|苏教版|外研社|统编版|湘教版|沪科版)/) || [])[1];
  const grade = (t.match(/(高[一二三]|[七八九][上下]?册?|[一二三四五六]年级[上下]?册?)/) || [])[0];
  const subject = (t.match(/(数学|语文|英语|物理|化学|生物|历史|地理|政治|道德与法治|科学)/) || [])[1];
  const topic = (t.match(/《([^》]+)》/) || [])[1] || (/有理数/.test(t) ? "有理数" : null);
  const count = (t.match(/(\d+)\s*道/) || [])[1];
  return { edition, grade, subject, topic, count: count ? +count : null };
}

function paperMeta(q, mem) {
  const p = parsePaperQuery(q);
  return {
    topic: p.topic || "有理数",
    edition: p.edition || (mem && mem.edition) || "人教版",
    grade: p.grade || (mem && mem.grade) || "七年级",
    subject: p.subject || (mem && mem.subject) || "数学",
  };
}

// 默认组卷结构
function defaultStructure() {
  return [
    { type: "choice", count: 8, each: 3 },
    { type: "blank", count: 5, each: 3 },
    { type: "solve", count: 5, each: 9 },
  ];
}
function structureScore(structure) {
  return structure.reduce((s, r) => s + r.count * r.each, 0);
}

// 从题库取题（不足则用通用模板兜底），按难度由易到难排序
function pickQuestions(topic, type, n, diffBias) {
  const bank = (PAPER_BANK[topic] && PAPER_BANK[topic][type]) || [];
  const pool = bank.slice();
  // 难度偏好排序：偏易优先低 diff，偏难优先高 diff
  pool.sort((a, b) => diffBias === "hard" ? b.diff - a.diff : diffBias === "easy" ? a.diff - b.diff : a.diff - b.diff);
  const out = [];
  for (let i = 0; i < n; i++) {
    if (pool[i]) out.push({ ...pool[i] });
    else out.push(genericQuestion(topic, type, i, diffBias));
  }
  // section 内由易到难
  out.sort((a, b) => a.diff - b.diff);
  return out;
}

// 通用兜底题（题库不足或非数学学科时，按主题生成可信占位题）
function genericQuestion(topic, type, i, diffBias) {
  const d = diffBias === "hard" ? 3 : diffBias === "easy" ? 1 : (i % 3) + 1;
  if (type === "choice") {
    return { stem: `关于「${topic}」的下列说法，正确的是（　）`, options: ["说法 A", "说法 B（正确）", "说法 C", "说法 D"], answer: "B", analysis: `结合「${topic}」的核心概念逐项判断，B 项符合教材定义。`, kp: topic, diff: d };
  }
  if (type === "blank") {
    return { stem: `「${topic}」中的关键结论是：______。`, answer: "（参考教材正文）", analysis: `依据教材对「${topic}」的表述填写关键结论。`, kp: topic, diff: d };
  }
  return { stem: `请结合「${topic}」的知识，分析并解答下面的问题，写出必要的推理过程。`, answer: "（见解析）", analysis: `本题考查「${topic}」的综合运用，需分步说明依据。`, kp: topic, diff: d, score: TYPE_META_P.solve.defScore };
}

function buildPaper(meta, structure, diffBias) {
  const sections = structure.filter((r) => r.count > 0).map((r, si) => {
    const qs = pickQuestions(meta.topic, r.type, r.count, diffBias);
    return {
      type: r.type, each: r.each, label: TYPE_META_P[r.type].label,
      questions: qs.map((q) => ({ ...q, score: r.type === "solve" ? (q.score || r.each) : r.each })),
    };
  });
  const total = sections.reduce((s, sec) => s + sec.questions.reduce((a, q) => a + q.score, 0), 0);
  const minutes = Math.max(40, Math.round(total * 0.9 / 5) * 5);
  return { meta, sections, total, minutes, diffBias };
}

// ── 配置面板（Phase A）──
const DIFFS = [{ k: "easy", label: "偏易" }, { k: "mid", label: "适中" }, { k: "hard", label: "偏难" }];
const SCOPE_OPTS = ["全章复习", "1.1 正数和负数", "1.2 有理数", "1.3 有理数的加减", "1.4 有理数的乘除", "1.5 有理数的乘方"];

function PaperSetup({ meta, setMeta, structure, setStructure, diff, setDiff, scope, setScope, onBuild, mobile }) {
  const total = structureScore(structure);
  const qCount = structure.reduce((s, r) => s + r.count, 0);
  const setRow = (type, patch) => setStructure((st) => st.map((r) => (r.type === type ? { ...r, ...r, ...patch } : r)));
  const Stepper = ({ value, min = 0, max = 30, onChange }) => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 0, border: "1px solid var(--line)", borderRadius: 9, overflow: "hidden", background: "var(--surface)" }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 30, height: 30, border: "none", background: "transparent", color: "var(--ink-2)", cursor: "pointer", fontSize: 17, lineHeight: 1 }}>−</button>
      <span style={{ minWidth: 30, textAlign: "center", fontSize: 14, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-num)" }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 30, height: 30, border: "none", background: "transparent", color: "var(--ink-2)", cursor: "pointer", fontSize: 17, lineHeight: 1 }}>+</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="paper" size={20} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>组卷配置</h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[meta.edition, meta.subject, meta.grade].map((c, i) => (
              <span key={i} style={{ padding: "2px 9px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11, fontWeight: 700, color: "var(--ink-2)" }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 范围 */}
      <SetupBlock icon="book" title="考查范围">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SCOPE_OPTS.map((s) => {
            const on = scope.includes(s);
            return (
              <button key={s} onClick={() => setScope((sc) => s === "全章复习" ? ["全章复习"] : on ? sc.filter((x) => x !== s) : [...sc.filter((x) => x !== "全章复习"), s])}
                style={{ padding: "7px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", border: on ? "1px solid var(--brand)" : "1px solid var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)", color: on ? "var(--brand-deep)" : "var(--ink-2)", transition: "all .15s" }}>{s}</button>
            );
          })}
        </div>
      </SetupBlock>

      {/* 题型与题量 */}
      <SetupBlock icon="list" title="题型与题量">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {structure.map((r) => (
            <div key={r.type} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 58, fontSize: 13.5, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>{TYPE_META_P[r.type].label}</span>
              <Stepper value={r.count} onChange={(v) => setRow(r.type, { count: v })} />
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>每题</span>
              <Stepper value={r.each} min={1} max={20} onChange={(v) => setRow(r.type, { each: v })} />
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>分</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", fontFamily: "var(--font-num)" }}>{r.count * r.each} 分</span>
            </div>
          ))}
        </div>
      </SetupBlock>

      {/* 难度 */}
      <SetupBlock icon="target" title="难度梯度">
        <div style={{ display: "flex", gap: 8 }}>
          {DIFFS.map((d) => {
            const on = diff === d.k;
            return (
              <button key={d.k} onClick={() => setDiff(d.k)} style={{ flex: 1, padding: "10px", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", border: on ? "1px solid var(--brand)" : "1px solid var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)", color: on ? "var(--brand-deep)" : "var(--ink-2)", transition: "all .15s" }}>{d.label}</button>
            );
          })}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>题目会按难度由易到难排布，方便学生逐步进入。</div>
      </SetupBlock>

      {/* 概览 + 生成 */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18, padding: "14px 18px", borderRadius: 14, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700 }}>共 {qCount} 题</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--brand-deep)", fontFamily: "var(--font-num)", lineHeight: 1 }}>{total} <span style={{ fontSize: 13 }}>分</span></span>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={onBuild} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 13, border: "none", background: "var(--brand-grad)", backgroundColor: "var(--brand)", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-zh)", boxShadow: "0 10px 26px -12px var(--brand-glow)" }}>
          <Icon name="spark" size={16} /> 生成试卷
        </button>
      </div>
    </div>
  );
}

function SetupBlock({ icon, title, children }) {
  return (
    <div style={{ marginBottom: 16, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>
        <Icon name={icon} size={15} /> {title}
      </div>
      {children}
    </div>
  );
}

// ── 试卷视图（Phase B）──
const DIFF_DOT = { 1: { c: "oklch(0.62 0.13 150)", t: "易" }, 2: { c: "oklch(0.66 0.13 75)", t: "中" }, 3: { c: "oklch(0.6 0.18 25)", t: "难" } };

function PaperView({ paper, showAnswer, onSwap, onDelete, mobile }) {
  let qno = 0;
  return (
    <article style={{ maxWidth: 820, margin: "0 auto", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "0 10px 30px -18px rgba(30,40,60,.18)", padding: mobile ? "24px 18px" : "38px 46px" }}>
      {/* 卷头 */}
      <header style={{ textAlign: "center", borderBottom: "2px solid var(--ink)", paddingBottom: 16, marginBottom: 6 }}>
        <h1 contentEditable suppressContentEditableWarning style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 800, color: "var(--ink)", outline: "none" }}>{paper.meta.grade}{paper.meta.subject}《{paper.meta.topic}》单元检测卷</h1>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
          <span>满分：{paper.total} 分</span><span>时间：{paper.minutes} 分钟</span><span>{paper.meta.edition}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12, fontSize: 13, color: "var(--ink-2)" }}>
          <span>班级：________</span><span>姓名：________</span><span>得分：________</span>
        </div>
      </header>

      {paper.sections.map((sec, si) => {
        const secScore = sec.questions.reduce((a, q) => a + q.score, 0);
        return (
          <section key={si} style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", display: "flex", alignItems: "baseline", gap: 8 }}>
              {NUM_CN[si]}、{sec.label}
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>（本大题共 {sec.questions.length} 小题，每题 {sec.each} 分，共 {secScore} 分）</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sec.questions.map((q, qi) => {
                qno += 1;
                const dd = DIFF_DOT[q.diff] || DIFF_DOT[2];
                return (
                  <div key={qi} className="paper-q" style={{ position: "relative", paddingRight: mobile ? 0 : 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-num)", flexShrink: 0 }}>{qno}.</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p contentEditable suppressContentEditableWarning style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "var(--ink)", outline: "none" }}>
                          {q.stem}
                          <span title={`知识点：${q.kp}`} style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 3, verticalAlign: "middle", fontSize: 10, fontWeight: 700, color: dd.c }}>
                            <span style={{ width: 6, height: 6, borderRadius: 999, background: dd.c }} /> {dd.t}
                          </span>
                        </p>
                        {/* 选择题选项 */}
                        {sec.type === "choice" && (
                          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr", gap: "5px 18px", marginTop: 8 }}>
                            {q.options.map((op, oi) => (
                              <span key={oi} style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{"ABCD"[oi]}．{op}</span>
                            ))}
                          </div>
                        )}
                        {/* 填空/解答留白 */}
                        {sec.type === "blank" && <div style={{ height: 1, marginTop: 12 }} />}
                        {sec.type === "solve" && <div style={{ marginTop: 10, height: 64, borderRadius: 8, background: "repeating-linear-gradient(var(--surface-2) 0 31px, var(--line) 31px 32px)" }} />}
                        {/* 答案与解析 */}
                        {showAnswer && (
                          <div className="ans-pop" style={{ marginTop: 10, padding: "10px 13px", borderRadius: 10, background: "oklch(0.97 0.02 150)", border: "1px solid oklch(0.88 0.05 150)" }}>
                            <div style={{ fontSize: 12.5, fontWeight: 800, color: "oklch(0.42 0.12 150)", marginBottom: 4 }}>答案：{q.answer}</div>
                            <div style={{ fontSize: 12, lineHeight: 1.65, color: "var(--ink-2)" }}><b>解析：</b>{q.analysis}</div>
                          </div>
                        )}
                      </div>
                      {/* 题目操作 */}
                      {!mobile && (
                        <div className="paper-q-tools" style={{ flexShrink: 0, display: "flex", gap: 3, opacity: 0, transition: "opacity .15s" }}>
                          <button onClick={() => onSwap(si, qi)} data-tip="换一题" aria-label="换一题" style={qBtn}><Icon name="refresh" size={13} /></button>
                          <button onClick={() => onDelete(si, qi)} data-tip="删除" aria-label="删除" style={qBtn}><Icon name="trash" size={13} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <footer style={{ marginTop: 26, paddingTop: 14, borderTop: "1px dashed var(--line)", textAlign: "center", fontSize: 11.5, color: "var(--ink-3)" }}>
        全卷 {paper.total} 分 · 题目来自学科网三审三校权威题库 · 难度梯度由易到难
      </footer>
    </article>
  );
}
const qBtn = { width: 26, height: 26, borderRadius: 7, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" };

// ── 主组件 ──
function PaperWorkspace({ scenario, query, onHome, onSwitch, fromIntent, resume, loggedIn, nav }) {
  const mobile = useIsMobile();
  const M = window.AIDATA.USER_MEMORY;
  const mem = loggedIn ? { edition: "人教版", grade: "七年级", subject: "数学" } : null;
  const stored = window.ChatSession.scratch.paper2 || {};
  const isResume = !!resume;
  const initialQ = query || (isResume ? resume.title : "") || stored.q || "";
  const freshQuery = !isResume && !stored.paper && !!initialQ;

  const [meta, setMeta] = pS(() => paperMeta(initialQ || (mem ? "" : "有理数"), mem));
  const [structure, setStructure] = pS(stored.structure || defaultStructure());
  const [diff, setDiff] = pS(stored.diff || "mid");
  const [scope, setScope] = pS(stored.scope || ["全章复习"]);
  const [paper, setPaper] = pS(stored.paper || null);
  const [phase, setPhase] = pS(() => stored.paper ? "paper" : (isResume ? "paper" : "setup")); // setup | building | paper
  const [showAnswer, setShowAnswer] = pS(false);
  const [toast, setToast] = pS(null);
  const [rawQ, setRawQ] = pS(initialQ);

  pE(() => { if (isResume && !paper) { const m = paperMeta(initialQ, mem); setMeta(m); setPaper(buildPaper(m, defaultStructure(), "mid")); } }, []);

  const greet = <span>我来帮你<b style={{ color: "var(--brand-deep)" }}>出一份卷子</b>。右侧先配置题型、题量和难度——题目都从<b style={{ color: "var(--auth-ink)" }}>学科网权威题库</b>选取。确认后我就组卷，每道题都带答案与解析。</span>;
  const setupNote = (m) => <span>好的，按 <b>{m.edition} {m.grade}{m.subject} ·《{m.topic}》</b> 来出卷。右侧已经摆好了<b>组卷配置</b>——题型、题量、难度都可以调，调好点<b style={{ color: "var(--brand-deep)" }}>「生成试卷」</b>，我就从题库组卷。</span>;

  const [messages, setMessages] = pS(() => {
    if (isResume) return [{ role: "ai", node: <span>已为你恢复 <b>{resume.when}</b> 出的《{(resume.title || "").replace(/[《》]/g, "")}》，右侧就是当时的卷子，接着改就行。</span> }];
    if (stored.paper) return window.enterThread(scenario);
    if (fromIntent && query) {
      return [
        ...window.ChatSession.take(),
        ...(window.ChatSession.echoed(query) ? [] : [{ role: "user", text: query }]),
        { role: "ai", wide: true, intent: query, render: () => <InlineIntent query={query} onDone={() => { const m = paperMeta(query, mem); setMeta(m); setMessages((ms) => [...ms, { role: "ai", node: setupNote(m) }]); }} /> },
      ];
    }
    if (freshQuery) { const m = paperMeta(initialQ, mem); return [...window.ChatSession.take(), ...(window.ChatSession.echoed(query) ? [] : [{ role: "user", text: query }]), { role: "ai", node: setupNote(m) }]; }
    return window.enterThread(scenario, greet);
  });
  const PAPER_SUGS = ["再难一点", "解答题加到 6 道", "第 1 题换一道", "附上答案与解析"];
  const [sugs, setSugs] = pS(paper ? PAPER_SUGS : []);

  pE(() => { window.ChatSession.save(window.freezeChat(messages)); }, [messages]);
  pE(() => { window.ChatSession.scratch.paper2 = { q: rawQ, paper, structure, diff, scope }; }, [paper, structure, diff, scope]);

  const artFor = (pp) => ({ scenario: "paper", icon: "paper", title: `《${pp.meta.topic}》单元检测卷`, meta: `${pp.meta.edition} · ${pp.meta.grade} · ${pp.total}分` });
  const doneNote = (pp) => <span>《<b>{pp.meta.topic}</b>》的卷子组好了——共 {pp.sections.reduce((a, s) => a + s.questions.length, 0)} 题、{pp.total} 分，建议用时 {pp.minutes} 分钟，题目按难度由易到难排好，<b style={{ color: "var(--auth-ink)" }}>每题都配了答案和解析</b>。右侧可逐题「换一题」或直接点文字修改，也可以继续吩咐我调整。</span>;

  const build = () => {
    setPhase("building");
    setMessages((m) => [...m, { role: "ai", node: <span>正在从题库组卷，按难度梯度排布《{meta.topic}》…</span> }]);
    setTimeout(() => {
      const pp = buildPaper(meta, structure, diff);
      setPaper(pp); setPhase("paper"); setSugs(PAPER_SUGS);
      setMessages((m) => [...m, { role: "ai", node: doneNote(pp), artifact: artFor(pp) }]);
    }, 1400);
  };

  const backToSetup = (m) => { const mm = m || paperMeta(rawQ, mem); setMeta(mm); setPaper(null); setPhase("setup"); setMessages((ms) => [...ms, { role: "ai", node: setupNote(mm) }]); };

  // 试卷精修指令
  const applyPaperCmd = (text) => {
    if (!paper) return false;
    let pp = { ...paper, sections: paper.sections.map((s) => ({ ...s, questions: s.questions.slice() })) };
    if (/难|提高难度|加难/.test(text)) {
      const nb = paper.diffBias === "easy" ? "mid" : "hard";
      pp = buildPaper(meta, structure, nb); setDiff(nb); setPaper(pp);
      return <span>已把整卷难度上调为<b>{nb === "hard" ? "偏难" : "适中"}</b>，并重新按梯度排布。</span>;
    }
    if (/简单|容易|降低难度|易一点/.test(text)) {
      const nb = paper.diffBias === "hard" ? "mid" : "easy";
      pp = buildPaper(meta, structure, nb); setDiff(nb); setPaper(pp);
      return <span>已把整卷难度下调为<b>{nb === "easy" ? "偏易" : "适中"}</b>。</span>;
    }
    if (/答案|解析/.test(text)) { setShowAnswer(true); return <span>已在每题下方展开<b>答案与解析</b>，右上角也能随时开关。</span>; }
    const addM = text.match(/(选择|填空|解答)题?\s*(加到|改成|增加到?|设为)?\s*(\d+)\s*道?/);
    if (addM) {
      const typeMap = { 选择: "choice", 填空: "blank", 解答: "solve" };
      const type = typeMap[addM[1]]; const n = +addM[3];
      const ns = structure.map((r) => (r.type === type ? { ...r, count: n } : r));
      setStructure(ns); pp = buildPaper(meta, ns, paper.diffBias); setPaper(pp);
      return <span>已把<b>{addM[1]}题</b>调整为 <b>{n}</b> 道，全卷 {pp.total} 分。</span>;
    }
    const swapM = text.match(/第\s*(\d+)\s*题.*(换|替换|改)/);
    if (swapM) {
      const idx = +swapM[1]; let c = 0, done = false;
      pp.sections.forEach((s, si) => s.questions.forEach((q, qi) => { c += 1; if (c === idx && !done) { swapOne(pp, si, qi); done = true; } }));
      if (done) { setPaper(pp); return <span>已为<b>第 {idx} 题</b>换了一道同知识点、同分值的题目。</span>; }
    }
    return false;
  };

  const swapOne = (pp, si, qi) => {
    const sec = pp.sections[si];
    const used = new Set(sec.questions.map((q) => q.stem));
    const pool = pickQuestions(meta.topic, sec.type, sec.questions.length + 4, paper.diffBias).filter((q) => !used.has(q.stem));
    const repl = pool[0] || genericQuestion(meta.topic, sec.type, qi, paper.diffBias);
    sec.questions[qi] = { ...repl, score: sec.questions[qi].score };
  };
  const onSwap = (si, qi) => { const pp = { ...paper, sections: paper.sections.map((s) => ({ ...s, questions: s.questions.slice() })) }; swapOne(pp, si, qi); setPaper(pp); };
  const onDelete = (si, qi) => {
    const pp = { ...paper, sections: paper.sections.map((s) => ({ ...s, questions: s.questions.slice() })) };
    pp.sections[si].questions.splice(qi, 1);
    pp.total = pp.sections.reduce((s, sec) => s + sec.questions.reduce((a, q) => a + q.score, 0), 0);
    setPaper(pp);
  };

  const handleSend = (text) => {
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", typing: true }]);
    setTimeout(() => {
      if (phase === "paper") {
        const r = applyPaperCmd(text);
        if (r) { setMessages((m) => [...m.slice(0, -1), { role: "ai", node: r }]); return; }
        const pm = parsePaperQuery(text);
        if (pm.topic || pm.subject || text.length >= 5) { setMessages((m) => m.slice(0, -1)); backToSetup(paperMeta(text, mem)); setRawQ(text); return; }
        setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>可以说「再难一点」「解答题加到 6 道」「第 3 题换一道」「附答案解析」，或给我一个新课题重新出卷。</span> }]);
        return;
      }
      // 配置阶段：用对话也能改配置或直接生成
      if (/生成|出卷|开始|可以了|好了/.test(text)) { setMessages((m) => m.slice(0, -1)); build(); return; }
      const pm = parsePaperQuery(text);
      if (pm.topic || pm.subject) { const m2 = paperMeta(text, mem); setMeta(m2); setRawQ(text); setMessages((mm) => [...mm.slice(0, -1), { role: "ai", node: <span>好，改成《{m2.topic}》了，右侧配置好就点「生成试卷」。</span> }]); return; }
      setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>在右侧调好题型题量和难度，点「生成试卷」即可；也可以直接说「生成」。</span> }]);
    }, 600);
  };
  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages, localSend: handleSend });

  const exportPaper = () => { setToast("已生成 Word 试卷（演示）— 实际产品中将下载 .docx，含答题卡与答案"); setTimeout(() => setToast(null), 2800); };

  return (
    <WorkspaceShell scenario={scenario} onHome={onHome} onSwitch={onSwitch} nav={nav} headerRecognizing={headerRecognizing} mobilePanelLabel={phase === "paper" ? "试卷" : "组卷"} mobilePanelIcon="paper" openSheetKey={paper ? paper.total : null}>
      <ChatPanel messages={messages} onSend={send} suggestions={sugs} placeholder={phase === "paper" ? "调整卷子，或说「再难一点」…" : "描述要出的卷子…"} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
        {/* 工具栏 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface)", flexShrink: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{phase === "paper" ? "试卷" : "组卷配置"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--auth-ink)", fontWeight: 700 }}><Icon name="shield" size={13} /> 权威题库</span>
          <div style={{ flex: 1 }} />
          {phase === "paper" && (
            <button onClick={() => setShowAnswer((s) => !s)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 9, border: "1px solid " + (showAnswer ? "var(--brand)" : "var(--line)"), background: showAnswer ? "var(--brand-soft)" : "var(--surface)", color: showAnswer ? "var(--brand-deep)" : "var(--ink-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              <Icon name={showAnswer ? "check" : "quote"} size={13} /> 答案解析
            </button>
          )}
          {phase === "paper" && <Btn size="sm" kind="soft" icon="refresh" onClick={() => backToSetup()}>重新配置</Btn>}
          {phase === "paper" && <Btn size="sm" kind="soft" icon="download" onClick={exportPaper}>导出</Btn>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "16px 14px" : "26px clamp(18px,4%,48px)" }}>
          {phase === "building" ? (
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--brand-deep)", fontSize: 13, fontWeight: 700 }}>
                <BotAvatar size={26} glow /> 正在从权威题库组卷 <Dots />
              </div>
              {[40, 70, 70, 70, 90].map((h, i) => (
                <div key={i} className="ph-stripe" style={{ height: h, borderRadius: 12 }} />
              ))}
            </div>
          ) : phase === "paper" && paper ? (
            <PaperView paper={paper} showAnswer={showAnswer} onSwap={onSwap} onDelete={onDelete} mobile={mobile} />
          ) : (
            <PaperSetup meta={meta} setMeta={setMeta} structure={structure} setStructure={setStructure} diff={diff} setDiff={setDiff} scope={scope} setScope={setScope} onBuild={build} mobile={mobile} />
          )}
        </div>
        {toast && (
          <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "oklch(0.3 0.01 260 / .95)", color: "#fff", fontSize: 12.5, fontWeight: 600, padding: "9px 16px", borderRadius: 11, zIndex: 40, maxWidth: "80%", textAlign: "center" }}>{toast}</div>
        )}
      </div>
    </WorkspaceShell>
  );
}

Object.assign(window, { PaperWorkspace });

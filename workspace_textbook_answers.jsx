// workspace_textbook_answers.jsx — 问教材：固定组织原则，动态生成回答结构
// 原则：先理解问的是哪类知识问题，再选对应的回答结构。
// 模板控制"回答质量"（先给直接答案、能溯源就给出处、结构服务理解），
// 不控制"回答长相"——用户看到的是贴合问题的自然回答，而非每次一样的固定表格。

// ── 1. 问题分类器 ──
// concept 概念解释 | reason 原因解释 | compare 对比分析 | summary 归纳总结 | application 应用理解
function classifyQuestion(q) {
  const t = q || "";
  if (/异同|区别|对比|相比|不同点|和.{0,8}的?不同|与.{0,8}的?区别|哪个更|谁更|有什么不一样/.test(t)) return "compare";
  if (/为什么|为何|原因|凭什么|怎么.{0,6}(的|来的)|如何.{0,4}(产生|形成|发生|实现)|机理|道理/.test(t)) return "reason";
  if (/(有)?哪些|作用是?什么|作用有|包括|分为|分类|归纳|总结|特点有|意义|方法有/.test(t)) return "summary";
  if (/怎么用|如何(应用|运用|使用)|应用|用在|在.{0,8}(里|中).{0,4}(怎么|如何)|解决.{0,6}问题|实际中/.test(t)) return "application";
  return "concept"; // 什么是 / 是什么 / 定义 / 含义，以及兜底
}

const TYPE_META = {
  concept: { label: "概念解释", icon: "book", hue: 210, structure: "定义 → 出处 → 要点 → 示例 → 易错" },
  reason: { label: "原因解释", icon: "spark", hue: 35, structure: "结论 → 原因链 → 情境还原 → 误区" },
  compare: { label: "对比分析", icon: "layers", hue: 265, structure: "总体区别 → 维度对比 → 易混点 → 记忆法" },
  summary: { label: "归纳总结", icon: "list", hue: 150, structure: "总括 → 分点 → 场景 → 示例" },
  application: { label: "应用理解", icon: "target", hue: 25, structure: "场景 → 知识点 → 例子 → 提醒" },
};

// ── 2. 主题识别（给回答注入贴合问题的措辞；纯演示用，非真模型）──
function topicOf(q) {
  const t = q || "";
  const KNOWN = [
    { re: /光反应|暗反应|光合作用/, key: "photosynthesis" },
    { re: /有丝分裂|减数分裂/, key: "mitosis" },
    { re: /三角函数/, key: "trig" },
    { re: /电磁感应|法拉第/, key: "faraday" },
    { re: /噬菌体/, key: "phage" },
    { re: /环境描写/, key: "scenery" },
  ];
  const hit = KNOWN.find((k) => k.re.test(t));
  // 抽取一个"名词主体"用于兜底措辞
  const subject = (t.match(/《([^》]+)》/) || [])[1] ||
    (t.replace(/[?？。，,、]/g, "").replace(/^(什么是|请问|老师|为什么|怎么|如何|有哪些|说说|讲讲|解释一下|介绍一下)/, "").replace(/(是什么|的区别|的异同|有哪些|是怎么.*|怎么用|的作用|的原因|的意义).*$/, "").trim()) ||
    "这个知识点";
  return { key: hit ? hit.key : null, subject };
}

// ── 3. 回答生成器：根据"类型 + 主题"产出结构化回答 ──
// 每个回答 = { type, blocks:[...], follow:[...], citations:[...] }
// block.kind: answer/source/points/chain/table/example/pitfall/scene
function buildTbAnswer(q, book) {
  const type = classifyQuestion(q);
  const { key, subject } = topicOf(q);
  const A = window.AIDATA.TEXTBOOK_ANSWER;
  const src = book && book.edition ? `${book.edition} ${book.subject || ""}`.trim() : "人教版教材";

  // —— 精修样例：光反应 vs 暗反应（对比型，复用权威数据）——
  if (key === "photosynthesis" && type === "compare") {
    return {
      type: "compare",
      blocks: [
        { kind: "answer", text: A.summary },
        { kind: "table", cols: ["光反应", "暗反应"], colHues: [200, 145], rows: A.points.map((p) => ({ label: p.label, a: p.light, b: p.dark })) },
        { kind: "pitfall", title: "易混点", items: ["暗反应≠在黑暗中进行，有光无光均可，名字只是相对光反应而言。", "ATP 和 [H] 是两阶段的"纽带"，光反应供给、暗反应消耗，停光后很快耗尽。"] },
        { kind: "note", text: "记忆法：光反应"见光、放氧、产能"，暗反应"固碳、还原、耗能"。" },
      ],
      follow: ["举个例子", "生成对比导图", "出几道练习题"],
      citations: A.citations,
    };
  }

  // —— 通用模板（按类型生成贴合问题的自然回答）——
  const cite = (loc, quote) => ({ id: "c" + Math.random().toString(36).slice(2, 7), source: src || "教材", loc, quote });
  const defaultCites = [
    cite("教材正文 · 本节", `教材在介绍"${subject}"时给出了定义与典型例证，可作为作答依据。`),
  ];

  if (type === "concept") {
    return {
      type,
      blocks: [
        { kind: "answer", text: `${subject}是本节的核心概念——一句话说，它指的是教材中所界定的、用来刻画对应现象/对象的基本规定。` },
        { kind: "source", source: src, loc: "本节正文 · 概念定义处" },
        { kind: "points", title: "核心要点", items: [
          { label: "内涵", text: `${subject}的本质特征是什么——抓住定义里的关键限定词。` },
          { label: "外延", text: "它适用的范围与不适用的情形，避免以偏概全。" },
          { label: "联系", text: "与前后知识点的关系，理解它在知识体系中的位置。" },
        ] },
        { kind: "example", text: `举个例子：在典型情境中，${subject}表现为……（结合教材例题即可直观理解）。` },
        { kind: "pitfall", title: "易错点", items: [`容易把${subject}与相近概念混淆，注意定义里的限定条件。`] },
      ],
      follow: ["展开解释", "举个例子", "生成讲义版"],
      citations: defaultCites,
    };
  }
  if (type === "reason") {
    return {
      type,
      blocks: [
        { kind: "answer", text: `直接结论：之所以如此，根本原因在于${subject}背后的核心机制在起作用。` },
        { kind: "chain", title: "原因链条", steps: [
          "前提条件具备 —— 相关因素满足触发的基础。",
          "关键环节发生 —— 核心机制按规律推进。",
          "因此导致结果 —— 由机制必然推出所观察到的现象。",
        ] },
        { kind: "scene", title: "情境还原", items: ["把过程放回教材给出的实验/情境里，逐步对照每一环，结论就自然成立。"] },
        { kind: "pitfall", title: "常见误区", items: ["不要把"相关"当成"因果"，注意区分必要条件与充分条件。"] },
      ],
      follow: ["展开原因链", "还原实验过程", "出一道辨析题"],
      citations: defaultCites,
    };
  }
  if (type === "compare") {
    return {
      type,
      blocks: [
        { kind: "answer", text: `总体区别：两者在关键维度上各有侧重，下面按维度逐项对照最清楚。` },
        { kind: "table", cols: ["前者", "后者"], colHues: [200, 25], rows: [
          { label: "本质", a: "侧重点一", b: "侧重点二" },
          { label: "条件", a: "适用情形 A", b: "适用情形 B" },
          { label: "结果", a: "对应表现 A", b: "对应表现 B" },
        ] },
        { kind: "pitfall", title: "易混点", items: ["两者最容易被混淆的是……抓住本质维度即可区分。"] },
        { kind: "note", text: "记忆法：用一句口诀把两者的关键差异串起来，考试时不易记反。" },
      ],
      follow: ["举例说明", "生成对比导图", "出几道练习题"],
      citations: defaultCites,
    };
  }
  if (type === "summary") {
    return {
      type,
      blocks: [
        { kind: "answer", text: `总括来说，${subject}主要可以归纳为以下几个方面：` },
        { kind: "points", title: "分点归纳", ordered: true, items: [
          { label: "一", text: "第一方面 —— 最主要、最常考的一点。" },
          { label: "二", text: "第二方面 —— 与第一点并列或递进。" },
          { label: "三", text: "第三方面 —— 容易被忽略但同样重要。" },
        ] },
        { kind: "scene", title: "使用场景", items: ["答这类题时，先判断属于哪一类，再套用对应要点，做到不漏点。"] },
        { kind: "example", text: "示例：结合一段具体材料，逐条对应上面的归纳点即可形成完整答案。" },
      ],
      follow: ["每点展开", "配一个例子", "生成讲义版"],
      citations: defaultCites,
    };
  }
  // application
  return {
    type,
    blocks: [
      { kind: "answer", text: `应用场景：${subject}常用于解决以下这类实际问题。` },
      { kind: "points", title: "对应知识点", items: [
        { label: "用到", text: "解决问题时会调用的核心概念与公式/规律。" },
        { label: "怎么套", text: "把实际情境抽象成模型，再代入对应方法。" },
      ] },
      { kind: "example", text: "例子：给定一个真实情境，一步步把它转化为可计算/可分析的形式并求解。" },
      { kind: "pitfall", title: "易错提醒", items: ["注意单位、范围与适用条件，建模时别丢掉关键约束。"] },
    ],
    follow: ["给个完整例题", "讲讲建模思路", "出几道练习题"],
    citations: defaultCites,
  };
}

// ── 4. 回答渲染器：按 block 类型渲染，长相随问题而变 ──
function TbAnsBlocks({ blocks, CiteMark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {blocks.map((b, i) => {
        if (b.kind === "answer") {
          return (
            <p key={i} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.72, color: "var(--ink)", fontWeight: 500 }}>
              {b.text}
              {CiteMark && <CiteMark id="c1" n="1" />}
            </p>
          );
        }
        if (b.kind === "source") {
          return (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start", padding: "5px 11px", borderRadius: 9, background: "var(--auth-bg)", border: "1px solid var(--auth-border)", fontSize: 12, fontWeight: 700, color: "var(--auth-ink)" }}>
              <Icon name="shield" size={13} /> 依据 {b.source} · {b.loc}
            </div>
          );
        }
        if (b.kind === "points") {
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {b.title && <SecLabel icon="list">{b.title}</SecLabel>}
              {b.items.map((it, j) => (
                <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, minWidth: 22, height: 22, padding: "0 7px", borderRadius: 7, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 800, display: "inline-grid", placeItems: "center", marginTop: 1 }}>{b.ordered ? j + 1 : it.label}</span>
                  <p style={{ margin: 0, flex: 1, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)" }}>
                    {!b.ordered && <b style={{ color: "var(--ink)" }}>{it.label}：</b>}{it.text}
                  </p>
                </div>
              ))}
            </div>
          );
        }
        if (b.kind === "chain") {
          return (
            <div key={i}>
              {b.title && <SecLabel icon="spark">{b.title}</SecLabel>}
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 8 }}>
                {b.steps.map((s, j) => (
                  <div key={j} style={{ display: "flex", gap: 11, alignItems: "stretch" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 999, background: "var(--brand-grad)", backgroundColor: "var(--brand)", color: "#fff", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)" }}>{j + 1}</span>
                      {j < b.steps.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--brand-soft-border)", minHeight: 14 }} />}
                    </div>
                    <p style={{ margin: 0, paddingBottom: j < b.steps.length - 1 ? 14 : 0, fontSize: 13.5, lineHeight: 1.65, color: "var(--ink)", flex: 1 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (b.kind === "table") {
          return (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "78px 1fr 1fr", background: "var(--surface-2)", fontSize: 12.5, fontWeight: 800, color: "var(--ink-2)" }}>
                <div style={{ padding: "9px 12px" }}>维度</div>
                <div style={{ padding: "9px 12px", borderLeft: "1px solid var(--line)", color: `oklch(0.5 0.13 ${b.colHues ? b.colHues[0] : 200})` }}>{b.cols[0]}</div>
                <div style={{ padding: "9px 12px", borderLeft: "1px solid var(--line)", color: `oklch(0.52 0.12 ${b.colHues ? b.colHues[1] : 145})` }}>{b.cols[1]}</div>
              </div>
              {b.rows.map((r, j) => (
                <div key={j} style={{ display: "grid", gridTemplateColumns: "78px 1fr 1fr", fontSize: 12.5, lineHeight: 1.55, borderTop: "1px solid var(--line)" }}>
                  <div style={{ padding: "10px 12px", fontWeight: 700, color: "var(--ink-2)", background: "var(--surface-2)" }}>{r.label}</div>
                  <div style={{ padding: "10px 12px", borderLeft: "1px solid var(--line)", color: "var(--ink)" }}>{r.a}</div>
                  <div style={{ padding: "10px 12px", borderLeft: "1px solid var(--line)", color: "var(--ink)" }}>{r.b}</div>
                </div>
              ))}
            </div>
          );
        }
        if (b.kind === "example") {
          return (
            <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <span style={{ flexShrink: 0, color: "var(--brand-deep)", marginTop: 1 }}><Icon name="spark" size={16} /></span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)" }}>{b.text}</p>
            </div>
          );
        }
        if (b.kind === "scene") {
          return (
            <div key={i}>
              {b.title && <SecLabel icon="target">{b.title}</SecLabel>}
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                {b.items.map((s, j) => (
                  <p key={j} style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--ink-2)" }}>{s}</p>
                ))}
              </div>
            </div>
          );
        }
        if (b.kind === "pitfall") {
          return (
            <div key={i} style={{ borderRadius: 12, background: "oklch(0.97 0.025 60)", border: "1px solid oklch(0.88 0.06 60)", padding: "11px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "oklch(0.5 0.12 55)", marginBottom: 6 }}>
                <Icon name="alert" size={13} /> {b.title || "易错点"}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {b.items.map((s, j) => <li key={j} style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-2)" }}>{s}</li>)}
              </ul>
            </div>
          );
        }
        if (b.kind === "note") {
          return (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 13px", borderRadius: 10, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)" }}>
              <Icon name="spark" size={15} />
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "var(--brand-deep)", lineHeight: 1.6 }}>{b.text}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function SecLabel({ icon, children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "var(--ink-2)" }}>
      <Icon name={icon} size={14} /> {children}
    </div>
  );
}

// 完整回答气泡（替代旧的写死 AnswerBlock）
function DynamicAnswer({ ans, activeCite, setActiveCite, onFollow }) {
  const meta = TYPE_META[ans.type] || TYPE_META.concept;
  const CiteMark = ({ id, n }) => (
    <sup onMouseEnter={() => setActiveCite(id)} onMouseLeave={() => setActiveCite(null)}
      style={{ cursor: "pointer", fontSize: 10, fontWeight: 800, color: "#fff", background: activeCite === id ? "var(--accent)" : "var(--brand)", borderRadius: 5, padding: "1px 5px", margin: "0 2px", fontFamily: "var(--font-num)", transition: "background .15s", verticalAlign: "super" }}>{n}</sup>
  );
  return (
    <div className="ans-pop" style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <BotAvatar size={30} glow />
      <div style={{ flex: 1, minWidth: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "4px 16px 16px 16px", padding: "16px 18px", boxShadow: "0 8px 26px -20px rgba(0,0,0,.3)" }}>
        {/* 回答类型标识 — 让用户看到"系统理解了这是哪类问题" */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: `oklch(0.96 0.03 ${meta.hue})`, border: `1px solid oklch(0.88 0.06 ${meta.hue})`, color: `oklch(0.45 0.12 ${meta.hue})`, fontSize: 11, fontWeight: 800, marginBottom: 12 }}>
          <Icon name={meta.icon} size={12} /> {meta.label}
        </div>
        <TbAnsBlocks blocks={ans.blocks} CiteMark={CiteMark} />
        {/* 溯源条 */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--auth-ink)", fontWeight: 700 }}>
            <Icon name="shield" size={14} /> 依据教材原文 {ans.citations.length} 处，右侧可查出处
          </span>
        </div>
        {/* 后续动作 — 控制默认长度，把"展开/举例/讲义版"交给用户 */}
        {ans.follow && ans.follow.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ans.follow.map((f, i) => (
              <button key={i} onClick={() => onFollow && onFollow(f)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand-deep)"; e.currentTarget.style.background = "var(--brand-soft)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-2)"; e.currentTarget.style.background = "var(--surface)"; }}>
                <Icon name={f.includes("导图") ? "mindmap" : f.includes("练习") || f.includes("题") ? "paper" : f.includes("例") ? "spark" : "plus"} size={13} /> {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { classifyQuestion, buildTbAnswer, DynamicAnswer, TYPE_META });

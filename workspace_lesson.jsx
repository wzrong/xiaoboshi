// workspace_lesson.jsx — 写教案：真实成稿的教学设计工作台
// 左侧对话驱动，右侧生成一份结构完整、可直接编辑的教学设计文档。
const { useState: lS, useEffect: lE, useRef: lR } = React;

// ---- 从自然语言里解析课题信息 ----
function parseLessonQuery(q) {
  const text = q || "";
  const edition = (text.match(/(人教版|北师大版|部编版|苏教版|外研社|湘教版|沪科版|译林版|统编版)/) || [])[1] || null;
  const gradeRaw = (text.match(/(高[一二三]|[一二三四五六七八九]年级(上|下)?册?|[七八九][上下]册?)/) || [])[0] || null;
  const subject = (text.match(/(数学|语文|英语|物理|化学|生物|历史|地理|政治|道德与法治|音乐|美术|体育|科学|信息技术)/) || [])[1] || null;
  // 课题：优先书名号，其次去掉修饰词后的主体
  let topic = (text.match(/《([^》]+)》/) || [])[1];
  if (!topic) {
    topic = text
      .replace(/(帮我|请|给我|来一?份|写个?|做个?|生成|出个?)/g, "")
      .replace(/(人教版|北师大版|部编版|苏教版|外研社|湘教版|沪科版|译林版|统编版)/g, "")
      .replace(/(高[一二三]|[一二三四五六七八九]年级(上|下)?册?|[七八九][上下]册?)/g, "")
      .replace(/(数学|语文|英语|物理|化学|生物|历史|地理|政治|道德与法治|音乐|美术|体育|科学|信息技术)/g, "")
      .replace(/(的)?(教学设计|教案|详案|学案|导学案|学习任务单|说课稿?|教学方案)/g, "")
      .replace(/第\d+课/g, (m) => m)
      .trim()
      .replace(/^[,，、·\s]+|[,，、·\s]+$/g, "");
  }
  if (!topic) topic = "本节课内容";
  return { topic, edition, grade: gradeRaw, subject };
}

// ---- 教案大纲（可增删改）----
const LESSON_OUTLINE = [
  { key: "analysis", name: "教材分析", hint: "本节在教材/知识体系中的地位与作用" },
  { key: "students", name: "学情分析", hint: "学生已有基础、认知特点与困难" },
  { key: "objectives", name: "教学目标", hint: "知识技能 / 过程方法 / 情感态度 三维目标" },
  { key: "keypoints", name: "教学重难点", hint: "重点、难点与突破策略" },
  { key: "prep", name: "教学准备", hint: "课件、教具、学具与分组" },
  { key: "process", name: "教学过程", hint: "导入→探究→精讲→巩固→小结 五环节" },
  { key: "board", name: "板书设计", hint: "核心板书结构" },
  { key: "homework", name: "作业布置", hint: "必做 / 选做 分层作业" },
];
function buildOutline() {
  return LESSON_OUTLINE.map((o, i) => ({ id: "o" + i, key: o.key, name: o.name, hint: o.hint }));
}
function lessonMeta(q, mem) {
  const p = parseLessonQuery(q);
  return {
    topic: p.topic,
    edition: p.edition || (mem && mem.edition) || "人教版",
    grade: p.grade || (mem && mem.grade) || "七年级",
    subject: p.subject || (mem && mem.subject) || "数学",
    periods: "1 课时", type: "新授课",
  };
}

// ---- 教案文档生成器：按课题产出一份完整教学设计（可按 outline 重排/筛选）----
function buildLessonDoc(q, mem, outline) {
  const p = parseLessonQuery(q);
  const topic = p.topic;
  const edition = p.edition || (mem && mem.edition) || "人教版";
  const grade = p.grade || (mem && mem.grade) || "七年级";
  const subject = p.subject || (mem && mem.subject) || "数学";
  const doc = {
    topic, edition, grade, subject,
    periods: "1 课时",
    type: "新授课",
    sections: [
      {
        id: "analysis", name: "教材分析",
        paras: [
          `「${topic}」是${edition}${subject}${grade}教材中的重要内容，在知识体系中起承上启下的作用：它既是对已学知识的延伸与综合，又为后续学习奠定方法与思维基础。`,
          `教材通过具体情境引出${topic}，遵循"感知—理解—运用"的认知路径，注重引导学生经历知识的形成过程，体会其中蕴含的基本思想方法。`,
        ],
      },
      {
        id: "students", name: "学情分析",
        paras: [
          `${grade}学生已具备一定的前置知识与生活经验，能在教师引导下进行观察、比较和归纳，但抽象概括能力仍在发展中，对${topic}的本质理解容易停留在表面。`,
          `教学中需要借助直观素材与递进式问题串，帮助学生从具体情境逐步过渡到抽象理解，并通过变式练习巩固易混点。`,
        ],
      },
      {
        id: "objectives", name: "教学目标",
        list: [
          { tag: "知识与技能", text: `理解${topic}的核心概念与基本结论，能准确表述并在典型情境中正确运用。` },
          { tag: "过程与方法", text: `经历观察、猜想、验证、归纳的探究过程，体会从特殊到一般的思想方法，发展合作交流与表达能力。` },
          { tag: "情感态度与价值观", text: `在探究活动中获得成功体验，感受${subject}与现实生活的联系，激发学习兴趣与求知欲。` },
        ],
      },
      {
        id: "keypoints", name: "教学重难点",
        list: [
          { tag: "重点", text: `${topic}的核心概念、基本结论及其简单运用。` },
          { tag: "难点", text: `${topic}本质特征的抽象与概括，以及在变式情境中的灵活迁移。` },
          { tag: "突破策略", text: "以问题串驱动探究，借助直观演示与小组讨论搭建脚手架，通过对比辨析突破易混点。" },
        ],
      },
      {
        id: "prep", name: "教学准备",
        paras: ["多媒体课件、导学单；学生分组（4 人一组）；板书用具及相关教具/学具。"],
      },
      {
        id: "process", name: "教学过程",
        steps: [
          { stage: "一、情境导入", time: "5 分钟", teacher: `呈现与${topic}相关的生活情境或旧知问题，提出核心问题，引发认知冲突。`, student: "观察情境，尝试用已有知识回答，发现新问题。", intent: "从学生最近发展区切入，自然引出课题，明确学习目标。" },
          { stage: "二、探究新知", time: "15 分钟", teacher: `组织学生围绕${topic}开展操作/观察活动，用问题串引导：你发现了什么规律？能否用自己的话概括？`, student: "动手操作、小组讨论，记录发现，尝试归纳结论并汇报交流。", intent: "让学生经历知识的形成过程，在做中学，培养归纳概括能力。" },
          { stage: "三、精讲点拨", time: "8 分钟", teacher: `结合学生汇报，规范表述${topic}的结论；通过例题示范规范的思考路径与书写格式。`, student: "对照修正自己的表述，跟随例题理清思路，提出疑问。", intent: "在学生自主建构的基础上精准点拨，规范知识与方法。" },
          { stage: "四、巩固练习", time: "9 分钟", teacher: "布置基础题与变式题各 2 道，巡视指导，收集典型错误进行投影讲评。", student: "独立完成练习，同桌互批，参与错例分析。", intent: "分层递进巩固新知，通过错例辨析突破难点。" },
          { stage: "五、小结作业", time: "3 分钟", teacher: "引导学生从知识、方法、感受三方面总结；布置作业。", student: "自主梳理本课收获，互相补充。", intent: "完善认知结构，实现课内向课外的延伸。" },
        ],
      },
      {
        id: "board", name: "板书设计",
        board: { title: topic, left: ["核心概念 / 结论", "关键条件与注意点"], right: ["典型例题思路", "方法小结：观察 → 猜想 → 验证 → 归纳"] },
      },
      {
        id: "homework", name: "作业布置",
        list: [
          { tag: "必做", text: "教材本节课后习题（基础巩固）。" },
          { tag: "选做", text: `完成一道与${topic}相关的拓展题，下节课分享思路。` },
        ],
      },
    ],
  };
  if (!outline) return doc;
  const byKey = {};
  doc.sections.forEach((s) => { byKey[s.id] = s; });
  const sections = outline.map((o) => {
    if (byKey[o.key]) return { ...byKey[o.key], name: o.name };
    if (o.key === "reflect") return { id: "reflect", name: o.name, paras: [
      "本课以学生活动为主线，探究环节学生参与度较高；但部分小组归纳结论时表述不够严谨，下次可提前给出表述支架。",
      "练习反馈显示变式题正确率偏低，难点突破还需加强——可在精讲环节增加一组对比辨析，并布置针对性补偿练习。",
    ] };
    return { id: o.id || o.key, name: o.name, paras: [`（${o.name}）这一部分先留好位置——告诉我具体要求，我来帮你补充内容；也可以直接在此点击撰写。`] };
  });
  return { ...doc, sections };
}

// ---- 对话指令 → 文档修改 ----
function applyLessonCommand(text, doc) {
  const t = text || "";
  const clone = { ...doc, sections: doc.sections.map((s) => ({ ...s })) };
  if (/反思/.test(t)) {
    if (!clone.sections.find((s) => s.id === "reflect")) {
      clone.sections = [...clone.sections, {
        id: "reflect", name: "教学反思",
        paras: [
          "本课以学生活动为主线，探究环节学生参与度较高；但部分小组归纳结论时表述不够严谨，下次可提前给出表述支架。",
          "练习反馈显示变式题正确率偏低，说明难点突破还需加强——可在精讲环节增加一组对比辨析，并在课后布置针对性补偿练习。",
        ],
      }];
      return { doc: clone, reply: "已在文末补充「教学反思」，从课堂效果和改进方向两个角度写了初稿，你可以直接在右侧修改。" };
    }
    return { doc, reply: "「教学反思」已经在文档里了，可以直接在右侧编辑补充。" };
  }
  if (/分层/.test(t)) {
    clone.sections = clone.sections.map((s) => s.id === "homework" ? {
      ...s,
      list: [
        { tag: "A 层 · 基础", text: "教材课后习题 1–3 题，巩固本课核心结论。" },
        { tag: "B 层 · 提升", text: `变式练习 2 道，要求写出完整的思考过程。` },
        { tag: "C 层 · 拓展", text: `查找一个${clone.topic}在实际中的应用例子，写一段说明，下节课分享。` },
      ],
    } : s);
    return { doc: clone, reply: "已把作业改为 A/B/C 三层：基础巩固、能力提升、实践拓展，各层要求都写明了。" };
  }
  if (/细化|重难点/.test(t)) {
    clone.sections = clone.sections.map((s) => s.id === "keypoints" ? {
      ...s,
      list: [
        { tag: "重点", text: `${clone.topic}的核心概念、基本结论及其简单运用。` },
        { tag: "重点落实", text: "通过探究活动让结论由学生自己归纳得出；例题示范后安排同型练习即时检测。" },
        { tag: "难点", text: `${clone.topic}本质特征的抽象与概括，以及在变式情境中的灵活迁移。` },
        { tag: "难点成因", text: "学生的抽象概括能力尚在发展，容易被表面特征干扰，对适用条件关注不足。" },
        { tag: "突破策略", text: "①直观演示降低抽象度；②正反例对比辨析适用条件；③变式梯度练习实现迁移。" },
      ],
    } : s);
    return { doc: clone, reply: "已细化「教学重难点」：补充了重点落实方式、难点成因分析和三步突破策略。" };
  }
  if (/课时/.test(t)) {
    const m = t.match(/([一二两三四12234])\s*课时/);
    const n = m ? m[1].replace("两", "二") : "二";
    clone.periods = `${n} 课时`;
    return { doc: clone, reply: `已把课时调整为 ${clone.periods}，教学过程的环节安排你可以按课时在右侧拆分调整。` };
  }
  if (/导入|情境/.test(t)) {
    clone.sections = clone.sections.map((s) => s.id === "process" ? {
      ...s,
      steps: s.steps.map((st, i) => i === 0 ? { ...st, teacher: `播放一段贴近学生生活的短视频/实物演示，引出与${clone.topic}相关的真实问题，请学生先猜一猜。`, intent: "用真实情境激发兴趣，让学生带着问题进入学习。" } : st),
    } : s);
    return { doc: clone, reply: "已把导入环节改为更具体的情境式导入（短视频/实物演示 + 猜想），设计意图也同步更新了。" };
  }
  return null;
}

const LESSON_COLD = ["北师大版八下 平行四边形的判定 教学设计", "部编版历史八下 第18课 教学设计", "苏教版六下数学《正比例的意义》教案", "高一英语外研社必修2 Unit6 教学设计"];

// ---- 文档区的小组件 ----
function LsTag({ children }) {
  return <span style={{ flexShrink: 0, alignSelf: "flex-start", padding: "3px 9px", borderRadius: 7, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>{children}</span>;
}

function LsSection({ sec, idx, animate }) {
  const body = sec.paras ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sec.paras.map((p, i) => (
        <p key={i} contentEditable suppressContentEditableWarning style={{ margin: 0, fontSize: 13.5, lineHeight: 1.85, color: "var(--ink)", outline: "none" }}>{p}</p>
      ))}
    </div>
  ) : sec.list ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {sec.list.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <LsTag>{it.tag}</LsTag>
          <p contentEditable suppressContentEditableWarning style={{ margin: 0, flex: 1, fontSize: 13.5, lineHeight: 1.75, color: "var(--ink)", outline: "none" }}>{it.text}</p>
        </div>
      ))}
    </div>
  ) : sec.steps ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sec.steps.map((st, i) => (
        <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>{st.stage}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", fontFamily: "var(--font-num)" }}>{st.time}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <div style={{ padding: "9px 13px", borderRight: "1px solid var(--line)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--brand-deep)", marginBottom: 4 }}>教师活动</div>
              <p contentEditable suppressContentEditableWarning style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-2)", outline: "none" }}>{st.teacher}</p>
            </div>
            <div style={{ padding: "9px 13px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "oklch(0.55 0.12 175)", marginBottom: 4 }}>学生活动</div>
              <p contentEditable suppressContentEditableWarning style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-2)", outline: "none" }}>{st.student}</p>
            </div>
          </div>
          <div style={{ padding: "7px 13px", borderTop: "1px dashed var(--line)", display: "flex", gap: 7, alignItems: "baseline" }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--ink-3)", flexShrink: 0 }}>设计意图</span>
            <p contentEditable suppressContentEditableWarning style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--ink-3)", outline: "none" }}>{st.intent}</p>
          </div>
        </div>
      ))}
    </div>
  ) : sec.board ? (
    <div style={{ border: "1.5px solid var(--ink)", borderRadius: 4, padding: "14px 18px", background: "var(--surface-2)" }}>
      <div style={{ textAlign: "center", fontSize: 14.5, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>{sec.board.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sec.board.left.map((l, i) => <div key={i} contentEditable suppressContentEditableWarning style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, outline: "none" }}>· {l}</div>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sec.board.right.map((l, i) => <div key={i} contentEditable suppressContentEditableWarning style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, outline: "none" }}>· {l}</div>)}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section className={animate ? "block-pop" : ""} style={{ animationDelay: `${idx * 0.09}s` }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 9, margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--brand-grad)", backgroundColor: "var(--brand)", color: "#fff", fontSize: 11.5, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)", flexShrink: 0 }}>{idx + 1}</span>
        {sec.name}
      </h3>
      {body}
    </section>
  );
}

function LessonOutlinePanel({ meta, outline, setOutline, onConfirm, mobile }) {
  const rename = (id, name) => setOutline((o) => o.map((x) => (x.id === id ? { ...x, name } : x)));
  const remove = (id) => setOutline((o) => (o.length <= 2 ? o : o.filter((x) => x.id !== id)));
  const move = (id, dir) => setOutline((o) => {
    const i = o.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= o.length) return o;
    const n = o.slice();
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });
  const add = () => setOutline((o) => [...o, { id: "c" + Date.now().toString(36), key: "custom" + Date.now(), name: "新部分", hint: "自定义部分，点标题改名" }]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="list" size={20} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>《{meta.topic}》教案大纲</h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[meta.edition, meta.subject, meta.grade, meta.periods].map((c, i) => (
              <span key={i} style={{ padding: "2px 9px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11, fontWeight: 700, color: "var(--ink-2)" }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>
        <Icon name="spark" size={14} /> 先确认教案结构 —— 增删条目、调整顺序或改名，满意后再展开成完整内容。
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {outline.map((o, i) => (
          <div key={o.id} className="block-pop" style={{ animationDelay: `${i * 0.05}s`, display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 13, padding: "12px 14px" }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--brand-grad)", backgroundColor: "var(--brand)", color: "#fff", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)", flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input value={o.name} onChange={(e) => rename(o.id, e.target.value)} spellCheck={false}
                style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14.5, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-zh)", padding: 0 }} />
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{o.hint}</div>
            </div>
            <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
              <button onClick={() => move(o.id, -1)} disabled={i === 0} aria-label="上移" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: i === 0 ? "var(--line)" : "var(--ink-3)", display: "grid", placeItems: "center", cursor: i === 0 ? "default" : "pointer" }}><span style={{ display: "inline-flex", transform: "rotate(180deg)" }}><Icon name="chevron" size={14} /></span></button>
              <button onClick={() => move(o.id, 1)} disabled={i === outline.length - 1} aria-label="下移" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: i === outline.length - 1 ? "var(--line)" : "var(--ink-3)", display: "grid", placeItems: "center", cursor: i === outline.length - 1 ? "default" : "pointer" }}><Icon name="chevron" size={14} /></button>
              <button onClick={() => remove(o.id)} aria-label="删除" data-tip="删除" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "oklch(0.55 0.18 25)"; e.currentTarget.style.borderColor = "oklch(0.8 0.1 25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-3)"; e.currentTarget.style.borderColor = "var(--line)"; }}><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} style={{ width: "100%", marginTop: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", borderRadius: 12, border: "1px dashed var(--line)", background: "transparent", color: "var(--ink-3)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand-deep)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-3)"; }}>
        <Icon name="plus" size={15} sw={2.2} /> 添加一个部分
      </button>

      <div style={{ position: "sticky", bottom: 0, marginTop: 20, paddingTop: 14, display: "flex", justifyContent: "center" }}>
        <button onClick={onConfirm} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 13, border: "none", background: "var(--brand-grad)", backgroundColor: "var(--brand)", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-zh)", boxShadow: "0 10px 26px -12px var(--brand-glow)" }}>
          <Icon name="check" size={16} sw={2.6} /> 确认大纲，开始生成
        </button>
      </div>
    </div>
  );
}

function LessonWorkspace({ scenario, query, onHome, onSwitch, fromIntent, resume, loggedIn, nav }) {
  const mobile = useIsMobile();
  const M = window.AIDATA.USER_MEMORY;
  const mem = loggedIn ? { edition: "人教版", grade: "七年级", subject: "数学" } : null;
  const stored = window.ChatSession.scratch.lesson || {};
  const isResume = !!resume;
  const initialQ = query || (isResume ? resume.title : "") || stored.q || "";
  const buildResumeDoc = isResume && !stored.doc;
  const [doc, setDoc] = lS(() => stored.doc || (buildResumeDoc ? buildLessonDoc(initialQ, mem) : null));
  const freshQuery = !isResume && !stored.doc && !!initialQ; // a brand-new lesson request → outline first
  const [meta, setMeta] = lS(() => (freshQuery ? lessonMeta(initialQ, mem) : null));
  const [outline, setOutline] = lS(() => (freshQuery && !fromIntent ? buildOutline() : null));
  const [rawQ, setRawQ] = lS(freshQuery ? initialQ : "");
  const [generating, setGenerating] = lS(false);
  const [toast, setToast] = lS(null);
  const docRef = lR(null);

  const greet = <span>我来帮你写<b style={{ color: "var(--brand-deep)" }}>教案</b>。告诉我课题（最好带上版本和年级），我会生成一份包含教材分析、三维目标、教学过程、板书设计的完整教学设计，每一段都可以直接点击修改。</span>;

  const genDoc = (q, ol, after) => {
    setGenerating(true);
    setOutline(null);
    setTimeout(() => {
      const d = buildLessonDoc(q, mem, ol);
      setDoc(d);
      setGenerating(false);
      after && after(d);
    }, 1300);
  };
  const outlineNote = (m) => (
    <span>我先把《<b>{m.topic}</b>》这节课的教案<b>大纲</b>列在右侧了——你可以增删条目、调整顺序或改名字。满意后点 <b style={{ color: "var(--brand-deep)" }}>「确认大纲，开始生成」</b>，我再把每一部分展开成完整内容。</span>
  );
  const proposeOutline = (q) => {
    const m = lessonMeta(q, mem);
    setMeta(m); setRawQ(q); setDoc(null); setOutline(buildOutline());
    setMessages((ms) => [...ms.filter((x) => !x.typing), { role: "ai", node: outlineNote(m) }]);
  };
  const confirmOutline = () => {
    const m = meta;
    setMessages((ms) => [...ms, { role: "ai", node: <span>好的，正在按确认后的大纲展开《{m.topic}》的完整教学设计…</span> }]);
    genDoc(rawQ || m.topic, outline, (d) => { setMessages((ms) => [...ms, { role: "ai", node: doneNote(d), artifact: artFor(d) }]); setSugs(LESSON_SUGS); });
  };

  const [messages, setMessages] = lS(() => {
    if (isResume) {
      return [{ role: "ai", node: <span>已为你恢复 <b>{resume.when}</b> 写的《{(resume.title || "").replace(/[《》]/g, "")}》教学设计，右侧就是当时的成稿，接着改就行。</span> }];
    }
    if (stored.doc) return window.enterThread(scenario);
    if (fromIntent && query) {
      return [
        ...window.ChatSession.take(),
        ...(window.ChatSession.echoed(query) ? [] : [{ role: "user", text: query }]),
        { role: "ai", wide: true, intent: query, render: () => <InlineIntent query={query} onDone={() => { const m = lessonMeta(query, mem); setMeta(m); setRawQ(query); setOutline(buildOutline()); setMessages((ms) => [...ms, { role: "ai", node: outlineNote(m) }]); }} /> },
      ];
    }
    if (freshQuery) return [...window.ChatSession.take(), ...(window.ChatSession.echoed(query) ? [] : [{ role: "user", text: query }]), { role: "ai", node: outlineNote(lessonMeta(initialQ, mem)) }];
    return window.enterThread(scenario, greet);
  });
  const LESSON_SUGS = ["补充教学反思", "作业改成分层", "重难点再细化", "导入换成情境式"];
  const [sugs, setSugs] = lS(doc ? LESSON_SUGS : []);

  const artFor = (d) => ({ scenario: "lesson", icon: "lesson", title: `《${d.topic}》教学设计`, meta: `${d.edition} · ${d.grade} · ${d.subject}` });
  const doneNote = (d) => (
    <span>《<b>{d.topic}</b>》的教学设计已经成稿——按{d.edition}{d.grade}{d.subject}写的，包含教材分析、三维目标、五环节教学过程和板书设计，全部内容对齐<b style={{ color: "var(--auth-ink)" }}>课程标准与权威范例</b>。右侧任何一段都可以直接点击修改，也可以继续吩咐我调整。</span>
  );

  // 持久化
  lE(() => { window.ChatSession.save(window.freezeChat(messages)); }, [messages]);
  lE(() => { window.ChatSession.scratch.lesson = { doc, q: initialQ }; }, [doc]);

  const handleSend = (text, files) => {
    setMessages((m) => [...m, { role: "user", text, files }, { role: "ai", typing: true }]);
    setTimeout(() => {
      // 已成稿 → 先看是不是修改指令
      if (doc) {
        const r = applyLessonCommand(text, doc);
        if (r) {
          setDoc(r.doc);
          setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>{r.reply}</span> }]);
          return;
        }
        if ((text || "").length >= 4) { setMessages((m) => m.slice(0, -1)); proposeOutline(text); return; }
        setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>可以告诉我具体改哪里——比如「补充教学反思」「作业改成分层」，或者直接给我一个新课题。</span> }]);
        return;
      }
      // 大纲阶段 → 可用对话调整大纲，或重新列
      if (outline) {
        if (/反思/.test(text) && !outline.some((o) => o.key === "reflect")) {
          setOutline((o) => [...o, { id: "reflect", key: "reflect", name: "教学反思", hint: "课后反思与改进方向" }]);
          setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>已在大纲末尾加上「教学反思」，确认后会一并展开。</span> }]);
          return;
        }
        if ((text || "").length >= 4) { setMessages((m) => m.slice(0, -1)); proposeOutline(text); return; }
        setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>可以在右侧直接调整大纲；或者告诉我新的课题，我重新列。确认后我才开始展开。</span> }]);
        return;
      }
      // 还没有大纲/文档（问候态）→ 当作课题，先列大纲
      if ((text || "").length >= 2) { setMessages((m) => m.slice(0, -1)); proposeOutline(text); return; }
      setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>告诉我课题（最好带上版本和年级），我先列个大纲给你过目。</span> }]);
    }, 600);
  };
  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages, localSend: handleSend });

  const exportDoc = () => { setToast("已生成 Word 文档（演示）— 实际产品中将下载 .docx"); setTimeout(() => setToast(null), 2600); };

  return (
    <WorkspaceShell scenario={scenario} onHome={onHome} onSwitch={onSwitch} nav={nav} headerRecognizing={headerRecognizing} mobilePanelLabel="教案" mobilePanelIcon="lesson" openSheetKey={doc ? doc.topic : null}>
      <ChatPanel messages={messages} onSend={send} suggestions={sugs} placeholder="课题，或要修改的地方…" />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
        {/* 文档工具栏 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface)", flexShrink: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{outline ? "教案大纲" : "教学设计"}</span>
          {doc && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--auth-ink)", fontWeight: 700 }}><Icon name="shield" size={13} /> 对齐课标 · 权威底座</span>}
          {outline && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700 }}><Icon name="list" size={13} /> 确认后展开成文</span>}
          <div style={{ flex: 1 }} />
          {doc && <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>正文可直接点击编辑</span>}
          {doc && <Btn size="sm" kind="soft" icon="download" onClick={exportDoc}>导出 Word</Btn>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "16px 14px" : "26px clamp(18px,4%,48px)" }}>
          {generating ? (
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--brand-deep)", fontSize: 13, fontWeight: 700 }}>
                <BotAvatar size={26} glow /> 正在按课标生成教学设计 <Dots />
              </div>
              {[180, 320, 260, 380, 300].map((w, i) => (
                <div key={i} className="ph-stripe" style={{ height: i === 0 ? 30 : 70, borderRadius: 12, maxWidth: i === 0 ? w + 200 : "100%" }} />
              ))}
            </div>
          ) : outline ? (
            <LessonOutlinePanel meta={meta} outline={outline} setOutline={setOutline} onConfirm={confirmOutline} mobile={mobile} />
          ) : !doc ? (
            <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
              <div className="home-fade" style={{ width: "min(540px,100%)", textAlign: "center" }}>
                <div style={{ display: "inline-flex", marginBottom: 14 }}><ScenarioGlyph icon="lesson" hue={320} size={56} active /></div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: "0 0 7px" }}>来写一份教案吧</h2>
                <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "0 0 22px", lineHeight: 1.6 }}>在左侧告诉我课题（带上版本年级更准），或从例子开始：</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {LESSON_COLD.map((c, i) => (
                    <button key={i} onClick={() => send(c)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", borderRadius: 13, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "all .15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "none"; }}>
                      <Icon name="spark" size={16} />
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{c}</span>
                      <Icon name="arrow" size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <article ref={docRef} style={{ maxWidth: 800, margin: "0 auto", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow-card, 0 10px 30px -18px rgba(30,40,60,.18))", padding: mobile ? "22px 18px" : "34px 42px" }}>
            <header style={{ textAlign: "center", marginBottom: 22 }}>
              <h1 contentEditable suppressContentEditableWarning style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "var(--ink)", outline: "none" }}>《{doc.topic}》教学设计</h1>
              <div style={{ display: "flex", justifyContent: "center", gap: 7, flexWrap: "wrap" }}>
                {[doc.edition, doc.subject, doc.grade, doc.periods, doc.type].map((c, i) => (
                  <span key={i} style={{ padding: "3px 11px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)" }}>{c}</span>
                ))}
              </div>
            </header>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {doc.sections.map((sec, i) => <LsSection key={sec.id} sec={sec} idx={i} animate />)}
            </div>
            <footer style={{ marginTop: 26, paddingTop: 14, borderTop: "1px dashed var(--line)", textAlign: "center", fontSize: 11.5, color: "var(--ink-3)" }}>
              本设计对齐课程标准 · 结构参考学科网三审三校权威范例
            </footer>
            </article>
          )}
        </div>
        {toast && (
          <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "oklch(0.3 0.01 260 / .95)", color: "#fff", fontSize: 12.5, fontWeight: 600, padding: "9px 16px", borderRadius: 11, zIndex: 40, whiteSpace: "nowrap" }}>{toast}</div>
        )}
      </div>
    </WorkspaceShell>
  );
}

Object.assign(window, { LessonWorkspace });

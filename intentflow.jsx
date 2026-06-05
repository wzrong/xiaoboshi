// intentflow.jsx — AI intent recognition transition
const { useState: useStateIF, useEffect: useEffectIF } = React;

// crude keyword-based intent detection over the 7 scenarios
function detectScenario(text) {
  const t = text || "";
  const rules = [
    { id: "paper", kw: ["卷", "试卷", "组卷", "测试卷", "考试", "练习卷", "测验"] },
    { id: "lesson", kw: ["教案", "教学设计", "详案", "学案设计"] },
    { id: "courseware", kw: ["课件", "ppt", "幻灯", "演示", "互动", "游戏", "拖拽", "课堂活动", "抢答", "互动课件"] },
    { id: "mindmap", kw: ["导图", "思维导图", "知识结构", "脑图", "梳理"] },
    { id: "textbook", kw: ["为什么", "区别", "什么是", "怎么", "解释", "原理", "讲讲", "?", "？", "问"] },
    { id: "find", kw: ["找", "资源", "练习", "学案", "微课", "素材", "下载", "题"] },
  ];
  for (const r of rules) {
    if (r.kw.some((k) => t.toLowerCase().includes(k.toLowerCase()))) return r.id;
  }
  return "general";
}

// Stricter detector used for RE-ROUTING inside a workspace. Only fires on an
// explicit "make a different thing" cue — weak/ambiguous words (题, 练习, 互动…)
// must NOT pull the teacher out of the tool they're already iterating in.
function detectSwitchTarget(text) {
  const t = (text || "").toLowerCase();
  const strong = [
    { id: "paper", kw: ["出卷", "出一份卷", "出张卷", "组卷", "出试卷", "出一套", "出份卷", "生成试卷", "出测试卷", "出练习卷", "来份卷子", "出个卷子", "出份卷子", "做份卷子", "做一份卷子", "出道卷子"] },
    { id: "lesson", kw: ["写教案", "出教案", "做教案", "生成教案", "教学设计", "写个教案", "来份教案"] },
    { id: "courseware", kw: ["做课件", "做个课件", "做ppt", "做个ppt", "生成课件", "做互动课件", "来个课件", "做张ppt", "做幻灯", "做演示文稿"] },
    { id: "mindmap", kw: ["思维导图", "画导图", "做导图", "知识导图", "脑图", "画个导图", "画张导图"] },
    { id: "find", kw: ["找资源", "找一些", "找一份", "找点", "找几份", "找现成", "搜资源", "搜一些", "下载资源", "有没有现成"] },
    { id: "textbook", kw: ["问教材", "查教材", "翻教材", "教材里", "课本里", "课本上", "教材上"] },
  ];
  for (const r of strong) {
    if (r.kw.some((k) => t.includes(k))) return r.id;
  }
  return null; // no explicit switch cue
}

// extract pseudo entities to display
function extractEntities(text) {
  const t = text || "";
  const ents = [];
  const editions = ["人教版", "北师大版", "苏教版", "外研版", "统编版", "沪教版"];
  const grades = ["七年级", "八年级", "九年级", "高一", "高二", "高三", "初一", "初二", "初三", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
  const subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治", "道德与法治", "科学"];
  editions.forEach((e) => t.includes(e) && ents.push({ k: "版本", v: e }));
  grades.forEach((g) => t.includes(g) && ents.push({ k: "学段", v: g }));
  subjects.forEach((s) => t.includes(s) && ents.push({ k: "学科", v: s }));
  // grab a 《》 topic
  const m = t.match(/《(.+?)》/);
  if (m) ents.push({ k: "知识点", v: m[1] });
  if (ents.length === 0) ents.push({ k: "需求", v: "教学创作" });
  return ents;
}

function IntentFlow({ query, onDone }) {
  const S = window.AIDATA.SCENARIOS;
  const target = detectScenario(query);
  const scenario = S.find((s) => s.id === target);
  const entities = extractEntities(query);
  const [step, setStep] = useStateIF(0);
  // steps: 0 understand, 1 entities, 2 retrieve authority, 3 matched, 4 done->transition

  useEffectIF(() => {
    const timers = [];
    timers.push(setTimeout(() => setStep(1), 700));
    timers.push(setTimeout(() => setStep(2), 1500));
    timers.push(setTimeout(() => setStep(3), 2500));
    timers.push(setTimeout(() => setStep(4), 3450));
    timers.push(setTimeout(() => onDone(target), 4350));
    return () => timers.forEach(clearTimeout);
  }, []);

  const Step = ({ idx, icon, children, accent }) => {
    const state = step > idx ? "done" : step === idx ? "active" : "wait";
    return (
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          opacity: state === "wait" ? 0.3 : 1,
          transform: state === "wait" ? "translateY(6px)" : "none",
          transition: "all .4s ease",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            background:
              state === "done"
                ? "var(--brand)"
                : state === "active"
                ? "var(--brand-soft)"
                : "var(--line)",
            color: state === "done" ? "#fff" : "var(--brand)",
            border: state === "active" ? "2px solid var(--brand)" : "none",
            transition: "all .3s",
          }}
        >
          {state === "done" ? (
            <Icon name="check" size={16} sw={2.6} />
          ) : (
            <Icon name={icon} size={15} sw={2} />
          )}
        </div>
        <div style={{ flex: 1, paddingTop: 3 }}>{children}</div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--intent-bg)",
      }}
    >
      <div
        className="intent-card"
        style={{
          width: "min(560px, 92vw)",
          background: "var(--surface)",
          borderRadius: 26,
          border: "1px solid var(--line)",
          boxShadow: "0 40px 90px -50px rgba(0,0,0,.45)",
          padding: "34px 34px 30px",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            <BotAvatar size={48} glow />
            <span className="bot-ring" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
              AI 小博士正在理解 {step < 4 && <Dots />}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>
              意图识别 · 自动匹配场景
            </div>
          </div>
        </div>

        {/* user query echo */}
        <div
          style={{
            background: "var(--brand-soft)",
            border: "1px solid var(--brand-soft-border)",
            borderRadius: "16px 16px 16px 4px",
            padding: "12px 15px",
            margin: "16px 0 22px",
            fontSize: 14.5,
            color: "var(--brand-deep)",
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          "{query}"
        </div>

        {/* steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Step idx={0} icon="spark">
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>理解你的需求</div>
          </Step>

          <Step idx={1} icon="filter">
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", marginBottom: step >= 1 ? 9 : 0 }}>
              提取关键信息
            </div>
            {step >= 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {entities.map((e, i) => (
                  <span
                    key={i}
                    className="ent-pop"
                    style={{
                      animationDelay: `${i * 0.09}s`,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "var(--surface-2)",
                      border: "1px solid var(--line)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--ink-2)",
                    }}
                  >
                    <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{e.k}</span>
                    <span style={{ color: "var(--brand-deep)", fontWeight: 700 }}>{e.v}</span>
                  </span>
                ))}
              </div>
            )}
          </Step>

          <Step idx={2} icon="shield">
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>
              检索学科网权威资源库
            </div>
            {step >= 2 && (
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>
                匹配 <b style={{ color: "var(--auth-ink)" }}>三审三校</b> 精品内容作为创作底座
              </div>
            )}
          </Step>

          <Step idx={3} icon="check">
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>识别场景</div>
            {step >= 3 && (
              <div
                className="match-pop"
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: `oklch(0.96 0.04 ${scenario.hue})`,
                  border: `1px solid oklch(0.82 0.08 ${scenario.hue})`,
                }}
              >
                <ScenarioGlyph icon={scenario.icon} hue={scenario.hue} size={42} active />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)" }}>{scenario.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{scenario.tagline}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: `oklch(0.5 0.14 ${scenario.hue})`, fontFamily: "var(--font-num)" }}>
                    97%
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>匹配度</div>
                </div>
              </div>
            )}
          </Step>
        </div>

        {step >= 4 && (
          <div className="enter-pop" style={{ marginTop: 22, textAlign: "center", fontSize: 13.5, color: "var(--ink-2)", fontWeight: 600 }}>
            正在进入 <b style={{ color: "var(--brand-deep)" }}>{scenario.name}</b> 工作台…
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { IntentFlow, detectScenario, detectSwitchTarget, extractEntities });

// ---- Inline intent recognition: lives inside a chat bubble ----
function InlineIntent({ query, onDone }) {
  const S = window.AIDATA.SCENARIOS;
  const target = detectScenario(query);
  const isGeneral = target === "general";
  const scenario = S.find((s) => s.id === target) || window.AIDATA.GENERAL;
  const entities = extractEntities(query);
  const [step, setStep] = React.useState(0);
  // 0 understand, 1 entities, 2 retrieve, 3 matched, 4 done

  React.useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setStep(1), 650));
    timers.push(setTimeout(() => setStep(2), 1400));
    timers.push(setTimeout(() => setStep(3), 2300));
    timers.push(setTimeout(() => setStep(4), 3150));
    timers.push(setTimeout(() => onDone && onDone(target), 3700));
    return () => timers.forEach(clearTimeout);
  }, []);

  const Row = ({ idx, icon, label, children }) => {
    const state = step > idx ? "done" : step === idx ? "active" : "wait";
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: state === "wait" ? 0.35 : 1, transition: "opacity .35s" }}>
        <div style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", marginTop: 1, background: state === "done" ? "var(--brand)" : state === "active" ? "var(--brand-soft)" : "var(--line)", color: state === "done" ? "#fff" : "var(--brand)", border: state === "active" ? "1.5px solid var(--brand)" : "none", transition: "all .3s" }}>
          {state === "done" ? <Icon name="check" size={12} sw={2.8} /> : <Icon name={icon} size={11} sw={2} />}
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{label}</div>
          {state !== "wait" && children}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 240 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>
        正在理解你的需求 {step < 4 && <Dots />}
      </div>
      <Row idx={0} icon="spark" label="理解需求" />
      <Row idx={1} icon="filter" label="提取关键信息">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
          {entities.map((e, i) => (
            <span key={i} className="ent-pop" style={{ animationDelay: `${i * 0.08}s`, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 600 }}>
              <span style={{ color: "var(--ink-3)", fontSize: 10.5 }}>{e.k}</span>
              <span style={{ color: "var(--brand-deep)", fontWeight: 700 }}>{e.v}</span>
            </span>
          ))}
        </div>
      </Row>
      <Row idx={2} icon="shield" label="检索学科网权威库">
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>匹配三审三校精品内容作为底座</div>
      </Row>
      <Row idx={3} icon="check" label={isGeneral ? "未匹配到专用工具" : "识别场景"}>
        {step >= 3 && (
          <div className="match-pop" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, padding: 9, borderRadius: 11, background: `oklch(0.96 0.04 ${scenario.hue})`, border: `1px solid oklch(0.84 0.07 ${scenario.hue})` }}>
            <ScenarioGlyph icon={scenario.icon} hue={scenario.hue} size={32} active />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{isGeneral ? "由通用助手解答" : scenario.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{isGeneral ? "直接对话回答你的问题" : scenario.tagline}</div>
            </div>
            {!isGeneral && <div style={{ fontSize: 16, fontWeight: 800, color: `oklch(0.5 0.14 ${scenario.hue})`, fontFamily: "var(--font-num)" }}>97%</div>}
          </div>
        )}
      </Row>
      {step >= 4 && (
        <div className="enter-pop" style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>
          {isGeneral ? <span>正在为你解答…</span> : <span>已进入 <b style={{ color: "var(--brand-deep)" }}>{scenario.name}</b>，继续为你准备…</span>}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { InlineIntent });

// workspace_courseware.jsx — 做课件 (form chosen up-front, then pure content area)
const { useState: cwS, useRef: cwR, useEffect: cwE } = React;

// slide outline for traditional PPT
const PPT_SLIDES = [
  { t: "封面", sub: "课题 · 课时", kind: "cover" },
  { t: "情境导入", sub: "贴近生活的问题情境", kind: "text" },
  { t: "新知讲解 ①", sub: "概念与原理", kind: "split" },
  { t: "新知讲解 ②", sub: "例题精讲", kind: "split" },
  { t: "课堂练习", sub: "随堂检测 4 题", kind: "list" },
  { t: "课堂小结", sub: "知识框架回顾", kind: "list" },
  { t: "作业布置", sub: "分层作业", kind: "text" },
];

// interactive activities for HTML courseware
const INTERACTIVE_BLOCKS = [
  { t: "情境导入 · 点一点", type: "点选揭示", hue: 45, demo: "tap" },
  { t: "概念辨析 · 拖拽分类", type: "拖拽分类", hue: 255, demo: "drag" },
  { t: "随堂抢答", type: "抢答竞赛", hue: 25, demo: "quiz" },
  { t: "知识连线", type: "连一连", hue: 150, demo: "match" },
  { t: "总结 · 知识闯关", type: "闯关游戏", hue: 320, demo: "tap" },
];

const CW_SUBJECTS = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "道德与法治", "科学"];
const CW_GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级", "高一", "高二", "高三"];
const CW_EDITIONS = ["人教版", "统编版", "北师大版", "苏教版", "外研版", "沪教版", "湘教版"];
const CW_STANDARD = "《义务教育课程标准（2022年版）》";
const CW_STANDARD_HIGH = "《普通高中课程标准（2017年版2020年修订）》";

// small dropdown
function CwSelect({ value, options, onChange, placeholder, width = 130 }) {
  const [open, setOpen] = cwS(false);
  const ref = cwR(null);
  cwE(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", width }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderRadius: 10, border: open ? "1px solid var(--brand)" : "1px solid var(--line)", background: "var(--surface)", color: value ? "var(--ink)" : "var(--ink-3)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
        {value || placeholder}
        <span style={{ display: "inline-flex", color: "var(--ink-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </button>
      {open && (
        <div className="trace-pop" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, maxHeight: 240, overflowY: "auto", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 16px 40px -18px rgba(0,0,0,.35)", zIndex: 20, padding: 5 }}>
          {options.map((o) => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: "8px 11px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: value === o ? "var(--brand-deep)" : "var(--ink-2)", background: value === o ? "var(--brand-soft)" : "transparent", fontFamily: "var(--font-zh)" }} onMouseEnter={(e) => { if (value !== o) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={(e) => { if (value !== o) e.currentTarget.style.background = "transparent"; }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- inline setup card (lives in a chat bubble) ----
function CwSetupCard({ initForm, initTopic, initSubject, initGrade, onStart }) {
  const [form, setForm] = cwS(initForm);
  const [subject, setSubject] = cwS(initSubject || "");
  const [grade, setGrade] = cwS(initGrade || "");
  const [edition, setEdition] = cwS("");
  const [topic, setTopic] = cwS(initTopic || "");
  const [done, setDone] = cwS(false);
  const isHigh = ["高一", "高二", "高三"].includes(grade);
  const standard = isHigh ? CW_STANDARD_HIGH : CW_STANDARD;
  const ready = subject && grade && topic.trim();

  const FORMS = [
    { k: "ppt", name: "传统 PPT 课件", icon: "slides", desc: "线性讲授 · 导出 PPTX" },
    { k: "interactive", name: "互动课件 · HTML", icon: "interactive", desc: "可点选拖拽 · 课堂互动" },
  ];

  if (done) {
    return (
      <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
        好的，已确认：<b style={{ color: "var(--brand-deep)" }}>{form === "ppt" ? "传统 PPT 课件" : "互动课件"}</b> · {grade}{subject} · 《{topic}》。正在右侧为你生成…
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>
        好的，做课件前先确认两项 —— 我会基于<b style={{ color: "var(--brand-deep)" }}>对应课标与权威教案</b>生成。
      </div>

      {/* form choice */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>① 课件形式</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {FORMS.map((f) => {
          const on = form === f.k;
          return (
            <button key={f.k} onClick={() => setForm(f.k)} style={{ textAlign: "left", padding: "11px 12px", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-zh)", border: on ? "2px solid var(--brand)" : "1px solid var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)", transition: "all .15s", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ScenarioGlyph icon={f.icon} hue={f.k === "ppt" ? 255 : 45} size={32} active={on} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{f.desc}</div>
                </div>
                <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: "50%", border: on ? "none" : "1.5px solid var(--line)", background: on ? "var(--brand)" : "transparent", color: "#fff", display: "grid", placeItems: "center" }}>{on && <Icon name="check" size={11} sw={2.8} />}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* teaching info */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>② 教学信息</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <CwSelect value={grade} options={CW_GRADES} onChange={setGrade} placeholder="学段年级" width={108} />
        <CwSelect value={subject} options={CW_SUBJECTS} onChange={setSubject} placeholder="学科" width={92} />
        <CwSelect value={edition} options={CW_EDITIONS} onChange={setEdition} placeholder="教材版本" width={108} />
      </div>
      <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="课题，例如：纪念白求恩 / 函数的单调性" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 13, fontFamily: "var(--font-zh)", color: "var(--ink)", outline: "none", marginBottom: 12 }} onFocus={(e) => e.target.style.borderColor = "var(--brand)"} onBlur={(e) => e.target.style.borderColor = "var(--line)"} />

      {/* standard note */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 10, background: "var(--auth-bg)", border: "1px solid var(--auth-border)", marginBottom: 14 }}>
        <Icon name="shield" size={15} sw={2} />
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-2)" }}>将对齐 <b style={{ color: "var(--auth-ink)" }}>{standard}</b></div>
      </div>

      <button onClick={() => { if (ready) { setDone(true); onStart({ form, subject, grade, edition, topic: topic.trim(), standard }); } }} disabled={!ready} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", borderRadius: 12, border: "none", background: ready ? "var(--brand)" : "var(--line)", color: ready ? "#fff" : "var(--ink-3)", fontSize: 14, fontWeight: 800, cursor: ready ? "pointer" : "default", fontFamily: "var(--font-zh)", transition: "all .2s" }}>
        开始制作{form === "ppt" ? "传统 PPT 课件" : "互动课件"} <Icon name="arrow" size={16} />
      </button>
      {!ready && <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>请先选择学段、学科并填写课题</div>}
    </div>
  );
}

function CoursewareWorkspace({ scenario, query, onHome, onSwitch, fromIntent, resume }) {
  const wantsInteractive = /互动|游戏|拖拽|抢答|课堂活动|连线|闯关/.test(query || "");
  const topicGuess = (query && (query.match(/《(.+?)》/) || [])[1]) || "";
  const subjGuess = CW_SUBJECTS.find((s) => (query || "").includes(s)) || "";
  const gradeGuess = CW_GRADES.find((g) => (query || "").includes(g)) || "";
  const isResume = !!resume;
  const resumeCfg = isResume
    ? {
        form: /互动/.test(resume.title || "") ? "interactive" : "ppt",
        subject: "数学",
        grade: "七年级",
        edition: "人教版",
        topic: topicGuess || (resume.title || "").replace(/[《》]|互动课件|传统\s*PPT\s*课件|课件/g, "").trim() || "整式的加减",
        standard: CW_STANDARD,
      }
    : null;

  const [cfg, setCfg] = cwS(isResume ? resumeCfg : null); // null until confirmed
  const mobile = useIsMobile();
  const [active, setActive] = cwS(0);
  const [built, setBuilt] = cwS(isResume);
  const [toast, setToast] = cwS(null);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const setupCard = (extra) => ({ role: "ai", wide: true, render: () => <CwSetupCard initForm={wantsInteractive ? "interactive" : "ppt"} initTopic={topicGuess} initSubject={subjGuess} initGrade={gradeGuess} onStart={startMaking} />, ...extra });

  const [messages, setMessages] = cwS(() => {
    if (isResume) {
      const fn = resumeCfg.form === "ppt" ? "传统 PPT 课件" : "互动课件";
      return [
        { role: "ai", node: <span>已为你恢复 <b>{resume.when}</b> 制作的《{resumeCfg.topic}》{fn}，左侧大纲与右侧内容都是上次的进度，接着改就行。</span> },
      ];
    }
    if (fromIntent && query) {
      return [
        { role: "user", text: query },
        { role: "ai", wide: true, render: () => <InlineIntent query={query} onDone={() => setMessages((m) => [...m, setupCard()])} /> },
      ];
    }
    if (query) return [{ role: "user", text: query }, setupCard()];
    return [setupCard()];
  });
  const [sugs, setSugs] = cwS(isResume ? (resumeCfg.form === "ppt" ? ["突出情境导入", "加一页随堂练习", "改成互动课件"] : ["再加一个抢答环节", "把导入换成拖拽", "改成传统 PPT"]) : []);

  function startMaking(c) {
    setCfg(c);
    setActive(0);
    setBuilt(true);
    const formName = c.form === "ppt" ? "传统 PPT 课件" : "互动课件（HTML）";
    setMessages((m) => [...m, { role: "ai", node: <span>正在为你制作<b style={{ color: "var(--brand-deep)" }}>{c.topic}</b> 的{formName}，已对齐{c.subject}课标、参照权威教案。左侧大纲可逐{c.form === "ppt" ? "页" : "个互动"}调整，也可以直接告诉我修改。</span> }]);
    setSugs(c.form === "ppt" ? ["突出情境导入", "加一页随堂练习", "改成互动课件"] : ["再加一个抢答环节", "把导入换成拖拽", "改成传统 PPT"]);
  }

  const handleSend = (text, files) => {
    setMessages((m) => [...m, { role: "user", text, files }, { role: "ai", typing: true }]);
    setTimeout(() => {
      let node;
      if (!cfg) {
        node = <span>好的，请在上方卡片里选好<b>课件形式</b>与<b>教学信息</b>，点「开始制作」我们就开工～</span>;
      } else if (/互动|游戏|拖拽|抢答|html/i.test(text) && cfg.form !== "interactive") {
        setCfg((c) => ({ ...c, form: "interactive" })); setActive(0);
        node = <span>已把课件形式改为<b>互动课件（HTML）</b>，活动环节已按权威素材重建。</span>;
        setSugs(["再加一个抢答环节", "把导入换成拖拽", "改成传统 PPT"]);
      } else if (/ppt|传统|幻灯|演示文稿/i.test(text) && cfg.form !== "ppt") {
        setCfg((c) => ({ ...c, form: "ppt" })); setActive(0);
        node = <span>已把课件形式改为<b>传统 PPT 课件</b>，可逐页继续完善。</span>;
        setSugs(["突出情境导入", "加一页随堂练习", "改成互动课件"]);
      } else {
        node = files && files.length ? <span>已结合你上传的素材更新课件内容。</span> : <span>已根据「{text}」更新课件，所有内容以权威教案为底座。</span>;
      }
      setMessages((m) => [...m.slice(0, -1), { role: "ai", node }]);
    }, 700);
  };
  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages, localSend: handleSend });

  const isInteractive = cfg && cfg.form === "interactive";
  const list = isInteractive ? INTERACTIVE_BLOCKS : PPT_SLIDES;

  const formBadge = cfg && (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", background: isInteractive ? "oklch(0.95 0.05 45)" : "var(--brand-soft)", color: isInteractive ? "oklch(0.5 0.13 45)" : "var(--brand-deep)", border: "1px solid " + (isInteractive ? "oklch(0.85 0.08 45)" : "var(--brand-soft-border)"), fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-zh)" }}>
      <Icon name={isInteractive ? "interactive" : "slides"} size={13} /> {isInteractive ? "互动课件 · HTML" : "传统 PPT 课件"}
    </span>
  );

  return (
    <WorkspaceShell
      scenario={scenario}
      onHome={onHome}
      onSwitch={onSwitch}
      headerRecognizing={headerRecognizing}
      mobilePanelLabel="课件"
      mobilePanelIcon="slides"
      titleMeta={formBadge}
      subtitleOverride={cfg ? `${cfg.grade || ""}${cfg.subject || ""} · ${cfg.topic}` : "在对话中确认形式与课标，开始制作"}
      right={cfg &&
        <button onClick={() => showToast(isInteractive ? "已导出可交互 HTML" : "已导出 PPTX")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, border: "none", background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", whiteSpace: "nowrap" }}>
          <Icon name="download" size={15} /> 导出 {isInteractive ? "HTML" : "PPTX"}
        </button>
      }
    >
      <ChatPanel messages={messages} onSend={send} suggestions={sugs} placeholder={cfg ? "例如：突出情境导入 / 改成互动课件" : "也可以直接打字告诉我课件需求…"} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)", position: "relative" }}>
        {!cfg ? (
          <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "30px 24px", textAlign: "center" }}>
            <div className="home-fade" style={{ maxWidth: 380 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 20 }}>
                <ScenarioGlyph icon="slides" hue={255} size={56} />
                <ScenarioGlyph icon="interactive" hue={45} size={56} />
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>传统 PPT，还是互动课件？</h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>在左侧确认<b style={{ color: "var(--brand-deep)" }}>课件形式</b>与<b style={{ color: "var(--brand-deep)" }}>课标信息</b>，确认后这里会逐页 / 逐个互动地生成课件内容。</p>
            </div>
          </div>
        ) : (
        <React.Fragment>
        {/* content meta strip */}
        <div style={{ padding: mobile ? "9px 14px" : "10px 22px", borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 7 }}>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="shield" size={13} /> 已对齐 <b style={{ color: "var(--ink-2)" }}>{cfg.standard}</b>
          </span>
          {!isResume && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", fontSize: 11.5, fontWeight: 700, color: "var(--brand-deep)" }}>
              <Icon name="spark" size={12} /> 已套用记忆 · {cfg.grade || "七年级"}{cfg.subject || "数学"}
            </span>
          )}
          {isResume && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>
              <Icon name="history" size={12} /> 历史创作 · 恢复自{resume.when}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{isInteractive ? `${list.length} 个互动` : `${list.length} 页`}</span>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: mobile ? "column" : "row" }}>
          {/* outline rail */}
          <div style={{ width: mobile ? "100%" : 190, flexShrink: 0, borderRight: mobile ? "none" : "1px solid var(--line)", borderBottom: mobile ? "1px solid var(--line)" : "none", background: "var(--surface)", overflowY: mobile ? "hidden" : "auto", overflowX: mobile ? "auto" : "hidden", display: mobile ? "flex" : "block", flexDirection: "row", gap: mobile ? 6 : 0, padding: 10 }}>
            {list.map((s, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ width: mobile ? "auto" : "100%", flexShrink: mobile ? 0 : 1, textAlign: "left", display: "flex", gap: 9, padding: "9px 10px", borderRadius: 10, marginBottom: mobile ? 0 : 5, cursor: "pointer", border: mobile ? "1px solid var(--line)" : "none", fontFamily: "var(--font-zh)", background: active === i ? "var(--brand-soft)" : mobile ? "var(--surface)" : "transparent", transition: "background .15s", whiteSpace: mobile ? "nowrap" : "normal" }}>
                <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, background: active === i ? "var(--brand)" : "var(--line)", color: active === i ? "#fff" : "var(--ink-3)", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)" }}>{i + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: active === i ? "var(--brand-deep)" : "var(--ink-2)", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.t}</span>
                  {isInteractive && <span style={{ display: "block", fontSize: 10.5, color: `oklch(0.55 0.12 ${s.hue})`, fontWeight: 700, marginTop: 1 }}>{s.type}</span>}
                </span>
              </button>
            ))}
            <button onClick={() => showToast("已新增，可继续编辑")} style={{ width: mobile ? "auto" : "100%", flexShrink: mobile ? 0 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: mobile ? "9px 14px" : "8px", borderRadius: 10, border: "1px dashed var(--line)", background: "transparent", color: "var(--ink-3)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", marginTop: mobile ? 0 : 4, whiteSpace: "nowrap" }}>
              <Icon name="plus" size={14} /> {isInteractive ? "加互动" : "加一页"}
            </button>
          </div>

          {/* pure content stage */}
          <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "24px clamp(20px, 5%, 56px)", display: "grid", placeItems: "start center" }}>
            {isInteractive
              ? <InteractiveStage block={INTERACTIVE_BLOCKS[active]} idx={active} topic={cfg.topic} onToast={showToast} />
              : <PptStage slide={PPT_SLIDES[active]} idx={active} topic={cfg.topic} built={built} />}
          </div>
        </div>
        </React.Fragment>
        )}

        {toast && (
          <div className="enter-pop" style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--surface)", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "0 12px 30px -12px rgba(0,0,0,.5)", display: "inline-flex", alignItems: "center", gap: 8, zIndex: 30 }}>
            <Icon name="check" size={16} sw={2.6} /> {toast}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

// ---- Traditional PPT slide preview (16:9) ----
function PptStage({ slide, idx, topic, built }) {
  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <div key={idx} className="block-pop" style={{ width: "100%", aspectRatio: "16/9", background: "#fff", borderRadius: 14, border: "1px solid var(--line)", boxShadow: "0 18px 50px -28px rgba(0,0,0,.4)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        {/* top accent */}
        <div style={{ height: 8, background: "linear-gradient(90deg, var(--brand), var(--brand-deep))", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "30px 36px", display: "flex", flexDirection: "column" }}>
          {slide.kind === "cover" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 14 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#1f2430" }}>{topic}</div>
              <div style={{ fontSize: 14, color: "#6a7180", letterSpacing: 2 }}>教学课件 · 第一课时</div>
              <div style={{ marginTop: 8, width: 54, height: 4, borderRadius: 2, background: "var(--brand)" }} />
            </div>
          ) : (
            <React.Fragment>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 6, height: 26, borderRadius: 3, background: "var(--brand)" }} />
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1f2430" }}>{slide.t}</div>
              </div>
              {slide.kind === "split" ? (
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
                    {[0, 1, 2].map((k) => <div key={k} style={{ height: 11, borderRadius: 4, background: "#eef0f4", width: `${92 - k * 12}%` }} />)}
                  </div>
                  <div className="ph-stripe" style={{ borderRadius: 10, display: "grid", placeItems: "center", color: "#aab", fontSize: 12, fontWeight: 700 }}>配图 / 板书</div>
                </div>
              ) : slide.kind === "list" ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, justifyContent: "center" }}>
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-num)" }}>{k + 1}</span>
                      <div style={{ height: 11, borderRadius: 4, background: "#eef0f4", width: `${80 - k * 8}%` }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
                  {[0, 1, 2].map((k) => <div key={k} style={{ height: 12, borderRadius: 4, background: "#eef0f4", width: `${94 - k * 6}%` }} />)}
                </div>
              )}
            </React.Fragment>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 18, fontSize: 11, color: "#aab2c0", fontWeight: 600 }}>{topic} · {idx + 1} / {PPT_SLIDES.length}</div>
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>第 {idx + 1} 页 · {slide.t}</span>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{slide.sub}</span>
        <div style={{ flex: 1, minWidth: 8 }} />
        <Btn size="sm" kind="soft" icon="refresh">重写本页</Btn>
        <Btn size="sm" kind="ghost" icon="spark">配图</Btn>
      </div>
    </div>
  );
}

// ---- Interactive HTML activity preview (actually interactive) ----
function InteractiveStage({ block, idx, topic, onToast }) {
  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <div key={idx} className="block-pop" style={{ width: "100%", aspectRatio: "16/9", background: `linear-gradient(160deg, oklch(0.97 0.03 ${block.hue}), oklch(0.99 0.01 ${block.hue}))`, borderRadius: 14, border: `1px solid oklch(0.86 0.07 ${block.hue})`, boxShadow: "0 18px 50px -28px rgba(0,0,0,.4)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", padding: "22px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 999, background: `oklch(0.6 0.14 ${block.hue})`, color: "#fff", fontSize: 12, fontWeight: 800 }}>
            <Icon name="interactive" size={13} /> {block.type}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>{block.t}</span>
        </div>
        <div style={{ flex: 1, display: "grid", placeItems: "center", paddingTop: 10 }}>
          <InteractiveDemo demo={block.demo} hue={block.hue} onToast={onToast} />
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 16, fontSize: 10.5, color: `oklch(0.55 0.08 ${block.hue})`, fontWeight: 700 }}>HTML 互动 · 可在课堂直接操作</div>
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>互动 {idx + 1} · {block.type}</span>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>上方可直接试玩</span>
        <div style={{ flex: 1, minWidth: 8 }} />
        <Btn size="sm" kind="soft" icon="refresh">换个玩法</Btn>
        <Btn size="sm" kind="ghost" icon="spark">改题目</Btn>
      </div>
    </div>
  );
}

// the actual mini interactive demos
function InteractiveDemo({ demo, hue, onToast }) {
  const [tapped, setTapped] = cwS(false);
  const [picked, setPicked] = cwS(null);
  const [bin, setBin] = cwS({ A: [], B: [] });
  const [dragging, setDragging] = cwS(null);

  if (demo === "tap") {
    return (
      <div onClick={() => { setTapped((t) => !t); }} style={{ cursor: "pointer", textAlign: "center" }}>
        <div style={{ width: 130, height: 130, borderRadius: 22, background: tapped ? `oklch(0.6 0.14 ${hue})` : "#fff", border: `2px solid oklch(0.7 0.12 ${hue})`, display: "grid", placeItems: "center", transition: "all .25s", boxShadow: "0 8px 22px -12px rgba(0,0,0,.3)", transform: tapped ? "scale(1.04)" : "scale(1)" }}>
          <span style={{ fontSize: tapped ? 15 : 26, fontWeight: 800, color: tapped ? "#fff" : `oklch(0.5 0.13 ${hue})`, padding: 12, textAlign: "center", lineHeight: 1.3 }}>{tapped ? "答案：光合作用 🌱" : "？"}</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{tapped ? "点击收起" : "点击卡片揭示答案"}</div>
      </div>
    );
  }
  if (demo === "quiz") {
    const opts = ["A. 叶绿体", "B. 线粒体", "C. 核糖体", "D. 高尔基体"];
    return (
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: 12 }}>光合作用的场所是？</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {opts.map((o, i) => {
            const right = i === 0;
            const chosen = picked === i;
            return (
              <button key={i} onClick={() => { setPicked(i); onToast(right ? "答对了！🎉" : "再想想~"); }} style={{ padding: "12px 10px", borderRadius: 11, border: chosen ? `2px solid ${right ? "oklch(0.55 0.15 150)" : "oklch(0.6 0.18 25)"}` : "1px solid var(--line)", background: chosen ? (right ? "oklch(0.95 0.06 150)" : "oklch(0.96 0.05 25)") : "#fff", color: "var(--ink)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }}>{o}</button>
            );
          })}
        </div>
      </div>
    );
  }
  if (demo === "match") {
    const pairs = [["氧气", "O₂"], ["二氧化碳", "CO₂"], ["水", "H₂O"]];
    return (
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pairs.map((p, i) => <div key={i} onClick={() => { setPicked(i); }} style={{ padding: "9px 16px", borderRadius: 10, background: picked === i ? `oklch(0.6 0.14 ${hue})` : "#fff", color: picked === i ? "#fff" : "var(--ink)", border: `1px solid oklch(0.8 0.08 ${hue})`, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{p[0]}</div>)}
        </div>
        <svg width="48" height="120" style={{ flexShrink: 0 }}>
          {picked !== null && <line x1="0" y1={20 + picked * 39} x2="48" y2={60} stroke={`oklch(0.6 0.14 ${hue})`} strokeWidth="2.5" strokeLinecap="round" />}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pairs.map((p, i) => <div key={i} style={{ padding: "9px 16px", borderRadius: 10, background: "#fff", border: "1px solid var(--line)", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-num)", color: "var(--ink)" }}>{p[1]}</div>)}
        </div>
      </div>
    );
  }
  // drag classify
  const items = [
    { id: "a", label: "光反应", bin: "A" },
    { id: "b", label: "暗反应", bin: "B" },
    { id: "c", label: "需要光", bin: "A" },
    { id: "d", label: "CO₂ 固定", bin: "B" },
  ];
  const placed = [...bin.A, ...bin.B];
  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14, minHeight: 34 }}>
        {items.filter((it) => !placed.includes(it.id)).map((it) => (
          <div key={it.id} draggable onDragStart={() => setDragging(it.id)} style={{ padding: "7px 14px", borderRadius: 9, background: "#fff", border: `1px solid oklch(0.78 0.09 ${hue})`, fontSize: 13, fontWeight: 700, color: "var(--ink)", cursor: "grab" }}>{it.label}</div>
        ))}
        {placed.length === items.length && <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>全部分类完成 ✅</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {["A", "B"].map((b) => (
          <div key={b} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragging) { setBin((prev) => ({ ...prev, [b]: [...prev[b], dragging] })); setDragging(null); } }} style={{ minHeight: 76, borderRadius: 12, border: `2px dashed oklch(0.78 0.09 ${hue})`, background: `oklch(0.97 0.02 ${hue})`, padding: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: `oklch(0.5 0.12 ${hue})`, marginBottom: 7 }}>{b === "A" ? "光反应" : "暗反应"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {bin[b].map((id) => <span key={id} style={{ padding: "5px 11px", borderRadius: 8, background: `oklch(0.6 0.14 ${hue})`, color: "#fff", fontSize: 12.5, fontWeight: 700 }}>{items.find((x) => x.id === id).label}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CoursewareWorkspace });

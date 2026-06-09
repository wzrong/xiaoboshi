// workspace_find.jsx — 找资源 workspace (human-AI collaboration)
const { useState: uS, useEffect: uE, useRef: uR } = React;

// ---- Shared workspace shell (top bar) ----
const MIN_CHAT_W = 320;   // chat panel never narrower than a phone screen
const MIN_CONTENT_W = 380; // content side keeps at least this much room

// Resizable two-pane: [ChatPanel, content]. Drag the seam to rebalance.
function ChatResizer({ children }) {
  const kids = React.Children.toArray(children);
  const first = kids[0];
  const rest = kids.slice(1);
  const wrapRef = uR(null);
  const [w, setW] = uS(() => {
    const s = parseInt(localStorage.getItem("aida_chat_w") || "", 10);
    return Number.isFinite(s) && s >= MIN_CHAT_W ? s : (first.props.width || 380);
  });
  const [dragging, setDragging] = uS(false);
  const dref = uR(false);

  uE(() => { try { localStorage.setItem("aida_chat_w", String(Math.round(w))); } catch (e) {} }, [w]);

  uE(() => {
    const clamp = (val) => {
      const total = wrapRef.current ? wrapRef.current.getBoundingClientRect().width : 99999;
      const maxW = Math.max(MIN_CHAT_W, total - MIN_CONTENT_W);
      return Math.min(Math.max(val, MIN_CHAT_W), maxW);
    };
    const move = (e) => {
      if (!dref.current || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      setW(clamp(e.clientX - rect.left));
    };
    const up = () => {
      if (!dref.current) return;
      dref.current = false; setDragging(false);
      document.body.style.cursor = ""; document.body.style.userSelect = "";
    };
    const onResize = () => setW((v) => clamp(v));
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("resize", onResize);
    setW((v) => clamp(v)); // clamp on mount to the live container size
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const startDrag = (e) => {
    dref.current = true; setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  return (
    <div ref={wrapRef} style={{ flex: 1, minWidth: 0, display: "flex" }}>
      {React.cloneElement(first, { width: w })}
      <div
        className={"ws-resizer" + (dragging ? " dragging" : "")}
        onPointerDown={startDrag}
        title="拖动调整左右宽度"
        style={{ width: 12, margin: "0 -6px", flexShrink: 0, cursor: "col-resize", position: "relative", zIndex: 6, touchAction: "none" }}
      >
        <span className="ws-resizer-grip" />
      </div>
      {rest}
    </div>
  );
}

function WorkspaceShell({ scenario, onHome, onSwitch, children, right, afterTitle, titleMeta, subtitleOverride, recognizing, headerRecognizing, mobilePanelLabel = "结果", mobilePanelIcon = "layers", openSheetKey }) {
  const showRec = recognizing || headerRecognizing;
  const [switcher, setSwitcher] = React.useState(false);
  const mobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const SC = window.AIDATA.SCENARIOS;
  const GEN = window.AIDATA.GENERAL;
  const canSwitch = typeof onSwitch === "function" && !showRec;
  const kids = React.Children.toArray(children);
  const isChatLed = !recognizing && kids.length >= 2 && kids[0] && kids[0].type === ChatPanel;
  // mobile: auto-slide the content sheet up when the result pane becomes ready
  // or the user opens a specific item (key changes). Never auto-opens twice for
  // the same state, so it stays out of the way once dismissed.
  const lastKey = React.useRef(undefined);
  React.useEffect(() => {
    if (!mobile || !isChatLed) { lastKey.current = openSheetKey; return; }
    if (openSheetKey && openSheetKey !== lastKey.current) setSheetOpen(true);
    lastKey.current = openSheetKey;
  }, [openSheetKey, mobile, isChatLed]);
  return (
    <WSMobileContext.Provider value={{ mobile, sheetOpen, setSheetOpen, isChatLed }}>
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: mobile ? 8 : 12,
          height: mobile ? 56 : 60,
          padding: mobile ? "0 12px" : "0 22px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
          zIndex: 30,
        }}
      >
        <button
          onClick={onHome}
          title="返回首页"
          aria-label="返回首页"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 11,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--ink-2)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background .15s, color .15s, border-color .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-soft)"; e.currentTarget.style.color = "var(--brand-deep)"; e.currentTarget.style.borderColor = "var(--brand-soft-border)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--ink-2)"; e.currentTarget.style.borderColor = "var(--line)"; }}
        >
          <Icon name="home" size={18} />
        </button>
        <div style={{ width: 1, height: 24, background: "var(--line)", flexShrink: 0 }} />
        {showRec ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <BotAvatar size={32} glow />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                小博士正在识别你的需求 <Dots />
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>判断该用哪个场景为你服务…</div>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative", minWidth: 0 }}>
            <button
              onClick={() => canSwitch && setSwitcher((s) => !s)}
              title={canSwitch ? "切换场景" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
                padding: "5px 10px 5px 6px",
                borderRadius: 12,
                border: "1px solid " + (switcher ? "var(--brand-soft-border)" : "transparent"),
                background: switcher ? "var(--brand-soft)" : "transparent",
                cursor: canSwitch ? "pointer" : "default",
                fontFamily: "var(--font-zh)",
                transition: "background .15s, border-color .15s",
              }}
              onMouseEnter={(e) => { if (canSwitch && !switcher) e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={(e) => { if (canSwitch && !switcher) e.currentTarget.style.background = "transparent"; }}
            >
              <ScenarioGlyph icon={scenario.icon} hue={scenario.hue} size={34} />
              <div style={{ minWidth: 0, textAlign: "left" }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                  {scenario.name}
                  {titleMeta}
                  {canSwitch && <span style={{ color: "var(--ink-3)", display: "grid", placeItems: "center", transition: "transform .2s", transform: switcher ? "rotate(180deg)" : "none" }}><Icon name="chevron" size={15} /></span>}
                </div>
                {!mobile && <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitleOverride || scenario.tagline}</div>}
              </div>
            </button>
            {switcher && (
              <React.Fragment>
                <div onClick={() => setSwitcher(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                <div className="enter-pop" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: 320, maxWidth: "calc(100vw - 40px)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "0 24px 60px -28px rgba(0,0,0,.45)", padding: 8, zIndex: 41 }}>
                  <div style={{ padding: "6px 10px 8px", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="spark" size={13} /> 切换到其他场景
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {SC.map((s) => {
                      const active = s.id === scenario.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => { setSwitcher(false); if (!active) onSwitch(s.id, ""); }}
                          style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 11, border: "none", background: active ? "var(--brand-soft)" : "transparent", cursor: active ? "default" : "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "background .15s" }}
                          onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
                          onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                        >
                          <ScenarioGlyph icon={s.icon} hue={s.hue} size={32} active={active} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? "var(--brand-deep)" : "var(--ink)" }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.tagline}</div>
                          </div>
                          {active && <span style={{ color: "var(--brand-deep)", flexShrink: 0 }}><Icon name="check" size={16} sw={2.4} /></span>}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ height: 1, background: "var(--line)", margin: "6px 6px" }} />
                  <button
                    onClick={() => { setSwitcher(false); if (scenario.id !== "general") onSwitch("general", ""); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 11, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}><Icon name="spark" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{GEN.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>不确定用哪个？交给小博士判断</div>
                    </div>
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        )}
        {!showRec && afterTitle}
        <div style={{ flex: 1 }} />
        {!showRec && (mobile && isChatLed ? <SheetPill label={mobilePanelLabel} icon={mobilePanelIcon} onClick={() => setSheetOpen(true)} /> : right)}
      </header>
      <div style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}>
        {mobile && isChatLed ? (
          <React.Fragment>
            {React.cloneElement(kids[0], { width: "100%" })}
            <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={mobilePanelLabel} headerRight={right}>
              {kids.slice(1)}
            </MobileSheet>
          </React.Fragment>
        ) : isChatLed ? (
          <ChatResizer>{children}</ChatResizer>
        ) : (
          children
        )}
      </div>
    </div>
    </WSMobileContext.Provider>
  );
}

// neutral right-side placeholder shown while intent is still being recognised
function RecognizingPanel() {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "30px 24px", textAlign: "center" }}>
      <div className="home-fade" style={{ maxWidth: 360 }}>
        <div style={{ position: "relative", display: "inline-flex", marginBottom: 18 }}>
          <BotAvatar size={56} glow />
          <span className="bot-ring" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>正在识别你的需求…</h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>小博士正从<b style={{ color: "var(--brand-deep)" }}>学科网资源库</b>判断最合适的场景，稍候就为你打开对应的工作台。</p>
      </div>
    </div>
  );
}

// ---- Chat panel (left) ----
function ChatPanel({ messages, onSend, suggestions, placeholder, width = 380, pinnedCard, roundsById, shownId, onOpenRound, retrieving }) {
  const [draft, setDraft] = uS("");
  const [att, setAtt] = uS([]);
  const scrollRef = uR(null);
  uE(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);
  const send = (txt) => {
    const v = (txt ?? draft).trim();
    if (!v && att.length === 0) return;
    onSend(v, att);
    setDraft("");
    setAtt([]);
  };
  return (
    <div style={{ width, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--surface)", borderRight: "1px solid var(--line)" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => {
          const round = roundsById && m.roundId != null ? roundsById[m.roundId] : null;
          return <Bubble key={i} m={m} round={round} active={round && round.id === shownId && !retrieving} onOpenRound={onOpenRound} />;
        })}
        {pinnedCard}
      </div>
      {suggestions && suggestions.length > 0 && (
        <div style={{ padding: "10px 16px 4px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="sug-pop"
              style={{
                animationDelay: `${i * 0.05}s`,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                borderRadius: 999,
                border: "1px dashed var(--brand-soft-border)",
                background: "var(--brand-soft)",
                color: "var(--brand-deep)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-zh)",
              }}
            >
              <Icon name="spark" size={12} /> {s}
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: 14, borderTop: "1px solid var(--line)" }}>
        <FileChips files={att} onRemove={(i) => setAtt((f) => f.filter((_, j) => j !== i))} style={{ marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 14, padding: 8 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={placeholder || "继续告诉我你的调整…"}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontSize: 13.5, fontFamily: "var(--font-zh)", color: "var(--ink)", lineHeight: 1.5, padding: "4px 2px" }}
          />
          <ClipButton onFiles={(names) => setAtt((f) => [...f, ...names].slice(0, 6))} compact />
          <button
            onClick={() => send()}
            style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m, round, active, onOpenRound }) {
  if (m.role === "user") {
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        {m.files && m.files.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
            {m.files.map((name, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", maxWidth: 180 }}>
                <Icon name="file" size={12} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              </span>
            ))}
          </div>
        )}
        {m.text && (
          <div style={{ background: "var(--brand)", color: "#fff", padding: "10px 13px", borderRadius: "14px 14px 4px 14px", fontSize: 13.5, lineHeight: 1.6, fontWeight: 500 }}>
            {m.text}
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", maxWidth: m.wide ? "98%" : "92%", width: m.wide ? "100%" : "auto" }}>
      <BotAvatar size={28} />
      <div style={{ flex: m.wide ? 1 : "0 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", padding: "10px 13px", borderRadius: "4px 14px 14px 14px", fontSize: 13.5, lineHeight: 1.65, color: "var(--ink)" }}>
          {m.typing ? <Dots /> : m.render ? m.render() : (m.node || m.text)}
        </div>
        {/* per-round result pill — a sibling BELOW the bubble, not nested inside it */}
        {!m.typing && round && (
          <ResultPill count={round.count} active={active} onOpen={() => onOpenRound && onOpenRound(round.id)} />
        )}
      </div>
    </div>
  );
}

// ---- 找资源 workspace ----
const MORE_FILTERS = [
  { key: "grade", label: "学段", opts: ["七年级", "八年级", "九年级"] },
  { key: "subject", label: "学科", opts: ["数学", "物理", "英语"] },
  { key: "edition", label: "版本", opts: ["人教版", "北师大版", "通用"] },
  { key: "type", label: "类型", opts: ["同步练习", "单元测试", "微课·学案", "专项突破", "教学课件"] },
  { key: "diff", label: "难度", opts: ["基础", "中等", "拔高"] },
];

const HANDOFF = [
  { id: "paper", icon: "paper", label: "直接出一份卷子", hue: 25, hint: "从学科网题库智能组卷" },
  { id: "lesson", icon: "lesson", label: "生成配套教案", hue: 320, hint: "对齐课标的教学设计" },
  { id: "courseware", icon: "slides", label: "做成课件", hue: 255, hint: "结构清晰的 PPT" },
];

const RESULT_TABS = [
  { k: "all", label: "全部" },
  { k: "doc", label: "文档" },
  { k: "video", label: "视频" },
  { k: "album", label: "专辑" },
];
const SUBJ_LIST = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治", "科学", "道德与法治"];
const GRADE_LIST = ["七年级", "八年级", "九年级", "高一", "高二", "高三", "六年级", "五年级", "四年级", "三年级"];
function pickSubject(q) { return q ? SUBJ_LIST.find((s) => q.includes(s)) : null; }
function pickGrade(q) { return q ? GRADE_LIST.find((g) => q.includes(g)) : null; }
// content-aware, self-consistent replies grounded in a resource/video's REAL fields
function replyForResource(q, item) {
  const isVideo = item && (item.kind === "video" || item.cat || item.chapters);
  const t = (item && item.title) || "这份资料";
  const tags = (item && item.tags) || [];
  const tagStr = tags.length ? tags.join("、") : "本节核心知识点";

  if (/出卷|出题|组卷|生成|做一份|出一份|出份/.test(q)) {
    if (isVideo) return <span>《{t}》是<b>{item.cat || "教学视频"}</b>，我可以按它讲解的知识点，<b style={{ color: "var(--brand-deep)" }}>配一套同步练习</b>。对我说「出卷子」即可带着这些知识点过去。</span>;
    return <span>没问题 —— 我可以基于《{t}》的知识点（{tagStr}）与<b>{item && item.diff ? item.diff : "中等"}</b>难度，<b style={{ color: "var(--brand-deep)" }}>直接组一份新卷子</b>。点下方「送去出卷子」，或对我说「出卷子」。</span>;
  }
  if (/适合|学情|班级|难不难|难度/.test(q)) {
    if (isVideo) return <span>《{t}》为 <b>{item.grade}{item.subject}</b>、{item.duration} {item.quality}，{item.chapters ? `分 ${item.chapters.length} 个章节、可按需跳转` : "时长适中"}，{item.cat === "实验视频" ? "适合课堂演示或课前预习" : "适合课堂讲解或研修"}。</span>;
    return <span>《{t}》为 <b>{item.grade}{item.subject} · {item.edition}</b>、难度<b>{item.diff || "中等"}</b>{item.qcount ? `、含 ${item.qcount} 题` : ""}，与你班级常用难度匹配度较高{item.match ? `（匹配度 ${item.match}%）` : ""}。需要更基础或更拔高的版本，我可再筛一批。</span>;
  }
  if (isVideo && /环节|哪个|什么时候|怎么用|课堂/.test(q)) {
    const chap = item.chapters && item.chapters[1];
    return <span>建议把《{t}》用在<b>新授或探究环节</b>：{item.chapters ? <span>例如「{chap.name}」一段（{chap.t} 起）很适合定格讲解。</span> : "可整段播放后组织讨论。"}已为 {item.grade}{item.subject} 学情做过校验。</span>;
  }
  if (isVideo) {
    const names = (item.chapters || []).slice(0, 3).map((c) => c.name).join("、");
    return <span>《{t}》是 <b>{item.cat}</b>（{item.duration}）：{item.chapters ? <span>依次讲解 {names} 等 {item.chapters.length} 个环节</span> : "完整呈现了该知识点"}，画质 {item.quality}，已播放 {item.plays}。需要我<b>提取讲解要点</b>或<b>配套出题</b>都可以。</span>;
  }
  return <span>我已通读《{t}》：<b>{item ? item.type : "资料"}</b>，{item && item.pages ? `共 ${item.pages} 页` : "篇幅适中"}{item && item.qcount ? `、含 ${item.qcount} 道题` : ""}，覆盖 {tagStr}，{item && item.reviewed ? "已通过学科网审校，" : ""}可直接用于课堂。需要我<b>提取讲解要点</b>或<b>据此出卷</b>都行。</span>;
}

function detectKind(q) {
  if (!q) return "all";
  if (/专辑|合集|套|打包|串讲|资源包|大单元|上好课/.test(q)) return "album";
  if (/视频|实验|研修|示范课|微课视频|讲解视频/.test(q)) return "video";
  return "all";
}

// ---- per-round result model ----------------------------------------------
// Every query produces a FROZEN result set ("round"). Each AI reply carries its
// round's id; clicking that reply's pill re-opens exactly those results. Rounds
// are never overwritten — "given to you, it's yours."

const SOURCE_STYLE = {
  "学科网": { label: "学科网", icon: "shield", c: "var(--auth-ink)", bg: "var(--auth-bg)", bd: "var(--auth-border)" },
  "我的内容": { label: "我的内容", icon: "grid", c: "oklch(0.47 0.13 300)", bg: "oklch(0.965 0.025 300)", bd: "oklch(0.88 0.05 300)" },
  "资源篮": { label: "资源篮", icon: "basket", c: "oklch(0.48 0.12 55)", bg: "oklch(0.965 0.04 75)", bd: "oklch(0.88 0.07 70)" },
};
function SourceTag({ source }) {
  const s = SOURCE_STYLE[source] || SOURCE_STYLE["学科网"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 5, background: s.bg, border: `1px solid ${s.bd}`, color: s.c, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>
      <Icon name={s.icon} size={11} sw={2} /> {s.label}
    </span>
  );
}

const KIND_LABEL = { all: "文档·视频·专辑", doc: "文档", video: "视频", album: "专辑" };

// build a frozen, source-tagged, mixed item list for one round
function buildRound(text, id, ctx, loggedIn, basketTitles) {
  const R = window.AIDATA.RESOURCES, V = window.AIDATA.VIDEOS, A = window.AIDATA.ALBUMS;
  const kind = detectKind(text);
  const subject = pickSubject(text) || ctx.subject;
  const grade = pickGrade(text) || ctx.grade;
  ctx.subject = subject; ctx.grade = grade; // remember for vague follow-ups
  const sjOK = (x) => !subject || x.subject === subject || x.subject === "通用";
  const grOK = (x) => !grade || !x.grade || x.grade === grade;
  let docs = R.filter((x) => sjOK(x) && grOK(x));
  if (!docs.length) docs = R.filter(sjOK);
  if (!docs.length) docs = R.slice();
  let vids = V.filter(sjOK); if (!vids.length) vids = V.slice();
  let albs = A.filter(sjOK); if (!albs.length) albs = A.slice();
  const tag = (arr, k) => arr.map((x) => ({ ...x, _kind: k }));
  let items;
  if (kind === "video") items = [...tag(vids, "video"), ...tag(albs.slice(0, 1), "album"), ...tag(docs.slice(0, 3), "doc")];
  else if (kind === "album") items = [...tag(albs, "album"), ...tag(docs.slice(0, 5), "doc"), ...tag(vids.slice(0, 2), "video")];
  else items = [...tag(albs.slice(0, 2), "album"), ...tag(docs.slice(0, 8), "doc"), ...tag(vids.slice(0, 3), "video")];
  items = items.slice(0, 14).map((x) => ({ ...x, _source: "学科网" }));
  const bt = basketTitles || [];
  items = items.map((it) => (bt.some((t) => t && (it.title.includes(t) || t.includes(it.title))) ? { ...it, _source: "资源篮" } : it));
  if (loggedIn) {
    const di = items.findIndex((x) => x._kind === "doc" && x._source === "学科网");
    if (di >= 0) items[di] = { ...items[di], _source: "我的内容" };
  }
  if (bt.length && !items.some((x) => x._source === "资源篮")) {
    const di = items.findIndex((x) => x._source === "学科网");
    if (di >= 0) items[di] = { ...items[di], _source: "资源篮" };
  }
  const rank = { "我的内容": 0, "资源篮": 1, "学科网": 2 };
  items.sort((a, b) => rank[a._source] - rank[b._source]);
  return { id, query: text, items, count: items.length, kind, subject, grade };
}

function roundReplyNode(round) {
  const ctxBits = [round.grade, round.subject].filter(Boolean).join("");
  const cnt = (s) => round.items.filter((x) => x._source === s).length;
  const mine = cnt("我的内容"), bag = cnt("资源篮");
  const extra = [];
  if (mine) extra.push(`${mine} 项来自你的内容`);
  if (bag) extra.push(`${bag} 项来自资源篮收藏`);
  return (
    <span>
      已按你的需求{ctxBits ? <span>（理解为 <b style={{ color: "var(--brand-deep)" }}>{ctxBits}</b>）</span> : null}，从<b style={{ color: "var(--auth-ink)" }}>学科网资源库</b>检索整理出 <b>{round.count}</b> 项{extra.length ? <span>，其中 {extra.join("、")}</span> : null}。点下方查看，合适就收藏或下载，不合适我也能直接生成。
    </span>
  );
}

const ROUND_SUGS = {
  video: ["只看实验视频", "教师研修视频", "下载这个视频", "据此配套出题"],
  album: ["展开专辑内容", "整套打包下载", "只要试卷部分", "换个复习专辑"],
  all: ["只看视频", "有没有成套专辑", "只要含答案的文档", "难度再高一点"],
};

// result pill — sits BELOW the reply bubble (not nested inside it), width follows the bubble column
function ResultPill({ count, active, onOpen }) {
  return (
    <button onClick={onOpen} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "9px 11px", borderRadius: 11, border: `1px solid ${active ? "var(--brand)" : "var(--brand-soft-border)"}`, background: active ? "var(--brand-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}><Icon name="search" size={15} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--brand-deep)" }}>已为你匹配 {count} 个资源</div>
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 1 }}>{active ? "当前正在查看" : "点此查看本轮结果"}</div>
      </div>
      <Icon name={active ? "check" : "chevronRight"} size={15} />
    </button>
  );
}

// right-pane skeleton shown WHILE retrieving (so results never appear before the reply)
function RetrievingPanel() {
  const mobile = useIsMobile();
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: mobile ? "12px 16px" : "14px 22px", borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 10 }}>
        <Dots /> <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>正在从 <b style={{ color: "var(--auth-ink)" }}>学科网资源库</b> 检索匹配…</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "14px 16px" : "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-row" style={{ height: 76, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--line)", animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

function FindWorkspace({ scenario, query, onHome, onSwitch, fromIntent, resume, loggedIn, onAddBasket, onOpenBasket, onOpenContent, basketCount = 0, basketItems }) {
  const ALL = window.AIDATA.RESOURCES;
  const isResume = !!resume;
  const initKind = detectKind(query);
  const topicMatch = query && (query.match(/《(.+?)》/) || [])[1];
  const initSubject = pickSubject(query) || (initKind === "all" ? "数学" : null);
  const initGrade = pickGrade(query) || (initKind === "all" ? "七年级" : null);

  const [preview, setPreview] = uS(null);
  const [player, setPlayer] = uS(null);
  const [album, setAlbum] = uS(null);
  const [toast, setToast] = uS(null);
  const mobile = useIsMobile();

  // accumulated understanding (subject/grade) so vague follow-ups still resolve
  const ctxRef = uR({ subject: initSubject, grade: initGrade });
  const idRef = uR(0);
  const sheetSeqRef = uR(0);
  const basketTitles = (basketItems || []).map((b) => b.title).filter(Boolean);

  // every query → a FROZEN round; rounds are appended, never overwritten
  const [rounds, setRounds] = uS(() => {
    if (isResume) return [buildRound(resume.title || query || "", idRef.current++, ctxRef.current, loggedIn, basketTitles)];
    if (query && !fromIntent) return [buildRound(query, idRef.current++, ctxRef.current, loggedIn, basketTitles)];
    return [];
  });
  const [activeRound, setActiveRound] = uS(null); // null → show the latest round
  const [retrieving, setRetrieving] = uS(false);
  const [sheetAnchor, setSheetAnchor] = uS(""); // "" so the first round doesn't auto-cover the chat on mobile

  // build & commit the first round after the cross-scenario intent animation
  const beginFirstRound = (text) => {
    setRetrieving(true);
    setTimeout(() => {
      const round = buildRound(text, idRef.current++, ctxRef.current, loggedIn, basketTitles);
      setRounds([round]);
      setRetrieving(false);
      setActiveRound(round.id);
      setMessages((m) => [...m, { role: "ai", roundId: round.id, node: roundReplyNode(round) }]);
      setSuggestions(ROUND_SUGS[round.kind] || ROUND_SUGS.all);
    }, 220);
  };

  const [messages, setMessages] = uS(() => {
    if (isResume) {
      return [{ role: "ai", roundId: 0, node: (<div>已恢复你 <b>{resume.when}</b> 关于「{(resume.title || "").replace(/[《》]/g, "")}」的检索，下面就是当时整理的结果，<b style={{ color: "var(--brand-deep)" }}>已收藏的资源</b>也都还在。继续筛选或换个方向都行。</div>) }];
    }
    if (fromIntent && query) {
      return [
        { role: "user", text: query },
        { role: "ai", wide: true, render: () => <InlineIntent query={query} onDone={() => beginFirstRound(query)} /> },
      ];
    }
    if (query) return [{ role: "user", text: query }, { role: "ai", roundId: rounds[0].id, node: roundReplyNode(rounds[0]) }];
    return [{ role: "ai", node: (<div>你好老师，告诉我你要找什么 —— 文档、<b>实验/研修视频</b>、还是<b>成套专辑</b>都行，例如「凸透镜成像的实验视频」「六年级语文期末复习专辑」。我会从<b style={{ color: "var(--auth-ink)" }}>学科网资源库</b>为你精准匹配。</div>) }];
  });
  const [suggestions, setSuggestions] = uS(rounds.length ? (ROUND_SUGS[rounds[0].kind] || ROUND_SUGS.all) : []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  // open a (frozen) round in the result pane; on mobile also slide the sheet up
  const openRound = (id) => { setRetrieving(false); setActiveRound(id); setSheetAnchor("r" + id + "#" + (sheetSeqRef.current++)); };

  const handleSend = (text, files) => {
    setMessages((m) => [...m, { role: "user", text, files }]);
    // keep an open item if the message is about it; otherwise the pane follows the chat
    const aboutCurrent = /这个|这份|这节|这道|这段|这本|它|当前|上面|本视频|本资料|本节|刚才/.test(text || "");
    if (!aboutCurrent && (preview || player || album)) { setPreview(null); setPlayer(null); setAlbum(null); }
    // explicit generation request → hand off to the 出卷子 scenario
    if (text.includes("出卷") && !aboutCurrent) { onSwitch && onSwitch("paper", text); return; }
    // retrieval: reply appears FIRST, results only after a brief search (no fake-instant pane)
    setMessages((m) => [...m, { role: "ai", typing: true }]);
    setRetrieving(true);
    setActiveRound(null);
    setSuggestions([]);
    const id = idRef.current++;
    setTimeout(() => {
      const round = buildRound(text, id, ctxRef.current, loggedIn, basketTitles);
      setRounds((rs) => [...rs, round]);
      setRetrieving(false);
      setActiveRound(round.id);
      setSheetAnchor("r" + round.id + "#" + (sheetSeqRef.current++));
      setMessages((m) => [...m.slice(0, -1), { role: "ai", roundId: round.id, node: roundReplyNode(round) }]);
      setSuggestions(ROUND_SUGS[round.kind] || ROUND_SUGS.all);
    }, 850);
  };

  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages, localSend: handleSend });

  // ask the AI about a specific open item; replies stay grounded in its real fields
  const askAbout = (q, item) => {
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", typing: true }]);
    setTimeout(() => {
      setMessages((m) => [...m.slice(0, -1), { role: "ai", node: replyForResource(q, item) }]);
    }, 750);
  };

  // album item helpers
  const previewItem = (it) => setPreview({ title: it.title, pages: it.pages || 12, qcount: it.q || 0, updated: album ? album.updated : "2025", type: it.type });
  const playItem = (it) => setPlayer({ title: it.title, cat: "微课", subject: album ? album.subject : "", grade: album ? album.grade : "", edition: album ? album.edition : "", duration: it.dur || "08:00", quality: "1080P", plays: "—", updated: album ? album.updated : "2025", chapters: [{ t: "00:00", name: "精讲开始" }, { t: "03:00", name: "重点解析" }, { t: "06:00", name: "小结" }] });

  const addBasket = (item) => {
    const ok = onAddBasket ? onAddBasket(item) : true;
    showToast(ok ? "已加入资源篮" : "已在资源篮中");
  };

  // which round is shown on the right (explicit selection, else the latest)
  const roundsById = {}; rounds.forEach((r) => { roundsById[r.id] = r; });
  const shownRound = (activeRound != null ? roundsById[activeRound] : null) || (rounds.length ? rounds[rounds.length - 1] : null);
  const shownId = shownRound ? shownRound.id : null;

  // mobile: which thing the sheet should reveal (open item overrides the round anchor)
  const sheetKey = preview ? "p:" + preview.title : player ? "v:" + player.title : album ? "a:" + (album.id || album.title) : sheetAnchor;

  const renderItem = (it, idx) => {
    const key = it._kind + "_" + (it.id || it.title) + "_" + idx;
    if (it._kind === "video") return <VideoCard key={key} v={it} source={it._source} onPlay={() => setPlayer(it)} onDownload={() => showToast(`已开始下载《${(it.title || "").slice(0, 12)}…》`)} />;
    if (it._kind === "album") return <AlbumCard key={key} a={it} source={it._source} onOpen={() => setAlbum(it)} />;
    return <ResourceCard key={key} r={it} source={it._source} onPreview={() => setPreview(it)} onDownload={() => showToast(`已开始下载《${(it.title || "").slice(0, 12)}…》`)} />;
  };

  const items = shownRound ? shownRound.items : [];
  const presentSources = ["我的内容", "资源篮", "学科网"].filter((s) => items.some((x) => x._source === s));
  const resultBody = items.length
    ? <React.Fragment>{items.map(renderItem)}<HandoffBar topic={shownRound.subject || ""} onSwitch={onSwitch} query={shownRound.query} /></React.Fragment>
    : <NotFound topic={shownRound ? (shownRound.subject || "") : ""} onSwitch={onSwitch} query={shownRound ? shownRound.query : query} />;

  const hdrBtn = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", flexShrink: 0 };

  return (
    <WorkspaceShell scenario={scenario} onHome={onHome} onSwitch={onSwitch} headerRecognizing={headerRecognizing} mobilePanelLabel="资源" mobilePanelIcon="search" openSheetKey={sheetKey} right={
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => onOpenContent && onOpenContent()} style={hdrBtn}>
          <Icon name="grid" size={15} /> 我的内容
        </button>
        <button onClick={() => onOpenBasket && onOpenBasket()} style={{ ...hdrBtn, position: "relative" }}>
          <Icon name="basket" size={15} /> 资源篮
          {basketCount > 0 && <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "var(--brand)", color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: "var(--font-num)", display: "inline-grid", placeItems: "center" }}>{basketCount}</span>}
        </button>
        <button onClick={() => window.open("https://www.zxxk.com", "_blank", "noopener")} title="前往学科网（新窗口打开）" style={{ ...hdrBtn, color: "var(--auth-ink)", borderColor: "var(--auth-border)", background: "var(--auth-bg)" }}>
          <Icon name="external" size={15} /> 学科网
        </button>
      </div>
    }>
      <ChatPanel messages={messages} onSend={send} suggestions={suggestions} placeholder="例如：只看实验视频 / 整套打包下载" roundsById={roundsById} shownId={shownId} retrieving={retrieving} onOpenRound={openRound} />
      {/* results */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative" }}>
        {!rounds.length && !retrieving && <FindColdStart loggedIn={!resume && loggedIn} onPick={(q) => handleSend(q)} />}
        {retrieving && <RetrievingPanel />}
        {!retrieving && shownRound && (
          <React.Fragment>
            <div style={{ padding: mobile ? "11px 16px" : "13px 22px", borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 7 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>以下是为你匹配的资源</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, fontFamily: "var(--font-num)", padding: "1px 8px", borderRadius: 999, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)" }}>{items.length} 项</span>
              <div style={{ flex: 1 }} />
              {presentSources.length > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-3)", fontWeight: 600, flexWrap: "wrap", rowGap: 5 }}>
                  {!mobile && <span>来源</span>}
                  {presentSources.map((s) => <SourceTag key={s} source={s} />)}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: mobile ? "11px 16px 20px" : "14px 22px 24px", display: "flex", flexDirection: "column", gap: mobile ? 9 : 12 }}>
              {resultBody}
            </div>
          </React.Fragment>
        )}

        {album && <AlbumPage a={album} onClose={() => setAlbum(null)} onPreviewItem={previewItem} onPlayItem={playItem} onDownload={(msg) => showToast(msg)} onAddBasket={addBasket} />}
        {preview && <PreviewDrawer r={preview} onClose={() => setPreview(null)} onAsk={askAbout} onAddBasket={addBasket} onDownload={() => showToast("已开始下载，可在「资源篮」查看")} />}
        {player && <VideoPlayer v={player} onClose={() => setPlayer(null)} onAsk={askAbout} onAddBasket={addBasket} onDownload={() => showToast(`已开始下载视频《${player.title.slice(0, 12)}…》`)} />}
        {toast && (
          <div className="enter-pop" style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--surface)", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "0 12px 30px -12px rgba(0,0,0,.5)", display: "inline-flex", alignItems: "center", gap: 8, zIndex: 60 }}>
            <Icon name="check" size={16} sw={2.6} /> {toast}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

function HandoffBar({ topic, onSwitch, query }) {
  return (
    <div style={{ marginTop: 4, padding: 16, borderRadius: 16, border: "1px dashed var(--brand-soft-border)", background: "var(--brand-soft)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="sparkArrow" size={17} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--brand-deep)" }}>没找到完全合适的？让小博士基于学科网资源库直接生成</span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {HANDOFF.map((h) => (
          <button
            key={h.id}
            onClick={() => onSwitch && onSwitch(h.id, query || `基于「${topic}」`)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)", transition: "transform .15s, border-color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `oklch(0.78 0.09 ${h.hue})`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
          >
            <ScenarioGlyph icon={h.icon} hue={h.hue} size={34} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{h.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{h.hint}</div>
            </div>
            <Icon name="arrow" size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

// cold-start panel: shown when teacher entered 找资源 without any input
function FindColdStart({ onPick, loggedIn }) {
  const M = window.AIDATA.USER_MEMORY;
  const mobile = useIsMobile();
  // memory-driven personalization (logged-in teacher with a profile)
  const memExamples = [
    { kind: "贴合你的班级", hue: 25, icon: "search", items: ["人教版七年级上《有理数》同步练习，中等偏上", "七年级数学《整式的加减》易错题专项", "《一元一次方程》单元测试卷 含答案"] },
    { kind: "你常找的视频", hue: 200, icon: "interactive", items: ["七年级数学《数轴》讲解视频", "有理数运算 微课 + 配套学案", "初中数学 公开课 / 研修视频"] },
    { kind: "成套备课专辑", hue: 255, icon: "layers", items: ["人教版七年级数学下册 期末复习专辑", "初一数学一元一次方程 一轮复习合集", "七年级上册 计算专题 提分合集"] },
  ];
  const genExamples = [
    { kind: "文档 · 教案/课件/卷子", hue: 150, icon: "search", items: ["北师大版八下 平行四边形的判定 教学设计", "鲁教版高中地理 热力环流 复习课件", "2025年云南昆明 中考化学试卷", "统编版《腊八粥》教材分析、学情分析"] },
    { kind: "视频 · 实验/微课", hue: 200, icon: "interactive", items: ["凸透镜成像规律 实验视频", "氧气的实验室制取 实验视频", "新课标 大单元教学 研修视频"] },
    { kind: "专辑 · 成套合集", hue: 255, icon: "layers", items: ["六年级语文下册 期末复习专辑", "高三数学 函数与导数 一轮复习合集", "中考物理 一轮复习 资源包"] },
  ];
  const memHot = ["有理数 易错题", "整式的加减 课件", "七年级数学 期中卷", "数轴 讲解视频", "一元一次方程 专辑"];
  const genHot = ["平行四边形的判定 教学设计", "热力环流 复习课件", "2025 昆明中考化学卷", "凸透镜成像 实验视频", "高中数学 函数与导数 真题", "初中化学 知识清单"];

  const examples = loggedIn ? memExamples : genExamples;
  const hot = loggedIn ? memHot : genHot;

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "grid", placeItems: "center", padding: "30px 24px" }}>
      <div className="home-fade" style={{ width: "min(660px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ display: "inline-flex", marginBottom: 12 }}><BotAvatar size={50} glow /></div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: "var(--ink)", margin: "0 0 7px" }}>想找点什么教学资源？</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.6 }}>在左侧用一句话描述需求即可。结果会涵盖<b style={{ color: "var(--brand-deep)" }}>文档、视频、成套专辑</b>三类。</p>
        </div>

        {/* memory banner — only when we actually have a profile */}
        {loggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px", borderRadius: 13, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", marginBottom: 22 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}><Icon name="spark" size={15} /></span>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
              已结合你的记忆 <b style={{ color: "var(--brand-deep)" }}>人教版 · 七年级 · 数学</b> 为你推荐，下面都是按你的偏好挑的。
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px", borderRadius: 13, background: "var(--surface-2)", border: "1px dashed var(--line)", marginBottom: 22 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-3)", flexShrink: 0 }}><Icon name="spark" size={15} /></span>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55 }}>
              登录后，小博士会记住你的学段学科，把推荐变得更懂你。现在先看看大家都在找什么 ——
            </div>
          </div>
        )}

        {/* hot searches */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name={loggedIn ? "spark" : "search"} size={14} /> {loggedIn ? "为你推荐" : "热门检索"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {hot.map((h, i) => (
              <button key={i} onClick={() => onPick(h)} style={{ padding: "7px 13px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand-deep)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-2)"; }}>{h}</button>
            ))}
          </div>
        </div>

        {/* examples by type */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
          {examples.map((ex) => (
            <div key={ex.kind} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 14, background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                <ScenarioGlyph icon={ex.icon} hue={ex.hue} size={30} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{ex.kind}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ex.items.map((it, i) => (
                  <button key={i} onClick={() => onPick(it)} style={{ textAlign: "left", padding: "8px 10px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", fontSize: 12, fontWeight: 600, lineHeight: 1.5, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = `oklch(0.78 0.09 ${ex.hue})`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}>{it}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFound({ topic, onSwitch, query }) {
  return (
    <div style={{ textAlign: "center", padding: "30px 20px 10px" }}>
      <div style={{ display: "inline-flex", marginBottom: 12, color: "var(--line)" }}>
        <Icon name="search" size={44} sw={1.4} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>当前条件下暂无现成资源完全匹配</div>
      <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 22, lineHeight: 1.6 }}>
        在左侧对我说「放宽难度 / 换个版本」，或者 —— 让小博士基于学科网资源库<b style={{ color: "var(--brand-deep)" }}>直接为你生成</b>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <HandoffBar topic={topic} onSwitch={onSwitch} query={query} />
      </div>
    </div>
  );
}

function ResourceCard({ r, onPreview, onDownload, source }) {
  return (
    <div
      className="res-card"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 13, transition: "box-shadow .2s, border-color .2s", cursor: "pointer", display: "flex", gap: 13, alignItems: "center" }}
      onClick={onPreview}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 24px -18px rgba(0,0,0,.3)"; e.currentTarget.style.borderColor = "var(--brand-soft-border)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
    >
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <div style={{ position: "relative", width: 44, height: 44 }}>
          <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--line)" strokeWidth="4" />
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(r.match / 100) * 113} 113`} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "var(--brand-deep)", fontFamily: "var(--font-num)" }}>{r.match}</div>
        </div>
        <div style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 2 }}>匹配度</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--ink-3)", flexWrap: "wrap", rowGap: 4 }}>
          {source && <SourceTag source={source} />}
          <span style={{ fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap" }}>{r.edition} · {r.grade}{r.subject}</span>
          <span style={{ padding: "1px 7px", borderRadius: 5, background: "var(--surface-2)", border: "1px solid var(--line)", fontWeight: 600, whiteSpace: "nowrap" }}>{r.type}</span>
          <span style={{ whiteSpace: "nowrap" }}>难度·{r.diff}</span>
          {r.qcount > 0 && <span style={{ whiteSpace: "nowrap" }}>{r.qcount} 题</span>}
          <span style={{ whiteSpace: "nowrap" }}>{r.pages} 页</span>
        </div>
      </div>
      <Icon name="chevronRight" size={18} />
    </div>
  );
}

function PreviewDrawer({ r, onClose, onDownload, onAsk, onAddBasket }) {
  const asks = ["总结这份资料的内容", "这份适合我的班级吗", "提取讲解重点", "据此出一份同类卷子"];
  return (
    <div className="drawer-pop" style={{ position: "absolute", inset: 0, zIndex: 25, background: "var(--canvas)", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <button onClick={onClose} title="返回结果" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="back" size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", lineHeight: 1.4 }}>{r.title}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{r.pages} 页 · {r.qcount > 0 ? `${r.qcount} 题` : "课件"} · 更新 {r.updated}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="close" size={16} sw={2.4} />
        </button>
      </div>
      {/* pages preview */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        {[0, 1].map((p) => (
          <div key={p} style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 8, boxShadow: "0 6px 20px -12px rgba(0,0,0,.3)", border: "1px solid var(--line)", padding: "26px 28px", aspectRatio: "1 / 1.414" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", textAlign: "center", marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 10.5, color: "#888", textAlign: "center", marginBottom: 18 }}>学科网 · 精品资源 · 第 {p + 1} 页</div>
            {[...Array(6)].map((_, k) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#333", marginBottom: 6 }}>{p * 6 + k + 1}. 题目内容预览</div>
                <div style={{ height: 7, background: "#eee", borderRadius: 3, marginBottom: 5, width: "92%" }} />
                <div style={{ height: 7, background: "#eee", borderRadius: 3, width: `${60 + ((k * 13) % 35)}%` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* bottom: keep-collaborating asks (sticky, thumb-reachable) + actions */}
      <div style={{ flexShrink: 0, borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
        {onAsk && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "var(--brand-soft)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--brand-deep)", flexShrink: 0 }}>
              <Icon name="spark" size={14} /> 问小博士
            </span>
            <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
              {asks.map((q, i) => (
                <button key={i} onClick={() => onAsk(q, r)} style={{ whiteSpace: "nowrap", flexShrink: 0, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--brand-soft-border)", background: "var(--surface)", color: "var(--brand-deep)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ padding: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", rowGap: 10, justifyContent: "flex-end" }}>
          <Btn kind="soft" icon="basket" onClick={() => onAddBasket && onAddBasket(r)}>加入资源篮</Btn>
          <Btn kind="primary" icon="download" onClick={onDownload}>下载文档</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FindWorkspace, WorkspaceShell, ChatPanel, Bubble, RecognizingPanel });

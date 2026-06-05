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

function WorkspaceShell({ scenario, onHome, children, right, titleMeta, subtitleOverride, recognizing, headerRecognizing }) {
  const showRec = recognizing || headerRecognizing;
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 22px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
          zIndex: 4,
        }}
      >
        <button
          onClick={onHome}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--ink-2)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-zh)",
          }}
        >
          <Icon name="back" size={16} /> 首页
        </button>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <ScenarioGlyph icon={scenario.icon} hue={scenario.hue} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 9, whiteSpace: "nowrap" }}>
                {scenario.name}
                {titleMeta}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitleOverride || scenario.tagline}</div>
            </div>
          </div>
        )}
        <div style={{ flex: 1 }} />
        {!showRec && right}
      </header>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {(() => {
          const kids = React.Children.toArray(children);
          if (!recognizing && kids.length >= 2 && kids[0] && kids[0].type === ChatPanel) {
            return <ChatResizer>{children}</ChatResizer>;
          }
          return children;
        })()}
      </div>
    </div>
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
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>小博士正从<b style={{ color: "var(--brand-deep)" }}>学科网权威库</b>判断最合适的场景，稍候就为你打开对应的工作台。</p>
      </div>
    </div>
  );
}

// ---- Chat panel (left) ----
function ChatPanel({ messages, onSend, suggestions, placeholder, width = 380 }) {
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
        {messages.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
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

function Bubble({ m }) {
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
      <div style={{ flex: m.wide ? 1 : "0 1 auto", minWidth: 0, background: "var(--surface-2)", border: "1px solid var(--line)", padding: "10px 13px", borderRadius: "4px 14px 14px 14px", fontSize: 13.5, lineHeight: 1.65, color: "var(--ink)" }}>
        {m.typing ? <Dots /> : m.render ? m.render() : (m.node || m.text)}
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
  { id: "paper", icon: "paper", label: "直接出一份卷子", hue: 25, hint: "从权威题库智能组卷" },
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
function detectKind(q) {
  if (!q) return "all";
  if (/专辑|合集|套|打包|串讲|资源包|大单元|上好课/.test(q)) return "album";
  if (/视频|实验|研修|示范课|微课视频|讲解视频/.test(q)) return "video";
  return "all";
}

function FindWorkspace({ scenario, query, onHome, onSwitch, fromIntent, resume }) {
  const ALL = window.AIDATA.RESOURCES;
  const isResume = !!resume;
  const initKind = detectKind(query);
  const topicMatch = query && (query.match(/《(.+?)》/) || [])[1];
  const initSubject = pickSubject(query) || (initKind === "all" ? "数学" : null);
  const initGrade = pickGrade(query) || (initKind === "all" ? "七年级" : null);

  const [filters, setFilters] = uS({ grade: initGrade, subject: initSubject, edition: initKind === "all" ? "人教版" : null, type: null, diff: null });
  const [tab, setTab] = uS(initKind);
  const [showMore, setShowMore] = uS(false);
  const [preview, setPreview] = uS(null);
  const [player, setPlayer] = uS(null);
  const [album, setAlbum] = uS(null);
  const [toast, setToast] = uS(null);
  const [highlight, setHighlight] = uS(false);
  // started=true → show real results; false → cold start (no input) or mid intent-thinking
  const [started, setStarted] = uS(!!query && !fromIntent);

  const kindGreet = {
    video: <span>收到！已从<b style={{ color: "var(--brand-deep)" }}>学科网权威视频库</b>为你找到相关教学视频，支持<b>在线播放、按章节跳转</b>，也可下载。想看实验类还是研修类，直接跟我说。</span>,
    album: <span>收到！我为你匹配到成套的<b style={{ color: "var(--brand-deep)" }}>精品专辑</b>（含课件 / 教案 / 试卷等），可<b>整套打包</b>或挑单份下载，全部经三审三校。</span>,
    all: <span>收到！我已从<b style={{ color: "var(--brand-deep)" }}>学科网权威库</b>为你检索，结果包含<b>文档、视频、专辑</b>三类，可在上方切换。想更精准，直接跟我说就行。</span>,
  };

  const greetMsg = () => ({ role: "ai", node: <div>{kindGreet[initKind] || kindGreet.all}</div> });

  const [messages, setMessages] = uS(() => {
    if (isResume) {
      return [
        { role: "ai", node: (<div>已恢复你 <b>{resume.when}</b> 关于「{(resume.title || "").replace(/[《》]/g, "")}」的检索与收藏，下面就是当时的结果，<b style={{ color: "var(--brand-deep)" }}>已收藏的资源</b>也都还在。继续筛选或换个方向都行。</div>) },
      ];
    }
    if (fromIntent && query) {
      return [
        { role: "user", text: query },
        { role: "ai", wide: true, render: () => <InlineIntent query={query} onDone={() => { setStarted(true); setMessages((m) => [...m, greetMsg()]); }} /> },
      ];
    }
    if (query) return [{ role: "user", text: query }, greetMsg()];
    return [{ role: "ai", node: (<div>你好老师，告诉我你要找什么 —— 文档、<b>实验/研修视频</b>、还是<b>成套专辑</b>都行，例如「凸透镜成像的实验视频」「六年级语文期末复习专辑」。我会从<b style={{ color: "var(--auth-ink)" }}>三审三校</b>权威库为你精准匹配。</div>) }];
  });
  const initSug = {
    video: ["只看实验视频", "教师研修视频", "有没有高清的", "下载这个视频"],
    album: ["展开专辑内容", "整套打包下载", "只要试卷部分", "换个复习专辑"],
    all: ["只看视频", "有没有成套专辑", "只要含答案的文档", "难度再高一点"],
  };
  const [suggestions, setSuggestions] = uS(query && !fromIntent ? (initSug[initKind] || initSug.all) : []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const docs = ALL.filter((r) =>
    (!filters.grade || r.grade === filters.grade) &&
    (!filters.subject || r.subject === filters.subject) &&
    (!filters.edition || r.edition === filters.edition || r.edition === "通用") &&
    (!filters.type || r.type === filters.type) &&
    (!filters.diff || r.diff === filters.diff)
  );
  const vids = window.AIDATA.VIDEOS.filter((v) => !filters.subject || v.subject === filters.subject || v.subject === "通用");
  const albs = window.AIDATA.ALBUMS.filter((a) => !filters.subject || a.subject === filters.subject);
  const counts = { all: docs.length + vids.length + albs.length, doc: docs.length, video: vids.length, album: albs.length };

  const pulse = () => { setHighlight(true); setTimeout(() => setHighlight(false), 600); };
  const aiReply = (node, newSugs) => {
    setMessages((m) => [...m, { role: "ai", typing: true }]);
    setTimeout(() => {
      setMessages((m) => [...m.slice(0, -1), { role: "ai", node }]);
      if (newSugs) setSuggestions(newSugs);
    }, 650);
  };

  const handleSend = (text, files) => {
    setMessages((m) => [...m, { role: "user", text, files }]);
    if (!started) {
      // cold start: first input → infer subject/grade/kind from it
      const k = detectKind(text);
      const sj = pickSubject(text), gr = pickGrade(text);
      if (sj || gr) setFilters((f) => ({ ...f, subject: sj || f.subject, grade: gr || f.grade }));
      if (k !== "all") setTab(k);
      setStarted(true);
      aiReply(<span>收到！已从<b style={{ color: "var(--brand-deep)" }}>学科网权威库</b>为你检索「{text}」，结果在右侧，可按文档 / 视频 / 专辑切换。</span>, initSug[k] || initSug.all);
      return;
    }
    if (files && files.length) {
      pulse();
      aiReply(<span>已收到你上传的参考材料，我会<b>结合它</b>从权威库筛选最贴合的资源。</span>, ["难度再高一点", "只要含答案的", "找不到就帮我生成"]);
      return;
    }
    if (/专辑|合集|套|打包|串讲|资源包/.test(text)) {
      setTab("album"); pulse();
      aiReply(<span>已切到<b>专辑 / 合集</b>视图。整套资料经三审三校，可一键打包，也能展开挑单份。</span>, ["展开专辑内容", "整套打包下载", "只要试卷部分"]);
      return;
    }
    if (/视频|实验|研修|播放|示范课/.test(text)) {
      setTab("video"); pulse();
      aiReply(<span>已切到<b>视频</b>视图。支持在线播放与章节跳转，全部为权威教学/实验视频。</span>, ["只看实验视频", "教师研修视频", "下载这个视频"]);
      return;
    }
    if (/文档|资料|课件|教案|习题|练习/.test(text)) setTab("doc");
    if (text.includes("答案") || text.includes("解析")) {
      setFilters((f) => ({ ...f, type: "同步练习" })); setTab("doc"); pulse();
      aiReply(<span>已为你筛选<b>含答案解析</b>的文档，均来自三审三校精品库。</span>, ["难度再高一点", "我要单元测试卷", "都不太合适"]);
    } else if (text.includes("难") || text.includes("高") || text.includes("拔高") || text.includes("培优")) {
      setFilters((f) => ({ ...f, diff: "拔高", type: null })); setTab("doc"); pulse();
      aiReply(<span>已切换到<b>拔高 / 培优</b>难度，题目经编辑团队<b style={{ color: "var(--auth-ink)" }}>三审三校</b>校验。</span>, ["要易错题专项", "再降一点难度", "都不太合适"]);
    } else if (text.includes("北师")) {
      setFilters((f) => ({ ...f, edition: "北师大版" })); pulse();
      aiReply(<span>已切换到<b>北师大版</b>。如该版本暂缺，我会用通用精品资源补齐。</span>, ["只要含答案的", "难度再高一点", "都不太合适"]);
    } else if (text.includes("单元") || text.includes("测试") || text.includes("卷")) {
      setFilters((f) => ({ ...f, type: "单元测试", diff: null })); setTab("doc"); pulse();
      aiReply(<span>已筛选<b>单元测试卷</b>。需要的话我可以直接把它送进「出卷子」二次编辑。</span>, ["难度再高一点", "送去出卷子", "只要含答案的"]);
    } else if (text.includes("生成") || text.includes("不合适") || text.includes("找不到") || text.includes("没有")) {
      aiReply(<span>没问题 —— 现成资源不完全合适时，我可以<b style={{ color: "var(--brand-deep)" }}>基于同一权威库直接为你生成</b>。看右侧底部，选一个方向即可。</span>, ["直接出卷子", "生成配套教案"]);
    } else if (text.includes("出卷")) {
      onSwitch && onSwitch("paper", query || "基于检索结果的练习");
    } else {
      pulse();
      aiReply(<span>我已根据「{text}」重新排序，结果均标注<b style={{ color: "var(--auth-ink)" }}>权威来源</b>。</span>, ["只看视频", "有没有成套专辑", "难度再高一点"]);
    }
  };

  const setF = (key, val) => { setFilters((f) => ({ ...f, [key]: f[key] === val ? null : val })); pulse(); };
  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages, localSend: handleSend });

  const conditions = [
    filters.edition && { key: "edition", label: filters.edition },
    filters.grade && { key: "grade", label: filters.grade },
    filters.subject && { key: "subject", label: filters.subject },
    topicMatch && { key: "__topic", label: topicMatch, fixed: true },
    filters.type && { key: "type", label: filters.type },
    filters.diff && { key: "diff", label: `难度·${filters.diff}` },
  ].filter(Boolean);
  const removeCond = (key) => { if (key === "__topic") return; setFilters((f) => ({ ...f, [key]: null })); pulse(); };

  // album item helpers
  const previewItem = (it) => setPreview({ title: it.title, pages: it.pages || 12, qcount: it.q || 0, updated: album ? album.updated : "2025", type: it.type });
  const playItem = (it) => setPlayer({ title: it.title, cat: "微课", subject: album ? album.subject : "", grade: album ? album.grade : "", edition: album ? album.edition : "", duration: it.dur || "08:00", quality: "1080P", plays: "—", updated: album ? album.updated : "2025", chapters: [{ t: "00:00", name: "精讲开始" }, { t: "03:00", name: "重点解析" }, { t: "06:00", name: "小结" }] });

  const curCount = counts[tab] || 0;

  let body;
  if (curCount === 0) {
    body = <NotFound topic={topicMatch || (filters.subject || "")} onSwitch={onSwitch} query={query} />;
  } else {
    const docCards = docs.map((r) => <ResourceCard key={r.id} r={r} onPreview={() => setPreview(r)} onDownload={() => showToast(`已开始下载《${r.title.slice(0, 12)}…》`)} />);
    const vidCards = vids.map((v) => <VideoCard key={v.id} v={v} onPlay={() => setPlayer(v)} onDownload={() => showToast(`已开始下载《${v.title.slice(0, 12)}…》`)} />);
    const albCards = albs.map((a) => <AlbumCard key={a.id} a={a} onOpen={() => setAlbum(a)} />);
    if (tab === "doc") body = <React.Fragment>{docCards}<HandoffBar topic={topicMatch} onSwitch={onSwitch} query={query} /></React.Fragment>;
    else if (tab === "video") body = vidCards;
    else if (tab === "album") body = albCards;
    else body = <React.Fragment>{albCards}{docCards}{vidCards}<HandoffBar topic={topicMatch} onSwitch={onSwitch} query={query} /></React.Fragment>;
  }

  return (
    <WorkspaceShell scenario={scenario} onHome={onHome} headerRecognizing={headerRecognizing} right={
      <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
        <Icon name="layers" size={15} /> 我的资源夹
      </button>
    }>
      <ChatPanel messages={messages} onSend={send} suggestions={suggestions} placeholder="例如：只看实验视频 / 整套打包下载" />
      {/* results */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative" }}>
        {!started && <FindColdStart onPick={(q) => handleSend(q)} />}
        {started && <React.Fragment>
        {!isResume && (
          <div style={{ padding: "10px 22px 0" }}>
            <MemoryNote text={<span>已按你的<b style={{ color: "var(--brand-deep)" }}>记忆</b>默认筛选 人教版 · 七年级 · 数学 —— 想换条件，直接在左侧对我说，或点下方筛选。</span>} />
          </div>
        )}
        {/* AI-understood conditions bar */}
        <div style={{ padding: "13px 22px 12px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-3)", fontWeight: 700 }}>
              <Icon name="spark" size={14} /> 小博士已理解
            </span>
            {isResume && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>
                <Icon name="history" size={12} /> 历史创作 · 恢复自{resume.when}
              </span>
            )}
            {conditions.length === 0 && <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>全部资源 · 未限定条件</span>}
            {conditions.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: c.fixed ? "var(--brand)" : "var(--brand-soft)", color: c.fixed ? "#fff" : "var(--brand-deep)", border: c.fixed ? "none" : "1px solid var(--brand-soft-border)", fontSize: 12.5, fontWeight: 700 }}>
                {c.label}
                {!c.fixed && <span onClick={() => removeCond(c.key)} style={{ display: "inline-flex", cursor: "pointer", opacity: 0.55 }}><Icon name="close" size={12} sw={2.6} /></span>}
              </span>
            ))}
            <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>· 点 × 放宽，或在左侧直接对我说</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowMore((s) => !s)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--ink-3)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              <Icon name="filter" size={14} /> {showMore ? "收起精确筛选" : "精确筛选"}
            </button>
          </div>
          {showMore && (
            <div className="trace-pop" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--line)", display: "flex", flexWrap: "wrap", gap: 16 }}>
              {MORE_FILTERS.map((fd) => (
                <div key={fd.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700 }}>{fd.label}</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {fd.opts.map((o) => (
                      <button key={o} onClick={() => setF(fd.key, o)} style={{ padding: "5px 11px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", border: filters[fd.key] === o ? "1px solid var(--brand)" : "1px solid var(--line)", background: filters[fd.key] === o ? "var(--brand-soft)" : "var(--surface)", color: filters[fd.key] === o ? "var(--brand-deep)" : "var(--ink-3)", transition: "all .15s" }}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* content-type tabs */}
        <div style={{ padding: "12px 22px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "inline-flex", gap: 4, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 11, padding: 3 }}>
            {RESULT_TABS.map((tb) => (
              <button key={tb.k} onClick={() => setTab(tb.k)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "var(--font-zh)", fontSize: 13, fontWeight: 700, background: tab === tb.k ? "var(--surface)" : "transparent", color: tab === tb.k ? "var(--brand-deep)" : "var(--ink-3)", boxShadow: tab === tb.k ? "0 2px 8px -4px rgba(0,0,0,.25)" : "none", transition: "all .15s" }}>
                {tb.label}
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-num)", padding: "1px 6px", borderRadius: 999, background: tab === tb.k ? "var(--brand-soft)" : "var(--line)", color: tab === tb.k ? "var(--brand-deep)" : "var(--ink-3)" }}>{counts[tb.k]}</span>
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--auth-ink)", fontWeight: 600 }}>
            <Icon name="shield" size={14} /> 全部来自三审三校权威库
          </div>
        </div>
        {/* result list */}
        <div className={highlight ? "results-pulse" : ""} style={{ flex: 1, overflowY: "auto", padding: "14px 22px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {body}
        </div>
        </React.Fragment>}

        {album && <AlbumPage a={album} onClose={() => setAlbum(null)} onPreviewItem={previewItem} onPlayItem={playItem} onDownload={(msg) => showToast(msg)} />}
        {preview && <PreviewDrawer r={preview} onClose={() => setPreview(null)} onDownload={() => showToast("已开始下载，可在「我的资源夹」查看")} />}
        {player && <VideoPlayer v={player} onClose={() => setPlayer(null)} onDownload={() => showToast(`已开始下载视频《${player.title.slice(0, 12)}…》`)} />}
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
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--brand-deep)" }}>没找到完全合适的？让小博士基于权威库直接生成</span>
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
function FindColdStart({ onPick }) {
  const examples = [
    { kind: "文档", hue: 150, icon: "search", items: ["人教版七年级《有理数》随堂练习", "九年级化学《溶液》单元测试卷，含答案"] },
    { kind: "视频", hue: 200, icon: "interactive", items: ["凸透镜成像规律的实验视频", "氧气的实验室制取 实验视频"] },
    { kind: "专辑", hue: 255, icon: "layers", items: ["六年级语文下册期末复习专辑", "高三数学函数与导数一轮复习合集"] },
  ];
  const hot = ["有理数 随堂练习", "光合作用 课件", "中考物理压轴题", "古诗文默写专项", "新课标 大单元教学"];
  return (
    <div style={{ flex: 1, overflowY: "auto", display: "grid", placeItems: "center", padding: "30px 24px" }}>
      <div className="home-fade" style={{ width: "min(660px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ display: "inline-flex", marginBottom: 12 }}><BotAvatar size={50} glow /></div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: "var(--ink)", margin: "0 0 7px" }}>想找点什么教学资源？</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.6 }}>在左侧用一句话描述需求即可。结果会涵盖<b style={{ color: "var(--brand-deep)" }}>文档、视频、成套专辑</b>三类。</p>
        </div>

        {/* hot searches */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="spark" size={14} /> 热门检索
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {hot.map((h, i) => (
              <button key={i} onClick={() => onPick(h)} style={{ padding: "7px 13px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand-deep)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-2)"; }}>{h}</button>
            ))}
          </div>
        </div>

        {/* examples by type */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
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
        在左侧对我说「放宽难度 / 换个版本」，或者 —— 让小博士基于权威库<b style={{ color: "var(--brand-deep)" }}>直接为你生成</b>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <HandoffBar topic={topic} onSwitch={onSwitch} query={query} />
      </div>
    </div>
  );
}

function ResourceCard({ r, onPreview, onDownload }) {
  return (
    <div
      className="res-card"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, transition: "box-shadow .2s, border-color .2s", cursor: "pointer" }}
      onClick={onPreview}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 28px -18px rgba(0,0,0,.3)"; e.currentTarget.style.borderColor = "var(--brand-soft-border)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
    >
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div style={{ position: "relative", width: 50, height: 50 }}>
            <svg width="50" height="50" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="25" cy="25" r="21" fill="none" stroke="var(--line)" strokeWidth="4" />
              <circle cx="25" cy="25" r="21" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(r.match / 100) * 132} 132`} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "var(--brand-deep)", fontFamily: "var(--font-num)" }}>{r.match}</div>
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>匹配度</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", lineHeight: 1.45 }}>{r.title}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
            {[r.edition, r.grade, r.subject, r.type, `难度·${r.diff}`].map((t, i) => (
              <span key={i} style={{ padding: "3px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)" }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 11, fontSize: 12, color: "var(--ink-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="download" size={13} /> {r.downloads} 次下载</span>
            {r.qcount > 0 && <span>{r.qcount} 题</span>}
            <span>{r.pages} 页</span>
            <span>更新 {r.updated}</span>
            <div style={{ flex: 1 }} />
            <button onClick={(e) => { e.stopPropagation(); onPreview(); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              <Icon name="eye" size={14} /> 预览
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDownload(); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "none", background: "var(--brand-soft)", color: "var(--brand-deep)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              <Icon name="download" size={14} /> 下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewDrawer({ r, onClose, onDownload }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,16,10,.4)", animation: "pulseBg .01s" }} />
      <div className="drawer-pop" style={{ position: "relative", width: "min(560px, 92vw)", height: "100%", background: "var(--canvas)", boxShadow: "-20px 0 60px -30px rgba(0,0,0,.5)", display: "flex", flexDirection: "column" }}>
        {/* drawer header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{r.pages} 页 · {r.qcount > 0 ? `${r.qcount} 题` : "课件"} · 更新 {r.updated}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", lineHeight: 1.4 }}>{r.title}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <Icon name="close" size={16} sw={2.4} />
          </button>
        </div>
        {/* pages preview */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[0, 1].map((p) => (
            <div key={p} style={{ background: "#fff", borderRadius: 8, boxShadow: "0 6px 20px -12px rgba(0,0,0,.3)", border: "1px solid var(--line)", padding: "26px 28px", aspectRatio: "1 / 1.414" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", textAlign: "center", marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 10.5, color: "#888", textAlign: "center", marginBottom: 18 }}>学科网 · 三审三校精品资源 · 第 {p + 1} 页</div>
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
        {/* drawer footer */}
        <div style={{ padding: 16, borderTop: "1px solid var(--line)", background: "var(--surface)", display: "flex", gap: 10 }}>
          <Btn kind="primary" icon="download" onClick={onDownload} style={{ flex: 1 }}>下载原件</Btn>
          <Btn kind="soft" icon="plus">加入资源夹</Btn>
          <Btn kind="ghost" icon="paper">送去出卷子</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FindWorkspace, WorkspaceShell, ChatPanel, Bubble, RecognizingPanel });

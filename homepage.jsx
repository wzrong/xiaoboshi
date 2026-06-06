// homepage.jsx — unified entry, 3 switchable directions
const { useState, useRef, useEffect } = React;

function MenuRow({ icon, label, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", background: "transparent", color: accent ? "var(--brand-deep)" : "var(--ink-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon name={icon} size={15} /> {label}
    </button>
  );
}

// The shared smart input box
function SmartInput({ value, setValue, onSubmit, big, placeholder }) {
  const ref = useRef(null);
  const [files, setFiles] = useState([]);
  const fs = big ? 17 : 15;
  const lh = 1.55;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const maxH = Math.round(fs * lh * 5); // cap at 5 lines
    const next = Math.min(el.scrollHeight, maxH);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > maxH + 1 ? "auto" : "hidden";
  }, [value, fs]);
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "2px solid var(--input-border)",
        borderRadius: 20,
        boxShadow: "var(--input-shadow)",
        padding: big ? "18px 18px 14px" : "12px 12px 10px",
        transition: "border-color .2s, box-shadow .2s",
      }}
      onFocusCapture={(e) =>
        (e.currentTarget.style.borderColor = "var(--brand)")
      }
      onBlurCapture={(e) =>
        (e.currentTarget.style.borderColor = "var(--input-border)")
      }
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        rows={big ? 2 : 1}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          background: "transparent",
          fontSize: fs,
          lineHeight: lh,
          color: "var(--ink)",
          fontFamily: "var(--font-zh)",
          padding: "2px 4px",
          display: "block",
          overflowY: "hidden",
          boxSizing: "border-box",
        }}
      />
      <FileChips files={files} onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))} style={{ margin: "4px 2px 0" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: big ? 8 : 4,
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <ClipButton onFiles={(names) => setFiles((f) => [...f, ...names].slice(0, 6))} compact />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              lineHeight: 1,
              color: "var(--ink-3)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ display: "grid", placeItems: "center", width: 14, height: 14 }}><Icon name="spark" size={14} /></span>
            AI 自动识别场景
          </span>
        </div>
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: big ? "11px 24px" : "8px 18px",
            borderRadius: 13,
            border: "none",
            background: value.trim() ? "var(--brand)" : "var(--line)",
            color: value.trim() ? "#fff" : "var(--ink-3)",
            fontSize: big ? 15 : 13.5,
            fontWeight: 700,
            cursor: value.trim() ? "pointer" : "default",
            fontFamily: "var(--font-zh)",
            boxShadow: value.trim() ? "0 4px 14px -5px var(--brand-glow)" : "none",
            transition: "all .2s",
            flexShrink: 0,
          }}
        >
          开始 <Icon name="send" size={big ? 17 : 15} />
        </button>
      </div>
    </div>
  );
}

// ---------- Direction A: 对话优先 ----------
function HomeConversation({ value, setValue, onSubmit, onPick, onResume, loggedIn, onLogin, onManageMemory, onOpenWorks }) {
  const S = window.AIDATA.SCENARIOS;
  const mobile = useIsMobile();
  return (
    <div className="home-fade" style={{ padding: mobile ? "2vh 16px 36px" : "4vh 24px 40px", textAlign: "center" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: mobile ? 16 : 20 }}>
          <BotAvatar size={mobile ? 54 : 66} glow />
        </div>
        <h1 style={{ fontSize: mobile ? 25 : 34, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
          老师好，今天想准备点什么？
        </h1>
        <p style={{ fontSize: mobile ? 14.5 : 16, color: "var(--ink-2)", margin: "0 0 28px", lineHeight: 1.6 }}>
          说出你的需求，我会从<b style={{ color: "var(--brand-deep)" }}>学科网资源库</b>出发，陪你一起完成。
        </p>
        <SmartInput
          value={value}
          setValue={setValue}
          onSubmit={onSubmit}
          big
          placeholder="描述你的教学需求，AI 自动判断该进入哪个场景…"
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginTop: 22, maxWidth: "min(940px, 96vw)", marginLeft: "auto", marginRight: "auto" }}>
        {S.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            className="chip-pop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 12px 8px 9px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              cursor: "pointer",
              fontFamily: "var(--font-zh)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "transform .15s, box-shadow .2s, border-color .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px -10px rgba(0,0,0,.2)";
              e.currentTarget.style.borderColor = `oklch(0.7 0.1 ${s.hue})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--line)";
            }}
          >
            <ScenarioGlyph icon={s.icon} hue={s.hue} size={26} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{s.name}</span>
            {s.badge && (
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "oklch(0.5 0.13 45)", background: "oklch(0.95 0.05 45)", padding: "1px 6px", borderRadius: 999, marginLeft: -2 }}>互动</span>
            )}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {loggedIn ? <MemoryPanel onResume={onResume} onManageMemory={onManageMemory} onOpenWorks={onOpenWorks} /> : <LoginHook onLogin={onLogin} />}
        <AuthorityStrip />
      </div>
    </div>
  );
}

// ---------- Login hook (shown when logged out, in place of memory) ----------
function LoginHook({ onLogin }) {
  const M = window.AIDATA.USER_MEMORY;
  const teases = [
    { icon: "spark", t: "记住你的学科、学段与版本偏好" },
    { icon: "history", t: "一键续作上次的课件、试卷与教案" },
    { icon: "layers", t: "同步你的收藏与下载，随处可取" },
  ];
  return (
    <div
      style={{
        marginTop: 26,
        position: "relative",
        background: "var(--surface)",
        border: "1px dashed var(--brand-soft-border)",
        borderRadius: 20,
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 22px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 11px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 700, marginBottom: 11 }}>
            <Icon name="spark" size={13} /> 登录解锁「小博士记忆」
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>
            登录后，小博士会记住你、越用越懂你
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {teases.map((x, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
                  <Icon name={x.icon} size={13} />
                </span>
                {x.t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <button
            onClick={onLogin}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 13, border: "none", background: "var(--brand)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", boxShadow: "0 6px 18px -6px var(--brand-glow)", whiteSpace: "nowrap" }}
          >
            登录 / 注册 <Icon name="arrow" size={17} />
          </button>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center", marginTop: 8 }}>未登录也可正常使用全部场景</div>
        </div>
      </div>
    </div>
  );
}

// ---------- AI memory: learned teacher profile ----------
function MemoryPanel({ onResume, onManageMemory, onOpenWorks }) {
  const M = window.AIDATA.USER_MEMORY;
  const S = window.AIDATA.SCENARIOS;
  const mobile = useIsMobile();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("aida_mem_floor") === "0");
  useEffect(() => { try { localStorage.setItem("aida_mem_floor", dismissed ? "0" : "1"); } catch (e) {} }, [dismissed]);

  // collapsed → a slim, unobtrusive strip that explains where memory now lives
  if (dismissed) {
    return (
      <div className="mem-card" style={{ marginTop: 22, maxWidth: 920, marginLeft: "auto", marginRight: "auto", display: "flex", alignItems: "center", gap: 11, padding: "11px 16px", borderRadius: 14, border: "1px dashed var(--line)", background: "var(--surface)", textAlign: "left" }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
          <Icon name="spark" size={14} />
        </span>
        <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
          记忆面板已收起 —— 小博士仍在为你记忆，随时可在左侧 <b style={{ color: "var(--ink-2)" }}>「我的记忆」</b> 查看。
        </div>
        <button onClick={() => setDismissed(false)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--brand-deep)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
          展开
        </button>
      </div>
    );
  }

  return (
    <div
      className="mem-card"
      style={{
        marginTop: 26,
        maxWidth: 920,
        marginLeft: "auto",
        marginRight: "auto",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 12px 34px -24px rgba(0,0,0,.35)",
        textAlign: "left",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 18px", borderBottom: "1px solid var(--line)", background: "var(--brand-soft)" }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
          <Icon name="spark" size={16} />
        </span>
        <div style={{ lineHeight: 1.25, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>小博士还记得你</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            从你的创作与收藏中学习 · 记忆更新于 {M.updated}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={onManageMemory}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 9, border: "1px solid var(--brand-soft-border)", background: "var(--surface)", color: "var(--brand-deep)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", flexShrink: 0 }}
        >
          <Icon name="filter" size={13} /> 管理记忆
        </button>
        <button
          onClick={() => setDismissed(true)}
          title="收起记忆面板"
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--brand-soft-border)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <Icon name="close" size={14} sw={2.4} />
        </button>
      </div>
      {/* body */}
      <div className="mem-grid" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.15fr 0.85fr" }}>
        {/* left: summary + tags + stats */}
        <div className="mem-left" style={{ padding: "16px 18px", borderRight: mobile ? "none" : undefined, borderBottom: mobile ? "1px solid var(--line)" : undefined }}>
          <p style={{ margin: "0 0 13px", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.7 }}>
            {M.summary}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
            {M.tags.map((t, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 12 }}>
                <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{t.k}</span>
                <span style={{ color: "var(--brand-deep)", fontWeight: 700 }}>{t.v}</span>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 13, borderTop: "1px dashed var(--line)" }}>
            {M.stats.map((s, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span style={{ color: "var(--ink-3)" }}><Icon name={s.icon} size={15} /></span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-num)" }}>{s.n}</span>
                <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* right: resume recent creations */}
        <div style={{ padding: "14px 16px", background: "var(--surface-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--ink-3)", marginBottom: 11 }}>
            <Icon name="history" size={14} /> 继续上次创作
            <div style={{ flex: 1 }} />
            <button onClick={onOpenWorks} style={{ display: "inline-flex", alignItems: "center", gap: 3, border: "none", background: "transparent", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              我的内容 <Icon name="arrow" size={13} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {M.recent.map((r, i) => (
              <button
                key={i}
                onClick={() => onResume && onResume(r)}
                style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "transform .15s, border-color .2s, box-shadow .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.borderColor = `oklch(0.8 0.08 ${r.hue})`; e.currentTarget.style.boxShadow = `0 8px 18px -12px oklch(0.6 0.14 ${r.hue} / .5)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <ScenarioGlyph icon={r.icon} hue={r.hue} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.meta} · {r.when}</div>
                </div>
                <span style={{ color: "var(--ink-3)", flexShrink: 0 }}><Icon name="arrow" size={16} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Direction B: 场景宫格 (same shell as 对话优先, scenarios as a balanced grid) ----------
function HomeGrid({ value, setValue, onSubmit, onPick, onResume, loggedIn, onLogin, onManageMemory, onOpenWorks }) {
  const S = window.AIDATA.SCENARIOS;
  const mobile = useIsMobile();
  const narrow = useIsMobile(NARROW_BP);
  const cols = Math.ceil(S.length / 2); // 6→3+3, 7→4+3, 8→4+4
  const gridCols = narrow ? 1 : mobile ? 2 : cols;
  return (
    <div className="home-fade" style={{ padding: mobile ? "2vh 16px 36px" : "4vh 24px 40px", textAlign: "center" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: mobile ? 16 : 20 }}>
          <BotAvatar size={mobile ? 54 : 66} glow />
        </div>
        <h1 style={{ fontSize: mobile ? 24 : 34, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
          选个场景，或直接告诉我你的需求
        </h1>
        <p style={{ fontSize: mobile ? 14.5 : 16, color: "var(--ink-2)", margin: "0 0 28px", lineHeight: 1.6 }}>
          说出你的需求，我会从<b style={{ color: "var(--brand-deep)" }}>学科网资源库</b>出发，陪你一起完成。
        </p>
        <SmartInput
          value={value}
          setValue={setValue}
          onSubmit={onSubmit}
          big
          placeholder="描述你的教学需求，AI 自动判断该进入哪个场景…"
        />
      </div>
      <div
        style={{
          maxWidth: 1000,
          margin: mobile ? "20px auto 0" : "26px auto 0",
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: mobile ? 12 : 16,
        }}
      >
        {S.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            className="chip-pop"
            style={{
              textAlign: "left",
              padding: 20,
              borderRadius: 18,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              cursor: "pointer",
              fontFamily: "var(--font-zh)",
              transition: "transform .18s, box-shadow .25s, border-color .2s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 16px 32px -16px oklch(0.6 0.14 ${s.hue} / .55)`;
              e.currentTarget.style.borderColor = `oklch(0.78 0.09 ${s.hue})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--line)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <ScenarioGlyph icon={s.icon} hue={s.hue} size={46} />
              <span style={{ color: `oklch(0.6 0.12 ${s.hue})`, opacity: 0.5 }}>
                <Icon name="arrow" size={18} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>{s.name}</div>
              {s.badge && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "oklch(0.5 0.13 45)", background: "oklch(0.95 0.05 45)", padding: "2px 7px", borderRadius: 999 }}>{s.badge}</span>
              )}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: `oklch(0.55 0.12 ${s.hue})`, marginTop: 3 }}>
              {s.tagline}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.55 }}>{s.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {loggedIn ? <MemoryPanel onResume={onResume} onManageMemory={onManageMemory} onOpenWorks={onOpenWorks} /> : <LoginHook onLogin={onLogin} />}
        <AuthorityStrip />
      </div>
    </div>
  );
}

// ---------- Direction C: 助手人格 ----------
function HomePersona({ value, setValue, onSubmit, onPick, onResume, loggedIn, onLogin, onManageMemory, onOpenWorks }) {
  const S = window.AIDATA.SCENARIOS;
  const M = window.AIDATA.USER_MEMORY;
  const mobile = useIsMobile();
  return (
    <div className="home-fade" style={{ maxWidth: 1080, margin: "0 auto", padding: mobile ? "1vh 16px 36px" : "2vh 24px 40px" }}>
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(300px, 0.9fr) 1.1fr", gap: mobile ? 18 : 40, alignItems: "start" }}>
      {/* left: the assistant — who I am + what I remember about you */}
      <div>
        <BotAvatar size={mobile ? 68 : 88} glow />
        <div
          style={{
            marginTop: 20,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "4px 20px 20px 20px",
            padding: "18px 20px",
            boxShadow: "0 10px 30px -18px rgba(0,0,0,.25)",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 2 }}>
            我是 AI 小博士 👋
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--brand-deep)", marginBottom: 9 }}>
            你的 AI 教学助手
          </div>
          <p style={{ fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            和别的 AI 不同，我的每一份产出都<b style={{ color: "var(--brand-deep)" }}>是站在学科网的资源库之上</b> —— 不是凭空生成，而是有据可依。
          </p>
        </div>

        {/* memory belongs to the assistant's persona — folded in here, not laid flat */}
        {loggedIn ? (
          <div className="mem-card" style={{ marginTop: 16, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 34px -24px rgba(0,0,0,.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "var(--brand-soft)" }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
                <Icon name="spark" size={15} />
              </span>
              <div style={{ lineHeight: 1.25, minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>而且，我还记得你</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>记忆更新于 {M.updated}</div>
              </div>
              <button onClick={onManageMemory} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 9, border: "1px solid var(--brand-soft-border)", background: "var(--surface)", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", flexShrink: 0 }}>
                <Icon name="filter" size={12} /> 管理
              </button>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7 }}>{M.summary}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 13 }}>
                {M.tags.map((t, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 12 }}>
                    <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{t.k}</span>
                    <span style={{ color: "var(--brand-deep)", fontWeight: 700 }}>{t.v}</span>
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, marginBottom: 9, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
                <Icon name="history" size={13} /> 继续上次创作
                <div style={{ flex: 1 }} />
                <button onClick={onOpenWorks} style={{ display: "inline-flex", alignItems: "center", gap: 3, border: "none", background: "transparent", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
                  我的内容 <Icon name="arrow" size={12} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {M.recent.slice(0, 2).map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onResume && onResume(r)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "transform .15s, border-color .2s, box-shadow .2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.borderColor = `oklch(0.8 0.08 ${r.hue})`; e.currentTarget.style.boxShadow = `0 8px 18px -12px oklch(0.6 0.14 ${r.hue} / .5)`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <ScenarioGlyph icon={r.icon} hue={r.hue} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.meta} · {r.when}</div>
                    </div>
                    <span style={{ color: "var(--ink-3)", flexShrink: 0 }}><Icon name="arrow" size={15} /></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}><LoginHook onLogin={onLogin} /></div>
        )}
      </div>
      {/* right input + actions */}
      <div>
        <SmartInput
          value={value}
          setValue={setValue}
          onSubmit={onSubmit}
          big
          placeholder="描述你的教学需求，AI 自动判断该进入哪个场景…"
        />
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-3)", margin: "22px 2px 12px" }}>
          我可以帮你 —
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {S.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                cursor: "pointer",
                fontFamily: "var(--font-zh)",
                textAlign: "left",
                transition: "transform .15s, border-color .2s, background .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `oklch(0.78 0.09 ${s.hue})`;
                e.currentTarget.style.transform = "translateX(3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <ScenarioGlyph icon={s.icon} hue={s.hue} size={38} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                  {s.name}
                  {s.badge && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "oklch(0.5 0.13 45)", background: "oklch(0.95 0.05 45)", padding: "1px 6px", borderRadius: 999 }}>{s.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{s.tagline}</div>
              </div>
            </button>
          ))}
        </div>
        {/* not sure which? the assistant figures it out */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", borderRadius: 14, border: "1px dashed var(--brand-soft-border)", background: "var(--brand-soft)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
            <Icon name="spark" size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>不确定用哪个？直接说就好</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1, lineHeight: 1.5 }}>把需求写在上面的输入框，小博士会自动判断该进入哪个场景，没有合适的就直接回答你。</div>
          </div>
        </div>
      </div>
    </div>
    <AuthorityStrip />
    </div>
  );
}

function AuthorityStrip() {
  const items = [
    { n: "2000万+", l: "精品资源" },
    { n: "20 年", l: "教研沉淀" },
    { n: "三审三校", l: "质量把关" },
    { n: "全学段", l: "学科覆盖" },
  ];
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, justifyContent: "center", color: "var(--auth-ink)" }}>
        <span style={{ flex: 1, maxWidth: 60, height: 1, background: "var(--auth-border)" }} />
        <Icon name="shield" size={15} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>小博士的每一份生成，背后都有学科网资源库支撑</span>
        <span style={{ flex: 1, maxWidth: 60, height: 1, background: "var(--auth-border)" }} />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 0,
          background: "var(--auth-bg)",
          border: "1px solid var(--auth-border)",
          borderRadius: 16,
          padding: "16px 10px",
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              flex: "1 1 120px",
              textAlign: "center",
              borderRight: i < items.length - 1 ? "1px solid var(--auth-border)" : "none",
              padding: "2px 12px",
            }}
          >
            <div style={{ fontSize: 19, fontWeight: 800, color: "var(--auth-ink)", fontFamily: "var(--font-num)" }}>
              {it.n}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, fontWeight: 600 }}>{it.l}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.6 }}>
        AI 内容仅供教研参考，请结合实际教学进行调整
      </div>
    </div>
  );
}

function Homepage({ page, layout, value, setValue, onSubmit, onPick, onResume, loggedIn, onLogin, onLogout, onNavigate, onNewChat, onRequireLogin }) {
  const Comp =
    layout === "场景宫格" ? HomeGrid : layout === "助手人格" ? HomePersona : HomeConversation;
  const mobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);
  const navTo = (p) => { onNavigate(p); closeNav(); };
  const newChat = () => { onNewChat(); closeNav(); };
  const gate = (fn) => (loggedIn ? fn : onRequireLogin);
  const memProps = {
    onResume: loggedIn ? onResume : (() => onRequireLogin()),
    loggedIn,
    onLogin: onRequireLogin,
    onManageMemory: () => (loggedIn ? onNavigate("memory") : onRequireLogin()),
    onOpenWorks: () => (loggedIn ? onNavigate("works") : onRequireLogin()),
  };
  return (
    <div style={{ height: "100dvh", display: "flex", overflow: "hidden" }}>
      <LeftRail
        page={page}
        loggedIn={loggedIn}
        onNavigate={navTo}
        onNewChat={newChat}
        onResume={(it) => { onResume && onResume(it); closeNav(); }}
        onLogout={onLogout}
        onRequireLogin={onRequireLogin}
        mobile={mobile}
        mobileOpen={navOpen}
        onCloseMobile={closeNav}
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {mobile && (
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface)", borderBottom: "1px solid var(--line)", zIndex: 5 }}>
            <button onClick={() => setNavOpen(true)} aria-label="打开菜单" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <Icon name="menu" size={20} />
            </button>
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
              <BotAvatar size={32} glow />
              <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>AI 小博士</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>你的备课教学助手</div>
              </div>
            </div>
            <button onClick={newChat} aria-label="新对话" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: "none", background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 4px 14px -6px var(--brand-glow)" }}>
              <Icon name="plus" size={20} sw={2.4} />
            </button>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {loggedIn && page === "memory" ? (
            <MemoryPage onResume={onResume} />
          ) : loggedIn && page === "works" ? (
            <WorksPage onResume={onResume} onNewChat={onNewChat} />
          ) : loggedIn && page === "history" ? (
            <HistoryPage onResume={onResume} onNewChat={onNewChat} />
          ) : (
            <React.Fragment>
              <div style={{ margin: "auto 0", width: "100%" }}>
                <Comp value={value} setValue={setValue} onSubmit={onSubmit} onPick={onPick} {...memProps} />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Left navigation rail (always visible) ----------
function LeftRail({ page, loggedIn, onNavigate, onNewChat, onResume, onLogout, onRequireLogin, mobile, mobileOpen, onCloseMobile }) {
  const M = window.AIDATA.USER_MEMORY;
  const [openState, setOpen] = useState(() => localStorage.getItem("aida_rail_open") !== "0");
  const open = mobile ? true : openState; // on mobile the drawer always shows full content
  const [acctMenu, setAcctMenu] = useState(false);
  useEffect(() => { try { localStorage.setItem("aida_rail_open", openState ? "1" : "0"); } catch (e) {} }, [openState]);

  const go = (p) => (loggedIn ? onNavigate(p) : onRequireLogin());

  const NavItem = ({ icon, label, active, onClick, accent }) => (
    <button
      onClick={onClick}
      title={label}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: open ? "10px 12px" : "10px 0", justifyContent: open ? "flex-start" : "center", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "var(--font-zh)", fontSize: 14, fontWeight: 600, background: active ? "var(--brand-soft)" : "transparent", color: active ? "var(--brand-deep)" : "var(--ink-2)", transition: "background .15s" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ flexShrink: 0, width: 20, height: 20, display: "grid", placeItems: "center", color: accent && !active ? "var(--brand-deep)" : "inherit" }}><Icon name={icon} size={18} /></span>
      {open && <span style={{ whiteSpace: "nowrap", lineHeight: 1 }}>{label}</span>}
    </button>
  );

  const asideStyle = mobile
    ? { position: "fixed", top: 0, left: 0, bottom: 0, width: "min(300px, 84vw)", zIndex: 81, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", transform: mobileOpen ? "translateX(0)" : "translateX(-102%)", transition: "transform .3s cubic-bezier(.32,.72,0,1)", boxShadow: mobileOpen ? "0 20px 60px -20px rgba(0,0,0,.5)" : "none" }
    : { width: open ? 252 : 72, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", transition: "width .2s" };

  return (
    <React.Fragment>
    {mobile && (
      <div onClick={onCloseMobile} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,16,10,.42)", backdropFilter: "blur(2px)", opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none", transition: "opacity .26s ease" }} />
    )}
    <aside style={asideStyle}>
      {/* brand + collapse */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: open ? "15px 14px 12px" : "15px 0 12px", justifyContent: "center" }}>
        {open ? (
          <React.Fragment>
            <BotAvatar size={40} glow />
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 15.5, color: "var(--ink)" }}>AI 小博士</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginTop: 1 }}>你的备课教学助手</div>
            </div>
            <button onClick={() => (mobile ? onCloseMobile() : setOpen(false))} title={mobile ? "关闭菜单" : "收起侧栏"} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
              <Icon name={mobile ? "close" : "sidebar"} size={15} sw={mobile ? 2.4 : 1.8} />
            </button>
          </React.Fragment>
        ) : (
          <button
            onClick={() => setOpen(true)}
            title="展开侧栏"
            className="rail-brand-toggle"
            style={{ position: "relative", width: 44, height: 44, borderRadius: 12, border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "grid", placeItems: "center" }}
          >
            <span className="rbt-avatar"><BotAvatar size={40} glow /></span>
            <span className="rbt-icon" style={{ position: "absolute", inset: 0, borderRadius: 12, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", display: "grid", placeItems: "center" }}>
              <Icon name="sidebar" size={19} />
            </span>
          </button>
        )}
      </div>

      {/* new chat */}
      <div style={{ padding: open ? "0 12px 8px" : "0 12px 8px" }}>
        <button
          onClick={onNewChat}
          title="新对话"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: open ? "11px 14px" : "11px 0", borderRadius: 12, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", boxShadow: "0 4px 14px -6px var(--brand-glow)" }}
        >
          <Icon name="plus" size={17} sw={2.4} /> {open && "新对话"}
        </button>
      </div>

      {/* nav */}
      <div style={{ padding: open ? "8px 12px" : "8px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
        <NavItem icon="spark" label="我的记忆" accent active={page === "memory"} onClick={() => go("memory")} />
        <NavItem icon="grid" label="我的内容" active={page === "works"} onClick={() => go("works")} />
        {!open && (
          <NavItem icon="chat" label="历史对话" active={page === "history"} onClick={() => (loggedIn ? onNavigate("history") : onRequireLogin())} />
        )}
      </div>

      {/* conversation history (expanded only) */}
      {open && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", paddingTop: 6 }}>
          <div style={{ padding: "4px 18px 8px", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="chat" size={13} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>历史对话</span>
            <div style={{ flex: 1 }} />
            {loggedIn && (
              <button
                onClick={() => onNavigate("history")}
                style={{ border: "none", background: "transparent", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", padding: "2px 4px", borderRadius: 6 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                全部
              </button>
            )}
          </div>
          {loggedIn ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
              {M.conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onResume && onResume({ ...c, isConversation: true })}
                  title={c.title}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ flexShrink: 0, color: "var(--ink-3)", display: "grid", placeItems: "center", width: 18 }}><Icon name={c.icon} size={17} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.when} · {c.last}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <button onClick={onRequireLogin} style={{ margin: "4px 12px", padding: "16px 14px", width: "calc(100% - 24px)", borderRadius: 12, border: "1px dashed var(--line)", background: "var(--surface-2)", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "center" }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600, lineHeight: 1.6 }}>登录后查看历史对话<br /><span style={{ color: "var(--ink-3)", fontWeight: 500 }}>你的每一次创作都会自动保存</span></div>
              </button>
            </div>
          )}
        </div>
      )}
      {!open && <div style={{ flex: 1 }} />}

      {/* account (bottom) */}
      <div style={{ borderTop: "1px solid var(--line)", padding: open ? "10px 12px" : "10px 8px", position: "relative" }}>
        {loggedIn ? (
          <React.Fragment>
            <button
              onClick={() => setAcctMenu((m) => !m)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: open ? "7px 8px" : "7px 0", justifyContent: open ? "flex-start" : "center", borderRadius: 11, border: "none", background: acctMenu ? "var(--surface-2)" : "transparent", cursor: "pointer", fontFamily: "var(--font-zh)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => { if (!acctMenu) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>李</span>
              {open && (
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>李老师</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>初中数学</div>
                </div>
              )}
              {open && <Icon name="filter" size={14} />}
            </button>
            {acctMenu && (
              <React.Fragment>
                <div onClick={() => setAcctMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                <div className="enter-pop" style={{ position: "absolute", left: open ? 12 : 8, right: open ? 12 : "auto", bottom: "calc(100% - 2px)", minWidth: 180, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 13, boxShadow: "0 18px 44px -22px rgba(0,0,0,.4)", padding: 7, zIndex: 31 }}>
                  <MenuRow icon="spark" label="我的记忆" onClick={() => { setAcctMenu(false); onNavigate("memory"); }} />
                  <MenuRow icon="grid" label="我的内容" onClick={() => { setAcctMenu(false); onNavigate("works"); }} />
                  <MenuRow icon="chat" label="历史对话" onClick={() => { setAcctMenu(false); onNavigate("history"); }} />
                  <div style={{ height: 1, background: "var(--line)", margin: "5px 4px" }} />
                  <MenuRow icon="back" label="退出登录" onClick={() => { setAcctMenu(false); onLogout && onLogout(); }} />
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          <button
            onClick={onRequireLogin}
            title="登录 / 注册"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: open ? "10px 14px" : "10px 0", borderRadius: 11, border: "1px solid var(--brand)", background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", whiteSpace: "nowrap" }}
          >
            <Icon name="arrow" size={16} /> {open && "登录 / 注册"}
          </button>
        )}
      </div>
    </aside>
    </React.Fragment>
  );
}

Object.assign(window, { Homepage });

// ---------- 记忆管理 (memory management page) ----------
function MemSwitch({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", padding: 2, background: on ? "var(--brand)" : "var(--line)", transition: "background .2s", flexShrink: 0, display: "flex", justifyContent: on ? "flex-end" : "flex-start" }}
    >
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: "all .2s" }} />
    </button>
  );
}

function MemoryPage({ onResume }) {
  const M = window.AIDATA.USER_MEMORY;
  const mobile = useIsMobile();
  const [tags, setTags] = useState(M.tags);
  const [entries, setEntries] = useState(M.entries.map((e) => ({ ...e })));
  const [cleared, setCleared] = useState(false);

  const removeTag = (i) => setTags((t) => t.filter((_, j) => j !== i));
  const toggleEntry = (id) => setEntries((es) => es.map((e) => (e.id === id ? { ...e, on: !e.on } : e)));
  const removeEntry = (id) => setEntries((es) => es.filter((e) => e.id !== id));
  const clearAll = () => { setTags([]); setEntries([]); setCleared(true); };

  const activeCount = entries.filter((e) => e.on).length;

  const Section = ({ icon, title, hint, action, children }) => (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <span style={{ color: "var(--ink-3)" }}><Icon name={icon} size={16} /></span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{title}</span>
        {hint && <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 4, whiteSpace: "nowrap" }}>{hint}</span>}
        <div style={{ flex: 1 }} />
        {action}
      </div>
      {children}
    </div>
  );

  return (
    <div className="home-fade" style={{ flex: 1, overflowY: "auto", padding: mobile ? "8px 16px 48px" : "10px 24px 60px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* page heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0 22px" }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
            <Icon name="spark" size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: "var(--ink)", margin: 0 }}>我的记忆</h1>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>小博士从你的使用中学到的内容 · 你可以随时编辑或删除</div>
          </div>
          {!cleared && (
            <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: "1px solid oklch(0.85 0.07 25)", background: "oklch(0.97 0.02 25)", color: "oklch(0.5 0.16 25)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", flexShrink: 0 }}>
              清空全部
            </button>
          )}
        </div>

        {cleared ? (
          <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--ink-3)" }}>
            <div style={{ display: "inline-flex", marginBottom: 12, color: "var(--line)" }}><Icon name="spark" size={48} sw={1.3} /></div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>记忆已清空</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>小博士会在你继续使用的过程中，重新学习你的偏好。</div>
          </div>
        ) : (
          <React.Fragment>
            <Section icon="quote" title="小博士对你的总结">
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 18px" }}>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: "var(--ink-2)" }}>{M.summary}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 13, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>记忆更新于 {M.updated}</span>
                  <div style={{ flex: 1 }} />
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
                    <Icon name="refresh" size={13} /> 重新总结
                  </button>
                </div>
              </div>
            </Section>

            <Section icon="filter" title="教学画像" hint="自动推断 · 点 × 移除">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tags.length === 0 && <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>暂无画像标签</span>}
                {tags.map((t, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 10px 7px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 13 }}>
                    <span style={{ color: "var(--ink-3)", fontSize: 11.5 }}>{t.k}</span>
                    <span style={{ color: "var(--brand-deep)", fontWeight: 700 }}>{t.v}</span>
                    <span onClick={() => removeTag(i)} style={{ display: "inline-flex", cursor: "pointer", color: "var(--ink-3)", marginLeft: 1 }}><Icon name="close" size={13} sw={2.6} /></span>
                  </span>
                ))}
              </div>
            </Section>

            <Section icon="layers" title="记忆条目" hint={`${activeCount} 条生效 / 共 ${entries.length} 条`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {entries.length === 0 && <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>暂无记忆条目</span>}
                {entries.map((e) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", opacity: e.on ? 1 : 0.55, transition: "opacity .2s" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0, marginTop: 1 }}>
                      <Icon name={e.icon} size={16} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{e.text}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon name="spark" size={12} /> {e.basis}
                      </div>
                    </div>
                    <MemSwitch on={e.on} onClick={() => toggleEntry(e.id)} />
                    <button onClick={() => removeEntry(e.id)} title="删除这条记忆" style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                      <Icon name="close" size={14} sw={2.4} />
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon="history" title="记忆来源" hint="基于你的真实使用">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                {M.stats.map((s, i) => (
                  <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ color: "var(--ink-3)" }}><Icon name={s.icon} size={16} /></span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-num)" }}>{s.n}</span>
                    <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, padding: "4px 2px" }}>
              <Icon name="shield" size={14} /> 记忆仅用于改善你的创作体验，可随时关闭或清空。
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ---------- 我的作品 (finished deliverables library) ----------
// ---------- 我的内容 (all content: generated, downloaded, 备课 products…) ----------
function WorksPage({ onResume, onNewChat }) {
  const M = window.AIDATA.USER_MEMORY;
  const mobile = useIsMobile();
  const SOURCES = ["全部", "AI 生成", "学科网下载", "备课产品"];
  const [filter, setFilter] = useState("全部");
  const items = M.works.filter((w) => filter === "全部" || w.source === filter);
  const srcStyle = (src) => {
    if (src === "AI 生成") return { c: "var(--brand-deep)", bg: "var(--brand-soft)", bd: "var(--brand-soft-border)", icon: "spark" };
    if (src === "学科网下载") return { c: "var(--auth-ink)", bg: "var(--auth-bg)", bd: "var(--auth-border)", icon: "download" };
    return { c: "oklch(0.5 0.13 45)", bg: "oklch(0.96 0.04 45)", bd: "oklch(0.88 0.06 45)", icon: "layers" };
  };

  return (
    <div className="home-fade" style={{ flex: 1, overflowY: "auto", padding: mobile ? "8px 16px 48px" : "10px 24px 60px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0 16px" }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
            <Icon name="grid" size={21} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: "var(--ink)", margin: 0 }}>我的内容</h1>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>你的全部教学资料 · AI 生成、学科网下载与备课产品，共 {M.works.length} 份</div>
          </div>
          <button onClick={onNewChat} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 11, border: "none", background: "var(--brand)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", flexShrink: 0, boxShadow: "0 4px 14px -6px var(--brand-glow)" }}>
            <Icon name="plus" size={16} sw={2.4} /> 新建
          </button>
        </div>

        {/* filter by source */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {SOURCES.map((k) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: "7px 15px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", border: filter === k ? "1px solid var(--brand)" : "1px solid var(--line)", background: filter === k ? "var(--brand-soft)" : "var(--surface)", color: filter === k ? "var(--brand-deep)" : "var(--ink-2)", transition: "all .15s" }}>{k}</button>
          ))}
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {items.map((w) => {
            const ss = srcStyle(w.source);
            return (
            <div key={w.id} className="work-card" style={{ display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", transition: "transform .18s, box-shadow .25s, border-color .2s" }}>
              {/* preview strip */}
              <div className="ph-stripe" style={{ height: 116, position: "relative", display: "grid", placeItems: "center" }}>
                <ScenarioGlyph icon={w.icon} hue={w.hue} size={46} active />
                <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10.5, fontWeight: 700, color: `oklch(0.42 0.13 ${w.hue})`, background: `oklch(0.95 0.04 ${w.hue})`, border: `1px solid oklch(0.86 0.06 ${w.hue})`, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{w.kind}</span>
                <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: ss.c, background: ss.bg, border: `1px solid ${ss.bd}`, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" }}><Icon name={ss.icon} size={10} /> {w.source}</span>
              </div>
              {/* body */}
              <div style={{ padding: "13px 15px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4 }}>{w.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>{w.meta}</div>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 13 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", flex: 1 }}>{w.status === "draft" ? "草稿 · " : ""}{w.when}</span>
                  <button title="预览" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="eye" size={15} /></button>
                  <button title="下载" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="download" size={15} /></button>
                  <button onClick={() => onResume && onResume(w)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "none", background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>{w.source === "AI 生成" ? "继续" : "打开"} <Icon name="arrow" size={14} /></button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- 历史对话 (all chat sessions) ----------
function HistoryPage({ onResume, onNewChat }) {
  const M = window.AIDATA.USER_MEMORY;
  const mobile = useIsMobile();
  return (
    <div className="home-fade" style={{ flex: 1, overflowY: "auto", padding: mobile ? "8px 16px 48px" : "10px 24px 60px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0 18px" }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}>
            <Icon name="chat" size={21} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: "var(--ink)", margin: 0 }}>历史对话</h1>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>你与小博士的每一次对话都已保存 · 点击任意一条继续</div>
          </div>
          <button onClick={onNewChat} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 11, border: "none", background: "var(--brand)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", flexShrink: 0, boxShadow: "0 4px 14px -6px var(--brand-glow)" }}>
            <Icon name="plus" size={16} sw={2.4} /> 新对话
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {M.conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onResume && onResume({ ...c, isConversation: true })}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "transform .15s, border-color .2s, box-shadow .2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.borderColor = `oklch(0.8 0.08 ${c.hue})`; e.currentTarget.style.boxShadow = `0 10px 22px -14px oklch(0.6 0.14 ${c.hue} / .5)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <ScenarioGlyph icon={c.icon} hue={c.hue} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>最近：{c.last}</div>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)", flexShrink: 0 }}>{c.when}</span>
              <span style={{ color: "var(--ink-3)", flexShrink: 0 }}><Icon name="arrow" size={16} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MemoryPage, WorksPage, HistoryPage });

// ---------- Login modal (triggered by gated actions) ----------
function LoginModal({ onClose, onLogin }) {
  const [phone, setPhone] = useState("");
  const benefits = [
    { icon: "spark", t: "小博士记住你的学科、版本与偏好" },
    { icon: "history", t: "历史对话与作品云端同步" },
    { icon: "shield", t: "创作有据可依，安全可信" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,16,10,.5)", backdropFilter: "blur(3px)" }} />
      <div className="intent-card" style={{ position: "relative", width: "min(420px, 100%)", background: "var(--canvas)", borderRadius: 22, border: "1px solid var(--line)", boxShadow: "0 40px 90px -40px rgba(0,0,0,.55)", overflow: "hidden" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2 }}>
          <Icon name="close" size={15} sw={2.4} />
        </button>
        <div style={{ padding: "30px 30px 26px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><BotAvatar size={52} glow /></div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", textAlign: "center", margin: "0 0 6px" }}>登录 AI 小博士</h2>
          <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", margin: "0 0 20px", lineHeight: 1.6 }}>登录后即可使用记忆、历史对话与作品管理</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              inputMode="numeric"
              style={{ width: "100%", padding: "13px 15px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 14.5, fontFamily: "var(--font-zh)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 9 }}>
              <input placeholder="验证码" style={{ flex: 1, minWidth: 0, padding: "13px 15px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 14.5, fontFamily: "var(--font-zh)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }} />
              <button style={{ flexShrink: 0, padding: "0 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", whiteSpace: "nowrap" }}>获取验证码</button>
            </div>
          </div>

          <button
            onClick={onLogin}
            style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "var(--brand)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-zh)", boxShadow: "0 6px 18px -6px var(--brand-glow)" }}
          >
            登录 / 注册
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 20, paddingTop: 18, borderTop: "1px dashed var(--line)" }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--ink-2)" }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}><Icon name={b.icon} size={12} /></span>
                {b.t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            登录即代表同意《用户协议》与《隐私政策》<br />演示环境，点击「登录」即可直接进入
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginModal });

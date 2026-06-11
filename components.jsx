// components.jsx — shared UI atoms

// AI 小博士 avatar — friendly, built from simple shapes (graduation circle + "博")
function BotAvatar({ size = 40, glow = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "30% 30% 38% 38%",
        background: "linear-gradient(160deg, var(--brand), var(--brand-deep))",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.42,
        fontFamily: "var(--font-zh)",
        boxShadow: glow
          ? "0 10px 26px -8px var(--brand-glow), 0 0 0 5px color-mix(in oklab, var(--brand), transparent 92%), inset 0 1px 0 rgba(255,255,255,.38)"
          : "inset 0 1px 0 rgba(255,255,255,.38)",
        position: "relative",
        flexShrink: 0,
        letterSpacing: "-1px",
      }}
    >
      <span style={{ marginTop: size * 0.02 }}>博</span>
    </div>
  );
}

// Authority badge — the core differentiator chip
function AuthorityBadge({ compact = false, label = "三审三校 · 权威认证" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: compact ? "2px 8px" : "4px 11px",
        borderRadius: 999,
        background: "var(--auth-bg)",
        color: "var(--auth-ink)",
        fontSize: compact ? 11.5 : 12.5,
        fontWeight: 700,
        border: "1px solid var(--auth-border)",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-zh)",
      }}
    >
      <Icon name="shield" size={compact ? 12 : 14} sw={2} />
      {label}
    </span>
  );
}

function Btn({ children, kind = "primary", size = "md", icon, iconRight, onClick, style, disabled }) {
  const sizes = {
    sm: { p: "7px 13px", f: 13, g: 6 },
    md: { p: "10px 18px", f: 14.5, g: 7 },
    lg: { p: "14px 24px", f: 16, g: 8 },
  }[size];
  const kinds = {
    primary: {
      background: "var(--brand-grad)",
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.22), 0 4px 14px -5px var(--brand-glow)",
    },
    soft: {
      background: "var(--brand-soft)",
      color: "var(--brand-deep)",
      border: "1px solid var(--brand-soft-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink-2)",
      border: "1px solid var(--line)",
    },
    plain: {
      background: "transparent",
      color: "var(--ink-2)",
      border: "1px solid transparent",
    },
  }[kind];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.g,
        padding: sizes.p,
        fontSize: sizes.f,
        fontWeight: 600,
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "var(--font-zh)",
        transition: "transform .12s ease, box-shadow .2s ease, background .2s ease",
        ...kinds,
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {icon && <Icon name={icon} size={sizes.f + 2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.f + 2} />}
    </button>
  );
}

// Scenario glyph tile (colored, uses scenario hue)
function ScenarioGlyph({ icon, hue, size = 46, active }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        display: "grid",
        placeItems: "center",
        background: `linear-gradient(160deg, oklch(0.96 0.032 ${hue}), oklch(0.915 0.058 ${hue}))`,
        color: `oklch(0.48 0.135 ${hue})`,
        flexShrink: 0,
        transition: "transform .2s ease, box-shadow .2s ease",
        boxShadow: active
          ? `inset 0 0 0 1px oklch(0.87 0.06 ${hue} / .7), 0 8px 20px -8px oklch(0.6 0.15 ${hue} / .6)`
          : `inset 0 0 0 1px oklch(0.87 0.06 ${hue} / .55), inset 0 1px 0 rgba(255,255,255,.55)`,
        transform: active ? "translateY(-2px)" : "none",
      }}
    >
      <Icon name={icon} size={size * 0.5} sw={2} />
    </div>
  );
}

// thinking dots
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--brand)",
            animation: `bobDot 1s ${i * 0.16}s infinite ease-in-out`,
          }}
        />
      ))}
    </span>
  );
}

// pill chip (filter / suggestion)
function Chip({ children, active, onClick, icon, removable, onRemove }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 13px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-zh)",
        border: active ? "1px solid var(--brand)" : "1px solid var(--line)",
        background: active ? "var(--brand-soft)" : "var(--surface)",
        color: active ? "var(--brand-deep)" : "var(--ink-2)",
        transition: "all .15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
      {removable && (
        <span onClick={onRemove} style={{ display: "inline-flex", marginLeft: 1, opacity: 0.6 }}>
          <Icon name="close" size={12} sw={2.4} />
        </span>
      )}
    </button>
  );
}

Object.assign(window, { BotAvatar, AuthorityBadge, Btn, ScenarioGlyph, Dots, Chip });

// ---- Attachment / reference-material atoms ----
function ClipButton({ onFiles, label = "参考资料", compact = false }) {
  const ref = React.useRef(null);
  return (
    <React.Fragment>
      <input
        ref={ref}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const names = [...e.target.files].map((f) => f.name);
          if (names.length) onFiles(names);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => ref.current && ref.current.click()}
        title="上传你手头的素材 / 教案，让小博士基于它创作"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: compact ? "6px 8px" : "7px 12px",
          borderRadius: 10,
          border: "1px dashed var(--input-border)",
          background: "transparent",
          color: "var(--ink-3)",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-zh)",
          transition: "color .15s, border-color .15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--brand-deep)";
          e.currentTarget.style.borderColor = "var(--brand-soft-border)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--ink-3)";
          e.currentTarget.style.borderColor = "var(--input-border)";
        }}
      >
        <Icon name="clip" size={15} />
        {!compact && label}
      </button>
    </React.Fragment>
  );
}

function FileChips({ files, onRemove, style }) {
  if (!files || files.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, ...style }}>
      {files.map((name, i) => (
        <span
          key={i}
          className="ent-pop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 8px 5px 9px",
            borderRadius: 9,
            background: "var(--brand-soft)",
            border: "1px solid var(--brand-soft-border)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--brand-deep)",
            maxWidth: 220,
          }}
        >
          <Icon name="file" size={13} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          {onRemove && (
            <span onClick={() => onRemove(i)} style={{ display: "inline-flex", cursor: "pointer", opacity: 0.6 }}>
              <Icon name="close" size={12} sw={2.4} />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

Object.assign(window, { ClipButton, FileChips });

// ── Shared: smart send with re-routing + a brief "recognizing" header flash ──
// Every workspace routes its chat input through this. On each send we run a
// quick intent check; if the text clearly belongs to a DIFFERENT scenario we
// switch there, otherwise we briefly show the "recognizing" header then hand
// off to the workspace's own local handler.
function useSmartSend({ scenarioId, onSwitch, setMessages, localSend }) {
  const [headerRecognizing, setHeaderRecognizing] = React.useState(false);
  const timer = React.useRef(null);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const send = React.useCallback((text, files) => {
    const target = (typeof window.detectSwitchTarget === "function") ? window.detectSwitchTarget(text || "") : null;
    const willSwitch = !!(text && text.trim()) && target && target !== scenarioId && typeof onSwitch === "function";
    clearTimeout(timer.current);
    if (willSwitch) {
      // echo the user's message, flash recognizing, then route to the new tool
      setMessages && setMessages((m) => [...m, { role: "user", text, files }]);
      setHeaderRecognizing(true);
      timer.current = setTimeout(() => { setHeaderRecognizing(false); onSwitch(target, text); }, 950);
      return;
    }
    // same scenario → brief header flash, run local handler immediately
    setHeaderRecognizing(true);
    timer.current = setTimeout(() => setHeaderRecognizing(false), 720);
    localSend && localSend(text, files);
  }, [scenarioId, onSwitch, setMessages, localSend]);
  return { headerRecognizing, send };
}

// ── Shared: a small "memory in effect" note for workspaces ──
// Mirrors the 问教材 line — surfaces that the assistant has applied what it
// remembers about the teacher, with an affordance to adjust.
function MemoryNote({ text, actionLabel = "调整", onAction, style }) {
  return (
    <div
      className="trace-pop"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 12px",
        borderRadius: 11,
        background: "var(--brand-soft)",
        border: "1px solid var(--brand-soft-border)",
        fontSize: 12.5,
        color: "var(--ink-2)",
        lineHeight: 1.55,
        ...style,
      }}
    >
      <span style={{ color: "var(--brand-deep)", flexShrink: 0, display: "grid", placeItems: "center" }}><Icon name="spark" size={14} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>{text}</span>
      {onAction && (
        <button
          onClick={onAction}
          style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 8, border: "1px solid var(--brand-soft-border)", background: "var(--surface)", color: "var(--brand-deep)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { useSmartSend, MemoryNote });

// ── Chat session: ONE assistant conversation that survives scenario switches ──
// The assistant never "changes sides": when the teacher moves between scenarios
// (找资源 → 出卷子 → …) the left chat keeps the whole thread. Only 新对话 /
// returning home starts a fresh session (cleared by app.jsx).
const ChatSession = {
  log: [],
  scratch: {},           // per-scenario live state (rounds, configs…) that survives switches
  pendingArtifact: null, // set when the teacher clicks an artifact chip from another scenario
  take() { return this.log.slice(); },
  save(msgs) { this.log = msgs || []; },
  clear() { this.log = []; this.scratch = {}; this.pendingArtifact = null; },
  echoed(q) {
    const v = (q || "").trim();
    return !!v && this.log.some((m) => m.role === "user" && (m.text || "").trim() === v);
  },
};

// Convert live workspace messages into a frozen, carry-anywhere form:
// drop typing indicators, replace live widgets (intent animation, setup cards)
// with static recaps, and strip per-workspace handles like roundId.
function freezeChat(msgs) {
  return (msgs || [])
    .filter((m) => m && !m.typing)
    .map((m) => {
      if (m.render) {
        if (m.intent) return { role: "ai", wide: true, node: <InlineIntent query={m.intent} instant /> };
        return null; // live setup widgets don't carry across scenarios
      }
      if (m.answer || m.compare) {
        return { role: "ai", artifact: m.artifact, node: <span>已依据教材原文作答（出处标注见「问教材」场景）。</span> };
      }
      const { roundId, ...rest } = m;
      return rest;
    })
    .filter(Boolean);
}

Object.assign(window, { ChatSession, freezeChat });

// ── Entering a scenario mid-session: a slim divider, not another chat bubble ──
// First entry of a session keeps the assistant's greeting (it orients the user);
// after that, tab switches only leave a quiet "已切换" marker — and rapid tab
// hopping collapses to a single marker instead of stacking noise.
function enterThread(scenario, greet) {
  const log = ChatSession.take();
  // drop trailing markers (and nothing else) so A→B→C leaves one marker, not three
  while (log.length && log[log.length - 1].role === "sys") log.pop();
  if (!log.length) return greet ? [{ role: "ai", node: greet }] : [];
  return [...log, { role: "sys", text: `已切换到「${scenario.name}」`, icon: scenario.icon }];
}
Object.assign(window, { enterThread });

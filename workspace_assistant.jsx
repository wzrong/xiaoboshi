// workspace_assistant.jsx — 通用助手 (general assistant)
// Intent recognition happens HERE first; if a specific scenario is matched,
// we hand off to that workspace. Otherwise the assistant answers directly.
const { useState: gaS, useEffect: gaE, useRef: gaR } = React;

// mock general answer (no specific tool matched)
function GeneralAnswer({ query }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.75 }}>
        关于「{(query || "").replace(/[《》"]/g, "")}」，我的建议是：先抓住核心概念，再用一个贴近学生生活的情境切入，最后用 2–3 个由浅入深的小问题检验理解。需要我把它做成<b style={{ color: "var(--brand-deep)" }}>课件、教案或练习</b>，随时说一声，我就带你进对应的工作台。
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--auth-ink)", background: "var(--auth-bg)", border: "1px solid var(--auth-border)", borderRadius: 10, padding: "8px 11px" }}>
        <Icon name="shield" size={13} /> 回答参考学科网权威教研资源，具体成稿可一键溯源教材原文
      </div>
    </div>
  );
}

// centered single-column chat (assistant feel, not the split workspace)
function CenteredChat({ messages, onSend, suggestions, placeholder, recognizing }) {
  const [draft, setDraft] = gaS("");
  const [att, setAtt] = gaS([]);
  const scrollRef = gaR(null);
  gaE(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  const send = (txt) => {
    const v = (txt ?? draft).trim();
    if (!v && att.length === 0) return;
    onSend(v, att);
    setDraft("");
    setAtt([]);
  };
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "26px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((m, i) => (
            <Bubble key={i} m={m} />
          ))}
        </div>
      </div>
      {!recognizing && (
        <div style={{ padding: "0 24px 18px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {suggestions && suggestions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="sug-pop"
                    style={{ animationDelay: `${i * 0.05}s`, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "1px dashed var(--brand-soft-border)", background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}
                  >
                    <Icon name="spark" size={12} /> {s}
                  </button>
                ))}
              </div>
            )}
            <FileChips files={att} onRemove={(i) => setAtt((f) => f.filter((_, j) => j !== i))} style={{ marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 10, boxShadow: "0 6px 20px -16px rgba(0,0,0,.3)" }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder={placeholder || "问我任何教学问题…"}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontSize: 14, fontFamily: "var(--font-zh)", color: "var(--ink)", lineHeight: 1.5, padding: "5px 4px" }}
              />
              <ClipButton onFiles={(names) => setAtt((f) => [...f, ...names].slice(0, 6))} compact />
              <button onClick={() => send()} style={{ width: 36, height: 36, borderRadius: 11, border: "none", background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                <Icon name="send" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneralWorkspace({ query, fromIntent, onHome, onSwitch }) {
  const GEN = window.AIDATA.GENERAL;
  const willRecognize = fromIntent && !!query;
  const [recognizing, setRecognizing] = gaS(willRecognize);

  const recapRef = gaR(null);
  const handleRecognized = (target) => {
    if (target && target !== "general") {
      onSwitch(target, query);
      return;
    }
    setRecognizing(false);
    setMessages((m) => [...m, { role: "ai", node: <GeneralAnswer query={query} /> }]);
    setSugs(["展开讲讲", "给我一个课堂导入", "帮我整理成要点"]);
  };

  const [messages, setMessages] = gaS(() => {
    if (willRecognize) {
      return [
        { role: "user", text: query },
        { role: "ai", wide: true, render: () => <InlineIntent query={query} onDone={(t) => recapRef.current(t)} /> },
      ];
    }
    return [
      { role: "ai", node: (
        <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.75 }}>
          你好，我是 <b style={{ color: "var(--brand-deep)" }}>AI 小博士</b>。教学上的问题都可以问我；当你需要出卷子、做课件、写教案时，我会自动带你进入对应的工作台。
        </div>
      ) },
    ];
  });
  const [sugs, setSugs] = gaS(willRecognize ? [] : ["初中数学常见易错点有哪些", "帮我想几个《有理数》课堂导入", "帮我出一份七年级数学卷子"]);
  recapRef.current = handleRecognized;

  const handleSend = (text) => {
    // a follow-up might itself be a specific request → re-route
    const t = window.detectSwitchTarget ? window.detectSwitchTarget(text) : null;
    if (t && t !== "general") {
      setMessages((m) => [...m, { role: "user", text }]);
      setTimeout(() => onSwitch(t, text), 300);
      return;
    }
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", node: <GeneralAnswer query={text} /> }]);
    setSugs([]);
  };

  return (
    <WorkspaceShell scenario={GEN} onHome={onHome} onSwitch={onSwitch} recognizing={recognizing}>
      <CenteredChat
        messages={messages}
        onSend={handleSend}
        suggestions={sugs}
        recognizing={recognizing}
        placeholder="问我任何教学问题，或描述你想创作的内容…"
      />
    </WorkspaceShell>
  );
}

Object.assign(window, { GeneralWorkspace });

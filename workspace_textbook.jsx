// workspace_textbook.jsx — 问教材 workspace (grounded answers w/ citations)
const { useState: tS, useEffect: tE, useRef: tR } = React;

const TB_STAGES = ["小学", "初中", "高中"];
const TB_SUBJECTS = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "道德与法治", "科学"];
const TB_EDITIONS = ["人教版", "统编版", "北师大版", "苏教版", "外研版", "沪教版"];
const TB_BOOKS = ["必修1", "必修2", "上册", "下册", "选择性必修1"];
const MIN_CITE_W = 268;
const MIN_CENTER_W = 380;

function TextbookWorkspace({ scenario, query, onHome, onSwitch, fromIntent, loggedIn }) {
  const TREE = window.AIDATA.TEXTBOOK_TREE;
  const A = window.AIDATA.TEXTBOOK_ANSWER;
  const CMP = window.AIDATA.TEXTBOOK_COMPARE;
  const M = window.AIDATA.USER_MEMORY;
  const isCompareQ = (q) => /哪些教材|哪些版本|各版本|各个版本|不同版本|不同教材|跨教材|对比.*教材|教材.*对比|几个版本|都出现|哪几本/.test(q || "");
  const startAnswered = !fromIntent && !!(query && /[?？]|区别|为什么|什么|怎么|原理|讲|解释/.test(query));
  const [activeCite, setActiveCite] = tS(null);
  const [answered, setAnswered] = tS(startAnswered);
  const [thinking, setThinking] = tS(false);

  // ---- which textbook is open (cold-start) ----
  const demoBook = { edition: TREE.edition, subject: TREE.subject, name: "必修1", stage: "高中", section: "第5章 第4节 · 能量之源——光合作用" };
  const memBook = loggedIn && M.textbook ? { edition: M.textbook.edition, subject: M.textbook.subject || "生物", name: (M.textbook.book || "必修1").replace(/^.*·\s*/, ""), stage: M.textbook.stage, section: M.textbook.section, when: M.textbook.when } : null;
  const [book, setBook] = tS(() => (query ? demoBook : memBook)); // null → show picker
  const viaMemory = !query && !!memBook;

  // ---- layout: collapsible catalog + resizable citation pane ----
  const [navOpen, setNavOpen] = tS(true);
  const [citeW, setCiteW] = tS(() => { const s = parseInt(localStorage.getItem("aida_cite_w") || "", 10); return Number.isFinite(s) && s >= MIN_CITE_W ? s : 332; });
  const [citeDragging, setCiteDragging] = tS(false);
  const citeRef = tR(null);
  const cdrag = tR(false);
  tE(() => { try { localStorage.setItem("aida_cite_w", String(Math.round(citeW))); } catch (e) {} }, [citeW]);
  tE(() => {
    const clampC = (val) => {
      const rightEdge = citeRef.current ? citeRef.current.getBoundingClientRect().right : window.innerWidth;
      const navW = navOpen ? 252 : 50;
      const maxC = Math.max(MIN_CITE_W, rightEdge - navW - MIN_CENTER_W);
      return Math.min(Math.max(val, MIN_CITE_W), maxC);
    };
    const move = (e) => { if (!cdrag.current || !citeRef.current) return; const rightEdge = citeRef.current.getBoundingClientRect().right; setCiteW(clampC(rightEdge - e.clientX)); };
    const up = () => { if (!cdrag.current) return; cdrag.current = false; setCiteDragging(false); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [navOpen]);
  const startCiteDrag = (e) => { cdrag.current = true; setCiteDragging(true); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; e.preventDefault(); };

  const greetFor = (bk, kind) => ({
    role: "ai",
    node:
      kind === "memory" ? (
        <div>欢迎回来！已按你常看的 <b style={{ color: "var(--brand-deep)" }}>{bk.edition} {bk.subject} · {bk.name}</b> 打开{bk.section ? <span>（上次看到 <b>{bk.section}</b>）</span> : null}。问我本教材的任何问题，回答都会<b style={{ color: "var(--auth-ink)" }}>逐条标注原文出处</b>。也可在左上角<b>切换教材</b>。</div>
      ) : kind === "picked" ? (
        <div>已为你打开 <b style={{ color: "var(--brand-deep)" }}>{bk.edition} {bk.subject} · {bk.name}</b>。问我本教材的任何问题，我的回答会<b style={{ color: "var(--auth-ink)" }}>逐条标注教材原文出处</b>，绝不凭空作答。</div>
      ) : (
        <div>这是<b style={{ color: "var(--brand-deep)" }}>{bk.edition} {bk.subject} {bk.name} · 第5章第4节</b>。问我关于本节教材的任何问题，我的回答会<b style={{ color: "var(--auth-ink)" }}>逐条标注教材原文出处</b>，绝不凭空作答。</div>
      ),
  });

  const [thread, setThread] = tS(() => {
    if (!book) return [];
    const greet = greetFor(book, viaMemory ? "memory" : "plain");
    if (fromIntent && query) {
      return [
        { role: "user", text: query },
        { role: "ai", wide: true, render: () => <InlineIntent query={query} onDone={() => { setThread((t) => [...t, greet]); setThinking(true); setTimeout(() => { setThinking(false); setThread((t) => [...t, { role: "ai", answer: true }]); setAnswered(true); }, 1100); }} /> },
      ];
    }
    if (query && /[?？]|区别|为什么|什么|怎么|原理|讲|解释/.test(query)) {
      return [greet, { role: "user", text: query }, { role: "ai", answer: true }];
    }
    return [greet];
  });

  // open a textbook chosen from the picker
  const openBook = (bk) => { setBook(bk); setThread([greetFor(bk, "picked")]); setAnswered(false); };
  const switchBook = () => { setBook(null); setThread([]); setAnswered(false); };

  const scrollRef = tR(null);
  tE(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, thinking]);

  const ask = (q) => {
    const compare = isCompareQ(q);
    setThread((t) => [...t, { role: "user", text: q }]);
    setThinking(true);
    setAnswered(false);
    setTimeout(() => {
      setThinking(false);
      setThread((t) => [...t, compare ? { role: "ai", compare: true } : { role: "ai", answer: true }]);
      setAnswered(compare ? "compare" : true);
    }, compare ? 1600 : 1400);
  };

  const sampleQs = ["光反应和暗反应有什么区别？", "「光合作用」在哪些教材里出现过？", "本节的重点概念有哪些？"];
  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages: setThread, localSend: ask });

  // ---- cold start: no textbook selected (logged out / no memory) → pick one first ----
  if (!book) {
    return (
      <WorkspaceShell scenario={scenario} onHome={onHome} onSwitch={onSwitch} headerRecognizing={headerRecognizing}>
        <TextbookPicker onOpen={openBook} demoBook={demoBook} />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell scenario={scenario} onHome={onHome} onSwitch={onSwitch} headerRecognizing={headerRecognizing}>
      {/* left: textbook navigator (collapsible) */}
      {navOpen ? (
      <div style={{ width: 252, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 11 }}>
            <div className="ph-stripe" style={{ width: 46, height: 62, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 9, fontWeight: 700, textAlign: "center" }}>
              教材<br />封面
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", lineHeight: 1.4 }}>{book.subject} {book.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{book.edition}</div>
              <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 6, background: "var(--auth-bg)", border: "1px solid var(--auth-border)", fontSize: 10.5, fontWeight: 700, color: "var(--auth-ink)" }}>
                  <Icon name="check" size={11} sw={2.6} /> 官方教材
                </span>
                <button onClick={switchBook} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
                  <Icon name="refresh" size={10} /> 切换
                </button>
              </div>
            </div>
            <button onClick={() => setNavOpen(false)} title="收起教材目录" style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <Icon name="back" size={14} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {TREE.chapters.map((ch, ci) => (
            <div key={ci} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", padding: "8px 10px" }}>{ch.name}</div>
              {ch.sections.map((sec, si) => (
                <div
                  key={si}
                  style={{
                    fontSize: 12.5,
                    padding: "8px 10px 8px 18px",
                    borderRadius: 9,
                    marginBottom: 2,
                    cursor: "pointer",
                    fontWeight: sec.active ? 700 : 500,
                    color: sec.active ? "var(--brand-deep)" : "var(--ink-3)",
                    background: sec.active ? "var(--brand-soft)" : "transparent",
                    borderLeft: sec.active ? "2px solid var(--brand)" : "2px solid transparent",
                  }}
                >
                  {sec.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      ) : (
        <div style={{ width: 50, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, gap: 12 }}>
          <button onClick={() => setNavOpen(true)} title="展开教材目录" style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Icon name="book" size={16} />
          </button>
          <div style={{ writingMode: "vertical-rl", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: 1 }}>教材目录</div>
        </div>
      )}

      {/* center: Q&A */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px clamp(20px, 5%, 60px)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
            {viaMemory && answered === false && thread.length <= 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)" }}>
                <Icon name="spark" size={15} />
                <span style={{ fontSize: 12.5, color: "var(--brand-deep)", fontWeight: 600, lineHeight: 1.5 }}>已根据「记忆」自动打开你常看的教材——若要换一本，点左上角「切换」即可。</span>
              </div>
            )}
            {thread.map((m, i) =>
              m.answer ? (
                <AnswerBlock key={i} A={A} activeCite={activeCite} setActiveCite={setActiveCite} />
              ) : m.compare ? (
                <CompareBlock key={i} CMP={CMP} activeCite={activeCite} setActiveCite={setActiveCite} onAsk={ask} />
              ) : (
                <Bubble key={i} m={m} />
              )
            )}
            {thinking && (
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <BotAvatar size={28} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5, background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 14px", borderRadius: 12 }}>
                  <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, display: "inline-flex", gap: 7, alignItems: "center" }}>
                    <Icon name="book" size={13} /> 正在比对教材原文 <Dots />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* sample questions + input */}
        <div style={{ padding: "0 clamp(20px, 5%, 60px)", borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "12px 0 14px" }}>
            {!answered && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {sampleQs.map((q, i) => (
                  <button key={i} onClick={() => ask(q)} className="sug-pop" style={{ animationDelay: `${i * 0.05}s`, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "1px dashed var(--brand-soft-border)", background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
                    <Icon name="chat" size={13} /> {q}
                  </button>
                ))}
              </div>
            )}
            <TextbookInput onAsk={send} />
          </div>
        </div>
      </div>

      {/* resizer: center ↔ citation panel */}
      <div
        className={"ws-resizer" + (citeDragging ? " dragging" : "")}
        onPointerDown={startCiteDrag}
        title="拖动调整教材依据宽度"
        style={{ width: 12, margin: "0 -6px", flexShrink: 0, cursor: "col-resize", position: "relative", zIndex: 6, touchAction: "none" }}
      >
        <span className="ws-resizer-grip" />
      </div>

      {/* right: citation / evidence panel */}
      <div ref={citeRef} style={{ width: citeW, flexShrink: 0, background: "var(--surface)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="shield" size={16} sw={2} />
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>教材依据</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>{answered === "compare" ? `${CMP.editions.length} 个版本` : answered ? `${A.citations.length} 处引用` : "等待提问"}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {!answered ? (
            <div style={{ textAlign: "center", padding: "50px 16px", color: "var(--ink-3)" }}>
              <div style={{ display: "inline-flex", marginBottom: 12, color: "var(--line)" }}>
                <Icon name="quote" size={42} sw={1.4} />
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                提问后，这里会显示答案<br />引用的<b style={{ color: "var(--ink-2)" }}>教材原文出处</b>
              </div>
            </div>
          ) : answered === "compare" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CMP.editions.map((e, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveCite("e" + i)}
                  onMouseLeave={() => setActiveCite(null)}
                  className="cite-pop"
                  style={{ animationDelay: `${i * 0.1}s`, border: activeCite === "e" + i ? "1px solid var(--brand)" : "1px solid var(--line)", background: activeCite === "e" + i ? "var(--brand-soft)" : "var(--surface-2)", borderRadius: 14, padding: 13, transition: "all .18s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: e.stage === "高中" ? "var(--brand)" : "oklch(0.55 0.13 175)", color: "#fff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>{e.stage[0]}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{e.edition}</span>
                    <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>{e.book}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--brand-deep)", fontWeight: 700, marginBottom: 7 }}>{e.loc}</div>
                  <div className="ph-stripe" style={{ borderRadius: 8, padding: "10px 12px", fontSize: 12, lineHeight: 1.7, color: "var(--ink-2)", borderLeft: "3px solid var(--brand)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ink-3)", fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>
                      <Icon name="quote" size={12} /> 教材原文
                    </span>
                    <div>{e.quote}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.6, padding: "4px 4px 0", textAlign: "center" }}>
                各版本原文均来自学科网教材库 · 可点开对照
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {A.citations.map((c, i) => (
                <div
                  key={c.id}
                  onMouseEnter={() => setActiveCite(c.id)}
                  onMouseLeave={() => setActiveCite(null)}
                  className="cite-pop"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    border: activeCite === c.id ? "1px solid var(--brand)" : "1px solid var(--line)",
                    background: activeCite === c.id ? "var(--brand-soft)" : "var(--surface-2)",
                    borderRadius: 14,
                    padding: 13,
                    transition: "all .18s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: "var(--brand)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)" }}>{i + 1}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{c.source}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--brand-deep)", fontWeight: 700, marginBottom: 7 }}>{c.loc}</div>
                  {/* page preview placeholder */}
                  <div className="ph-stripe" style={{ borderRadius: 8, padding: "10px 12px", fontSize: 12, lineHeight: 1.7, color: "var(--ink-2)", borderLeft: "3px solid var(--brand)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ink-3)", fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>
                      <Icon name="quote" size={12} /> 教材原文
                    </span>
                    <div>{c.quote}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.6, padding: "4px 4px 0", textAlign: "center" }}>
                所有结论均可回链至教材原文 · 由学科网权威内容保障
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function TextbookInput({ onAsk }) {
  const [v, setV] = tS("");
  const [att, setAtt] = tS([]);
  const send = () => {
    if (!v.trim() && att.length === 0) return;
    onAsk(v.trim() || "（请结合我上传的材料分析）");
    setV("");
    setAtt([]);
  };
  return (
    <div>
      <FileChips files={att} onRemove={(i) => setAtt((f) => f.filter((_, j) => j !== i))} style={{ marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 14, padding: 9 }}>
        <textarea
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="就本节教材内容提问，答案有据可依…"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontSize: 13.5, fontFamily: "var(--font-zh)", color: "var(--ink)", lineHeight: 1.5, padding: "4px 4px" }}
        />
        <ClipButton onFiles={(names) => setAtt((f) => [...f, ...names].slice(0, 6))} compact />
        <button onClick={send} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="send" size={16} />
        </button>
      </div>
    </div>
  );
}

function AnswerBlock({ A, activeCite, setActiveCite }) {
  const CiteMark = ({ id, n }) => (
    <sup
      onMouseEnter={() => setActiveCite(id)}
      onMouseLeave={() => setActiveCite(null)}
      style={{
        cursor: "pointer",
        fontSize: 10,
        fontWeight: 800,
        color: "#fff",
        background: activeCite === id ? "var(--accent)" : "var(--brand)",
        borderRadius: 5,
        padding: "1px 5px",
        margin: "0 2px",
        fontFamily: "var(--font-num)",
        transition: "background .15s",
        verticalAlign: "super",
      }}
    >
      {n}
    </sup>
  );
  return (
    <div className="ans-pop" style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <BotAvatar size={30} glow />
      <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "4px 16px 16px 16px", padding: "18px 20px", boxShadow: "0 8px 26px -20px rgba(0,0,0,.3)" }}>
        <p style={{ margin: "0 0 16px", fontSize: 14.5, lineHeight: 1.7, color: "var(--ink)" }}>
          {A.summary}
          <CiteMark id="c1" n="1" />
          <CiteMark id="c2" n="2" />
        </p>
        {/* comparison table */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr", background: "var(--surface-2)", fontSize: 12.5, fontWeight: 800, color: "var(--ink-2)" }}>
            <div style={{ padding: "9px 12px" }}>对比项</div>
            <div style={{ padding: "9px 12px", borderLeft: "1px solid var(--line)", color: "oklch(0.5 0.13 200)" }}>光反应</div>
            <div style={{ padding: "9px 12px", borderLeft: "1px solid var(--line)", color: "oklch(0.52 0.12 145)" }}>暗反应</div>
          </div>
          {A.points.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr", fontSize: 12.5, lineHeight: 1.55, borderTop: "1px solid var(--line)" }}>
              <div style={{ padding: "10px 12px", fontWeight: 700, color: "var(--ink-2)", background: "var(--surface-2)" }}>{p.label}</div>
              <div style={{ padding: "10px 12px", borderLeft: "1px solid var(--line)", color: "var(--ink)" }}>{p.light}</div>
              <div style={{ padding: "10px 12px", borderLeft: "1px solid var(--line)", color: "var(--ink)" }}>{p.dark}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--auth-ink)", fontWeight: 700 }}>
            <Icon name="shield" size={14} /> 本回答依据教材原文 {A.citations.length} 处，右侧可查
          </span>
          <div style={{ flex: 1 }} />
          <Btn size="sm" kind="soft" icon="mindmap">生成知识导图</Btn>
          <Btn size="sm" kind="soft" icon="paper">出几道练习题</Btn>
        </div>
      </div>
    </div>
  );
}

// ---- cold-start textbook picker (shown when no memory / not logged in) ----
function TextbookPicker({ onOpen, demoBook }) {
  const [stage, setStage] = tS("");
  const [subject, setSubject] = tS("");
  const [edition, setEdition] = tS("");
  const [name, setName] = tS("");
  const ready = stage && subject && edition && name;

  const HOT = [
    { ...demoBook, label: "上次大家都在查", recommend: true },
    { edition: "人教版", subject: "数学", name: "七年级上册", stage: "初中" },
    { edition: "统编版", subject: "语文", name: "七年级上册", stage: "初中" },
  ];

  const ChipRow = ({ label, opts, value, set }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", width: 44, flexShrink: 0, paddingTop: 7 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {opts.map((o) => (
          <button key={o} onClick={() => set(o)} style={{ padding: "6px 13px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", border: value === o ? "1px solid var(--brand)" : "1px solid var(--line)", background: value === o ? "var(--brand-soft)" : "var(--surface)", color: value === o ? "var(--brand-deep)" : "var(--ink-2)", transition: "all .15s" }}>{o}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "grid", placeItems: "center", padding: "32px 24px", background: "var(--canvas)" }}>
      <div className="home-fade" style={{ width: "min(660px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", marginBottom: 12 }}><ScenarioGlyph icon="book" hue={210} size={52} active /></div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: "var(--ink)", margin: "0 0 7px" }}>先选择要查阅的教材</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.6 }}>问教材的每条回答都会<b style={{ color: "var(--brand-deep)" }}>标注教材原文出处</b>，先告诉我你要问哪一本。</p>
        </div>

        {/* hot / recommended */}
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="spark" size={14} /> 热门教材
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
          {HOT.map((b, i) => (
            <button key={i} onClick={() => onOpen(b)} style={{ textAlign: "left", padding: 14, borderRadius: 14, border: b.recommend ? "1px solid var(--brand-soft-border)" : "1px solid var(--line)", background: b.recommend ? "var(--brand-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s", position: "relative" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--brand)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = b.recommend ? "var(--brand-soft-border)" : "var(--line)"; }}>
              {b.recommend && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9.5, fontWeight: 700, color: "#fff", background: "var(--brand)", padding: "2px 6px", borderRadius: 999 }}>推荐</span>}
              <div className="ph-stripe" style={{ width: 38, height: 50, borderRadius: 5, marginBottom: 10, display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 8, fontWeight: 700 }}>封面</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", lineHeight: 1.35 }}>{b.subject} · {b.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{b.edition} · {b.stage}</div>
            </button>
          ))}
        </div>

        {/* manual select */}
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} /> 或手动选择 <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 18px" }}>
          <ChipRow label="学段" opts={TB_STAGES} value={stage} set={setStage} />
          <ChipRow label="学科" opts={TB_SUBJECTS} value={subject} set={setSubject} />
          <ChipRow label="版本" opts={TB_EDITIONS} value={edition} set={setEdition} />
          <ChipRow label="册次" opts={TB_BOOKS} value={name} set={setName} />
          <button onClick={() => ready && onOpen({ stage, subject, edition, name })} disabled={!ready} style={{ width: "100%", marginTop: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", borderRadius: 12, border: "none", background: ready ? "var(--brand)" : "var(--line)", color: ready ? "#fff" : "var(--ink-3)", fontSize: 14, fontWeight: 800, cursor: ready ? "pointer" : "default", fontFamily: "var(--font-zh)", transition: "all .2s" }}>
            进入教材问答 <Icon name="arrow" size={16} />
          </button>
          {!ready && <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>选齐学段、学科、版本与册次后进入</div>}
        </div>
      </div>
    </div>
  );
}

function CompareBlock({ CMP, activeCite, setActiveCite, onAsk }) {
  const depthColor = (d) => (d.includes("深入") ? { c: "var(--brand-deep)", bg: "var(--brand-soft)", bd: "var(--brand-soft-border)" } : { c: "oklch(0.45 0.11 175)", bg: "oklch(0.95 0.04 175)", bd: "oklch(0.86 0.06 175)" });
  return (
    <div className="cite-pop" style={{ display: "flex", gap: 11 }}>
      <BotAvatar size={28} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 13 }}>
        {/* summary */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "4px 14px 14px 14px", padding: "14px 16px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, color: "var(--brand-deep)", background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", padding: "3px 9px", borderRadius: 999, marginBottom: 10 }}>
            <Icon name="layers" size={13} /> 跨教材对比 · {CMP.topic}
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.75 }}>{CMP.summary}</p>
        </div>

        {/* edition cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CMP.editions.map((e, i) => {
            const dc = depthColor(e.depth);
            const on = activeCite === "e" + i;
            return (
              <div
                key={i}
                onMouseEnter={() => setActiveCite("e" + i)}
                onMouseLeave={() => setActiveCite(null)}
                style={{ background: "var(--surface)", border: on ? "1px solid var(--brand)" : "1px solid var(--line)", borderRadius: 14, padding: 14, transition: "border-color .18s, box-shadow .18s", boxShadow: on ? "0 10px 24px -16px rgba(0,0,0,.3)" : "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: e.stage === "高中" ? "var(--brand-soft)" : "oklch(0.95 0.04 175)", color: e.stage === "高中" ? "var(--brand-deep)" : "oklch(0.45 0.11 175)", border: "1px solid " + (e.stage === "高中" ? "var(--brand-soft-border)" : "oklch(0.86 0.06 175)"), display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{e.stage[0]}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.edition}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>{e.stage} · {e.book}</div>
                  </div>
                </div>
                <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, color: dc.c, background: dc.bg, border: `1px solid ${dc.bd}`, padding: "2px 8px", borderRadius: 999, marginBottom: 9 }}>{e.depth}</span>
                <p style={{ margin: "0 0 9px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.65 }}>{e.angle}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 9 }}>
                  {e.tags.map((t, k) => (
                    <span key={k} style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-3)", background: "var(--surface-2)", border: "1px solid var(--line)", padding: "2px 7px", borderRadius: 6 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--brand-deep)", fontWeight: 700, paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
                  <Icon name="quote" size={12} /> {e.loc}
                </div>
              </div>
            );
          })}
        </div>

        {/* junior vs senior diff table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
            <div style={{ padding: "9px 12px", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>对比维度</div>
            <div style={{ padding: "9px 12px", fontSize: 11.5, fontWeight: 800, color: "oklch(0.45 0.11 175)", borderLeft: "1px solid var(--line)" }}>初中教材</div>
            <div style={{ padding: "9px 12px", fontSize: 11.5, fontWeight: 800, color: "var(--brand-deep)", borderLeft: "1px solid var(--line)" }}>高中教材</div>
          </div>
          {CMP.diff.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr", borderBottom: i < CMP.diff.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>{d.aspect}</div>
              <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55, borderLeft: "1px solid var(--line)" }}>{d.junior}</div>
              <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55, borderLeft: "1px solid var(--line)" }}>{d.senior}</div>
            </div>
          ))}
        </div>

        {/* follow-ups */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["重点对比初中两个版本", "高中人教版怎么讲光反应？", "据此做一份跨学段衔接教案"].map((q, i) => (
            <button key={i} onClick={() => onAsk(q)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "1px dashed var(--brand-soft-border)", background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              <Icon name="chat" size={12} /> {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TextbookWorkspace });
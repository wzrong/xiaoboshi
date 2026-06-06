// workspace_find_media.jsx — video & album presentation for 找资源
const { useState: mS, useEffect: mE, useRef: mR } = React;

function parseDur(d) {
  const p = String(d).split(":").map(Number);
  return p.length === 2 ? p[0] * 60 + p[1] : p[0];
}
function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

// ---- VIDEO CARD ----
function VideoCard({ v, onPlay, onDownload }) {
  const mobile = useIsMobile();
  return (
    <div
      className="res-card"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 14, display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 12 : 16, cursor: "pointer", transition: "box-shadow .2s, border-color .2s" }}
      onClick={onPlay}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 28px -18px rgba(0,0,0,.3)"; e.currentTarget.style.borderColor = "var(--brand-soft-border)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
    >
      {/* thumbnail */}
      <div className="ph-stripe" style={{ width: mobile ? "100%" : 188, flexShrink: 0, aspectRatio: "16/9", borderRadius: 11, position: "relative", display: "grid", placeItems: "center", overflow: "hidden" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", boxShadow: "0 4px 14px rgba(0,0,0,.25)", color: "var(--brand-deep)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </div>
        <span style={{ position: "absolute", bottom: 7, right: 7, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 5, fontFamily: "var(--font-num)" }}>{v.duration}</span>
        <span style={{ position: "absolute", top: 7, left: 7, background: "var(--accent)", color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "2px 7px", borderRadius: 5 }}>{v.cat}</span>
      </div>
      {/* body */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", lineHeight: 1.45 }}>{v.title}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
          {[v.edition, v.grade, v.subject, v.quality].map((t, i) => (
            <span key={i} style={{ padding: "3px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)" }}>{t}</span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 11, fontSize: 12, color: "var(--ink-3)", flexWrap: "wrap", rowGap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="eye" size={13} /> {v.plays} 次播放</span>
          <span>{v.chapters.length} 个章节</span>
          <span>更新 {v.updated}</span>
          <div style={{ flex: 1, minWidth: 12 }} />
          <button onClick={(e) => { e.stopPropagation(); onPlay(); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 9, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> 播放
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDownload(); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
            <Icon name="download" size={14} /> 下载
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- VIDEO PLAYER (modal) ----
function VideoPlayer({ v, onClose, onDownload, onAsk }) {
  const mobile = useIsMobile();
  const total = parseDur(v.duration);
  const [playing, setPlaying] = mS(true);
  const [cur, setCur] = mS(0);
  mE(() => {
    if (!playing) return;
    const id = setInterval(() => setCur((c) => (c >= total ? (clearInterval(id), total) : c + 1)), 250);
    return () => clearInterval(id);
  }, [playing, total]);
  const pct = total ? (cur / total) * 100 : 0;
  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCur(Math.round(((e.clientX - r.left) / r.width) * total));
  };
  const activeChapter = [...v.chapters].reverse().find((c) => parseDur(c.t) <= cur);
  const asks = ["总结这个视频讲了什么", "适合课堂哪个环节用", "提取关键知识点", "找配套的练习"];

  return (
    <div className="drawer-pop" style={{ position: "absolute", inset: 0, zIndex: 25, background: "var(--surface)", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} title="返回结果" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="back" size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.title}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>学科网 · 教学视频 · {v.duration} · {v.quality}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="close" size={16} sw={2.4} />
        </button>
      </div>
      {/* keep-collaborating quick asks (chat stays usable on the left) */}
      {onAsk && (
        <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--line)", background: "var(--brand-soft)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--brand-deep)" }}>
            <Icon name="spark" size={14} /> 边看边问小博士
          </span>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {asks.map((q, i) => (
              <button key={i} onClick={() => onAsk(q, v)} style={{ padding: "5px 11px", borderRadius: 999, border: "1px solid var(--brand-soft-border)", background: "var(--surface)", color: "var(--brand-deep)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>{q}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: mobile ? "column" : "row" }}>
          {/* stage + controls */}
          <div style={{ flex: 1, minWidth: 0, minHeight: mobile ? 220 : 0, background: "#0c0b0a", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", flex: 1, minHeight: 0, background: "radial-gradient(circle at 50% 40%, #2a2722, #0c0b0a)", display: "grid", placeItems: "center" }}>
              <div onClick={() => setPlaying((p) => !p)} style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,.16)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff", border: "2px solid rgba(255,255,255,.5)" }}>
                {playing ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </div>
              <div style={{ position: "absolute", top: 14, left: 16, color: "rgba(255,255,255,.85)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ background: "var(--accent)", padding: "2px 8px", borderRadius: 5, fontWeight: 800, fontSize: 11 }}>{v.cat}</span>
                {activeChapter ? activeChapter.name : "准备播放"}
              </div>
              <div style={{ position: "absolute", bottom: 14, right: 16, color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 700 }}>学科网 · 教学视频 · {v.quality}</div>
            </div>
            {/* control bar */}
            <div style={{ padding: "12px 16px 16px", flexShrink: 0 }}>
              <div onClick={seek} style={{ height: 6, background: "rgba(255,255,255,.18)", borderRadius: 4, cursor: "pointer", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "var(--brand)", borderRadius: 4 }} />
                <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 13, height: 13, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.4)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 11, color: "rgba(255,255,255,.85)" }}>
                <span onClick={() => setPlaying((p) => !p)} style={{ cursor: "pointer", display: "inline-flex" }}>
                  {playing ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-num)" }}>{fmtTime(cur)} / {v.duration}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12, border: "1px solid rgba(255,255,255,.3)", padding: "2px 7px", borderRadius: 5, cursor: "pointer" }}>倍速 1.0x</span>
                <span style={{ fontSize: 12, border: "1px solid rgba(255,255,255,.3)", padding: "2px 7px", borderRadius: 5, cursor: "pointer" }}>{v.quality}</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: "pointer" }}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" /></svg>
              </div>
            </div>
          </div>
          {/* chapters sidebar */}
          <div style={{ width: mobile ? "100%" : 268, flexShrink: 0, borderLeft: mobile ? "none" : "1px solid var(--line)", borderTop: mobile ? "1px solid var(--line)" : "none", display: "flex", flexDirection: "column", minHeight: 0, maxHeight: mobile ? "42%" : "none" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>视频章节</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {v.chapters.map((c, i) => {
                const on = activeChapter && activeChapter.t === c.t;
                return (
                  <div key={i} onClick={() => setCur(parseDur(c.t))} style={{ display: "flex", gap: 10, padding: "9px 10px", borderRadius: 10, cursor: "pointer", background: on ? "var(--brand-soft)" : "transparent" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: on ? "var(--brand-deep)" : "var(--ink-3)", fontFamily: "var(--font-num)", flexShrink: 0, paddingTop: 1 }}>{c.t}</span>
                    <span style={{ fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? "var(--brand-deep)" : "var(--ink-2)", lineHeight: 1.5 }}>{c.name}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn kind="primary" icon="download" onClick={onDownload} style={{ width: "100%" }}>下载视频</Btn>
            </div>
          </div>
      </div>
    </div>
  );
}

// ---- ALBUM CARD (in results) ----
const TYPE_HUE = { 课件: 255, 教案: 320, 试卷: 25, 习题: 150, 微课: 200, 视频: 200 };

function AlbumCard({ a, onOpen }) {
  return (
    <div
      className="res-card"
      style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--brand-soft-border)", borderRadius: 16, padding: 16, cursor: "pointer", transition: "box-shadow .2s, transform .15s" }}
      onClick={onOpen}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 30px -16px rgba(0,0,0,.32)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        {/* stacked cover */}
        <div style={{ position: "relative", width: 96, height: 124, flexShrink: 0 }}>
          <div className="ph-stripe" style={{ position: "absolute", inset: "8px 0 0 10px", borderRadius: 8, opacity: 0.5 }} />
          <div className="ph-stripe" style={{ position: "absolute", inset: "4px 4px 4px 6px", borderRadius: 8, opacity: 0.75 }} />
          <div style={{ position: "absolute", inset: "0 8px 8px 0", borderRadius: 8, background: "linear-gradient(160deg, var(--brand), var(--brand-deep))", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 10, color: "#fff" }}>
            <Icon name="layers" size={20} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, fontFamily: "var(--font-num)", lineHeight: 1 }}>{a.total}</div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>份资料</div>
            </div>
          </div>
        </div>
        {/* body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--brand)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 6 }}>
              <Icon name="layers" size={12} /> 专辑合集
            </span>
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink)", lineHeight: 1.45 }}>{a.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {a.composition.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 7, background: `oklch(0.96 0.04 ${TYPE_HUE[c.type] || 150})`, color: `oklch(0.46 0.12 ${TYPE_HUE[c.type] || 150})`, fontSize: 11.5, fontWeight: 700 }}>
                {c.type} <b style={{ fontFamily: "var(--font-num)" }}>{c.n}</b>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, fontSize: 12, color: "var(--ink-3)", flexWrap: "wrap", rowGap: 8 }}>
            <span>{a.edition} · {a.grade} · {a.subject}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="download" size={13} /> {a.downloads}</span>
            <span>更新 {a.updated}</span>
            <div style={{ flex: 1, minWidth: 8 }} />
            <button onClick={(e) => { e.stopPropagation(); onOpen(); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 15px", borderRadius: 9, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
              查看专辑 <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- ALBUM PAGE (overlay) ----
function AlbumPage({ a, onClose, onPreviewItem, onPlayItem, onDownload }) {
  const mobile = useIsMobile();
  const total = a.composition.reduce((s, c) => s + c.n, 0);
  return (
    <div className="drawer-pop" style={{ position: "absolute", inset: 0, background: "var(--canvas)", zIndex: 25, display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", marginBottom: 14 }}>
          <Icon name="back" size={15} /> 返回搜索结果
        </button>
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ width: 92, height: 118, flexShrink: 0, borderRadius: 10, background: "linear-gradient(160deg, var(--brand), var(--brand-deep))", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 12, color: "#fff", boxShadow: "0 10px 24px -12px var(--brand-glow)" }}>
            <Icon name="layers" size={22} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-num)", lineHeight: 1 }}>{a.total}</div>
              <div style={{ fontSize: 10.5, opacity: 0.9 }}>份精品资料</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--brand)", color: "#fff", fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6 }}><Icon name="layers" size={13} /> 专辑合集</span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.4 }}>{a.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: mobile ? 12 : 18, fontSize: 12.5, color: "var(--ink-3)", flexWrap: "wrap", rowGap: 10 }}>
              <span>{a.edition} · {a.grade} · {a.subject}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="download" size={13} /> {a.downloads} 次下载</span>
              <span>更新 {a.updated}</span>
              <div style={{ flex: 1, minWidth: mobile ? 0 : 12 }} />
              <Btn kind="primary" icon="download" onClick={() => onDownload("已开始打包下载整个专辑")}>一键打包下载</Btn>
            </div>
          </div>
        </div>
        {/* composition bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", height: 9, borderRadius: 5, overflow: "hidden", border: "1px solid var(--line)" }}>
            {a.composition.map((c, i) => (
              <div key={i} title={`${c.type} ${c.n}`} style={{ width: `${(c.n / total) * 100}%`, background: `oklch(0.62 0.13 ${TYPE_HUE[c.type] || 150})` }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {a.composition.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: `oklch(0.62 0.13 ${TYPE_HUE[c.type] || 150})` }} /> {c.type} {c.n}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* item list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 28px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)", marginBottom: 12 }}>专辑内资料（{a.items.length} / {a.total}）</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {a.items.map((it, i) => {
            const isVideo = it.fmt === "MP4";
            const hue = TYPE_HUE[it.type] || 150;
            const open = () => (isVideo ? onPlayItem(it) : onPreviewItem(it));
            return (
              <div
                key={i}
                onClick={open}
                className="res-card"
                style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "box-shadow .2s, border-color .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 24px -16px rgba(0,0,0,.28)"; e.currentTarget.style.borderColor = "var(--brand-soft-border)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
              >
                <ScenarioGlyph icon={isVideo ? "interactive" : it.type === "课件" ? "slides" : it.type === "教案" ? "lesson" : it.type === "试卷" ? "paper" : "search"} hue={hue} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{it.title}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11.5, color: "var(--ink-3)" }}>
                    <span style={{ color: `oklch(0.5 0.12 ${hue})`, fontWeight: 700 }}>{it.type}</span>
                    <span>{it.fmt}</span>
                    {it.pages && <span>{it.pages} 页</span>}
                    {it.q && <span>{it.q} 题</span>}
                    {it.dur && <span>{it.dur}</span>}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); open(); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
                  {isVideo ? (
                    <React.Fragment><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> 播放</React.Fragment>
                  ) : (
                    <React.Fragment><Icon name="eye" size={14} /> 查看</React.Fragment>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "var(--ink-3)" }}>
          仅展示前 {a.items.length} 份 · 完整 {a.total} 份资料下载后可在「我的资源夹」查看
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VideoCard, VideoPlayer, AlbumCard, AlbumPage, parseDur, fmtTime });

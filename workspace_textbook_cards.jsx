// workspace_textbook_cards.jsx — 知识卡片：把一次问教材回答二次加工成一张紧凑、可嵌课件 / 供学生复习的卡片。
// 卡片结构随问题类型变化（对比→表、原因/原理→步骤、归纳/概念→清单），但都从回答里提炼，继承其依据。

function TbCardSection({ s }) {
  if (s.kind === "table") {
    return (
      <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", marginTop: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", background: "var(--surface-2)", fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>
          <div style={{ padding: "7px 10px" }}>维度</div>
          <div style={{ padding: "7px 10px", borderLeft: "1px solid var(--line)", color: `oklch(0.5 0.13 ${s.colHues ? s.colHues[0] : 200})` }}>{s.cols[0]}</div>
          <div style={{ padding: "7px 10px", borderLeft: "1px solid var(--line)", color: `oklch(0.52 0.12 ${s.colHues ? s.colHues[1] : 145})` }}>{s.cols[1]}</div>
        </div>
        {s.rows.map((r, j) => (
          <div key={j} style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", fontSize: 12, lineHeight: 1.5, borderTop: "1px solid var(--line)" }}>
            <div style={{ padding: "8px 10px", fontWeight: 700, color: "var(--ink-2)", background: "var(--surface-2)" }}>{r.label}</div>
            <div style={{ padding: "8px 10px", borderLeft: "1px solid var(--line)", color: "var(--ink)" }}>{r.a}</div>
            <div style={{ padding: "8px 10px", borderLeft: "1px solid var(--line)", color: "var(--ink)" }}>{r.b}</div>
          </div>
        ))}
      </div>
    );
  }
  if (s.kind === "steps") {
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)", marginBottom: 7 }}>{s.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {s.items.map((it, j) => (
            <div key={j} style={{ display: "flex", gap: 9, alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: "var(--brand)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)" }}>{j + 1}</span>
                {j < s.items.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--brand-soft-border)", minHeight: 10 }} />}
              </div>
              <p style={{ margin: 0, paddingBottom: j < s.items.length - 1 ? 11 : 0, fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)", flex: 1 }}>{it}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // list
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)", marginBottom: 7 }}>{s.title}</div>
      <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {s.items.map((it, j) => (
          <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)" }}>
            <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: 2, background: "var(--brand)", marginTop: 7 }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// the card surface itself (also reusable inline / for export preview)
function KnowledgeCardFace({ card }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ padding: "16px 18px 14px", background: `linear-gradient(135deg, oklch(0.96 0.04 ${card.hue}), oklch(0.99 0.012 ${card.hue}))`, borderBottom: `1px solid oklch(0.9 0.05 ${card.hue})` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: "#fff", border: `1px solid oklch(0.88 0.06 ${card.hue})`, color: `oklch(0.45 0.12 ${card.hue})`, fontSize: 10.5, fontWeight: 800, marginBottom: 9 }}>
          <Icon name={card.icon} size={11} /> {card.typeLabel} · 知识卡片
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)", letterSpacing: "-.2px", lineHeight: 1.3 }}>{card.title}</div>
      </div>
      <div style={{ padding: "14px 18px 16px" }}>
        {card.summary && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.68, color: "var(--ink)", fontWeight: 500 }}>{card.summary}</p>}
        {card.sections.map((s, i) => <TbCardSection key={i} s={s} />)}
        {card.memo && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", borderRadius: 10, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)" }}>
            <Icon name="spark" size={14} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-deep)", lineHeight: 1.55 }}>{card.memo}</span>
          </div>
        )}
        <div style={{ marginTop: 13, paddingTop: 10, borderTop: "1px dashed var(--line)", display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>
          {card.grounded
            ? <React.Fragment><Icon name="shield" size={12} /> <span>{card.basisLabel || "依据教材整理"}</span></React.Fragment>
            : <React.Fragment><Icon name="alert" size={12} /> <span>{card.basisLabel || "通用知识，未绑定教材版本"}</span></React.Fragment>}
        </div>
      </div>
    </div>
  );
}

// modal shown when the teacher clicks 「生成知识卡片」on an answer
function KnowledgeCardModal({ card, onClose, onToast }) {
  if (!card) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 130, background: "rgba(18,24,38,.5)", backdropFilter: "blur(2px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 94vw)", maxHeight: "88vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-zh)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Icon name="spark" size={15} /> 知识卡片
          </span>
          <button onClick={onClose} aria-label="关闭" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,.18)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="close" size={15} sw={2.4} /></button>
        </div>
        <div style={{ overflowY: "auto", borderRadius: 14, boxShadow: "0 24px 60px -20px rgba(0,0,0,.5)" }}>
          <KnowledgeCardFace card={card} />
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 12, justifyContent: "center" }}>
          <button onClick={() => { onToast && onToast("已复制卡片内容（演示）"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
            <Icon name="quote" size={14} /> 复制文本
          </button>
          <button onClick={() => { onToast && onToast("已加入「我的内容」（演示）"); onClose && onClose(); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
            <Icon name="plus" size={14} /> 存入我的内容
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KnowledgeCardFace, KnowledgeCardModal });

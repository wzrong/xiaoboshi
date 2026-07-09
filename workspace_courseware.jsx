// workspace_courseware.jsx — 做课件
// 范式：对话栏 = 纯对话 + 追问信息补充弹窗；所有场景设置都在右侧。
// 右侧 = 引导式设置（生成前是表单，生成后收成右侧细栏）。
// 课件类型：传统课件 / 互动课件 / 课件美化（含智能配图）
const { useState: cwS, useRef: cwR, useEffect: cwE } = React;

// ---------- 类型 ----------
const CW_TYPES = [
  { k: "ppt", name: "传统课件", sub: "线性讲授 · 选模板生成", icon: "slides", hue: 255, kind: "generate" },
  { k: "interactive", name: "互动课件", sub: "可点选拖拽 · 课堂互动", icon: "interactive", hue: 45, kind: "generate" },
  { k: "beautify", name: "课件美化", sub: "上传已有 PPT 一键美化 · 智能配图", icon: "wand", hue: 320, kind: "upload" },
];
const cwType = (k) => CW_TYPES.find((t) => t.k === k) || CW_TYPES[0];

// ---------- 教学信息选项 ----------
const CW_SUBJECTS = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "道德与法治", "科学"];
const CW_GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级", "高一", "高二", "高三"];
const CW_EDITIONS = ["人教版", "统编版", "北师大版", "苏教版", "外研版", "沪教版", "湘教版"];
const CW_STANDARD = "《义务教育课程标准（2022年版）》";
const CW_STANDARD_HIGH = "《普通高中课程标准（2017年版2020年修订）》";
const isHighGrade = (g) => ["高一", "高二", "高三"].includes(g);
const cwStandard = (g) => (isHighGrade(g) ? CW_STANDARD_HIGH : CW_STANDARD);

// 传统课件：模板 / 风格（合二为一的精美模板库）
const CW_STYLES = [
  { k: "简约学术", hue: 255, tag: "通用" },
  { k: "活力橙黄", hue: 45, tag: "小学" },
  { k: "墨韵国风", hue: 150, tag: "语文 · 历史" },
  { k: "深空科技", hue: 285, tag: "理科" },
  { k: "清新草木", hue: 145, tag: "生物 · 地理" },
  { k: "商务质感", hue: 250, tag: "通用" },
];
const styleHue = (k) => (CW_STYLES.find((s) => s.k === k) || CW_STYLES[0]).hue;

// 互动环节类型
const CW_ACTS = [
  { k: "点选揭示", demo: "tap", hue: 45 },
  { k: "拖拽分类", demo: "drag", hue: 255 },
  { k: "随堂抢答", demo: "quiz", hue: 25 },
  { k: "知识连线", demo: "match", hue: 150 },
  { k: "闯关游戏", demo: "tap", hue: 320 },
  { k: "互动填空", demo: "quiz", hue: 200 },
];
const actDef = (k) => CW_ACTS.find((a) => a.k === k) || CW_ACTS[0];
// 配图风格
const CW_IMG_STYLES = ["扁平插画", "实景照片", "手绘风", "3D 渲染", "简笔板书"];

// 传统课件页面大纲
const PPT_SLIDES = [
  { t: "封面", sub: "课题 · 课时", kind: "cover" },
  { t: "情境导入", sub: "贴近生活的问题情境", kind: "text" },
  { t: "新知讲解 ①", sub: "概念与原理", kind: "split" },
  { t: "新知讲解 ②", sub: "例题精讲", kind: "split" },
  { t: "课堂练习", sub: "随堂检测 4 题", kind: "list" },
  { t: "课堂小结", sub: "知识框架回顾", kind: "list" },
  { t: "作业布置", sub: "分层作业", kind: "text" },
];

// ============================================================
// 小控件
// ============================================================
function CwSelect({ value, options, onChange, placeholder, width = 130, size = "md" }) {
  const [open, setOpen] = cwS(false);
  const ref = cwR(null);
  cwE(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const pad = size === "sm" ? "7px 10px" : "9px 12px";
  return (
    <div ref={ref} style={{ position: "relative", width }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: pad, borderRadius: 10, border: open ? "1px solid var(--brand)" : "1px solid var(--line)", background: "var(--surface)", color: value ? "var(--ink)" : "var(--ink-3)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
        {value || placeholder}
        <span style={{ display: "inline-flex", color: "var(--ink-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </button>
      {open && (
        <div className="trace-pop" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, maxHeight: 240, overflowY: "auto", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 16px 40px -18px rgba(0,0,0,.35)", zIndex: 40, padding: 5 }}>
          {options.map((o) => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: "8px 11px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: value === o ? "var(--brand-deep)" : "var(--ink-2)", background: value === o ? "var(--brand-soft)" : "transparent", fontFamily: "var(--font-zh)" }} onMouseEnter={(e) => { if (value !== o) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={(e) => { if (value !== o) e.currentTarget.style.background = "transparent"; }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function CwStepper({ value, onChange, min = 1, max = 6, suffix = "课时" }) {
  const btn = (dir, disabled) => (
    <button onClick={() => !disabled && onChange(value + dir)} disabled={disabled} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)", background: disabled ? "var(--surface-2)" : "var(--surface)", color: disabled ? "var(--ink-4)" : "var(--ink-2)", fontSize: 16, fontWeight: 700, cursor: disabled ? "default" : "pointer", display: "grid", placeItems: "center" }}>
      <Icon name={dir < 0 ? "minus" : "plus"} size={14} sw={2.4} />
    </button>
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {btn(-1, value <= min)}
      <span style={{ minWidth: 56, textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-zh)" }}><b style={{ fontFamily: "var(--font-num)" }}>{value}</b> {suffix}</span>
      {btn(1, value >= max)}
    </div>
  );
}

function CwLabel({ n, children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 9 }}>
      {n && <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-4)", fontFamily: "var(--font-num)" }}>{n}</span>}
      <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-2)" }}>{children}</span>
      {hint && <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 600 }}>{hint}</span>}
    </div>
  );
}

function CwChip({ on, onClick, children, hue }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .14s", border: on ? `1.5px solid ${hue != null ? `oklch(0.62 0.13 ${hue})` : "var(--brand)"}` : "1px solid var(--line)", background: on ? (hue != null ? `oklch(0.96 0.04 ${hue})` : "var(--brand-soft)") : "var(--surface)", color: on ? (hue != null ? `oklch(0.45 0.14 ${hue})` : "var(--brand-deep)") : "var(--ink-2)" }}>
      {hue != null && <span style={{ width: 9, height: 9, borderRadius: 3, background: `oklch(0.62 0.14 ${hue})`, flexShrink: 0 }} />}
      {children}
      {on && hue == null && <Icon name="check" size={12} sw={2.6} />}
    </button>
  );
}

// ============================================================
// 类型切换条 — 等宽、不横滚、高度稳定（生成前后一致，避免跳动）
// ============================================================
function CwTypeTabs({ value, onChange, mobile }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: mobile ? "9px 12px" : "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--surface)", flexShrink: 0 }}>
      {CW_TYPES.map((t) => {
        const on = value === t.k;
        return (
          <button key={t.k} onClick={() => onChange(t.k)} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, padding: mobile ? "8px 9px" : "9px 12px", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-zh)", textAlign: "left", transition: "border-color .15s, background .15s", border: on ? `1.5px solid oklch(0.7 0.1 ${t.hue})` : "1px solid var(--line)", background: on ? `oklch(0.97 0.03 ${t.hue})` : "var(--surface)" }}>
            <ScenarioGlyph icon={t.icon} hue={t.hue} size={mobile ? 26 : 30} active={on} />
            <span style={{ minWidth: 0, display: mobile ? "none" : "block" }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: on ? `oklch(0.42 0.14 ${t.hue})` : "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
              <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{t.sub}</span>
            </span>
            {mobile && <span style={{ fontSize: 12, fontWeight: 800, color: on ? `oklch(0.42 0.14 ${t.hue})` : "var(--ink-2)", whiteSpace: "nowrap" }}>{t.name}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// 右侧引导式设置表单（生成前）
// ============================================================
function CwSetupPanel({ setup, up, loggedIn, onLogin, onGenerate, onUseSample, mobile, editing }) {
  const t = cwType(setup.type);
  const std = cwStandard(setup.grade);
  const isUpload = t.kind === "upload";
  const needInfo = !isUpload; // 上传型已有课件，不必再填教学信息
  const ready = isUpload
    ? !!setup.file
    : !!(setup.subject && setup.grade && setup.topic.trim() && setup.style);
  const genLabel = editing
    ? "重新生成课件"
    : { ppt: "生成传统课件", interactive: "生成互动课件", beautify: "一键美化课件" }[setup.type];

  const toggleAct = (k) => up({ acts: setup.acts.includes(k) ? setup.acts.filter((x) => x !== k) : [...setup.acts, k] });

  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      {editing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: mobile ? "9px 14px" : "9px 18px", borderBottom: "1px solid var(--line)", background: "var(--brand-soft)", flexShrink: 0 }}>
          <Icon name="sliders" size={15} />
          <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 700 }}>编辑配置</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>· 改完点「重新生成」；之前的课件已存在左侧对话里，随时点开</span>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: mobile ? "16px 16px 12px" : "22px clamp(20px, 6%, 52px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {/* 记忆 / 登录引导 —— 仅生成型需要教学信息时出现 */}
          {needInfo && (loggedIn ? (
            <MemoryNote text={<span>已套用你的记忆：<b style={{ color: "var(--brand-deep)" }}>人教版 · 七年级 · 数学</b>，下面可直接改。</span>} actionLabel="清空" onAction={() => up({ subject: "", grade: "", edition: "" })} style={{ marginBottom: 18 }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 13, background: "var(--auth-bg)", border: "1px solid var(--auth-border)", marginBottom: 18 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--auth-border)", color: "var(--auth-ink)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="login" size={16} /></span>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-2)" }}>登录后自动带入<b style={{ color: "var(--auth-ink)" }}>常用教材与偏好</b>，少填几项。</div>
              <button onClick={onLogin} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9, border: "none", background: "var(--brand)", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>登录</button>
            </div>
          ))}

          {/* 标题 */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
            <ScenarioGlyph icon={t.icon} hue={t.hue} size={42} active />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>{t.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 1 }}>{t.sub}</div>
            </div>
          </div>

          {/* 上传型：只需文件 + 类型选项，不必填教学信息 */}
          {isUpload && (
            <React.Fragment>
              <div style={{ marginBottom: 20 }}>
                <CwLabel n="01">上传已有课件</CwLabel>
                <CwDrop file={setup.file} onPick={() => up({ file: "我的课件_整式的加减.pptx" })} onClear={() => up({ file: null })} onSample={onUseSample} type={setup.type} />
              </div>
              <div style={{ marginBottom: setup.beautify.includes("智能配图") ? 14 : 20 }}>
                <CwLabel n="02" hint="多选">美化项</CwLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["统一配色", "排版优化", "智能配图", "图标美化", "字体规范"].map((k) => <CwChip key={k} on={setup.beautify.includes(k)} onClick={() => up({ beautify: setup.beautify.includes(k) ? setup.beautify.filter((x) => x !== k) : [...setup.beautify, k] })}>{k}</CwChip>)}
                </div>
              </div>
              {/* 勾选「智能配图」后才出现配图风格 */}
              {setup.beautify.includes("智能配图") && (
                <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 9 }}>
                    <Icon name="image" size={14} />
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-2)" }}>配图风格</span>
                    <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 600 }}>智能配图生成时采用</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {CW_IMG_STYLES.map((k) => <CwChip key={k} on={setup.imgStyle === k} onClick={() => up({ imgStyle: k })}>{k}</CwChip>)}
                  </div>
                </div>
              )}
            </React.Fragment>
          )}

          {/* 生成型：教学信息 */}
          {needInfo && (
            <div style={{ marginBottom: 20 }}>
              <CwLabel n="01">教学信息</CwLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <CwSelect value={setup.grade} options={CW_GRADES} onChange={(v) => up({ grade: v })} placeholder="学段年级" width={108} />
                <CwSelect value={setup.subject} options={CW_SUBJECTS} onChange={(v) => up({ subject: v })} placeholder="学科" width={92} />
                <CwSelect value={setup.edition} options={CW_EDITIONS} onChange={(v) => up({ edition: v })} placeholder="教材版本" width={108} />
              </div>
              <input value={setup.topic} onChange={(e) => up({ topic: e.target.value })} placeholder="课题，例如：二次根式的概念 / 平行四边形的判定" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 13, fontFamily: "var(--font-zh)", color: "var(--ink)", outline: "none", boxSizing: "border-box", marginBottom: 10 }} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--line)")} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>课时数</span>
                <CwStepper value={setup.periods} onChange={(v) => up({ periods: v })} />
              </div>
            </div>
          )}

          {/* 传统课件：模板 / 风格（精美模板库） */}
          {setup.type === "ppt" && (
            <div style={{ marginBottom: 20 }}>
              <CwLabel n="02" hint="精美模板库 · 决定整体版式与配色">模板 / 风格</CwLabel>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {CW_STYLES.map((s) => <CwTemplateCard key={s.k} tp={s} on={setup.style === s.k} onClick={() => up({ style: s.k })} />)}
              </div>
            </div>
          )}
          {/* 互动课件：互动环节 */}
          {setup.type === "interactive" && (
            <div style={{ marginBottom: 20 }}>
              <CwLabel n="02" hint="多选 · 课堂可直接操作">互动环节类型</CwLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CW_ACTS.map((a) => <CwChip key={a.k} on={setup.acts.includes(a.k)} hue={a.hue} onClick={() => toggleAct(a.k)}>{a.k}</CwChip>)}
              </div>
            </div>
          )}

          {/* 课标对齐（自动） */}
          {needInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 11, background: "var(--surface)", border: "1px solid var(--line)", marginBottom: 8 }}>
              <Icon name="shield" size={15} />
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-2)" }}>将自动对齐 <b style={{ color: "var(--ink)" }}>{std}</b>，并参照权威教案</div>
            </div>
          )}
        </div>
      </div>

      {/* 生成按钮（贴底，始终可见） */}
      <div style={{ flexShrink: 0, padding: mobile ? "10px 16px 14px" : "12px clamp(20px,6%,52px) 16px", borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <button onClick={() => ready && onGenerate()} disabled={!ready} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 13, border: "none", background: ready ? "var(--brand-grad)" : "var(--line)", backgroundColor: ready ? "var(--brand)" : "var(--line)", color: ready ? "#fff" : "var(--ink-3)", fontSize: 14.5, fontWeight: 800, cursor: ready ? "pointer" : "default", fontFamily: "var(--font-zh)", transition: "all .2s" }}>
            <Icon name={isUpload ? "wand" : "spark"} size={17} /> {genLabel}
          </button>
          {!ready && <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-3)", marginTop: 7 }}>{isUpload ? "请先上传课件或使用示例" : "请填写学段、学科与课题"}</div>}
        </div>
      </div>
    </div>
  );
}

// 上传区
function CwDrop({ file, onPick, onClear, onSample, type }) {
  const [over, setOver] = cwS(false);
  if (file) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 15px", borderRadius: 13, border: "1px solid var(--brand-soft-border)", background: "var(--brand-soft)" }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="slides" size={18} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file}</div>
          <div style={{ fontSize: 11, color: "var(--brand-deep)", fontWeight: 600, marginTop: 1 }}>已解析 · 共 18 页</div>
        </div>
        <button onClick={onClear} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="close" size={14} /></button>
      </div>
    );
  }
  return (
    <React.Fragment>
      <button onClick={onPick} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); onPick(); }} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "26px 20px", borderRadius: 14, border: `1.5px dashed ${over ? "var(--brand)" : "var(--brand-soft-border)"}`, background: over ? "var(--brand-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-zh)", transition: "all .15s" }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", color: "var(--brand-deep)", display: "grid", placeItems: "center" }}><Icon name="upload" size={20} /></span>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>拖入或<span style={{ color: "var(--brand-deep)" }}>点击上传</span> PPT / PPTX</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>上传后一键统一美化，可选智能配图</div>
      </button>
      <button onClick={onSample} style={{ width: "100%", marginTop: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }}>
        <Icon name="spark" size={14} /> 用示例课件体验
      </button>
    </React.Fragment>
  );
}

// 模板 / 风格卡
function CwTemplateCard({ tp, on, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", padding: 0, borderRadius: 12, overflow: "hidden", cursor: "pointer", fontFamily: "var(--font-zh)", border: on ? `2px solid oklch(0.62 0.14 ${tp.hue})` : "1px solid var(--line)", background: "var(--surface)", transition: "all .15s" }}>
      <div style={{ height: 60, background: `linear-gradient(150deg, oklch(0.7 0.12 ${tp.hue}), oklch(0.85 0.07 ${tp.hue}))`, position: "relative", display: "flex", alignItems: "flex-end", padding: 8 }}>
        <div style={{ width: "62%", height: 8, borderRadius: 3, background: "rgba(255,255,255,.85)" }} />
        {on && <span style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: `oklch(0.55 0.15 ${tp.hue})`, color: "#fff", display: "grid", placeItems: "center" }}><Icon name="check" size={11} sw={3} /></span>}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: on ? `oklch(0.42 0.14 ${tp.hue})` : "var(--ink)" }}>{tp.k}</div>
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 1 }}>{tp.tag}</div>
      </div>
    </button>
  );
}

// ============================================================
// 追问信息补充弹窗（对话栏内）
// ============================================================
function CwClarify({ init, onResolve, onSkip }) {
  const [vals, setVals] = cwS(init);
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));
  const gaps = ["grade", "subject", "topic"].filter((k) => !vals[k]);
  const wrap = { display: "flex", flexWrap: "wrap", gap: 7 };
  const chip = (on) => ({ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)", color: on ? "var(--brand-deep)" : "var(--ink-2)" });
  const FIELD = { grade: "学段年级", subject: "学科", topic: "课题" };
  return (
    <div className="clarify-pop" style={{ margin: "0 14px 10px", borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "0 16px 40px -16px rgba(20,30,50,0.28)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 14px 8px" }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", display: "grid", placeItems: "center", color: "var(--brand-deep)", flexShrink: 0 }}><Icon name="spark" size={14} /></span>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>补充一下就开做</div>
        <div style={{ flex: 1 }} />
        <button onClick={onSkip} style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-zh)" }}>跳过</button>
      </div>
      <div style={{ padding: "0 14px 13px", display: "flex", flexDirection: "column", gap: 11 }}>
        {gaps.includes("grade") && (
          <div><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>{FIELD.grade}</div><div style={wrap}>{CW_GRADES.slice(6, 12).map((g) => <button key={g} style={chip(vals.grade === g)} onClick={() => set("grade", g)}>{g}</button>)}</div></div>
        )}
        {gaps.includes("subject") && (
          <div><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>{FIELD.subject}</div><div style={wrap}>{CW_SUBJECTS.slice(0, 8).map((s) => <button key={s} style={chip(vals.subject === s)} onClick={() => set("subject", s)}>{s}</button>)}</div></div>
        )}
        {gaps.includes("topic") && (
          <div><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>{FIELD.topic}</div><input autoFocus value={vals.topic} onChange={(e) => set("topic", e.target.value)} placeholder="例如：二次根式的概念" style={{ width: "100%", padding: "8px 11px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 13, fontFamily: "var(--font-zh)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--line)")} /></div>
        )}
        <button onClick={() => onResolve(vals)} disabled={gaps.length > 0} style={{ width: "100%", padding: "10px", borderRadius: 11, border: "none", background: gaps.length ? "var(--line)" : "var(--brand)", color: gaps.length ? "var(--ink-3)" : "#fff", fontSize: 13.5, fontWeight: 800, cursor: gaps.length ? "default" : "pointer", fontFamily: "var(--font-zh)" }}>填好了，开始生成</button>
      </div>
    </div>
  );
}

// ============================================================
// 生成后：右侧设置细栏
// ============================================================
function CwSettingsRail({ setup }) {
  const t = cwType(setup.type);
  const rows = [];
  if (setup.type === "beautify") {
    rows.push(["来源课件", setup.file || "—"]);
    rows.push(["美化项", `${setup.beautify.length} 项`]);
    if (setup.beautify.includes("智能配图")) rows.push(["配图风格", setup.imgStyle]);
  } else {
    if (setup.grade || setup.subject) rows.push(["学段学科", `${setup.grade || ""}${setup.subject || ""}`]);
    if (setup.edition) rows.push(["教材版本", setup.edition]);
    if (setup.topic) rows.push(["课题", `《${setup.topic}》`]);
    rows.push(["课时", `${setup.periods} 课时`]);
    if (setup.type === "ppt") rows.push(["模板", setup.style]);
    if (setup.type === "interactive") rows.push(["互动", `${setup.acts.length} 个环节`]);
  }

  return (
    <div style={{ width: 224, flexShrink: 0, borderLeft: "1px solid var(--line)", background: "var(--surface)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <ScenarioGlyph icon={t.icon} hue={t.hue} size={30} active />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{t.name}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>当前设置</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 10.5, color: "var(--ink-4)", fontWeight: 700 }}>{k}</span>
            <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 700, lineHeight: 1.4, wordBreak: "break-all" }}>{v}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 9, background: "var(--surface-2)", marginTop: 2 }}>
          <Icon name="shield" size={13} />
          <span style={{ fontSize: 10.5, color: "var(--ink-2)", fontWeight: 700, lineHeight: 1.4 }}>已对齐课标 · 权威教案</span>
        </div>
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>
        如需改类型或重做，点左上角<b style={{ color: "var(--ink-2)" }}>返回配置</b>。
      </div>
    </div>
  );
}

// 生成后舞台工具条：返回配置 + 标题 + 下载（这是课件编辑页，二级页面）
function CwBuiltToolbar({ setup, onBack, onDownload, mobile }) {
  const t = cwType(setup.type);
  const title = setup.type === "beautify"
    ? (setup.file ? setup.file.replace(/\.pptx?$/i, "") : "课件")
    : (setup.topic || "课件");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12, padding: mobile ? "9px 14px" : "9px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface)", flexShrink: 0 }}>
      <button onClick={onBack} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: mobile ? "7px 9px" : "7px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}>
        <Icon name="chevronLeft" size={15} /> {mobile ? "" : "返回配置"}
      </button>
      <span style={{ width: 1, height: 18, background: "var(--line)", flexShrink: 0 }} />
      <Icon name={t.icon} size={16} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>《{title}》</span>
      </div>
      <button onClick={onDownload} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--brand-grad)", backgroundColor: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)", whiteSpace: "nowrap" }}>
        <Icon name="download" size={15} /> 下载
      </button>
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
function CoursewareWorkspace({ scenario, query, onHome, onSwitch, fromIntent, resume, loggedIn, nav }) {
  const mobile = useIsMobile();
  const isResume = !!resume;

  const wantsInteractive = /互动|游戏|拖拽|抢答|连线|闯关/.test(query || "");
  const wantsBeautify = /美化|排版优化|优化排版|配图|换图|插图/.test(query || "");
  // 点对话里「已生成的课件」卡片 → 重新打开该结果
  const pendingA = window.ChatSession.pendingArtifact && window.ChatSession.pendingArtifact.scenario === "courseware" ? window.ChatSession.pendingArtifact : null;
  if (pendingA) window.ChatSession.pendingArtifact = null;
  const initType = wantsInteractive ? "interactive" : wantsBeautify ? "beautify" : "ppt";
  const topicGuess = (query && (query.match(/《(.+?)》/) || [])[1]) || "";
  const subjGuess = CW_SUBJECTS.find((s) => (query || "").includes(s)) || (loggedIn ? "数学" : "");
  const gradeGuess = CW_GRADES.find((g) => (query || "").includes(g)) || (loggedIn ? "七年级" : "");

  const stored = window.ChatSession.scratch.courseware || {};
  const defaultSetup = {
    type: initType,
    grade: gradeGuess, subject: subjGuess, edition: loggedIn ? "人教版" : "",
    topic: topicGuess, periods: 1,
    style: "简约学术",
    acts: ["点选揭示", "随堂抢答"],
    beautify: ["统一配色", "排版优化", "智能配图"],
    imgStyle: "扁平插画",
    file: null,
  };
  const resumeSetup = isResume ? {
    ...defaultSetup,
    type: /互动/.test(resume.title || "") ? "interactive" : "ppt",
    subject: "数学", grade: "七年级", edition: "人教版",
    topic: topicGuess || (resume.title || "").replace(/[《》]|互动课件|传统\s*课件|课件/g, "").trim() || "整式的加减",
  } : null;

  const [setup, setSetup] = cwS(stored.setup || (isResume ? resumeSetup : defaultSetup));
  const [built, setBuilt] = cwS(!!pendingA || isResume || !!stored.built);
  const [editing, setEditing] = cwS(false);
  const [active, setActive] = cwS(0);
  const [generating, setGenerating] = cwS(false);
  const [toast, setToast] = cwS(null);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const up = (patch) => setSetup((s) => ({ ...s, ...patch }));
  cwE(() => { window.ChatSession.scratch.courseware = { setup, built }; }, [setup, built]);

  const greet = <span>好的，我来陪你<b style={{ color: "var(--brand-deep)" }}>做课件</b>。右侧选好<b>课件类型</b>就能开始——传统课件、互动课件、课件美化（含智能配图）都行；也可以直接在这里告诉我你想做什么。</span>;

  const [clarify, setClarify] = cwS(null);
  const [messages, setMessages] = cwS(() => {
    const hist = window.ChatSession.take();
    if (isResume) {
      const fn = resumeSetup.type === "ppt" ? "传统课件" : "互动课件";
      return [{ role: "ai", node: <span>已为你恢复 <b>{resume.when}</b> 制作的《{resumeSetup.topic}》{fn}，设置与内容都在右侧，接着改就行。</span> }];
    }
    if (fromIntent && query) {
      return [
        ...hist,
        ...window.takeSwitchDivider(scenario, hist.length > 0),
        ...(window.ChatSession.echoed(query) ? [] : [{ role: "user", text: query }]),
        { role: "ai", wide: true, intent: query, render: () => <InlineIntent query={query} onDone={afterIntent} /> },
      ];
    }
    if (query) {
      return [...hist, ...window.takeSwitchDivider(scenario, hist.length > 0), ...(window.ChatSession.echoed(query) ? [] : [{ role: "user", text: query }]), { role: "ai", node: greet }];
    }
    if (hist.length) return window.enterThread(scenario, greet);
    return [...hist, { role: "ai", node: greet }];
  });
  const [sugs, setSugs] = cwS(built ? builtSugs(setup.type) : []);

  cwE(() => { window.ChatSession.save(window.freezeChat(messages)); }, [messages]);

  function builtSugs(type) {
    if (type === "interactive") return ["再加一个抢答环节", "把导入换成拖拽", "改成传统课件"];
    if (type === "beautify") return ["再换一套配色", "智能配图换个风格", "下载美化后的课件"];
    return ["突出情境导入", "加一页随堂练习", "换个模板风格"];
  }

  function afterIntent() {
    const upload = cwType(setup.type).kind === "upload";
    if (upload) { setMessages((m) => [...m, { role: "ai", node: <span>已切到<b style={{ color: "var(--brand-deep)" }}>{cwType(setup.type).name}</b>，在右侧上传你已有的课件即可开始。</span> }]); return; }
    const gaps = ["grade", "subject", "topic"].filter((k) => !setup[k]);
    setMessages((m) => [...m, { role: "ai", node: gaps.length
      ? <span>已切到<b style={{ color: "var(--brand-deep)" }}>{cwType(setup.type).name}</b>。右侧补齐<b>{gaps.map((g) => ({ grade: "学段", subject: "学科", topic: "课题" }[g])).join("、")}</b>即可生成，或在下方补充。</span>
      : <span>已切到<b style={{ color: "var(--brand-deep)" }}>{cwType(setup.type).name}</b>，右侧已带入你的常用设置，确认后点「生成」即可。</span> }]);
  }

  function doGenerate(over) {
    const s = over || setup;
    if (over) setSetup(s);
    setEditing(false);
    setGenerating(true);
    setActive(0);
    const t = cwType(s.type);
    setTimeout(() => {
      setGenerating(false);
      setBuilt(true);
      setSugs(builtSugs(s.type));
      const titleTopic = s.topic || (s.file ? s.file.replace(/\.pptx?$/i, "") : "课件");
      const art = { scenario: "courseware", icon: t.icon, title: `《${titleTopic}》${t.name}`, meta: `${s.grade || ""}${s.subject || ""}` };
      const note = {
        ppt: <span>已生成《{titleTopic}》<b style={{ color: "var(--brand-deep)" }}>传统课件</b>（{PPT_SLIDES.length} 页 · {s.style} 模板），对齐{s.subject}课标、参照权威教案。左侧大纲可逐页调整。</span>,
        interactive: <span>已生成<b style={{ color: "var(--brand-deep)" }}>互动课件</b>，包含 {s.acts.length} 个可课堂操作的环节，素材来自权威资源库。左侧可逐个试玩调整。</span>,
        beautify: <span>已完成<b style={{ color: "var(--brand-deep)" }}>课件美化</b>，对「{s.file}」全部 18 页做了{s.beautify.join("、")}{s.beautify.includes("智能配图") ? `（${s.imgStyle}）` : ""}。下方可逐页查看、放大对比，右上角下载。</span>,
      }[s.type];
      setMessages((m) => [...m, { role: "ai", artifact: art, node: note }]);
    }, 1100);
  }

  function useSample() {
    up({ file: "我的课件_整式的加减.pptx" });
  }

  const handleSend = (text, files) => {
    if (clarify) setClarify(null);
    setMessages((m) => [...m, { role: "user", text, files }, { role: "ai", typing: true }]);
    setTimeout(() => {
      const typeHit = /互动|游戏|拖拽|抢答|连线|闯关/.test(text) ? "interactive"
        : /美化|排版|配图|换图|插图/.test(text) ? "beautify"
        : /传统|ppt|幻灯|演示文稿|模板|风格/i.test(text) ? "ppt" : null;
      const nextType = typeHit || setup.type;
      const typeChanged = typeHit && typeHit !== setup.type;
      if (typeChanged) { up({ type: typeHit }); if (built) setBuilt(false); }

      // 上传型（美化 / 配图）：助手主动接收对话里上传的课件并直接处理
      if (cwType(nextType).kind === "upload") {
        const chatFile = files && files.length ? files[0] : null;
        const effFile = chatFile || setup.file; // 对话里传的 优先；否则用右侧已传的
        if (effFile) {
          const merged = { ...setup, type: nextType, file: effFile };
          up({ type: nextType, file: effFile });
          const actLabel = <span>正在<b style={{ color: "var(--brand-deep)" }}>美化</b>「{effFile}」（{merged.beautify.join("、")}）～</span>;
          setMessages((m) => [...m.slice(0, -1), { role: "ai", node: actLabel }]);
          doGenerate(merged);
          return;
        }
        // 没有课件 → 引导上传：对话框下方 或 右侧都行
        if (typeChanged) up({ type: nextType });
        setMessages((m) => [...m.slice(0, -1), { role: "ai", node: typeChanged
          ? <span>好的，转成<b style={{ color: "var(--brand-deep)" }}>课件美化</b>。把你已有的课件发我就行——<b>点输入框左下角的 📎</b> 传上来，或拖到右侧上传区，我马上开始美化。</span>
          : <span>好呀，把你要美化的课件发我——<b>点输入框左下角的 📎</b> 传上来，或拖到右侧上传区即可。</span> }]);
        return;
      }

      if (!built || typeChanged) {
        const g = CW_GRADES.find((x) => text.includes(x));
        const s = CW_SUBJECTS.find((x) => text.includes(x));
        const tp = (text.match(/《(.+?)》/) || [])[1];
        const patch = { type: nextType };
        if (g) patch.grade = g; if (s) patch.subject = s; if (tp) patch.topic = tp;
        const merged = { ...setup, ...patch };
        up(patch);
        const gaps = ["grade", "subject", "topic"].filter((k) => !merged[k]);
        const wantsMake = /做|生成|出|课件|帮我|开始/.test(text);
        // 信息齐全 → 直接开做，不再让用户去右侧二次点击
        if (gaps.length === 0) {
          setMessages((m) => [...m.slice(0, -1), { role: "ai", node: <span>信息齐了，<b style={{ color: "var(--brand-deep)" }}>这就为你生成</b> {[merged.grade, merged.subject, merged.topic && `《${merged.topic}》`].filter(Boolean).join(" · ")}{cwType(merged.type).name}～</span> }]);
          doGenerate(merged);
          return;
        }
        if (wantsMake) {
          setMessages((m) => [...m.slice(0, -1), { role: "ai", node: typeChanged
            ? <span>已切到<b style={{ color: "var(--brand-deep)" }}>{cwType(nextType).name}</b>。差一点信息就能开做——补一下：</span>
            : <span>好的，差一点信息就能开做——补一下：</span> }]);
          setClarify({ init: { grade: merged.grade || "", subject: merged.subject || "", topic: merged.topic || "" } });
          return;
        }
        setMessages((m) => [...m.slice(0, -1), { role: "ai", node: typeChanged
          ? <span>已切到<b style={{ color: "var(--brand-deep)" }}>{cwType(nextType).name}</b>。告诉我学段、学科和课题，我就直接开做～</span>
          : (Object.keys(patch).length > 1
            ? <span>已记下 {[patch.grade, patch.subject, patch.topic && `《${patch.topic}》`].filter(Boolean).join(" · ")}。再说一句<b>「开始做」</b>，或在右侧补全后我就开工～</span>
            : <span>好的，告诉我学段、学科和课题，我就直接开做；也可以在右侧选好类型再生成～</span>) }]);
        return;
      }

      const node = files && files.length
        ? <span>已结合你上传的素材更新课件内容。</span>
        : <span>已根据「{text}」更新课件，所有内容以权威教案为底座。</span>;
      setMessages((m) => [...m.slice(0, -1), { role: "ai", node }]);
    }, 700);
  };

  const resolveClarify = (vals) => {
    const merged = { ...setup, grade: vals.grade, subject: vals.subject, topic: vals.topic };
    setClarify(null);
    setMessages((m) => [...m, { role: "ai", answered: { q: "补齐课件信息", value: [vals.grade, vals.subject, `《${vals.topic}》`].filter(Boolean).join(" · ") } }, { role: "ai", node: <span>信息齐了！<b style={{ color: "var(--brand-deep)" }}>正在为你生成</b>～</span> }]);
    doGenerate(merged);
  };
  const skipClarify = () => { setClarify(null); setMessages((m) => [...m, { role: "ai", node: <span>没关系，你也可以直接在右侧填好再生成。</span> }]); };

  const { headerRecognizing, send } = useSmartSend({ scenarioId: scenario.id, onSwitch, setMessages, localSend: handleSend });

  const t = cwType(setup.type);
  const onTypeChange = (k) => {
    if (k === setup.type) return;
    up({ type: k });
    if (built) setBuilt(false);
    setEditing(false);
    setActive(0);
  };

  const typeBadge = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", background: `oklch(0.96 0.04 ${t.hue})`, color: `oklch(0.45 0.13 ${t.hue})`, border: `1px solid oklch(0.86 0.07 ${t.hue})`, fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-zh)" }}>
      <Icon name={t.icon} size={13} /> {t.name}
    </span>
  );

  const dlLabel = setup.type === "interactive" ? "已导出可交互 HTML" : "已下载课件 PPTX";

  let body;
  if (!built || editing) {
    body = (
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <CwTypeTabs value={setup.type} onChange={onTypeChange} mobile={mobile} />
        <CwSetupPanel setup={setup} up={up} loggedIn={loggedIn} onLogin={() => (nav && nav.onRequireLogin ? nav.onRequireLogin() : null)} onGenerate={doGenerate} onUseSample={useSample} mobile={mobile} editing={editing && built} />
      </div>
    );
  } else if (generating) {
    body = (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 30, background: "var(--canvas)" }}>
          <div style={{ textAlign: "center", color: "var(--ink-3)" }}>
            <div style={{ display: "inline-flex", marginBottom: 12 }}><BotAvatar size={42} glow /></div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)", display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name={t.icon} size={15} /> 正在参照权威教案生成{t.name} <Dots /></div>
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
        <CwBuiltToolbar setup={setup} mobile={mobile} onBack={() => setEditing(true)} onDownload={() => showToast(dlLabel)} />
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: mobile ? "column" : "row" }}>
          <CwStageBody setup={setup} active={active} setActive={setActive} mobile={mobile} onToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell
      scenario={scenario}
      onHome={onHome}
      onSwitch={onSwitch}
      nav={nav}
      headerRecognizing={headerRecognizing}
      mobilePanelLabel="课件"
      mobilePanelIcon="slides"
      openSheetKey={(built && !editing) ? "cw" + setup.type : "setup" + setup.type}
      titleMeta={typeBadge}
    >
      <ChatPanel
        messages={messages}
        onSend={send}
        suggestions={sugs}
        placeholder={built ? "例如：突出情境导入 / 改成互动课件" : "也可以直接告诉我课件需求…"}
        clarify={clarify}
        onResolveClarify={resolveClarify}
        onSkipClarify={skipClarify}
        clarifyNode={clarify ? <CwClarify init={clarify.init} onResolve={resolveClarify} onSkip={skipClarify} /> : null}
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative", background: "var(--canvas)" }}>
        {body}
        {toast && (
          <div className="enter-pop" style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--surface)", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "0 12px 30px -12px rgba(0,0,0,.5)", display: "inline-flex", alignItems: "center", gap: 8, zIndex: 30 }}>
            <Icon name="check" size={16} sw={2.6} /> {toast}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

// ============================================================
// 生成后内容舞台（按类型分流）
// ============================================================
function CwStageBody({ setup, active, setActive, mobile, onToast }) {
  const type = setup.type;
  if (type === "beautify") return <BeautifyStage setup={setup} onToast={onToast} mobile={mobile} />;

  const isInteractive = type === "interactive";
  const acts = isInteractive ? (setup.acts.length ? setup.acts : ["点选揭示"]) : null;
  const list = isInteractive ? acts.map((k) => ({ t: k, type: k, ...actDef(k) })) : PPT_SLIDES;
  const tplHue = type === "ppt" ? styleHue(setup.style) : null;

  return (
    <React.Fragment>
      <div style={{ width: mobile ? "100%" : 178, flexShrink: 0, borderRight: mobile ? "none" : "1px solid var(--line)", borderBottom: mobile ? "1px solid var(--line)" : "none", background: "var(--surface)", overflowY: mobile ? "hidden" : "auto", overflowX: mobile ? "auto" : "hidden", display: mobile ? "flex" : "block", gap: mobile ? 6 : 0, padding: 10 }}>
        {list.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ width: mobile ? "auto" : "100%", flexShrink: mobile ? 0 : 1, textAlign: "left", display: "flex", gap: 9, padding: "9px 10px", borderRadius: 10, marginBottom: mobile ? 0 : 5, cursor: "pointer", border: mobile ? "1px solid var(--line)" : "none", fontFamily: "var(--font-zh)", background: active === i ? "var(--brand-soft)" : mobile ? "var(--surface)" : "transparent", whiteSpace: mobile ? "nowrap" : "normal" }}>
            <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, background: active === i ? "var(--brand)" : "var(--line)", color: active === i ? "#fff" : "var(--ink-3)", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)" }}>{i + 1}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: active === i ? "var(--brand-deep)" : "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.t}</span>
              {isInteractive && <span style={{ display: "block", fontSize: 10.5, color: `oklch(0.55 0.12 ${s.hue})`, fontWeight: 700, marginTop: 1 }}>互动</span>}
            </span>
          </button>
        ))}
        <button onClick={() => onToast("已新增，可继续编辑")} style={{ width: mobile ? "auto" : "100%", flexShrink: mobile ? 0 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: mobile ? "9px 14px" : "8px", borderRadius: 10, border: "1px dashed var(--line)", background: "transparent", color: "var(--ink-3)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-zh)", marginTop: mobile ? 0 : 4, whiteSpace: "nowrap" }}>
          <Icon name="plus" size={14} /> {isInteractive ? "加互动" : "加一页"}
        </button>
      </div>

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", padding: "24px clamp(18px, 5%, 48px)", display: "grid", placeItems: "start center" }}>
        {isInteractive
          ? <InteractiveStage block={list[active]} idx={active} topic={setup.topic} onToast={onToast} />
          : <PptStage slide={PPT_SLIDES[active]} idx={active} topic={setup.topic || "课题"} tplHue={tplHue} onToast={onToast} />}
      </div>
    </React.Fragment>
  );
}

// ---- 传统课件页预览（16:9，可放大）----
function SlideCard({ slide, idx, topic, tplHue, total }) {
  const accent = tplHue != null ? `oklch(0.6 0.14 ${tplHue})` : "var(--brand)";
  const accentDeep = tplHue != null ? `oklch(0.48 0.15 ${tplHue})` : "var(--brand-deep)";
  const soft = tplHue != null ? `oklch(0.95 0.04 ${tplHue})` : "var(--brand-soft)";
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", background: "#fff", borderRadius: 14, border: "1px solid var(--line)", boxShadow: "0 18px 50px -28px rgba(0,0,0,.4)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 8, background: `linear-gradient(90deg, ${accent}, ${accentDeep})`, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "30px 36px", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {slide.kind === "cover" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 14 }}>
            <div style={{ fontSize: "clamp(20px, 5cqw, 30px)", fontWeight: 900, color: "#1f2430" }}>{topic}</div>
            <div style={{ fontSize: 14, color: "#6a7180", letterSpacing: 2 }}>教学课件 · 第一课时</div>
            <div style={{ marginTop: 8, width: 54, height: 4, borderRadius: 2, background: accent }} />
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 6, height: 26, borderRadius: 3, background: accent }} />
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
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: soft, color: accentDeep, fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-num)" }}>{k + 1}</span>
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
      <div style={{ position: "absolute", bottom: 12, right: 18, fontSize: 11, color: "#aab2c0", fontWeight: 600 }}>{topic} · {idx + 1} / {total}</div>
    </div>
  );
}

function PptStage({ slide, idx, topic, tplHue, onToast }) {
  const [zoom, setZoom] = cwS(false);
  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      <div key={idx} className="block-pop" style={{ position: "relative", cursor: "zoom-in" }} onClick={() => setZoom(true)}>
        <SlideCard slide={slide} idx={idx} topic={topic} tplHue={tplHue} total={PPT_SLIDES.length} />
        <span style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 9, background: "rgba(20,24,34,.62)", color: "#fff", display: "grid", placeItems: "center", pointerEvents: "none" }}><Icon name="enterFull" size={15} /></span>
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>第 {idx + 1} 页 · {slide.t}</span>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{slide.sub}</span>
        <div style={{ flex: 1, minWidth: 8 }} />
        <Btn size="sm" kind="soft" icon="refresh" onClick={() => onToast("已重写本页")}>重写本页</Btn>
        <Btn size="sm" kind="ghost" icon="image" onClick={() => onToast("已为本页配图")}>配图</Btn>
      </div>
      {zoom && <CwLightbox onClose={() => setZoom(false)} title={`第 ${idx + 1} 页 · ${slide.t}`}>
        <div style={{ width: "min(92vw, 1100px)" }}><SlideCard slide={slide} idx={idx} topic={topic} tplHue={tplHue} total={PPT_SLIDES.length} /></div>
      </CwLightbox>}
    </div>
  );
}

// ---- 互动课件预览（真实可玩）----
function InteractiveStage({ block, idx, topic, onToast }) {
  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
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
        <Btn size="sm" kind="soft" icon="refresh" onClick={() => onToast("已换个玩法")}>换个玩法</Btn>
        <Btn size="sm" kind="ghost" icon="spark" onClick={() => onToast("已更新题目")}>改题目</Btn>
      </div>
    </div>
  );
}

function InteractiveDemo({ demo, hue, onToast }) {
  const [tapped, setTapped] = cwS(false);
  const [picked, setPicked] = cwS(null);
  const [bin, setBin] = cwS({ A: [], B: [] });
  const [dragging, setDragging] = cwS(null);

  if (demo === "tap") {
    return (
      <div onClick={() => setTapped((t) => !t)} style={{ cursor: "pointer", textAlign: "center" }}>
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
          {pairs.map((p, i) => <div key={i} onClick={() => setPicked(i)} style={{ padding: "9px 16px", borderRadius: 10, background: picked === i ? `oklch(0.6 0.14 ${hue})` : "#fff", color: picked === i ? "#fff" : "var(--ink)", border: `1px solid oklch(0.8 0.08 ${hue})`, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{p[0]}</div>)}
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

// ---- 通用放大灯箱 ----
function CwLightbox({ children, onClose, title, foot }) {
  cwE(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="enter-pop" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(16,20,28,.72)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-zh)" }}>
        {title && <span>{title}</span>}
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.12)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="close" size={18} /></button>
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{ maxHeight: "82vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {children}
        {foot}
      </div>
    </div>
  );
}

// ---- 简易配图插画（CSS/SVG 模拟「智能配图」效果，按风格变化）----
function CwArt({ style, w = "100%", h = "100%", radius = 10 }) {
  const sketch = style === "手绘风";
  const board = style === "简笔板书";
  const photo = style === "实景照片";
  const d3 = style === "3D 渲染";
  const sw = board ? 2.4 : sketch ? 2.2 : 1.8;
  const bg = board ? "#22302a" : photo ? "linear-gradient(160deg,#cfe8ff,#fdf3c4)" : d3 ? "linear-gradient(160deg,#eef2ff,#fce7f3)" : "#eef8f0";
  const ink = board ? "#eafff3" : "#2c3a33";
  const leafFill = board ? "none" : "#5bbf7a";
  const sunFill = board ? "none" : "#ffd35b";
  const dash = sketch ? "3 3" : "none";
  return (
    <div style={{ width: w, height: h, borderRadius: radius, overflow: "hidden", background: bg, border: photo || board ? "none" : "1px solid rgba(0,0,0,.05)", position: "relative", display: "grid", placeItems: "center", padding: "8%", boxShadow: d3 ? "inset 0 -10px 24px -12px rgba(80,40,120,.25)" : "none" }}>
      <svg viewBox="0 0 120 80" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        <g stroke={board ? ink : "#f0b429"} strokeWidth={sw} strokeLinecap="round" fill={sunFill} fillOpacity={board ? 0 : 1}>
          <circle cx="26" cy="22" r="9" strokeDasharray={dash} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return <line key={a} x1={26 + Math.cos(r) * 13} y1={22 + Math.sin(r) * 13} x2={26 + Math.cos(r) * 17} y2={22 + Math.sin(r) * 17} />; })}
        </g>
        <g stroke={board ? ink : "#3f9c5e"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={board ? "none" : leafFill} fillOpacity={board ? 0 : 0.92}>
          <path d="M70 70 C70 52 70 44 70 38" fill="none" />
          <path d="M70 44 C58 40 50 30 56 22 C66 24 74 34 70 44 Z" strokeDasharray={dash} />
          <path d="M70 50 C82 46 92 36 86 28 C76 30 68 40 70 50 Z" strokeDasharray={dash} />
          <line x1="70" y1="70" x2="98" y2="70" />
        </g>
        <g stroke={board ? ink : "#6b7785"} strokeWidth={sw} strokeLinecap="round" fill="none">
          <path d="M40 60 H58" strokeDasharray={dash} />
          <path d="M54 56 L58 60 L54 64" />
          <path d="M100 38 H86" strokeDasharray={dash} />
          <path d="M90 34 L86 38 L90 42" />
        </g>
        <text x="33" y="57" fontSize="6.5" fill={ink} fontWeight="700">CO₂</text>
        <text x="98" y="35" fontSize="6.5" fill={ink} fontWeight="700">O₂</text>
      </svg>
      {photo && <span style={{ position: "absolute", bottom: 5, right: 7, fontSize: 9, color: "rgba(40,50,45,.55)", fontWeight: 700 }}>实景</span>}
    </div>
  );
}

// ---- 课件美化：前后对比（模拟真实美化效果）----
const BEAUTIFY_PAGES = ["封面", "情境导入", "概念辨析", "例题精讲", "变式训练", "易错提醒", "课堂练习", "归纳小结", "分层作业", "拓展阅读", "知识结构", "课后反思", "重点回顾", "图示讲解", "公式推导", "互动问答", "实景应用", "结课页"];
const BEAUTIFY_DECK = {
  "封面": { kind: "cover", title: "整式的加减", sub: "人教版 · 七年级上册 · 第二章" },
  "情境导入": { kind: "bullets", img: true, bullets: ["买 3 支铅笔、5 本笔记本，总价怎么表示？", "设铅笔 x 元、笔记本 y 元", "总价 = 3x + 5y", "含字母的式子 —— 整式"] },
  "概念辨析": { kind: "bullets", img: true, bullets: ["单项式：数与字母的乘积，如 3x、−2a²b", "多项式：几个单项式的和，如 2x + 1", "系数与次数的判断方法", "整式 = 单项式 + 多项式"] },
  "例题精讲": { kind: "bullets", img: true, bullets: ["例：合并同类项 3x + 2x − x", "第一步：找出同类项", "第二步：系数相加，字母不变", "结果 = 4x"] },
};
const BEAUTIFY_FALLBACK = (t) => ({ kind: "bullets", img: true, bullets: [`${t}的核心要点梳理`, "结合教材例题逐步讲解", "归纳方法，强化记忆", "随堂巩固，及时反馈"] });
const beautyContent = (title) => BEAUTIFY_DECK[title] || BEAUTIFY_FALLBACK(title);

function BeautyMini({ title, after, big, withImg = true, imgStyle = "扁平插画" }) {
  const c = beautyContent(title);
  const titleFs = big ? 19 : 11;
  const bodyFs = big ? 12.5 : 7;
  const lines = c.bullets ? (big ? c.bullets : c.bullets.slice(0, 2)) : [];
  if (c.kind === "cover") {
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: big ? 14 : 10, border: "1px solid var(--line)", overflow: "hidden", background: "#fff", position: "relative", display: "flex", flexDirection: "column", boxShadow: after ? (big ? "0 18px 50px -26px rgba(0,0,0,.45)" : "0 8px 20px -14px rgba(0,0,0,.3)") : "none" }}>
        {after ? (
          <React.Fragment>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--brand), oklch(0.5 0.13 262))" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "#fff", gap: big ? 12 : 5, padding: 12 }}>
              <div style={{ fontSize: big ? 34 : 14, fontWeight: 900, letterSpacing: 1 }}>{c.title}</div>
              <div style={{ width: big ? 48 : 24, height: big ? 4 : 2.5, borderRadius: 2, background: "rgba(255,255,255,.9)" }} />
              <div style={{ fontSize: big ? 13 : 7, fontWeight: 600, opacity: 0.92 }}>{c.sub}</div>
            </div>
          </React.Fragment>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: big ? 10 : 5, padding: 12, background: "#fff" }}>
            <div style={{ fontSize: big ? 26 : 12, fontWeight: 700, color: "#222", fontFamily: "serif" }}>{c.title}</div>
            <div style={{ fontSize: big ? 12 : 7, color: "#777", fontFamily: "serif" }}>{c.sub}</div>
            <div style={{ marginTop: big ? 8 : 3, fontSize: big ? 11 : 6.5, color: "#999", fontFamily: "serif" }}>授课人：_______</div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: big ? 14 : 10, border: "1px solid var(--line)", overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column", position: "relative", boxShadow: after ? (big ? "0 18px 50px -26px rgba(0,0,0,.45)" : "0 8px 20px -14px rgba(0,0,0,.3)") : "none" }}>
      {after && <div style={{ height: big ? 7 : 4, background: "linear-gradient(90deg, var(--brand), var(--brand-deep))", flexShrink: 0 }} />}
      <div style={{ flex: 1, padding: big ? "20px 24px" : "9px 11px", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: big ? 8 : 4, marginBottom: big ? 14 : 6 }}>
          {after && <div style={{ width: big ? 5 : 3, height: titleFs, borderRadius: 3, background: "var(--brand)", flexShrink: 0 }} />}
          <div style={{ fontSize: titleFs, fontWeight: after ? 800 : 700, color: after ? "#1f2430" : "#3a3a3a", fontFamily: after ? "var(--font-zh)" : "serif", textAlign: after ? "left" : "center", width: after ? "auto" : "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: after && c.img && withImg ? "1.25fr 1fr" : "1fr", gap: big ? 14 : 7, minHeight: 0, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: big ? 9 : 3, justifyContent: "center" }}>
            {lines.map((b, k) => (
              <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: big ? 8 : 4 }}>
                {after
                  ? <span style={{ width: big ? 16 : 9, height: big ? 16 : 9, borderRadius: big ? 5 : 3, background: "var(--brand-soft)", color: "var(--brand-deep)", fontSize: big ? 9.5 : 5.5, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1, fontFamily: "var(--font-num)" }}>{k + 1}</span>
                  : <span style={{ color: "#555", fontSize: bodyFs, flexShrink: 0, lineHeight: 1.3 }}>•</span>}
                <span style={{ fontSize: bodyFs, lineHeight: 1.4, color: after ? "#39414d" : "#444", fontFamily: after ? "var(--font-zh)" : "serif", fontWeight: after ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: big ? "normal" : "nowrap" }}>{b}</span>
              </div>
            ))}
          </div>
          {after && c.img && withImg && <CwArt style={imgStyle} radius={big ? 10 : 6} />}
        </div>
      </div>
      {after && <div style={{ position: "absolute", bottom: big ? 9 : 5, right: big ? 14 : 8, fontSize: big ? 10 : 6, color: "#b3bcc8", fontWeight: 700, fontFamily: "var(--font-num)" }}>整式的加减</div>}
    </div>
  );
}
function BeautifyStage({ setup, onToast, mobile }) {
  const items = setup.beautify.length ? setup.beautify : ["统一配色", "排版优化", "智能配图"];
  const withImg = items.includes("智能配图");
  const imgStyle = setup.imgStyle;
  const [zoom, setZoom] = cwS(null); // page index
  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", padding: "22px clamp(18px,5%,48px)", background: "var(--canvas)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* 当前页前后对比 */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16, alignItems: "start", marginBottom: 22 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 9 }}>美化前</div>
            <BeautyMini title={BEAUTIFY_PAGES[0]} after={false} big withImg={withImg} imgStyle={imgStyle} />
          </div>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: "var(--brand-soft)", border: "1px solid var(--brand-soft-border)", fontSize: 11.5, fontWeight: 800, color: "var(--brand-deep)", marginBottom: 9 }}><Icon name="wand" size={12} /> 美化后{withImg ? ` · ${imgStyle}` : ""}</div>
            <BeautyMini title={BEAUTIFY_PAGES[0]} after={true} big withImg={withImg} imgStyle={imgStyle} />
          </div>
        </div>

        {/* 全部页面 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>全部页面</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>共 {BEAUTIFY_PAGES.length} 页 · 点击放大对比</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
          {BEAUTIFY_PAGES.map((p, i) => (
            <div key={i} onClick={() => setZoom(i)} style={{ cursor: "zoom-in", position: "relative" }}>
              <BeautyMini title={p} after withImg={withImg} imgStyle={imgStyle} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: 6, pointerEvents: "none" }}>
                <span style={{ width: 19, height: 19, borderRadius: 6, background: "rgba(20,24,34,.6)", color: "#fff", fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center", fontFamily: "var(--font-num)" }}>{i + 1}</span>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(20,24,34,.55)", color: "#fff", display: "grid", placeItems: "center" }}><Icon name="enterFull" size={12} /></span>
              </div>
            </div>
          ))}
        </div>

        {/* 已应用的美化 */}
        <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", marginBottom: 11 }}>已应用的美化（共 {items.length} 项）</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="check" size={13} sw={2.6} /></span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{it}</span>
                <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>· 已应用到全部 {BEAUTIFY_PAGES.length} 页</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Btn size="sm" kind="soft" icon="refresh" onClick={() => onToast("已换一套配色")}>换一套配色</Btn>
          {withImg && <Btn size="sm" kind="ghost" icon="image" onClick={() => onToast("已重新生成配图")}>重新配图</Btn>}
        </div>
      </div>

      {zoom !== null && (
        <CwLightbox onClose={() => setZoom(null)} title={`第 ${zoom + 1} 页 · ${BEAUTIFY_PAGES[zoom]} · 美化对比`}
          foot={
            <div style={{ display: "inline-flex", gap: 8 }}>
              <button onClick={() => setZoom((z) => (z + BEAUTIFY_PAGES.length - 1) % BEAUTIFY_PAGES.length)} style={lbBtn}><Icon name="chevronLeft" size={16} /> 上一页</button>
              <button onClick={() => setZoom((z) => (z + 1) % BEAUTIFY_PAGES.length)} style={lbBtn}>下一页 <Icon name="chevronRight" size={16} /></button>
            </div>
          }>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16, width: "min(94vw, 1080px)" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>美化前</div>
              <BeautyMini title={BEAUTIFY_PAGES[zoom]} after={false} big />
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, marginBottom: 7, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="wand" size={12} /> 美化后{withImg ? ` · ${imgStyle}` : ""}</div>
              <BeautyMini title={BEAUTIFY_PAGES[zoom]} after={true} big withImg={withImg} imgStyle={imgStyle} />
            </div>
          </div>
        </CwLightbox>
      )}
    </div>
  );
}
const lbBtn = { display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 15px", borderRadius: 10, border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-zh)" };

Object.assign(window, { CoursewareWorkspace });

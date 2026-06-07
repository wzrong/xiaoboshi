// icons.jsx — minimal line icons (simple geometric shapes only)
// Each takes { size, stroke } and renders on currentColor.

function Icon({ name, size = 24, sw = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const paths = {
    search: (
      <g>
        <circle cx="11" cy="11" r="6.5" />
        <line x1="20" y1="20" x2="16" y2="16" />
      </g>
    ),
    paper: (
      <g>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="8.5" y1="8" x2="15.5" y2="8" />
        <line x1="8.5" y1="12" x2="15.5" y2="12" />
        <line x1="8.5" y1="16" x2="12.5" y2="16" />
      </g>
    ),
    slides: (
      <g>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <line x1="9" y1="21" x2="15" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </g>
    ),
    lesson: (
      <g>
        <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />
        <line x1="8.5" y1="9" x2="13.5" y2="9" />
        <line x1="8.5" y1="13" x2="12" y2="13" />
      </g>
    ),
    book: (
      <g>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" />
        <line x1="4" y1="20.5" x2="20" y2="20.5" />
        <line x1="12" y1="3" x2="12" y2="18" />
      </g>
    ),
    mindmap: (
      <g>
        <circle cx="5" cy="12" r="2.4" />
        <circle cx="19" cy="6" r="2.2" />
        <circle cx="19" cy="18" r="2.2" />
        <path d="M7.3 11l9.5-4M7.3 13l9.5 4" />
      </g>
    ),
    interactive: (
      <g>
        <path d="M8 8l9 3.5-3.8 1.4L12 17z" />
        <path d="M5 4.5l1 1M5 11.5l1-1M11.5 5l-1 1" />
      </g>
    ),
    send: (
      <g>
        <path d="M4 12l16-7-7 16-2.2-6.5L4 12z" />
      </g>
    ),
    spark: (
      <g>
        <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
      </g>
    ),
    shield: (
      <g>
        <path d="M12 3l7 2.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5L12 3z" />
        <path d="M9 12l2 2 4-4" />
      </g>
    ),
    check: (
      <g>
        <path d="M5 12.5l4 4 10-10" />
      </g>
    ),
    download: (
      <g>
        <line x1="12" y1="4" x2="12" y2="15" />
        <path d="M8 11l4 4 4-4" />
        <line x1="5" y1="20" x2="19" y2="20" />
      </g>
    ),
    arrow: (
      <g>
        <line x1="5" y1="12" x2="19" y2="12" />
        <path d="M13 6l6 6-6 6" />
      </g>
    ),
    back: (
      <g>
        <line x1="19" y1="12" x2="5" y2="12" />
        <path d="M11 6l-6 6 6 6" />
      </g>
    ),
    filter: (
      <g>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </g>
    ),
    home: (
      <g>
        <path d="M4 11.5L12 4l8 7.5" />
        <path d="M6 10v9.5h12V10" />
      </g>
    ),
    chevron: (
      <g>
        <path d="M6 9l6 6 6-6" />
      </g>
    ),
    plus: (
      <g>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </g>
    ),
    minus: (
      <g>
        <line x1="5" y1="12" x2="19" y2="12" />
      </g>
    ),
    quote: (
      <g>
        <path d="M7 7h4v4c0 2-1.5 3.5-3.5 4M14 7h4v4c0 2-1.5 3.5-3.5 4" />
      </g>
    ),
    refresh: (
      <g>
        <path d="M19 8a7 7 0 1 0 1.5 6" />
        <path d="M20 4v4h-4" />
      </g>
    ),
    layers: (
      <g>
        <path d="M12 4l8 4-8 4-8-4 8-4z" />
        <path d="M4 12l8 4 8-4M4 16l8 4 8-4" />
      </g>
    ),
    chat: (
      <g>
        <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3V6a1 1 0 0 1 1-1z" />
      </g>
    ),
    history: (
      <g>
        <path d="M5 12a7 7 0 1 1 2 5" />
        <path d="M5 17v-4h4" />
        <path d="M12 8v4l3 2" />
      </g>
    ),
    close: (
      <g>
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </g>
    ),
    grid: (
      <g>
        <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
      </g>
    ),
    clip: (
      <g>
        <path d="M20 11.5l-7.6 7.6a4 4 0 0 1-5.7-5.7l8-8a2.6 2.6 0 0 1 3.7 3.7l-7.8 7.8a1.2 1.2 0 0 1-1.7-1.7l7-7" />
      </g>
    ),
    eye: (
      <g>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </g>
    ),
    file: (
      <g>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v4h4" />
      </g>
    ),
    sparkArrow: (
      <g>
        <path d="M5 12h11" />
        <path d="M12 7l5 5-5 5" />
        <path d="M5 5l1.2 1.2M5 19l1.2-1.2" />
      </g>
    ),
    sidebar: (
      <g>
        <rect x="3.5" y="5" width="17" height="14" rx="2.2" />
        <line x1="9.5" y1="5" x2="9.5" y2="19" />
      </g>
    ),
    menu: (
      <g>
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </g>
    ),
    basket: (
      <g>
        <path d="M5 9h14l-1.2 9.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9z" />
        <path d="M9 9l1.5-5M15 9l-1.5-5" />
        <line x1="3.5" y1="9" x2="20.5" y2="9" />
      </g>
    ),
    trash: (
      <g>
        <path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" />
      </g>
    ),
    login: (
      <g>
        <path d="M14 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
        <path d="M4 12h11M11 8l4 4-4 4" />
      </g>
    ),
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

window.Icon = Icon;

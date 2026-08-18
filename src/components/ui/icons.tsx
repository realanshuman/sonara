import type { SVGProps } from "react";

/**
 * Sonara icon set — drawn to match the mark: 24-grid, stroked at 1.8,
 * round caps and joins. Icons inherit currentColor.
 */
function base(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 18, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export const IconToday = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8 3v3M16 3v3M7.5 13.5h4M7.5 17h6.5" />
  </svg>
);

export const IconPatients = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3.5 20c.5-3.6 2.8-5.6 5.5-5.6s5 2 5.5 5.6" />
    <path d="M15.5 5.2a3.1 3.1 0 0 1 0 5.7M17.6 14.9c1.7.8 2.7 2.6 2.9 5.1" />
  </svg>
);

export const IconNote = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 3.5h9.5L20 8v12.5H6z" />
    <path d="M15 3.5V8.5H20M9 12.5h6M9 16h6" />
  </svg>
);

export const IconRx = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 4.5h5a3.5 3.5 0 0 1 0 7H7zM7 4.5v15M9.5 11.5 18 20M18 13.5l-6 6.5" />
  </svg>
);

export const IconAudit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5 20 6.5v5.5c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V6.5z" />
    <path d="m8.8 11.8 2.3 2.3 4.2-4.4" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9" />
    <circle cx="15" cy="7.5" r="2.2" />
    <circle cx="9" cy="16.5" r="2.2" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

export const IconMic = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="3.5" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
  </svg>
);

export const IconMicOff = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 5.5a3 3 0 0 1 6 0v5.5M9 9.7v1.8a3 3 0 0 0 4.6 2.5" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 9.8 5.6M18.5 11.5a6.4 6.4 0 0 1-.7 2.9M12 18v3M9 21h6M4 4l16 16" />
  </svg>
);

export const IconStop = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.8" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 5.5v13M15 5.5v13" strokeWidth={2.4} />
  </svg>
);

export const IconPlay = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5.5 18 12 8 18.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
  </svg>
);

export const IconWarn = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.8 21.5 20H2.5z" />
    <path d="M12 9.5v4.5M12 17.2v.2" strokeWidth={2.1} />
  </svg>
);

export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 7.8v.2" strokeWidth={2.1} />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.2l3.4 2" />
  </svg>
);

export const IconPrint = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 8V3.5h10V8M7 17.5H4.5V9.5a1.5 1.5 0 0 1 1.5-1.5h12a1.5 1.5 0 0 1 1.5 1.5v8H17" />
    <rect x="7" y="14.5" width="10" height="6" rx="1" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4.5 7.5 7.5 6 7.5-6" />
  </svg>
);

export const IconSend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-7-3.5z" />
  </svg>
);

export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5V15M7.5 11 12 15.5 16.5 11M4.5 19.5h15" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconPen = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4 20 .9-3.8L16.4 4.7a1.6 1.6 0 0 1 2.3 0l.6.6a1.6 1.6 0 0 1 0 2.3L7.8 19.1z" />
    <path d="m14.8 6.3 2.9 2.9" />
  </svg>
);

export const IconSign = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 19.5c2.6 0 3.2-6 5-6s1 3.6 2.6 3.6 1.7-2 3-2 1.3 1.6 2.6 1.6c1 0 1.5-.6 3.8-.6" />
    <path d="M13.2 12 18.6 3.9a1.5 1.5 0 0 1 2.5 1.6L16 13.6l-3.4 1z" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v1.8" />
  </svg>
);

export const IconWifiOff = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 8.5A14.5 14.5 0 0 1 12 5c1.3 0 2.6.17 3.8.5M18.8 7.1a14.6 14.6 0 0 1 2.7 1.9M5.8 12.2A9.6 9.6 0 0 1 12 10h.6M14.9 10.5c1.4.4 2.7 1.2 3.6 2.2M9 15.7a5 5 0 0 1 5.4-.7M12 19.5v.2" strokeWidth={2} />
    <path d="M3.5 3.5l17 17" />
  </svg>
);

export const IconWifi = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 8.5A14.5 14.5 0 0 1 21.5 8.5M5.8 12.2a9.6 9.6 0 0 1 12.4 0M9 15.7a5 5 0 0 1 6 0M12 19.5v.2" strokeWidth={2} />
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 12a7.5 7.5 0 0 1 13-5.2M19.5 12a7.5 7.5 0 0 1-13 5.2" />
    <path d="M17.5 3v4h-4M6.5 21v-4h4" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h16M13.5 5.5 20 12l-6.5 6.5" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m14.5 6-6 6 6 6" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15M9.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6M6.5 6.5l.8 13a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-13M10 10.5v6M14 10.5v6" />
  </svg>
);

export const IconSwap = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5M20 16H7M10.5 12.5 7 16l3.5 3.5" />
  </svg>
);

export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4.5h4l1.5 4L8 10.5a12 12 0 0 0 5.5 5.5l2-2.5 4 1.5v4a1.5 1.5 0 0 1-1.6 1.5C10 19.8 4.2 14 3.5 6.1A1.5 1.5 0 0 1 5 4.5z" />
  </svg>
);

export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

export const IconFlag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5.5 21V4.2M5.5 4.5c4-2 8 2 12.5 0v9c-4.5 2-8.5-2-12.5 0" />
  </svg>
);

export const IconEye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconFilter = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const IconMore = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 12h.2M12 12h.2M18 12h.2" strokeWidth={2.6} />
  </svg>
);

export const IconWhatsApp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1A8 8 0 1 0 12 4z" />
    <path d="M9.3 9.2c.6 2.6 2.6 4.7 5.3 5.4l.8-1.6-2-1-.8.8a5.4 5.4 0 0 1-1.6-1.7l.7-.8-1-1.9z" strokeWidth={1.4} />
  </svg>
);

export const IconUser = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8.2" r="3.7" />
    <path d="M4.8 20.5c.7-4 3.6-6.2 7.2-6.2s6.5 2.2 7.2 6.2" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H14M10.5 12h10M17 8.5l3.5 3.5L17 15.5" />
  </svg>
);

export const IconExport = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 14V3.5M7.5 7.5 12 3l4.5 4.5M4.5 13v6.5h15V13" />
  </svg>
);

export const IconLanguage = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 5.5h9M8 3.5v2M10.8 5.5C10 9.5 7.2 12.6 3.8 14M5.8 9.2c1.3 2.6 3.7 4.4 6.2 5" />
    <path d="m12.5 20.5 4-10 4 10M13.9 17h5.2" />
  </svg>
);

export const IconWave = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12h3l2-4.5L11 17l3-8 1.8 3.5L17.5 11H21" />
  </svg>
);

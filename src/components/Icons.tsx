import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHistory = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 10a6.5 6.5 0 1 0 1.9-4.6" />
    <path d="M3.5 3.5v3h3" />
    <path d="M10 6.5V10l2.5 1.5" />
  </Base>
);
export const IconPrinter = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.5 7.5v-4h9v4" />
    <rect x="3" y="7.5" width="14" height="7" rx="1.5" />
    <path d="M6 12.5h8v4H6z" />
  </Base>
);
export const IconChevron = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 8 4 4 4-4" />
  </Base>
);
export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 4.5v11M4.5 10h11" />
  </Base>
);
export const IconCopy = (p: IconProps) => (
  <Base {...p}>
    <rect x="7" y="7" width="9" height="9" rx="1.5" />
    <path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" />
  </Base>
);
export const IconTrash = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6" />
  </Base>
);
export const IconArrowUp = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 15V5M5.5 9.5 10 5l4.5 4.5" />
  </Base>
);
export const IconArrowDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 5v10M5.5 10.5 10 15l4.5-4.5" />
  </Base>
);
export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5" />
  </Base>
);
export const IconGrip = (p: IconProps) => (
  <Base {...p} strokeWidth={2.2}>
    <path d="M7.5 5.5h.01M12.5 5.5h.01M7.5 10h.01M12.5 10h.01M7.5 14.5h.01M12.5 14.5h.01" />
  </Base>
);
export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
  </Base>
);
export const IconDownload = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 3.5v9M6 9l4 4 4-4M4 16.5h12" />
  </Base>
);
export const IconUpload = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 13V4M6 7.5l4-4 4 4M4 16.5h12" />
  </Base>
);
export const IconReset = (p: IconProps) => (
  <Base {...p}>
    <path d="M16.5 10A6.5 6.5 0 1 1 14.6 5.4" />
    <path d="M16.5 3.5v3h-3" />
  </Base>
);
export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </Base>
);
export const IconImage = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="14" height="12" rx="1.5" />
    <circle cx="7.5" cy="8.5" r="1.25" />
    <path d="m3.5 14 4-3.5 3 2.5 2.5-2 3.5 3" />
  </Base>
);
export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="9" r="5" />
    <path d="m13 13 3.5 3.5" />
  </Base>
);

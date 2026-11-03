// ============= Full file contents =============

/**
 * Flat pop-art food illustration, drawn in code. No photos, no gradients on food.
 * Base drawing width is 250 units; layers are rendered bottom-to-top by the stack.
 */

const INK = "#111111";
const BUN = "#F5A83C";
const BUN_DARK = "#E08E24";
const SEED = "#FFF3D6";

interface ArtProps {
  className?: string;
}

function Frame({
  h,
  children,
  className,
}: {
  h: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 250 ${h}`}
      className={className}
      style={{ display: "block" }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function BottomBun({ className }: ArtProps) {
  return (
    <Frame h={42} className={className}>
      <path
        d="M12 2 H238 V16 Q238 40 206 40 H44 Q12 40 12 16 Z"
        fill={BUN}
        stroke={INK}
        strokeWidth="2.5"
      />
      <path d="M20 8 H230 V13 H20 Z" fill={BUN_DARK} opacity="0.45" />
      <path d="M30 20 Q125 30 220 20" stroke={BUN_DARK} strokeWidth="3" fill="none" opacity="0.5" />
    </Frame>
  );
}

function TopBun({ className }: ArtProps) {
  const seeds: Array<[number, number, number]> = [
    [70, 26, -20],
    [110, 18, 10],
    [150, 24, -8],
    [185, 30, 18],
    [48, 34, 12],
    [125, 38, -14],
    [210, 40, 8],
    [90, 40, 22],
  ];
  return (
    <Frame h={58} className={className}>
      <path
        d="M12 56 V32 Q12 4 125 4 Q238 4 238 32 V56 Z"
        fill={BUN}
        stroke={INK}
        strokeWidth="2.5"
      />
      <rect x="12" y="50" width="226" height="6" fill={BUN_DARK} opacity="0.6" />
      {seeds.map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="3.4"
          ry="6"
          fill={SEED}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
    </Frame>
  );
}

function BeefPatty({ className }: ArtProps) {
  return (
    <Frame h={32} className={className}>
      <rect
        x="4"
        y="0"
        width="242"
        height="32"
        rx="16"
        fill="#6B3E1E"
        stroke={INK}
        strokeWidth="2.5"
      />
      <rect x="14" y="4" width="222" height="6" rx="3" fill="#7D4A26" opacity="0.8" />
      {[
        [50, 20],
        [95, 24],
        [140, 18],
        [185, 23],
        [215, 15],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.4" fill="#573016" />
      ))}
    </Frame>
  );
}

function ChickenPatty({ className }: ArtProps) {
  return (
    <Frame h={34} className={className}>
      <rect
        x="4"
        y="0"
        width="242"
        height="34"
        rx="17"
        fill="#E8A13C"
        stroke={INK}
        strokeWidth="2.5"
      />
      {[
        [40, 10],
        [80, 22],
        [120, 12],
        [160, 24],
        [200, 10],
        [225, 22],
        [60, 26],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#C97F22" />
      ))}
    </Frame>
  );
}

function VeggiePatty({ className }: ArtProps) {
  return (
    <Frame h={30} className={className}>
      <rect
        x="4"
        y="0"
        width="242"
        height="30"
        rx="15"
        fill="#7A8F3A"
        stroke={INK}
        strokeWidth="2.5"
      />
      {[
        [45, 10],
        [90, 20],
        [135, 9],
        [180, 19],
        [215, 11],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.2" fill="#5F7028" />
      ))}
    </Frame>
  );
}

function CheeseSlice({ color, dripColor, className }: ArtProps & { color: string; dripColor: string }) {
  return (
    <Frame h={24} className={className}>
      <rect x="4" y="0" width="242" height="10" fill={color} stroke={INK} strokeWidth="2" />
      {[32, 95, 158, 214].map((x, i) => (
        <rect key={i} x={x} y="0" width="17" height="24" rx="8.5" fill={dripColor} />
      ))}
      <rect x="6" y="8" width="238" height="3" fill={INK} opacity="0.15" />
    </Frame>
  );
}

function Tomato({ className }: ArtProps) {
  return (
    <Frame h={22} className={className}>
      <rect
        x="10"
        y="0"
        width="230"
        height="22"
        rx="11"
        fill="#E8473B"
        stroke={INK}
        strokeWidth="2.5"
      />
      <rect x="18" y="5" width="214" height="12" rx="6" fill="#F4796B" />
      {[60, 110, 160, 205].map((cx, i) => (
        <circle key={i} cx={cx} cy="11" r="2.2" fill="#FBD1CB" />
      ))}
    </Frame>
  );
}

function Lettuce({ className }: ArtProps) {
  return (
    <Frame h={26} className={className}>
      <path
        d="M8 4 H242 V10 Q230 26 216 12 Q202 26 188 12 Q174 26 160 12 Q146 26 132 12 Q118 26 104 12 Q90 26 76 12 Q62 26 48 12 Q34 26 20 12 Q12 22 8 12 Z"
        fill="#55B33C"
        stroke={INK}
        strokeWidth="2.5"
      />
      <path
        d="M14 8 H236 V10 Q226 18 214 11"
        fill="#3E8F2C"
        opacity="0.6"
      />
    </Frame>
  );
}

function OnionRings({ className }: ArtProps) {
  return (
    <Frame h={18} className={className}>
      {[70, 125, 180].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="9" r="7" fill="#F3E8FF" stroke="#C9A8F5" strokeWidth="3" />
          <circle cx={cx} cy="9" r="2.5" fill="#C9A8F5" opacity="0.5" />
        </g>
      ))}
    </Frame>
  );
}

function Jalapeno({ className }: ArtProps) {
  return (
    <Frame h={18} className={className}>
      {[70, 125, 180].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="9" r="8" fill="#37A24A" stroke={INK} strokeWidth="1.6" />
          <circle cx={cx} cy="9" r="4.6" fill="#A9E5B4" />
        </g>
      ))}
    </Frame>
  );
}

function Pickle({ className }: ArtProps) {
  return (
    <Frame h={18} className={className}>
      {[70, 125, 180].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="9" r="8" fill="#97A83B" stroke={INK} strokeWidth="1.6" />
          <circle cx={cx} cy="9" r="5" fill="#C6D26A" />
        </g>
      ))}
    </Frame>
  );
}

function SauceDrizzle({ color, className }: ArtProps & { color: string }) {
  return (
    <Frame h={12} className={className}>
      <path
        d="M10 8 L38 4 L66 9 L94 4 L122 9 L150 4 L178 9 L206 4 L234 8"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </Frame>
  );
}

function CrispyOnions({ className }: ArtProps) {
  const bits: Array<[number, number, number]> = [
    [35, 4, -15],
    [70, 10, 20],
    [105, 3, -8],
    [140, 11, 12],
    [175, 4, -18],
    [210, 10, 8],
  ];
  return (
    <Frame h={18} className={className}>
      {bits.map(([x, y, r], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="16"
          height="6"
          rx="3"
          fill="#C97B2D"
          stroke={INK}
          strokeWidth="1"
          transform={`rotate(${r} ${x + 8} ${y + 3})`}
        />
      ))}
    </Frame>
  );
}

function FriedEgg({ className }: ArtProps) {
  return (
    <Frame h={28} className={className}>
      <path
        d="M30 15 Q28 4 60 4 Q90 1 120 4 Q160 0 192 5 Q224 3 222 15 Q224 26 190 25 Q150 28 110 25 Q62 28 42 24 Q31 25 30 15 Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth="2"
      />
      <circle cx="125" cy="14" r="8" fill="#FFB800" stroke="#E08E24" strokeWidth="2" />
    </Frame>
  );
}

export const LAYER_HEIGHTS: Record<string, number> = {
  "bottom-bun": 42,
  "top-bun": 58,
  "beef-patty": 32,
  "chicken-patty": 34,
  "veggie-patty": 30,
  cheddar: 24,
  "smoked-cheese": 24,
  tomato: 22,
  lettuce: 26,
  onion: 18,
  jalapeno: 18,
  pickle: 18,
  ketchup: 12,
  mustard: 12,
  mayo: 12,
  "hot-sauce": 12,
  "crispy-onions": 18,
  "fried-egg": 28,
};

const ART: Record<string, React.ComponentType<ArtProps>> = {
  "bottom-bun": BottomBun,
  "top-bun": TopBun,
  "beef-patty": BeefPatty,
  "chicken-patty": ChickenPatty,
  "veggie-patty": VeggiePatty,
  cheddar: (p) => <CheeseSlice color="#FFAD1F" dripColor="#FFAD1F" {...p} />,
  "smoked-cheese": (p) => <CheeseSlice color="#E89005" dripColor="#E89005" {...p} />,
  tomato: Tomato,
  lettuce: Lettuce,
  onion: OnionRings,
  jalapeno: Jalapeno,
  pickle: Pickle,
  ketchup: (p) => <SauceDrizzle color="#E11D2E" {...p} />,
  mustard: (p) => <SauceDrizzle color="#F2C200" {...p} />,
  mayo: (p) => <SauceDrizzle color="#F5E7BE" {...p} />,
  "hot-sauce": (p) => <SauceDrizzle color="#C1121F" {...p} />,
  "crispy-onions": CrispyOnions,
  "fried-egg": FriedEgg,
};

export function LayerArt({ id, width = 250 }: { id: string; width?: number }) {
  const Art = ART[id];
  const h = LAYER_HEIGHTS[id] ?? 24;
  if (!Art) return null;
  return (
    <div style={{ width, height: (h / 250) * width }}>
      <Art />
    </div>
  );
}

/** Brand wordmark for printing on boxes/cartons. */
export function BoxWordmark({
  color = "#1E40E6",
  size = 22,
  lines = ["DOUBLE", "GOOD"],
}: {
  color?: string;
  size?: number;
  lines?: string[];
}) {
  return (
    <div
      className="logo-stack"
      style={{ color, fontSize: size, textAlign: "center", pointerEvents: "none" }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
}

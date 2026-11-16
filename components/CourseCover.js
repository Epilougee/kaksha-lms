'use client';

// Color blocks mapped to color_index 0 to 5 per requirements
const COVER_CLASSES = [
  'cover-blue',   // 0
  'cover-teal',   // 1
  'cover-coral',  // 2
  'cover-amber',  // 3
  'cover-green',  // 4
  'cover-slate',  // 5
];

// Distinct, elegant geometric blueprint SVG shapes per course category
function renderGeometricShape(index) {
  const shapeType = index % 6;

  switch (shapeType) {
    case 0:
      // Index 0: Concentric Radar Circles with Coordinate Crosshairs
      return (
        <svg className="course-cover-rings" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="46" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="32" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="18" strokeWidth="1.5" />
          <line x1="50" y1="0" x2="50" y2="100" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="50" x2="100" y2="50" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      );

    case 1:
      // Index 1: Nested Relational Diamonds with Matrix Axis (Database Systems)
      return (
        <svg className="course-cover-rings" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <rect x="15" y="15" width="70" height="70" rx="4" transform="rotate(45 50 50)" strokeWidth="1.5" />
          <rect x="25" y="25" width="50" height="50" rx="2" transform="rotate(45 50 50)" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="36" y="36" width="28" height="28" transform="rotate(45 50 50)" strokeWidth="1.5" />
          <line x1="50" y1="5" x2="50" y2="95" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="5" y1="50" x2="95" y2="50" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      );

    case 2:
      // Index 2: Hexagonal Lattice & Connected Graph Nodes (Data Structures & Algorithms)
      return (
        <svg className="course-cover-rings" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" strokeWidth="1.5" />
          <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="50,36 62,43 62,57 50,64 38,57 38,43" strokeWidth="1.5" />
          <line x1="50" y1="6" x2="50" y2="94" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50" cy="6" r="2.5" fill="currentColor" />
          <circle cx="90" cy="28" r="2.5" fill="currentColor" />
          <circle cx="90" cy="72" r="2.5" fill="currentColor" />
          <circle cx="50" cy="94" r="2.5" fill="currentColor" />
          <circle cx="10" cy="72" r="2.5" fill="currentColor" />
          <circle cx="10" cy="28" r="2.5" fill="currentColor" />
        </svg>
      );

    case 3:
      // Index 3: Interlocking Venn Orbital Arcs & Focal Center (Amber)
      return (
        <svg className="course-cover-rings" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <circle cx="36" cy="50" r="32" strokeWidth="1.5" />
          <circle cx="64" cy="50" r="32" strokeWidth="1.5" />
          <circle cx="50" cy="36" r="32" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="64" r="32" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="14" strokeWidth="1.5" />
        </svg>
      );

    case 4:
      // Index 4: Isometric 3D Modular Cube Lattice (Green)
      return (
        <svg className="course-cover-rings" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 8 L88 30 L88 74 L50 96 L12 74 L12 30 Z" strokeWidth="1.5" />
          <path d="M50 8 L50 52 L88 74" strokeWidth="1.5" />
          <path d="M50 52 L12 74" strokeWidth="1.5" />
          <path d="M50 25 L72 38 L72 64 L50 77 L28 64 L28 38 Z" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="25" x2="50" y2="77" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );

    case 5:
    default:
      // Index 5: Nested Concentric Architectural Rectangles with Cross-Axis (Slate)
      return (
        <svg className="course-cover-rings" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <rect x="8" y="16" width="84" height="68" rx="8" strokeWidth="1.5" />
          <rect x="20" y="26" width="60" height="48" rx="5" strokeWidth="1.5" strokeDasharray="4 4" />
          <rect x="32" y="36" width="36" height="28" rx="3" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="96" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="4" y1="50" x2="96" y2="50" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      );
  }
}

export default function CourseCover({ code, title, colorIndex = 0, height = 130, isHeader = false }) {
  const coverClass = COVER_CLASSES[colorIndex % COVER_CLASSES.length];

  return (
    <div
      className={`course-cover ${coverClass}`}
      style={{
        height,
        borderRadius: isHeader ? '16px' : '15px 15px 0 0',
      }}
    >
      {/* Distinct faint geometric blueprint watermark SVG according to colorIndex */}
      {renderGeometricShape(colorIndex)}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(15, 23, 42, 0.25)', padding: '3px 8px', borderRadius: 9999 }}>
          Core Module
        </span>
        <i className="fa-solid fa-graduation-cap" style={{ opacity: 0.75, fontSize: 16 }} />
      </div>

      <div style={{ zIndex: 2 }}>
        <div className="course-code-big">{code}</div>
        {isHeader && (
          <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.95, marginTop: 4 }}>
            {title}
          </div>
        )}
      </div>
    </div>
  );
}

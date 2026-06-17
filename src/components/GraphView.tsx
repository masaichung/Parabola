import { useRef, useState, PointerEvent } from 'react';
import { motion } from 'motion/react';
import { isNearInteger, getNearestInteger, calculateLineDetails } from '../utils/math';
import { FloatingStars } from './FloatingStars';

interface GraphViewProps {
  x1: number;
  x2: number;
  setX1: (x: number) => void;
  setX2: (x: number) => void;
  snapToIntegers: boolean;
  isGraphOnly?: boolean;
}

export function GraphView({ x1, x2, setX1, setX2, snapToIntegers, isGraphOnly }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeDrag, setActiveDrag] = useState<'A' | 'B' | null>(null);
  const [hoveredA, setHoveredA] = useState(false);
  const [hoveredB, setHoveredB] = useState(false);

  // SVG dimensions
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 600;

  // Spacing margins
  const marginLeft = 70;
  const marginRight = 40;
  const marginTop = 50;
  const marginBottom = 60;

  // Plot box area dimensions
  const plotWidth = SVG_WIDTH - marginLeft - marginRight;
  const plotHeight = SVG_HEIGHT - marginTop - marginBottom;

  // Mathematical bounds with padding so handles are not clipped at boundary edges (-10 and 10)
  const DOMAIN_MIN = -10.5;
  const DOMAIN_MAX = 10.5;
  const RANGE_MIN = -5;
  const RANGE_MAX = 105;

  // Grid coordinates mapping helpers
  const toSvgX = (x: number): number => {
    const fraction = (x - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN);
    return marginLeft + fraction * plotWidth;
  };

  const toSvgY = (y: number): number => {
    const fraction = (y - RANGE_MIN) / (RANGE_MAX - RANGE_MIN);
    // Invert Y so mathematical top (100) is SVG top (marginTop)
    return SVG_HEIGHT - marginBottom - fraction * plotHeight;
  };

  const fromSvgX = (svgX: number): number => {
    const fraction = (svgX - marginLeft) / plotWidth;
    const xVal = DOMAIN_MIN + fraction * (DOMAIN_MAX - DOMAIN_MIN);
    // Limit to actual domain boundary [-10, 10]
    return Math.max(-10, Math.min(10, xVal));
  };

  // Pre-calculate mathematical positions
  const y1 = x1 * x1;
  const y2 = x2 * x2;

  const isAInteger = isNearInteger(x1);
  const isBInteger = isNearInteger(x2);

  // Core math line computations
  const lineDetails = calculateLineDetails(x1, x2);
  const { slope, yIntercept, isTangent } = lineDetails;

  // Generate the coordinates of the parabola curve y = x^2
  const generateParabolaPath = (): string => {
    const segments = 120;
    let path = '';
    for (let i = 0; i <= segments; i++) {
      const mathX = -10 + (i / segments) * 20; // x from -10 to 10
      const mathY = mathX * mathX;
      const xSvg = toSvgX(mathX);
      const ySvg = toSvgY(mathY);
      path += (i === 0 ? 'M' : 'L') + ` ${xSvg.toFixed(2)},${ySvg.toFixed(2)}`;
    }
    return path;
  };

  // Drag and drop handler with pointer capture
  const handlePointerDown = (pointId: 'A' | 'B', e: PointerEvent<SVGCircleElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDrag(pointId);
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!activeDrag || !svgRef.current) return;
    e.preventDefault();

    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    
    // Scale standard mouse coord to SVG viewBox scale (800 wide)
    const svgX = (relativeX / rect.width) * SVG_WIDTH;
    let newMathX = fromSvgX(svgX);

    if (activeDrag === 'A') {
      // Point A can only move in domain x <= 0
      const boundX = Math.min(0, Math.max(-10, newMathX));
      const nearest = getNearestInteger(boundX);
      if (snapToIntegers) {
        setX1(nearest);
      } else if (Math.abs(boundX - nearest) < 0.3) {
        setX1(nearest);
      } else {
        setX1(Number(boundX.toFixed(2)));
      }
    } else if (activeDrag === 'B') {
      // Point B can only move in domain x >= 0
      const boundX = Math.max(0, Math.min(10, newMathX));
      const nearest = getNearestInteger(boundX);
      if (snapToIntegers) {
        setX2(nearest);
      } else if (Math.abs(boundX - nearest) < 0.3) {
        setX2(nearest);
      } else {
        setX2(Number(boundX.toFixed(2)));
      }
    }
  };

  const handlePointerUp = (pointId: 'A' | 'B', e: PointerEvent<SVGCircleElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActiveDrag(null);
  };

  // Draw indicators for integers on the grid
  const integers = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const yGridLines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // Draw connecting line that clips perfectly within the coordinate quadrant boundaries
  const getConnectingLinePoints = () => {
    // Solve line equation: y = slope * x + yIntercept
    const xMinVal = -10;
    const xMaxVal = 10;
    
    const yLeft = slope * xMinVal + yIntercept;
    const yRight = slope * xMaxVal + yIntercept;

    return {
      xStart: toSvgX(xMinVal),
      yStart: toSvgY(yLeft),
      xEnd: toSvgX(xMaxVal),
      yEnd: toSvgY(yRight)
    };
  };

  const connectingLine = getConnectingLinePoints();

  return (
    <div 
      className="relative w-full aspect-[4/3] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-1 select-none"
      style={{
        maxHeight: isGraphOnly ? 'calc(100vh - 120px)' : 'calc(100vh - 280px)',
        maxWidth: isGraphOnly ? 'calc((100vh - 120px) * (4 / 3))' : 'calc((100vh - 280px) * (4 / 3))',
      }}
    >
      {/* Absolute grid decoration watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      <svg
        id="math-parabola-svg"
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="relative z-10 w-full h-full cursor-crosshair overflow-visible touch-none"
        onPointerMove={handlePointerMove}
      >
        <defs>
          {/* Clip path inside math bounds to keep lines perfectly contained inside grid */}
          <clipPath id="grid-clip">
            <rect
              x={toSvgX(-10)}
              y={toSvgY(100)}
              width={toSvgX(10) - toSvgX(-10)}
              height={toSvgY(0) - toSvgY(100)}
            />
          </clipPath>

          {/* Gradients */}
          <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rose-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="teal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. GRID LINES */}
        {/* Vertical lines */}
        <g opacity="0.8">
          {integers.map((val) => (
            <line
              key={`v-grid-${val}`}
              x1={toSvgX(val)}
              y1={toSvgY(-5)}
              x2={toSvgX(val)}
              y2={toSvgY(105)}
              stroke={val === 0 ? '#cbd5e1' : '#f1f5f9'}
              strokeWidth={val === 0 ? 1.5 : 0.75}
              strokeDasharray={val !== 0 ? '1,2' : undefined}
            />
          ))}
        </g>

        {/* Horizontal lines */}
        <g opacity="0.8">
          {yGridLines.map((val) => (
            <line
              key={`h-grid-${val}`}
              x1={toSvgX(-10.5)}
              y1={toSvgY(val)}
              x2={toSvgX(10.5)}
              y2={toSvgY(val)}
              stroke={val === 0 ? '#cbd5e1' : '#f1f5f9'}
              strokeWidth={val === 0 ? 1.5 : 0.75}
              strokeDasharray={val !== 0 ? '1,2' : undefined}
            />
          ))}
        </g>

        {/* 2. AXES MARKINGS (LABELS & TICKS) */}
        {/* X Axis Labels */}
        <g className="text-[10px] font-mono fill-slate-500">
          {integers.filter(v => v % 2 === 0).map((val) => (
            <g key={`x-lbl-${val}`}>
              <line
                x1={toSvgX(val)}
                y1={toSvgY(0) - 2}
                x2={toSvgX(val)}
                y2={toSvgY(0) + 4}
                stroke="#94a3b8"
                strokeWidth={1}
                opacity={0.6}
              />
              <text
                x={toSvgX(val)}
                y={toSvgY(0) + 16}
                textAnchor="middle"
                className="font-semibold"
              >
                {val}
              </text>
            </g>
          ))}
          <text x={toSvgX(10) + 14} y={toSvgY(0) + 3} className="fill-slate-700 font-bold italic" textAnchor="start">x</text>
        </g>

        {/* Y Axis Labels */}
        <g className="text-[10px] font-mono fill-slate-500">
          {yGridLines.map((val) => (
            <g key={`y-lbl-${val}`}>
              <line
                x1={toSvgX(0) - 4}
                y1={toSvgY(val)}
                x2={toSvgX(0) + 2}
                y2={toSvgY(val)}
                stroke="#94a3b8"
                strokeWidth={1}
                opacity={0.6}
              />
              <text
                x={toSvgX(0) - 8}
                y={toSvgY(val) + 3}
                textAnchor="end"
                className="font-semibold"
              >
                {val}
              </text>
            </g>
          ))}
          <text x={toSvgX(0)} y={toSvgY(100) - 15} className="fill-slate-700 font-bold italic" textAnchor="middle">y</text>
        </g>

        {/* 3. PARABOLA CURVE y = x^2 */}
        <path
          d={generateParabolaPath()}
          fill="none"
          stroke="#64748b"
          strokeWidth={3}
          strokeLinecap="round"
          className="opacity-95"
        />

        {/* 4. VERTICAL DOTTED LINES FOLLOWERS */}
        {/* Point A vertical dotted line */}
        <line
          id="dotted-v-line-A"
          x1={toSvgX(x1)}
          y1={toSvgY(y1)}
          x2={toSvgX(x1)}
          y2={toSvgY(0)}
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="3,3"
          opacity={0.6}
        />

        {/* Point B vertical dotted line */}
        <line
          id="dotted-v-line-B"
          x1={toSvgX(x2)}
          y1={toSvgY(y2)}
          x2={toSvgX(x2)}
          y2={toSvgY(0)}
          stroke="#0d9488"
          strokeWidth={1.5}
          strokeDasharray="3,3"
          opacity={0.6}
        />

        {/* 5. SECANT / TANGENT LINE (CLIPPED) */}
        <g clipPath="url(#grid-clip)">
          <line
            x1={toSvgX(x1)}
            y1={toSvgY(y1)}
            x2={toSvgX(x2)}
            y2={toSvgY(y2)}
            stroke="#3b82f6"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>

        {/* 6. Y-INTERCEPT MARKER */}
        {yIntercept >= RANGE_MIN && yIntercept <= RANGE_MAX && (
          <g id="y-intercept-marker" className="filter drop-shadow-[0_1px_3px_rgba(245,158,11,0.2)]">
            <circle
              cx={toSvgX(0)}
              cy={toSvgY(yIntercept)}
              r={12}
              fill="url(#gold-glow)"
            />
            <circle
              cx={toSvgX(0)}
              cy={toSvgY(yIntercept)}
              r={5}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            {/* Popout bubble describing y-intercept */}
            <g transform={`translate(${toSvgX(0) + 12}, ${toSvgY(yIntercept) - 8})`}>
              <rect
                x={0}
                y={-9}
                width={65}
                height={18}
                rx={4}
                fill="#ffffff"
                stroke="#f59e0b"
                strokeWidth={1}
                opacity={0.95}
              />
              <text
                x={32.5}
                y={3}
                textAnchor="middle"
                className="text-[9.5px] font-mono font-bold fill-amber-700"
              >
                y-int: {yIntercept.toFixed(1)}
              </text>
            </g>
          </g>
        )}

        {/* 7. CELEBRATION STARS */}
        {isAInteger && (
          <FloatingStars cx={toSvgX(x1)} cy={toSvgY(y1)} color="#f43f5e" />
        )}

        {/* Floating Stars for Point B */}
        {isBInteger && (
          <FloatingStars cx={toSvgX(x2)} cy={toSvgY(y2)} color="#0d9488" />
        )}

        {/* POINT A HANDLE */}
        <g id="point-a-group">
          {/* Delight static outer ring */}
          {isAInteger ? (
            <circle
              cx={toSvgX(x1)}
              cy={toSvgY(y1)}
              r={18}
              fill="none"
              stroke="#ef4444"
              strokeWidth={1.5}
              opacity={0.6}
            />
          ) : (
            <circle
              cx={toSvgX(x1)}
              cy={toSvgY(y1)}
              r={16}
              fill="url(#rose-glow)"
              opacity={activeDrag === 'A' ? 0.7 : 0}
            />
          )}

          {/* Drag point core */}
          <circle
            cx={toSvgX(x1)}
            cy={toSvgY(y1)}
            r={activeDrag === 'A' || hoveredA ? 13 : 11}
            fill="#ffffff"
            stroke="#ef4444"
            strokeWidth={3}
            onPointerDown={(e) => handlePointerDown('A', e)}
            onPointerUp={(e) => handlePointerUp('A', e)}
            onPointerEnter={() => setHoveredA(true)}
            onPointerLeave={() => setHoveredA(false)}
            className="transition-all duration-150 cursor-grab select-none filter drop-shadow hover:drop-shadow-md"
          />

          {/* Smiley faces */}
          {isAInteger ? (
            <g pointerEvents="none" transform={`translate(${toSvgX(x1)}, ${toSvgY(y1)})`}>
              <circle cx="-3" cy="-2" r="1.2" fill="#ef4444" />
              <circle cx="3" cy="-2" r="1.2" fill="#ef4444" />
              <path d="M -4.5,1.5 Q 0,5.5 4.5,1.5" fill="none" stroke="#ef4444" strokeWidth={1.2} strokeLinecap="round" />
            </g>
          ) : (
            <g pointerEvents="none" transform={`translate(${toSvgX(x1)}, ${toSvgY(y1)})`}>
              <text x={0} y={3} textAnchor="middle" className="text-[9px] font-sans font-black fill-red-550 fill-red-500">A</text>
            </g>
          )}
        </g>

        {/* POINT B HANDLE */}
        <g id="point-b-group">
          {/* Delight static outer ring */}
          {isBInteger ? (
            <circle
              cx={toSvgX(x2)}
              cy={toSvgY(y2)}
              r={18}
              fill="none"
              stroke="#0d9488"
              strokeWidth={1.5}
              opacity={0.6}
            />
          ) : (
            <circle
              cx={toSvgX(x2)}
              cy={toSvgY(y2)}
              r={16}
              fill="url(#teal-glow)"
              opacity={activeDrag === 'B' ? 0.7 : 0}
            />
          )}

          {/* Drag point core */}
          <circle
            cx={toSvgX(x2)}
            cy={toSvgY(y2)}
            r={activeDrag === 'B' || hoveredB ? 13 : 11}
            fill="#ffffff"
            stroke="#0d9488"
            strokeWidth={3}
            onPointerDown={(e) => handlePointerDown('B', e)}
            onPointerUp={(e) => handlePointerUp('B', e)}
            onPointerEnter={() => setHoveredB(true)}
            onPointerLeave={() => setHoveredB(false)}
            className="transition-all duration-150 cursor-grab select-none filter drop-shadow hover:drop-shadow-md"
          />

          {/* Smiley faces */}
          {isBInteger ? (
            <g pointerEvents="none" transform={`translate(${toSvgX(x2)}, ${toSvgY(y2)})`}>
              <circle cx="-3" cy="-2" r="1.2" fill="#0d9488" />
              <circle cx="3" cy="-2" r="1.2" fill="#0d9488" />
              <path d="M -4.5,1.5 Q 0,5.5 4.5,1.5" fill="none" stroke="#0d9488" strokeWidth={1.2} strokeLinecap="round" />
            </g>
          ) : (
            <g pointerEvents="none" transform={`translate(${toSvgX(x2)}, ${toSvgY(y2)})`}>
              <text x={0} y={3} textAnchor="middle" className="text-[9px] font-sans font-black fill-teal-555 fill-teal-500">B</text>
            </g>
          )}
        </g>
        </svg>
    </div>
  );
}

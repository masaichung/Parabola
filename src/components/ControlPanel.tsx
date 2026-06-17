import { Sliders, HelpCircle, Sparkles, BookOpen, RefreshCw, Trophy } from 'lucide-react';
import { isNearInteger, calculateLineDetails } from '../utils/math';

interface ControlPanelProps {
  x1: number;
  x2: number;
  setX1: (x: number) => void;
  setX2: (x: number) => void;
  snapToIntegers: boolean;
  setSnapToIntegers: (val: boolean) => void;
  onReset: () => void;
}

export function ControlPanel({
  x1,
  x2,
  setX1,
  setX2,
  snapToIntegers,
  setSnapToIntegers,
  onReset,
}: ControlPanelProps) {
  const y1 = x1 * x1;
  const y2 = x2 * x2;

  const isAInteger = isNearInteger(x1);
  const isBInteger = isNearInteger(x2);

  const { slope, yIntercept, isTangent, equation } = calculateLineDetails(x1, x2);

  // Challenge evaluation helpers
  const challenges = [
    {
      id: 'horizontal',
      title: 'Horizontal Line (Slope = 0)',
      description: 'Align points symmetrically so the connecting line is flat.',
      isCompleted: Math.abs(slope) < 0.01 && Math.abs(x1 - x2) > 0.01,
      hint: 'Place A and B at opposite values (e.g. -5 and 5).',
    },
    {
      id: 'zero-intercept',
      title: 'Pass through the Origin',
      description: 'Arrange the line to cross the Y-axis exactly at y = 0.',
      isCompleted: Math.abs(yIntercept) < 0.01,
      hint: 'Move one of the movable points directly to the origin (0, 0).',
    },
    {
      id: 'tangent-line',
      title: 'Approximating a Tangent',
      description: 'Set both points to the exact same position.',
      isCompleted: Math.abs(x1 - x2) < 0.001,
      hint: 'Slide A and B to identical values.',
    },
  ];

  return (
    <div className="space-y-8 text-slate-800">
      {/* SECTION 1: COORDINATES HEADER & CARDS */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Coordinates Control
          </h3>
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition cursor-pointer"
            title="Reset to Default Positions"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Dynamic Snap control */}
        <label className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-200 transition cursor-pointer">
          <input
            id="snap-to-integers-checkbox"
            type="checkbox"
            checked={snapToIntegers}
            onChange={(e) => setSnapToIntegers(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700">Snap to Integers Only</span>
            <span className="text-[10px] text-slate-400">Lock point coordinates strictly to whole numbers</span>
          </div>
        </label>

        {/* READOUT CARD POINT A */}
        <div className="space-y-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Point A
              </span>
              {isAInteger ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                  😀 Integer
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">Decimal</span>
              )}
            </div>
            <div className="text-2xl font-mono font-bold tracking-tight text-slate-800 mt-1">
              ({x1.toFixed(1)}, {y1.toFixed(0)})
            </div>
          </div>
        </div>

        {/* READOUT CARD POINT B */}
        <div className="space-y-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-teal-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Point B
              </span>
              {isBInteger ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                  😄 Integer
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">Decimal</span>
              )}
            </div>
            <div className="text-2xl font-mono font-bold tracking-tight text-slate-800 mt-1">
              ({x2.toFixed(1)}, {y2.toFixed(0)})
            </div>
          </div>
        </div>
      </section>

      {/* DOUBLE INTEGER DELIGHT CELEBRATION */}
      {isAInteger && isBInteger && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-150 flex items-start gap-3 shadow-sm animate-fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-emerald-800">Coordinate Delight Achieved!</div>
            <p className="text-[11px] text-emerald-600 leading-relaxed">
              Both active control points are at integer solutions! Their coordinate tags are highlighted, and they are wearing smiley faces on the plot space.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: SECANT LINE PROPERTIES */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          Connecting Line Properties
        </h3>
        <div className="space-y-3 bg-white border border-slate-150 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-xs text-slate-500 italic">line type</span>
            <span className="text-sm font-semibold text-slate-700 font-sans">
              {isTangent ? 'Tangent (A ≈ B)' : 'Secant Line'}
            </span>
          </div>

          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-xs text-slate-500 italic">calculated slope (m)</span>
            <span className="text-base font-mono font-bold text-slate-850 text-slate-800">
              {slope.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-xs text-slate-500 italic">y-intercept</span>
            <span className="text-base font-mono font-bold text-blue-600">
              {yIntercept.toFixed(2)}
            </span>
          </div>

        </div>
      </section>

      {/* SECTION 3: THE PARABOLA MAGIC INSIGHT */}
      <section className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2.5">
        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Pattern Discovery Quest
        </h4>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Observe how the x-coordinates change as you play. Use integer positions to search for the hidden rules:
        </p>
        <ul className="text-[10.5px] text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold mt-0.5">•</span>
            <span>How does the <strong>slope (m)</strong> relate algebraically to the x-coordinates of A and B?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold mt-0.5">•</span>
            <span>Can you calculate the <strong>y-intercept</strong> from the x-coordinates of A and B? (Check products & signs carefully!)</span>
          </li>
        </ul>
      </section>

      {/* SECTION 4: CHALLENGE STAGE */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-slate-500" />
          Active Quests
        </h3>
        <div className="space-y-3">
          {challenges.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                item.isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-white border-slate-150 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-bold ${
                    item.isCompleted ? 'text-emerald-700 line-through' : 'text-slate-700'
                  }`}
                >
                  {item.title}
                </span>
                {item.isCompleted ? (
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    ✓ Clear
                  </span>
                ) : (
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-mono">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">{item.description}</p>
              {!item.isCompleted && (
                <p className="text-[9.5px] text-slate-400 mt-1 italic">💡 Hint: {item.hint}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

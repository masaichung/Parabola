/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GraphView } from './components/GraphView';
import { ControlPanel } from './components/ControlPanel';
import { Sparkles, Compass, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [x1, setX1] = useState<number>(-6);
  const [x2, setX2] = useState<number>(7);
  const [snapToIntegers, setSnapToIntegers] = useState<boolean>(false);
  const [isGraphOnly, setIsGraphOnly] = useState<boolean>(true);

  const handleSetX1 = (val: number) => {
    // Keep Point A in domain x <= 0
    setX1(Math.min(0, Math.max(-10, val)));
  };

  const handleSetX2 = (val: number) => {
    // Keep Point B in domain x >= 0
    setX2(Math.max(0, Math.min(10, val)));
  };

  const handleReset = () => {
    handleSetX1(-6);
    handleSetX2(7);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* SIDEBAR BLOCK (Control Panel & Math Info) */}
      {!isGraphOnly && (
        <aside className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shadow-sm shrink-0">
          <header className="p-8 border-b border-slate-100">
            <div className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Mathematics Utility</div>
            <h1 id="app-title-main" className="text-2xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
              Parabola Explorer
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Interactive visualization of quadratic functions and secant lines connecting draggable points.
            </p>
          </header>

          <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[80vh] lg:max-h-none">
            <ControlPanel
              x1={x1}
              x2={x2}
              setX1={handleSetX1}
              setX2={handleSetX2}
              snapToIntegers={snapToIntegers}
              setSnapToIntegers={setSnapToIntegers}
              onReset={handleReset}
            />
          </div>

          <footer className="p-8 bg-slate-50 border-t border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-mono text-center lg:text-left">
            Range: [0, 100] &bull; Domain: [-10, 10]
          </footer>
        </aside>
      )}

      {/* MAIN PLOT CONTAINER */}
      <main className="flex-1 flex flex-col p-6 md:p-8 lg:p-8 bg-slate-50 lg:h-screen lg:overflow-hidden">
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden min-h-[450px] lg:min-h-0">
          {/* Subtle radial dot layout decoration */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="absolute top-6 left-6 z-20 flex flex-col">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Continuous Curve Space</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Drag Point A and Point B directly on the coordinate quadrant plane</p>
          </div>

          {/* Quick preset triggers + fullscreen/graphOnly trigger directly on the canvas top-right */}
          <div className="absolute top-6 right-6 z-20 flex gap-2">
            <button
              id="toggle-graph-only"
              onClick={() => setIsGraphOnly(!isGraphOnly)}
              className="px-3.5 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-150 rounded-lg transition border border-blue-200 flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
            >
              {isGraphOnly ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Show sidebar controls
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Graph only
                </>
              )}
            </button>

            <button
              id="set-preset-1"
              onClick={() => {
                handleSetX1(-6);
                handleSetX2(7);
              }}
              className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            >
              Default (-6, 7)
            </button>
            <button
              id="set-preset-2"
              onClick={() => {
                handleSetX1(-5);
                handleSetX2(5);
              }}
              className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            >
              Symmetric (-5, 5)
            </button>
            <button
              id="set-preset-3"
              onClick={() => {
                handleSetX1(0);
                handleSetX2(10);
              }}
              className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            >
              Origin (0, 10)
            </button>
          </div>

          {/* Main interactive SVG graph view */}
          <div className="flex-1 flex items-center justify-center p-6 mt-12 md:mt-8">
            <GraphView
              x1={x1}
              x2={x2}
              setX1={handleSetX1}
              setX2={handleSetX2}
              snapToIntegers={snapToIntegers}
              isGraphOnly={isGraphOnly}
            />
          </div>

          {/* Graphical element legends overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Parabola Curve
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Secant/Secant Line
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Real-time calculations
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS BAR */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono tracking-widest uppercase">
            <span>SCALE 1:5px</span>
            <span>AXIS_CENTER_400,550</span>
            <span>VIEW_1024x768</span>
            <span className="text-blue-600">GEOMETRIC_BALANCE_THEME</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
            <div className="w-24 h-1 bg-blue-600 rounded-full" />
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

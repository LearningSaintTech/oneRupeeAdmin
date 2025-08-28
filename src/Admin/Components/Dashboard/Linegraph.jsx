import React, { useMemo } from 'react';

const LineGraph = ({ data }) => {
  const baseWidth = 900;
  const baseHeight = 320;
  const padding = { top: 30, right: 20, bottom: 40, left: 56 };

  // ✅ Get current month dynamically
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Demo series in Millions
  const series = useMemo(() => [
    150, 160, 175, 168, 160, 155, 170, 185, 188, 220, 218, 230, 210, 205, 235, 228, 220, 200, 190, 170, 165, 180, 175, 160, 150, 165, 180, 175, 185, 190,
  ], []);

  const bgSeries1 = useMemo(() => series.map((v, i) => (i % 5 === 0 ? v + 35 : v + 25)), [series]);
  const bgSeries2 = useMemo(() => series.map((v, i) => (i % 6 === 0 ? v - 15 : v - 5)), [series]);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const highlightDay = 15;
  const yTicks = [140, 180, 220, 260];

  const plotW = baseWidth - padding.left - padding.right;
  const plotH = baseHeight - padding.top - padding.bottom;

  const xScale = (d) => padding.left + ((d - 1) / 29) * plotW;
  const yScale = (v) => padding.top + (1 - (v - 140) / (260 - 140)) * plotH;

  function toSmoothPath(values) {
    const points = values.map((v, i) => [xScale(i + 1), yScale(v)]);
    if (points.length < 2) return '';
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cx = (p0[0] + p1[0]) / 2;
      const cy = (p0[1] + p1[1]) / 2;
      d += ` Q ${p0[0]} ${p0[1]} ${cx} ${cy}`;
    }
    const last = points[points.length - 1];
    d += ` T ${last[0]} ${last[1]}`;
    return d;
  }

  const mainPath = useMemo(() => toSmoothPath(series), [series]);
  const bgPath1 = useMemo(() => toSmoothPath(bgSeries1), [bgSeries1]);
  const bgPath2 = useMemo(() => toSmoothPath(bgSeries2), [bgSeries2]);

  const highlightX = xScale(highlightDay);
  const highlightY = yScale(series[highlightDay - 1]);

  return (
    <div className="w-full max-w-[90vw] mx-auto rounded-2xl bg-white p-0 sm:p-2 md:p-4">
      <div className="bg-[#F6F9FC] rounded-2xl p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${baseWidth} ${baseHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto min-h-[200px] sm:min-h-[250px] md:min-h-[320px] max-h-[400px]"
        >
          {/* Grid y-lines */}
          {yTicks.map((y) => (
            <line
              key={y}
              x1={padding.left}
              x2={baseWidth - padding.right}
              y1={yScale(y)}
              y2={yScale(y)}
              stroke="#DDE6EE"
              strokeWidth="1"
            />
          ))}

          {/* Y labels */}
          {yTicks.map((y) => (
            <text
              key={`ylab-${y}`}
              x={padding.left - 16}
              y={yScale(y) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#8AA0B3"
            >
              {y}M
            </text>
          ))}

          {/* X labels */}
          {[1, 5, 10, 15, 20, 25, 30].map((x) => (
            <text
              key={`xlab-${x}`}
              x={xScale(x)}
              y={baseHeight - padding.bottom + 18}
              textAnchor="middle"
              fontSize="12"
              fill="#8AA0B3"
            >
              {x}
            </text>
          ))}

          {/* Background lines */}
          <path d={bgPath1} fill="none" stroke="#E6D9FF" strokeWidth="3" />
          <path d={bgPath2} fill="none" stroke="#E6EFF7" strokeWidth="3" />

          {/* Main line */}
          <path d={mainPath} fill="none" stroke="#2D89C6" strokeWidth="4" />

          {/* Highlight vertical dashed line */}
          <line
            x1={highlightX}
            x2={highlightX}
            y1={highlightY}
            y2={baseHeight - padding.bottom}
            stroke="#94A3B8"
            strokeDasharray="4 6"
          />

          {/* Highlight point */}
          <circle
            cx={highlightX}
            cy={highlightY}
            r="7"
            fill="#2D89C6"
            stroke="#fff"
            strokeWidth="3"
          />

          {/* Tooltip bubble */}
          <g transform={`translate(${highlightX - 90}, ${highlightY - 70})`}>
            <rect rx="12" ry="12" width="180" height="64" fill="#fff" stroke="#E5EAF0" />
            <polygon points="88,64 100,64 94,74" fill="#fff" stroke="#E5EAF0" />
            
            {/* ✅ Dynamic month */}
            <text x="16" y="20" fontSize="10" fill="#94A3B8">This Month</text>
            <text x="16" y="38" fontSize="20" fontWeight="700" fill="#F59E0B">
              {data?.currentValue || '220,342,123'}
            </text>
            <text x="16" y="54" fontSize="12" fill="#94A3B8">{currentMonth}</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LineGraph;

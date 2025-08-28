import React from 'react';

// A reusable stat card matching the provided screenshot style
// Props:
// - title: small heading (e.g., "Total Courses")
// - subtitle: tiny caption under title (e.g., "245 courses")
// - value: the big number/value (e.g., "245")
// - iconSrc: optional image shown on the right
// - className: optional extra classes
const StatCard = ({ title, subtitle, value, iconSrc, className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.08)] bg-gradient-to-tr from-[#ff9a3c] via-[#ff8a3a] to-[#ff6f1d] ${className}`}
    >
      {/* glossy highlight */}
      <div className="pointer-events-none absolute -top-10 right-0 w-40 h-40 rounded-full bg-white/20 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-white text-lg font-bold leading-tight">{title}</h3>
          {subtitle ? (
            <p className="text-white text-lg mt-1">{subtitle}</p>
          ) : null}
          <div className="text-white text-4xl font-fbold mt-4 tracking-tight">{value}</div>
        </div>

        {iconSrc ? (
          <img
            src={iconSrc}
            alt={title}
            className="h-20 w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.15)]"
          />
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
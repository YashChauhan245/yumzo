import { useEffect, useState } from 'react';

const statsData = [
  {
    id: 'revenue',
    label: 'TOTAL REVENUE',
    value: '₹4,52,300',
    change: '+12.5%',
    trend: 'up',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: '#22c55e',
    bgGlow: 'rgba(34, 197, 94, 0.12)',
    sparkline: [30, 45, 35, 50, 40, 55, 60, 70, 65, 80, 75, 90],
  },
  {
    id: 'orders',
    label: 'ACTIVE ORDERS',
    value: '128',
    change: '+8.2%',
    trend: 'up',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    color: '#f97316',
    bgGlow: 'rgba(249, 115, 22, 0.12)',
    hasLiveDot: true,
    sparkline: [20, 35, 28, 45, 38, 55, 48, 60, 52, 68, 58, 72],
  },
  {
    id: 'customers',
    label: 'TOTAL CUSTOMERS',
    value: '3,240',
    change: '+5.1%',
    trend: 'up',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: '#3b82f6',
    bgGlow: 'rgba(59, 130, 246, 0.12)',
    sparkline: [40, 42, 45, 48, 50, 55, 58, 60, 63, 68, 72, 78],
  },
  {
    id: 'delivery',
    label: 'AVG. DELIVERY TIME',
    value: '28 min',
    change: '-3.2%',
    trend: 'down',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: '#f59e0b',
    bgGlow: 'rgba(245, 158, 11, 0.12)',
    sparkline: [50, 48, 45, 42, 40, 38, 35, 33, 30, 32, 28, 28],
  },
];

const MiniSparkline = ({ data, color, width = 80, height = 32 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="sparkline-svg">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StatsCards = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div
          key={stat.id}
          className={`stat-card ${animated ? 'animate-in' : ''}`}
          style={{
            animationDelay: `${index * 100}ms`,
            '--stat-color': stat.color,
            '--stat-glow': stat.bgGlow,
          }}
        >
          <div className="stat-card-header">
            <div className="stat-icon-wrap" style={{ background: stat.bgGlow }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <MiniSparkline data={stat.sparkline} color={stat.color} />
          </div>

          <div className="stat-card-body">
            <span className="stat-label">{stat.label}</span>
            <div className="stat-value-row">
              <span className="stat-value">{stat.value}</span>
              {stat.hasLiveDot && <span className="live-pulse-dot"></span>}
            </div>
            <span className={`stat-change ${stat.trend}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {stat.trend === 'up' ? (
                  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>
                ) : (
                  <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>
                )}
              </svg>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

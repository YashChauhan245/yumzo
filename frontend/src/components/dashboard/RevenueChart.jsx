import { useEffect, useRef, useState } from 'react';

const revenueData = [
  { month: 'Jan', value: 18500 },
  { month: 'Feb', value: 22300 },
  { month: 'Mar', value: 19800 },
  { month: 'Apr', value: 28400 },
  { month: 'May', value: 25100 },
  { month: 'Jun', value: 31200 },
  { month: 'Jul', value: 29800 },
  { month: 'Aug', value: 35600 },
  { month: 'Sep', value: 33200 },
  { month: 'Oct', value: 38900 },
  { month: 'Nov', value: 41500 },
  { month: 'Dec', value: 45230 },
];

const RevenueChart = () => {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeRange, setActiveRange] = useState('12M');
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...revenueData.map(d => d.value)) * 1.1;
    const minVal = 0;

    let progress = 0;
    const duration = 60;

    const animate = () => {
      progress = Math.min(progress + 1 / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      const gridSteps = 5;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      for (let i = 0; i <= gridSteps; i++) {
        const y = padding.top + (chartH / gridSteps) * i;
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y labels
        const val = maxVal - (maxVal / gridSteps) * i;
        ctx.fillStyle = isDark ? 'rgba(218, 226, 253, 0.5)' : 'rgba(100,116,139,0.8)';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${(val / 1000).toFixed(0)}K`, padding.left - 10, y + 4);
      }

      // X labels
      revenueData.forEach((d, i) => {
        const x = padding.left + (chartW / (revenueData.length - 1)) * i;
        ctx.fillStyle = isDark ? 'rgba(218, 226, 253, 0.5)' : 'rgba(100,116,139,0.8)';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.month, x, height - 10);
      });

      // Area gradient
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.08)');
      gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

      // Draw area
      ctx.beginPath();
      revenueData.forEach((d, i) => {
        const x = padding.left + (chartW / (revenueData.length - 1)) * i;
        const rawY = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
        const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH * eased;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = padding.left + (chartW / (revenueData.length - 1)) * (i - 1);
          const prevY = padding.top + chartH - ((revenueData[i - 1].value - minVal) / (maxVal - minVal)) * chartH * eased;
          const cpx1 = prevX + (x - prevX) / 3;
          const cpx2 = prevX + 2 * (x - prevX) / 3;
          ctx.bezierCurveTo(cpx1, prevY, cpx2, y, x, y);
        }
      });
      const lastX = padding.left + chartW;
      const firstX = padding.left;
      ctx.lineTo(lastX, padding.top + chartH);
      ctx.lineTo(firstX, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      revenueData.forEach((d, i) => {
        const x = padding.left + (chartW / (revenueData.length - 1)) * i;
        const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH * eased;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = padding.left + (chartW / (revenueData.length - 1)) * (i - 1);
          const prevY = padding.top + chartH - ((revenueData[i - 1].value - minVal) / (maxVal - minVal)) * chartH * eased;
          const cpx1 = prevX + (x - prevX) / 3;
          const cpx2 = prevX + 2 * (x - prevX) / 3;
          ctx.bezierCurveTo(cpx1, prevY, cpx2, y, x, y);
        }
      });
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw dots
      revenueData.forEach((d, i) => {
        const x = padding.left + (chartW / (revenueData.length - 1)) * i;
        const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH * eased;

        if (hoveredPoint === i) {
          // Glow
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
          ctx.fill();

          // Tooltip
          const tooltipText = `₹${d.value.toLocaleString()}`;
          ctx.font = 'bold 12px Inter, sans-serif';
          const tw = ctx.measureText(tooltipText).width + 16;
          const tx = x - tw / 2;
          const ty = y - 35;

          ctx.fillStyle = isDark ? '#2d3449' : '#1e293b';
          ctx.beginPath();
          ctx.roundRect(tx, ty, tw, 24, 6);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(tooltipText, x, ty + 16);
        }

        ctx.beginPath();
        ctx.arc(x, y, hoveredPoint === i ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, hoveredPoint === i ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#0b1326' : '#fff';
        ctx.fill();
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [hoveredPoint]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 20 };
    const chartW = rect.width - padding.left - padding.right;
    const step = chartW / (revenueData.length - 1);

    let closest = -1;
    let minDist = Infinity;
    revenueData.forEach((_, i) => {
      const px = padding.left + step * i;
      const dist = Math.abs(x - px);
      if (dist < minDist && dist < 20) {
        minDist = dist;
        closest = i;
      }
    });
    setHoveredPoint(closest >= 0 ? closest : null);
  };

  return (
    <div className="chart-card revenue-chart">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Revenue Overview</h3>
          <p className="chart-subtitle">Monthly revenue performance</p>
        </div>
        <div className="chart-range-btns">
          {['7D', '1M', '6M', '12M'].map(range => (
            <button
              key={range}
              className={`range-btn ${activeRange === range ? 'active' : ''}`}
              onClick={() => setActiveRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="revenue-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />
      </div>
    </div>
  );
};

export default RevenueChart;

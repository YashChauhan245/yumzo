import { useEffect, useRef, useState } from 'react';

const orderTypes = [
  { label: 'Delivery', value: 45, color: '#3A3A3A' },
  { label: 'Pickup', value: 25, color: '#3b82f6' },
  { label: 'Dine-in', value: 18, color: '#22c55e' },
  { label: 'Scheduled', value: 12, color: '#8b5cf6' },
];

const OrdersDonut = () => {
  const canvasRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
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
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    const innerRadius = radius * 0.65;

    const total = orderTypes.reduce((acc, d) => acc + d.value, 0);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    let progress = 0;
    const duration = 50;

    const animate = () => {
      progress = Math.min(progress + 1 / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ctx.clearRect(0, 0, width, height);

      let currentAngle = -Math.PI / 2;

      orderTypes.forEach((segment, i) => {
        const sliceAngle = (segment.value / total) * Math.PI * 2 * eased;
        const isHovered = hoveredSegment === i;
        const r = isHovered ? radius + 6 : radius;
        const ir = isHovered ? innerRadius - 3 : innerRadius;

        ctx.beginPath();
        ctx.arc(cx, cy, r, currentAngle, currentAngle + sliceAngle);
        ctx.arc(cx, cy, ir, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();

        ctx.fillStyle = segment.color;
        if (isHovered) {
          ctx.shadowColor = segment.color;
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        currentAngle += sliceAngle;
      });

      // Center text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.fillStyle = isDark ? '#dae2fd' : '#0f172a';
      ctx.font = 'bold 28px Manrope, sans-serif';
      ctx.fillText(total.toString(), cx, cy - 2);
      ctx.fillStyle = isDark ? 'rgba(218,226,253,0.5)' : 'rgba(100,116,139,0.8)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Total Orders', cx, cy + 18);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [hoveredSegment]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const radius = Math.min(rect.width, rect.height) / 2 - 30;
    const innerRadius = radius * 0.65;

    if (dist < innerRadius || dist > radius + 10) {
      setHoveredSegment(null);
      return;
    }

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    const total = orderTypes.reduce((acc, d) => acc + d.value, 0);
    let cumAngle = 0;

    for (let i = 0; i < orderTypes.length; i++) {
      cumAngle += (orderTypes[i].value / total) * Math.PI * 2;
      if (angle <= cumAngle) {
        setHoveredSegment(i);
        return;
      }
    }
  };

  return (
    <div className="chart-card donut-chart">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Order Distribution</h3>
          <p className="chart-subtitle">By order type</p>
        </div>
      </div>
      <div className="donut-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="donut-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredSegment(null)}
        />
      </div>
      <div className="donut-legend">
        {orderTypes.map((type, i) => (
          <div
            key={type.label}
            className={`legend-item ${hoveredSegment === i ? 'highlighted' : ''}`}
            onMouseEnter={() => setHoveredSegment(i)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <span className="legend-dot" style={{ background: type.color }}></span>
            <span className="legend-label">{type.label}</span>
            <span className="legend-value">{type.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersDonut;

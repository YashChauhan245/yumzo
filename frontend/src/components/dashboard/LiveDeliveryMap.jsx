import { useEffect, useRef } from 'react';

const deliveryAgents = [
  { id: 1, name: 'Ravi K.', lat: 19.076, lng: 72.877, status: 'delivering' },
  { id: 2, name: 'Priya M.', lat: 19.082, lng: 72.891, status: 'delivering' },
  { id: 3, name: 'Amit S.', lat: 19.069, lng: 72.862, status: 'idle' },
  { id: 4, name: 'Neha R.', lat: 19.091, lng: 72.885, status: 'delivering' },
  { id: 5, name: 'Vikram P.', lat: 19.073, lng: 72.898, status: 'idle' },
];

const LiveDeliveryMap = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);

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
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const animate = () => {
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw grid / map background
      const gridColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      const gridSize = 30;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw some "road" lines
      const roadColor = isDark ? 'rgba(58, 58, 58, 0.24)' : 'rgba(58, 58, 58, 0.2)';
      ctx.strokeStyle = roadColor;
      ctx.lineWidth = 2;

      // Horizontal roads
      [height * 0.3, height * 0.5, height * 0.7].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });

      // Vertical roads
      [width * 0.25, width * 0.5, width * 0.75].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      });

      // Draw delivery agents
      deliveryAgents.forEach((agent, i) => {
        const baseX = (i * 0.18 + 0.12) * width;
        const baseY = (i * 0.15 + 0.15) * height;

        // Movement animation
        const x = baseX + Math.sin(timeRef.current + i * 1.5) * 15;
        const y = baseY + Math.cos(timeRef.current * 0.8 + i * 2) * 10;

        const isDelivering = agent.status === 'delivering';
        const color = isDelivering ? '#3A3A3A' : '#22c55e';

        // Pulse ring for delivering agents
        if (isDelivering) {
          const pulseRadius = 12 + Math.sin(timeRef.current * 3 + i) * 6;
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(58, 58, 58, ${0.24 - Math.sin(timeRef.current * 3 + i) * 0.08})`;
          ctx.fill();
        }

        // Agent dot
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Inner white dot
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#0b1326' : '#fff';
        ctx.fill();

        // Agent label
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = isDark ? 'rgba(218,226,253,0.7)' : 'rgba(30,41,59,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, x, y + 18);
      });

      // Draw "Restaurant" markers
      const restaurantPositions = [
        { x: width * 0.25, y: height * 0.3, name: 'Spice Garden' },
        { x: width * 0.75, y: height * 0.5, name: 'Pizza Palace' },
        { x: width * 0.5, y: height * 0.7, name: 'Sushi World' },
      ];

      restaurantPositions.forEach(r => {
        // Building icon
        ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        ctx.roundRect(r.x - 10, r.y - 10, 20, 20, 4);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.font = '14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏪', r.x, r.y + 5);

        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = isDark ? 'rgba(147,204,255,0.6)' : 'rgba(59,130,246,0.6)';
        ctx.fillText(r.name, r.x, r.y + 22);
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="live-map-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Live Delivery Map</h3>
          <p className="chart-subtitle">Real-time tracking</p>
        </div>
        <div className="map-legend">
          <span className="map-legend-item">
            <span className="legend-dot" style={{ background: '#3A3A3A' }}></span>
            Delivering
          </span>
          <span className="map-legend-item">
            <span className="legend-dot" style={{ background: '#22c55e' }}></span>
            Idle
          </span>
        </div>
      </div>
      <div className="map-canvas-wrap">
        <canvas ref={canvasRef} className="map-canvas" />
        <div className="map-overlay-stats">
          <div className="map-stat">
            <span className="map-stat-num">3</span>
            <span className="map-stat-label">Active routes</span>
          </div>
          <div className="map-stat">
            <span className="map-stat-num">5</span>
            <span className="map-stat-label">Online agents</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDeliveryMap;

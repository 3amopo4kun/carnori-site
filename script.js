(() => {
  const root = document.documentElement;
  const body = document.body;
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d', { alpha: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileMq = window.matchMedia('(max-width: 760px)');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rafId = 0;
  let lastTime = 0;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const GOLD = [
    [255, 220, 135],
    [245, 181, 68],
    [220, 137, 30],
    [176, 96, 12]
  ];

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildParticles();
  }

  function buildParticles() {
    const mobile = mobileMq.matches;
    const count = reduceMotion.matches ? 0 : Math.min(
      mobile ? 30 : 58,
      Math.max(mobile ? 22 : 42, Math.round((width * height) / 26000))
    );

    particles = Array.from({ length: count }, (_, i) => {
      const depth = 0.25 + Math.random() * 0.75;
      const color = GOLD[Math.floor(Math.random() * GOLD.length)];

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: depth,
        r: 0.45 + Math.random() * 1.25 * depth,
        vx: (-0.018 + Math.random() * 0.036) * depth,
        vy: (-0.045 - Math.random() * 0.075) * depth,
        a: 0.08 + Math.random() * 0.38 * depth,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.0006 + Math.random() * 0.0012,
        color
      };
    });
  }

  function updatePointer(e) {
    if (mobileMq.matches || reduceMotion.matches) return;
    targetX = ((e.clientX / width) - 0.5) * 2;
    targetY = ((e.clientY / height) - 0.5) * 2;
  }

  function resetPointer() {
    targetX = 0;
    targetY = 0;
  }

  function drawParticles(time, delta) {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;

      if (p.y < -12) {
        p.y = height + 12;
        p.x = Math.random() * width;
      }
      if (p.x < -12) p.x = width + 12;
      if (p.x > width + 12) p.x = -12;

      const shimmer = 0.58 + Math.sin(time * p.twinkle + p.phase) * 0.42;
      const alpha = Math.max(0.015, p.a * shimmer);
      const [r, g, b] = p.color;

      const parallaxX = currentX * 8 * p.z;
      const parallaxY = currentY * 4 * p.z;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.arc(p.x + parallaxX, p.y + parallaxY, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (p.z > 0.78 && alpha > 0.16) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.22})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(p.x + parallaxX - p.r * 3.6, p.y + parallaxY);
        ctx.lineTo(p.x + parallaxX + p.r * 3.6, p.y + parallaxY);
        ctx.stroke();
      }
    }
  }

  function frame(time) {
    const delta = Math.min(32, lastTime ? time - lastTime : 16);
    lastTime = time;

    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;

    root.style.setProperty('--px', currentX.toFixed(4));
    root.style.setProperty('--py', currentY.toFixed(4));

    if (!reduceMotion.matches) {
      drawParticles(time, delta);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (!rafId) {
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    }
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener('pointermove', updatePointer, { passive: true });
  window.addEventListener('pointerleave', resetPointer, { passive: true });
  window.addEventListener('blur', resetPointer);
  window.addEventListener('resize', resizeCanvas, { passive: true });

  reduceMotion.addEventListener?.('change', () => {
    resizeCanvas();
  });

  mobileMq.addEventListener?.('change', () => {
    resetPointer();
    resizeCanvas();
  });

  window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();

    requestAnimationFrame(() => {
      body.classList.add('is-ready');
    });

    start();
  });
})();

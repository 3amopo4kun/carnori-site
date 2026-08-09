window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  const root = document.documentElement;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const render = () => {
    cx += (tx - cx) * 0.075;
    cy += (ty - cy) * 0.075;
    root.style.setProperty('--mx', cx.toFixed(3));
    root.style.setProperty('--my', cy.toFixed(3));
    if (Math.abs(tx-cx) > .003 || Math.abs(ty-cy) > .003) raf = requestAnimationFrame(render);
    else raf = 0;
  };
  window.addEventListener('pointermove', (e) => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
    if (!raf) raf = requestAnimationFrame(render);
  }, {passive:true});
  window.addEventListener('pointerleave', () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(render);
  });
});

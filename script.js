document.documentElement.classList.add('js');

window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.body.classList.add('is-ready');
  });
});

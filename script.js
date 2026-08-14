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
  window.addEventListener('resize', () => { resizeCanvas(); scheduleLogoRender(); }, { passive: true });

  reduceMotion.addEventListener?.('change', () => {
    resizeCanvas();
  });

  mobileMq.addEventListener?.('change', () => {
    resetPointer();
    resizeCanvas();
  });


  // ------------------------------------------------------------
  // CARNORI CN: runtime-rendered static polished 3D metal.
  // The PNG is used ONLY as the exact silhouette/mask.
  // No animated shine, no duplicate moving logo layers.
  // ------------------------------------------------------------
  const logoSource = document.getElementById('cn-source');
  const logoCanvas = document.getElementById('cn-3d');
  let logoRenderTimer = 0;

  function makeTintedMask(maskCanvas, width, height, paint) {
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const g = c.getContext('2d');
    g.drawImage(maskCanvas, 0, 0);
    g.globalCompositeOperation = 'source-in';
    if (typeof paint === 'string') {
      g.fillStyle = paint;
    } else {
      g.fillStyle = paint(g, width, height);
    }
    g.fillRect(0, 0, width, height);
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  function makeOffsetEdge(maskCanvas, width, height, dx, dy, color) {
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const g = c.getContext('2d');
    g.drawImage(maskCanvas, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(maskCanvas, dx, dy);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, width, height);
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  function renderLogo3D() {
    if (!logoSource || !logoCanvas || !logoSource.complete || !logoSource.naturalWidth) return;

    const stage = logoCanvas.parentElement.getBoundingClientRect();
    if (!stage.width || !stage.height) return;

    // High-res runtime render so the extruded walls are continuous and smooth.
    const ldpr = Math.min(window.devicePixelRatio || 1, 2.25);
    const cssW = stage.width * 1.22;
    const cssH = stage.height * 1.20;
    const W = Math.max(420, Math.round(cssW * ldpr));
    const H = Math.max(360, Math.round(cssH * ldpr));

    logoCanvas.width = W;
    logoCanvas.height = H;
    const g = logoCanvas.getContext('2d', {alpha:true});
    g.setTransform(1,0,0,1,0,0);
    g.clearRect(0,0,W,H);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';

    // Front face placement. Extra room on the left/bottom is reserved for depth.
    const faceW = W * 0.79;
    const faceH = faceW * (logoSource.naturalHeight / logoSource.naturalWidth);
    const depth = Math.max(26, Math.round(faceW * 0.060));
    const totalDX = -depth * 0.66;   // back + left
    const totalDY =  depth * 0.54;   // back + down
    const faceX = (W - faceW) * 0.55 - totalDX * 0.20;
    const faceY = (H - faceH) * 0.43 - totalDY * 0.16;

    // Exact shape mask at target resolution.
    const mask = document.createElement('canvas');
    mask.width = Math.round(faceW);
    mask.height = Math.round(faceH);
    const mg = mask.getContext('2d');
    mg.imageSmoothingEnabled = true;
    mg.imageSmoothingQuality = 'high';
    mg.drawImage(logoSource, 0, 0, mask.width, mask.height);
    mg.globalCompositeOperation = 'source-in';
    mg.fillStyle = '#fff';
    mg.fillRect(0,0,mask.width,mask.height);
    mg.globalCompositeOperation = 'source-over';

    // Deep amber/brown side wall with a fixed vertical metal reflection.
    const side = makeTintedMask(mask, mask.width, mask.height, (sg, sw, sh) => {
      const gr = sg.createLinearGradient(0, 0, sw, sh * .35);
      gr.addColorStop(0.00, '#2a1200');
      gr.addColorStop(0.13, '#6d3503');
      gr.addColorStop(0.28, '#a85d08');
      gr.addColorStop(0.43, '#4b2302');
      gr.addColorStop(0.61, '#8b4706');
      gr.addColorStop(0.78, '#3b1a00');
      gr.addColorStop(1.00, '#160900');
      return gr;
    });

    // Continuous extrusion: 100 sub-pixel slices, back-left/down as requested.
    const slices = 100;
    for (let i = slices; i >= 1; i--) {
      const t = i / slices;
      const sx = faceX + totalDX * t;
      const sy = faceY + totalDY * t;
      g.globalAlpha = 0.91 + (1-t) * 0.08;
      g.drawImage(side, sx, sy);
    }
    g.globalAlpha = 1;

    // Narrow warm line where the face meets the side wall.
    const backRim = makeOffsetEdge(mask, mask.width, mask.height,
      Math.max(2, Math.round(3.0*ldpr)),
      -Math.max(2, Math.round(2.0*ldpr)),
      'rgba(96,45,2,.85)');
    g.drawImage(backRim, faceX + totalDX*.08, faceY + totalDY*.08);

    // Front face: large, fixed mirror reflections rather than a moving stripe.
    const face = makeTintedMask(mask, mask.width, mask.height, (fg, fw, fh) => {
      const gr = fg.createLinearGradient(0, fh*.05, fw, fh*.88);
      gr.addColorStop(0.00, '#8b520a');
      gr.addColorStop(0.075,'#f3c85f');
      gr.addColorStop(0.145,'#fff1ad');
      gr.addColorStop(0.225,'#d8961b');
      gr.addColorStop(0.335,'#6b3702');
      gr.addColorStop(0.455,'#d89418');
      gr.addColorStop(0.565,'#f6cb67');
      gr.addColorStop(0.655,'#744005');
      gr.addColorStop(0.755,'#d8951d');
      gr.addColorStop(0.845,'#fff0a7');
      gr.addColorStop(0.925,'#c57b0d');
      gr.addColorStop(1.00, '#704004');
      return gr;
    });
    g.drawImage(face, faceX, faceY);

    // Fixed broad mirror patches clipped to the front face.
    const reflection = document.createElement('canvas');
    reflection.width = mask.width; reflection.height = mask.height;
    const rg = reflection.getContext('2d');
    rg.drawImage(mask,0,0);
    rg.globalCompositeOperation='source-in';
    const refl = rg.createLinearGradient(0,0,mask.width,mask.height*.18);
    refl.addColorStop(0.00,'rgba(255,255,255,0)');
    refl.addColorStop(0.12,'rgba(255,247,206,.20)');
    refl.addColorStop(0.21,'rgba(255,255,241,.48)');
    refl.addColorStop(0.31,'rgba(255,236,166,.06)');
    refl.addColorStop(0.46,'rgba(70,31,0,.26)');
    refl.addColorStop(0.58,'rgba(255,227,133,.16)');
    refl.addColorStop(0.72,'rgba(255,252,218,.38)');
    refl.addColorStop(0.82,'rgba(82,36,0,.18)');
    refl.addColorStop(1,'rgba(255,255,255,0)');
    rg.fillStyle=refl; rg.fillRect(0,0,mask.width,mask.height);
    rg.globalCompositeOperation='source-over';
    g.globalCompositeOperation='screen';
    g.globalAlpha=.56;
    g.drawImage(reflection,faceX,faceY);
    g.globalAlpha=1;
    g.globalCompositeOperation='source-over';

    // Crisp bevel all around the outer AND inner contours.
    const bevelPx = Math.max(3, Math.round(3.8 * ldpr));
    const hi = makeOffsetEdge(mask, mask.width, mask.height, bevelPx, bevelPx, 'rgba(255,247,199,.92)');
    const low = makeOffsetEdge(mask, mask.width, mask.height, -bevelPx, -bevelPx, 'rgba(72,31,0,.72)');
    g.globalAlpha=.78; g.drawImage(hi,faceX,faceY);
    g.globalAlpha=.68; g.drawImage(low,faceX,faceY);
    g.globalAlpha=1;

    // Hairline polished rim.
    const rimPx = Math.max(1, Math.round(1.2 * ldpr));
    const rim = makeOffsetEdge(mask, mask.width, mask.height, rimPx, rimPx, 'rgba(255,249,219,.78)');
    g.globalAlpha=.68; g.drawImage(rim,faceX,faceY); g.globalAlpha=1;
  }

  function scheduleLogoRender() {
    clearTimeout(logoRenderTimer);
    logoRenderTimer = setTimeout(renderLogo3D, 80);
  }

  window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();

    // Always reveal the page even if the optional legacy 3D-logo
    // elements are not present in the current HTML.
    requestAnimationFrame(() => {
      body.classList.add('is-ready');
    });

    if (logoSource && logoCanvas) {
      if (logoSource.complete) renderLogo3D();
      else logoSource.addEventListener('load', renderLogo3D, {once:true});
    }

    start();
  });
})();

// ------------------------------------------------------------
// CARNORI closed tester portal.
// Uses only the public tester API. No secrets are stored in the site.
// ------------------------------------------------------------
(() => {
  const API = 'https://api.carnori.ru';
  const portal = document.getElementById('tester-portal');
  const openButton = document.getElementById('tester-entry');
  if (!portal || !openButton) return;

  const statusEl = document.getElementById('tester-status');
  const authView = document.getElementById('tester-auth-view');
  const accountView = document.getElementById('tester-account-view');
  const phoneForm = document.getElementById('tester-phone-form');
  const codeForm = document.getElementById('tester-code-form');
  const phoneInput = document.getElementById('tester-phone');
  const codeInput = document.getElementById('tester-code');
  const codeNote = document.getElementById('tester-code-note');
  const requestCodeButton = document.getElementById('tester-request-code');
  const requestApkButton = document.getElementById('tester-request-apk');
  const downloadApk = document.getElementById('tester-download-apk');
  const requestCard = document.getElementById('tester-request-card');
  const maskedPhone = document.getElementById('tester-phone-masked');
  const supportEmail = document.getElementById('tester-support-email');
  const legalChecks = [
    document.getElementById('tester-terms'),
    document.getElementById('tester-privacy'),
    document.getElementById('tester-consent'),
    document.getElementById('tester-age')
  ];

  let config = null;
  let csrf = '';
  let currentPhone = '';

  function setStatus(message, kind = '') {
    statusEl.textContent = message;
    statusEl.classList.remove('is-error', 'is-good');
    if (kind) statusEl.classList.add(kind);
  }

  function phoneLooksValid() {
    const digits = phoneInput.value.replace(/\D/g, '');
    return /^(?:7|8)\d{10}$/.test(digits);
  }

  function canRequestVerification() {
    const registrationOpen = Boolean(config?.registration_open);
    const verificationAvailable = Boolean(config?.phone_verification_available ?? config?.sms_available);
    return registrationOpen
      && verificationAvailable
      && phoneLooksValid()
      && legalChecks.every(item => item?.checked);
  }

  function syncRequestCodeButton() {
    if (!requestCodeButton || requestCodeButton.dataset.busy === '1') return;
    requestCodeButton.disabled = !canRequestVerification();
  }

  function setBusy(button, busy) {
    if (!button) return;
    if (busy) {
      if (!button.dataset.label) button.dataset.label = button.textContent;
      button.dataset.busy = '1';
      button.disabled = true;
      button.textContent = 'Подождите…';
    } else {
      delete button.dataset.busy;
      if (button.dataset.label) button.textContent = button.dataset.label;
      if (button === requestCodeButton) syncRequestCodeButton();
      else button.disabled = false;
    }
  }

  async function api(path, options = {}) {
    const response = await fetch(API + path, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? {'Content-Type': 'application/json'} : {}),
        ...(options.headers || {})
      }
    });

    const type = response.headers.get('content-type') || '';
    let payload = null;
    if (type.includes('application/json')) {
      try { payload = await response.json(); } catch (_) { payload = null; }
    }
    if (!response.ok) {
      const detail = payload && payload.detail ? payload.detail : `Ошибка сервера ${response.status}`;
      const error = new Error(detail);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function showAuth() {
    authView.hidden = false;
    accountView.hidden = true;
  }

  function showAccount(payload) {
    authView.hidden = true;
    accountView.hidden = false;
    csrf = payload.csrf_token || '';
    maskedPhone.textContent = payload.tester?.phone_masked || 'Подтверждённый номер';
    renderRequest(payload.apk_request || null);
  }

  function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function renderRequest(request) {
    requestApkButton.hidden = true;
    downloadApk.hidden = true;

    if (!request) {
      requestCard.innerHTML = '<span class="tester-state">Доступ не запрошен</span><br>Отправьте заявку. После подтверждения в Control Center здесь появится доступ к тестовой версии.';
      requestApkButton.hidden = false;
      return;
    }

    const note = request.decision_note ? `<br><br>${escapeText(request.decision_note)}` : '';
    if (request.status === 'pending') {
      requestCard.innerHTML = '<span class="tester-state">На рассмотрении</span><br><strong>Заявка отправлена</strong><br>Ожидайте подтверждения администратора CARNORI.';
      return;
    }
    if (request.status === 'rejected') {
      requestCard.innerHTML = `<span class="tester-state">Отклонено</span><br><strong>Доступ пока не предоставлен</strong>${note}`;
      requestApkButton.hidden = false;
      requestApkButton.textContent = 'Отправить заявку повторно';
      return;
    }
    if (request.status === 'approved') {
      const release = request.release || {};
      const code = request.enrollment_code || '';
      const version = release.version_name ? `Версия APK: <strong>${escapeText(release.version_name)}</strong><br>` : '';
      const enroll = code ? `<div class="tester-enrollment">Одноразовый код регистрации<code>${escapeText(code)}</code></div>` : '';
      requestCard.innerHTML = `<span class="tester-state">Одобрено</span><br><strong>Доступ открыт</strong><br>${version}Скачайте APK и используйте код при первичной регистрации.${enroll}`;
      if (release.download_url) downloadApk.hidden = false;
      return;
    }

    requestCard.innerHTML = `<span class="tester-state">${escapeText(request.status)}</span><br>Статус заявки обновляется.`;
  }

  async function loadPortal() {
    setStatus('Подключение к CARNORI…');
    try {
      config = await api('/api/v1/testers/config');
      const email = config?.support_email || 'carnori@mail.ru';
      supportEmail.textContent = email;
      supportEmail.href = `mailto:${email}`;

      try {
        const me = await api('/api/v1/testers/me');
        showAccount(me);
        setStatus('Защищённая сессия активна', 'is-good');
        return;
      } catch (error) {
        if (error.status !== 401) throw error;
      }

      showAuth();
      const registrationOpen = Boolean(config?.registration_open);
      const verificationAvailable = Boolean(config?.phone_verification_available ?? config?.sms_available);
      const verificationMode = config?.verification_mode || 'call';
      requestCodeButton.textContent = verificationMode === 'call' ? 'Получить звонок' : 'Получить код';
      syncRequestCodeButton();
      if (!registrationOpen) {
        setStatus('Регистрация тестировщиков временно закрыта', 'is-error');
      } else if (!verificationAvailable) {
        setStatus('Кабинет готов. Подтверждение телефона пока подключается');
      } else {
        setStatus('Введите номер телефона и примите документы');
      }
    } catch (error) {
      showAuth();
      requestCodeButton.disabled = true;
      setStatus(error.message || 'Не удалось связаться с сервером CARNORI', 'is-error');
    }
  }

  function openPortal() {
    portal.classList.add('is-open');
    portal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tester-open');
    loadPortal();
    setTimeout(() => {
      const target = accountView.hidden ? phoneInput : document.getElementById('tester-logout');
      target?.focus({preventScroll:true});
    }, 120);
  }

  function closePortal() {
    portal.classList.remove('is-open');
    portal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tester-open');
    openButton.focus({preventScroll:true});
  }

  openButton.addEventListener('click', openPortal);
  phoneInput.addEventListener('input', syncRequestCodeButton);
  phoneInput.addEventListener('change', syncRequestCodeButton);
  legalChecks.forEach(item => item?.addEventListener('change', syncRequestCodeButton));
  syncRequestCodeButton();

  portal.querySelectorAll('[data-tester-close]').forEach(el => el.addEventListener('click', closePortal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && portal.classList.contains('is-open')) closePortal();
  });

  phoneForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!config) return;
    if (!legalChecks.every(item => item?.checked)) {
      setStatus('Примите документы и подтвердите совершеннолетие', 'is-error');
      syncRequestCodeButton();
      return;
    }

    currentPhone = phoneInput.value.trim();
    if (!phoneLooksValid()) {
      setStatus('Введите корректный российский номер телефона', 'is-error');
      syncRequestCodeButton();
      return;
    }

    setBusy(requestCodeButton, true);
    try {
      const versions = config.documents?.current_versions || {};
      const result = await api('/api/v1/testers/auth/request-code', {
        method: 'POST',
        body: JSON.stringify({
          phone: currentPhone,
          terms_accepted: true,
          privacy_acknowledged: true,
          personal_data_consent_accepted: true,
          age_confirmed: true,
          terms_version: versions.terms || '',
          privacy_version: versions.privacy || '',
          consent_version: versions.consent || '',
          website: ''
        })
      });
      phoneForm.hidden = true;
      codeForm.hidden = false;
      codeNote.textContent = `Код отправлен на ${result.phone_masked || 'указанный номер'}. Он действует ограниченное время.`;
      const mode = result?.verification_mode || config?.verification_mode || 'call';
      if (mode === 'call') {
        codeInput.maxLength = 4;
        codeInput.pattern = '[0-9]{4}';
        codeInput.placeholder = '0000';
        codeNote.textContent = `На ${result.phone_masked || currentPhone} поступит звонок. Отвечать не нужно. Введите последние 4 цифры номера, с которого звонят.`;
        setStatus('Ждём звонок. Введите последние 4 цифры номера звонящего', 'is-good');
      } else {
        codeInput.maxLength = 6;
        codeInput.pattern = '[0-9]{6}';
        codeInput.placeholder = '000000';
        setStatus('Введите шестизначный код из SMS', 'is-good');
      }
      setTimeout(() => codeInput.focus(), 80);
    } catch (error) {
      setStatus(error.message, 'is-error');
    } finally {
      setBusy(requestCodeButton, false);
      syncRequestCodeButton();
    }
  });

  codeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const code = codeInput.value.replace(/\D/g, '');
    const expectedLength = (config?.verification_mode || 'call') === 'call' ? 4 : 6;
    if (code.length !== expectedLength) {
      setStatus(expectedLength === 4 ? 'Введите последние 4 цифры номера звонящего' : 'Введите 6 цифр из SMS', 'is-error');
      return;
    }
    const button = codeForm.querySelector('.tester-primary');
    setBusy(button, true);
    try {
      const payload = await api('/api/v1/testers/auth/verify', {
        method: 'POST',
        body: JSON.stringify({phone: currentPhone, code})
      });
      showAccount(payload);
      setStatus('Номер подтверждён', 'is-good');
    } catch (error) {
      setStatus(error.message, 'is-error');
    } finally {
      setBusy(button, false);
    }
  });

  document.getElementById('tester-change-phone').addEventListener('click', () => {
    codeForm.hidden = true;
    phoneForm.hidden = false;
    codeInput.value = '';
    setStatus('Введите номер телефона');
    syncRequestCodeButton();
    phoneInput.focus();
  });

  requestApkButton.addEventListener('click', async () => {
    setBusy(requestApkButton, true);
    try {
      const payload = await api('/api/v1/testers/apk/request', {
        method: 'POST',
        headers: {'X-CSRF-Token': csrf}
      });
      showAccount(payload);
      setStatus('Заявка отправлена в Control Center', 'is-good');
    } catch (error) {
      setStatus(error.message, 'is-error');
    } finally {
      setBusy(requestApkButton, false);
    }
  });

  document.getElementById('tester-logout').addEventListener('click', async () => {
    try {
      await api('/api/v1/testers/auth/logout', {
        method: 'POST',
        headers: {'X-CSRF-Token': csrf}
      });
    } catch (_) {}
    csrf = '';
    phoneForm.hidden = false;
    codeForm.hidden = true;
    codeInput.value = '';
    showAuth();
    setStatus((config?.phone_verification_available ?? config?.sms_available) ? 'Введите номер телефона и примите документы' : 'Кабинет готов. Подтверждение телефона пока подключается');
    syncRequestCodeButton();
  });
})();

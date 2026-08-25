(() => {
  const $ = id => document.getElementById(id);
  const from = $('fromRange');
  const to = $('toRange');
  const wrap = document.querySelector('.period-card .range-wrap');
  if (!from || !to || !wrap) return;

  const eventSecond = e => Number(e?.minute || 0) * 60 + Number(e?.second || 0);
  const getEvents = () => {
    try { return Array.isArray(events) ? events : []; } catch (_) { return []; }
  };
  const maxSeconds = () => {
    const list = getEvents();
    return Math.max(90 * 60, ...list.map(eventSecond));
  };
  const formatTime = seconds => {
    const total = Math.max(0, Math.round(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const ticks = document.createElement('div');
  ticks.className = 'period-ticks';
  wrap.appendChild(ticks);

  const halftimeGap = document.createElement('div');
  halftimeGap.className = 'halftime-gap';
  halftimeGap.setAttribute('aria-hidden', 'true');
  wrap.appendChild(halftimeGap);

  function drawScale() {
    const max = maxSeconds();
    const maxMins = max / 60;
    const labels = [0, 15, 30, 45, 60, 75, 90].filter(m => m < maxMins - 0.25);
    ticks.innerHTML = '';
    for (const mins of labels) {
      const tick = document.createElement('span');
      tick.className = 'period-tick';
      tick.textContent = String(mins);
      tick.style.left = `${(mins * 60 / max) * 100}%`;
      ticks.appendChild(tick);
    }
    const ft = document.createElement('span');
    ft.className = 'period-tick';
    ft.textContent = 'FT';
    ft.style.left = '100%';
    ticks.appendChild(ft);
    halftimeGap.style.left = `${Math.min(100, (45 * 60 / max) * 100)}%`;

    const secondStep = 100 / max;
    from.step = String(secondStep);
    to.step = String(secondStep);
  }

  function updateLabels() {
    const max = maxSeconds();
    const loSeconds = (+from.value / 100) * max;
    const hiSeconds = (+to.value / 100) * max;
    const fromLabel = loSeconds < 0.5 ? '0:00' : formatTime(loSeconds);
    const toLabel = hiSeconds >= max - 0.5 ? 'FT' : formatTime(hiSeconds);

    if ($('fromText')) $('fromText').textContent = fromLabel;
    if ($('toText')) $('toText').textContent = toLabel;
    if ($('sumFrom')) $('sumFrom').textContent = fromLabel;
    if ($('sumTo')) $('sumTo').textContent = toLabel;
    if ($('plotWindow')) $('plotWindow').textContent = `${fromLabel} - ${toLabel}`;
  }

  function refresh() {
    drawScale();
    updateLabels();
  }

  from.addEventListener('input', () => requestAnimationFrame(updateLabels));
  to.addEventListener('input', () => requestAnimationFrame(updateLabels));
  ['metric', 'team', 'player'].forEach(id => $(id)?.addEventListener('change', () => requestAnimationFrame(updateLabels)));
  ['fullBtn', 'firstBtn', 'secondBtn'].forEach(id => $(id)?.addEventListener('click', () => requestAnimationFrame(updateLabels)));

  let tries = 0;
  const ready = setInterval(() => {
    tries += 1;
    refresh();
    if (getEvents().length || tries > 30) clearInterval(ready);
  }, 100);
  refresh();
})();

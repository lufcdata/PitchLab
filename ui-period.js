(() => {
  const $ = id => document.getElementById(id);
  const from = $('fromRange');
  const to = $('toRange');
  const wrap = document.querySelector('.period-card .range-wrap');
  if (!from || !to || !wrap) return;

  const FALLBACK = { firstHalfEnd: 46 * 60 + 57, fullTime: 98 * 60 + 18 };
  let timing = { ...FALLBACK };

  const dn = v => v && typeof v === 'object' ? (v.displayName ?? v.name ?? v.value) : v;
  const eventSecond = e => Number(e?.minute || 0) * 60 + Number(e?.second || 0);
  const periodName = e => String(dn(e?.period) || '').toLowerCase().replace(/[\s_-]/g, '');
  const typeName = e => String(dn(e?.type) || '').toLowerCase().replace(/[\s_-]/g, '');
  const isFirst = e => { const p = periodName(e); return p.includes('first') || p === '1' || p === 'firsthalf'; };
  const isSecond = e => { const p = periodName(e); return p.includes('second') || p === '2' || p === 'secondhalf'; };
  const isPeriodEnd = e => { const t = typeName(e); return t === 'end' || t.includes('periodend') || t.includes('halfend') || t.includes('endperiod'); };

  const formatTime = seconds => {
    const total = Math.max(0, Math.round(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  function derive(events) {
    const list = Array.isArray(events) ? events : [];
    const first = list.filter(isFirst);
    const second = list.filter(isSecond);
    const firstEnds = first.filter(isPeriodEnd);
    const secondEnds = second.filter(isPeriodEnd);
    const firstHalfEnd = Math.max(45 * 60, ...(firstEnds.length ? firstEnds : first).map(eventSecond).filter(Number.isFinite));
    const fullTime = Math.max(90 * 60, ...(secondEnds.length ? secondEnds : (second.length ? second : list)).map(eventSecond).filter(Number.isFinite));
    return {
      firstHalfEnd: Number.isFinite(firstHalfEnd) ? firstHalfEnd : FALLBACK.firstHalfEnd,
      fullTime: Number.isFinite(fullTime) ? fullTime : FALLBACK.fullTime
    };
  }

  const ticks = document.createElement('div');
  ticks.className = 'period-ticks';
  wrap.appendChild(ticks);

  const firstAdded = document.createElement('div');
  firstAdded.className = 'period-added-segment period-added-segment--first';
  firstAdded.setAttribute('aria-hidden', 'true');
  wrap.appendChild(firstAdded);

  const secondAdded = document.createElement('div');
  secondAdded.className = 'period-added-segment period-added-segment--second';
  secondAdded.setAttribute('aria-hidden', 'true');
  wrap.appendChild(secondAdded);

  const halftimeGap = document.createElement('div');
  halftimeGap.className = 'halftime-gap';
  halftimeGap.setAttribute('aria-hidden', 'true');
  wrap.appendChild(halftimeGap);

  function addTick(label, seconds, className = '', sublabel = '') {
    const max = timing.fullTime;
    const tick = document.createElement('span');
    tick.className = `period-tick ${className}`.trim();
    tick.style.left = `${Math.min(100, Math.max(0, (seconds / max) * 100))}%`;
    tick.innerHTML = sublabel
      ? `<span class="period-tick__main">${label}</span><span class="period-tick__sub">${sublabel}</span>`
      : `<span class="period-tick__main">${label}</span>`;
    ticks.appendChild(tick);
  }

  function drawScale() {
    const max = timing.fullTime;
    ticks.innerHTML = '';

    [0, 15, 30, 45, 60, 75, 90].forEach(mins => {
      if (mins * 60 < max - 1) addTick(String(mins), mins * 60, mins === 0 ? 'period-tick--start' : '');
    });

    addTick('HT', timing.firstHalfEnd, 'period-tick--milestone', formatTime(timing.firstHalfEnd));
    addTick('FT', max, 'period-tick--milestone period-tick--end', formatTime(max));

    const pct = seconds => Math.min(100, Math.max(0, (seconds / max) * 100));
    const firstStart = pct(45 * 60);
    const firstEnd = pct(timing.firstHalfEnd);
    firstAdded.style.left = `${firstStart}%`;
    firstAdded.style.width = `${Math.max(0, firstEnd - firstStart)}%`;

    const secondStart = pct(90 * 60);
    secondAdded.style.left = `${secondStart}%`;
    secondAdded.style.width = `${Math.max(0, 100 - secondStart)}%`;

    halftimeGap.style.left = `${firstEnd}%`;

    const secondStep = 100 / max;
    from.step = String(secondStep);
    to.step = String(secondStep);
  }

  function updateLabels() {
    const max = timing.fullTime;
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

  function applyPreset(kind) {
    const max = timing.fullTime;
    if (kind === 'full') {
      from.value = 0;
      to.value = 100;
    } else if (kind === 'first') {
      from.value = 0;
      to.value = Math.min(100, (timing.firstHalfEnd / max) * 100);
    } else {
      from.value = Math.min(100, (45 * 60 / max) * 100);
      to.value = 100;
    }
    from.dispatchEvent(new Event('input', { bubbles: true }));
    to.dispatchEvent(new Event('input', { bubbles: true }));
    requestAnimationFrame(updateLabels);
  }

  function refresh() {
    drawScale();
    updateLabels();
  }

  async function loadTiming() {
    try {
      const r = await fetch('./WS_1903384_raw.json?v=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      timing = derive(data?.events);
      refresh();
    } catch (_) {
      refresh();
    }
  }

  from.addEventListener('input', () => requestAnimationFrame(updateLabels));
  to.addEventListener('input', () => requestAnimationFrame(updateLabels));
  ['metric', 'team', 'player'].forEach(id => $(id)?.addEventListener('change', () => requestAnimationFrame(updateLabels)));
  $('fullBtn')?.addEventListener('click', () => requestAnimationFrame(() => applyPreset('full')));
  $('firstBtn')?.addEventListener('click', () => requestAnimationFrame(() => applyPreset('first')));
  $('secondBtn')?.addEventListener('click', () => requestAnimationFrame(() => applyPreset('second')));

  refresh();
  loadTiming();
})();

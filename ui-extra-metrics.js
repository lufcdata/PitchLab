(() => {
  const metricSelect = document.getElementById('metric');
  if (!metricSelect || typeof FILTERS === 'undefined') return;

  const addGroup = (label, options) => {
    let group = [...metricSelect.querySelectorAll('optgroup')].find(g => g.label === label);
    if (!group) { group = document.createElement('optgroup'); group.label = label; metricSelect.appendChild(group); }
    for (const [value, text] of options) {
      if (metricSelect.querySelector(`option[value="${value}"]`)) continue;
      const o = document.createElement('option'); o.value = value; o.textContent = text; group.appendChild(o);
    }
  };

  addGroup('Attacking', [
    ['shots_head_setpiece','Shots - Head from set-pieces'],
    ['assists_corners','Assists - From corners'],
    ['assists_setpieces','Assists - From set-pieces'],
    ['high_turnovers','High Turnovers']
  ]);
  addGroup('Set-Pieces', [['free_kicks','Free-Kicks']]);
  addGroup('Duels', [
    ['duels_won','Duels Won'],['duels_lost','Duels Lost'],
    ['ground_duels_won','Ground Duels Won'],['ground_duels_lost','Ground Duels Lost'],
    ['aerial_duels_won','Aerial Duels Won'],['aerial_duels_lost','Aerial Duels Lost'],
    ['def_aerial_duels_won','Defensive Aerial Duels Won'],['def_aerial_duels_lost','Defensive Aerial Duels Lost'],
    ['att_aerial_duels_won','Attacking Aerial Duels Won'],['att_aerial_duels_lost','Attacking Aerial Duels Lost']
  ]);

  const isAerial = e => type(e) === 'Aerial' && coords(e);
  const isGroundDuel = e => ['Tackle','Challenge','TakeOn','Dispossessed'].includes(type(e)) && coords(e);
  const duelWon = e => {
    if (type(e) === 'Challenge' || type(e) === 'Dispossessed') return false;
    return success(e);
  };
  const duelLost = e => !duelWon(e);
  const isSetPieceShot = e => isShot(e) && hasQ(e,'FromCorner','SetPiece','DirectFreekick','ThrowinSetPiece') && !hasQ(e,'Penalty');
  const isSetPieceAssist = e => isAssistEvent(e) && hasQ(e,'FromCorner','SetPiece','DirectFreekick','ThrowinSetPiece');
  const isCornerAssist = e => isAssistEvent(e) && (hasQ(e,'CornerTaken','FromCorner') || (pass(e) && hasQ(e,'CornerTaken')));
  const isFreeKick = e => pass(e) && hasQ(e,'FreeKickTaken') && !hasQ(e,'CornerTaken','ThrowIn','GoalKickTaken','PenaltyTaken');

  // Opta high-turnover threshold: possession begins <=40m from the opposition goal.
  // WhoScored x is 0-100 across a 105m pitch, so the attacking threshold is x >= 61.9048.
  const HIGH_X = (65 / 105) * 100;
  const restart = e => hasQ(e,'CornerTaken','ThrowIn','GoalKickTaken','FreeKickTaken','PenaltyTaken','KickOff');
  const controlledRegain = e => {
    if (!coords(e) || Number(e.x) < HIGH_X || restart(e)) return false;
    if (['BallRecovery','Interception'].includes(type(e))) return success(e) || dn(e.outcomeType) == null;
    if (type(e) === 'Tackle') return success(e);
    return false;
  };
  const highTurnover = e => {
    if (!controlledRegain(e)) return false;
    const i = events.indexOf(e); if (i < 0) return false;
    for (let j=i-1; j>=0 && j>=i-5; j--) {
      const p=events[j];
      if (minute(e)-minute(p)>1) break;
      if (restart(p)) return false;
      if (p.teamId !== e.teamId && coords(p)) return true;
      if (p.teamId === e.teamId && (pass(p)&&success(p))) return false;
    }
    return false;
  };

  FILTERS.shots_head_setpiece = e => isSetPieceShot(e) && hasQ(e,'Head');
  FILTERS.free_kicks = isFreeKick;
  FILTERS.assists_corners = isCornerAssist;
  FILTERS.assists_setpieces = isSetPieceAssist;
  FILTERS.aerial_duels_won = e => isAerial(e) && duelWon(e);
  FILTERS.aerial_duels_lost = e => isAerial(e) && duelLost(e);
  FILTERS.ground_duels_won = e => isGroundDuel(e) && duelWon(e);
  FILTERS.ground_duels_lost = e => isGroundDuel(e) && duelLost(e);
  FILTERS.duels_won = e => (isAerial(e)||isGroundDuel(e)) && duelWon(e);
  FILTERS.duels_lost = e => (isAerial(e)||isGroundDuel(e)) && duelLost(e);
  FILTERS.def_aerial_duels_won = e => isAerial(e) && Number(e.x)<50 && duelWon(e);
  FILTERS.def_aerial_duels_lost = e => isAerial(e) && Number(e.x)<50 && duelLost(e);
  FILTERS.att_aerial_duels_won = e => isAerial(e) && Number(e.x)>=50 && duelWon(e);
  FILTERS.att_aerial_duels_lost = e => isAerial(e) && Number(e.x)>=50 && duelLost(e);
  FILTERS.high_turnovers = highTurnover;

  const oldShotArrowMetric = shotArrowMetric;
  shotArrowMetric = key => oldShotArrowMetric(key) || key === 'shots_head_setpiece';
  const oldAttackArrowMetric = attackArrowMetric;
  attackArrowMetric = key => oldAttackArrowMetric(key) || ['assists_corners','assists_setpieces'].includes(key);
  const oldLineMetric = lineMetric;
  lineMetric = key => oldLineMetric(key) || key === 'free_kicks';

  // Pitch Map Actions colour hierarchy.
  const LOST_COLOUR = '#ED1362';
  const GOAL_COLOUR = '#BDA060';
  const lostMetricKeys = new Set([
    'duels_lost','ground_duels_lost','aerial_duels_lost',
    'att_aerial_duels_lost','def_aerial_duels_lost',
    'dribbled_past','tackles_lost','takeons_unsuccess'
  ]);
  const isGoalMetric = key => key === 'goals' || key === 'own_goals' || String(key || '').startsWith('goals_');

  const baseDrawPoint = drawPoint;
  drawPoint = (root,e,colour) => {
    const key = metricSelect.value;
    return baseDrawPoint(root,e,lostMetricKeys.has(key) ? LOST_COLOUR : (isGoalMetric(key) ? GOAL_COLOUR : colour));
  };

  const baseDrawShotArrow = drawShotArrow;
  drawShotArrow = (root,e,colour,marker) => {
    const key = metricSelect.value;
    if (!isGoalMetric(key)) return baseDrawShotArrow(root,e,colour,marker);
    const defs = root.querySelector('defs');
    if (defs && !root.querySelector('#goalGoldArrow')) {
      const m = svg('marker',{id:'goalGoldArrow',markerWidth:'1.08',markerHeight:'0.78',refX:'1.0',refY:'0.39',orient:'auto',markerUnits:'userSpaceOnUse'});
      m.appendChild(svg('path',{d:'M0,0 L1.04,0.39 L0,0.78 Z',fill:GOAL_COLOUR}));
      defs.appendChild(m);
    }
    return baseDrawShotArrow(root,e,GOAL_COLOUR,'url(#goalGoldArrow)');
  };

  const baseEventPriority = eventPriority;
  eventPriority = e => {
    const goal = type(e) === 'Goal' || hasQ(e,'OwnGoal');
    return goal ? 1000 : baseEventPriority(e);
  };

  if (typeof render === 'function') render();
})();
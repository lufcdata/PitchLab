(() => {
  const metricSelect = document.getElementById('metric');
  if (!metricSelect || typeof FILTERS === 'undefined') return;

  const groupFor = label => [...metricSelect.querySelectorAll('optgroup')].find(g => g.label === label);
  const ensureGroup = label => {
    let group = groupFor(label);
    if (!group) { group = document.createElement('optgroup'); group.label = label; metricSelect.appendChild(group); }
    return group;
  };
  const ensureOption = (groupLabel, value, text) => {
    const existing = metricSelect.querySelector(`option[value="${value}"]`);
    if (existing) return existing;
    const o = document.createElement('option');
    o.value = value;
    o.textContent = text;
    ensureGroup(groupLabel).appendChild(o);
    return o;
  };
  const addGroup = (label, options) => options.forEach(([value,text]) => ensureOption(label,value,text));
  const moveOption = (value, groupLabel) => {
    const option = metricSelect.querySelector(`option[value="${value}"]`);
    if (option) ensureGroup(groupLabel).appendChild(option);
    return option;
  };
  const orderGroup = (label, orderedValues) => {
    const group = ensureGroup(label);
    const ordered = orderedValues.map(v => metricSelect.querySelector(`option[value="${v}"]`)).filter(Boolean);
    const rest = [...group.children].filter(el => el.tagName === 'OPTION' && !ordered.includes(el));
    [...ordered, ...rest].forEach(el => group.appendChild(el));
  };

  addGroup('Attacking', [
    ['shots_head_setpiece','Shots - Head from set-pieces'],
    ['assists_corners','Assists - From corners'],
    ['assists_setpieces','Assists - From set-pieces'],
    ['high_turnovers','High Turnovers']
  ]);
  addGroup('Set-Pieces', [
    ['free_kicks','Free-Kicks'],
    ['free_kicks_accurate','Accurate Free-Kicks'],
    ['free_kicks_final_third','Free-Kicks In the Final Third']
  ]);
  addGroup('Passing', [
    ['inaccurate_crosses','Inaccurate Crosses'],
    ['inaccurate_long_passes','Inaccurate Long Passes']
  ]);
  addGroup('Defensive', [
    ['blocked_passes','Blocked Passes'],
    ['blocked_crosses','Blocked Crosses'],
    ['errors','Errors']
  ]);
  addGroup('Duels', [
    ['duels_won','Duels Won'],['duels_lost','Duels Lost'],['total_duels','Total Duels'],
    ['ground_duels_won','Ground Duels Won'],['ground_duels_lost','Ground Duels Lost'],
    ['aerial_duels_won','Aerial Duels Won'],['aerial_duels_lost','Aerial Duels Lost'],
    ['def_aerial_duels_won','Defensive Aerial Duels Won'],['def_aerial_duels_lost','Defensive Aerial Duels Lost'],
    ['att_aerial_duels_won','Attacking Aerial Duels Won'],['att_aerial_duels_lost','Attacking Aerial Duels Lost'],
    ['dispossessed','Dispossessed']
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
  const isBlockedPass = e => type(e) === 'BlockedPass' && coords(e);
  const isBlockedCross = e => isBlockedPass(e) && hasQ(e,'Cross','BlockedCross');
  const isError = e => type(e) === 'Error' || hasQ(e,'LeadingToAttempt','LeadingToGoal','ErrorLeadToAttempt','ErrorLeadToGoal');

  // Opta high-turnover threshold: possession begins <=40m from the opposition goal.
  // WhoScored x is 0-100 across a 105m pitch, so the attacking threshold is x >= 61.9048.
  const HIGH_X = (65 / 105) * 100;
  const FINAL_THIRD_X = (70 / 105) * 100;
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
  FILTERS.free_kicks_accurate = e => isFreeKick(e) && success(e);
  FILTERS.free_kicks_final_third = e => isFreeKick(e) && Number(e.x) >= FINAL_THIRD_X;
  FILTERS.inaccurate_crosses = e => pass(e) && hasQ(e,'Cross') && !success(e);
  FILTERS.inaccurate_long_passes = e => pass(e) && hasQ(e,'Longball','LongBall') && !success(e);
  FILTERS.blocked_passes = isBlockedPass;
  FILTERS.blocked_crosses = isBlockedCross;
  FILTERS.dispossessed = e => type(e) === 'Dispossessed' && coords(e);
  FILTERS.errors = e => isError(e) && coords(e);
  FILTERS.assists_corners = isCornerAssist;
  FILTERS.assists_setpieces = isSetPieceAssist;
  FILTERS.aerial_duels_won = e => isAerial(e) && duelWon(e);
  FILTERS.aerial_duels_lost = e => isAerial(e) && duelLost(e);
  FILTERS.ground_duels_won = e => isGroundDuel(e) && duelWon(e);
  FILTERS.ground_duels_lost = e => isGroundDuel(e) && duelLost(e);
  FILTERS.duels_won = e => (isAerial(e)||isGroundDuel(e)) && duelWon(e);
  FILTERS.duels_lost = e => (isAerial(e)||isGroundDuel(e)) && duelLost(e);
  FILTERS.total_duels = e => isAerial(e) || isGroundDuel(e);
  FILTERS.def_aerial_duels_won = e => isAerial(e) && Number(e.x)<50 && duelWon(e);
  FILTERS.def_aerial_duels_lost = e => isAerial(e) && Number(e.x)<50 && duelLost(e);
  FILTERS.att_aerial_duels_won = e => isAerial(e) && Number(e.x)>=50 && duelWon(e);
  FILTERS.att_aerial_duels_lost = e => isAerial(e) && Number(e.x)>=50 && duelLost(e);
  FILTERS.high_turnovers = highTurnover;

  const oldShotArrowMetric = shotArrowMetric;
  shotArrowMetric = key => oldShotArrowMetric(key) || ['shots_head_setpiece','shots_penalty_area'].includes(key);
  const oldAttackArrowMetric = attackArrowMetric;
  attackArrowMetric = key => oldAttackArrowMetric(key) || ['assists_corners','assists_setpieces'].includes(key);
  const oldLineMetric = lineMetric;
  lineMetric = key => oldLineMetric(key) || [
    'free_kicks','free_kicks_accurate','free_kicks_final_third',
    'inaccurate_crosses','inaccurate_long_passes'
  ].includes(key);

  // Metric-list housekeeping. Key Passes remains available internally for legacy bindings,
  // but is intentionally hidden from the user-facing selector.
  metricSelect.querySelector('option[value="keypasses"]')?.remove();
  moveOption('assists_corners','Corners');

  orderGroup('Passing', [
    'successful','unsuccessful','allpasses','progressive','forward','forward_success','side','side_success',
    'backward','backward_success','into_final_third','into_final_third_success','final_third_passes',
    'final_third_passes_success','box_passes','box_passes_success','crosses','accurate_crosses','inaccurate_crosses',
    'open_play_crosses','accurate_open_play_crosses','long_passes','accurate_long_passes','inaccurate_long_passes'
  ]);
  orderGroup('Attacking', [
    'goals','goals_open','goals_fastbreak','goals_setpiece','goals_corner','goals_freekick','goals_penalty','own_goals',
    'goals_6yd','goals_box','goals_outside','goals_right','goals_left','goals_head','goals_other',
    'shots','shots_on','shots_off','shots_blocked','woodwork','shots_open','shots_fastbreak','shots_setpiece','shots_dfk',
    'shots_6yd','shots_box','shots_penalty_area','shots_outside','shots_right','shots_left','shots_head','shots_other','shots_head_setpiece',
    'takeons_success','takeons_unsuccess','takeons','chances_created','assists','bigchances','assists_setpieces','high_turnovers'
  ]);
  orderGroup('Corners', [
    'assists_corners','corners','corners_success','corners_unsuccess','corners_short','corners_near','corners_central',
    'corners_far','corners_overhit','corners_6yd','corner_chances'
  ]);
  orderGroup('Set-Pieces', ['free_kicks','free_kicks_accurate','free_kicks_final_third']);
  orderGroup('Defensive', [
    'tackles_won','tackles_lost','tackles','interceptions','blocks','blocked_passes','blocked_crosses','errors'
  ]);
  orderGroup('Duels', [
    'duels_won','duels_lost','total_duels','ground_duels_won','ground_duels_lost','aerial_duels_won','aerial_duels_lost',
    'def_aerial_duels_won','def_aerial_duels_lost','att_aerial_duels_won','att_aerial_duels_lost','dispossessed'
  ]);

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
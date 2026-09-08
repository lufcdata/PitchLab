#!/usr/bin/env python3
"""PitchLab cloud season ingest.

Validates one raw WhoScored fixture, creates an immutable gzip season pack,
and upserts the fixture into the season manifest. Designed for GitHub Actions;
no local Python/Terminal workflow is required for normal use.
"""
from __future__ import annotations
import argparse, gzip, hashlib, json, pathlib, re, sys

ROOT=pathlib.Path(__file__).resolve().parents[1]

def fail(msg):
    print(f"::error::{msg}", file=sys.stderr); raise SystemExit(1)

def score(data):
    value=str(data.get('ftScore') or data.get('score') or '').strip()
    return re.sub(r'\s*:\s*','–',value) or '–'

def player_dict(data):
    existing=data.get('playerIdNameDictionary')
    if isinstance(existing,dict) and existing:return existing
    out={}
    for side in ('home','away'):
        for p in (data.get(side) or {}).get('players') or []:
            if p.get('playerId') is not None and p.get('name'):out[str(p['playerId'])]=p['name']
    return out

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('raw_json'); ap.add_argument('--season',default='2026-27'); ap.add_argument('--competition',default='Premier League'); ap.add_argument('--club',default='Leeds'); args=ap.parse_args()
    src=pathlib.Path(args.raw_json)
    try:data=json.loads(src.read_text(encoding='utf-8'))
    except Exception as e:fail(f'Invalid JSON: {e}')
    events=data.get('events'); home=data.get('home') or {}; away=data.get('away') or {}
    if not isinstance(events,list) or not events:fail('Fixture contains no events')
    if not home.get('name') or not away.get('name'):fail('Fixture is missing home/away team metadata')
    home_is_club=home.get('name')==args.club; away_is_club=away.get('name')==args.club
    if home_is_club==away_is_club:fail(f'Fixture must contain {args.club} on exactly one side')
    club_side='home' if home_is_club else 'away'; club_meta=home if home_is_club else away
    if club_meta.get('teamId') is None:fail(f'{args.club} is missing teamId')
    club_team_id=club_meta.get('teamId')
    date=str(data.get('startDate') or data.get('startTime') or '')[:10]
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date):fail('Fixture has no valid YYYY-MM-DD date')
    match_id=data.get('matchId') or data.get('id')
    if not match_id:
        m=re.search(r'(\d{6,})',src.name); match_id=m.group(1) if m else None
    if not match_id:fail('Could not determine match ID')
    match_id=str(match_id)
    pack={'matchId':int(match_id) if match_id.isdigit() else match_id,'startDate':data.get('startDate'),'startTime':data.get('startTime'),'home':{'teamId':home.get('teamId'),'name':home.get('name')},'away':{'teamId':away.get('teamId'),'name':away.get('name')},'club':{'name':args.club,'side':club_side,'teamId':club_team_id},'ftScore':data.get('ftScore') or data.get('score'),'htScore':data.get('htScore'),'playerIdNameDictionary':player_dict(data),'events':events}
    payload=json.dumps(pack,separators=(',',':'),ensure_ascii=False).encode()
    outdir=ROOT/'data'/'season'/args.season; outdir.mkdir(parents=True,exist_ok=True)
    pack_path=outdir/f'{match_id}.json.gz'
    with pack_path.open('wb') as fh:
        with gzip.GzipFile(filename='',mode='wb',fileobj=fh,mtime=0,compresslevel=9) as gz:gz.write(payload)
    digest=hashlib.sha256(payload).hexdigest()
    manifest_path=outdir/'manifest.json'
    manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
    existing_team_id=manifest.get('clubTeamId')
    if existing_team_id is not None and str(existing_team_id)!=str(club_team_id):fail(f'Club teamId mismatch: manifest={existing_team_id}, fixture={club_team_id}')
    manifest['club']=args.club; manifest['clubTeamId']=club_team_id
    def crest(name):
        known={'Leeds':'assets/club-logos/leeds png.png','Brighton':'assets/club-logos/Brighton.png','Brighton & Hove Albion':'assets/club-logos/Brighton.png'}
        return known.get(name,f'assets/club-logos/{name}.png')
    entry={'matchId':int(match_id) if match_id.isdigit() else match_id,'date':date,'home':home['name'],'away':away['name'],'clubSide':club_side,'clubTeamId':club_team_id,'score':score(data),'competition':args.competition,'pack':f'data/season/{args.season}/{match_id}.json.gz','homeCrest':crest(home['name']),'awayCrest':crest(away['name']),'eventCount':len(events),'sha256':digest}
    matches=[m for m in manifest.get('matches',[]) if str(m.get('matchId'))!=match_id]; matches.append(entry); matches.sort(key=lambda m:(m.get('date',''),str(m.get('matchId','')))); manifest['matches']=matches
    manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    check=gzip.decompress(pack_path.read_bytes()); decoded=json.loads(check)
    if len(decoded.get('events',[]))!=len(events):fail('Compressed pack verification failed')
    if str((decoded.get('club') or {}).get('teamId'))!=str(club_team_id):fail('Compressed pack club identity verification failed')
    print(json.dumps({'matchId':match_id,'date':date,'fixture':f"{home['name']} {entry['score']} {away['name']}",'clubSide':club_side,'clubTeamId':club_team_id,'events':len(events),'pack':str(pack_path.relative_to(ROOT)),'sha256':digest},indent=2))
if __name__=='__main__':main()

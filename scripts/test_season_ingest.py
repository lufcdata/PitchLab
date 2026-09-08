#!/usr/bin/env python3
"""Minimal deterministic smoke test for the Season Performance ingest contract."""
import gzip, json, pathlib, subprocess, sys, tempfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
SCRIPT=ROOT/'scripts'/'season_ingest.py'

def main():
    with tempfile.TemporaryDirectory() as td:
        root=pathlib.Path(td)
        season='test-season'
        outdir=ROOT/'data'/'season'/season
        outdir.mkdir(parents=True,exist_ok=True)
        manifest=outdir/'manifest.json'
        manifest.write_text(json.dumps({'season':'test','club':'Leeds','clubTeamId':19,'matches':[]}),encoding='utf-8')
        raw=root/'WS_999999_raw.json'
        raw.write_text(json.dumps({'matchId':999999,'startDate':'2026-09-08T00:00:00','home':{'name':'Leeds','teamId':19,'players':[{'playerId':1,'name':'Test Player'}]},'away':{'name':'Test Opponent','teamId':999,'players':[]},'ftScore':'1 : 0','events':[{'id':1,'teamId':19,'playerId':1,'type':{'displayName':'Pass'},'x':10,'y':20}]}),encoding='utf-8')
        try:
            subprocess.run([sys.executable,str(SCRIPT),str(raw),'--season',season],cwd=ROOT,check=True,capture_output=True,text=True)
            pack=outdir/'999999.json.gz'
            decoded=json.loads(gzip.decompress(pack.read_bytes()))
            result=json.loads(manifest.read_text(encoding='utf-8'))
            assert decoded['club']=={'name':'Leeds','side':'home','teamId':19}
            assert len(decoded['events'])==1
            assert result['matches'][0]['matchId']==999999
            assert result['matches'][0]['clubSide']=='home'
            assert result['matches'][0]['clubTeamId']==19
            print('Season ingest smoke test passed')
        finally:
            if outdir.exists():
                import shutil; shutil.rmtree(outdir)

if __name__=='__main__':main()

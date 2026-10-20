"""Read-only source import. Run only when intentionally updating the game snapshot.
Copies definition dependencies to an isolated workspace, compiles there, then
refreshes reviewed website data. No source-game engine process is launched.
"""
from pathlib import Path
import argparse, re, shutil, subprocess, sys
p=argparse.ArgumentParser()
p.add_argument('source',type=Path)
p.add_argument('--godot',default='/Applications/Godot.app/Contents/MacOS/Godot')
a=p.parse_args();source=a.source.resolve();root=Path(__file__).resolve().parents[1]
paths=['scripts/data','scripts/battle/arena_rules.gd','assets/cards','assets/skills']
status=subprocess.check_output(['git','-C',str(source),'status','--porcelain','--',*paths],text=True)
if status.strip():raise SystemExit('Source inputs have local changes. Choose a clean source snapshot first.')
dst=root/'.work/export';(dst/'scripts/data/cards').mkdir(parents=True,exist_ok=True);(dst/'scripts/battle').mkdir(parents=True,exist_ok=True)
for path in (source/'scripts/data/cards').glob('*.gd'):shutil.copy2(path,dst/'scripts/data/cards'/path.name)
for name in ['card_schema.gd','card_definition_compiler.gd','sett_w_geometry.gd']:shutil.copy2(source/'scripts/data'/name,dst/'scripts/data'/name)
# ArenaRules refers to inherited CardDB constants. Resolve directly to the
# identical CardSchema constants, avoiding an unrelated runtime dependency.
arena=(source/'scripts/battle/arena_rules.gd').read_text().replace('CardDB.', 'preload("res://scripts/data/card_schema.gd").')
(dst/'scripts/battle/arena_rules.gd').write_text(arena)
(dst/'project.godot').write_text('config_version=5\n[application]\nconfig/name="Website content export"\n')
ids=re.findall(r'cards/(.+?)\.gd',(source/'scripts/data/card_db.gd').read_text())
script='extends SceneTree\nconst Compiler = preload("res://scripts/data/card_definition_compiler.gd")\nfunc _initialize():\n\tvar result = {}\n'
for id in ids:script+=f'\tresult["{id}"] = Compiler.compile(preload("res://scripts/data/cards/{id}.gd").definition())\n'
script+='\tvar file = FileAccess.open("res://facts.json", FileAccess.WRITE)\n\tfile.store_string(JSON.stringify(result, "\\t"))\n\tprint("Exported ", result.size(), " definitions")\n\tquit()\n'
(dst/'export.gd').write_text(script)
for args in [['--editor','--import','--quit'],['--script','export.gd']]:
 run=subprocess.run([a.godot,'--headless','--path',str(dst),*args],capture_output=True,text=True,timeout=60)
 if run.returncode or 'SCRIPT ERROR' in run.stderr or 'ERROR:' in run.stderr:raise SystemExit(run.stdout+run.stderr)
 print(run.stdout.strip())
subprocess.run([sys.executable,str(root/'tools/prepare_content.py'),str(source)],cwd=root,check=True)
print('Snapshot imported. Review changed content and translations before building.')

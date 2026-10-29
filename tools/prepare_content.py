"""Create a minimal, reviewed website snapshot from the isolated compiler export."""
from pathlib import Path
import json, re, subprocess, sys
from datetime import datetime
from zoneinfo import ZoneInfo
checked_at=datetime.now(ZoneInfo("Asia/Shanghai")).date().isoformat()
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else (ROOT.parent / 'ClashLegends')
raw=json.loads((ROOT/'.work/export/facts.json').read_text())
selection=json.loads((ROOT/'.work/export/selection.json').read_text())
sha=subprocess.check_output(['git','-C',str(SOURCE),'rev-parse','HEAD'],text=True).strip()
def read_tsv(name):
 return [line.split('|') for line in (ROOT/'content'/name).read_text().splitlines() if line.strip()]
copy={r[0]:r[1:] for r in read_tsv('copy.tsv')}
abilities={r[0]:r[1:] for r in read_tsv('abilities.tsv')}
fields={r[0]:{'zh':r[1],'en':r[2],'unit':r[3]} for r in read_tsv('fields.tsv')}
media=[]
def image(path,stem,width=640):
 if not path:return None
 src=SOURCE/path.replace('res://','')
 out=ROOT/'public/media'/f'{stem}.webp'
 im=Image.open(src).convert('RGB'); im.thumbnail((width,960)); im.save(out,'WEBP',quality=84)
 media.append({'path':f'/media/{stem}.webp','source':str(src.relative_to(SOURCE)),'publicRights':'review-before-publication'})
 return f'/media/{stem}.webp'
refs=['spawn_id','death_spawn_id','death_replacement_id','timed_revival_id','growth_ranged_id','growth_melee_id','deployment_upgrade_id','rush_spawn_id','assist_conversion_unit_id','assist_conversion_building_id']
entities=[]
for id,c in raw.items():
 en,zhdesc,endesc=copy[id]
 numeric={k:v for k,v in c.items() if k in fields and isinstance(v,(int,float,list)) and not isinstance(v,bool)}
 if c['type']!='spell' and not c.get('spawn_plan'):numeric['deploy_time']=c.get('deploy_time',1.0)
 if c['type']!='spell':numeric.pop('radius',None)
 if id=='final_spark':
  numeric['length']=numeric.pop('range');numeric['width']=numeric.pop('wave_width')
  numeric['visual_duration']=numeric.pop('duration');numeric.pop('radius',None)
 if id=='severing_bolt':numeric['warning_duration']=numeric.pop('duration')
 # Mega Inferno Bomb's duration is a presentation lifetime, not damage or Grievous Wounds duration.
 if id=='mega_inferno_bomb':numeric.pop('duration',None)
 if id=='medium_lightning':
  numeric['tower_disable_duration']=numeric.pop('stun_duration');numeric.pop('duration',None)
 if c['type']=='spell' and 'interval' in numeric:fields['summon_tick']={'zh':'召唤间隔','en':'Summon interval','unit':'seconds'};numeric['summon_tick']=numeric.pop('interval')
 related=set(c.get(k) for k in refs if c.get(k) in raw)
 members=c.get('spawn_plan',{}).get('members',[])
 if not members and c['type']!='spell':members=[id]*c.get('deployment_count',1)
 related.update(m for m in members if m!=id)
 skills=[]
 for i,a in enumerate(c.get('active_skills',[])):
  aen,az,ae=abilities.get(f"{id}:{a['name']}", abilities.get(a['name']))
  if a.get('spawn_id') in raw:related.add(a['spawn_id'])
  skills.append({'name':{'zh':a['name'],'en':aen},'description':{'zh':az,'en':ae},'values':{k:v for k,v in a.items() if k in fields and isinstance(v,(int,float,list)) and not isinstance(v,bool)},'icon':image(a.get('icon_path'),f'{id}-skill-{i}',96),'unlimited':a.get('unlimited_uses',False)})
 flags={k:c.get(k,False) for k in ['is_air','building_only','can_attack_air','river_traversal','permanent_unit_phasing']}
 flags['can_attack']=c.get('can_attack',id!='anivia_egg')
 e={'id':id,'name':{'zh':c['name'],'en':en},'description':{'zh':zhdesc,'en':endesc},'selectable':c.get('selectable',True),'type':c['type'],'cost':None if id=='mirror' else c['cost'],'values':numeric,'flags':flags,'image':image(c.get('card_art',{}).get('path'),id),'skills':skills,'related':sorted(related- {id}),'members':members,'zone':c.get('deploy_zone','own_side'),'source':f'scripts/data/cards/{id}.gd','forms':[]}
 for key in ['resource_cost_sequence','resource_damage_sequence','damage_sequence']:
  if key in c:e[key]=c[key]
 if c.get('transformed_stats'):
  form=c['transformed_stats']; labels={'gnar':('大纳尔','Mega Gnar'),'aatrox':('大灭形态','World Ender'),'jinx':('轻机枪形态','Minigun'),'sion':('狂暴形态','Berserk'),'jayce':('战锤形态','Hammer form')}
  z,n=labels[id];e['forms']=[{'id':id+'-form','name':{'zh':z,'en':n},'values':{k:v for k,v in form.items() if k in fields and k != 'radius' and isinstance(v,(int,float,list)) and not isinstance(v,bool)}}]
 if id=='freeze':
  e['skills'][0]['values']['zone_duration']=c['duration']+c['active_skills'][0]['slow_duration']
  e['skills'][0]['values'].pop('slow_duration',None)
 if c.get('can_attack') is False or id=='anivia_egg':
  for key in ['damage','interval','range']: e['values'].pop(key,None)
 entities.append(e)
content={'sourceCommit':sha,'checkedAt':checked_at,**selection,'cards':entities,'fields':fields}
(ROOT/'content/catalog.json').write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
(ROOT/'content/sources.json').write_text(json.dumps({'sourceCommit':sha,'checkedAt':checked_at,**selection,'selectionEvidence':'scripts/data/card_db.gd::selectable_ids; scripts/ui/deck_builder.gd','entities':[{'id':e['id'],'file':e['source'],'selectable':e['selectable'],'status':'compiled-and-editorially-reviewed','image':e['image']} for e in entities],'media':media,'discrepancies':[{'id':'mirror','issue':'Configuration description omits active-seat inheritance. Follow current docs/units/mirror.md and match_runtime.gd instead.'}]},ensure_ascii=False,indent=2)+'\n')
print(len(entities),'entities;',sum(e['selectable'] for e in entities),'selectable;',len(media),'media references')

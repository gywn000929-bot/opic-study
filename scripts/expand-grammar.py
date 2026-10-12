"""Compile authored situations into four separated retrieval modes.
Each TSV row: meaning, chunks, target, alternatives x2, rationale, contrasting meanings x2.
The original eight questions keep their indices so existing records remain valid.
"""
import json
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
path=ROOT/'src/grammar-advanced.json'
units=json.loads(path.read_text())
for u in units[1:]:
    source=ROOT/'scripts/grammar-cases'/f"{u['id']}.tsv"
    if not source.exists(): continue
    rows=[line.split('\t') for line in source.read_text().splitlines() if line.strip()]
    assert len(rows)==23,(u['id'],len(rows))
    groups=[[],[],[],[]]
    for row in rows:
        assert len(row)==8,(u['id'],row)
        meaning,chunks,target,alt1,alt2,why,false1,false2=row
        pieces=chunks.split(' / '); sentence=' '.join(pieces)
        assert len(pieces)>=3 and len(set(pieces))==len(pieces),(u['id'],pieces)
        pattern=r"(?<![A-Za-z])"+re.escape(target)+r"(?![A-Za-z])"
        assert len(re.findall(pattern,sentence))==1,(sentence,target)
        def swap(value): return re.sub(pattern,lambda m:value,sentence,count=1)
        assert len({target,alt1,alt2})==3
        assert len({meaning,false1,false2})==3
        groups[0].append([f'{meaning}\n{swap("___")}',[target,alt1,alt2],why,'context'])
        groups[1].append([f'다음 문장의 의미로 알맞은 것은?\n{sentence}',[meaning,false1,false2],why,'meaning'])
        # The intended meaning is stated: a grammatical alternative may still change the intended message.
        bad=swap(alt1)
        groups[2].append([f'의도: {meaning}\n다음 문장을 이 뜻에 맞게 다듬으면?\n{bad}',[sentence,bad,swap(alt2)],why,'repair'])
        groups[3].append([meaning,pieces,why,'chunks'])
    # Keep repeated examples far apart, and rotate each group to vary their order.
    offsets=[0,7,15,3]
    added=[]
    for group,offset in zip(groups,offsets): added.extend(group[offset:]+group[:offset])
    u['questions']=u['questions'][:8]+added
    u['sets']=['핵심 표현과 상황 선택','문맥에서 뜻 구별하기','의미 판단과 표현 점검','실수 고치고 연결하기','문장 조립으로 마무리']
    assert len(u['questions'])==100
path.write_text(json.dumps(units,ensure_ascii=False,indent=2)+'\n')
print([(u['id'],len(u['questions'])) for u in units])

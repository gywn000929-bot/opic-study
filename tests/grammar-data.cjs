const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const units=JSON.parse(fs.readFileSync('src/grammar-advanced.json'));
const prefixes=JSON.parse(fs.readFileSync('tests/fixtures/grammar-prefixes.json'));
assert.equal(units.length,12);
const ids=new Set();
for(const u of units){
  assert.equal(u.questions.length,100,u.id);assert.equal(u.sets.length,5,u.id);
  const prefix=prefixes.find(p=>p.id===u.id);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(u.questions.slice(0,prefix.count))).digest('hex'),prefix.sha256,'Existing records must retain their original questions: '+u.id);
  assert.equal(new Set(u.questions.map(q=>q[0])).size,100,'Duplicate prompt: '+u.id);
  for(const [i,q] of u.questions.entries()){
    const id=`grammar-${u.id}-${i}`;assert.ok(!ids.has(id));ids.add(id);
    assert.ok(['context','meaning','repair','chunks'].includes(q[3]));assert.ok(q[0]&&q[2]);
    assert.equal(new Set(q[1]).size,q[1].length);assert.ok(q[1].every(x=>typeof x==='string'&&x.trim()));
    if(q[3]==='chunks')assert.ok(q[1].length>=3&&q[1].length<=6);
    else assert.equal(q[1].length,3);
    if(q[4])assert.equal(q[4].length,3);
  }
}
assert.equal(ids.size,1200);
console.log('PASS curriculum: 12 × 100 questions, 60 sets, existing 188 questions unchanged, stable unique IDs and valid answer formats');

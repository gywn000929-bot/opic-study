const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const content=JSON.parse(read('src/content.json'));
if(content.topics.length!==20||content.cards.length!==1000)throw Error('Unexpected content count');
const html=read('src/template.html').replace('/* STYLES */',()=>read('src/style.css')).replace('/* CONTENT */',()=>JSON.stringify(content).replace(/</g,'\\u003c')).replace('/* APP */',()=>read('src/app.js'));
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),html);
console.log(`Built ${content.topics.length} topics, ${content.cards.length} cards; ${Buffer.byteLength(html)} bytes.`);

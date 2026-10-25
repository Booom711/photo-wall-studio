// 16:9 横屏样片：node render_16x9.js   （同一条音乐时间线上依次切换模板，卡点保持一致）
const puppeteer=require('/workspace/dy/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');
const dir='/workspace/photo-studio',sample='/workspace/photo-flash/sample',beat='/workspace/photo-flash/beat.mp3',mix='/tmp/mixs';
const save=(p,d)=>fs.writeFileSync(p,Buffer.from(d.split(',')[1],'base64'));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();await p.setViewport({width:1440,height:1000});const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('file://'+dir+'/index.html');
 const ps=fs.readdirSync(sample).filter(f=>f.startsWith('p_')).sort().slice(0,10).map(f=>sample+'/'+f),ws=fs.readdirSync(mix).sort().map(f=>mix+'/'+f);
 const files=[];for(let i=0;i<10;i++){files.push(ws[i]);files.push(ps[i]);}
 await (await p.$('#fImg')).uploadFile(...files);await p.waitForFunction(()=>document.getElementById('imgStat').textContent.startsWith('已载入'));
 await (await p.$('#fAud')).uploadFile(beat);await p.waitForFunction(()=>document.getElementById('audName').textContent.includes('已分析'));
 await p.evaluate(()=>__studio.setRatio('16:9'));
 // 每段：[模板, 起, 止, 标签]；最后一段放到拍立得结尾（拉远+标题）
 await p.evaluate(()=>{__studio.select('polaroid');__studio.set('dur',0.9);});const ptot=(await p.evaluate(()=>__studio.info())).total;
 const segs=[['flash',0,4.4,'回忆快闪 · 横图铺满 / 竖图完整+模糊背景'],['film',4.4,9.2,'胶片滚动 · 横屏自动横向'],['ring',9.2,14.0,'3D 圆环 · 横屏椭圆环'],['xmas',14.0,19.2,'照片圣诞树 · 卡片放右侧'],['polaroid',19.2,ptot,'拍立得照片堆 · 结尾拉远']];
 const fd='/tmp/r169';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);const fps=30;let n=0;const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc';const labs=[];
 for(const [id,a,e,lab] of segs){await p.evaluate(id=>__studio.select(id),id);if(id==='ring'||id==='xmas')await p.evaluate(()=>__studio.set('dur',0.9));const tot=(await p.evaluate(()=>__studio.info())).total;
   if(e>tot+0.01)throw new Error(id+' too short '+tot);const f0=Math.round(a*fps),f1=Math.round(e*fps);labs.push([lab,f0/fps,f1/fps]);
   for(let i=f0;i<f1;i++){save(`${fd}/${String(n++).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),i/fps));}console.log(id,a,e,'total',tot.toFixed(2));}
 const dt=s=>`drawtext=fontfile=${font}:text='${s[0]}':fontsize=34:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=14:x=40:y=h-th-40:enable='between(t,${s[1].toFixed(3)},${(s[2]-0.001).toFixed(3)})'`;
 const total=n/fps;
 execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i ${beat} -map 0:v -map 1:a -vf "${labs.map(dt).join(',')}" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -t ${total.toFixed(3)} -af "afade=t=out:st=${(total-0.8).toFixed(3)}:d=0.8" -movflags +faststart ${dir}/demo_16x9.mp4`);
 fs.writeFileSync('/tmp/r169_segs.json',JSON.stringify(labs));console.log('frames',n,'errors',JSON.stringify(errs));await b.close();
})();

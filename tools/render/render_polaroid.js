// 拍立得散落模板样片：node render_polaroid.js [--video]
const puppeteer=require('/workspace/dy/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');
const dir='/workspace/photo-studio',sample='/workspace/photo-flash/sample',beat='/workspace/photo-flash/beat.mp3';
const save=(p,d)=>fs.writeFileSync(p,Buffer.from(d.split(',')[1],'base64'));const VIDEO=process.argv.includes('--video');
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();await p.setViewport({width:1280,height:1000});const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('file://'+dir+'/index.html');
 const ps=fs.readdirSync(sample).filter(f=>f.startsWith('p_')).sort(),ls=fs.readdirSync(sample).filter(f=>f.startsWith('l_')).sort();
 let files=[];for(let i=0;i<10;i++){files.push(sample+'/'+ps[i]);files.push(sample+'/'+ls[i]);}
 await (await p.$('#fImg')).uploadFile(...files);await p.waitForFunction(()=>document.getElementById('imgStat').textContent.startsWith('已载入'));
 await (await p.$('#fAud')).uploadFile(beat);await p.waitForFunction(()=>document.getElementById('audName').textContent.includes('已分析'));
 await p.click('.tpl[data-id=polaroid]');await p.evaluate(()=>__studio.set('dur',0.55));await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>__studio.refreshCards());await new Promise(r=>setTimeout(r,800));await p.screenshot({path:`${dir}/frames/ui_polaroid.png`});
 const info=await p.evaluate(()=>__studio.info());console.log(JSON.stringify(info));
 const tm=await p.evaluate(()=>{const T=__studio.REG.find(x=>x.id==='polaroid');return {c:[...Array(20).keys()].map(i=>0)};});
 const rel=info.total-3.2;console.log('rel',rel);
 const kt=[['drop1',0.85],['land1',1.05],['pile5',3.3],['falling',5.0],['pile15',8.9],['pullback',rel+0.8],['title',info.total-0.9]];
 for(const [n,t] of kt)save(`${dir}/frames/polaroid_${n}_${t.toFixed(2)}s.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));
 for(const tb of ['linen','felt']){await p.evaluate(tb=>__studio.set('table',tb),tb);save(`${dir}/frames/polaroid_table_${tb}.jpg`,await p.evaluate(t=>__studio.renderAt(t),6.0));}
 await p.evaluate(()=>{__studio.set('table','wood');__studio.set('follow',false);});save(`${dir}/frames/polaroid_nofollow.jpg`,await p.evaluate(t=>__studio.renderAt(t),7.0));
 await p.evaluate(()=>{__studio.set('capMode','custom');});save(`${dir}/frames/polaroid_custom_caps.jpg`,await p.evaluate(t=>__studio.renderAt(t),4.0));
 await p.evaluate(()=>{__studio.set('follow',true);__studio.set('capMode','date');});
 if(VIDEO){// 样片：前 8 秒竖条并排，之后切到横条叠放
   const fd='/tmp/pol_frames';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);const fps=30,nf=Math.ceil(info.total*fps);
   for(let i=0;i<nf;i++){const t=i/fps;
     save(`${fd}/${String(i).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));}
   const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',lab=(s,a,e)=>`drawtext=fontfile=${font}:text='${s}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=16:x=(w-tw)/2:y=60:enable='between(t,${a},${e})'`;
   execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i ${beat} -map 0:v -map 1:a -vf "${lab('一张张掉落 · 镜头跟随',1.0,rel.toFixed(2))},${lab('拉远看整堆 + 标题',rel.toFixed(2),99)}" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -t ${info.total.toFixed(3)} -af "afade=t=out:st=${(info.total-0.8).toFixed(3)}:d=0.8" -movflags +faststart ${dir}/demo_polaroid.mp4`);
   console.log('frames',nf);}
 console.log('errors',JSON.stringify(errs));await b.close();
})();

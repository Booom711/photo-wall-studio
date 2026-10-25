// 无头 Chrome 打开 photo-studio/index.html，一次导入样例照片+节拍，切换 3 个模板，调用页面自身 drawFrame 逐帧导出。
// 用法：node render.js [--video]
const puppeteer=require('/workspace/dy/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');
const dir='/workspace/photo-studio',sample='/workspace/photo-flash/sample',beat='/workspace/photo-flash/beat.mp3',cut='/workspace/photo-studio/sample-cutout';
const VIDEO=process.argv.includes('--video');
const save=(p,d)=>fs.writeFileSync(p,Buffer.from(d.split(',')[1],'base64'));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();await p.setViewport({width:1280,height:1000});const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('file://'+dir+'/index.html');
 const ps=fs.readdirSync(sample).filter(f=>f.startsWith('p_')).sort(),ls=fs.readdirSync(sample).filter(f=>f.startsWith('l_')).sort();
 let files=[];for(let i=0;i<Math.max(ps.length,ls.length);i++){if(ps[i])files.push(sample+'/'+ps[i]);if(ls[i])files.push(sample+'/'+ls[i]);}
 // 只用原图：九宫格出框的人像由页面自动识别并抠图
 const t0=Date.now();await (await p.$('#fImg')).uploadFile(...files);
 await p.waitForFunction(()=>document.getElementById('imgStat').textContent.startsWith('已载入'),{timeout:300000});
 console.log('loaded',await p.evaluate(()=>__studio.ready),(Date.now()-t0)/1000+'s',await p.evaluate(()=>document.getElementById('imgStat').textContent));
 await (await p.$('#fAud')).uploadFile(beat);
 await p.waitForFunction(()=>document.getElementById('audName').textContent.includes('已分析'),{timeout:60000});
 await p.click('.tpl[data-id=grid]');await p.waitForFunction(()=>__studio.REG.find(t=>t.id==='grid').kinds().every(k=>k!=='pending'),{timeout:120000,polling:200});
 console.log('grid kinds',await p.evaluate(()=>JSON.stringify(__studio.REG.find(t=>t.id==='grid').kinds())));
 await p.evaluate(()=>__studio.refreshCards());await new Promise(r=>setTimeout(r,1500));
 const ids=['flash','film','grid'],info={};
 for(const id of ids){await p.evaluate(id=>__studio.select(id),id);await new Promise(r=>setTimeout(r,700));info[id]=await p.evaluate(()=>__studio.info());
   await p.screenshot({path:`${dir}/frames/ui_${id}.png`});}
 const gi=await p.evaluate(()=>{const g=__studio.REG[2];return null;});
 console.log(JSON.stringify(info));
 // 关键帧
 const shots={flash:[0.6,1.6,2.9,info.flash.total-1.0],film:[0.6,2.0,3.5,info.film.total-1.0],grid:[0.5,1.6,2.75,3.4]};
 const grid=await p.evaluate(()=>{__studio.select('grid');return null;});
 const gt=await p.evaluate(()=>{const T=__studio.REG[2];T.init(__studio.S);return null;});
 for(const id of ids){await p.evaluate(id=>__studio.select(id),id);
   for(const t of shots[id]){save(`${dir}/frames/${id}_${t.toFixed(2)}s.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));}}
 // 九宫格：每组出框后一帧（全部为页面自动抠图）
 await p.evaluate(()=>__studio.select('grid'));
 const pops=await p.evaluate(()=>__studio.gridPops());
 for(let g=0;g<pops.length;g++)save(`${dir}/frames/grid_group${g+1}_pop.jpg`,await p.evaluate(t=>__studio.renderAt(t),pops[g]+1.0));
 console.log('pops',JSON.stringify(pops));
 if(VIDEO){
   const fd='/tmp/studio_frames';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);
   const fps=30;let n=0;const plan=[],audio=[];
   const segs=[['flash',0.3,4.5],['film',0.5,4.6],['grid',0.4,pops[0]+1.6]];
   for(const [id,a,e] of segs){
     // 0.6 秒：模板选择器界面（该模板高亮）
     plan.push({ui:id,frames:18});audio.push([0,0.6]);
     plan.push({id,a,e});audio.push([a,e]);
   }
   const {createCanvas}=(()=>{try{return require('canvas')}catch(e){return{}}})();
   for(const s of plan){
     if(s.ui){execSync(`ffmpeg -loglevel error -y -i ${dir}/frames/ui_${s.ui}.png -vf "crop=600:500:50:280,scale=1080:-2,pad=1080:1920:0:(oh-ih)/2:color=0x0d0e11" -q:v 3 /tmp/ui_${s.ui}.jpg`);
       for(let k=0;k<s.frames;k++)fs.copyFileSync(`/tmp/ui_${s.ui}.jpg`,`${fd}/${String(n++).padStart(5,'0')}.jpg`);continue;}
     await p.evaluate(id=>__studio.select(id),s.id);
     const nf=Math.round((s.e-s.a)*fps);for(let k=0;k<nf;k++)save(`${fd}/${String(n++).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),s.a+k/fps));
   }
   // 音频：每段截取与画面同一时间窗口的节拍，保证卡点对齐
   let fc='',cat='';audio.forEach(([a,e],i)=>{fc+=`[0:a]atrim=${a}:${e},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${(e-a-0.03).toFixed(3)}:d=0.03[a${i}];`;cat+=`[a${i}]`;});
   fc+=`${cat}concat=n=${audio.length}:v=0:a=1[aa]`;
   execSync(`ffmpeg -loglevel error -y -i ${beat} -filter_complex "${fc}" -map "[aa]" /tmp/studio_a.wav`);
   const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc';let tcur=0,dt=[];const names={flash:'模板 1/3 · 回忆快闪',film:'模板 2/3 · 胶片滚动',grid:'模板 3/3 · 九宫格出框'};
   for(const s of plan){const d=s.ui?0.6:Math.round((s.e-s.a)*fps)/fps;
     if(s.ui)dt.push(`drawtext=fontfile=${font}:text='切换模板 → ${names[s.ui].split(' · ')[1]}':fontsize=64:fontcolor=white:x=(w-tw)/2:y=420:enable='between(t,${tcur.toFixed(3)},${(tcur+d).toFixed(3)})'`);
     else dt.push(`drawtext=fontfile=${font}:text='${names[s.id]}':fontsize=40:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=18:x=(w-tw)/2:y=60:enable='between(t,${tcur.toFixed(3)},${(tcur+d).toFixed(3)})'`);
     tcur+=d;}
   execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i /tmp/studio_a.wav -vf "${dt.join(',')}" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -shortest -movflags +faststart ${dir}/demo.mp4`);
   console.log('frames',n,'dur',tcur.toFixed(2));
 }
 console.log('errors',JSON.stringify(errs));await b.close();
})();

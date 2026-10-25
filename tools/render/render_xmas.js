// 照片圣诞树模板样片：node render_xmas.js [--video]
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
 await p.click('.tpl[data-id=xmas]');await p.evaluate(()=>__studio.set('dur',0.55));await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>__studio.refreshCards());await new Promise(r=>setTimeout(r,800));await p.screenshot({path:`${dir}/frames/ui_xmas.png`});
 const info=await p.evaluate(()=>__studio.info());console.log(JSON.stringify(info));
 const sw=await p.evaluate(()=>__studio.REG.find(x=>x.id==='xmas').scatterWin);console.log('scatter',JSON.stringify(sw));
 const kt=[['intro',0.9],['tree',3.0],['pop',3.25],['scatter_in',sw.t0+0.5],['scatter',(sw.t0+sw.t1)/2+0.3],['regather',sw.t2-0.3],['after',sw.t2+0.9]];
 for(const [n,t] of kt)save(`${dir}/frames/xmas_${n}_${t.toFixed(2)}s.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));
 save(`${dir}/frames/xmas_end.jpg`,await p.evaluate(t=>__studio.renderAt(t),info.total-0.9));
 // 预览交互：拖动转树、点一下散开
 const r=await (await p.$('#cv')).boundingBox();await p.mouse.move(r.x+r.width*0.3,r.y+r.height*0.6);await p.mouse.down();for(let k=1;k<=6;k++)await p.mouse.move(r.x+r.width*(0.3+0.04*k),r.y+r.height*0.6);await p.mouse.up();await new Promise(r=>setTimeout(r,900));
 await p.mouse.click(r.x+r.width*0.5,r.y+r.height*0.5);await new Promise(r=>setTimeout(r,1800));
 console.log('interact',JSON.stringify(await p.evaluate(()=>{const T=__studio.REG.find(x=>x.id==='xmas');return [T.dragYaw,T.liveS,T.liveTarget];})));
 await p.screenshot({path:`${dir}/frames/ui_xmas_tap_scatter.png`});await p.mouse.click(r.x+r.width*0.5,r.y+r.height*0.5);await new Promise(r=>setTimeout(r,1800));
 await p.evaluate(()=>{const T=__studio.REG.find(x=>x.id==='xmas');T.dragReset();});
 if(VIDEO){// 样片：前 8 秒竖条并排，之后切到横条叠放
   const fd='/tmp/xmas_frames';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);const fps=30,nf=Math.ceil(info.total*fps);
   for(let i=0;i<nf;i++){const t=i/fps;
     save(`${fd}/${String(i).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));}
   const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',lab=(s,a,e)=>`drawtext=fontfile=${font}:text='${s}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=16:x=(w-tw)/2:y=60:enable='between(t,${a},${e})'`;
   execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i ${beat} -map 0:v -map 1:a -vf "${lab('旋转照片树 · 鼓点放大',1.9,sw.t0.toFixed(2))},${lab('散开 → 聚拢',sw.t0.toFixed(2),(sw.t2+0.3).toFixed(2))},${lab('旋转照片树 · 鼓点放大',(sw.t2+0.3).toFixed(2),(info.total-2.6).toFixed(2))}" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -t ${info.total.toFixed(3)} -af "afade=t=out:st=${(info.total-0.8).toFixed(3)}:d=0.8" -movflags +faststart ${dir}/demo_xmastree.mp4`);
   console.log('frames',nf);}
 console.log('errors',JSON.stringify(errs));await b.close();
})();

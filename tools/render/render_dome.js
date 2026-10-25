// 球幕照片墙模板样片：node render_dome.js [--video]
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
 await p.click('.tpl[data-id=dome]');await p.evaluate(()=>__studio.set('dur',0.5));await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>__studio.refreshCards());await new Promise(r=>setTimeout(r,800));await p.screenshot({path:`${dir}/frames/ui_dome.png`});
 const info=await p.evaluate(()=>__studio.info());console.log(JSON.stringify(info));
 for(const m of ['dome','globe']){await p.evaluate(m=>__studio.set('style',m),m);
   for(const t of [0.9,3.0,3.3,6.0])save(`${dir}/frames/dome_${m}_${t.toFixed(2)}s.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));
   await p.evaluate(()=>__studio.set('focus',false));save(`${dir}/frames/dome_${m}_nofocus.jpg`,await p.evaluate(t=>__studio.renderAt(t),3.1));await p.evaluate(()=>__studio.set('focus',true));}
 await p.evaluate(()=>__studio.set('style','dome'));save(`${dir}/frames/dome_end.jpg`,await p.evaluate(t=>__studio.renderAt(t),info.total-0.9));
 // 拖动测试：鼠标在预览上拖
 const r=await (await p.$('#cv')).boundingBox();const y0=await p.evaluate(()=>__studio.REG.find(x=>x.id==='dome').dragYaw);
 await p.mouse.move(r.x+r.width*0.7,r.y+r.height*0.5);await p.mouse.down();for(let k=1;k<=10;k++)await p.mouse.move(r.x+r.width*(0.7-0.04*k),r.y+r.height*(0.5+0.01*k));await p.mouse.up();await new Promise(r=>setTimeout(r,1500));
 console.log('drag yaw',y0,'->',await p.evaluate(()=>{const T=__studio.REG.find(x=>x.id==='dome');return [T.dragYaw,T.dragPitch];}));
 await p.screenshot({path:`${dir}/frames/ui_dome_drag.png`});
 await p.evaluate(()=>{const T=__studio.REG.find(x=>x.id==='dome');T.dragReset();});
 if(VIDEO){// 样片：前 8 秒竖条并排，之后切到横条叠放
   const fd='/tmp/dome_frames';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);const fps=30,nf=Math.ceil(info.total*fps);
   for(let i=0;i<nf;i++){const t=i/fps,m=t<7.6?'dome':'globe';await p.evaluate(m=>{if(window.__lastM!==m){__studio.set('style',m);window.__lastM=m;}},m);
     save(`${fd}/${String(i).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));}
   const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',lab=(s,a,e)=>`drawtext=fontfile=${font}:text='${s}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=16:x=(w-tw)/2:y=60:enable='between(t,${a},${e})'`;
   execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i ${beat} -map 0:v -map 1:a -vf "${lab('样式：球幕（站在里面看）',1.6,7.6)},${lab('样式：照片地球（从外面看）',7.6,99)}" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -t ${info.total.toFixed(3)} -af "afade=t=out:st=${(info.total-0.8).toFixed(3)}:d=0.8" -movflags +faststart ${dir}/demo_dome.mp4`);
   console.log('frames',nf);}
 console.log('errors',JSON.stringify(errs));await b.close();
})();

// 音乐播放器模板样片：node render_player.js
const puppeteer=require('/workspace/dy/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');
const dir='/workspace/photo-studio',sample='/workspace/photo-flash/sample',beat='/workspace/photo-flash/beat.mp3';
const save=(p,d)=>fs.writeFileSync(p,Buffer.from(d.split(',')[1],'base64'));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();await p.setViewport({width:1280,height:1000});const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('file://'+dir+'/index.html');
 const pick=['p_3974017','l_21299269','p_9898825','l_19780241','p_18058270','l_16292477','p_19399734','l_25020020','p_6483903','l_39827155','p_2530364','l_29051805'];
 await (await p.$('#fImg')).uploadFile(...pick.map(f=>`${sample}/${f}.jpg`));
 await p.waitForFunction(()=>document.getElementById('imgStat').textContent.startsWith('已载入'));
 await (await p.$('#fAud')).uploadFile(beat);await p.waitForFunction(()=>document.getElementById('audName').textContent.includes('已分析'));
 await p.click('.tpl[data-id=player]');await new Promise(r=>setTimeout(r,400));
 await p.evaluate(()=>{__studio.set('title','那年夏天的风');__studio.set('artist','旅行日记');__studio.set('dur',0.7);});
 await p.evaluate(()=>__studio.refreshCards());await new Promise(r=>setTimeout(r,800));
 await p.screenshot({path:`${dir}/frames/ui_player.png`});
 const info=await p.evaluate(()=>__studio.info());console.log(JSON.stringify(info));
 for(const t of [0.3,1.2,3.05,6.0])save(`${dir}/frames/player_vinyl_${t.toFixed(2)}s.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));
 save(`${dir}/frames/player_end.jpg`,await p.evaluate(t=>__studio.renderAt(t),info.total-0.9));
 await p.evaluate(()=>__studio.set('style','cover'));save(`${dir}/frames/player_cover_3.05s.jpg`,await p.evaluate(()=>__studio.renderAt(3.05)));
 await p.evaluate(()=>{__studio.set('lyricMode','date');});save(`${dir}/frames/player_cover_datelyric_4.0s.jpg`,await p.evaluate(()=>__studio.renderAt(4.0)));
 await p.evaluate(()=>{__studio.set('style','vinyl');__studio.set('lyricMode','custom');});
 const fd='/tmp/player_frames';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);const fps=30,nf=Math.ceil(info.total*fps);
 for(let i=0;i<nf;i++)save(`${fd}/${String(i).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),i/fps));
 execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i ${beat} -map 0:v -map 1:a -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -t ${info.total.toFixed(3)} -af "afade=t=out:st=${(info.total-0.8).toFixed(3)}:d=0.8" -movflags +faststart ${dir}/demo_musicplayer.mp4`);
 console.log('frames',nf,'errors',JSON.stringify(errs));await b.close();
})();

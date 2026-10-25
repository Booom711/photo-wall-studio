// 立体滚动照片墙模板样片：node render_scroll3d.js [--video] [--ratio=9:16] [--sec=10]
// 输出目录：环境变量 OUT（默认 /workspace/photo-studio/frames）
const puppeteer=require('/workspace/dy/node_modules/puppeteer-core');const fs=require('fs');const {execSync}=require('child_process');
const dir='/workspace/photo-studio',sample='/workspace/photo-flash/sample',beat='/workspace/photo-flash/beat.mp3',out=process.env.OUT||dir+'/frames';
const save=(p,d)=>fs.writeFileSync(p,Buffer.from(d.split(',')[1],'base64'));const VIDEO=process.argv.includes('--video');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.split('=')[1]:d;};const RATIO=arg('ratio','9:16'),SEC=+arg('sec',10),TAG=RATIO.replace(':','x');
// 页面会 fetch assets/demo 示例图，file:// 下会被拦，所以起一个本地静态服务
const http=require('http'),path=require('path');const MIME={'.html':'text/html; charset=utf-8','.webp':'image/webp','.js':'text/javascript','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(dir)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{fs.mkdirSync(out,{recursive:true});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${srv.address().port}`;
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();await p.setViewport({width:1280,height:1000});const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto(base+'/index.html');
 if(process.argv.includes('--ui')){await new Promise(r=>setTimeout(r,2500));await p.click('.tpl[data-id=scroll3d]');await new Promise(r=>setTimeout(r,1500));await p.screenshot({path:`${out}/ui_scroll3d_demo.png`});}
 const ps=fs.readdirSync(sample).filter(f=>f.startsWith('p_')).sort(),ls=fs.readdirSync(sample).filter(f=>f.startsWith('l_')).sort();
 let files=[];for(let i=0;i<10;i++){files.push(sample+'/'+ps[i]);files.push(sample+'/'+ls[i]);}
 await (await p.$('#fImg')).uploadFile(...files);await p.waitForFunction(()=>document.getElementById('imgStat').textContent.startsWith('已载入'));
 await (await p.$('#fAud')).uploadFile(beat);await p.waitForFunction(()=>document.getElementById('audName').textContent.includes('已分析'));
 await p.evaluate(r=>__studio.setRatio(r),RATIO);
 await p.click('.tpl[data-id=scroll3d]');await p.evaluate(()=>__studio.set('title','愿所有美好 都如期而至'));await new Promise(r=>setTimeout(r,400));
 const info=await p.evaluate(()=>__studio.info());console.log(JSON.stringify(info));
 const shot=async(name,t)=>save(`${out}/scroll3d_${TAG}_${name}.jpg`,await p.evaluate(t=>__studio.renderAt(t),t));
 await shot('default',1.3);await shot('default_b',4.6);
 if(process.argv.includes('--variants')){
   const vs=[['rows3',{rows:'3'}],['rows2',{rows:'2'}],['card',{hero:'card'}],['roll',{roll:-18}],['flip',{flip:true}],['nohero_169',{hero:'off',aspect:'16:9'}],['beige',{bg:'#f3f1ec'}]];
   for(const [n,o] of vs){await p.evaluate(o=>{for(const k in o)__studio.set(k,o[k]);},o);await shot(n,2.0);
     await p.evaluate(()=>{const T=__studio.REG.find(x=>x.id==='scroll3d');for(const s of T.settings)__studio.set(s.id,s.value);});}}
 if(VIDEO){const fd='/tmp/scroll3d_frames';fs.rmSync(fd,{recursive:true,force:true});fs.mkdirSync(fd);const fps=30,nf=Math.round(SEC*fps);const t0=Date.now();
   for(let i=0;i<nf;i++)save(`${fd}/${String(i).padStart(5,'0')}.jpg`,await p.evaluate(t=>__studio.renderAt(t),i/fps));
   console.log('render s/frame',((Date.now()-t0)/1000/nf).toFixed(3));
   execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.jpg -i ${beat} -map 0:v -map 1:a -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -t ${SEC} -af "afade=t=out:st=${SEC-0.8}:d=0.8" -movflags +faststart ${out}/demo_scroll3d_${TAG}.mp4`);
   console.log('frames',nf);}
 console.log('errors',JSON.stringify(errs));await b.close();srv.close();
})();

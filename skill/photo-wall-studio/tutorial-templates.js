/* Four additive Canvas 2D tutorial templates. No network dependencies. */
(function installPhotoWallTutorialTemplates(global) {
  global.registerTutorialTemplates = ({REG,S,getSize,clamp,ease,cover}) => {
    const idx = k => S.seq.length ? S.seq[((k % S.seq.length) + S.seq.length) % S.seq.length] : undefined;
    const bmp = k => idx(k) === undefined ? null : S.get(idx(k));
    const step = (times,t) => {let k=0;while(k+1<times.length&&times[k+1]<=t)k++;return k;};
    const background=(g,W,H,a,b)=>{const z=g.createLinearGradient(0,0,W,H);z.addColorStop(0,a);z.addColorStop(1,b);g.fillStyle=z;g.fillRect(0,0,W,H);};
    const image=(g,b,x,y,w,h)=>{if(b&&w>0&&h>0)cover(g,b,x,y,w,h);};
    const label=(g,s,x,y,size,color='#fff')=>{if(!s)return;g.save();g.textAlign='center';g.textBaseline='middle';g.font=`600 ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;g.fillStyle=color;g.fillText(String(s).slice(0,24),x,y);g.restore();};
    function magazine(){
      let st;
      const T={id:'magazine',name:'杂志拼贴',desc:'模糊背景与叠层相框',values:{},
        settings:[
          {id:'dur',label:'单张停留',type:'range',min:.7,max:3,step:.1,value:1.45,unit:'秒',rebuild:1},
          {id:'paper',label:'相框',type:'select',value:'white',options:[['white','白色'],['cream','奶油复古'],['dark','暗黑']]},
          {id:'double',label:'双层相框',type:'check',value:true},{id:'caption',label:'杂志文字',type:'check',value:true}],
        init(){const n=S.seq.length,times=S.cuts(0,n,T.values.dur).times;st={n,times,total:times.at(-1)+.35};},
        get duration(){return st?st.total:0;},get idleT(){return .7;},
        need(t){const k=step(st.times,t);return [idx(k),idx(k+1)].filter(i=>i!==undefined);},
        keyTimes(){return st.times.slice(0,-1).map(t=>({t:t+.55,w:1}));},
        info(){return `杂志拼贴 · ${st.n} 张`;},
        drawFrame(g,t){
          const {W,H}=getSize(),k=Math.min(st.n-1,step(st.times,t)),b=bmp(k),other=bmp(k+1);
          const lt=t-st.times[Math.max(0,k)],p=ease(clamp(lt/.48));
          background(g,W,H,'#1b1823','#08090e');
          if(b){g.save();if('filter'in g)g.filter='blur(26px) brightness(.5)';image(g,b,-70,-70,W+140,H+140);g.restore();}
          g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,0,W,H);
          const fw=Math.min(W*.72,H*.80),fh=Math.min(fw*1.1,H*.65);
          const paper=T.values.paper==='dark'?'#15161b':T.values.paper==='cream'?'#f5ead7':'#fff';
          const frame=(im,dx,dy,w,h,rot,alpha,scale)=>{
            if(!im||alpha<=0)return;g.save();g.globalAlpha=alpha;g.translate(W/2+dx,H*.49+dy);g.rotate(rot);g.scale(scale,scale);
            g.shadowColor='#0008';g.shadowBlur=42;g.shadowOffsetY=14;g.fillStyle=paper;
            g.fillRect(-w/2-16,-h/2-16,w+32,h+72);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
            image(g,im,-w/2,-h/2,w,h);g.restore();
          };
          if(T.values.double)frame(other,fw*.15,-fh*.11,fw*.75,fh*.83,.12,.65,1);
          frame(b,-(1-p)*W*.23,(1-p)*H*.10,fw,fh,-.07,p,1.06-.06*clamp(lt/T.values.dur));
          if(T.values.caption){label(g,'PHOTO JOURNAL',W/2,H*.10,Math.min(W,H)*.044);
            label(g,S.title(),W/2,H*.87,Math.min(W,H)*.05);
            label(g,`${k+1} / ${st.n}`,W/2,H*.925,Math.min(W,H)*.024,'#ddd4da');}
        }
      };return T;
    }
    function freeze(){
      let st;
      const T={id:'freeze',name:'回忆定格',desc:'白边照片定格叠放',values:{},
        settings:[{id:'dur',label:'定格间隔',type:'range',min:.25,max:1.4,step:.05,value:.65,unit:'秒',rebuild:1},
          {id:'count',label:'每屏照片',type:'select',value:'4',options:[['3','3 张'],['4','4 张'],['6','6 张']],rebuild:1},
          {id:'warm',label:'复古暖色',type:'check',value:true},{id:'countText',label:'照片计数',type:'check',value:true}],
        init(){const n=S.seq.length,cuts=S.cuts(0,n,T.values.dur).times;st={n,cuts,total:cuts.at(-1)+1.1};},
        get duration(){return st?st.total:0;},get idleT(){return 2.2;},
        need(t){const k=Math.min(st.n-1,step(st.cuts,t)),c=+T.values.count,base=Math.floor(Math.max(0,k)/c)*c;
          return Array.from({length:c},(_,j)=>base+j<st.n?idx(base+j):undefined).filter(i=>i!==undefined);},
        keyTimes(){return st.cuts.slice(0,-1).map(t=>({t:t+.35,w:1}));},
        info(){return `回忆定格 · ${st.n} 张`;},
        drawFrame(g,t){
          const {W,H}=getSize(),c=+T.values.count,k=Math.min(st.n-1,step(st.cuts,t)),base=Math.floor(Math.max(0,k)/c)*c;
          background(g,W,H,...(T.values.warm?['#e5c9a9','#ae896a']:['#d8d8df','#9da3b4']));
          const maxw=Math.min(W*.70,H*.62),maxh=Math.min(maxw*1.17,H*.59),w=maxw*(c>4?.75:.84),h=maxh*(c>4?.75:.84);
          for(let j=0;j<c&&base+j<=k&&base+j<st.n;j++){
            const b=bmp(base+j);if(!b)continue;
            const lt=t-st.cuts[base+j],u=ease(clamp(lt/.34)),offs=j-(c-1)/2;
            g.save();g.globalAlpha=u;g.translate(W/2+offs*maxw*.11,H*.48+Math.sin(j*2.4)*maxh*.11-(1-u)*H*.22);
            g.rotate((j-c/2)*.11);g.scale(.8+.2*u,.8+.2*u);
            g.shadowColor='#38251877';g.shadowBlur=32;g.shadowOffsetY=14;g.fillStyle='#fffdf7';
            g.fillRect(-w/2-15,-h/2-15,w+30,h+78);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
            image(g,b,-w/2,-h/2,w,h);g.restore();
          }
          label(g,S.title(),W/2,H*.11,Math.min(W,H)*.06,'#fff8ec');
          if(T.values.countText)label(g,`MEMORIES   ${Math.max(1,k+1)} / ${st.n}`,W/2,H*.92,Math.min(W,H)*.027,'#fff8ec');
        }
      };return T;
    }
    function collage(){
      let st;
      const T={id:'collage',name:'动态拼贴',desc:'多图错位入场拼贴',values:{},
        settings:[{id:'cols',label:'拼贴密度',type:'select',value:'3',options:[['2','2×2'],['3','3×3'],['4','4×4']],rebuild:1},
          {id:'dur',label:'每屏时长',type:'range',min:.75,max:3.5,step:.05,value:1.8,unit:'秒',rebuild:1},
          {id:'gap',label:'照片缝隙',type:'range',min:0,max:16,step:1,value:6,unit:'px'},
          {id:'flash',label:'切屏闪白',type:'check',value:true}],
        init(){const n=S.seq.length,count=(+T.values.cols)**2,groups=Math.max(1,Math.ceil(n/count)),cuts=S.cuts(0,groups,T.values.dur).times;
          st={n,count,groups,cuts,total:cuts.at(-1)+.5};},
        get duration(){return st?st.total:0;},get idleT(){return 1.35;},
        need(t){const k=Math.min(st.groups-1,step(st.cuts,t));
          return Array.from({length:st.count},(_,j)=>idx(k*st.count+j)).filter(i=>i!==undefined);},
        keyTimes(){return st.cuts.slice(0,-1).map(t=>({t:t+.75,w:1.5}));},
        info(){return `动态拼贴 · ${st.n} 张 · ${T.values.cols}×${T.values.cols}`;},
        drawFrame(g,t){
          const {W,H}=getSize(),cols=+T.values.cols,group=Math.min(st.groups-1,step(st.cuts,t));
          const lt=Math.max(0,t-st.cuts[group]),pad=Math.min(W,H)*.018,gap=+T.values.gap*Math.min(W,H)/1080;
          const w=(W-2*pad-gap*(cols-1))/cols,h=(H-2*pad-gap*(cols-1))/cols;
          background(g,W,H,'#08090d','#16121b');
          for(let j=0;j<st.count;j++){
            const b=bmp(group*st.count+j);if(!b)continue;
            const col=j%cols,row=Math.floor(j/cols),delay=j*Math.min(.08,T.values.dur/(st.count+2));
            const u=ease(clamp((lt-delay)/.42));if(u<=0)continue;
            const x=pad+col*(w+gap),y=pad+row*(h+gap),dir=(col+row)%2?1:-1;
            g.save();g.globalAlpha=u;g.beginPath();g.rect(x,y,w,h);g.clip();
            g.translate(dir*(1-u)*w*.75,(1-u)*h*.16);image(g,b,x,y,w*1.06,h*1.06);g.restore();
          }
          if(T.values.flash&&lt<.11&&group>0){g.fillStyle=`rgba(255,255,255,${.5*(1-lt/.11)})`;g.fillRect(0,0,W,H);}
        }
      };return T;
    }
    function split(){
      let st;
      const T={id:'split',name:'滑动分屏',desc:'蒙版分割与滑动换图',values:{},
        settings:[{id:'dur',label:'单张停留',type:'range',min:.45,max:2.5,step:.05,value:1.15,unit:'秒',rebuild:1},
          {id:'dir',label:'滑动方向',type:'select',value:'alternate',options:[['alternate','横竖交替'],['vertical','左右滑动'],['horizontal','上下滑动']]},
          {id:'seam',label:'分割线',type:'range',min:0,max:12,step:1,value:4,unit:'px'},
          {id:'glow',label:'分割线光效',type:'check',value:true}],
        init(){const n=S.seq.length,cuts=S.cuts(0,Math.max(0,n-1),T.values.dur).times;
          st={n,cuts,total:cuts.at(-1)+T.values.dur};},
        get duration(){return st?st.total:0;},get idleT(){return +T.values.dur+.18;},
        need(t){const k=Math.min(st.n-1,step(st.cuts,t));return [idx(Math.max(0,k-1)),idx(k)].filter(i=>i!==undefined);},
        keyTimes(){return st.cuts.map(t=>({t:t+.20,w:1.4}));},
        info(){return `滑动分屏 · ${st.n} 张`;},
        notices(){return [{lv:'info',icon:'ℹ️ ',text:'人物半脸拼接建议上传角度相近的照片，本模板不自动调整五官对齐。'}];},
        drawFrame(g,t){
          const {W,H}=getSize(),k=Math.min(st.n-1,step(st.cuts,t)),b=bmp(k);
          background(g,W,H,'#101018','#08080c');if(!b)return;
          const lt=Math.max(0,t-st.cuts[k]),p=ease(clamp(lt/Math.min(.52,T.values.dur*.7)));
          if(k===0||p>=1){image(g,b,0,0,W,H);return;}
          const prev=bmp(k-1)||b,vertical=T.values.dir==='vertical'||(T.values.dir==='alternate'&&k%2===1);
          image(g,prev,0,0,W,H);
          const edge=vertical?W*(1-p):H*(1-p);
          g.save();g.beginPath();if(vertical)g.rect(edge,0,W-edge,H);else g.rect(0,edge,W,H);
          g.clip();image(g,b,0,0,W,H);g.restore();
          const width=+T.values.seam*Math.min(W,H)/1080;
          if(width>0){g.save();g.shadowColor=T.values.glow?'#fff9e7':'transparent';g.shadowBlur=T.values.glow?width*6:0;
            g.fillStyle='rgba(255,255,255,.90)';
            if(vertical)g.fillRect(edge-width/2,0,width,H);else g.fillRect(0,edge-width/2,W,width);
            g.restore();}
        }
      };return T;
    }
    REG.push(magazine(),freeze(),collage(),split());
  };
})(window);

/* 极简 TFLite 推理（仅实现 MediaPipe Selfie Segmenter 用到的算子），NHWC float32 */
function SegNet(graph,f16){
  const G=graph;let W=null;
  function h2f(h){const s=(h&0x8000)?-1:1,e=(h>>10)&31,m=h&1023;if(e===0)return s*m*5.960464477539063e-8;if(e===31)return m?NaN:s*Infinity;return s*(1+m/1024)*Math.pow(2,e-15);}
  function weights(){if(W)return W;const t=new Float32Array(65536);for(let i=0;i<65536;i++)t[i]=h2f(i);W=new Float32Array(f16.length);for(let i=0;i<f16.length;i++)W[i]=t[f16[i]];return W;}
  const C=c=>weights().subarray(c.off,c.off+c.n);
  const act=(a,v)=>a===1?(v>0?v:0):a===3?(v<0?0:v>6?6:v):v;
  function samePad(inp,k,s,d,out){const tot=Math.max((out-1)*s+(k-1)*d+1-inp,0);return Math.floor(tot/2);}
  function conv(x,[H,Wd,Ci],w,ws,b,o){const [O,kh,kw]=ws,sh=o.sh,sw=o.sw,dh=o.dh||1,dw=o.dw||1;
    const Ho=o.pad===0?Math.ceil(H/sh):Math.floor((H-(kh-1)*dh-1)/sh)+1,Wo=o.pad===0?Math.ceil(Wd/sw):Math.floor((Wd-(kw-1)*dw-1)/sw)+1;
    const pt=o.pad===0?samePad(H,kh,sh,dh,Ho):0,pl=o.pad===0?samePad(Wd,kw,sw,dw,Wo):0,y=new Float32Array(Ho*Wo*O);
    if(kh===1&&kw===1&&sh===1&&sw===1){for(let p=0;p<H*Wd;p++){const xb=p*Ci,yb=p*O;for(let oc=0;oc<O;oc++){let s=b?b[oc]:0;const wb=oc*Ci;for(let c=0;c<Ci;c++)s+=x[xb+c]*w[wb+c];y[yb+oc]=act(o.act,s);}}return [y,[Ho,Wo,O]];}
    for(let oy=0;oy<Ho;oy++)for(let ox=0;ox<Wo;ox++){const yb=(oy*Wo+ox)*O;for(let oc=0;oc<O;oc++){let s=b?b[oc]:0;
      for(let ky=0;ky<kh;ky++){const iy=oy*sh-pt+ky*dh;if(iy<0||iy>=H)continue;for(let kx=0;kx<kw;kx++){const ix=ox*sw-pl+kx*dw;if(ix<0||ix>=Wd)continue;const xb=(iy*Wd+ix)*Ci,wb=((oc*kh+ky)*kw+kx)*Ci;for(let c=0;c<Ci;c++)s+=x[xb+c]*w[wb+c];}}
      y[yb+oc]=act(o.act,s);}}return [y,[Ho,Wo,O]];}
  function dconv(x,[H,Wd,Ci],w,ws,b,o){const [,kh,kw,Co]=ws,sh=o.sh,sw=o.sw,dh=o.dh||1,dw=o.dw||1,m=o.mult||1;
    const Ho=o.pad===0?Math.ceil(H/sh):Math.floor((H-(kh-1)*dh-1)/sh)+1,Wo=o.pad===0?Math.ceil(Wd/sw):Math.floor((Wd-(kw-1)*dw-1)/sw)+1;
    const pt=o.pad===0?samePad(H,kh,sh,dh,Ho):0,pl=o.pad===0?samePad(Wd,kw,sw,dw,Wo):0,y=new Float32Array(Ho*Wo*Co);
    for(let oy=0;oy<Ho;oy++)for(let ox=0;ox<Wo;ox++){const yb=(oy*Wo+ox)*Co;for(let oc=0;oc<Co;oc++)y[yb+oc]=b?b[oc]:0;
      for(let ky=0;ky<kh;ky++){const iy=oy*sh-pt+ky*dh;if(iy<0||iy>=H)continue;for(let kx=0;kx<kw;kx++){const ix=ox*sw-pl+kx*dw;if(ix<0||ix>=Wd)continue;const xb=(iy*Wd+ix)*Ci,wb=(ky*kw+kx)*Co;
        for(let oc=0;oc<Co;oc++)y[yb+oc]+=x[xb+((oc/m)|0)]*w[wb+oc];}}
      for(let oc=0;oc<Co;oc++)y[yb+oc]=act(o.act,y[yb+oc]);}return [y,[Ho,Wo,Co]];}
  function tconv(x,[H,Wd,Ci],w,ws,b,o,os){const [O,kh,kw]=ws,[,Ho,Wo]=os,s=o.sh,sw=o.sw;
    const pt=o.pad===0?Math.floor(Math.max((H-1)*s+kh-Ho,0)/2):0,pl=o.pad===0?Math.floor(Math.max((Wd-1)*sw+kw-Wo,0)/2):0,y=new Float32Array(Ho*Wo*O);
    for(let iy=0;iy<H;iy++)for(let ix=0;ix<Wd;ix++){const xb=(iy*Wd+ix)*Ci;for(let ky=0;ky<kh;ky++){const oy=iy*s+ky-pt;if(oy<0||oy>=Ho)continue;for(let kx=0;kx<kw;kx++){const ox=ix*sw+kx-pl;if(ox<0||ox>=Wo)continue;const yb=(oy*Wo+ox)*O;
      for(let oc=0;oc<O;oc++){let v=0;const wb=((oc*kh+ky)*kw+kx)*Ci;for(let c=0;c<Ci;c++)v+=x[xb+c]*w[wb+c];y[yb+oc]+=v;}}}}
    if(b)for(let p=0;p<Ho*Wo;p++)for(let oc=0;oc<O;oc++)y[p*O+oc]+=b[oc];return [y,[Ho,Wo,O]];}
  function bin(a,as,bb,bs,f,ac){const n=as[0]*as[1]*as[2]>=bs[0]*bs[1]*bs[2];const [X,XS,Y,YS]=n?[a,as,bb,bs]:[bb,bs,a,as];const [H,Wd,Cc]=XS,y=new Float32Array(H*Wd*Cc);
    const yC=YS[2],ySp=YS[0]*YS[1]>1;for(let p=0;p<H*Wd;p++)for(let c=0;c<Cc;c++){const yi=(ySp?p*yC:0)+(yC===1?0:c);y[p*Cc+c]=act(ac,f(X[p*Cc+c],Y[yi]));}return [y,XS];}
  function resize(x,[H,Wd,Cc],Ho,Wo,o){const y=new Float32Array(Ho*Wo*Cc),sy=H/Ho,sx=Wd/Wo;
    for(let oy=0;oy<Ho;oy++){let fy=o.hp?(oy+0.5)*sy-0.5:(o.ac?oy*(H-1)/(Ho-1):oy*sy);const y0=Math.max(0,Math.floor(fy)),y1=Math.min(H-1,Math.ceil(fy)),wy=fy-Math.floor(fy);
      for(let ox=0;ox<Wo;ox++){let fx=o.hp?(ox+0.5)*sx-0.5:(o.ac?ox*(Wd-1)/(Wo-1):ox*sx);const x0=Math.max(0,Math.floor(fx)),x1=Math.min(Wd-1,Math.ceil(fx)),wx=fx-Math.floor(fx);
        for(let c=0;c<Cc;c++){const a=x[(y0*Wd+x0)*Cc+c],b=x[(y0*Wd+x1)*Cc+c],d=x[(y1*Wd+x0)*Cc+c],e=x[(y1*Wd+x1)*Cc+c];y[(oy*Wo+ox)*Cc+c]=a+(b-a)*wx+((d+(e-d)*wx)-(a+(b-a)*wx))*wy;}}}return [y,[Ho,Wo,Cc]];}
  // run(input Float32Array 256*256*3 in [0,1]) -> Float32Array 256*256 前景概率；yieldFn 用于分段让出主线程
  async function run(inp,yieldFn){const T=new Map();T.set(G.input,[inp,G.ishape.slice(1)]);
    const get=v=>v&&v.c?[C(v.c),v.c.shape.length===1?[1,1,v.c.shape[0]]:v.c.shape]:T.get(v);let n=0;
    for(const op of G.ops){const o=op.opt,a=get(op.i[0]);let r;
      switch(op.op){
        case 'CONV_2D':r=conv(a[0],a[1],C(op.i[1].c),op.i[1].c.shape,op.i[2]?C(op.i[2].c):null,o);break;
        case 'DEPTHWISE_CONV_2D':r=dconv(a[0],a[1],C(op.i[1].c),op.i[1].c.shape,op.i[2]?C(op.i[2].c):null,o);break;
        case 'Convolution2DTransposeBias':r=tconv(a[0],a[1],C(op.i[1].c),op.i[1].c.shape,op.i[2]?C(op.i[2].c):null,o,op.oshape[0]);break;
        case 'RELU':r=[a[0].map(v=>v>0?v:0),a[1]];break;
        case 'HARD_SWISH':r=[a[0].map(v=>v*Math.min(6,Math.max(0,v+3))/6),a[1]];break;
        case 'LOGISTIC':r=[a[0].map(v=>1/(1+Math.exp(-v))),a[1]];break;
        case 'AVERAGE_POOL_2D':{const [H,Wd,Cc]=a[1];if(o.fh!==H||o.fw!==Wd)throw Error('pool');const y=new Float32Array(Cc);for(let p=0;p<H*Wd;p++)for(let c=0;c<Cc;c++)y[c]+=a[0][p*Cc+c];for(let c=0;c<Cc;c++)y[c]/=H*Wd;r=[y,[1,1,Cc]];break;}
        case 'ADD':{const b=get(op.i[1]);r=bin(a[0],a[1],b[0],b[1],(p,q)=>p+q,o.act);break;}
        case 'MUL':{const b=get(op.i[1]);r=bin(a[0],a[1],b[0],b[1],(p,q)=>p*q,o.act);break;}
        case 'RESIZE_BILINEAR':{const sz=op.i[1].c.int;r=resize(a[0],a[1],sz[0],sz[1],o);break;}
        default:throw Error('op '+op.op);}
      T.set(op.o[0],r);if(yieldFn&&(++n%6===0))await yieldFn();}
    return T.get(G.output)[0];}
  return {run};
}
if(typeof module!=='undefined')module.exports=SegNet;

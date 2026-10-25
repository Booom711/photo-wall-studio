const fs=require('fs'),SegNet=require('./seg.js');const g=JSON.parse(fs.readFileSync('graph.json'));const b=fs.readFileSync('weights.f16');
const f16=new Uint16Array(b.buffer,b.byteOffset,b.length/2);const net=SegNet(g,f16);const inp=new Float32Array(fs.readFileSync('in.f32').buffer.slice(0));
const ref=new Float32Array(fs.readFileSync('out.f32').buffer.slice(0));
(async()=>{const t=Date.now();const y=await net.run(inp);console.log('ms',Date.now()-t);let md=0,mean=0;for(let i=0;i<y.length;i++){md=Math.max(md,Math.abs(y[i]-ref[i]));mean+=Math.abs(y[i]-ref[i]);}console.log('maxdiff',md,'mean',mean/y.length,'len',y.length);})();

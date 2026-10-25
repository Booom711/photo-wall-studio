import tflite, numpy as np, json, struct
from tflite.BuiltinOperator import BuiltinOperator as BO
from tflite.BuiltinOptions import BuiltinOptions as BOpt
buf=open('selfie_segmenter.tflite','rb').read()
m=tflite.Model.GetRootAsModel(buf,0);g=m.Subgraphs(0)
opname={v:k for k,v in BO.__dict__.items() if not k.startswith('_')}
TT={0:'f32',1:'f16',2:'i32'}
tensors=[]
for i in range(g.TensorsLength()):
    t=g.Tensors(i);b=m.Buffers(t.Buffer());tensors.append(dict(name=t.Name().decode(),shape=t.ShapeAsNumpy().tolist() if t.ShapeLength() else [],type=t.Type(),hasdata=b.DataLength()>0,buf=t.Buffer()))
ops=[];blob=bytearray();consts={}
def const(ti):
    if ti in consts:return consts[ti]
    t=tensors[ti];b=m.Buffers(t['buf']).DataAsNumpy().tobytes()
    if t['type']==1:a=np.frombuffer(b,np.float16)
    elif t['type']==0:a=np.frombuffer(b,np.float32).astype(np.float16)
    elif t['type']==2:a=np.frombuffer(b,np.int32);consts[ti]={'int':a.tolist()};return consts[ti]
    off=len(blob);blob.extend(a.astype('<f2').tobytes());consts[ti]={'off':off//2,'n':int(a.size),'shape':t['shape']};return consts[ti]
alias={}  # DEQUANTIZE outputs -> source const
for i in range(g.OperatorsLength()):
    o=g.Operators(i);oc=m.OperatorCodes(o.OpcodeIndex());code=max(oc.BuiltinCode(),oc.DeprecatedBuiltinCode())
    name=opname.get(code,str(code))
    if code==32:name=oc.CustomCode().decode()
    ins=o.InputsAsNumpy().tolist();outs=o.OutputsAsNumpy().tolist()
    if name=='DEQUANTIZE':alias[outs[0]]=ins[0];continue
    opt={}
    ot=o.BuiltinOptionsType()
    if ot==BOpt.Conv2DOptions:
        x=tflite.Conv2DOptions();x.Init(o.BuiltinOptions().Bytes,o.BuiltinOptions().Pos);opt=dict(pad=x.Padding(),sw=x.StrideW(),sh=x.StrideH(),act=x.FusedActivationFunction(),dw=x.DilationWFactor(),dh=x.DilationHFactor())
    elif ot==BOpt.DepthwiseConv2DOptions:
        x=tflite.DepthwiseConv2DOptions();x.Init(o.BuiltinOptions().Bytes,o.BuiltinOptions().Pos);opt=dict(pad=x.Padding(),sw=x.StrideW(),sh=x.StrideH(),act=x.FusedActivationFunction(),mult=x.DepthMultiplier(),dw=x.DilationWFactor(),dh=x.DilationHFactor())
    elif ot==BOpt.Pool2DOptions:
        x=tflite.Pool2DOptions();x.Init(o.BuiltinOptions().Bytes,o.BuiltinOptions().Pos);opt=dict(pad=x.Padding(),sw=x.StrideW(),sh=x.StrideH(),fw=x.FilterWidth(),fh=x.FilterHeight(),act=x.FusedActivationFunction())
    elif ot==BOpt.AddOptions:
        x=tflite.AddOptions();x.Init(o.BuiltinOptions().Bytes,o.BuiltinOptions().Pos);opt=dict(act=x.FusedActivationFunction())
    elif ot==BOpt.MulOptions:
        x=tflite.MulOptions();x.Init(o.BuiltinOptions().Bytes,o.BuiltinOptions().Pos);opt=dict(act=x.FusedActivationFunction())
    elif ot==BOpt.ResizeBilinearOptions:
        x=tflite.ResizeBilinearOptions();x.Init(o.BuiltinOptions().Bytes,o.BuiltinOptions().Pos);opt=dict(ac=x.AlignCorners(),hp=x.HalfPixelCenters())
    if name=='Convolution2DTransposeBias':
        cb=o.CustomOptionsAsNumpy().tobytes();opt=dict(zip(['pad','sw','sh'],struct.unpack('<3i',cb[:12])))
    I=[]
    for t in ins:
        if t<0:I.append(None);continue
        s=alias.get(t,t)
        if tensors[s]['hasdata']:I.append({'c':const(s)})
        else:I.append(s)
    ops.append(dict(op=name,i=I,o=outs,opt=opt,oshape=[tensors[x]['shape'] for x in outs]))
inp=g.InputsAsNumpy().tolist();out=g.OutputsAsNumpy().tolist()
json.dump(dict(ops=ops,input=inp[0],output=out[0],ishape=tensors[inp[0]]['shape']),open('graph.json','w'))
open('weights.f16','wb').write(blob)
from collections import Counter
print(Counter(o['op'] for o in ops),len(blob),'bytes');print([ (o['op'],o['opt']) for o in ops if o['op'] in('RESIZE_BILINEAR','Convolution2DTransposeBias','AVERAGE_POOL_2D','MUL','ADD')][:30])
print('in',tensors[inp[0]]['shape'],'out',tensors[out[0]]['shape'])

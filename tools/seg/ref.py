import numpy as np
from PIL import Image
from ai_edge_litert.interpreter import Interpreter
im=Image.open('/workspace/photo-flash/sample/p_31611940.jpg').convert('RGB').resize((256,256),Image.BILINEAR)
x=np.asarray(im,dtype=np.float32)/255.;x.astype('<f4').tofile('in.f32')
it=Interpreter(model_path='selfie_segmenter.tflite');it.allocate_tensors();it.set_tensor(it.get_input_details()[0]['index'],x[None]);it.invoke()
it.get_tensor(it.get_output_details()[0]['index'])[0].astype('<f4').tofile('out.f32')

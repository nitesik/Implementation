import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { webcam } from '@tensorflow/tfjs-data';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

const MODEL_URL = 'model/model.json';

const DYSLEXIA_THRESHOLD = 0.5;

const IMAGE_SIZE = 224;

const DyslexiaDetector = ({value, setText} : any) => {
  const [model, setModel] = useState<tf.GraphModel>();
  const [dyslexiaDetected, setDyslexiaDetected] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  function getPercentage(word : string) {
    let percentage = "";
    for (let i = 0; i < word.length; i++) {
      if ((word.charCodeAt(i) > 65 && word.charCodeAt(i) < 122) || word[i] === " ") {
        percentage += word[i];
      } else {
        continue;
      }
    }
    setText(100 - ((percentage.length / word.length) * 100));
    console.log(percentage, word);
    
  }

  useEffect(() => {
    const loadModel = async () => {
      if (!model) {
        statusRef.current!.innerText = 'Loading model...';
        const loadedModel = await loadGraphModel(MODEL_URL);
        setModel(loadedModel);
        statusRef.current!.innerText = '';
      }
    };
    loadModel();
  }, [model]);

  useEffect(() => {
    const predict = async () => {
      if (model && videoRef.current && canvasRef.current && statusRef.current) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = webcamStream;
        const processedImage = tf.tidy(() => {
          const imageTensor = tf.browser.fromPixels(videoRef.current!).toFloat();
          const resizedImageTensor = tf.image.resizeBilinear(imageTensor, [IMAGE_SIZE, IMAGE_SIZE]);
          const normalizedImageTensor = resizedImageTensor.div(tf.scalar(255));
          return normalizedImageTensor;
        });
        const predictions = await model.predict(processedImage.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3])) as tf.Tensor2D;
const dyslexiaProb = predictions.arraySync()[0][0];
// tfvis.render.confusionMatrix(
//    values: [dyslexiaProb > DYSLEXIA_THRESHOLD ? 1 : 0], predClasses: ['Dyslexia', 'No Dyslexia'],
//   { container: document.getElementById('vis') }
// );
        if (dyslexiaProb > DYSLEXIA_THRESHOLD) {
          statusRef.current.innerText = 'Dyslexia detected!';
          setDyslexiaDetected(true);
        } else {
          statusRef.current.innerText = '';
          setDyslexiaDetected(false);
        }
        tf.dispose([processedImage]);
        requestAnimationFrame(predict);
      }
    };
    predict();
    getPercentage(value)
  }, [model, videoRef, canvasRef, value, statusRef]);

  return (
    <div>
      {/* <video ref={videoRef} width="640" height="480" autoPlay></video>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
      <div ref={statusRef}></div>
      {dyslexiaDetected && <p>Dyslexia detected!</p>}
      <div id="vis"></div> */}
    </div>
  );
};

export default DyslexiaDetector;

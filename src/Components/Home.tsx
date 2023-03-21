import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Styles.css";
import Tesseract, { createWorker } from 'tesseract.js';
import DyslexiaDetector from "./DyslexiaDetector";

const videoConstraints = {
  facingMode: { exact: "environment"},
  height: 300,
  width: 370
};

function Home() {

  const webcamRef = useRef<any>(null);
  const [img, setImg] = useState(null)
  const [text, setText] = useState<number>(0);
  const [imgData, setImgData] = useState<any>(null);
  const [value, setValue] = useState<string>("");
  
  function capture() {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
  }
  
  
  
  useEffect(() => {
    if (img !== null) {
      
      // imageHandler(img);
      // getPercentage(imageHandler(img));
      imageHandler();
      // Test();
    }
  }, [img]);

  async function imageHandler() {
    
    const worker = await createWorker({
      logger: m => console.log(m)
    });
    
    (async () => {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      

      // const { data: { text } } = await worker.recognize(img!);
      const { data } = await worker.recognize(img!);
      // getPercentage(text);
      console.log(data);
      setImgData(data);
      setValue(data.text);
      await worker.terminate();
    })();
  }
  
  return (
    <div className="container">
      <DyslexiaDetector value={value} setText={setText} />
      <Webcam
      ref={webcamRef}
      audio={false}
      screenshotFormat="image/png"
      videoConstraints={videoConstraints} />

      <button onClick={capture}>Click</button>

      {img && <div>
        <div className="img" style={{backgroundImage: `url(${img})`}}>
          {imgData !== null && imgData.words.map((word: any) => (
            word.confidence > 50 && <div style={{position: "relative", borderBottom: "1px solid red", color: "red", width:  word.baseline.x1 - word.baseline.x0, height: word.baseline.y1 - word.baseline.y0, top: word.baseline.y0, left: word.baseline.x0}}></div>
          ))}
        </div>
        <div>{text.toFixed(2)}%</div>
        <div>{text >= 50 ? "High chance of dyslexia" : "Low chance of dyslexia"}</div>
        </div>}

    </div>)
}


export default Home;
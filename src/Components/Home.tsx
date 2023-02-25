import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Styles.css";
import Tesseract from 'tesseract.js';

const videoConstraints = {
  facingMode: { exact: "environment"},
  height: 300,
  width: 370
};

function Home() {

  const webcamRef = useRef<any>(null);
  const [img, setImg] = useState(null)
  const [text, setText] = useState<number>(0);
  
  function capture() {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
  }
  
  function getPercentage(word : string) {
    let percentage = "";
    for (let i = 0; i < word.length; i++) {
      if (word.charCodeAt(i) > 65 && word.charCodeAt(i) < 122) {
        percentage += word[i];
      } else {
        continue;
      }
    }
    setText(100 - ((percentage.length / word.length) * 100));
  }
  
  useEffect(() => {
    if (img !== null) {
      Tesseract.recognize(
        img,
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        getPercentage(text);
      })
    }
  }, [img]);
  
  return (
    <div className="container">
      <Webcam
      ref={webcamRef}
      audio={false}
      screenshotFormat="image/jpeg"
      videoConstraints={videoConstraints} />

      <button onClick={capture}>Click</button>

      {img && <div>
        <img src={img} />
        <div>{text.toFixed(2)}%</div>
        </div>}
    </div>)
}


export default Home;
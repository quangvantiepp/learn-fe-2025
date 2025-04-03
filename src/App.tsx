import axios from "axios";
import { useState } from "react";
import "./App.css";
import { TooltipExample } from "./components/base/tooltip";
import UploadFiles from "./components/base/upload/drag-and-drop/upload-files";
import Button from "./components/ui/button/Button";

import images1 from "../public/images1.jpg";
import images2 from "../public/images2.jpg";
import images3 from "../public/images3.jpg";
import ImageViewerFull from "./components/base/image-viewer/image-viewer-full";
import ImageViewerFull1 from "./components/base/image-viewer/image-viewer-use-context";

function App() {
  const [fileList, setFileList] = useState<File[]>([]);

  const handSubmit = () => {
    axios
      .post("http://localhost:3000/upload", fileList)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <>claude</>
      <Button onClick={handSubmit}>Submit</Button>
      {
        <>
          <ImageViewerFull1
            images={[images1, images2, images3]}
            displayMode="single"
          />
          <UploadFiles
            multiple={true}
            accept="image/*, .zip"
            maxSize={1024 * 1024 * 1}
            onFileChange={(files) => setFileList(files)}
          />
          <TooltipExample />
          {/* <>Custom</> */}
          {/* <TooltipExampleCustom /> */}
          {/* <>Tooltip full</> */}
          {/* <TooltipExampleCustomFull></TooltipExampleCustomFull> */}
          <TooltipExample />
        </>
      }
    </>
  );
}

export default App;

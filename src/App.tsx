import axios from "axios";
import { useState } from "react";
import "./App.css";
import UploadFiles from "./components/base/upload/drag-and-drop/upload-files";
import Button from "./components/ui/button/Button";
import { TooltipExample } from "./components/base/tooltip/tooltip-radix-ui";
import { TooltipExampleCustom } from "./components/base/tooltip/custom-pure-tooltip";
import { TooltipExampleCustomFull } from "./components/base/tooltip/custom-pure-tooltip-full";

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
          <UploadFiles
            multiple={true}
            accept="image/*, .zip"
            maxSize={1024 * 1024 * 1}
            onFileChange={(files) => setFileList(files)}
          />
          <TooltipExample />
          <>Custom</>
          <TooltipExampleCustom />
          <>Tooltip full</>
          <TooltipExampleCustomFull></TooltipExampleCustomFull>
        </>
      }
    </>
  );
}

export default App;

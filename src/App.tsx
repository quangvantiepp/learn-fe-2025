import axios from "axios";
import { useState } from "react";
import "./App.css";
import Button from "./components/ui/button/Button";

import { ToastProvider } from "./components/base/toast-radix-ui.tsx/model-ui-toolkit/toast-provider";
import { MainContent } from "./components/base/toast-radix-ui.tsx/use-example";

function App() {
  const [fileList, setFileList] = useState<File[]>([]);
  console.log("env:", import.meta.env.VITE_API_URL);

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
          <ToastProvider>
            <MainContent />
          </ToastProvider>
        </>
      }
    </>
  );
}

export default App;

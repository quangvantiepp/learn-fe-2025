import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import FileUploader from "./components/base/upload/drag-and-drop-draft/drag-and-drop-gpt";
import FileUpload from "./components/base/upload/drag-and-drop-draft/drag-and-drop-grok";
import UploadFiles from "./components/base/upload/drag-and-drop/upload-files";
import { Header } from "./pages/home/ui";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(false);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(!count)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Header />

      <>gpt</>
      <FileUploader />
      <>grok</>
      <FileUpload />
      {/* <>claude</>
      <FileUploaderClaude /> */}
      <>claude</>
      {/* <FileUploaderNoLoading
        maxSize={1024 * 10}
        accept="image/*"
        multiple={true}
        onFileSelect={(files) => console.log("on selected:", files)}
      /> */}
      {count && (
        <UploadFiles
          multiple={true}
          accept="image/*"
          maxSize={1024 * 1024 * 1}
          onFileChange={(files) => console.log("on selected:", files)}
          maxCount={2}
        />
      )}
    </>
  );
}

export default App;

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Header } from "./pages/home/ui";
import FileUploader from "./components/base/upload/drag-and-drop-gpt";
import FileUpload from "./components/base/upload/drag-and-drop-grok";
import FileUploaderClaude from "./components/base/upload/drag-and-drop-claude";
import FileUploaderNoLoading from "./components/base/upload/upload-claude-no-loading";
import Upload from "./components/base/upload/upload-claude-no-loading";

function App() {
  const [count, setCount] = useState(0);

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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
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
      <>claude</>
      <FileUploaderClaude />
      <>claude</>
      {/* <FileUploaderNoLoading
        maxSize={1024 * 10}
        accept="image/*"
        multiple={true}
        onFileSelect={(files) => console.log("on selected:", files)}
      /> */}
      <Upload
        onFileRemove={(file) => console.log("on remove:", file)}
        onFileSelect={(files) => console.log("on select:", files)}
      />
    </>
  );
}

export default App;

import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";

import { Editor, TabBar } from "@/components/editor";

const Preview = dynamic(() => import("@/components/editor/_Preview"), { ssr: false });

interface File {
  name: string;
  content: string;
}

const initialFiles: File[] = [
  {
    name: "index",
    content: `import Waveform from "./_Waveform"

const _ = () => {
  return (
    <div className="w-full h-full">
      <Waveform />
    </div>
  )
}

export default _;`
  },
  {
    name: "_Waveform",
    content: `import * as React from 'react';

export const Component = () => {
  return <p className="text-gray-500">This is a custom component!</p>;
};`
  }
];

const Home: React.FC = () => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [activeFileName, setActiveFileName] = useState<string>(initialFiles[0].name);
  const [savedFiles, setSavedFiles] = useState<File[]>(initialFiles);

  const activeFile = files.find(f => f.name === activeFileName) || files[0];

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setFiles(prevFiles =>
        prevFiles.map(file => (file.name === activeFileName ? { ...file, content: newCode } : file))
      );
    },
    [activeFileName]
  );

  const handleSave = useCallback(() => {
    setSavedFiles(files);
  }, [files]);

  const handleAddFile = useCallback(() => {
    const fileName = prompt("Enter file name (e.g., NewComponent.tsx):");
    if (fileName && !files.some(f => f.name === fileName)) {
      setFiles(prevFiles => [...prevFiles, { name: fileName, content: "" }]);
      setActiveFileName(fileName);
    } else if (fileName) {
      alert("A file with this name already exists. Please choose a different name.");
    }
  }, [files]);

  const handleTabClick = useCallback((fileName: string) => {
    setActiveFileName(fileName);
  }, []);

  return (
    <div className="noise fixed bottom-0 left-0 right-0 top-0 flex h-screen w-full flex-col overflow-hidden bg-black p-8 pb-0">
      <div className="flex h-full flex-1 gap-4">
        <div className="flex h-full w-1/2 flex-col">
          <TabBar
            files={files}
            activeFile={activeFileName}
            onTabClick={handleTabClick}
            onAddFile={handleAddFile}
          />
          <div className="h-full flex-1 overflow-hidden">
            <Editor
              key={activeFileName} // This ensures a new instance is created when switching files
              code={activeFile.content}
              onChange={handleCodeChange}
              handleSave={handleSave}
            />
          </div>
        </div>
        <div className="relative z-20 h-full w-1/2 pb-8">
          <div className="h-full w-full overflow-hidden rounded-sm border border-white/20 bg-black p-4">
            <Preview files={savedFiles} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

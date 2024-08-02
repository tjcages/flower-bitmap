import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";

import { AssetManager, Editor, TabBar } from "@/components/editor";

const Preview = dynamic(() => import("@/components/editor/_Preview"), { ssr: false });

interface Props {
  initialFiles: File[];
  initialAssets: Asset[];
}

interface File {
  name: string;
  content: string;
}

interface Asset {
  name: string;
  src: string;
}

const Home: React.FC<Props> = ({ initialFiles, initialAssets }) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [activeFileName, setActiveFileName] = useState<string>(initialFiles[1].name);
  const [savedFiles, setSavedFiles] = useState<File[]>(initialFiles);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);

  const activeFile = files.find(f => f.name === activeFileName) || files[0];

  useEffect(() => {
    const loadInitialAssets = async () => {
      const loadedAssets = await Promise.all(
        initialAssets.map(async asset => {
          try {
            const response = await fetch(asset.src);
            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);
            return { ...asset, url: localUrl };
          } catch (error) {
            console.error(`Failed to load asset ${asset.name}:`, error);
            return asset; // Keep the original asset if loading fails
          }
        })
      );
      setAssets(loadedAssets);
    };

    loadInitialAssets();
  }, [initialAssets]);

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

  const handleOpenAssetManager = useCallback(() => {
    setIsAssetManagerOpen(true);
  }, []);

  const handleCloseAssetManager = useCallback(() => {
    setIsAssetManagerOpen(false);
  }, []);

  const handleAssetUpload = useCallback((newAssets: Asset[]) => {
    setAssets(prevAssets => [...prevAssets, ...newAssets]);
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
            onOpenAssetManager={handleOpenAssetManager}
          />
          <div className="h-full flex-1 overflow-hidden">
            <Editor
              key={activeFileName}
              code={activeFile.content}
              onChange={handleCodeChange}
              handleSave={handleSave}
            />
          </div>
        </div>
        <div className="relative z-20 h-full w-1/2 pb-8">
          <div className="h-full w-full overflow-hidden rounded-sm border border-white/20 bg-black">
            <Preview files={savedFiles} assets={assets} />
          </div>
        </div>
      </div>
      <AssetManager
        isOpen={isAssetManagerOpen}
        onClose={handleCloseAssetManager}
        assets={assets}
        onAssetUpload={handleAssetUpload}
      />
    </div>
  );
};

export default Home;

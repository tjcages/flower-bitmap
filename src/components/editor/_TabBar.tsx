import { Folder } from "@/assets/icons";
import React from "react";

interface TabBarProps {
  files: { name: string }[];
  activeFile: string;
  onTabClick: (fileName: string) => void;
  onAddFile: () => void;
  onOpenAssetManager: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  files,
  activeFile,
  onTabClick,
  onAddFile,
  onOpenAssetManager
}) => {
  return (
    <div className="mb-4 flex w-full">
      {files.map(file => (
        <button
          key={file.name}
          className={`mr-2 px-3 py-2 text-white ${
            file.name === activeFile ? "bg-white/10 opacity-100" : "bg-white/0 opacity-50"
          }`}
          onClick={() => onTabClick(file.name)}
        >
          {file.name}
        </button>
      ))}
      <button
        className="aspect-square h-full border border-white/20 bg-white/0 text-white opacity-50 hover:bg-white hover:text-black hover:opacity-100"
        onClick={onAddFile}
      >
        +
      </button>
      <button
        className="group ml-auto flex aspect-square h-full items-center justify-center border border-white/20 bg-white/0 text-white opacity-50 hover:bg-white hover:text-black hover:opacity-100"
        onClick={onOpenAssetManager}
      >
        <Folder className="h-4 w-4 text-white group-hover:text-black" />
      </button>
    </div>
  );
};

export default TabBar;

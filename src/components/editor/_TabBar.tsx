import { Folder, Lock } from "@/assets/icons";
import Link from "next/link";

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
    <div className="flex flex-col items-start justify-start border-b border-white/10 text-white">
      <div className="flex items-center justify-start gap-2 px-4 pb-0 pt-2">
        <Link
          href="/"
          className="p-2 opacity-50 transition-opacity duration-100 ease-in hover:opacity-100"
        >
          <p className="opacity-50">DDemos</p>
        </Link>
        <p className="opacity-25">/</p>
        <Link
          href="/"
          className="p-2 opacity-50 transition-opacity duration-100 ease-in hover:opacity-100"
        >
          <p className="opacity-50">@tjcages</p>
        </Link>
        <p className="opacity-25">/</p>
        <Link
          href="/"
          className="flex items-center gap-1.5 transition-opacity duration-100 ease-in hover:opacity-70"
        >
          <Lock className="h-3 w-auto text-white" />
          <p>mice-on-the-loose</p>
        </Link>
      </div>
      <div className="relative z-10 flex w-full items-center pl-4 pr-2 pt-2">
        {files.map(file => (
          <button
            key={file.name}
            className={`mr-1 rounded-t-sm border-b-2 px-2 py-1 pb-2 transition-colors duration-100 ease-in hover:border-white/20 hover:bg-white/5 ${
              file.name === activeFile
                ? "border-white opacity-100 hover:border-white/70"
                : "border-white/0 opacity-50"
            }`}
            onClick={() => onTabClick(file.name)}
          >
            {file.name}
          </button>
        ))}
        <div className="mx-2 h-6 w-[1px] bg-white/20" />
        <button
          className="mb-1 aspect-square h-8 rounded-md bg-white/0 text-white opacity-50  transition-colors duration-100 ease-in hover:bg-white hover:text-black hover:opacity-100"
          onClick={onAddFile}
        >
          +
        </button>
        <button
          className="group mb-1 ml-auto flex h-8 -translate-y-1 items-center justify-center gap-1.5 rounded-md border border-white/20 bg-white/0 px-2 text-white opacity-50 transition-colors duration-100 ease-in hover:bg-white hover:text-black hover:opacity-100"
          onClick={onOpenAssetManager}
        >
          <Folder className="h-4 w-4 text-white group-hover:text-black" />
          <p>Assets</p>
        </button>
      </div>
    </div>
  );
};

export default TabBar;

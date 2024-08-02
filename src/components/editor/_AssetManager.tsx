"use client";

import { Asset } from "@/store/types";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface AssetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onAssetUpload: (newAssets: Asset[]) => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ isOpen, onClose, assets, onAssetUpload }) => {
  const [linkInput, setLinkInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const processFile = (file: File): Promise<Asset> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target && typeof event.target.result === "string") {
          resolve({
            name: file.name,
            src: event.target.result
          });
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newAssets = await Promise.all(acceptedFiles.map(processFile));
      onAssetUpload(newAssets);
    },
    [onAssetUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fetchAndStoreImage = async (url: string): Promise<Asset | null> => {
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const file = new File([blob], url.split("/").pop() || "image", { type: blob.type });

      return {
        name: file.name,
        src: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const handleLinkSubmit = useCallback(async () => {
    if (linkInput) {
      setIsLoading(true);
      const newAsset = await fetchAndStoreImage(linkInput);
      setIsLoading(false);
      if (newAsset) {
        onAssetUpload([newAsset]);
        setLinkInput("");
      } else {
        alert("Failed to fetch the image. Please check the URL and try again.");
      }
    }
  }, [linkInput, onAssetUpload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-2/3 max-w-2xl rounded-lg bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Asset Manager</h2>
        <div className="mb-4 flex">
          <input
            type="text"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            placeholder="Enter image URL"
            className="flex-grow rounded-l border p-2"
            disabled={isLoading}
          />
          <button
            onClick={handleLinkSubmit}
            className="rounded-r bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Add Link"}
          </button>
        </div>
        <div {...getRootProps()} className="mb-4 cursor-pointer rounded border-2 border-dashed p-4">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
          )}
        </div>
        <div className="mb-4 grid grid-cols-4 gap-4">
          {assets.map((asset, index) => (
            <div key={index} className="flex flex-col items-center">
              <Image
                src={asset.src}
                alt={asset.name}
                className="h-20 w-20 object-cover"
                width={500}
                height={500}
              />
              <p className="mt-2 text-sm">{asset.name}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AssetManager;

import { type Asset } from "@/store/code";
import * as Babel from "@babel/standalone";
import React, { useEffect, useRef, useState } from "react";

interface PreviewProps {
  files: { name: string; content: string }[];
  assets: Asset[];
}

const Preview: React.FC<PreviewProps> = ({ files, assets }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files.length || !iframeRef.current) return;

    const loadAssets = async () => {
      const assetData: Record<string, string> = {};
      for (const asset of assets) {
        try {
          const response = await fetch(asset.src);
          const blob = await response.blob();
          const base64 = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          assetData[asset.name] = base64;
        } catch (error) {
          console.error(`Failed to load asset ${asset.name}:`, error);
        }
      }
      return assetData;
    };

    loadAssets().then(assetData => {
      try {
        console.log(
          "Files to process:",
          files.map(f => f.name)
        );

        // Extract unique package imports
        const packageImports = new Set<string>();
        files.forEach(file => {
          const importMatches = file.content.match(/import.*from\s+['"](.+)['"]/g);
          if (importMatches) {
            importMatches.forEach(match => {
              const packageName = match.match(/from\s+['"](.+)['"]/)?.[1];
              if (
                packageName &&
                !packageName.startsWith(".") &&
                packageName !== "react" &&
                packageName !== "react-dom" &&
                packageName !== "three"
              ) {
                packageImports.add(packageName);
              }
            });
          }
        });

        console.log("Detected package imports:", Array.from(packageImports));

        // Transform each file
        const transformedModules = files.map(file => {
          console.log(`Processing file: ${file.name}`);
          const transformed = Babel.transform(file.content, {
            filename: file.name,
            presets: ["react", ["typescript", { isTSX: true, allExtensions: true }]],
            plugins: ["transform-modules-commonjs"]
          }).code;
          const moduleName = file.name.replace(/\.tsx?$/, "");
          console.log(`Transformed module name: ${moduleName}`);
          return { name: moduleName, code: transformed };
        });

        console.log(
          "Transformed modules:",
          transformedModules.map(m => m.name)
        );

        // Create a module system
        const moduleSystem = `
        const modules = {};
        const externalModules = {
          'react': React,
          'react-dom': ReactDOM,
          'three': THREE,
        };

        function resolvePath(currentPath, importPath) {
          if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const parts = currentPath.split('/');
            parts.pop(); // Remove the current file name
            const importParts = importPath.split('/');
            for (const part of importParts) {
              if (part === '.') continue;
              if (part === '..') {
                parts.pop();
              } else {
                parts.push(part);
              }
            }
            return parts.join('/');
          }
          return importPath;
        }

        function require(name, currentPath = '') {
          const resolvedName = resolvePath(currentPath, name).replace(/\\.tsx?$/, "");
          console.log("Requiring module:", resolvedName);
          if (externalModules[resolvedName]) {
            return externalModules[resolvedName];
          }
          if (!modules[resolvedName]) {
            throw new Error('Module ' + resolvedName + ' not found');
          }
          if (!modules[resolvedName].loaded) {
            modules[resolvedName].loaded = true;
            modules[resolvedName].exports = {};
            modules[resolvedName].fn(modules[resolvedName].exports, 
              (dep) => require(dep, resolvedName), 
              modules[resolvedName]
            );
          }
          return modules[resolvedName].exports;
        }

        // Load external modules
        ${Array.from(packageImports)
          .map(
            pkg => `
          import('https://cdn.skypack.dev/${pkg}')
            .then(module => {
              externalModules['${pkg}'] = module;
              console.log('Loaded external module: ${pkg}');
            })
            .catch(error => console.error('Failed to load ${pkg}:', error));
        `
          )
          .join("\n")}
      `;

        // Combine all transformed modules
        const combinedModules = transformedModules
          .map(
            m => `
        modules['${m.name}'] = {
          fn: function(exports, require, module) {
            ${m.code}
          },
          loaded: false
        };
      `
          )
          .join("\n");

        const iframeContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/three@0.136.0/build/three.min.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <script type="importmap">
                {
                  "imports": {
                    ${Array.from(packageImports)
                      .map(pkg => `"${pkg}": "https://cdn.skypack.dev/${pkg}"`)
                      .join(",\n")}
                  }
                }
              </script>
              <script>
                // Asset handling
                const assetData = ${JSON.stringify(assetData)};
                
                // CORS Proxy
                const corsProxy = 'https://cors-anywhere.herokuapp.com/';

                // Modify Three.js TextureLoader
                const originalTextureLoader = THREE.TextureLoader;
                THREE.TextureLoader = function() {
                  const loader = new originalTextureLoader();
                  const originalLoad = loader.load;
                  loader.load = function(url, onLoad, onProgress, onError) {
                    const assetName = url.startsWith('/') ? url.slice(1) : url;
                    if (assetData[assetName]) {
                      const image = new Image();
                      image.onload = function() {
                        const texture = new THREE.Texture(image);
                        texture.needsUpdate = true;
                        if (onLoad) onLoad(texture);
                      };
                      image.src = assetData[assetName];
                      return new THREE.Texture();
                    } else if (url.startsWith('http')) {
                      // Use CORS proxy for external URLs
                      return originalLoad.call(this, corsProxy + url, onLoad, onProgress, onError);
                    } else {
                      return originalLoad.call(this, url, onLoad, onProgress, onError);
                    }
                  };
                  return loader;
                };

                // Intercept all resource loads
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName) {
                  const element = originalCreateElement.call(document, tagName);
                  if (tagName.toLowerCase() === 'img') {
                    const originalSetAttribute = element.setAttribute;
                    element.setAttribute = function(name, value) {
                      if (name === 'src') {
                        if (value.startsWith('/')) {
                          const assetName = value.slice(1);
                          if (assetData[assetName]) {
                            arguments[1] = assetData[assetName];
                          }
                        } else if (value.startsWith('http')) {
                          // Use CORS proxy for external URLs
                          arguments[1] = corsProxy + value;
                        }
                      }
                      return originalSetAttribute.apply(this, arguments);
                    };
                  }
                  return element;
                };

                // Intercept fetch for other resource types
                const originalFetch = window.fetch;
                window.fetch = (url, options) => {
                  if (typeof url === 'string') {
                    if (url.startsWith('/')) {
                      const assetName = url.slice(1);
                      if (assetData[assetName]) {
                        return Promise.resolve(new Response(assetData[assetName]));
                      }
                    } else if (url.startsWith('http')) {
                      // Use CORS proxy for external URLs
                      return originalFetch(corsProxy + url, options);
                    }
                  }
                  return originalFetch(url, options);
                };
              </script>
            </head>
            <body>
              <div id="root"></div>
              <div id="error" style="display:none; color: red; padding: 10px; border: 1px solid red;"></div>
              <script type="module">
                ${moduleSystem}
                ${combinedModules}
                try {
                  console.log("Attempting to require 'index'");
                  const App = require('index').default;
                  ReactDOM.render(React.createElement(App), document.getElementById('root'));
                } catch (error) {
                  console.error('Error rendering app:', error);
                  document.getElementById('error').style.display = 'block';
                  document.getElementById('error').textContent = error.stack;
                }
              </script>
            </body>
          </html>
        `;

        const iframe = iframeRef.current;
        if (!iframe) return;
        iframe.srcdoc = iframeContent;

        // Reset error state when reloading iframe
        setError(null);
      } catch (error: unknown | Error) {
        console.error("Error compiling code:", error);
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    });
  }, [assets, files]);

  return (
    <div className="relative h-full w-full">
      {error && (
        <div
          className="relative left-0 right-0 top-0 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="preview"
        sandbox="allow-scripts"
        className="h-full w-full border-none"
      />
    </div>
  );
};

export default Preview;

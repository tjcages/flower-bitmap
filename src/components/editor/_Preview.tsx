import * as Babel from "@babel/standalone";
import React, { useEffect, useRef, useState } from "react";

interface PreviewProps {
  files: { name: string; content: string }[];
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files.length || !iframeRef.current) return;

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
              packageName !== "react-dom"
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
          'react-dom': ReactDOM
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
      iframe.srcdoc = iframeContent;

      // Reset error state when reloading iframe
      setError(null);
    } catch (error: unknown | Error) {
      console.error("Error compiling code:", error);
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }, [files]);

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

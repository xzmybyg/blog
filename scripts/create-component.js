// create-component.js
import * as fs from "fs";
import * as path from "path";

const componentName = process.argv[2];

if (!componentName) {
  console.error("Please supply a valid component name");
  process.exit(1);
}

const componentDirectory = `./src/components/${componentName}`;

if (fs.existsSync(componentDirectory)) {
  console.error(`Component ${componentName} already exists.`);
  process.exit(1);
}

fs.mkdirSync(componentDirectory);

const componentCode = `//import React from 'react';
import Style from "./index.module.scss";

export default function ${componentName}() {
  return <div className={Style.${componentName}}>${componentName}</div>;
}
`;

const indexPath = path.join(componentDirectory, "index.tsx");
fs.writeFileSync(indexPath, componentCode);

const scssCode = `.${componentName}{}`;

const scssPath = path.join(componentDirectory, "index.module.scss");
fs.writeFileSync(scssPath, scssCode);
console.log(`Component ${componentName} created at ${componentDirectory}`);

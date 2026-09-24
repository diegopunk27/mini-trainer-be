/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

const CONST_DEFAULT_DIR = './src';
const IGNORED_FILES = new Set(['.gitkeep']);

function checkNamingConvention(dir) {
  fs.readdirSync(dir).forEach((item) => {
    const fullPath = path.join(dir, item);

    if (fs.statSync(fullPath).isDirectory()) {
      if (!/^[a-z0-9-]+$/.test(item)) {
        console.log(`La siguiente carpeta no utiliza kebab name convention: ${item}`);
        process.exit(1);
      }
      checkNamingConvention(fullPath);
      return;
    }

    if (IGNORED_FILES.has(item)) {
      return;
    }

    const baseName = path.basename(item, path.extname(item));
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(baseName)) {
      console.log(`El archivo no respeta kebab name convention:  ${item}`);
      process.exit(1);
    }
  });
}

checkNamingConvention(CONST_DEFAULT_DIR);

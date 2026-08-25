import fs from 'fs';
import path from 'path';

import { execSync } from 'child_process';

const autoVersionName = execSync('node scripts/get-version.js').toString().trim();
console.log(`[Auto-Version] Configurando a versão do Tauri para: ${autoVersionName}`);

const tauriConfPath = path.resolve('src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));

tauriConf.version = autoVersionName;

fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');

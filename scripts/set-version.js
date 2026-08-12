import fs from 'fs';
import path from 'path';

// Automação de versionamento usando o fuso horário de Brasília (UTC-3)
// A string de data com sv-SE garante o formato ISO: "YYYY-MM-DD HH:mm:ss"
const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
const match = nowStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);

if (!match) {
  console.error("Erro ao fazer parse da data:", nowStr);
  process.exit(1);
}

const yy = parseInt(match[1].substring(2), 10); // Pega apenas os dois últimos dígitos do ano
const mm = parseInt(match[2], 10);
const d = parseInt(match[3], 10);
const h = parseInt(match[4], 10);
const m = parseInt(match[5], 10);

const buildNum = (d - 1) * 1440 + h * 60 + m;
const autoVersionName = `${yy}.${mm}.${buildNum}`;

console.log(`[Auto-Version] Configurando a versão do Tauri para: ${autoVersionName} (Fuso: America/Sao_Paulo)`);

const tauriConfPath = path.resolve('src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));

tauriConf.version = autoVersionName;

fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');

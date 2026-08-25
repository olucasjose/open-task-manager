import { execSync } from 'child_process';

let dateObj;

try {
  // Tenta pegar a data do último commit (formato ISO)
  const gitDateStr = execSync('git log -1 --format=%cI').toString().trim();
  dateObj = new Date(gitDateStr);
} catch (e) {
  // Em caso de erro (ex: fora do repositório), faz fallback para a data atual
  dateObj = new Date();
}

// Converte para a timezone do Brasil para garantir consistência em qualquer ambiente
const nowStr = dateObj.toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
const match = nowStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);

if (!match) {
  console.error("Erro ao fazer parse da data:", nowStr);
  process.exit(1);
}

const yy = parseInt(match[1].substring(2), 10);
const mm = parseInt(match[2], 10);
const d = parseInt(match[3], 10);
const h = parseInt(match[4], 10);
const m = parseInt(match[5], 10);

const buildNum = (d - 1) * 1440 + h * 60 + m;
const versionName = `${yy}.${mm}.${buildNum}`;

// Se for requisitado o código inteiro da versão (para o Android versionCode)
if (process.argv.includes('--code')) {
  console.log(Math.floor(dateObj.getTime() / 1000));
} else {
  // Retorna apenas a string da versão por padrão
  console.log(versionName);
}

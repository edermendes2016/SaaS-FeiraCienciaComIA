const fs = require('fs');
const path = require('path');

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  return env;
}

const env = parseDotEnv('./.env');

const envConfigFile = `export const environment = {
  production: false,
  firebase: {
    apiKey: "${env.FIREBASE_API_KEY || ''}",
    authDomain: "${env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${env.FIREBASE_APP_ID || ''}",
    measurementId: "${env.FIREBASE_MEASUREMENT_ID || ''}"
  }
};
`;

const dir = './src/environments';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Para o arquivo padrão (dev)
fs.writeFileSync(path.join(dir, 'environment.ts'), envConfigFile);

// Para o arquivo de produção
const prodConfigFile = envConfigFile.replace('production: false', 'production: true');
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), prodConfigFile);

console.log('Arquivos de ambiente gerados com sucesso a partir do .env!');

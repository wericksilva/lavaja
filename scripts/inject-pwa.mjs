import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const htmlPath = path.join(dist, 'index.html');

if (!fs.existsSync(htmlPath)) {
  throw new Error('Não encontrei dist/index.html. Execute a exportação web antes deste script.');
}

// Garante que os arquivos públicos do PWA estejam no diretório publicado.
fs.cpSync(publicDir, dist, { recursive: true });

let html = fs.readFileSync(htmlPath, 'utf8');
const pwaTags = `\n    <link rel="manifest" href="./manifest.webmanifest" />\n    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32.png" />\n    <link rel="icon" href="./favicon.ico" sizes="any" />\n    <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />\n    <meta name="theme-color" content="#0878E8" />\n    <meta name="mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-title" content="LavaJá" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="default" />\n`;

// Evita inserir as tags mais de uma vez quando o script for executado novamente.
html = html.replace(/\s*<link[^>]+rel=["']manifest["'][^>]*\/?\s*>/gi, '');
html = html.replace('</head>', `${pwaTags}  </head>`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('PWA do LavaJá configurado: manifest, favicon e ícone para tela inicial.');

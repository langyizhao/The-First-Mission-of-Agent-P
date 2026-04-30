const fs = require('fs');

function encode(file, mime) {
  if (!fs.existsSync(file)) return null;
  const data = fs.readFileSync(file);
  return `data:${mime};base64,${data.toString('base64')}`;
}

const env = encode('src/assets/Environment.jpeg', 'image/jpeg');
const player = encode('src/assets/player.png', 'image/png');
const enemy = encode('src/assets/enemy.png', 'image/png');
const briefcase = encode('src/assets/briefcase.png', 'image/png');

let content = `// Auto-generated. Do not edit.\n`;
if (env) content += `export const envImageB64 = "${env}";\n`;
if (player) content += `export const playerImageB64 = "${player}";\n`;
if (enemy) content += `export const enemyImageB64 = "${enemy}";\n`;
if (briefcase) content += `export const briefcaseImageB64 = "${briefcase}";\n`;

fs.writeFileSync('src/game/assetsBase64.ts', content);
console.log('Encoded successfully. Size:', content.length);

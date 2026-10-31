#!/usr/bin/env node

/**
 * Publica uma atualização OTA (EAS Update) para os APKs do perfil `preview`.
 *
 * O bundle é gerado nesta máquina, então o .env.local (IP da rede local) seria
 * embutido no app. Aqui forçamos as variáveis de build.preview.env do eas.json
 * (URL do backend no Render), que têm prioridade sobre os arquivos .env.
 *
 * Uso: npm run update -- "descrição da mudança"
 */

const { spawnSync } = require("child_process");
const easConfig = require("../eas.json");

const env = { ...process.env, ...easConfig.build.preview.env };
const message = process.argv.slice(2).join(" ") || "Atualização do app";

console.log(`EXPO_PUBLIC_API_URL=${env.EXPO_PUBLIC_API_URL}`);

// npx funciona mesmo sem o eas-cli instalado globalmente
const result = spawnSync(
  "npx",
  ["--yes", "eas-cli", "update", "--branch", "preview", "--message", JSON.stringify(message)],
  { stdio: "inherit", env, shell: true }
);

process.exit(result.status ?? 1);

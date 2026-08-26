# 🌊 Onda do Bem

Aplicativo mobile social voltado para ações positivas relacionadas ao meio ambiente e à comunidade.

## 📱 Sobre

O Onda do Bem permite que pessoas registrem ações positivas, compartilhem com a comunidade e acompanhem o impacto coletivo gerado.

**Plataformas:** iOS · Android

## 🛠 Tech Stack

| Tecnologia | Propósito |
|:---|:---|
| React Native | Framework mobile cross-platform |
| Expo (SDK 57) | Toolchain e runtime |
| TypeScript (strict) | Segurança de tipos |
| Expo Router | Navegação file-based |
| Zustand | Estado global (client) |
| TanStack Query | Estado remoto (server) |
| Axios | HTTP client |
| React Hook Form + Zod | Formulários e validação |

## 📂 Estrutura do Projeto

```
src/
├── app/            # Expo Router — rotas e layouts
├── components/     # Componentes reutilizáveis
│   ├── ui/         # Design system (Button, Text, Input, Card...)
│   └── common/     # Componentes compartilhados (ErrorBoundary)
├── features/       # Módulos por domínio (auth, feed, post, profile...)
├── hooks/          # Hooks globais
├── services/       # Comunicação externa (API, storage, analytics...)
├── store/          # Estado global (Zustand)
├── types/          # Tipos TypeScript globais
├── constants/      # Design tokens, config
├── utils/          # Funções utilitárias
└── providers/      # Context providers
```

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) (>= 18)
- [npm](https://www.npmjs.com/) (>= 9)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/go) no dispositivo (para testes)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Onda-do-bem.git
cd Onda-do-bem

# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npx expo start
```

### Scripts disponíveis

| Script | Descrição |
|:---|:---|
| `npm start` | Inicia o Expo dev server |
| `npm run android` | Inicia no emulador Android |
| `npm run ios` | Inicia no simulador iOS |
| `npm run web` | Inicia no navegador |
| `npm run lint` | Executa o ESLint |

## 🎨 Design System

O design system do Onda do Bem está definido em `src/constants/theme.ts`:

- **Paleta:** Oceano (primary) · Natureza (secondary) · Energia (accent)
- **Tipografia:** System font com escala definida
- **Espaçamento:** Múltiplos de 4px
- **Temas:** Light e Dark com suporte a preferência do sistema

## 🏗 Arquitetura

- **Feature-First:** Cada domínio (auth, feed, profile) tem seus próprios componentes, hooks, services e types
- **Separação de camadas:** UI → Hooks → Services → API Client
- **Estado:** Zustand (client) + TanStack Query (server) — nunca duplicados
- **Preparado para backend:** Alterar apenas a camada de services quando a API estiver pronta

## 📋 Licença

Este projeto está sob a licença MIT.

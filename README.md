# 🌊 Onda do Bem

Plataforma social e comunitária voltada para o registro, georreferenciamento e engajamento em ações sustentáveis e de impacto positivo ao meio ambiente e à sociedade.

---

## 📱 Sobre o Projeto

O **Onda do Bem** conecta voluntários e cidadãos conscientes em uma rede ativa de preservação ecológica e impacto social. O ecossistema permite criar e acompanhar mutirões de limpeza, reciclagem, plantio de mudas e hortas comunitárias, visualizá-los em mapa interativo, registrar fotos e relatos no feed, acumular pontos de impacto ecológico e acompanhar o crescimento coletivo da comunidade.

**Plataformas suportadas:** iOS · Android · Web

---

## ✨ Funcionalidades Principais & Recentes

* 🗺️ **Mapa Interativo & Criação Georreferenciada de Ações:**
  * Visualização de todas as ações ecológicas distribuídas geograficamente com marcadores categorizados e filtros dinâmicos.
  * **Criação de ações diretamente pelo mapa:** basta tocar em qualquer local do mapa para posicionar um marcador (*pin*) e abrir o modal de cadastro.
  * Cadastro completo da atividade: título, categoria, descrição detalhada, horário de início e término (`startDate` e `endDate`) e fotos.
  * Suporte a fotos via **câmera**, **galeria do dispositivo** ou **presets ilustrativos de alta definição**.
  * Sincronização em tempo real: a nova ação criada no mapa é imediatamente refletida no feed da comunidade.

* 🔐 **Autenticação JWT Completa (Login & Cadastro):**
  * Tela de autenticação moderna (`/login`) com transição suave entre abas de **Entrar** e **Criar Conta**.
  * **Contas de teste com 1 clique:** botões de preenchimento rápido para testar imediatamente com os usuários pré-cadastrados no backend (Lucas, Marina, Pedro).
  * Modo visitante (*Guest/Explore*): permite navegar e conhecer o aplicativo sem obrigatoriedade de login imediato.
  * Gerenciamento de credenciais e tokens JWT (*Access* e *Refresh Token*) com armazenamento seguro no dispositivo via **`expo-secure-store`**.
  * Arquitetura com **`token-registry`**: desacoplamento dos interceptors HTTP do Axios com o store Zustand, garantindo injeção automática de Bearer Token e renovação silenciosa de sessão.
  * Painel de Gestão de Conta integrado à tela de **Configurações** (`settings.tsx`), exibindo o usuário conectado e opção de logout seguro.

* 📰 **Feed Social Comunitário & Impacto:**
  * Linha do tempo de publicações com histórias, fotos, metas alcançadas e voluntários participantes.
  * Sistema de engajamento social com curtidas e comentários utilizando atualizações otimistas na UI.
  * Pontuação de impacto ambiental e sistema de níveis/ranking ecológico (Semente, Broto, Guardião, Embaixador, etc.).

* 🎨 **Experiência Visual & Design System:**
  * Design moderno com suporte nativo a **Modo Claro (Light)** e **Modo Escuro (Dark)**.
  * Microinterações, feedback tátil, modais fluidos e tratamento de layout responsivo com safe area.

---

## 🛠 Tech Stack

### Mobile (Frontend)
| Tecnologia | Propósito |
|:---|:---|
| **React Native** | Framework mobile multiplataforma |
| **Expo (SDK 52+)** | Toolchain, runtime, módulos nativos e build |
| **TypeScript (strict)** | Tipagem estática e segurança de código |
| **Expo Router** | Navegação baseada em arquivos (*file-based routing*) |
| **Zustand + AsyncStorage** | Gerenciamento de estado global e persistência local |
| **Expo SecureStore** | Armazenamento seguro e encriptado de tokens JWT no dispositivo |
| **React Native WebView** | Renderização do mapa interativo geográfico com Leaflet/OpenStreetMap |
| **Expo Image & ImagePicker** | Carregamento otimizado de imagens e captura via câmera/galeria |
| **TanStack Query** | Cache e sincronização de estado remoto |
| **Axios + Interceptors** | Cliente HTTP com suporte a Bearer JWT, refresh automático e token registry |
| **React Hook Form + Zod** | Gestão de formulários e validação de schema |

### Backend (API RESTful)
| Tecnologia | Propósito |
|:---|:---|
| **Kotlin 2.x** | Linguagem moderna e concisa para a JVM |
| **Spring Boot 3** | Framework backend (Web, Data JPA, Security, Validation) |
| **Java 21 LTS** | Runtime de alto desempenho |
| **Spring Security + JJWT** | Autenticação stateless via tokens JWT (Access & Refresh) |
| **H2 Database** | Banco de dados relacional em memória para desenvolvimento ágil |
| **PostgreSQL** | Banco relacional pronto para ambientes de homologação e produção |
| **Gradle (Kotlin DSL)** | Automação de compilação e gestão de dependências |

---

## 📂 Estrutura do Repositório

```text
Onda-do-bem/
├── backend/                         # API RESTful em Kotlin & Spring Boot
│   ├── src/main/kotlin/             # Código-fonte da aplicação
│   │   └── com/ondadobem/api/
│   │       ├── config/              # Segurança JWT, CORS e carga inicial (DataInitializer)
│   │       ├── controller/          # Endpoints REST (Auth, Posts, Users, Impact)
│   │       ├── domain/              # Entidades JPA, Enums e Repositories
│   │       ├── dto/                 # DTOs de Request e Response
│   │       ├── exception/           # Tratamento global de erros e exceções HTTP
│   │       └── service/             # Regras de negócio e autenticação
│   ├── src/main/resources/          # application.yml e configurações de banco
│   └── build.gradle.kts             # Dependências e plugins Gradle
│
├── src/                             # Aplicativo Mobile em React Native (Expo)
│   ├── app/                         # Expo Router — Telas e navegação
│   │   ├── (tabs)/                  # Barra de navegação inferior (Tabs)
│   │   │   ├── _layout.tsx          # Configuração visual das abas
│   │   │   ├── index.tsx            # Feed social de ações ecológicas
│   │   │   ├── map.tsx              # Mapa interativo com criação de ações via Pin
│   │   │   ├── create.tsx           # Formulário dedicado para criação de publicações
│   │   │   ├── profile.tsx          # Perfil do voluntário, conquistas e ranking
│   │   │   └── settings.tsx         # Configurações de tema e gerenciamento de conta
│   │   ├── login.tsx                # Tela de Autenticação (Login e Cadastro com JWT)
│   │   ├── _layout.tsx              # Root Layout, Providers e inicialização de sessão
│   │   └── +not-found.tsx           # Tratamento de rotas inexistentes
│   ├── components/                  # Componentes de UI reutilizáveis e cards de feed
│   ├── constants/                   # Configurações globais, tema e dados mock de fallback
│   ├── features/                    # Módulos organizados por domínio de negócio
│   ├── hooks/                       # Custom hooks (tema, autenticação, etc.)
│   ├── providers/                   # Provedores de contexto (AppProviders)
│   ├── services/                    # Integração com API REST e storage
│   │   ├── api/                     # Cliente Axios, interceptors e token-registry
│   │   └── storage/                 # AsyncStorage e SecureStore
│   ├── store/                       # Stores globais Zustand (Auth, Feed, Theme)
│   ├── types/                       # Interfaces TypeScript (Entidades e API)
│   └── utils/                       # Utilitários de data, rank e resolução de imagens
│
├── assets/                          # Imagens locais, ícones e splash screen
└── package.json                     # Dependências e scripts do frontend mobile
```

---

## 🚀 Como Executar o Projeto

Para executar o ecossistema completo localmente, siga os passos abaixo:

### Pré-requisitos
* [Node.js](https://nodejs.org/) (>= 18) e [npm](https://www.npmjs.com/) (>= 9)
* [Java Development Kit (JDK 21)](https://adoptium.net/) instalado e configurado no PATH
* Aplicativo **Expo Go** instalado no smartphone (iOS ou Android) ou emulador configurado

---

### 1. Iniciando o Backend (API REST)

Abra uma janela de terminal na pasta `backend`:

```powershell
# No Windows (PowerShell):
cd backend
.\gradlew.bat bootRun

# No Linux ou macOS:
cd backend
./gradlew bootRun
```

* **API REST:** `http://localhost:8080/api`
* **Console do Banco H2:** `http://localhost:8080/h2-console`
  * **JDBC URL:** `jdbc:h2:mem:ondadobemdb`
  * **User Name:** `sa`
  * **Password:** *(deixe em branco)*

> **Credenciais de teste pré-cadastradas no backend:**
> * `lucas.silva@ondadobem.org` / `senha123`
> * `marina.costa@ondadobem.org` / `senha123`
> * `pedro.almeida@ondadobem.org` / `senha123`
>
> *Dica: Na tela de Login do aplicativo, você pode clicar nos botões rápidos de preenchimento para testar qualquer uma dessas contas com apenas 1 toque!*

---

### 2. Configurando as Variáveis de Ambiente do Mobile

Na raiz do projeto (`Onda-do-bem`), crie ou edite o arquivo `.env` (ou `.env.local`):

```bash
cp .env.example .env
```

O aplicativo já conta com **detecção automática inteligente** para os seguintes cenários:
* **Emulador Android (AVD):** direciona automaticamente para `http://10.0.2.2:8080/api`
* **Simulador iOS ou Navegador Web:** direciona automaticamente para `http://localhost:8080/api`

Caso vá testar em um **dispositivo móvel físico** conectado ao mesmo Wi-Fi, defina seu IP local:

```env
# Descubra o IP da sua máquina com 'ipconfig' (Windows) ou 'ifconfig' (Mac/Linux)
EXPO_PUBLIC_API_URL=http://192.168.1.XX:8080/api
```

---

### 3. Iniciando o Aplicativo Mobile

Em outra janela de terminal, na raiz do projeto:

```bash
# Instale as dependências JavaScript
npm install

# Inicie o servidor Expo
npx expo start
```

* **No celular físico:** Abra a câmera (iOS) ou o app Expo Go (Android) e escaneie o QR Code exibido no terminal.
* **No navegador web:** Pressione `w` no terminal para abrir o app na web.
* **No emulador Android:** Pressione `a` no terminal.
* **No simulador iOS:** Pressione `i` no terminal.

---

### 4. Como Testar as Funcionalidades Recentes

1. **Testando a Autenticação com a API Spring Boot:**
   * Acesse a tela de **Configurações** e toque em **Fazer Login / Cadastrar**, ou abra a tela de Login.
   * Toque em qualquer um dos chips rápidos (Lucas, Marina ou Pedro) para preencher os dados de teste e clique em **Entrar**.
   * O aplicativo autenticará com a API Spring Boot, receberá os tokens JWT, armazenará com segurança no `SecureStore` e exibirá o perfil conectado.
   * Teste também o cadastro de um novo usuário na aba **Criar conta**.

2. **Testando a Criação de Ações no Mapa Interativo:**
   * Acesse a aba **Mapa**.
   * Toque em qualquer ponto do mapa (praias, parques ou praças) para adicionar um marcador (*pin*).
   * O formulário interativo de criação será aberto com as coordenadas preenchidas.
   * Preencha o título, categoria, horários de início e término (`startDate`/`endDate`), selecione uma foto e confirme a publicação.
   * A nova ação será adicionada ao mapa e exibida imediatamente na aba **Feed**.

---

## 🏗 Arquitetura do Sistema

* **Separação Frontend/Backend:** O app mobile se comunica com a API Kotlin / Spring Boot via REST com autenticação Bearer Token JWT.
* **Resiliência e Cache Híbrido:** O frontend utiliza atualizações otimistas no Zustand combinadas com persistência local no AsyncStorage, garantindo que o usuário visualize dados mesmo se a conexão estiver instável.
* **Token Registry Pattern:** Arquitetura desacoplada onde o store de autenticação registra manipuladores de token (`tokenRegistry`), evitando dependências circulares entre a camada de rede (Axios interceptors) e os stores globais de estado.
* **Persistência Segura:** Tokens sensíveis (Access e Refresh Token) são salvos de forma encriptada usando `expo-secure-store`.
* **Feature-First:** Organização modular por domínio de negócio (`auth`, `feed`, `impact`, `post`, `profile`, `notifications`).

---

## 👥 Desenvolvedores

* **Wallace Coimbra**
* **Mateus Sepulvida**
* **Javier Penalver**

---

## 📋 Licença

Este projeto está sob a licença [MIT](LICENSE).

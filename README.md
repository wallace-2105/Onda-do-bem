# 🌊 Onda do Bem

Plataforma social e comunitária voltada para o registro e engajamento em ações sustentáveis e de impacto positivo ao meio ambiente e à sociedade.

---

## 📱 Sobre o Projeto

O **Onda do Bem** permite que voluntários e cidadãos conscientes registrem ações ecológicas e sociais (como mutirões de limpeza, reciclagem, plantio de mudas e hortas comunitárias), compartilhem fotos e relatos no feed da comunidade, ganhem pontos de impacto e acompanhem o crescimento coletivo da rede.

**Plataformas suportadas:** iOS · Android · Web

---

## 🛠 Tech Stack

### Mobile (Frontend)
| Tecnologia | Propósito |
|:---|:---|
| **React Native** | Framework mobile multiplataforma |
| **Expo (SDK 57)** | Toolchain, runtime e build |
| **TypeScript (strict)** | Tipagem estática e segurança de código |
| **Expo Router** | Navegação baseada em arquivos (*file-based routing*) |
| **Zustand + AsyncStorage** | Gerenciamento de estado global e persistência local |
| **TanStack Query** | Cache e sincronização de estado remoto |
| **Axios** | Cliente HTTP com suporte a interceptors e autenticação JWT |
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
├── backend/                  # API RESTful em Kotlin & Spring Boot
│   ├── src/main/kotlin/      # Controllers, Services, Entidades JPA e Repositórios
│   │   └── com/ondadobem/api/
│   │       ├── config/       # Segurança JWT, CORS e carga inicial (DataInitializer)
│   │       ├── controller/   # Endpoints de Auth, Posts, Users e Impact
│   │       ├── domain/       # Entidades JPA, Enums e Repositories
│   │       ├── dto/          # Objetos de transferência de dados (DTOs)
│   │       └── service/      # Regras de negócio
│   ├── src/main/resources/   # application.yml e configurações de banco
│   └── build.gradle.kts      # Configuração do Gradle
│
├── src/                      # Aplicativo Mobile em React Native (Expo)
│   ├── app/                  # Expo Router — Telas, abas e layouts
│   ├── components/           # Componentes visuais (Design System & Feed)
│   ├── constants/            # Tokens de tema, cores e dados mock de fallback
│   ├── features/             # Módulos por domínio de negócio
│   ├── hooks/                # Hooks customizados React
│   ├── services/             # Cliente de API Axios, storage e endpoints
│   ├── store/                # Armazenamento global (Zustand)
│   ├── types/                # Definições de tipos TypeScript
│   └── utils/                # Helpers, resolvedores de imagem e pontuação
│
├── assets/                   # Imagens locais, ícones e splash screen
└── package.json              # Dependências e scripts do frontend mobile
```

---

## 🚀 Como Executar o Projeto

Para executar o ecossistema completo localmente, siga os passos abaixo:

### Pré-requisitos
* [Node.js](https://nodejs.org/) (>= 18) e [npm](https://www.npmjs.com/) (>= 9)
* [Java Development Kit (JDK 21)](https://adoptium.net/) instalado e configurado no PATH
* Aplicativo **Expo Go** instalado no seu smartphone (disponível na App Store e Google Play) para testes no dispositivo físico

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

* A API iniciará em: **`http://localhost:8080`**
* Console do banco de dados H2: **`http://localhost:8080/h2-console`**
  * **JDBC URL:** `jdbc:h2:mem:ondadobemdb`
  * **User Name:** `sa`
  * **Password:** *(deixe em branco)*

> **Credenciais de teste pré-cadastradas no backend:**
> * `lucas.silva@ondadobem.org` / `senha123`
> * `marina.costa@ondadobem.org` / `senha123`
> * `pedro.almeida@ondadobem.org` / `senha123`

---

### 2. Configurando as Variáveis de Ambiente do Mobile

Na raiz do projeto (`Onda-do-bem`), crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configure a variável `EXPO_PUBLIC_API_URL` de acordo com onde você irá testar o app:

```env
# 1. Para Emulador Android (AVD):
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api

# 2. Para Simulador iOS ou Navegador Web:
EXPO_PUBLIC_API_URL=http://localhost:8080/api

# 3. Para Celular Físico via Expo Go (mesmo Wi-Fi do computador):
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

* **No celular:** Abra a câmera (iOS) ou o app Expo Go (Android) e escaneie o QR Code exibido no terminal.
* **No computador:** Pressione `w` no terminal para abrir no navegador web ou `a` para emulador Android.

---

## 🎨 Design System

O design system está centralizado em `src/constants/theme.ts`:
* **Paleta:** Oceano (*Primary*) · Natureza (*Secondary*) · Energia (*Accent*)
* **Tipografia:** Tipografia do sistema com escala proporcional
* **Espaçamento:** Grade modular de múltiplos de 4px
* **Temas:** Suporte dinâmico a modo Claro (*Light*) e Escuro (*Dark*)

---

## 🏗 Arquitetura do Sistema

* **Separação Frontend/Backend:** O app mobile se comunica com o backend via REST com autenticação Bearer Token JWT.
* **Resiliência e Cache Híbrido:** O frontend utiliza atualizações otimistas no Zustand com persistência local no AsyncStorage, garantindo que o usuário visualize dados mesmo se a conexão estiver instável.
* **Feature-First:** Organização modular por domínio de negócio (`auth`, `feed`, `impact`, `profile`).

---

## 👥 Desenvolvedores

* **Wallace Coimbra**
* **Mateus Sepulvida**
* **Javier Penalver**

---

## 📋 Licença

Este projeto está sob a licença [MIT](LICENSE).

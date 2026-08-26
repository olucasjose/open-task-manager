# Como Compilar o Projeto

O **Open Task Manager** é uma aplicação híbrida. A interface web é feita em React (Vite) e encapsulada em aplicativos nativos usando **Capacitor** (para Android) e **Tauri** (para Desktop Linux).

Abaixo estão as instruções para compilar cada plataforma localmente a partir do código-fonte.

---

## 1. Pré-requisitos Gerais
Independente da plataforma, a base da interface requer as seguintes ferramentas:
- **Node.js** (v22+)
- **pnpm** (v9+)

Instale as dependências executando na raiz do repositório:
```bash
pnpm install
```

---

## 2. Compilação Web (Local)
A interface base pode ser executada isoladamente no navegador, o que é ideal para o fluxo de desenvolvimento de UI.

1. **Desenvolvimento Local:** Para abrir o servidor Vite em modo HMR (hot-reload):
   ```bash
   pnpm run dev
   ```

2. **Build de Produção:** Para gerar o código final estático que será embutido no Android e no Desktop:
   ```bash
   pnpm run build
   ```
   *Os arquivos ficarão na pasta `dist/`.*

---

## 3. Compilação Desktop (Tauri / Linux DEB)
A build Desktop transforma a aplicação web em um executável ultraleve utilizando o framework Rust Tauri.

### Pré-requisitos
- **Rust & Cargo** instalados no sistema (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`).
- Pacotes nativos de sistema para o Ubuntu/Debian:
  ```bash
  sudo apt update
  sudo apt install -y libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
  ```

### Build
1. Gere o pacote de produção executando o CLI do Tauri:
   ```bash
   pnpm tauri build
   ```
2. Após a conclusão, o executável binário e o instalador `.deb` poderão ser encontrados no diretório:
   `src-tauri/target/release/bundle/deb/`

---

## 4. Compilação Mobile (Android / Capacitor)
A compilação do Android necessita que o código web já esteja construído e sincronizado com o projeto Java/Kotlin que encapsula o projeto.

### Pré-requisitos
- **Android Studio** instalado.
- SDK do Android (Mínimo recomendado: API 22+) configurado.
- Variáveis de ambiente `JAVA_HOME` (JDK 21) e `ANDROID_HOME` configuradas na máquina.

### Build
1. Rode o build da web para gerar o pacote mais recente:
   ```bash
   pnpm run build
   ```
2. Sincronize a pasta `dist/` recém-criada com a pasta nativa do projeto Android:
   ```bash
   npx cap sync android
   ```
3. A partir deste ponto, você pode abrir a interface oficial do Android Studio para compilar e assinar o aplicativo:
   ```bash
   npx cap open android
   ```
   > No menu superior do Android Studio, vá em `Build > Generate Signed Bundle / APK` para finalizar o processo de release da build.

4. Alternativamente, para compilar a build Release não-assinada pelo terminal:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *O artefato estará em `android/app/build/outputs/apk/release/`.*

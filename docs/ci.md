# Integração Contínua (CI)

O projeto utiliza **GitHub Actions** para automatizar a compilação, testes e disponibilização de binários instaláveis (.deb, .apk) da aplicação de forma padronizada. 

Esta automação isenta os desenvolvedores de precisarem configurar ecossistemas nativos pesados nas suas máquinas locais (como Android Studio ou dependências do Tauri) na maioria dos casos. Todos os *workflows* podem ser encontrados na pasta `.github/workflows/`.

---

## 1. Workflows Disponíveis

### Desktop Release (`desktop-release.yml`)
Fluxo responsável por gerar a versão instalável final para distribuições baseadas em Linux Debian.
1. Inicia um ambiente virtual limpo com Ubuntu.
2. Instala Node.js, `pnpm` (gerenciador de pacotes) e o *toolchain* nativo do Rust.
3. Baixa dependências nativas vitais para compilação GUI Linux (webkit2gtk, libgtk, etc).
4. Compila o projeto Web e inicializa o build final otimizado do Tauri.
5. Renomeia o pacote final para seguir nosso padrão de lançamento: `otm_{versão}_release.deb`.
6. Envia o artefato assinado para as releases (ou anexos do pipeline) do GitHub.

### Desktop Debug (`desktop-debug.yml`)
Funciona de maneira semelhante à build de Release, mas dispara o comando Tauri em modo **debug**.
O artefato `.deb` resultante não passa por *strip* ou minimizações, sendo nomeado como `otm_{versão}_debug.deb` e é destinado estritamente à análise e testes locais.

### Android Release (`android-release.yml`)
Fluxo encarregado da geração do pacote nativo para Android.
1. Utiliza a infraestrutura de Actions para configurar a **JDK 21** e um ambiente oficial Android seguro.
2. Compila todo o lado frontend da aplicação (React/Vite).
3. Utiliza a CLI do Capacitor (`npx cap sync android`) para injetar a pasta `dist` construída dentro do esqueleto do Android Studio nativo.
4. Delega ao **Gradle** a tarefa de montagem de um binário de produção usando o comando `assembleRelease`.
5. Renomeia e expõe o pacote APK não-assinado (unsigned) gerado (`otm_{versão}_release.apk`) para os artefatos do repositório, facilitando eventuais assinaturas externas de PlayStore.

### Android Debug (`android-debug.yml`)
Idêntico ao processo do Android Release, mas o Gradle é orientado a chamar o comando de montagem para desenvolvedores (`assembleDebug`).
Este fluxo entrega um APK de testes que permite conexão ativa e ferramentas de devtools, sufixado como `otm_{versão}_debug.apk`.

---

## 2. Padrão de Nomenclatura
Os workflows de CI já contêm lógica customizada para ler dinamicamente o número da versão registrado na `package.json` do projeto, formatando todos os artefatos seguindo a padronização oficial:
`otm_<VERSÃO>_<TIPO>.<EXTENSÃO>`

Exemplos gerados pela CI:
- `otm_26.8.0_release.deb`
- `otm_26.8.0_debug.apk`

---

## 3. Acionamento
A maioria dos workflows estão configurados para **disparo manual** (através de `workflow_dispatch`). Na interface web do GitHub, navegando até a aba *Actions*, é possível selecionar a plataforma desejada e clicar em **Run workflow**.

As configurações atuais permitem rodar o build partindo de qualquer *branch* rastreada (ex: `main`, `refactor`), possibilitando a validação das modificações via APK e DEB antes de que essas mudanças atinjam os usuários em produção.

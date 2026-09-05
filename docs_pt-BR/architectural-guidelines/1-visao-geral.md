# Visão Geral Arquitetural (Baseline v1)

Este documento fornece uma visão panorâmica da arquitetura do `open-task-manager`. O projeto foi concebido seguindo princípios de **Clean Architecture**, promovendo a separação de responsabilidades (SoC - Separation of Concerns), inversão de dependências e alta modularidade. 

A arquitetura garante que a interface de usuário (UI) não esteja fortemente acoplada à lógica de negócios, e que a lógica de negócios, por sua vez, independa da infraestrutura subjacente (Tauri, Capacitor ou Web).

> **Atenção (Regra de Ouro Arquitetural):** Se uma nova implementação precisar violar uma regra documentada nestes arquivos, não se contorna a regra silenciosamente. Abre-se uma decisão arquitetural explícita, com justificativa, impacto e aprovação.

## Estrutura de Camadas

O sistema divide-se conceitualmente nas seguintes camadas:

### 1. Presentation Layer (Camada de Apresentação)
Responsável exclusivamente por renderizar a interface, injetar dependências e interagir com o usuário.
- **Componentes (`src/components/`)**: Elementos visuais reutilizáveis, "burros" (dumb components) ou com estado estritamente visual. Não possuem conhecimento das regras de negócio.
- **Páginas / Screens (`src/pages/`)**: Representam telas inteiras. É aqui que ocorre a composição. A Screen obtém os dados do Zustand (Store), obtém o Router, obtém os Services e injeta todas essas dependências no Controller.

### 2. Application Layer (Camada de Aplicação / Controladores)
Atua como orquestradora (cola) das ações da UI.
- **Controllers (`src/controllers/`)**: Implementados como React Hooks. O Controller coordena o Service e recebe, por injeção (via parâmetros), os dados e callbacks necessários para atualizar o estado. **Ele não deve acessar Zustand, Router ou Context diretamente.**

### 3. State Management (Gerenciamento de Estado)
Responsável por manter o cache/estado na interface de maneira global.
- **Store (`src/store/`)**: Implementado através do `Zustand`. Mantém o estado reativo da aplicação. A Screen obtém as ações do Store e as injeta no Controller como callbacks. O Controller executa esses callbacks após o sucesso da operação no Service.

### 4. Business / Application Logic (Regras de Negócio / Serviços)
O "coração" operacional da aplicação. Encapsula as regras de negócio puras e define as entidades (tipos).
- **Tipos/Entidades (`src/types.ts`)**: Definição de estruturas cruciais, como `Entry` e `Notebook`. Independem de qualquer tecnologia de persistência ou interface.
- **Services (`src/services/`)**: Classes ou módulos que contêm as regras de negócio. O Service executa a regra/operação e retorna um resultado. Ele **não deve conhecer o Store**. Depende, através de injeção, de uma abstração de infraestrutura (como `DatabaseAdapter`).

### 5. Infrastructure Layer (Camada de Infraestrutura)
Interage de fato com APIs nativas, sistemas de arquivos e ambientes específicos do S.O.
- **Library/Infra (`src/lib/`)**: Lida com o banco de dados e persistência. É dividida principalmente em:
  - `db/`: Adaptadores abstratos (`DatabaseAdapter.ts`) e concretos (`CapacitorAdapter.ts`, `TauriAdapter.ts`, `WebAdapter.ts`).
  - `platform/`: Cria as dependências apropriadas dependendo do ambiente (`PlatformFactory.ts`).
- **Contextos/Injeção de Dependências (`src/contexts/`)**: Contêineres de Injeção de Dependência (DI) em forma de React Contexts (ex: `DatabaseContext.tsx`).

---

## Sobre Abstrações

Novas camadas, adapters, services ou abstrações somente devem ser introduzidos quando houver uma responsabilidade concreta que justifique sua existência. **Não criar abstrações exclusivamente para antecipar necessidades futuras.**

---

## Fluxo de Dados

O fluxo correto de informações (ex: salvar um novo item) deve ocorrer da seguinte forma:

1. **Service** executa regra/operação persistindo na Infraestrutura e retorna o resultado.
2. **Controller** chama o Service, interpreta o resultado e invoca os callbacks.
3. **Screen / Callbacks** (injetados no Controller) atualizam o **Store**.
4. **Store** mantém o estado/cache e reflete as alterações para a UI.

---

## Regras de Dependência

As dependências permitidas entre camadas são rígidas para evitar acoplamento (puteiro de implementações desconexas):

**É PERMITIDO:**
- **Presentation (Screen)**
  - → Application (Controllers)
  - → State (Zustand)
  - → Services (para compor e injetar)
- **Application/Controller**
  - → Services
  - → Dados/Callbacks recebidos por parâmetro
- **Services**
  - → Abstrações de persistência (Adapters)
- **Infrastructure**
  - → APIs e plataformas concretas

**É PROIBIDO:**
- Service → Zustand
- Service → React (hooks, componentes)
- Service → Router
- Controller → Zustand diretamente
- Controller → Router diretamente
- Repository/Adapter → React
- Component (Dumb) → DatabaseAdapter
- Component (Dumb) → Service diretamente

---

## Princípios de Testabilidade

Para que essa arquitetura se mantenha verificável:
- **Controllers** devem receber suas dependências explicitamente (por argumento).
- **Services** não devem depender de Zustand, React ou APIs de UI.
- O **DatabaseAdapter** deve ser perfeitamente substituível por um fake/mock nos testes.
- A carga completa do banco de dados (resync completo) é permitida na inicialização e em ressincronizações explícitas, mas **não deve ser usada como mecanismo normal de atualização do cache após cada operação**.
- Toda operação de escrita deve atualizar o Store **somente após a confirmação de sucesso** da persistência no banco (Service).

# Design Patterns (Baseline v1)

Este documento detalha os principais Padrões de Projeto (Design Patterns) adotados no `open-task-manager` e como eles resolvem problemas específicos de engenharia de software dentro do contexto do projeto.

## 1. Abstract Factory & Adapter Patterns

A aplicação é projetada para rodar em múltiplos ambientes (Tauri no Desktop, Capacitor no Mobile e Web). Para lidar com a persistência de dados de forma agnóstica em relação ao ambiente, utilizam-se os padrões **Abstract Factory** e **Adapter**.

- **Problema:** Cada plataforma possui sua própria API de banco de dados (SQLite nativo no Android/iOS, SQLite via Rust no Tauri, IndexedDB na Web).
- **Solução (Adapter):** Existe uma interface comum, `DatabaseAdapter`, que define os contratos de banco de dados (ex: `createEntry`, `getNotebooks`). Existem implementações concretas para cada plataforma: `CapacitorAdapter`, `TauriAdapter`, `WebAdapter`.
- **Solução (Abstract Factory):** A interface `PlatformFactory` (com implementações como `CapacitorFactory`, `WebFactory`) é responsável por instanciar as ferramentas corretas para o ambiente atual. 
- **Onde encontrar:** `src/lib/platform/` e `src/lib/db/`.

## 2. Dependency Injection (Injeção de Dependências)

- **Problema:** Componentes e Serviços não devem ser responsáveis por instanciar suas próprias dependências, pois isso gera alto acoplamento e dificulta testes.
- **Solução:** Utiliza-se a Injeção de Dependência através da API de Contextos do React e da Orquestração na Screen. O `DatabaseContext` inicializa o banco de dados via `PlatformFactory` e o disponibiliza para os hooks `useServices()`. As **Screens** (e não os Controllers) chamam `useServices()` e então injetam as dependências extraídas nos Controllers via parâmetros/props.
- **Onde encontrar:** `src/contexts/DatabaseContext.tsx`, `src/hooks/useServices.ts` e nas `src/pages/` (Screens).

## 3. Controller Pattern

- **Problema:** Páginas React (Views) podem rapidamente ficar infladas com lógicas complexas de formatação e decisão de fluxo, ferindo o princípio da Responsabilidade Única (SRP).
- **Solução:** Toda a lógica que atua como "orquestradora" entre os eventos da UI e o Domínio/Estado é extraída para Hooks customizados que atuam como Controladores. No entanto, o Controller não possui dependências diretas (não invoca Zustand ou Contextos). A composição ocorre na Screen:
  ```text
  Screen
   ├── useServices()
   ├── useStore()
   ├── useNavigate()
   └── useController({
         service,
         data,
         callbacks
       })
  ```
- **Onde encontrar:** `src/controllers/`.

## 4. Service Layer Pattern

- **Problema:** A lógica de negócio precisa estar centralizada, testável e independente da interface gráfica e do estado local.
- **Solução:** Classes de serviço (como `EntryService` e `NotebookService`) encapsulam essas operações. Eles recebem a infraestrutura (Adapter) injetada e retornam os resultados operacionais. Não têm nenhuma ciência da existência do React ou do Store (Zustand). 
- **Onde encontrar:** `src/services/`.

## 5. Flux / Global State Management

- **Problema:** Compartilhar estado (como a lista de tarefas) entre páginas distintas usando apenas "prop drilling" é insustentável.
- **Solução:** O estado global da aplicação é gerenciado com **Zustand**. A mutação não é invocada aleatoriamente. O ciclo é:
  `Service executa a regra e retorna o dado -> Controller interpreta -> Screen repassa o Callback -> Callbacks atualizam o Zustand.`
- **Onde encontrar:** `src/store/useStore.ts`.

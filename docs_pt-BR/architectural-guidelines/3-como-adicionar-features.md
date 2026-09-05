# Como Adicionar Novas Features (Baseline v1)

Adicionar uma nova funcionalidade no `open-task-manager` exige disciplina para manter o isolamento arquitetural (Clean Code) e respeitar o fluxo unidirecional de dependências. Este guia dita o fluxo que você deve seguir para implementar uma nova funcionalidade sem quebrar os padrões vigentes.

## Princípio Fundamental: De Dentro para Fora

O desenvolvimento deve ser feito das camadas mais centrais (Domínio) para as mais externas (Interface de Usuário). Nunca comece criando a tela sem antes definir o modelo e o comportamento.

---

## Passo a Passo

### Passo 1: Atualize o Domínio (Tipos)
Defina quais são as novas entidades ou como as entidades existentes serão alteradas.
- **Onde:** `src/types.ts`
- **Ação:** Adicione ou modifique interfaces (ex: adicionar um campo `color` à interface `Notebook`).

### Passo 2: Atualize a Infraestrutura (Banco de Dados)
Se sua feature precisa de persistência, atualize os contratos e as implementações.
- **Onde:** `src/lib/db/`
- **Ação:** 
  1. Adicione a assinatura do novo método na interface `DatabaseAdapter.ts` (ex: `updateNotebookColor(id: string, color: string): Promise<void>`).
  2. Implemente esse método em **todos** os adaptadores concretos (`WebAdapter`, `CapacitorAdapter`, `TauriAdapter`), bem como eventuais migrações ou esquemas de banco de dados nativos (lado Rust ou lado Android se houver lógica nativa de DB).

### Passo 3: Adicione a Lógica de Negócio (Services)
O serviço irá orquestrar a chamada ao banco de dados e aplicar regras específicas.
- **Onde:** `src/services/`
- **Ação:** Adicione o novo método na classe de serviço correspondente (ex: `NotebookService.ts`). Valide entradas, chame a infraestrutura (`this.repository.updateNotebookColor`) e retorne o resultado esperado. **O Service nunca chama, importa ou conhece o Store (Zustand) nem a UI.**

### Passo 4: Atualize o Estado Global (Store)
Se a interface precisar reagir a essa mudança, o Store deve suportá-la.
- **Onde:** `src/store/useStore.ts`
- **Ação:** Adicione ou modifique as funções do Zustand para lidar com o novo fluxo de estado na árvore da aplicação. 

### Passo 5: Crie/Atualize o Controlador (Controller)
O controlador unirá a operação e a tela recebendo tudo via dependência.
- **Onde:** `src/controllers/`
- **Ação:** Crie um novo hook ou modifique um existente. O Controller **NÃO** importa Zustand, Context ou Router. Ele simplesmente expõe funções e recebe as ferramentas por injeção da tela.
```javascript
// Exemplo Conceitual do Controller
export function useEntryController({ entryService, onUpdateEntry, onNavigateBack }) {
  const handleUpdate = async (id, data) => {
    // 1. Chama Service
    const result = await entryService.update(id, data);
    // 2. Reporta Sucesso ao chamador
    onUpdateEntry(result);
    // 3. Callback de navegação
    onNavigateBack();
  }
  return { handleUpdate };
}
```

### Passo 6: Atualize a Interface Gráfica (View/Screen)
Finalmente, modifique a tela para compor as dependências e exibir a nova funcionalidade.
- **Onde:** `src/pages/` (Screens) e `src/components/` (Dumb Components)
- **Ação:** Na Screen, extraia os Services (`useServices()`), extraia o estado e callbacks do Zustand (`useStore()`), extraia rotas (`useNavigate()`) e injete-os no Controlador. Em seguida, repasse as funções limpas retornadas pelo Controlador para os componentes visuais.
```text
Screen
  ├── obtém dados e actions do Zustand
  ├── obtém Router
  ├── obtém Services
  └── injeta dependências no Controller (Passo 5)
```

---

## Checklist de Pull Request / Code Review

Antes de submeter código, garanta que:
- [ ] A regra de negócio está **fora** dos componentes do React (está em um Service)?
- [ ] O componente consome lógicas exclusivamente via um **Controller**?
- [ ] O Controller recebe suas dependências e callbacks via parâmetro (a navegação é fornecida como callback pela Screen, e não importando o Router)?
- [ ] Services **não** conhecem Zustand nem React?
- [ ] Operações de banco de dados respeitam a interface **DatabaseAdapter** e funcionam em Web, Android (Capacitor) e Desktop (Tauri)?
- [ ] Tipagens estão estritas e declaradas em `types.ts`?

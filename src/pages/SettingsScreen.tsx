import { Menu, Settings } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export function SettingsScreen() {
  const { openDrawer } = useOutletContext<{ openDrawer: () => void }>();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors font-sans">
      
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={openDrawer}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            Configurações
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
          <Settings className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Configurações em breve</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            As opções de customização e sincronização estarão disponíveis nesta tela.
          </p>
        </div>
      </main>
    </div>
  );
}

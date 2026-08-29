import { useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useSettingsController } from '../controllers/useSettingsController';

function SettingsSection({ title, description, children, defaultOpen = false }: { title: string, description: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex flex-col pr-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="p-4 md:p-6 pt-0 mt-4 md:mt-2 border-t border-transparent animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function SettingsScreen() {
  const { openDrawer } = useOutletContext<{ openDrawer: () => void }>();
  const { isDarkMode, toggleTheme } = useSettingsController();

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
        <div className="flex flex-col gap-4 max-w-4xl mx-auto p-4 md:p-6 mt-4">
          <SettingsSection 
            title="Aparência" 
            description="Personalize a interface do aplicativo." 
            defaultOpen={true}
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Modo Escuro</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Ativar tema noturno (Dark Mode)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </SettingsSection>
        </div>
      </main>
    </div>
  );
}

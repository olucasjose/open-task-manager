import { Link, useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export function DrawerSystemMenu() {
  const location = useLocation();

  return (
    <div>
      <h3 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
        Sistema
      </h3>
      <div className="space-y-1">
        <Link
          to="/trash"
          draggable={false}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === '/trash' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
        >
          <Trash2 className="w-5 h-5" />
          Lixeira
        </Link>
      </div>
    </div>
  );
}

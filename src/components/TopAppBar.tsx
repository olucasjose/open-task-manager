import { ChevronLeft } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightElement?: React.ReactNode;
}

export function TopAppBar({ title, showBackButton, onBackClick, rightElement }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-2 overflow-hidden">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
      </div>
      
      {rightElement && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightElement}
        </div>
      )}
    </header>
  );
}

import { useTheme } from '../../context/ThemeContext';
import { Button } from './button';
import { Sun, Moon, Palette, Check, Circle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light' as const, name: 'Light', icon: <Sun className="h-4 w-4" />, color: '#ffffff' },
    { id: 'dark' as const, name: 'Dark', icon: <Moon className="h-4 w-4" />, color: '#0f172a' },
    { id: 'blue' as const, name: 'Blue', icon: <Circle className="h-4 w-4 fill-[#6366f1] text-[#6366f1]" />, color: '#0b1121' },
    { id: 'green' as const, name: 'Green', icon: <Circle className="h-4 w-4 fill-[#10b981] text-[#10b981]" />, color: '#061f18' },
    { id: 'purple' as const, name: 'Purple', icon: <Circle className="h-4 w-4 fill-[#8b5cf6] text-[#8b5cf6]" />, color: '#1c1524' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-accent border border-border">
          <Palette className="h-[1.2rem] w-[1.2rem] text-primary" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-2 min-w-[12rem] bg-popover text-popover-foreground border border-border shadow-2xl rounded-xl">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">Select Theme</DropdownMenuLabel>
        
        {themes.map((t) => (
          <DropdownMenuItem 
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer mt-1 rounded-lg transition-colors ${theme === t.id ? 'bg-primary/20 text-primary' : 'hover:bg-accent focus:bg-accent'}`}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center h-5 w-5 rounded-full border border-border shadow-sm overflow-hidden" 
                style={{ backgroundColor: t.color }}
              >
                {t.icon}
              </div>
              <span className="text-sm font-medium">{t.name}</span>
            </div>
            {theme === t.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Languages, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-10 rounded-xl hover:bg-primary/10 transition-colors">
          <Languages className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border shadow-premium">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
              i18n.language === lang.code ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-secondary'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-heading">{lang.name}</span>
            </div>
            {i18n.language === lang.code && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

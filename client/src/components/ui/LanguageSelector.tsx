import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  // Ensure hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Change language handler
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    
    // For RTL support (Arabic)
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lng;
      document.body.classList.remove('rtl');
    }
  };

  // Don't render on server
  if (!mounted) return null;

  // All languages
  const allLanguages = [
    { code: 'en', name: t('language.en') },
    { code: 'ar', name: t('language.ar') },
    { code: 'fr', name: t('language.fr') },
    { code: 'ru', name: t('language.ru') }
  ];

  // We always show all languages, just making the button more compact
  const languagesToDisplay = allLanguages;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center ${compact ? 'p-1' : 'gap-2'}`}
        >
          <Globe className="h-4 w-4" />
          {!compact && <span className="hidden md:inline-block">{t('language.select')}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languagesToDisplay.map(language => (
          <DropdownMenuItem 
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'bg-primary/10' : ''}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
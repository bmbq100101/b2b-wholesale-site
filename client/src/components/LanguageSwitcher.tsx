import { useEffect, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LanguageCode = "en" | "es" | "ru" | "zh" | "ar" | "pt";

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

const LANGUAGES: Record<LanguageCode, Language> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    direction: "ltr",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    direction: "ltr",
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    direction: "ltr",
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    direction: "ltr",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹",
    direction: "ltr",
  },
};

// IP-based language detection mapping
const COUNTRY_TO_LANGUAGE: Record<string, LanguageCode> = {
  // Spanish-speaking countries
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  PE: "es",
  VE: "es",
  CL: "es",
  EC: "es",
  BO: "es",
  PY: "es",
  UY: "es",
  GT: "es",
  HN: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  CU: "es",
  DO: "es",

  // Russian-speaking countries
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  UA: "ru",

  // Arabic-speaking countries
  SA: "ar",
  AE: "ar",
  EG: "ar",
  JO: "ar",
  LB: "ar",
  SY: "ar",
  IQ: "ar",
  KW: "ar",
  QA: "ar",
  BH: "ar",
  OM: "ar",
  YE: "ar",
  PS: "ar",
  TN: "ar",
  DZ: "ar",
  MA: "ar",
  LY: "ar",
  SD: "ar",

  // Portuguese-speaking countries
  PT: "pt",
  BR: "pt",
  AO: "pt",
  MZ: "pt",
  CV: "pt",
  ST: "pt",
  GW: "pt",
  TL: "pt",

  // Chinese-speaking countries
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  SG: "zh",

  // English-speaking countries (default)
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
};

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Detect language on mount
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        // Try to get saved language preference
        const saved = localStorage.getItem("preferred-language") as LanguageCode | null;
        if (saved && LANGUAGES[saved]) {
          setCurrentLanguage(saved);
          applyLanguage(saved);
          setIsLoading(false);
          return;
        }

        // Try to detect from browser language
        const browserLang = navigator.language.split("-")[0].toUpperCase();
        if (browserLang === "ZH") {
          setCurrentLanguage("zh");
          applyLanguage("zh");
          setIsLoading(false);
          return;
        }

        // Try IP-based detection
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryCode = data.country_code as string;
        const detectedLang = COUNTRY_TO_LANGUAGE[countryCode] || "en";

        setCurrentLanguage(detectedLang);
        applyLanguage(detectedLang);
      } catch (error) {
        console.error("Language detection failed:", error);
        setCurrentLanguage("en");
        applyLanguage("en");
      } finally {
        setIsLoading(false);
      }
    };

    detectLanguage();
  }, []);

  const applyLanguage = (lang: LanguageCode) => {
    const language = LANGUAGES[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = language.direction;
    localStorage.setItem("preferred-language", lang);

    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: lang } })
    );
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    applyLanguage(lang);
    setIsOpen(false);
  };

  const current = LANGUAGES[currentLanguage];

  if (isLoading) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          title="Change language"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">
              {current.flag} {current.nativeName}
            </span>
            <span className="text-sm font-medium sm:hidden">{current.flag}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56"
        style={{
          direction: document.documentElement.dir === "rtl" ? "rtl" : "ltr",
        }}
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
          Select Language
        </div>

        {Object.values(LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer flex items-center gap-3"
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex-1">
              <div className="font-medium">{lang.nativeName}</div>
              <div className="text-xs text-slate-500">{lang.name}</div>
            </div>
            {currentLanguage === lang.code && (
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </DropdownMenuItem>
        ))}

        <div className="px-2 py-1.5 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-2">
          Auto-detected from your location
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to use current language in components
export function useLanguage() {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferred-language") as LanguageCode | null;
    if (saved && LANGUAGES[saved]) {
      setLanguage(saved);
    }

    const handleLanguageChange = (event: CustomEvent<{ language: LanguageCode }>) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener(
      "languageChanged",
      handleLanguageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "languageChanged",
        handleLanguageChange as EventListener
      );
    };
  }, []);

  return language;
}

// Translation helper
export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    "nav.products": "Products",
    "nav.about": "About Us",
    "nav.certifications": "Certifications",
    "nav.contact": "Contact",
    "nav.dashboard": "Dashboard",
    "hero.title": "Premium Surplus Goods from Dongguan",
    "hero.subtitle":
      "Direct wholesale supplier of stock digital products, brand small appliances, home kitchen supplies, and cleaning products. Trusted by international distributors and retailers.",
    "hero.browse": "Browse Products",
    "hero.quote": "Request Quote",
  },
  es: {
    "nav.products": "Productos",
    "nav.about": "Sobre Nosotros",
    "nav.certifications": "Certificaciones",
    "nav.contact": "Contacto",
    "nav.dashboard": "Panel de Control",
    "hero.title": "Bienes Excedentes Premium de Dongguan",
    "hero.subtitle":
      "Proveedor mayorista directo de productos digitales en stock, pequeños electrodomésticos de marca, suministros para el hogar y productos de limpieza. Confiado por distribuidores y minoristas internacionales.",
    "hero.browse": "Explorar Productos",
    "hero.quote": "Solicitar Cotización",
  },
  ru: {
    "nav.products": "Товары",
    "nav.about": "О нас",
    "nav.certifications": "Сертификаты",
    "nav.contact": "Контакты",
    "nav.dashboard": "Панель управления",
    "hero.title": "Премиум излишки товаров из Донггуаня",
    "hero.subtitle":
      "Прямой оптовый поставщик цифровых товаров в наличии, брендовых малых приборов, кухонных принадлежностей и чистящих средств. Доверие международных дистрибьюторов и розничных торговцев.",
    "hero.browse": "Просмотреть товары",
    "hero.quote": "Запросить предложение",
  },
  zh: {
    "nav.products": "产品",
    "nav.about": "关于我们",
    "nav.certifications": "认证",
    "nav.contact": "联系我们",
    "nav.dashboard": "仪表板",
    "hero.title": "来自东莞的优质剩余商品",
    "hero.subtitle":
      "库存数码产品、品牌小家电、家居厨房用品和清洁产品的直接批发供应商。受到国际经销商和零售商的信赖。",
    "hero.browse": "浏览产品",
    "hero.quote": "申请报价",
  },
  ar: {
    "nav.products": "المنتجات",
    "nav.about": "من نحن",
    "nav.certifications": "الشهادات",
    "nav.contact": "اتصل بنا",
    "nav.dashboard": "لوحة التحكم",
    "hero.title": "السلع الفائضة الممتازة من دونغقوان",
    "hero.subtitle":
      "موفر جملة مباشر للمنتجات الرقمية المخزنة والأجهزة المنزلية الصغيرة والإمدادات المطبخية ومنتجات التنظيف. موثوق به من قبل الموزعين والتجار بالتجزئة الدوليين.",
    "hero.browse": "استعرض المنتجات",
    "hero.quote": "طلب عرض أسعار",
  },
  pt: {
    "nav.products": "Produtos",
    "nav.about": "Sobre Nós",
    "nav.certifications": "Certificações",
    "nav.contact": "Contato",
    "nav.dashboard": "Painel de Controle",
    "hero.title": "Produtos Excedentes Premium de Dongguan",
    "hero.subtitle":
      "Fornecedor varejista direto de produtos digitais em estoque, pequenos eletrodomésticos de marca, suprimentos de cozinha e produtos de limpeza. Confiado por distribuidores e varejistas internacionais.",
    "hero.browse": "Procurar Produtos",
    "hero.quote": "Solicitar Cotação",
  },
};

// Translation helper function
export function t(key: string, language: LanguageCode): string {
  return translations[language]?.[key] || translations.en[key] || key;
}

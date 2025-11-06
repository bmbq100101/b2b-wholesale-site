import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage, t } from "@/components/LanguageSwitcher";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Persistent navigation header component used across all pages
 * Provides consistent branding, navigation links, and user controls
 */
export default function NavigationHeader() {
  const language = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: t("nav.products", language) },
    { href: "/about", label: t("nav.about", language) },
    { href: "/certifications", label: t("nav.certifications", language) },
    { href: "/contact", label: t("nav.contact", language) },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-10 w-10" />}
          <h1 className="text-xl font-bold text-slate-900 hidden sm:block">{APP_TITLE}</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section - Auth and Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 hidden sm:inline">{user?.name || "User"}</span>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t("nav.dashboard", language)}
                </Button>
              </Link>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm">Sign In</Button>
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 hover:text-slate-900 font-medium py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

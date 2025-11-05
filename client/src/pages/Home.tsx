import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle, Globe, Shield, Zap, Users, Package, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { HeroCarousel } from "@/components/HeroCarousel";
import { useLanguage, t } from "@/components/LanguageSwitcher";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const language = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { data: featuredProducts = [] } = trpc.products.featured.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const heroSlides = [
    {
      id: "slide-1",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop",
      title: "Premium Surplus Goods from Dongguan",
      subtitle: "Direct wholesale supplier of stock digital products, brand small appliances, home kitchen supplies, and cleaning products",
      cta: {
        text: "Browse Products",
        href: "/products",
      },
    },
    {
      id: "slide-2",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1920&h=1080&fit=crop",
      title: "Competitive Wholesale Pricing",
      subtitle: "Best rates for bulk orders with flexible MOQ options",
      cta: {
        text: "Request Quote",
        href: "/bulk-quote-request",
      },
    },
    {
      id: "slide-3",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop",
      title: "Global Shipping & Logistics",
      subtitle: "Fast and reliable delivery to 50+ countries worldwide",
      cta: {
        text: "Learn More",
        href: "/about",
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-10 w-10" />}
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-slate-600 hover:text-slate-900 font-medium">
              {t("nav.products", language)}
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium">
              {t("nav.about", language)}
            </Link>
            <Link href="/certifications" className="text-slate-600 hover:text-slate-900 font-medium">
              {t("nav.certifications", language)}
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-slate-900 font-medium">
              {t("nav.contact", language)}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{user?.name || "User"}</span>
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
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} autoPlay={true} autoPlayInterval={5000} />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-blue-400 text-blue-900">B2B Wholesale Platform</Badge>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            {t("hero.title", language)}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle", language)}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="gap-2">
                {t("hero.browse", language)} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href={isAuthenticated ? undefined : getLoginUrl()}>
              <Button size="lg" variant="outline" className="gap-2 bg-white text-blue-600 border-white hover:bg-blue-50">
                {t("hero.quote", language)} <Zap className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Why Choose Us</h3>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Supplier",
                description: "Certified and verified B2B supplier with 10+ years of experience in wholesale trade"
              },
              {
                icon: Package,
                title: "Quality Assured",
                description: "Strict quality control process. All products inspected before shipment"
              },
              {
                icon: Globe,
                title: "Global Shipping",
                description: "Reliable logistics partners for fast and secure international delivery"
              },
              {
                icon: Users,
                title: "Expert Support",
                description: "Dedicated account managers for bulk orders and custom requirements"
              }
            ].map((item, idx) => (
              <Card key={idx} className="border-slate-200 hover:shadow-lg transition">
                <CardHeader className="text-center">
                  <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 text-center">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-bold text-slate-900">Featured Products</h3>
              <p className="text-slate-600 mt-2">Popular items from our current inventory</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="h-full hover:shadow-lg transition cursor-pointer overflow-hidden">
                    {product.images && (
                      <div className="w-full h-48 bg-slate-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={JSON.parse(product.images)[0] || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x200?text=Product";
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            Grade {product.conditionGrade}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-slate-500">MOQ: {product.moq} units</span>
                          <span className="text-sm font-semibold text-blue-600">
                            ${(product.basePrice / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading featured products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Product Categories</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.length > 0 ? (
              categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <Card className="h-full hover:shadow-lg transition cursor-pointer">
                    {category.image && (
                      <div className="w-full h-32 bg-slate-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x150?text=" + category.name;
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">Loading categories...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RFQ CTA Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 text-slate-900">Need Custom Pricing?</h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Submit a Request for Quote (RFQ) for bulk orders. Our team will provide competitive pricing and terms tailored to your business needs.
          </p>
          {isAuthenticated ? (
            <Link href="/rfq">
              <Button size="lg" className="gap-2">
                Submit RFQ <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Sign In to Submit RFQ <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Certifications & Compliance</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { name: "CE Certified", desc: "European Conformity" },
              { name: "FCC Approved", desc: "US Federal Communications" },
              { name: "RoHS Compliant", desc: "Hazardous Substance Restriction" },
              { name: "ISO 9001:2015", desc: "Quality Management System" }
            ].map((cert, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-900 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Active Products" },
              { number: "50+", label: "Countries Served" },
              { number: "10K+", label: "Happy Customers" },
              { number: "99.2%", label: "On-Time Delivery" }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                <p className="text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">About Us</h4>
              <p className="text-sm">Leading B2B wholesale supplier of surplus goods from Dongguan, China.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm">Email: info@b2bwholesale.com</p>
              <p className="text-sm">Phone: +86 769 1234 5678</p>
              <p className="text-sm">Location: Dongguan, China</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2024 B2B Wholesale Surplus Goods. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

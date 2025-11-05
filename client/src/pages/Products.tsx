import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, Filter, Grid3x3, List, ChevronDown } from "lucide-react";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "newest">("newest");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
      const matchesPrice = product.basePrice / 100 >= priceRange.min && product.basePrice / 100 <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "price":
        return filtered.sort((a, b) => a.basePrice - b.basePrice);
      case "newest":
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Product Catalog</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === null
                        ? "bg-blue-100 text-blue-900 font-semibold"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-900 font-semibold"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600">Min: ${priceRange.min}</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Max: ${priceRange.max}</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Sort By</h4>
                <div className="space-y-2">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "name", label: "Name (A-Z)" },
                    { value: "price", label: "Price (Low-High)" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        sortBy === option.value
                          ? "bg-blue-100 text-blue-900 font-semibold"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <Card className={`hover:shadow-lg transition cursor-pointer overflow-hidden ${
                      viewMode === "list" ? "flex" : ""
                    }`}>
                      {product.images && (
                        <div className={`bg-slate-200 flex items-center justify-center overflow-hidden ${
                          viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "w-full h-48"
                        }`}>
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
                      <div className={viewMode === "list" ? "flex-1" : ""}>
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
                          <div className="space-y-3">
                            <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                            
                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-slate-500">SKU:</span>
                                <p className="font-mono text-xs text-slate-700">{product.sku}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Stock:</span>
                                <p className="font-semibold text-slate-900">{product.stock} units</p>
                              </div>
                            </div>

                            {/* Pricing & MOQ */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <div>
                                <p className="text-xs text-slate-500">MOQ</p>
                                <p className="font-semibold text-slate-900">{product.moq} units</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Base Price</p>
                                <p className="text-lg font-bold text-blue-600">
                                  ${(product.basePrice / 100).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <Button className="w-full mt-4">View Details</Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                    setPriceRange({ min: 0, max: 10000 });
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

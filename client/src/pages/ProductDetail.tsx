import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ArrowLeft, ShoppingCart, FileText, Truck, Shield } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showRFQForm, setShowRFQForm] = useState(false);

  const slug = params?.slug as string;
  const { data: product, isLoading } = trpc.products.bySlug.useQuery(slug, {
    enabled: !!slug,
  });
  const { data: pricingTiers = [] } = trpc.pricing.tiers.useQuery(product?.id || 0, {
    enabled: !!product?.id,
  });

  const submitRFQ = trpc.rfq.submit.useMutation({
    onSuccess: () => {
      alert("RFQ submitted successfully! Our team will contact you soon.");
      setShowRFQForm(false);
      setQuantity(1);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-600 text-lg mb-4">Product not found</p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const specs = product.specifications ? JSON.parse(product.specifications) : {};
  
  // Calculate price based on quantity
  const getPrice = () => {
    if (pricingTiers.length > 0) {
      const tier = pricingTiers.find(t => 
        quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
      );
      return tier ? tier.price : product.basePrice;
    }
    return product.basePrice;
  };

  const unitPrice = getPrice() / 100;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/products">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden sticky top-20">
              {images.length > 0 ? (
                <div className="aspect-square bg-slate-200 flex items-center justify-center">
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x400?text=Product";
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-slate-200 flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square bg-slate-200 rounded overflow-hidden">
                      <img
                        src={img}
                        alt={`View ${idx + 2}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/100x100?text=View";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="secondary">Grade {product.conditionGrade}</Badge>
                    <span className="text-sm text-slate-600">SKU: {product.sku}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 text-lg mb-4">{product.description}</p>
              
              {/* Origin & Stock */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Origin</p>
                  <p className="font-semibold text-slate-900">{product.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Stock Available</p>
                  <p className="font-semibold text-slate-900">{product.stock} units</p>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Pricing & Order</h3>
              
              {/* Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Order Quantity (Minimum: {product.moq} units)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={product.moq}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || 1))}
                    className="w-32"
                  />
                  <span className="text-sm text-slate-600">units</span>
                </div>
              </div>

              {/* Pricing Tiers */}
              {pricingTiers.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Volume Pricing</p>
                  <div className="space-y-2">
                    {pricingTiers.map((tier, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-blue-800">
                          {tier.minQuantity} - {tier.maxQuantity || "∞"} units
                        </span>
                        <span className="font-semibold text-blue-900">
                          ${(tier.price / 100).toFixed(2)}/unit
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Unit Price:</span>
                  <span className="text-lg font-semibold text-slate-900">${unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="text-lg font-semibold text-slate-900">{quantity}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total Price:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <Button className="w-full gap-2 h-12" onClick={() => setShowRFQForm(!showRFQForm)}>
                      <FileText className="w-5 h-5" />
                      Request Quote (RFQ)
                    </Button>
                    <Button variant="outline" className="w-full gap-2 h-12">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Inquiry List
                    </Button>
                  </>
                ) : (
                  <a href={getLoginUrl()} className="block">
                    <Button className="w-full gap-2 h-12">
                      <FileText className="w-5 h-5" />
                      Sign In to Request Quote
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* RFQ Form */}
            {showRFQForm && isAuthenticated && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Request for Quote</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitRFQ.mutate({
                      productId: product.id,
                      quantity,
                      message: (e.currentTarget.elements.namedItem("message") as HTMLTextAreaElement)?.value,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="message"
                      placeholder="Any special requirements or questions?"
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitRFQ.isPending}>
                      {submitRFQ.isPending ? "Submitting..." : "Submit RFQ"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRFQForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="pb-3 border-b border-slate-200">
                      <p className="text-sm text-slate-500 capitalize">{key}</p>
                      <p className="font-semibold text-slate-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Truck, title: "Fast Shipping", desc: "Global delivery in 7-14 days" },
                { icon: Shield, title: "Quality Guarantee", desc: "100% inspection before shipment" },
                { icon: FileText, title: "Documentation", desc: "Complete compliance certificates" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

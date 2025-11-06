import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import NavigationHeader from "@/components/NavigationHeader";

export default function RFQ() {
  const { isAuthenticated, user } = useAuth();
  const [showNewRFQ, setShowNewRFQ] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: myInquiries = [], refetch: refetchInquiries } = trpc.rfq.myInquiries.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: products = [] } = trpc.products.list.useQuery();

  const submitRFQ = trpc.rfq.submit.useMutation({
    onSuccess: () => {
      alert("RFQ submitted successfully!");
      setShowNewRFQ(false);
      setSelectedProduct(null);
      setQuantity(1);
      refetchInquiries();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-4">Please sign in to manage your RFQs</p>
            <a href={getLoginUrl()}>
              <Button>Sign In</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "quoted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "quoted":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Request for Quote (RFQ)</h1>
              <p className="text-slate-600 mt-2">Manage your bulk order inquiries and quotations</p>
            </div>
            <Button onClick={() => setShowNewRFQ(!showNewRFQ)} className="gap-2">
              <Plus className="w-5 h-5" />
              New RFQ
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* New RFQ Form */}
        {showNewRFQ && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Create New RFQ</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedProduct) {
                    alert("Please select a product");
                    return;
                  }
                  submitRFQ.mutate({
                    productId: selectedProduct,
                    quantity,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Select Product
                  </label>
                  <select
                    value={selectedProduct || ""}
                    onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-3"
                  >
                    <option value="">-- Choose a product --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (SKU: {product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitRFQ.isPending}>
                    {submitRFQ.isPending ? "Submitting..." : "Submit RFQ"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewRFQ(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* RFQ List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your RFQs</h2>
          
          {myInquiries.length > 0 ? (
            <div className="space-y-4">
              {myInquiries.map(inquiry => (
                <Card key={inquiry.id} className="hover:shadow-lg transition">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Product Info */}
                      <div>
                        <p className="text-sm text-slate-500">Product</p>
                        <p className="font-semibold text-slate-900 line-clamp-2">
                          {products.find(p => p.id === inquiry.productId)?.name || "Product #" + inquiry.productId}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div>
                        <p className="text-sm text-slate-500">Quantity</p>
                        <p className="font-semibold text-slate-900">{inquiry.quantity} units</p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-sm text-slate-500">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(inquiry.status)}
                          <Badge className={getStatusColor(inquiry.status || "pending")}>
                            {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : "Pending"}
                          </Badge>
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-sm text-slate-500">Quoted Price</p>
                        {inquiry.quotedPrice ? (
                          <p className="font-semibold text-blue-600">
                            ${(inquiry.quotedPrice / 100).toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-slate-500">Pending</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Submitted:</span>
                        <p className="text-slate-900">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {inquiry.quotedAt && (
                        <div>
                          <span className="text-slate-500">Quoted:</span>
                          <p className="text-slate-900">
                            {new Date(inquiry.quotedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {inquiry.message && (
                        <div className="md:col-span-3">
                          <span className="text-slate-500">Your Notes:</span>
                          <p className="text-slate-900 line-clamp-2">{inquiry.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      {inquiry.status === "quoted" && (
                        <>
                          <Button size="sm" variant="default">
                            Accept Quote
                          </Button>
                          <Button size="sm" variant="outline">
                            Request Revision
                          </Button>
                        </>
                      )}
                      {inquiry.status === "pending" && (
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No RFQs yet. Create one to get started!</p>
                <Button onClick={() => setShowNewRFQ(true)}>Create First RFQ</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How RFQ Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>1. Select a product and specify your desired quantity</p>
            <p>2. Submit the RFQ form with any special requirements</p>
            <p>3. Our team will review and send you a customized quote</p>
            <p>4. Review the quote and accept or request revisions</p>
            <p>5. Once accepted, proceed with payment and shipping</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

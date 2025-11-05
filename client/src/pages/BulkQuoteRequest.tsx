import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface QuoteItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  notes: string;
}

export default function BulkQuoteRequest() {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<QuoteItem[]>([
    { productId: 0, quantity: 100, unitPrice: 10, discount: 0, notes: "" }
  ]);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: products = [] } = trpc.products.list.useQuery();
  const createQuoteMutation = trpc.quotes.createQuote.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setItems([{ productId: 0, quantity: 100, unitPrice: 10, discount: 0, notes: "" }]);
        setNotes("");
        setTerms("");
      }, 3000);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg mb-4">Please sign in to request a bulk quote</p>
          <a href={getLoginUrl()}>
            <Button>Sign In</Button>
          </a>
        </div>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => {
    const discountedPrice = item.unitPrice * (1 - item.discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, quantity: 100, unitPrice: 10, discount: 0, notes: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (items.length === 0 || items.some(item => item.productId === 0)) {
      alert("Please select products for all items");
      return;
    }

    // For now, we'll create a mock quote since we don't have an RFQ ID
    // In a real scenario, this would be linked to an RFQ inquiry
    createQuoteMutation.mutate({
      rfqInquiryId: 1, // Mock RFQ ID
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        notes: item.notes,
      })),
      validDays,
      notes,
      terms,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Request a Bulk Quote</h1>
          <p className="text-slate-600 mt-2">Get custom pricing for your wholesale orders</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Quote Request Submitted!</p>
              <p className="text-sm text-green-800">Our team will review your request and send you a detailed quote within 24 hours.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Items */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quote Items</CardTitle>
                  <Button onClick={handleAddItem} size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">Item {idx + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          onClick={() => handleRemoveItem(idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-1">
                          Product
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, "productId", parseInt(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        >
                          <option value={0}>-- Select Product --</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-1">
                          Quantity
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-1">
                          Unit Price ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-1">
                          Discount (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => handleItemChange(idx, "discount", parseInt(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                        placeholder="Special requirements or notes"
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm text-slate-600">Item Total:</span>
                      <span className="font-semibold text-slate-900">
                        ${(item.unitPrice * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Quote Validity (Days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value) || 30)}
                  />
                  <p className="text-xs text-slate-500 mt-1">How long this quote will remain valid</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or notes for our team..."
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Payment & Delivery Terms
                  </label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Specify your preferred payment terms, delivery timeline, etc..."
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Items</span>
                    <span className="font-semibold text-slate-900">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Quantity</span>
                    <span className="font-semibold text-slate-900">
                      {items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-900">Estimated Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> This is an estimate based on the prices you provided. Our team will send you a detailed quote with final pricing.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createQuoteMutation.isPending || items.length === 0}
                  className="w-full h-12 gap-2"
                >
                  {createQuoteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quote Request"
                  )}
                </Button>

                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-900 text-sm">Why Request a Quote?</h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>✓ Get bulk discounts</li>
                    <li>✓ Custom pricing for large orders</li>
                    <li>✓ Flexible payment terms</li>
                    <li>✓ Priority support</li>
                    <li>✓ Dedicated account manager</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import NavigationHeader from "@/components/NavigationHeader";

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [, params] = useRoute("/checkout");
  const status = (params as any)?.status as string | undefined;
  
  const [items, setItems] = useState<Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>>([]);
  
  const [shippingInfo, setShippingInfo] = useState({
    country: "",
    city: "",
    postalCode: "",
  });

  const createCheckoutSession = trpc.payments.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.open(data.sessionUrl, "_blank");
      }
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-4">Please sign in to proceed with checkout</p>
            <a href={getLoginUrl()}>
              <Button>Sign In</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Please add items to your cart");
      return;
    }

    if (!shippingInfo.country) {
      alert("Please enter your country");
      return;
    }

    createCheckoutSession.mutate({
      items,
      shippingAddress: shippingInfo,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <Link href="/products">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {status === "cancelled" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Payment Cancelled</p>
              <p className="text-sm text-yellow-800">Your payment was cancelled. Please try again.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <div>
                          <p className="font-semibold text-slate-900">Product #{item.productId}</p>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          ${(item.unitPrice * item.quantity / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No items in your order</p>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Country *
                  </label>
                  <Input
                    type="text"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    placeholder="Enter your country"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Postal Code
                    </label>
                    <Input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Total & Checkout */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ${(totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold text-slate-900">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${(totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={createCheckoutSession.isPending || items.length === 0}
                  className="w-full h-12 gap-2"
                >
                  {createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  You will be redirected to Stripe to complete your payment securely.
                </p>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-3">We accept:</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Visa</Badge>
                    <Badge variant="outline">Mastercard</Badge>
                    <Badge variant="outline">American Express</Badge>
                  </div>
                </div>

                {/* Test Card Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Test Mode</p>
                  <p className="text-xs text-blue-800">
                    Use card <code className="bg-white px-1 rounded">4242 4242 4242 4242</code> to test
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

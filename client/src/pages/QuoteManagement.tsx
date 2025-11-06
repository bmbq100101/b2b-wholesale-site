import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { FileText, Download, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import NavigationHeader from "@/components/NavigationHeader";

export default function QuoteManagement() {
  const { isAuthenticated } = useAuth();
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

  const { data: myInquiries = [] } = trpc.rfq.myInquiries.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: quoteDetail } = trpc.quotes.getQuote.useQuery(selectedQuoteId || 0, {
    enabled: isAuthenticated && selectedQuoteId !== null,
  });

  const updateStatusMutation = trpc.quotes.updateQuoteStatus.useMutation({
    onSuccess: () => {
      alert("Quote status updated successfully");
    },
  });

  const convertToOrderMutation = trpc.quotes.convertQuoteToOrder.useMutation({
    onSuccess: (data) => {
      alert(`Order created successfully! Order ID: ${data.orderNumber}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-4">Please sign in to manage your quotes</p>
            <a href={getLoginUrl()}>
              <Button>Sign In</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "sent":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "expired":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Show quote detail if selected
  if (selectedQuoteId && quoteDetail) {
    const { quote, items, history } = quoteDetail;

    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedQuoteId(null)}
              className="mb-4"
            >
              ← Back to Quotes
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Quote {quote.quoteNumber}</h1>
                <p className="text-slate-600 mt-1">
                  Created on {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  {getStatusIcon(quote.status)}
                  <Badge className={getStatusColor(quote.status)}>
                    {(quote.status || "draft").charAt(0).toUpperCase() + (quote.status || "draft").slice(1)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ${(quote.totalAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quote Items */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quote Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-4 border-b border-slate-200 last:border-0">
                        <div>
                          <p className="font-semibold text-slate-900">Product #{item.productId}</p>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                          {(item.discount || 0) > 0 && (
                            <p className="text-sm text-green-600">Discount: {item.discount}%</p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-slate-600 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            ${(item.unitPrice / 100).toFixed(2)} each
                          </p>
                          <p className="font-semibold text-slate-900">
                            ${(item.totalPrice / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quote Details */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quote Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Valid Until</p>
                    <p className="font-semibold text-slate-900">
                      {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  {quote.terms && (
                    <div>
                      <p className="text-sm text-slate-600">Payment & Delivery Terms</p>
                      <p className="text-slate-900 whitespace-pre-wrap">{quote.terms}</p>
                    </div>
                  )}
                  {quote.notes && (
                    <div>
                      <p className="text-sm text-slate-600">Notes</p>
                      <p className="text-slate-900 whitespace-pre-wrap">{quote.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quote History */}
              {history && history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quote History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {history.map((entry, idx) => (
                        <div key={idx} className="flex gap-3 pb-3 border-b border-slate-200 last:border-0">
                          <div className="text-sm">
                            <p className="font-semibold text-slate-900 capitalize">{entry.action}</p>
                            <p className="text-slate-600">{new Date(entry.createdAt).toLocaleString()}</p>
                            {entry.notes && <p className="text-slate-700 mt-1">{entry.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary & Actions */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        ${(quote.totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${(quote.totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    {quote.status === "sent" && (
                      <>
                        <Button
                          onClick={() => updateStatusMutation.mutate({
                            quoteId: quote.id,
                            status: "accepted",
                            notes: "Quote accepted by customer",
                          })}
                          disabled={updateStatusMutation.isPending}
                          className="w-full"
                        >
                          Accept Quote
                        </Button>
                        <Button
                          onClick={() => updateStatusMutation.mutate({
                            quoteId: quote.id,
                            status: "rejected",
                            notes: "Quote rejected by customer",
                          })}
                          disabled={updateStatusMutation.isPending}
                          variant="outline"
                          className="w-full"
                        >
                          Reject Quote
                        </Button>
                      </>
                    )}

                    {quote.status === "accepted" && (
                      <Button
                        onClick={() => convertToOrderMutation.mutate(quote.id)}
                        disabled={convertToOrderMutation.isPending}
                        className="w-full"
                      >
                        Convert to Order
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>

                  {/* Status Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Status</p>
                    <p className="text-xs text-blue-800">
                      {quote.status === "sent" && "Waiting for your response"}
                      {quote.status === "accepted" && "Ready to convert to order"}
                      {quote.status === "rejected" && "You rejected this quote"}
                      {quote.status === "expired" && "This quote has expired"}
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

  // Show quotes list
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">My Quotes</h1>
          <p className="text-slate-600 mt-2">View and manage your bulk order quotes</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {myInquiries.length > 0 ? (
          <div className="space-y-4">
            {myInquiries.map(inquiry => (
              <Card key={inquiry.id} className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">RFQ ID</p>
                      <p className="font-semibold text-slate-900">#{inquiry.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Product</p>
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        Product #{inquiry.productId}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Quantity</p>
                      <p className="font-semibold text-slate-900">{inquiry.quantity} units</p>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => setSelectedQuoteId(inquiry.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View Quotes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No quotes yet</p>
              <Link href="/bulk-quote-request">
                <Button>Request a Quote</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

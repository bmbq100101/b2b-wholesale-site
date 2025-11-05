import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Package, ArrowLeft, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { Link } from "wouter";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/orders/:orderId");
  const orderId = params?.orderId ? parseInt(params.orderId) : null;

  const { data: orders = [], isLoading: ordersLoading } = trpc.payments.getUserOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: orderDetail, isLoading: detailLoading } = trpc.payments.getOrderDetails.useQuery(orderId || 0, {
    enabled: isAuthenticated && orderId !== null,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg mb-4">Please sign in to view your orders</p>
          <a href={getLoginUrl()}>
            <Button>Sign In</Button>
          </a>
        </div>
      </div>
    );
  }

  // Show order detail if viewing a specific order
  if (orderId && orderDetail) {
    const { order, items } = orderDetail;
    const orderItems = items as any[] || [];

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <Link href="/orders">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Order #{order.id}</h1>
                <p className="text-slate-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  {getStatusIcon(order.status || "pending")}
                  <Badge className={getStatusColor(order.status || "pending")}>
                    {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ${(order.totalAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length > 0 ? (
                    <div className="space-y-4">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-4 border-b border-slate-200 last:border-0">
                          <div>
                            <p className="font-semibold text-slate-900">Product #{item.productId}</p>
                            <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
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
                  ) : (
                    <p className="text-slate-600 text-center py-8">No items in this order</p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold text-slate-900">Included</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping & Contact Info */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.shippingAddress ? (
                    <div className="text-sm text-slate-700 space-y-1">
                      {(() => {
                        try {
                          const addr = JSON.parse(order.shippingAddress);
                          return (
                            <>
                              <p>{addr.country}</p>
                              {addr.city && <p>{addr.city}</p>}
                              {addr.postalCode && <p>{addr.postalCode}</p>}
                            </>
                          );
                        } catch {
                          return <p>{order.shippingAddress}</p>;
                        }
                      })()}
                    </div>
                  ) : (
                    <p className="text-slate-600">No shipping address provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>
                    <p className="text-slate-600">Name</p>
                    <p className="font-semibold text-slate-900">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email</p>
                    <p className="font-semibold text-slate-900">{order.customerEmail}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <Button className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                {order.status === "completed" && (
                  <Button className="w-full gap-2" variant="outline">
                    Track Shipment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show orders list
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-600 mt-2">View and manage your purchase history</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {ordersLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Order ID */}
                      <div>
                        <p className="text-sm text-slate-500">Order ID</p>
                        <p className="font-semibold text-slate-900">#{order.id}</p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-sm text-slate-500">Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-sm text-slate-500">Amount</p>
                        <p className="font-semibold text-blue-600">
                          ${(order.totalAmount / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-sm text-slate-500">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(order.status || "pending")}
                          <Badge className={getStatusColor(order.status || "pending")}>
                            {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-end">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No orders yet</p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getStatusIcon(status: string | null) {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-600" />;
    case "failed":
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return null;
  }
}

function getStatusColor(status: string | null) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Trash2, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/components/LanguageSwitcher";

const translations = {
  en: {
    shopping_cart: "Shopping Cart",
    empty_cart: "Your cart is empty",
    continue_shopping: "Continue Shopping",
    product: "Product",
    quantity: "Quantity",
    unit_price: "Unit Price",
    total: "Total",
    subtotal: "Subtotal",
    remove: "Remove",
    clear_cart: "Clear Cart",
    proceed_to_rfq: "Proceed to RFQ",
    proceed_to_checkout: "Proceed to Checkout",
    quantity_updated: "Quantity updated",
    item_removed: "Item removed from cart",
  },
  es: {
    shopping_cart: "Carrito de Compras",
    empty_cart: "Tu carrito está vacío",
    continue_shopping: "Continuar Comprando",
    product: "Producto",
    quantity: "Cantidad",
    unit_price: "Precio Unitario",
    total: "Total",
    subtotal: "Subtotal",
    remove: "Eliminar",
    clear_cart: "Vaciar Carrito",
    proceed_to_rfq: "Proceder a Cotización",
    proceed_to_checkout: "Proceder al Pago",
    quantity_updated: "Cantidad actualizada",
    item_removed: "Artículo eliminado del carrito",
  },
  ru: {
    shopping_cart: "Корзина покупок",
    empty_cart: "Ваша корзина пуста",
    continue_shopping: "Продолжить покупки",
    product: "Товар",
    quantity: "Количество",
    unit_price: "Цена за единицу",
    total: "Итого",
    subtotal: "Сумма",
    remove: "Удалить",
    clear_cart: "Очистить корзину",
    proceed_to_rfq: "Перейти к запросу предложения",
    proceed_to_checkout: "Перейти к оплате",
    quantity_updated: "Количество обновлено",
    item_removed: "Товар удален из корзины",
  },
  zh: {
    shopping_cart: "购物车",
    empty_cart: "购物车为空",
    continue_shopping: "继续购物",
    product: "产品",
    quantity: "数量",
    unit_price: "单价",
    total: "合计",
    subtotal: "小计",
    remove: "删除",
    clear_cart: "清空购物车",
    proceed_to_rfq: "提交报价请求",
    proceed_to_checkout: "进行结账",
    quantity_updated: "数量已更新",
    item_removed: "商品已从购物车移除",
  },
  ar: {
    shopping_cart: "سلة التسوق",
    empty_cart: "سلتك فارغة",
    continue_shopping: "متابعة التسوق",
    product: "المنتج",
    quantity: "الكمية",
    unit_price: "السعر للوحدة",
    total: "الإجمالي",
    subtotal: "المجموع الجزئي",
    remove: "إزالة",
    clear_cart: "مسح السلة",
    proceed_to_rfq: "الانتقال إلى طلب عرض السعر",
    proceed_to_checkout: "الانتقال إلى الدفع",
    quantity_updated: "تم تحديث الكمية",
    item_removed: "تمت إزالة العنصر من السلة",
  },
  pt: {
    shopping_cart: "Carrinho de Compras",
    empty_cart: "Seu carrinho está vazio",
    continue_shopping: "Continuar Comprando",
    product: "Produto",
    quantity: "Quantidade",
    unit_price: "Preço Unitário",
    total: "Total",
    subtotal: "Subtotal",
    remove: "Remover",
    clear_cart: "Limpar Carrinho",
    proceed_to_rfq: "Prosseguir para Cotação",
    proceed_to_checkout: "Prosseguir para Pagamento",
    quantity_updated: "Quantidade atualizada",
    item_removed: "Item removido do carrinho",
  },
};

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const language = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const { data: cartItems = [], isLoading } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: total = 0 } = trpc.cart.getTotal.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateMutation = trpc.cart.updateItem.useMutation();
  const removeMutation = trpc.cart.removeItem.useMutation();
  const clearMutation = trpc.cart.clear.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">{t.shopping_cart}</h1>
            <p className="text-muted-foreground mb-6">Please log in to view your cart</p>
            <Button onClick={() => navigate("/")} variant="default">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">{t.shopping_cart}</h1>
            <p className="text-muted-foreground mb-6">{t.empty_cart}</p>
            <Button onClick={() => navigate("/products")} variant="default">
              {t.continue_shopping}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">{t.shopping_cart}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">{t.product}</th>
                      <th className="text-center py-3">{t.quantity}</th>
                      <th className="text-right py-3">{t.unit_price}</th>
                      <th className="text-right py-3">{t.total}</th>
                      <th className="text-center py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-4">
                          <div>
                            <p className="font-semibold">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value);
                              if (newQty > 0) {
                                updateMutation.mutate({
                                  cartItemId: item.id,
                                  quantity: newQty,
                                });
                              }
                            }}
                            className="w-16 mx-auto"
                          />
                        </td>
                        <td className="py-4 text-right">${item.product.basePrice.toFixed(2)}</td>
                        <td className="py-4 text-right font-semibold">
                          ${(item.product.basePrice * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMutation.mutate({ cartItemId: item.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/products")}
                >
                  {t.continue_shopping}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearMutation.mutate()}
                >
                  {t.clear_cart}
                </Button>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>{t.total}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/bulk-quote-request")}
                >
                  {t.proceed_to_rfq}
                </Button>
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/checkout")}
                >
                  {t.proceed_to_checkout}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

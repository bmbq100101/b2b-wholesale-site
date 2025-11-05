import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap, Award } from "lucide-react";

export function MembershipBadge() {
  const { user } = useAuth();
  const { data: membership } = trpc.membership.getUserMembership.useQuery(undefined, {
    enabled: !!user,
  });

  if (!membership) return null;

  const icons: Record<string, React.ReactNode> = {
    "普通会员": <Star className="w-4 h-4" />,
    "银牌会员": <Zap className="w-4 h-4" />,
    "金牌会员": <Crown className="w-4 h-4" />,
    "钻石会员": <Award className="w-4 h-4" />,
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        style={{ backgroundColor: membership.tier.color || "#999999" }}
        className="text-white"
      >
        <span className="mr-1">{icons[membership.tier.name] || <Star className="w-4 h-4" />}</span>
        {membership.tier.name}
      </Badge>
      <span className="text-sm text-gray-600">
        年采购额: ¥{(membership.annualPurchaseAmount / 100).toLocaleString()}
      </span>
    </div>
  );
}

export function MembershipTiers() {
  const { data: tiers = [] } = trpc.membership.getTiers.useQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className="border rounded-lg p-4 text-center"
          style={{ borderColor: tier.color || "#999999" }}
        >
          <h3 className="font-semibold text-lg mb-2">{tier.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
          <div className="mb-3">
            <p className="text-2xl font-bold" style={{ color: tier.color || "#999999" }}>
              {tier.discountPercentage}%
            </p>
            <p className="text-xs text-gray-500">折扣</p>
          </div>
          <p className="text-xs text-gray-600">
            最低年采购额: ¥{(tier.minAnnualPurchase / 100).toLocaleString()}
          </p>
          {tier.additionalBenefits && (
            <div className="mt-3 text-xs">
              <p className="font-semibold mb-1">权益:</p>
              <ul className="text-left">
                {JSON.parse(tier.additionalBenefits).map((benefit: string, idx: number) => (
                  <li key={idx}>• {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function MembershipPriceDisplay({ 
  basePrice, 
  productId, 
  categoryId 
}: { 
  basePrice: number;
  productId: number;
  categoryId: number;
}) {
  const { user } = useAuth();
  const { data: discount } = trpc.membership.getApplicableDiscount.useQuery(
    { productId, categoryId },
    { enabled: !!user }
  );

  const memberPrice = discount 
    ? Math.floor(basePrice * (1 - discount.discountPercentage / 100))
    : basePrice;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          ¥{(memberPrice / 100).toFixed(2)}
        </span>
        {discount && (
          <span className="text-sm text-red-600 line-through">
            ¥{(basePrice / 100).toFixed(2)}
          </span>
        )}
      </div>
      {discount && (
        <p className="text-sm text-green-600">
          会员优惠: 节省 ¥{((basePrice - memberPrice) / 100).toFixed(2)}
        </p>
      )}
    </div>
  );
}

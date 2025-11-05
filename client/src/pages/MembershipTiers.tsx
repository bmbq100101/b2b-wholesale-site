import { MembershipBadge, MembershipTiers } from "@/components/MembershipBadge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function MembershipTiersPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            B2B Wholesale
          </Link>
          <nav className="flex gap-6">
            <Link href="/products" className="hover:text-blue-600">产品</Link>
            <Link href="/about" className="hover:text-blue-600">关于</Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="hover:text-blue-600">仪表板</Link>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>登录</a>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">会员等级体系</h1>
          <p className="text-xl mb-6">根据您的采购额自动升级，享受更多优惠和权益</p>
          {isAuthenticated && user && (
            <div className="flex justify-center mb-6">
              <MembershipBadge />
            </div>
          )}
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">会员等级对比</h2>
          <p className="text-gray-600 mb-8">
            我们提供4个会员等级，每个等级都有不同的折扣和权益。随着您的采购额增加，您将自动升级到更高的等级。
          </p>
        </div>

        <MembershipTiers />

        {/* Benefits Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">会员权益</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>产品价格折扣（根据等级不同）</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>优先获得新产品和限量商品</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>专属客服支持和快速响应</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>定制化的采购方案和报价</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>年度返利和积分奖励</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">升级规则</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">→</span>
                <span><strong>普通会员</strong>: 注册即可享受基础折扣</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">→</span>
                <span><strong>银牌会员</strong>: 年采购额达 ¥50,000</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">→</span>
                <span><strong>金牌会员</strong>: 年采购额达 ¥200,000</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">→</span>
                <span><strong>钻石会员</strong>: 年采购额达 ¥500,000</span>
              </li>
              <li className="text-sm text-gray-600 mt-4">
                * 升级会自动进行，无需手动申请
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 text-center">
          <h3 className="text-2xl font-bold mb-4">准备开始采购了吗？</h3>
          <p className="mb-6 text-lg">浏览我们的产品，享受会员专享价格</p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/products">浏览产品</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 mt-16">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 B2B Wholesale Surplus Goods. 版权所有。</p>
        </div>
      </footer>
    </div>
  );
}

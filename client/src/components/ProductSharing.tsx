import { useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface ProductShareProps {
  productId: number;
  productName: string;
  productSlug: string;
  productDescription?: string;
  productImage?: string;
  basePrice?: number;
  sku?: string;
}

export function ProductSharing({
  productId,
  productName,
  productSlug,
  productDescription,
  productImage,
  basePrice,
  sku,
}: ProductShareProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = `${baseUrl}/products/${productSlug}`;
  const title = `Check out: ${productName}`;
  const description = productDescription || `Wholesale ${productName}`;

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(title)}&hashtags=wholesale,B2B,surplus`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + productUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(title)}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    setIsSharing(true);
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    setTimeout(() => setIsSharing(false), 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success("Product link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Wholesale Opportunity: ${productName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share this wholesale product with you:\n\nProduct: ${productName}\nSKU: ${sku || "N/A"}\n\nView Product: ${productUrl}\n\nBest regards`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
            Share on Social Media
          </div>

          <DropdownMenuItem
            onClick={() => handleShare("facebook")}
            className="cursor-pointer flex items-center gap-3"
          >
            <Facebook className="h-4 w-4 text-blue-600" />
            <span>Facebook</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleShare("twitter")}
            className="cursor-pointer flex items-center gap-3"
          >
            <Twitter className="h-4 w-4 text-blue-400" />
            <span>Twitter / X</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleShare("linkedin")}
            className="cursor-pointer flex items-center gap-3"
          >
            <Linkedin className="h-4 w-4 text-blue-700" />
            <span>LinkedIn</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleShare("whatsapp")}
            className="cursor-pointer flex items-center gap-3"
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>WhatsApp</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleShare("telegram")}
            className="cursor-pointer flex items-center gap-3"
          >
            <Send className="h-4 w-4 text-blue-500" />
            <span>Telegram</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleEmailShare}
            className="cursor-pointer flex items-center gap-3"
          >
            <Mail className="h-4 w-4 text-slate-600" />
            <span>Email</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleCopyLink}
            className="cursor-pointer flex items-center gap-3"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Embed social share buttons in product detail page
export function ProductSocialShare({
  productId,
  productName,
  productSlug,
  productDescription,
  productImage,
  basePrice,
  sku,
}: ProductShareProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = `${baseUrl}/products/${productSlug}`;
  const title = `Check out: ${productName}`;

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(title)}&hashtags=wholesale,B2B,surplus`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + productUrl)}`,
  };

  const handleShare = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="flex gap-3 items-center">
      <span className="text-sm font-medium text-slate-600">Share:</span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-full hover:bg-blue-100"
          onClick={() => handleShare(shareUrls.facebook)}
          title="Share on Facebook"
        >
          <Facebook className="h-5 w-5 text-blue-600" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-full hover:bg-blue-100"
          onClick={() => handleShare(shareUrls.twitter)}
          title="Share on Twitter"
        >
          <Twitter className="h-5 w-5 text-blue-400" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-full hover:bg-blue-100"
          onClick={() => handleShare(shareUrls.linkedin)}
          title="Share on LinkedIn"
        >
          <Linkedin className="h-5 w-5 text-blue-700" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-full hover:bg-green-100"
          onClick={() => handleShare(shareUrls.whatsapp)}
          title="Share on WhatsApp"
        >
          <MessageCircle className="h-5 w-5 text-green-600" />
        </Button>
      </div>
    </div>
  );
}

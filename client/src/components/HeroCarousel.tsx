import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CarouselSlide {
  id: string;
  type: "image" | "video";
  url: string;
  title: string;
  subtitle?: string;
  cta?: {
    text: string;
    href: string;
  };
  duration?: number; // Auto-play duration in seconds (default: 5)
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HeroCarousel({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoPlayInterval]);

  useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (autoPlayInterval / 100));
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isPlaying, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* Slides */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {s.type === "image" ? (
            <img
              src={s.url}
              alt={s.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={s.url}
              autoPlay={index === currentSlide}
              muted
              loop
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
              {s.title}
            </h1>
            {s.subtitle && (
              <p className="text-xl md:text-2xl mb-8 drop-shadow-lg max-w-2xl">
                {s.subtitle}
              </p>
            )}
            {s.cta && (
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => (window.location.href = s.cta!.href)}
              >
                {s.cta.text}
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-6 right-6 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 w-2 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Example usage component
export function HeroCarouselExample() {
  const slides: CarouselSlide[] = [
    {
      id: "slide-1",
      type: "image",
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      title: "Premium Surplus Goods",
      subtitle: "Direct wholesale supplier from Dongguan, China",
      cta: {
        text: "Browse Products",
        href: "/products",
      },
    },
    {
      id: "slide-2",
      type: "image",
      url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=600&fit=crop",
      title: "Competitive Pricing",
      subtitle: "Best wholesale rates for bulk orders",
      cta: {
        text: "Request Quote",
        href: "/bulk-quote-request",
      },
    },
    {
      id: "slide-3",
      type: "image",
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
      title: "Global Shipping",
      subtitle: "Fast and reliable delivery worldwide",
      cta: {
        text: "Learn More",
        href: "/about",
      },
    },
  ];

  return <HeroCarousel slides={slides} autoPlay={true} autoPlayInterval={5000} />;
}

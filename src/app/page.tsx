"use client";

import { Button } from "@/components/ui/button";
import { PaperPlaneIcon, GearIcon } from "@radix-ui/react-icons";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Main Content */}
      <main className="flex-1 flex px-6 py-20 max-w-4xl mx-auto text-center relative items-center flex-col justify-center min-h-[calc(100vh-120px)]">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-60">
          <PaperPlaneIcon className="w-8 h-8 text-muted-foreground transform rotate-12" />
        </div>
        <div className="absolute top-32 right-16 opacity-60">
          <div className="w-12 h-8 border-2 border-muted-foreground rounded-sm flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">A+</span>
          </div>
        </div>
        <div className="absolute bottom-40 left-20 opacity-60">
          <div className="text-muted-foreground text-sm transform -rotate-12">
            E=mc²
          </div>
        </div>
        <div className="absolute bottom-32 right-12 opacity-60">
          <GearIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="absolute top-40 right-32 opacity-60"></div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-foreground mb-6 leading-tight text-balance">
          The Ultimate AI Tutor.
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed text-pretty">
          Make learning feel effortless with AI that works alongside you. No
          switching apps, no losing focus.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Try for free
        </Button>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/katrina/SiteHeader";
import { Hero } from "@/components/katrina/Hero";
import { WorldCupBanner } from "@/components/katrina/WorldCupBanner";
import { MenuGrid } from "@/components/katrina/MenuGrid";
import { Gallery } from "@/components/katrina/Gallery";
import { SiteFooter } from "@/components/katrina/SiteFooter";
import { StarField } from "@/components/katrina/StarField";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <StarField />
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <Hero />
          <WorldCupBanner />
          <MenuGrid />
          <Gallery />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

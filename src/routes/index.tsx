import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/katrina/SiteHeader";
import { Hero } from "@/components/katrina/Hero";
import { Identidad } from "@/components/katrina/Identidad";
import { Eventos } from "@/components/katrina/Eventos";
import { MenuGrid } from "@/components/katrina/MenuGrid";
import { SiteFooter } from "@/components/katrina/SiteFooter";
import { StarField } from "@/components/katrina/StarField";
import { Wallpaper } from "@/components/katrina/Wallpaper";
import { ChatPanel } from "@/components/katrina/ChatPanel";
import { MobileBottomBar } from "@/components/katrina/MobileBottomBar";
import { MesaBanner } from "@/components/katrina/MesaBanner";
import { CartBar } from "@/components/katrina/CartBar";
import { TurnoChip } from "@/components/katrina/TurnoChip";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-[#12080e] pb-28 text-foreground md:pb-0">
      <Wallpaper />
      <StarField />
      <div className="relative z-10">
        <SiteHeader />
        <MesaBanner />
        <main>
          <Hero />
          <div className="tapiz-carta">
            <MenuGrid />
          </div>
          <div className="tapiz-noches">
            <Eventos />
          </div>
          <div className="tapiz-lugar">
            <Identidad />
          </div>
        </main>
        <SiteFooter />
      </div>
      <TurnoChip />
      <ChatPanel />
      <CartBar />
      <MobileBottomBar />
      <Toaster />
    </div>
  );
}

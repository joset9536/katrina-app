import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/katrina/SiteHeader";
import { Hero } from "@/components/katrina/Hero";
import { Identidad } from "@/components/katrina/Identidad";
import { Eventos } from "@/components/katrina/Eventos";
import { MenuGrid } from "@/components/katrina/MenuGrid";
import { SiteFooter } from "@/components/katrina/SiteFooter";
import { StarField } from "@/components/katrina/StarField";
import { FloatingSigns } from "@/components/katrina/FloatingSigns";
import { ChatPanel } from "@/components/katrina/ChatPanel";
import { MobileBottomBar } from "@/components/katrina/MobileBottomBar";
import { MesaBanner } from "@/components/katrina/MesaBanner";
import { CartBar } from "@/components/katrina/CartBar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background pb-28 text-foreground md:pb-0">
      <StarField />
      <div className="relative z-10">
        <SiteHeader />
        <MesaBanner />
        <main>
          <Hero />
          <MenuGrid />
          <Eventos />
          <Identidad />
        </main>
        <SiteFooter />
      </div>
      <FloatingSigns />
      <ChatPanel />
      <CartBar />
      <MobileBottomBar />
      <Toaster />
    </div>
  );
}

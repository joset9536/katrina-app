import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/katrina/SiteHeader";
import { Hero } from "@/components/katrina/Hero";
import { Identidad } from "@/components/katrina/Identidad";
import { Eventos } from "@/components/katrina/Eventos";
import { MenuGrid } from "@/components/katrina/MenuGrid";
import { Fidelizacion } from "@/components/katrina/Fidelizacion";
import { Comunidad } from "@/components/katrina/Comunidad";
import { SiteFooter } from "@/components/katrina/SiteFooter";
import { StarField } from "@/components/katrina/StarField";
import { FloatingSigns } from "@/components/katrina/FloatingSigns";
import { ChatPanel } from "@/components/katrina/ChatPanel";
import { MobileBottomBar } from "@/components/katrina/MobileBottomBar";


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
          <Identidad />
          <Eventos />
          <MenuGrid />
          <Fidelizacion />
          <Comunidad />
        </main>
        <SiteFooter />
      </div>
      <FloatingSigns />
      <ChatPanel />
      <MobileBottomBar />

    </div>
  );
}

# 🍸 KATRINA RESTOBAR — Neon Cocktail Bar SPA

**React 19 + TanStack Start + Vite + Tailwind CSS**

Full-stack neon cocktail bar app. Real-time chat, interactive maps, reservations, AI chatbot.

---

## 🎨 DISEÑO VISUAL — ESPECIFICACIÓN COMPLETA

### **1. PALETA DE COLORES NEON**

```css
/* Primarios */
--neon-pink:    #FF3D8A   /* Rosa magenta intenso */
--neon-yellow:  #E8B923   /* Dorado brillante */
--neon-purple:  #8B5CF6   /* Púrpura neón */
--neon-blue:    #74ACDF   /* Azul cielo */
--neon-orange:  #FF6B00   /* Naranja fuego */

/* Fondos */
--bg-dark:      #0E0A1A   /* Azul-negro profundo */
--bg-card:      #1A1428   /* Gris-azul muy oscuro */
--bg-overlay:   rgba(20, 15, 30, 0.85)
```

### **2. FONDOS Y ATMÓSFERA**

#### **Fondo Principal (Body)**
```css
background: #0E0A1A;
background-image:
  /* Orbes diffusos de neon */
  radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.12), transparent 55%),
  radial-gradient(ellipse at 85% 15%, rgba(255, 61, 138, 0.08), transparent 50%);
background-attachment: fixed;
```

#### **Espejo Infinito Neon (NUEVO)**
- Bordes con glow infinito (líneas de neón que se repiten)
- Efecto: `box-shadow: inset 0 0 40px rgba(255, 61, 138, 0.3), 0 0 60px rgba(232, 185, 35, 0.2)`
- Animación: pulse suave cada 3s (opacity 0.4 → 1)
- Uso: SiteHeader, botones principales, tarjetas Hero

#### **Cartelerías Neon (NUEVO)**
- Texto con glow: `text-shadow: 0 0 20px #FF3D8A, 0 0 40px #E8B923`
- Bordes brillantes: `border: 2px solid; filter: drop-shadow(0 0 12px currentColor)`
- Colores alternados por zona:
  - Header: pink + yellow
  - Menu: purple + blue
  - Hero: pink + purple
  - Footer: orange + blue

#### **Puntos/Stars Flotantes (StarField)**
- 22 puntos neon flotando
- Colores: ciclan entre los 5 primarios
- Animación: `starfield-twinkle` (20s)
  - 0-50%: opacity 0.25, scale 1, translateY 0
  - 50%: opacity 1, scale 1.3, translateY -10px
  - 100%: back to start
- Posiciones: determinísticas (seeded), no random
- Box-shadow: `0 0 7.96px #COLOR` (glow pequeño)

### **3. ILUMINACIÓN Y GLOW**

#### **Tipos de Glow**
1. **Suave (elementos secundarios)**
   ```css
   box-shadow: 0 0 18px rgba(255, 61, 138, 0.25), 
              0 0 40px rgba(255, 61, 138, 0.12);
   ```

2. **Medio (botones, cards)**
   ```css
   box-shadow: 0 0 24px rgba(139, 92, 246, 0.4), 
              0 0 60px rgba(139, 92, 246, 0.2);
   ```

3. **Intenso (hover, Hero title)**
   ```css
   box-shadow: 0 0 32px rgba(255, 61, 138, 0.6), 
              0 0 90px rgba(255, 61, 138, 0.3);
   ```

#### **Drop-Shadow Filters (para textos)**
```css
filter: drop-shadow(0 0 12px rgba(255, 61, 138, 0.55))
        drop-shadow(0 0 32px rgba(232, 185, 35, 0.35));
```

### **4. ANIMACIONES PRINCIPALES**

#### **A. Ciclo Bandera Argentina (20s) — `katrina-flag-cycle`**
```
0-22%:    Neon lava (oleadas de color)
          - Gradientes radiales: pink, yellow, purple
          - Movement: background-position cicla
45-47%:   Transición (fade)
50-95%:   Bandera Argentina (celeste/blanco/celeste)
          - Horizontal stripes: #74ACDF | #FFFFFF | #74ACDF
100%:     Vuelve a neon
```

#### **B. Sol Visible en Bandera (20s) — `katrina-sun-vis`**
```
0-47%:    opacity: 0, scale: 0.5 (invisible)
52-93%:   opacity: 1, scale: 1 (visible, glow dorado)
98-100%:  opacity: 0, scale: 0.5
```
- Ubicación: centro de "KATRINA" (entre T y R)
- Color: #FCBF49 (dorado)
- Glow: `drop-shadow(0 0 10px rgba(252, 191, 73, 0.95))`

#### **C. StarField Twinkle (variable 3-8s por punto)**
```
0%, 100%:  opacity: 0.25, scale: 1, translateY: 0
50%:       opacity: 1, scale: 1.3, translateY: -10px
```

#### **D. Fade-Up en Scroll — `fade-up`**
```
Estado inicial:  opacity: 0, translateY: 24px
Al entrar VP:    opacity: 1, translateY: 0
Duración: 900ms cubic-bezier(0.22, 1, 0.36, 1)
```

#### **E. Neon Flicker (startup) — `neon-flicker`**
```
Simula encendido de letrero neon
0%, 18%, 22%, 25%, 53%, 57%, 100%: opacity 1, full glow
20%, 24%, 55%: opacity 0.35, sin glow
Duración: 2.8s (solo 1 vez)
```

#### **F. Button Pulse (CTA buttons)**
```
0%, 100%:  box-shadow: glow normal
50%:       box-shadow: glow intenso (2x)
Duración: 3.2s infinite
```

#### **G. Smoke Drift (background ambient)**
```
Nubes de humo translúcidas moviéndose lentamente
transform: translate(-5% → 3%, 0% → -3%) scale(1 → 1.05)
opacity: 0.35 → 0.55
Duración: 18s
Filtro: blur(60px)
```

### **5. ORGANIZACIÓN VISUAL POR SECCIONES**

#### **HEADER**
- Logo: Cara calavera neon (katrina-face.png)
  - Glow: `drop-shadow(0 0 12px #FF3D8A) drop-shadow(0 0 32px #E8B923)`
- Nav links: Underline con gradient neon on hover
- Fondo: Semi-transparent blur (10px)
- Borde inferior: 1px solid neon-purple/30 on scroll

#### **HERO**
- Título "KATRINA": 
  - Font: Cormorant Garamond (display font)
  - Size: clamp(3rem, 12vw, 8rem)
  - Animación: `katrina-flag-cycle` (20s neon → bandera)
  - Sun SVG en centro
- Subtítulo: 2 líneas, text-white/80, font-sans
- Descripción: 3-4 líneas, text-white/70
- Botones:
  - "Pedir a mi Mesa": btn-glow-purple
  - "Ver Carta": btn-ghost-neon
- Fondo: Radial gradient (elipse arriba, purpura/rojo)

#### **WORLD CUP BANNER**
- 3 videos HD (controls enabled)
- Cada video + frase emocional (Maradona/Messi)
- Fecha: "Miércoles 15 de julio · 16hs · Egüés 502, Orán, Salta"
- Estilos:
  - Background: radial-gradient (azul Argentina)
  - Border: 1px solid neon-blue/35
  - Box-shadow: inset 0 0 60px rgba(116, 172, 223, 0.08)

#### **MENÚ GRID**
- 6 categorías (tabs)
- Grid: 3 columnas (responsive)
- Cada item:
  - Foto (hovers: scale-105)
  - Nombre + descripción
  - Precio
  - Card: border-neon-purple/30, hover glow
  - Estilos: gradient fondo (card-color)

#### **GALERÍA PATIO**
- Scroll horizontal
- 5 fotos con bordes de color (cada una color diferente del neon palette)
- Label debajo de cada foto
- Hover: translateY(-4px) + glow
- Colors: #FF3D8A, #E8B923, #8B5CF6, #74ACDF, #FF6B00

#### **FOOTER**
- 3 columnas: Dirección, Horarios, Contacto
- Fondo: gradient semi-transparent
- Bordes: lines con glow orange

### **6. CARTA DE NEON (Menú Items)**

Cada item en MenuGrid:
```
┌─────────────────────────────────┐
│         [FOTO ITEM]             │ ← object-cover, rounded
│     with glow on hover          │
├─────────────────────────────────┤
│  Nombre Plato                   │ ← font-bold, neon-gradient text
│  Descripción breve...           │ ← text-white/70
├─────────────────────────────────┤
│  $$$$$$ (Precio)                │ ← neon-yellow
└─────────────────────────────────┘

Border: 1px solid neon-purple/30
Hover: 
  - scale: y -3px
  - box-shadow: 0 0 24px rgba(139, 92, 246, 0.25)
  - border-color: neon-purple/55
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
src/
├── assets/
│   ├── carta/               (31 fotos comida: JPG/PNG)
│   │   ├── classic-burger.jpg
│   │   ├── doble-burger.png
│   │   ├── katrina-burger.png
│   │   ├── pizza-*.jpg
│   │   ├── sandwich-*.jpg
│   │   ├── postre-*.jpg
│   │   └── ... (27 más)
│   ├── patio/               (5 fotos local: PNG)
│   │   ├── patio-01.png (salón)
│   │   ├── patio-02.png (ambiente)
│   │   ├── patio-03.png (segundo piso)
│   │   ├── patio-04.png (entrada)
│   │   └── patio-05.png (frente)
│   ├── videos/              (5 videos MP4 HD + audio)
│   │   ├── arg-holanda.mp4 (12 MB completo)
│   │   ├── asado-seleccion.mp4 (12 MB completo)
│   │   ├── julian-gol-suecia.mp4 (3.5 MB completo)
│   │   ├── arg-inglaterra-poster.mp4 (opcional)
│   │   └── cuenta-regresiva.mp4 (opcional)
│   ├── katrina-face.png     (logo calavera, transparent)
│   └── katrina-flower.png   (flor alternativa)
│
├── components/
│   ├── katrina/
│   │   ├── SiteHeader.tsx
│   │   ├── Hero.tsx         (con animación flag-cycle + sun)
│   │   ├── WorldCupBanner.tsx (3 videos + frases)
│   │   ├── MenuGrid.tsx     (6 categorías, 31 items con fotos)
│   │   ├── Gallery.tsx      (5 fotos patio, scroll horizontal)
│   │   ├── StarField.tsx    (22 puntos neon, twinkle animation)
│   │   ├── SiteFooter.tsx
│   │   ├── KatrinaMark.tsx  (logo render)
│   │   ├── NeonButton.tsx
│   │   └── Experience.tsx   (componente raíz)
│   └── ui/                  (componentes radix-ui)
│
├── styles.css               (TODAS las animaciones + keyframes)
├── routes/
│   ├── __root.tsx
│   └── index.tsx            (página principal)
│
└── package.json
```

---

## 🎨 ESTILOS CSS — KEYFRAMES COMPLETAS

### **En `src/styles.css`:**

```css
@keyframes katrina-flag-cycle {
  /* 0-22%: Neon lava wave */
  0% {
    background-image: 
      radial-gradient(circle at 30% 30%, rgba(255, 61, 138, 0.9), transparent 40%),
      radial-gradient(circle at 75% 65%, rgba(232, 185, 35, 0.85), transparent 45%),
      radial-gradient(circle at 55% 90%, rgba(139, 92, 246, 0.9), transparent 40%),
      linear-gradient(115deg, #8B5CF6 0%, #C0006A 18%, #FF3D8A 34%, #E8B923 52%, #FF6B00 68%, #8B5CF6 100%);
    background-position: 0% 50%, 40% 20%, 80% 70%, 0% 50%;
  }
  
  22% { /* Climax lava */ }
  
  45%, 47% { /* Fade transition */ }
  
  50%, 95% {
    /* Bandera Argentina */
    background-image:
      linear-gradient(180deg,
        #74ACDF 0%, #74ACDF 32%,
        #FFFFFF 32%, #FFFFFF 68%,
        #74ACDF 68%, #74ACDF 100%);
    background-position: 0 0;
  }
  
  100% { /* Vuelve a neon */ }
}

@keyframes katrina-sun-vis {
  0%, 47% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  52%, 93% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  98%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
}

@keyframes starfield-twinkle {
  0%, 100% { opacity: 0.25; transform: translateY(0) scale(1); }
  50% { opacity: 1; transform: translateY(-10px) scale(1.3); }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes neon-flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 12px ...) drop-shadow(0 0 32px ...);
  }
  20%, 24%, 55% {
    opacity: 0.35;
    filter: none;
  }
}

@keyframes btn-pulse {
  0%, 100% { box-shadow: glow-normal; }
  50% { box-shadow: glow-intenso; }
}

@keyframes smoke-drift {
  0%   { transform: translate3d(-5%, 0, 0) scale(1); opacity: 0.35; }
  50%  { transform: translate3d(3%, -3%, 0) scale(1.05); opacity: 0.55; }
  100% { transform: translate3d(-5%, 0, 0) scale(1); opacity: 0.35; }
}
```

---

## 🚀 INSTRUCCIONES PARA LOVABLE

### **PASO 1: Crear Proyecto**
```
1. Ve a Lovable.ai
2. "New Project"
3. Name: "Katrina Restobar"
4. Framework: React 19
5. Template: Blank
```

### **PASO 2: Importar desde Git**
```bash
# En Lovable:
# Settings → Import from GitHub
# URL: https://github.com/joset9536/katrina-restobar
# (si ya está en GitHub)

# O: Copiar carpeta source/ completa
```

### **PASO 3: Estructura que Lovable Verá**
```
/
├── public/assets/       (fotos + videos)
├── src/
│   ├── components/katrina/
│   ├── styles.css       (TODAS las animaciones)
│   ├── routes/
│   └── assets/
└── package.json
```

### **PASO 4: Variables de Entorno (para F1-F5)**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLAUDE_API_KEY=sk-ant-...
```

### **PASO 5: Prompt para Lovable**

```
ROLE: Senior Full-Stack Developer - Neon Bar App Specialist

PROJECT: Katrina Restobar — Interactive Neon Cocktail Bar SPA

ASSETS PROVIDED:
✅ 31 food photos (carta/)
✅ 5 venue photos (patio/) 
✅ 3 HD videos with audio (arg-holanda, asado-seleccion, julian-gol-suecia)
✅ Logo: katrina-face.png (transparent neon skull calavera)
✅ CSS animations: katrina-flag-cycle (20s), sun-vis, starfield-twinkle, fade-up, flicker
✅ Color palette: #FF3D8A #E8B923 #8B5CF6 #74ACDF #FF6B00

VISUAL SPECIFICATION:
1. BACKGROUND: Dark blue-black #0E0A1A with radial gradient orbs (neon-purple 12%, neon-pink 8%)
2. NEON GLOW EVERYWHERE: box-shadow glows on cards, buttons, text
3. INFINITE NEON MIRROR: Inset glow on header, cards (pulsing animation 3s)
4. FLOATING STARFIELD: 22 points with twinkle animation (3-8s cycle per point)
5. BANDERA ARGENTINA: 20s cycle in KATRINA title (10s neon lava → 10s flag stripes)
6. GOLDEN SUN: Visible only during bandera phase (center of title, glow #FCBF49)
7. NEON CARTELERÍA: Text with drop-shadow glow (#FF3D8A + #E8B923)
8. MENU CARDS: 31 items with photo, hover: translateY(-4px) + glow
9. PATIO GALLERY: 5 photos, colored borders (each color from palette), scroll horizontal
10. SMOKE EFFECT: Ambient drift on page (opacity 0.35-0.55, blur 60px)

IMPLEMENTATION PHASES:

F1: CHAT REAL-TIME (Supabase)
- Components: ChatPanel, ChatBox, useChat hook
- Tables: chat, mesas, staff
- Real-time WebSocket subscriptions
- Styles: neon (cliente=blue, staff=green)

F2: INTERACTIVE MAP (Leaflet.js)
- 6 mesas as markers
- Color-coding: libre=green, ocupada=red, esperando=yellow
- Click mesa → ChatPanel
- Real-time updates

F3: RESERVATIONS (react-day-picker)
- Calendar + booking form
- Table: reservas
- Staff dashboard

F4: AI CHATBOT (Claude API)
- Supabase Edge Function
- Owner asks "¿Qué pasa?" → live summary in 5s
- Endpoint: /api/ask-grok

F5: DEPLOY
- Build + FTP to Hostinger
- Production ready

CONSTRAINTS:
✅ TypeScript strict
✅ React 19 hooks
✅ Tailwind CSS (neon palette)
✅ Zero console warnings
✅ Optimistic updates
✅ Full error handling
✅ RLS Supabase (post-testing)

START: Implement F1 first, then F2, F3, F4, F5
DELIVER: Production-ready code, well-documented, ready to ship
```

---

## ✅ TODO COMPLETO

- [x] Git repository inicializado
- [x] Todos los assets presentes (fotos + videos completos)
- [x] Estilos neon implementados
- [x] Animaciones 20s ciclo bandera + sun
- [x] StarField 22 puntos twinkle
- [x] Estructura limpia sin basura
- [ ] **TÚ: Crear proyecto Lovable**
- [ ] **TÚ: Importar desde Git o copiar carpeta**
- [ ] **TÚ: Ejecutar prompt F1 en Lovable**

---

**LISTO PARA LOVABLE. SIN BASURA. SIN SOBRECARGA. TOTAL CLARITY.** 🔥

Commit hash: `0b1dfd3`

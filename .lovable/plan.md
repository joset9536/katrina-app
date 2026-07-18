Cuatro arreglos, todos scoped a mobile / UI. Sin tocar logo ni animación del hero. No publicar.

## 1) Botón "Ver Carta" no navega

**Causa**: en `Hero.tsx` el botón apunta a `href="#menu"`, pero la sección tiene `id="carta"` (ver `MenuGrid.tsx`). El handler global de anchors en `SiteHeader.tsx` solo hace `preventDefault` cuando existe el elemento, así que el tap se convierte en un no-op silencioso.

**Fix**: en `src/components/katrina/Hero.tsx` cambiar `href="#menu"` por `href="#carta"` en el NeonButton "Ver Carta".

## 2) Carrusel de Identidad no auto-rota en mobile real

**Causa**: en `Identidad.tsx` el efecto pausa con `touchstart` y solo reanuda con `touchend` sobre el mismo scroller. En Chrome Android, cuando el usuario hace scroll vertical de la página tocando encima del carrusel, `touchstart` dispara y a veces `touchend` no llega al elemento (el gesto se cancela o se pierde), dejando `paused = true` para siempre.

**Fix**: reemplazar el patrón `paused` sticky por un "reanudar tras N segundos de inactividad":
- Guardar `pausedUntil = 0`; en `touchstart` / `mouseenter` setear `pausedUntil = Date.now() + 6000`.
- En `touchend` / `mouseleave` no hacer nada especial (el timeout ya vence solo).
- Dentro del `setInterval`, saltear el avance solo si `Date.now() < pausedUntil`.
- Marcar `touchstart` / `touchend` como `{ passive: true }` (ya lo está el start, agregar al end) para no interferir con el scroll nativo.

Así el autoplay siempre se recupera aunque el touch se pierda.

## 3) Carta: scroll áspero en mobile real

**Causa combinada** en `MenuGrid.tsx`:
- La barra de tabs sticky (`sticky top-14 ... overflow-x-auto`) captura gestos táctiles verticales cuando el dedo empieza sobre ella, especialmente en Chrome Android, porque tiene overflow horizontal activo.
- El `selectCategory` hace `scrollTo(behavior: "smooth")` sobre `window`, lo que en Android puede quedar corto porque el sticky se anima al mismo tiempo (medición antes de que el sticky reposicione).
- El auto-scroll parece "no disparar bien" porque el offset calculado (`- 64`) deja las cards debajo del header + tabs sticky (que ocupan ~64 + 56 px).

**Fixes** (simplificar la interacción):
- Agregar `style={{ touchAction: "pan-x" }}` (o clase equivalente) al contenedor sticky de tabs — así toques sobre tabs solo controlan scroll horizontal, y toques fuera de tabs siguen scrolleando vertical la página sin conflicto.
- Añadir `overscroll-behavior-x: contain` al mismo contenedor para que el swipe horizontal no se filtre al body.
- Cambiar el cálculo de `selectCategory`: en vez de scrollear al `tabsRef` restando 64 px, scrollear al contenedor de la categoría activa (envolver el grid en un `activeRef`) restando la altura combinada header (56) + tabs sticky (~56) = ~120 px en mobile. En desktop las tabs no son sticky, así que usar `-88`.
- Envolver el `scrollTo` en un `setTimeout(..., 50)` (además del `requestAnimationFrame`) para dar tiempo al re-render de la categoría activa antes de medir.
- Verificar que las cards mobile (fila compacta) no tengan `touch-action` conflictivo — no lo tienen, ok.

Resultado: el usuario puede scrollear vertical sin tener que "despertar" nada, y al tocar un tab el salto lo deja justo debajo del sticky.

## 4) Cards vacías de Eventos con personalidad

En `Eventos.tsx`, reemplazar el `Placeholder` genérico por un componente `EventoProximamente` con:
- Borde neón sutil (rotando colores de marca `#FF3D8A / #8B5CF6 / #E8B923` por índice).
- Fondo con gradiente radial oscuro + textura diagonal muy tenue (opacity ~0.06).
- Ícono central (`Sparkles` o `CalendarClock` de lucide-react, ya instalado) con `drop-shadow` neón del color asignado.
- Texto en dos líneas: "Próximo evento" (label pequeño uppercase spaced) + "Muy pronto" (display más grande).
- Micro-línea inferior tipo "Estamos armando algo especial" en `text-white/40`.
- Sin sensación de contenido real: nada de fechas ni títulos concretos.

Se aplica a las dos listas (Próximos y Realizados), variando el ícono en Realizados (`Camera` o `Clock`) para que no parezcan idénticas.

## Verificación

- `bun run build` (que no reviente).
- Playwright headless con `viewport 390x844` (Chrome Android real approx) y `userAgent` mobile:
  - Tap en "Ver Carta" → URL cambia a `#carta` y scroll aterriza en la sección Carta debajo del sticky.
  - Esperar ~5s en Identidad sin tocar → verificar que `scrollLeft` del carrusel cambió.
  - Tap en un tab de Carta lejano ("Postres") → sección visible bajo header+tabs; luego swipe vertical libre.
  - Screenshot de Eventos mostrando las 5 cards "Próximamente" con estilo neón.
- No publicar.

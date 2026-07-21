import { NeonButton } from "./NeonButton";
import { PromosSection } from "./PromosSection";
import { VideoReel, type ReelClip } from "./VideoReel";

import argHolandaAsset from "@/assets/videos/arg-holanda.mp4";
import asadoSeleccionAsset from "@/assets/videos/asado-seleccion.mp4";
import julianGolAsset from "@/assets/videos/julian-gol-suecia.mp4";
import argHolandaPosterAsset from "@/assets/posters/arg-holanda-poster.jpg";
import asadoSeleccionPosterAsset from "@/assets/posters/asado-seleccion-poster.jpg";
import julianGolPosterAsset from "@/assets/posters/julian-gol-suecia-poster.jpg";
import hinchasAsset from "@/assets/futbol/hinchas-argentinos.webp";
import argentinaVsInglaterraAsset from "@/assets/futbol/argentina-vs-inglaterra.webp";

const argHolanda = argHolandaAsset;
const asadoSeleccion = asadoSeleccionAsset;
const julianGol = julianGolAsset;
const argHolandaPoster = argHolandaPosterAsset;
const asadoSeleccionPoster = asadoSeleccionPosterAsset;
const julianGolPoster = julianGolPosterAsset;
const hinchas = hinchasAsset;
const argentinaVsInglaterra = argentinaVsInglaterraAsset;

const WHATSAPP = "https://wa.me/5493878631310";


const CLIPS: ReelClip[] = [
  {
    id: "arg-holanda",
    video: argHolanda,
    poster: argHolandaPoster,
    title: "Argentina en modo épico",
    detail: "Previa con pantalla gigante, sonido y mesa completa.",
  },
  {
    id: "julian-gol",
    video: julianGol,
    poster: julianGolPoster,
    title: "Goles que levantan la mesa",
    detail: "Momento reel para sostener la energía toda la noche.",
  },
  {
    id: "asado",
    video: asadoSeleccion,
    poster: asadoSeleccionPoster,
    title: "Asado, selección y amigos",
    detail: "El plan Katrina: partido, combos y previa argentina.",
  },
];

const MATCHES = [
  {
    stage: "Semifinal 1",
    date: "Martes 14 julio",
    time: "16:00 hs",
    home: "Francia",
    flagHomeClass: "flag-france",
    away: "España",
    flagAwayClass: "flag-spain",
  },
  {
    stage: "Semifinal 2",
    date: "Miércoles 15 julio",
    time: "16:00 hs",
    home: "Argentina",
    flagHomeClass: "flag-argentina",
    away: "Inglaterra",
    flagAwayClass: "flag-england",
  },
];

const FEATURED_TEAMS = ["Francia", "España", "Argentina", "Rusia", "Inglaterra"];

/* Frases de profesionales resilientes argentinos */
const RESILIENCE_QUOTES = [
  { q: "El talento sin trabajo no sirve para nada.", a: "Lionel Messi" },
  { q: "La pelota no se mancha.", a: "Diego Maradona" },
  { q: "Se sufre más el no intentarlo que el fracaso.", a: "Lionel Messi" },
  { q: "Los sueños se cumplen, yo soy la prueba de eso.", a: "Diego Maradona" },
  { q: "Cuando uno cree, todo es posible.", a: "Manu Ginóbili" },
  { q: "El esfuerzo siempre tiene recompensa.", a: "Emanuel Ginóbili" },
  { q: "Cada día es una oportunidad de ser mejor.", a: "Luis Scola" },
];

function MatchBoard() {
  return (
    <div className="match-board">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="wc-kicker">Próximos partidos</span>
          <h3 className="mt-2 font-display text-3xl text-white md:text-4xl">Semifinales en pantalla gigante</h3>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {FEATURED_TEAMS.map((team) => (
            <span key={team} className="team-pill">{team}</span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {MATCHES.map((match) => (
          <article key={match.stage} className="match-card">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">{match.stage}</div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <div>
                <span className={`match-flag ${match.flagHomeClass}`} aria-hidden />
                <div className="mt-1 font-semibold text-white">{match.home}</div>
              </div>
              <div className="bracket-score text-lg">VS</div>
              <div>
                <span className={`match-flag ${match.flagAwayClass}`} aria-hidden />
                <div className="mt-1 font-semibold text-white">{match.away}</div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-white/65">{match.date} · {match.time}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function QuoteStack({ start = 0 }: { start?: number }) {
  return (
    <div className="grid gap-3">
      {RESILIENCE_QUOTES.slice(start, start + 3).map((r) => (
        <blockquote key={`${r.a}-${r.q}`} className="resilience-card">
          <p>“{r.q}”</p>
          <cite>— {r.a}</cite>
        </blockquote>
      ))}
    </div>
  );
}


export function WorldCupBanner() {
  return (
    <section aria-label="Mundial 2026 en Katrina" className="relative px-4 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="football-night-hero"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(8,6,16,0.92), rgba(8,6,16,0.52), rgba(8,6,16,0.88)), url(${hinchas})`,
          }}
        >
          <div className="max-w-2xl">
            <span className="wc-kicker">Noches de fútbol</span>
            <h2 className="wc-title mt-4">¡Argentina vs Inglaterra!</h2>
            <p className="wc-detail mt-4">
              Miércoles 15 de julio · 16:00 hs — pantalla gigante, combos, promos y el ambiente Katrina en Egüés 517.
            </p>
          </div>
          <img
            src={argentinaVsInglaterra}
            alt="Argentina vs Inglaterra"
            loading="lazy"
            className="football-match-art"
          />
        </div>

        <div className="wc-screen relative mt-8 overflow-hidden rounded-2xl p-5 sm:p-8">
          <div className="wc-scanlines pointer-events-none absolute inset-0" />
          <div className="relative">
            <MatchBoard />

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <VideoReel clips={CLIPS} />
              <div className="grid gap-3 content-start">
                <span className="wc-kicker">Frases resilientes</span>
                <QuoteStack start={0} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <NeonButton
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="btn-pulse"
          >
            Reservar mesa para el partido
          </NeonButton>
        </div>

        <PromosSection />
      </div>
    </section>
  );
}

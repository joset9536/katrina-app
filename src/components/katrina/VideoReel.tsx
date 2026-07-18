import { useEffect, useRef, useState } from "react";

export type ReelClip = {
  id: string;
  video: string;
  poster: string;
  title: string;
  detail: string;
};

/**
 * Instagram-reel style stacked video carousel.
 * - autoplays muted
 * - auto-advances when a clip ends
 * - tap to unmute (with sound + playing); tap again to mute + pause
 */
export function VideoReel({ clips }: { clips: ReelClip[] }) {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clip = clips[index];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !soundOn;
    v.play().catch(() => {});
  }, [index, soundOn]);

  const goTo = (i: number) => {
    setSoundOn(false);
    setIndex(((i % clips.length) + clips.length) % clips.length);
  };

  const handleTap = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!soundOn) {
      setSoundOn(true);
      v.muted = false;
      v.play().catch(() => {});
    } else {
      setSoundOn(false);
      v.muted = true;
      v.pause();
    }
  };

  return (
    <div className="reel-stack">
      <div className="reel-frame-9x16">
        <video
          ref={videoRef}
          key={clip.id}
          src={clip.video}
          poster={clip.poster}
          playsInline
          autoPlay
          muted
          loop={false}
          preload="metadata"
          onEnded={() => goTo(index + 1)}
          onClick={handleTap}
        />

        <button
          type="button"
          className="reel-sound-btn"
          onClick={handleTap}
          aria-label={soundOn ? "Pausar y silenciar" : "Reproducir con sonido"}
        >
          {soundOn ? "🔊 Pausar" : "🔇 Tocá para sonido"}
        </button>

        <div className="reel-overlay">
          <span className="reel-index">{index + 1} / {clips.length}</span>
          <h3 className="reel-title">{clip.title}</h3>
          <p className="reel-detail">{clip.detail}</p>
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="reel-nav reel-nav-prev"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="reel-nav reel-nav-next"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      <div className="reel-dots">
        {clips.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir al clip ${i + 1}`}
            className={i === index ? "reel-dot reel-dot-active" : "reel-dot"}
          />
        ))}
      </div>
    </div>
  );
}

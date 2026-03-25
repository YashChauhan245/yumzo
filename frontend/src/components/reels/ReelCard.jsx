import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function formatCount(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace('.0', '')}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')}K`;
  }

  return `${value}`;
}

export default function ReelCard({ reel, isActive, onShare }) {
  const videoRef = useRef(null);
  const infoRef = useRef(null);
  const actionsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likePulse, setLikePulse] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
      return;
    }

    video.pause();
  }, [isActive]);

  useEffect(() => {
    const infoNode = infoRef.current;
    const actionsNode = actionsRef.current;
    if (!infoNode || !actionsNode) return;

    if (isActive) {
      gsap.fromTo(
        infoNode,
        { y: 12, opacity: 0.3 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power1.out' }
      );

      gsap.fromTo(
        actionsNode,
        { y: 12, opacity: 0.3 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power1.out', delay: 0.05 }
      );
      return;
    }

    gsap.set(infoNode, { opacity: 0.9 });
    gsap.set(actionsNode, { opacity: 0.9 });
  }, [isActive]);

  const handleLike = async () => {
    // Small pulse keeps the interaction feeling responsive even before API returns.
    setLikePulse(true);
    window.setTimeout(() => setLikePulse(false), 180);
    if (reel.onLike) {
      try {
        await reel.onLike(reel.id);
      } catch {
        // Parent already shows a toast, so we silently ignore here.
      }
    }
  };

  return (
    <article className="food-reel-card relative h-full w-full shrink-0 snap-start overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.posterUrl}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={() => setIsLoading(false)}
      />

      {isLoading && (
        <div className="food-reel-loading absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        </div>
      )}

      <div className="food-reel-gradient pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

      <div className="absolute bottom-0 left-0 z-30 flex w-full items-end justify-between gap-4 p-4 pb-7">
        <div ref={infoRef} className="min-w-0 max-w-[75%] space-y-1">
          <h2 className="food-reel-title truncate text-xl font-extrabold tracking-tight">{reel.dishName}</h2>
          <p className="food-reel-subtitle truncate text-sm text-white/90">{reel.restaurantName}</p>
        </div>

        <div ref={actionsRef} className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleLike}
            aria-label="Like reel"
            className={`food-reel-action-btn flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-xl transition-transform duration-200 hover:scale-105 ${likePulse ? 'scale-125' : 'scale-100'}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={reel.likedByMe ? 'currentColor' : 'none'}
              className={reel.likedByMe ? 'text-red-500' : 'text-white'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <span className="food-reel-count text-xs font-semibold text-white">{formatCount(reel.likeCount || 0)}</span>

          <button
            type="button"
            onClick={() => reel.onOpenComments?.(reel)}
            aria-label="Open comments"
            className="food-reel-action-btn flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-xl transition-transform duration-200 hover:scale-105"
          >
            <span>💬</span>
          </button>
          <span className="food-reel-count text-xs font-semibold text-white">{formatCount(reel.commentCount || 0)}</span>

          <button
            type="button"
            onClick={() => onShare(reel)}
            aria-label="Share reel"
            className="food-reel-action-btn flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-xl transition-transform duration-200 hover:scale-105"
          >
            <span>📤</span>
          </button>
        </div>
      </div>
    </article>
  );
}

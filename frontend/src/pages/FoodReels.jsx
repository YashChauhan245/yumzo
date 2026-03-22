import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ─── Reel data with video URLs ─────────── */
const reelsData = [
  {
    id: 1,
    video: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
    poster: '/images/reels/reel1.png',
    title: 'Mastering the Wok 🔥', chef: 'Chef Vikram', avatar: 'V',
    likes: 12400, comments: 892,
    description: 'Watch me toss up the perfect Indo-Chinese stir fry! The secret is in the flame control and that smoky wok hei flavour. 🍳',
    tags: ['#WokHei', '#ChefLife', '#Cooking'],
    category: 'cooking', music: 'Original Audio • Chef Vikram',
  },
  {
    id: 2,
    video: 'https://videos.pexels.com/video-files/3327722/3327722-uhd_2560_1440_24fps.mp4',
    poster: '/images/reels/reel2.png',
    title: 'Chocolate Lava Cake 🍫', chef: 'Pastry Pro', avatar: 'P',
    likes: 28700, comments: 1500,
    description: 'The most satisfying chocolate lava cake you\'ll ever see. That molten center FLOW though! 🤤',
    tags: ['#ChocolateLava', '#Dessert', '#Baking'],
    category: 'baking', music: 'Sweet Vibes • Pastry Pro',
  },
  {
    id: 3,
    video: 'https://videos.pexels.com/video-files/5721039/5721039-uhd_2560_1440_30fps.mp4',
    poster: '/images/reels/reel3.png',
    title: 'Fresh from the Tandoor 🫓', chef: 'Tandoori King', avatar: 'T',
    likes: 8900, comments: 634,
    description: 'Nothing beats freshly baked garlic naan straight from the clay tandoor. Can you smell it through the screen? 😍',
    tags: ['#Naan', '#Indian', '#Tandoor'],
    category: 'cooking', music: 'Tandoor Beats • DJ Spice',
  },
  {
    id: 4,
    video: 'https://videos.pexels.com/video-files/5946762/5946762-uhd_2560_1440_30fps.mp4',
    poster: '/images/reels/reel4.png',
    title: 'Latte Art Magic ☕', chef: 'Barista Neha', avatar: 'N',
    likes: 15200, comments: 1100,
    description: 'Creating a perfect rosetta in your morning latte. It\'s all about the pour angle and milk texture! ☕',
    tags: ['#LatteArt', '#Coffee', '#Barista'],
    category: 'drinks', music: 'Morning Brew • Café Sessions',
  },
  {
    id: 5,
    video: 'https://videos.pexels.com/video-files/3298572/3298572-uhd_2560_1440_25fps.mp4',
    poster: '/images/reels/reel5.png',
    title: 'Sushi Roll Secrets 🍣', chef: 'Chef Tanaka', avatar: 'T',
    likes: 21300, comments: 1800,
    description: 'Step by step guide to making the perfect salmon dragon roll. ASMR guaranteed! 🎌',
    tags: ['#Sushi', '#Japanese', '#ASMR'],
    category: 'asian', music: 'Zen Kitchen • Chef Tanaka',
  },
  {
    id: 6,
    video: 'https://videos.pexels.com/video-files/5587442/5587442-uhd_2560_1440_24fps.mp4',
    poster: '/images/reels/reel6.png',
    title: 'Cheese Pull Goals 🧀', chef: 'Foodie Rahul', avatar: 'R',
    likes: 34100, comments: 2300,
    description: 'Loaded nachos with the most insane cheese pull ever! Warning: extreme hunger ahead 😋🧀',
    tags: ['#CheesePull', '#Nachos', '#FoodPorn'],
    category: 'cooking', music: 'Cheesy Beats • Foodie Rahul',
  },
];

const categories = [
  { key: 'all', label: '🔥 Trending' },
  { key: 'cooking', label: '🍳 Cooking' },
  { key: 'baking', label: '🍰 Baking' },
  { key: 'asian', label: '🍣 Asian' },
  { key: 'drinks', label: '☕ Drinks' },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/* ───────────────────────────────────────── */
/*  Single Reel Card                         */
/* ───────────────────────────────────────── */
const ReelCard = ({ reel, isActive }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [showMore, setShowMore] = useState(false);
  const [following, setFollowing] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  // Play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/reels?id=${reel.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast.success('Link copied!');
    }
  };

  const handleFollow = () => {
    setFollowing(prev => !prev);
    toast.success(following ? `Unfollowed ${reel.chef}` : `Following ${reel.chef}`);
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  return (
    <div className="reel-slide">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video}
        poster={reel.poster}
        className="reel-slide-video"
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onClick={toggleMute}
      />

      {/* Mute indicator */}
      <button className="reel-mute-btn" onClick={toggleMute}>
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Gradient overlay */}
      <div className="reel-slide-gradient" />

      {/* ─── Right side actions ─── */}
      <div className="reel-side-actions">
        <button className="reel-side-btn" onClick={handleLike}>
          <svg width="26" height="26" viewBox="0 0 24 24"
            fill={liked ? '#ef4444' : 'none'}
            stroke={liked ? '#ef4444' : 'white'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={liked ? 'reel-heart-pop' : ''}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{formatCount(likeCount)}</span>
        </button>

        <button className="reel-side-btn">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{formatCount(reel.comments)}</span>
        </button>

        <button className="reel-side-btn" onClick={handleShare}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* ─── Bottom info ─── */}
      <div className="reel-slide-info">
        {/* Creator */}
        <div className="reel-slide-creator">
          <div className="reel-slide-avatar">{reel.avatar}</div>
          <div className="reel-slide-creator-text">
            <span className="reel-slide-name">{reel.chef}</span>
            <span className="reel-slide-badge">Creator</span>
          </div>
          <button
            className={`reel-slide-follow ${following ? 'following' : ''}`}
            onClick={handleFollow}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Title + description */}
        <h3 className="reel-slide-title">{reel.title}</h3>
        <p className={`reel-slide-desc ${showMore ? 'expanded' : ''}`}>
          {reel.description}
        </p>
        {!showMore && reel.description.length > 60 && (
          <button className="reel-slide-more" onClick={() => setShowMore(true)}>more</button>
        )}

        {/* Tags */}
        <div className="reel-slide-tags">
          {reel.tags.map(tag => <span key={tag}>{tag}</span>)}
        </div>

        {/* Music */}
        <div className="reel-slide-music">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
          <span className="reel-slide-music-text">{reel.music}</span>
          <div className="reel-slide-bars">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────────────────── */
/*  Main Page                                */
/* ───────────────────────────────────────── */
const FoodReels = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  const filteredReels = activeCategory === 'all'
    ? reelsData
    : reelsData.filter(r => r.category === activeCategory);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeCategory]);

  // Snap scroll handler
  const scrollToIndex = useCallback((idx) => {
    if (!containerRef.current || idx < 0 || idx >= filteredReels.length) return;
    isScrolling.current = true;
    setCurrentIndex(idx);
    const el = containerRef.current;
    const slideHeight = el.querySelector('.reel-slide')?.offsetHeight || el.clientHeight;
    el.scrollTo({ top: idx * slideHeight, behavior: 'smooth' });
    setTimeout(() => { isScrolling.current = false; }, 500);
  }, [filteredReels.length]);

  // Wheel handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cooldown = false;
    const handleWheel = (e) => {
      e.preventDefault();
      if (cooldown || isScrolling.current) return;
      cooldown = true;
      if (e.deltaY > 30) {
        scrollToIndex(currentIndex + 1);
      } else if (e.deltaY < -30) {
        scrollToIndex(currentIndex - 1);
      }
      setTimeout(() => { cooldown = false; }, 600);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [currentIndex, scrollToIndex]);

  // Touch handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0;

    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) scrollToIndex(currentIndex + 1);
        else scrollToIndex(currentIndex - 1);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentIndex, scrollToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') scrollToIndex(currentIndex + 1);
      if (e.key === 'ArrowUp' || e.key === 'k') scrollToIndex(currentIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, scrollToIndex]);

  return (
    <div className="reels-page-wrapper">
      {/* ─── Header bar ─── */}
      <div className="reels-header">
        <button className="reels-back-btn" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="reels-header-title">Reels</h1>

        <div className="reels-header-filters">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`reels-pill ${activeCategory === cat.key ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="reels-header-counter">
          {currentIndex + 1} / {filteredReels.length}
        </div>
      </div>

      {/* ─── Reel viewer (phone-sized container) ─── */}
      <div className="reels-viewer-area">
        {filteredReels.length === 0 ? (
          <div className="reels-empty">
            <p>No reels in this category yet</p>
            <button onClick={() => setActiveCategory('all')} className="reels-pill active">
              Show all reels
            </button>
          </div>
        ) : (
          <div className="reels-phone-frame">
            <div className="reels-scroll-container" ref={containerRef}>
              {filteredReels.map((reel, i) => (
                <ReelCard key={reel.id} reel={reel} isActive={i === currentIndex} />
              ))}
            </div>

            {/* Progress dots */}
            {filteredReels.length > 1 && (
              <div className="reels-dots">
                {filteredReels.map((_, i) => (
                  <button
                    key={i}
                    className={`reels-dot ${currentIndex === i ? 'active' : ''}`}
                    onClick={() => scrollToIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation arrows */}
        {filteredReels.length > 1 && (
          <div className="reels-nav-arrows">
            <button
              className="reels-nav-arrow"
              disabled={currentIndex === 0}
              onClick={() => scrollToIndex(currentIndex - 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              className="reels-nav-arrow"
              disabled={currentIndex === filteredReels.length - 1}
              onClick={() => scrollToIndex(currentIndex + 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodReels;

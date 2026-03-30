import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/landing.css';

gsap.registerPlugin(ScrollTrigger);

const THEME_STORAGE_KEY = 'yumzo-theme';

const formatIstTime = () => (
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())
);

const formatIstTimeWithOffset = (offsetMinutes = 0) => {
  const withOffset = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(withOffset);
};

const stats = [
  { value: '120K+', label: 'Monthly Orders' },
  { value: '4.8/5', label: 'Average Rating' },
  { value: '28 min', label: 'Avg Delivery Time' },
  { value: '65+', label: 'Cities Served' },
];

const features = [
  {
    title: 'Live Kitchen Tracking',
    desc: 'Track prep, pickup, and doorstep ETA with minute-by-minute updates.',
  },
  {
    title: 'Group Orders Without Chaos',
    desc: 'Share one link and let everyone add their items before checkout.',
  },
  {
    title: 'Smart Dish Discovery',
    desc: 'Find your next favorite meal with reels, filters, and quick tags.',
  },
  {
    title: 'Reliable Delivery Network',
    desc: 'Driver-aware routing keeps food quality high and delays low.',
  },
];

const steps = [
  {
    title: 'Choose your vibe',
    desc: 'Search by craving, cuisine, or mood and jump into curated menus.',
  },
  {
    title: 'Build your perfect cart',
    desc: 'Customize items, add combos, and split group payments in seconds.',
  },
  {
    title: 'Watch it reach your door',
    desc: 'Get real-time progress until your order is delivered fresh and hot.',
  },
];

const Landing = () => {
  const pageRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const navigate = useNavigate();
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [isTransitioningRoute, setIsTransitioningRoute] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [istTime, setIstTime] = useState(formatIstTime);

  const isDarkTheme = theme === 'dark';

  const navigateWithTransition = (path) => {
    if (isTransitioningRoute) return;

    if (reduceMotionRef.current) {
      navigate(path);
      return;
    }

    setIsTransitioningRoute(true);

    const transitionTimeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => navigate(path),
    });

    transitionTimeline
      .set('.landing-route-transition', { display: 'block' })
      .fromTo('.landing-route-transition', { yPercent: 100 }, { yPercent: 0, duration: 0.62 })
      .to('.landing-page-inner', { y: -28, autoAlpha: 0, duration: 0.4 }, '<+0.02');
  };

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reduceMotionRef.current = reducedMotion;

    if (reducedMotion) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const preloaderTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => setShowPreloader(false),
      });

      preloaderTimeline
        .from('.landing-preloader-logo', { y: 18, autoAlpha: 0, duration: 0.5 })
        .from('.landing-preloader-copy', { y: 14, autoAlpha: 0, duration: 0.35 }, '-=0.25')
        .from('.landing-preloader-track', { scaleX: 0, transformOrigin: 'left center', duration: 0.8 }, '-=0.12')
        .to('.landing-preloader-fill', { width: '100%', duration: 1.05, ease: 'power2.inOut' }, '-=0.8')
        .to('.landing-preloader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '+=0.1');

      const introTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.24,
      });

      introTimeline
        .from('.landing-nav', { y: -24, autoAlpha: 0, duration: 0.65 })
        .from('.landing-hero-kicker', { y: 22, autoAlpha: 0, duration: 0.45 }, '-=0.35')
        .from('.landing-hero-title', { y: 34, autoAlpha: 0, duration: 0.7 }, '-=0.18')
        .from('.landing-hero-copy', { y: 22, autoAlpha: 0, duration: 0.5 }, '-=0.45')
        .from('.landing-hero-actions > *', { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.1 }, '-=0.35')
        .from('.landing-stat', { y: 24, autoAlpha: 0, duration: 0.45, stagger: 0.08 }, '-=0.22');

      const buildSectionTimeline = ({ section, heading, cards, direction = 'left', start = 'top 78%' }) => {
        const xValue = direction === 'left' ? -36 : 36;
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: section,
            start,
          },
        });

        timeline
          .from(heading, { y: 30, autoAlpha: 0, duration: 0.6 })
          .from(cards, {
            x: xValue,
            y: 18,
            scale: 0.985,
            autoAlpha: 0,
            duration: 0.52,
            stagger: 0.08,
          }, '-=0.35');

        return timeline;
      };

      buildSectionTimeline({
        section: '.landing-section-features',
        heading: '.landing-features-heading',
        cards: '.landing-feature-item',
        direction: 'left',
      });

      buildSectionTimeline({
        section: '.landing-section-steps',
        heading: '.landing-steps-heading',
        cards: '.landing-step-item',
        direction: 'right',
      });

      buildSectionTimeline({
        section: '.landing-section-testimonials',
        heading: '.landing-testimonials-heading',
        cards: '.landing-quote-item',
        direction: 'left',
      });

      const finalCtaTimeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '.landing-section-final',
          start: 'top 80%',
        },
      });

      finalCtaTimeline
        .from('.landing-final-heading', { y: 34, autoAlpha: 0, duration: 0.65 })
        .from('.landing-final-copy', { y: 22, autoAlpha: 0, duration: 0.5 }, '-=0.34')
        .from('.landing-final-actions > *', {
          y: 16,
          autoAlpha: 0,
          duration: 0.45,
          stagger: 0.1,
        }, '-=0.28');

      gsap.to('.landing-hero-panel', {
        yPercent: -9,
        ease: 'none',
        scrollTrigger: {
          trigger: '.landing-page',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to('.landing-parallax-copy', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.landing-page',
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      });

      const heroPanel = document.querySelector('.landing-hero-panel');
      if (heroPanel && window.innerWidth >= 1024) {
        const moveX = gsap.quickTo(heroPanel, 'x', { duration: 0.8, ease: 'power3.out' });
        const moveY = gsap.quickTo(heroPanel, 'y', { duration: 0.8, ease: 'power3.out' });
        const tiltX = gsap.quickTo(heroPanel, 'rotateX', { duration: 0.8, ease: 'power3.out' });
        const tiltY = gsap.quickTo(heroPanel, 'rotateY', { duration: 0.8, ease: 'power3.out' });

        const handleMouseMove = (event) => {
          const xRatio = (event.clientX / window.innerWidth) * 2 - 1;
          const yRatio = (event.clientY / window.innerHeight) * 2 - 1;

          moveX(xRatio * 9);
          moveY(yRatio * 6);
          tiltX(yRatio * -2.2);
          tiltY(xRatio * 2.4);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }

      return undefined;
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useLayoutEffect(() => {
    const timer = window.setInterval(() => {
      setIstTime(formatIstTime());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main ref={pageRef} className={`landing-page min-h-screen ${isDarkTheme ? 'landing-theme-dark text-[#F5F5F5]' : 'text-[#141414]'}`}>
      <div className="landing-route-transition" aria-hidden="true" />

      {showPreloader ? (
        <div className="landing-preloader" role="status" aria-label="Loading Yumzo landing page">
          <div className="landing-preloader-inner">
            <img
              src="/images/yumzo-logo.svg"
              alt="Yumzo"
              className="landing-preloader-logo h-11 w-auto"
              loading="eager"
            />
            <p className="landing-preloader-copy mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B5A3C]">
              Preparing your experience
            </p>
            <div className="landing-preloader-track mt-4">
              <span className="landing-preloader-fill" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="landing-bg" aria-hidden="true" />

      <div className="landing-page-inner mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <header className="landing-nav relative z-10 flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <img src="/images/yumzo-logo.svg" alt="Yumzo" className="h-10 w-auto" loading="eager" />
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#4A4A4A] md:flex">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it works</a>
            <a href="#testimonials" className="landing-nav-link">Loved by teams</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
              className="landing-theme-toggle rounded-xl border border-[#D6D4CD] bg-white px-3 py-2 text-xs font-semibold text-[#2A2A2A] transition-colors hover:border-[#BFB8A8]"
              title="Toggle theme"
            >
              {isDarkTheme ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={() => navigateWithTransition('/login')}
              className="landing-login-btn rounded-xl border border-[#D6D4CD] bg-white px-4 py-2 text-sm font-semibold text-[#2A2A2A] transition-colors hover:border-[#C2BFB6]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigateWithTransition('/signup')}
              className="landing-signup-btn rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#242424]"
            >
              Get started
            </button>
          </div>
        </header>

        <section className="landing-parallax-copy relative z-10 mt-10 grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <p className="landing-hero-kicker inline-flex items-center rounded-full border border-[#D8D3C5] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6848]">
              Modern food delivery, made practical
            </p>
            <h1 className="landing-hero-title mt-5 font-['Space_Grotesk'] text-4xl font-semibold leading-[1.05] text-[#111111] sm:text-5xl lg:text-6xl">
              A food ordering experience that feels crafted, not templated.
            </h1>
            <p className="landing-hero-copy mt-5 max-w-xl text-base leading-relaxed text-[#4F4F4F] sm:text-lg">
              Yumzo blends discovery, ordering, and live delivery into one smooth flow.
              From solo cravings to office group orders, every step is designed to feel fast and human.
            </p>

            <div className="landing-hero-actions mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigateWithTransition('/signup')}
                className="landing-cta-primary inline-flex items-center gap-2 rounded-xl bg-[#EE6A2C] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#E45D1F]"
              >
                Start ordering now
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => navigateWithTransition('/login')}
                className="landing-cta-secondary inline-flex items-center gap-2 rounded-xl border border-[#D6D4CD] bg-white px-5 py-3 text-sm font-semibold text-[#2A2A2A] transition-colors hover:border-[#BFB8A8]"
              >
                Explore your account
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="landing-stat rounded-2xl border border-[#E2DED2] bg-white/85 p-3 shadow-[0_10px_22px_rgba(64,42,11,0.07)]">
                  <p className="text-lg font-semibold text-[#1D1D1D]">{item.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#6A6A6A]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-reveal landing-hero-panel overflow-hidden rounded-3xl p-5 sm:p-6">
            <div className="rounded-2xl border border-[#242424] bg-[#171717] p-4 text-white sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A6A6A6]">Live order pulse</span>
                <div className="flex items-center gap-2">
                  <span className="landing-ist-time rounded-full border border-[#2F2F2F] bg-[#101010] px-2.5 py-1 text-[11px] font-semibold text-[#C8C8C8]">
                    {istTime} IST
                  </span>
                  <span className="rounded-full bg-[#233E2D] px-2.5 py-1 text-[11px] font-semibold text-[#9FE2B3]">On time</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Smoky Paneer Wrap', etaMinutes: 11, status: 'Kitchen prep' },
                  { name: 'Seoul Bowl Combo', etaMinutes: 18, status: 'Driver assigned' },
                  { name: 'Chili Garlic Noodles', etaMinutes: 24, status: 'Order placed' },
                ].map((order) => (
                  <article key={order.name} className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{order.name}</h3>
                      <span className="text-xs font-medium text-[#B8B8B8]">IST {formatIstTimeWithOffset(order.etaMinutes)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#8E8E8E]">{order.status}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[#2F2F2F] bg-[#0F0F0F] p-3">
                <p className="text-xs text-[#A7A7A7]">Trending now</p>
                <p className="mt-1 text-sm font-semibold text-white">Street-style bowls and biryani platters</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section-features mt-18">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div className="landing-features-heading">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C7756]">Why teams choose Yumzo</p>
              <h2 className="mt-1 font-['Space_Grotesk'] text-3xl font-semibold text-[#121212] sm:text-4xl">Built for speed, clarity, and trust</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="landing-feature-card landing-feature-item rounded-2xl border border-[#E6E0D3] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141414]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="landing-section-steps mt-18 rounded-3xl border border-[#E3DDCE] bg-white/75 p-5 sm:p-6">
          <div className="landing-steps-heading flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#181818] sm:text-4xl">How ordering flows in Yumzo</h2>
            <span className="rounded-full border border-[#D8D2C2] bg-[#F7F2E8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#7C6644]">
              Less friction, more flavor
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="landing-step landing-step-item rounded-2xl border border-[#E7E2D7] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9A825F]">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#1E1E1E]">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5E5E5E]">{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="landing-section-testimonials mt-18">
          <div className="landing-testimonials-heading mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C7756]">Customer voices</p>
            <h2 className="mt-1 font-['Space_Grotesk'] text-3xl font-semibold text-[#121212] sm:text-4xl">Loved by people who order often</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <blockquote className="landing-quote landing-quote-item rounded-2xl border border-[#E2DDCF] bg-white p-5">
              <p className="text-base leading-relaxed text-[#333333]">
                "Yumzo helped our team lunches feel organized for the first time. Group orders are clean and delivery ETA is genuinely accurate."
              </p>
              <footer className="mt-3 text-sm font-semibold text-[#1F1F1F]">Priya Malhotra, Ops Lead</footer>
            </blockquote>

            <blockquote className="landing-quote landing-quote-item rounded-2xl border border-[#E2DDCF] bg-white p-5">
              <p className="text-base leading-relaxed text-[#333333]">
                "The UI feels like it was built by people who actually order food every day. It is smooth, reliable, and easy to trust."
              </p>
              <footer className="mt-3 text-sm font-semibold text-[#1F1F1F]">Arjun Rao, Product Designer</footer>
            </blockquote>
          </div>
        </section>

        <section className="landing-section-final mt-16 rounded-3xl border border-[#E0D9C8] bg-[#181818] p-6 text-white sm:p-8">
          <h2 className="landing-final-heading font-['Space_Grotesk'] text-3xl font-semibold leading-tight sm:text-4xl">
            Launch your next order in under 60 seconds.
          </h2>
          <p className="landing-final-copy mt-3 max-w-2xl text-sm leading-relaxed text-[#C4C4C4] sm:text-base">
            Create your account, discover restaurants near you, and track every delivery in real time.
            Yumzo keeps the entire experience crisp from first click to last bite.
          </p>
          <div className="landing-final-actions mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigateWithTransition('/signup')}
              className="rounded-xl bg-[#EE6A2C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E45D1F]"
            >
              Create free account
            </button>
            <button
              type="button"
              onClick={() => navigateWithTransition('/login')}
              className="rounded-xl border border-[#3A3A3A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#515151]"
            >
              I already have an account
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Landing;

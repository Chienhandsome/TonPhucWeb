'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play} from 'lucide-react';
import {useTranslations} from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';

type BannerSlide = {
  id: string;
  image: string;
  width: number;
  height: number;
  title: string;
  description: string;
  href: string;
};

export default function HomeBanner({slides, heading}: {slides: BannerSlide[]; heading: string}) {
  const t = useTranslations('Banner');
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const plugins = useMemo(() => [
    Autoplay({delay: 6000, playOnInit: false, stopOnInteraction: true, stopOnFocusIn: true,
      stopOnMouseEnter: true, rootNode: root => root.parentElement}),
    Fade({breakpoints: {'(max-width: 600px)': {active: false}}}),
  ], []);
  const [viewportRef, api] = useEmblaCarousel({loop: true, duration: 25, watchFocus: false,
    breakpoints: {'(prefers-reduced-motion: reduce)': {duration: 0}}}, plugins);

  useEffect(() => {
    if (!api) return;
    const autoplay = api.plugins().autoplay;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      syncFocus();
    };
    const syncFocus = () => {
      const index = api.selectedScrollSnap();
      const focusedSlide = api.slideNodes().find(slide => slide.contains(document.activeElement));
      if (focusedSlide && focusedSlide !== api.slideNodes()[index]) {
        api.rootNode().focus({preventScroll: true});
      }
    };
    // Embla emits these events before updating isPlaying(), so use the event itself.
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    const respectMotion = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) autoplay.stop();
    };
    const visibility = () => { if (document.hidden) autoplay.stop(); };
    sync();
    respectMotion();
    api.on('select', sync).on('reInit', sync).on('settle', syncFocus);
    api.on('autoplay:play', onPlay).on('autoplay:stop', onStop);
    if (!preference.matches && !document.hidden) autoplay.play();
    setPlaying(autoplay.isPlaying());
    preference.addEventListener('change', respectMotion);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      api.off('select', sync).off('reInit', sync).off('settle', syncFocus);
      api.off('autoplay:play', onPlay).off('autoplay:stop', onStop);
      preference.removeEventListener('change', respectMotion);
      document.removeEventListener('visibilitychange', visibility);
      autoplay.stop();
    };
  }, [api]);

  const navigate = useCallback((destination: number) => {
    if (!api) return;
    api.plugins().autoplay.stop();
    api.scrollTo((destination + slides.length) % slides.length, reducedMotion);
  }, [api, reducedMotion, slides.length]);

  if (!slides.length) return null;
  return <section className="home-banner" aria-label={t('label')} aria-roledescription={t('carousel')}
    onFocusCapture={() => api?.plugins().autoplay.stop()}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(selected + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    }}>
    <h1 className="sr-only">{heading}</h1>
    <div className="container banner-shell">
      <div className="banner-viewport" ref={viewportRef} id="home-banner-slides" tabIndex={-1}>
        <div className="banner-track">
          {slides.map((slide, index) => <div className="banner-slide" key={slide.id} role="group"
            aria-roledescription={t('slide')} aria-label={t('position', {current: index + 1, total: slides.length})}
            aria-hidden={index !== selected}>
            <Link href={slide.href} className="banner-image-link" tabIndex={index === selected ? 0 : -1}
              aria-label={t('viewSlide', {title: slide.title})} draggable={false}
              onMouseDown={event => event.preventDefault()}>
              <Image src={slide.image} alt={slide.title} width={slide.width} height={slide.height}
                sizes="(max-width: 1236px) calc(100vw - 36px), 1200px" priority={index === 0}
                loading={index === 0 ? undefined : api && (index === selected || index === (selected + 1) % slides.length) ? 'eager' : 'lazy'}
                quality={85} draggable={false}/>
            </Link>
            <div className="banner-caption">
              <div><h2>{slide.title}</h2>
                {slide.description && slide.description !== slide.title && <p>{slide.description}</p>}
              </div>
              <Link href={slide.href} className="banner-cta" tabIndex={index === selected ? 0 : -1}>
                {t('view')}<ArrowUpRight size={17}/>
              </Link>
            </div>
          </div>)}
        </div>
      </div>
      <div className="banner-controls">
        <div className="banner-arrows">
          <button type="button" onClick={() => navigate(selected - 1)} disabled={!api}
            aria-label={t('previous')} aria-controls="home-banner-slides"><ArrowLeft size={18}/></button>
          <button type="button" onClick={() => navigate(selected + 1)} disabled={!api}
            aria-label={t('next')} aria-controls="home-banner-slides"><ArrowRight size={18}/></button>
        </div>
        <div className="banner-dots" aria-label={t('choose')}>
          {slides.map((slide, index) => <button type="button" key={slide.id}
            aria-label={t('goTo', {current: index + 1, title: slide.title})}
            aria-pressed={index === selected} aria-controls="home-banner-slides" disabled={!api}
            onClick={() => navigate(index)}><span/></button>)}
        </div>
        <button type="button" className="banner-playback" disabled={!api}
          aria-label={playing ? t('pause') : t('play')} aria-controls="home-banner-slides"
          onClick={() => {
            const autoplay = api?.plugins().autoplay;
            if (autoplay?.isPlaying()) autoplay.stop();
            else autoplay?.play(reducedMotion);
          }}>
          {playing ? <Pause size={15}/> : <Play size={15}/>}
          <span>{playing ? t('pauseShort') : t('playShort')}</span>
        </button>
      </div>
      <p className="sr-only" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        {t('position', {current: selected + 1, total: slides.length})}: {slides[selected].title}
      </p>
    </div>
  </section>;
}

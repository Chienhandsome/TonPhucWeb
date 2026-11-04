'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
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
  buttonLabel?:string;
};

export default function HomeBanner({slides, heading,delay=6000,autoplayEnabled=true}: {slides: BannerSlide[]; heading: string;delay?:number;autoplayEnabled?:boolean}) {
  const t = useTranslations('Banner');
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const plugins = useMemo(() => [
    Autoplay({delay, playOnInit: false, stopOnInteraction: true, stopOnFocusIn: true,
      stopOnMouseEnter: true, rootNode: root => root.parentElement}),
    Fade({breakpoints: {'(max-width: 600px)': {active: false}}}),
  ], [delay]);
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
      if (preference.matches||!autoplayEnabled) autoplay.stop();
      else if (!document.hidden) autoplay.play();
    };
    const visibility = () => {
      if (document.hidden) autoplay.stop();
      else if (!preference.matches&&autoplayEnabled) autoplay.play();
    };
    sync();
    respectMotion();
    api.on('select', sync).on('reInit', sync).on('settle', syncFocus);
    api.on('autoplay:play', onPlay).on('autoplay:stop', onStop);
    if (!preference.matches && !document.hidden&&autoplayEnabled) autoplay.play();
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
  }, [api,autoplayEnabled]);

  const navigate = useCallback((destination: number) => {
    if (!api) return;
    api.plugins().autoplay.reset();
    api.scrollTo((destination + slides.length) % slides.length, reducedMotion);
  }, [api, reducedMotion, slides.length]);

  const resume = (root: HTMLElement) => {
    if (autoplayEnabled&&!reducedMotion && !document.hidden && !root.matches(':hover') && !root.contains(document.activeElement)) {
      api?.plugins().autoplay.play();
    }
  };

  if (!slides.length) return null;
  return <section className="home-banner" aria-label={t('label')} aria-roledescription={t('carousel')}
    onFocusCapture={() => api?.plugins().autoplay.stop()}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resume(event.currentTarget); }}
    onMouseLeave={event => resume(event.currentTarget)}
    onPointerUp={event => resume(event.currentTarget)}
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
                {slide.buttonLabel||t('view')}<ArrowUpRight size={17}/>
              </Link>
            </div>
          </div>)}
        </div>
      </div>
      <div className="banner-controls">
        <div className="banner-dots" aria-label={t('choose')}>
          {slides.map((slide, index) => <button type="button" key={slide.id}
            aria-label={t('goTo', {current: index + 1, title: slide.title})}
            aria-pressed={index === selected} aria-controls="home-banner-slides" disabled={!api}
            onClick={() => navigate(index)}><span/></button>)}
        </div>
      </div>
      <p className="sr-only" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        {t('position', {current: selected + 1, total: slides.length})}: {slides[selected].title}
      </p>
    </div>
  </section>;
}

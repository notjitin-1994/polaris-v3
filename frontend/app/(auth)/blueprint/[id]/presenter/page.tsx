/**
 * Presenter View Page
 * Dedicated page for presenter view window
 */

'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { PresenterViewWindow } from '@/components/blueprint/viewer/presenter/PresenterViewWindow';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Blueprint } from '@/lib/ollama/schema';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SlideData {
  id: string;
  title: string;
  notes: string;
  colorTheme: {
    primary: string;
    light: string;
    dark: string;
    bg: string;
    border: string;
    glow: string;
  };
}

export default function PresenterPage({ params }: PageProps) {
  const { id } = use(params);
  const [blueprintData, setBlueprintData] = useState<Blueprint | null>(null);
  const [slidesData, setSlidesData] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch blueprint data and slides
  useEffect(() => {
    const fetchBlueprint = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('blueprint_generator')
        .select('blueprint_json, status')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Failed to fetch blueprint:', error);
        setLoading(false);
        return;
      }

      setBlueprintData(data.blueprint_json);

      // Try to load slides data from sessionStorage
      try {
        const storedSlides = sessionStorage.getItem(`presenter-slides-${id}`);
        if (storedSlides) {
          const slides = JSON.parse(storedSlides) as SlideData[];
          setSlidesData(slides);
          setTotalSlides(slides.length);
        } else {
          // Fallback: calculate from blueprint structure
          const sections = Object.keys(data.blueprint_json || {}).filter(
            (key) => key !== 'metadata'
          );
          setTotalSlides(sections.length + 1);
        }
      } catch (error) {
        console.error('Failed to parse slides data:', error);
        // Fallback calculation
        const sections = Object.keys(data.blueprint_json || {}).filter((key) => key !== 'metadata');
        setTotalSlides(sections.length + 1);
      }

      setLoading(false);
    };

    fetchBlueprint();
  }, [id]);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'SLIDE_CHANGE') {
        setCurrentSlide(event.data.slide);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send slide changes back to parent
  const handleSlideChange = (slide: number) => {
    setCurrentSlide(slide);

    if (window.opener) {
      window.opener.postMessage({ type: 'PRESENTER_SLIDE_CHANGE', slide }, window.location.origin);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-lg text-white">Loading presenter view...</p>
        </div>
      </div>
    );
  }

  if (!blueprintData) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-white">Failed to load blueprint</p>
        </div>
      </div>
    );
  }

  return (
    <PresenterViewWindow
      blueprintData={blueprintData}
      slidesData={slidesData}
      currentSlide={currentSlide}
      totalSlides={totalSlides}
      onSlideChange={handleSlideChange}
      onClose={() => window.close()}
    />
  );
}

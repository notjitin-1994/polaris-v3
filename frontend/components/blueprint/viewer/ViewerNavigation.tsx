/**
 * Smart Navigation System
 * Mini-map, breadcrumbs, and section navigation
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Map,
  Compass,
  BookOpen,
  Target,
  Users,
  DollarSign,
  Calendar,
  Shield,
  TrendingUp,
  FileText,
  Leaf,
} from 'lucide-react';
import {
  glassCard,
  glassPanel,
  itemAnimations,
  microInteractions,
  cn,
  typographyPresets,
  elevation,
} from '@/lib/design-system';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface ViewerNavigationProps {
  sections: Section[];
  activeSection: string | null;
  onNavigate: (sectionId: string) => void;
  showMinimap: boolean;
}

// Icon mapping for section types
const sectionIcons: Record<string, React.ElementType> = {
  objectives: Target,
  target_audience: Users,
  resources: DollarSign,
  timeline: Calendar,
  risks: Shield,
  metrics: TrendingUp,
  strategy: FileText,
  sustainability: Leaf,
  default: BookOpen,
};

export function ViewerNavigation({
  sections,
  activeSection,
  onNavigate,
  showMinimap,
}: ViewerNavigationProps): React.JSX.Element {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for section visibility
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          setVisibleSections((prev) => {
            const newSet = new Set(prev);
            if (entry.isIntersecting) {
              newSet.add(sectionId);
            } else {
              newSet.delete(sectionId);
            }
            return newSet;
          });
        });
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0.1,
      }
    );

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  // Get current section based on visibility
  const currentSection = sections.find((s) => visibleSections.has(s.id)) || sections[0];

  // Get breadcrumb path
  const breadcrumbPath = activeSection
    ? sections.slice(0, sections.findIndex((s) => s.id === activeSection) + 1)
    : [currentSection].filter(Boolean);

  return (
    <>
      {/* Sticky Breadcrumbs */}
      <motion.nav
        variants={itemAnimations.fadeInUp}
        className={cn(
          glassPanel.header,
          'sticky top-16 z-30 border-b border-white/5',
          'backdrop-blur-xl backdrop-saturate-150'
        )}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <motion.span
                {...microInteractions.buttonHover}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 whitespace-nowrap',
                  'text-text-secondary hover:text-foreground text-sm',
                  'cursor-pointer transition-colors'
                )}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Overview</span>
              </motion.span>

              <AnimatePresence mode="popLayout">
                {breadcrumbPath.map((section, index) => {
                  const Icon = sectionIcons[section.id] || sectionIcons.default;

                  return (
                    <React.Fragment key={section.id}>
                      <ChevronRight className="text-text-disabled h-3.5 w-3.5" />
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => onNavigate(section.id)}
                        onMouseEnter={() => setHoveredSection(section.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        className={cn(
                          'group relative flex items-center gap-1.5 px-2 py-1 whitespace-nowrap',
                          'rounded-md text-sm transition-colors',
                          currentSection?.id === section.id
                            ? 'text-primary font-medium'
                            : 'text-text-secondary hover:text-foreground'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{section.title}</span>

                        {/* Hover preview */}
                        {hoveredSection === section.id && index < breadcrumbPath.length - 1 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                              glassCard.premium,
                              elevation.xl,
                              'absolute top-full left-0 mt-2 w-64 p-4'
                            )}
                          >
                            <h4 className="text-foreground mb-2 font-medium">{section.title}</h4>
                            <p className="text-text-secondary line-clamp-3 text-xs">
                              Click to navigate to this section
                            </p>
                          </motion.div>
                        )}
                      </motion.button>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Mini-map toggle */}
            <motion.button
              {...microInteractions.buttonPress}
              onClick={() => {
                // Mini-map toggle will be handled by parent component
              }}
              className={cn(
                'flex h-8 items-center gap-2 rounded-lg px-3',
                'text-sm font-medium',
                showMinimap
                  ? 'bg-primary/20 text-primary border-primary/30 border'
                  : 'text-text-secondary hover:text-foreground hover:bg-white/5',
                'transition-all'
              )}
            >
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mini-map Overlay */}
      <AnimatePresence>
        {showMinimap && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(glassCard.premium, elevation.xl, 'fixed top-32 right-6 z-40 w-48 p-4')}
          >
            <h3 className={cn(typographyPresets.labelText, 'text-foreground mb-3')}>
              Document Map
            </h3>

            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = sectionIcons[section.id] || sectionIcons.default;
                const isActive = currentSection?.id === section.id;
                const isVisible = visibleSections.has(section.id);

                return (
                  <motion.button
                    key={section.id}
                    onClick={() => onNavigate(section.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5',
                      'text-xs transition-all',
                      isActive
                        ? 'bg-primary/20 text-primary font-medium'
                        : isVisible
                          ? 'text-foreground hover:bg-white/5'
                          : 'text-text-disabled hover:text-text-secondary hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate text-left">{section.title}</span>

                    {/* Progress indicator */}
                    <div className="ml-auto h-1.5 w-1.5 flex-shrink-0">
                      {isActive && (
                        <motion.div
                          layoutId="minimapIndicator"
                          className="bg-primary h-full w-full rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Visual progress bar */}
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="from-primary to-secondary h-full bg-gradient-to-r"
                initial={{ width: 0 }}
                animate={{
                  width: `${((sections.findIndex((s) => s.id === currentSection?.id) + 1) / sections.length) * 100}%`,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

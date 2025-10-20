/**
 * Color Theme Provider
 * Applies section-specific color themes to infographic components via CSS variables
 */

'use client';

import React from 'react';

interface ColorTheme {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
  glow: string;
}

interface ColorThemeProviderProps {
  colorTheme: ColorTheme;
  children: React.ReactNode;
}

export function ColorThemeProvider({
  colorTheme,
  children,
}: ColorThemeProviderProps): React.JSX.Element {
  const themeId = `theme-${colorTheme.primary.replace(/[^\w]/g, '')}`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Keep body text white - HIGHEST PRIORITY */
          .${themeId} p,
          .${themeId} p.text-foreground,
          .${themeId} .text-body,
          .${themeId} div:not([class*="text-primary"]) > span,
          .${themeId} .text-sm:not(.text-primary):not([class*="text-primary"]),
          .${themeId} .text-xs:not(.text-primary):not([class*="text-primary"]),
          .${themeId} .text-base:not(.text-primary):not([class*="text-primary"]) {
            color: white !important;
          }
          
          .${themeId} .text-text-secondary,
          .${themeId} .text-foreground.text-text-secondary {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          .${themeId} .text-white {
            color: white !important;
          }
          
          /* Headings use accent color */
          .${themeId} h1,
          .${themeId} h2,
          .${themeId} h3,
          .${themeId} h4,
          .${themeId} h5,
          .${themeId} h6 {
            color: ${colorTheme.primary} !important;
          }
          
          /* Semantic heading classes */
          .${themeId} .text-heading,
          .${themeId} .text-title {
            color: ${colorTheme.primary} !important;
          }
          
          /* Primary color class - for explicit accent elements ONLY */
          .${themeId} .text-primary,
          .${themeId} span.text-primary,
          .${themeId} div.text-primary {
            color: ${colorTheme.primary} !important;
          }
          
          /* Uppercase labels and badges - keep accent color */
          .${themeId} [class*="uppercase"].text-primary,
          .${themeId} [class*="tracking-wider"].text-primary {
            color: ${colorTheme.primary} !important;
          }
          .${themeId} .bg-primary\\/20,
          .${themeId} .bg-primary\\/10,
          .${themeId} .bg-primary\\/5,
          .${themeId} [class*="bg-primary/"] {
            background-color: ${colorTheme.bg} !important;
          }
          .${themeId} .border-primary,
          .${themeId} .border-primary\\/30,
          .${themeId} .border-primary\\/20,
          .${themeId} .border-primary\\/50,
          .${themeId} [class*="border-primary/"] {
            border-color: ${colorTheme.border} !important;
          }
          .${themeId} .from-primary,
          .${themeId} [class*="from-primary"] {
            --tw-gradient-from: ${colorTheme.primary} !important;
            --tw-gradient-from-position: ;
            --tw-gradient-to: ${colorTheme.primary}00 !important;
            --tw-gradient-to-position: ;
            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
          }
          .${themeId} .to-primary,
          .${themeId} [class*="to-primary"] {
            --tw-gradient-to: ${colorTheme.primary} !important;
          }
          .${themeId} .via-primary {
            --tw-gradient-via: ${colorTheme.primary} !important;
          }
          
          /* Hover states */
          .${themeId} .hover\\:text-primary:hover,
          .${themeId} .hover\\:border-primary:hover,
          .${themeId} [class*="hover:border-primary"]:hover {
            color: ${colorTheme.primary} !important;
            border-color: ${colorTheme.primary} !important;
          }
          
          /* Success/Secondary mapped to light variant - icons and accents only */
          .${themeId} svg.text-success,
          .${themeId} [class*="text-success"]:not(p):not(span) {
            color: ${colorTheme.light} !important;
          }
          .${themeId} .bg-success\\/20,
          .${themeId} [class*="bg-success/"] {
            background-color: ${colorTheme.bg} !important;
          }
          .${themeId} svg.text-secondary,
          .${themeId} [class*="text-secondary"]:has(svg) {
            color: ${colorTheme.light} !important;
          }
          .${themeId} .from-secondary,
          .${themeId} [class*="from-secondary"] {
            --tw-gradient-from: ${colorTheme.light} !important;
            --tw-gradient-from-position: ;
            --tw-gradient-to: ${colorTheme.light}00 !important;
            --tw-gradient-to-position: ;
            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
          }
          .${themeId} .to-secondary,
          .${themeId} [class*="to-secondary"] {
            --tw-gradient-to: ${colorTheme.light} !important;
          }
          
          /* Warning mapped to dark variant for contrast */
          .${themeId} .text-warning {
            color: ${colorTheme.dark} !important;
          }
          .${themeId} .bg-warning\\/20,
          .${themeId} .bg-warning\\/5,
          .${themeId} .border-warning\\/30,
          .${themeId} [class*="bg-warning/"],
          .${themeId} [class*="border-warning/"] {
            background-color: ${colorTheme.bg} !important;
            border-color: ${colorTheme.border} !important;
          }
          
          /* Icon colors */
          .${themeId} svg.text-primary,
          .${themeId} svg[class*="text-primary"] {
            color: ${colorTheme.primary} !important;
          }
          
          /* Drop shadow glows */
          .${themeId} [class*="drop-shadow-glow"],
          .${themeId} .drop-shadow-glow {
            filter: drop-shadow(0 0 8px ${colorTheme.glow}) !important;
          }
          
          /* Shadows with color */
          .${themeId} [class*="shadow-primary"] {
            --tw-shadow-color: ${colorTheme.glow} !important;
          }
          
          /* Hover backgrounds and borders */
          .${themeId} .hover\\:bg-primary\\/20:hover,
          .${themeId} .hover\\:bg-primary\\/10:hover,
          .${themeId} [class*="hover:bg-primary/"]:hover {
            background-color: ${colorTheme.bg} !important;
          }
          .${themeId} .hover\\:border-primary\\/50:hover,
          .${themeId} .hover\\:border-primary\\/30:hover,
          .${themeId} [class*="hover:border-primary/"]:hover {
            border-color: ${colorTheme.border} !important;
          }
          
          /* Ring colors for focus states */
          .${themeId} [class*="ring-primary"] {
            --tw-ring-color: ${colorTheme.border} !important;
          }
          
          /* SVG fill colors */
          .${themeId} svg [fill*="primary"],
          .${themeId} [fill*="#a7dada"],
          .${themeId} svg [fill="#a7dadb"],
          .${themeId} svg [fill="#7bc5c7"],
          .${themeId} svg [fill="#d0edf0"],
          .${themeId} svg [fill="#5ba0a2"],
          .${themeId} svg path[fill],
          .${themeId} svg rect[fill],
          .${themeId} svg circle[fill] {
            fill: ${colorTheme.primary} !important;
          }
          .${themeId} svg [stroke*="primary"],
          .${themeId} svg path[stroke],
          .${themeId} svg line[stroke] {
            stroke: ${colorTheme.primary} !important;
          }
          
          /* Recharts-specific overrides - COMPREHENSIVE */
          .${themeId} .recharts-wrapper .recharts-pie-sector,
          .${themeId} .recharts-pie .recharts-pie-sector,
          .${themeId} path.recharts-pie-sector {
            fill: ${colorTheme.primary} !important;
            opacity: 0.85 !important;
          }
          .${themeId} .recharts-wrapper .recharts-pie-sector:nth-child(even),
          .${themeId} path.recharts-pie-sector:nth-child(even) {
            fill: ${colorTheme.light} !important;
            opacity: 0.75 !important;
          }
          .${themeId} .recharts-wrapper .recharts-pie-sector:nth-child(3n),
          .${themeId} path.recharts-pie-sector:nth-child(3n) {
            fill: ${colorTheme.dark} !important;
            opacity: 0.65 !important;
          }
          
          .${themeId} .recharts-wrapper .recharts-bar-rectangle path,
          .${themeId} .recharts-bar path {
            fill: ${colorTheme.primary} !important;
          }
          .${themeId} .recharts-wrapper .recharts-bar:nth-child(even) .recharts-bar-rectangle path,
          .${themeId} .recharts-bar:nth-child(even) path {
            fill: ${colorTheme.light} !important;
          }
          .${themeId} .recharts-wrapper .recharts-bar:nth-child(3n) .recharts-bar-rectangle path,
          .${themeId} .recharts-bar:nth-child(3n) path {
            fill: ${colorTheme.dark} !important;
          }
          
          /* All recharts paths default to section color */
          .${themeId} .recharts-wrapper path,
          .${themeId} .recharts-surface path {
            fill: ${colorTheme.primary} !important;
            stroke: ${colorTheme.primary} !important;
          }
          
          .${themeId} .recharts-line .recharts-line-curve,
          .${themeId} .recharts-curve {
            stroke: ${colorTheme.primary} !important;
            stroke-width: 2px !important;
          }
          .${themeId} .recharts-dot circle {
            fill: ${colorTheme.primary} !important;
            stroke: ${colorTheme.light} !important;
          }
          .${themeId} .recharts-area .recharts-area-area {
            fill: ${colorTheme.primary} !important;
            opacity: 0.3 !important;
          }
          .${themeId} .recharts-area .recharts-area-curve {
            stroke: ${colorTheme.primary} !important;
          }
          
          /* Chart text and labels */
          .${themeId} .recharts-text,
          .${themeId} .recharts-label,
          .${themeId} .recharts-cartesian-axis-tick-value {
            fill: rgba(255, 255, 255, 0.6) !important;
          }
          .${themeId} .recharts-text tspan {
            fill: rgba(255, 255, 255, 0.6) !important;
          }
          
          /* Chart grid lines and axes */
          .${themeId} .recharts-cartesian-grid line,
          .${themeId} .recharts-cartesian-axis line {
            stroke: ${colorTheme.border} !important;
            opacity: 0.2;
          }
          
          /* Chart tooltips */
          .${themeId} .recharts-tooltip-wrapper .recharts-default-tooltip {
            background-color: rgba(0, 0, 0, 0.8) !important;
            border-color: ${colorTheme.border} !important;
          }
          .${themeId} .recharts-tooltip-item {
            color: ${colorTheme.primary} !important;
          }
          
          /* Linear gradients in SVG */
          .${themeId} svg linearGradient stop:first-child,
          .${themeId} svg linearGradient stop:nth-child(1) {
            stop-color: ${colorTheme.primary} !important;
          }
          .${themeId} svg linearGradient stop:last-child,
          .${themeId} svg linearGradient stop:nth-child(2) {
            stop-color: ${colorTheme.light} !important;
          }
          
          /* Radial gradients */
          .${themeId} svg radialGradient stop {
            stop-color: ${colorTheme.primary} !important;
          }
          
          /* All SVG shapes - comprehensive hex color targeting */
          .${themeId} svg [fill="#a7dadb"],
          .${themeId} svg [fill="#7bc5c7"],
          .${themeId} svg [fill="#d0edf0"],
          .${themeId} svg [fill="#5ba0a2"],
          .${themeId} svg [fill="#4F46E5"],
          .${themeId} svg [fill="#7C69F5"],
          .${themeId} svg [fill="#8884d8"],
          .${themeId} svg [fill="#0ea5e9"],
          .${themeId} svg [fill="#8b5cf6"],
          .${themeId} svg [fill="#ec4899"],
          .${themeId} svg [fill="#f59e0b"],
          .${themeId} svg [fill="#10b981"],
          .${themeId} svg [fill="#3b82f6"],
          .${themeId} svg [fill="#06b6d4"],
          .${themeId} svg [fill="#14b8a6"] {
            fill: ${colorTheme.primary} !important;
          }
          
          /* SVG strokes */
          .${themeId} svg [stroke="#a7dadb"],
          .${themeId} svg [stroke*="#"],
          .${themeId} svg line,
          .${themeId} svg polyline {
            stroke: ${colorTheme.primary} !important;
          }
          
          /* SVG circles and rects without specific fill */
          .${themeId} svg circle:not([fill="none"]),
          .${themeId} svg rect:not([fill="none"]) {
            fill: ${colorTheme.primary} !important;
          }
          
          /* Specific component patterns */
          .${themeId} [class*="border-primary-500"],
          .${themeId} [class*="bg-primary-500"] {
            border-color: ${colorTheme.border} !important;
            background-color: ${colorTheme.bg} !important;
          }
          
          /* Progress bars and meters */
          .${themeId} [role="progressbar"],
          .${themeId} .progress-bar {
            background-color: ${colorTheme.bg} !important;
          }
          .${themeId} [role="progressbar"] > div,
          .${themeId} .progress-bar > div {
            background-color: ${colorTheme.primary} !important;
          }
          
          /* Badges and pills */
          .${themeId} .badge,
          .${themeId} [class*="rounded-full"][class*="px-"],
          .${themeId} [class*="inline-flex"][class*="bg-"] {
            /* Targeted via bg-primary classes above */
          }
          
          /* Decorative elements */
          .${themeId} [class*="blur-3xl"] {
            /* Background blurs use the bg color set above */
          }
          
          /* Animated elements - Sparkles, pulsing icons */
          .${themeId} .animate-pulse,
          .${themeId} .animate-pulse svg,
          .${themeId} .animate-pulse * {
            color: ${colorTheme.primary} !important;
            animation-name: pulse-${themeId};
          }
          @keyframes pulse-${themeId} {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          /* Sparkles and decorative icons */
          .${themeId} [class*="Sparkles"],
          .${themeId} svg[class*="animate-pulse"] {
            color: ${colorTheme.primary} !important;
          }
          
          /* Icon backgrounds and containers */
          .${themeId} [class*="rounded-xl"][class*="p-3"]:has(svg),
          .${themeId} [class*="rounded-lg"][class*="p-3"]:has(svg),
          .${themeId} [class*="rounded-full"][class*="p-"]:has(svg) {
            background-color: ${colorTheme.bg} !important;
          }
          
          /* Icon wrapper divs */
          .${themeId} div:has(> svg.lucide),
          .${themeId} div:has(> svg) {
            /* Icons inside will inherit color */
          }
          
          /* Lucide icons with primary color - NUCLEAR OVERRIDE */
          .${themeId} svg.lucide,
          .${themeId} svg.lucide-icon,
          .${themeId} .text-primary svg,
          .${themeId} .text-success svg,
          .${themeId} .text-secondary svg,
          .${themeId} [class*="text-primary"] svg,
          .${themeId} svg {
            color: ${colorTheme.primary} !important;
            stroke: currentColor !important;
          }
          .${themeId} svg path,
          .${themeId} svg.lucide path,
          .${themeId} .lucide path {
            stroke: ${colorTheme.primary} !important;
          }
          
          /* Icons in specific color contexts */
          .${themeId} .text-success svg,
          .${themeId} .text-secondary svg {
            color: ${colorTheme.light} !important;
          }
          .${themeId} .text-warning svg {
            color: ${colorTheme.dark} !important;
          }
          
          /* Override brand teal specifically - ALL instances */
          .${themeId} [style*="rgb(167, 218, 219)"],
          .${themeId} [style*="rgba(167, 218, 219"],
          .${themeId} [style*="#a7dadb"],
          .${themeId} [style*="#a7dada"],
          .${themeId} [class*="text-primary"][style*="color"],
          .${themeId} svg[style*="color"] {
            color: ${colorTheme.primary} !important;
          }
          
          /* Override teal in backgrounds */
          .${themeId} [style*="background"][style*="167, 218, 219"],
          .${themeId} [style*="background"][style*="a7dadb"],
          .${themeId} div[style*="backgroundColor"] {
            background-color: ${colorTheme.bg} !important;
          }
          
          /* Override teal in borders */
          .${themeId} [style*="border"][style*="167, 218, 219"],
          .${themeId} [style*="borderColor"] {
            border-color: ${colorTheme.border} !important;
          }
          
          /* Override any inline colors - nuclear option */
          .${themeId} [style*="color: rgb(167"] {
            color: ${colorTheme.primary} !important;
          }
          
          /* Any remaining gradient backgrounds */
          .${themeId} [class*="from-"][class*="to-"],
          .${themeId} .bg-gradient-to-r,
          .${themeId} .bg-gradient-to-br,
          .${themeId} .bg-gradient-to-b {
            background-image: linear-gradient(to bottom right, ${colorTheme.primary}, ${colorTheme.light}) !important;
          }
          
          /* Large numbers and metric values - ALWAYS white for readability */
          .${themeId} .text-4xl,
          .${themeId} .text-3xl,
          .${themeId} .text-2xl,
          .${themeId} [class*="text-4xl"],
          .${themeId} [class*="text-3xl"],
          .${themeId} [class*="text-2xl"] {
            color: white !important;
          }
          
          /* Body text, descriptions, and content - ALWAYS white */
          .${themeId} p:not([class*="text-primary"]),
          .${themeId} .text-base:not(.text-primary),
          .${themeId} [class*="leading-relaxed"],
          .${themeId} [class*="line-clamp"] {
            color: rgba(255, 255, 255, 0.9) !important;
          }
          
          /* Small labels and meta text - light white */
          .${themeId} .text-sm:not(.text-primary):not([class*="font-bold"]):not([class*="font-semibold"]),
          .${themeId} .text-xs:not(.text-primary):not([class*="font-bold"]):not([class*="font-semibold"]) {
            color: rgba(255, 255, 255, 0.7) !important;
          }
          
          /* AGGRESSIVE: Replace ALL variations of brand teal color */
          .${themeId} * {
            /* This is a catch-all - replace computed teal colors */
          }
          
          /* Filter for teal hues and replace with section color */
          .${themeId} .text-primary *,
          .${themeId} [class*="text-primary"] * {
            color: inherit !important;
          }
          
          /* Ensure CountUp components use section color for accent text */
          .${themeId} .text-xl.font-medium,
          .${themeId} .text-xl.text-primary,
          .${themeId} span.text-xl.font-medium,
          .${themeId} span.text-primary.text-xl {
            color: ${colorTheme.primary} !important;
          }
          
          /* Stat card suffixes and accent numbers */
          .${themeId} [class*="text-xl"][class*="text-primary"],
          .${themeId} [class*="text-lg"][class*="text-primary"],
          .${themeId} [class*="font-medium"][class*="text-primary"] {
            color: ${colorTheme.primary} !important;
          }
          
          /* Drop shadows with teal - replace with section color */
          .${themeId} .drop-shadow-glow,
          .${themeId} [class*="drop-shadow"] {
            filter: drop-shadow(0 0 8px ${colorTheme.glow}) !important;
          }
          
          /* Box shadows with teal glow */
          .${themeId} [class*="shadow-primary"],
          .${themeId} .hover\\:shadow-primary:hover {
            box-shadow: 0 10px 40px -10px ${colorTheme.glow} !important;
          }
          
          /* Progress bars and percentages */
          .${themeId} [class*="w-"][class*="%"],
          .${themeId} [class*="h-1"][class*="rounded"],
          .${themeId} [class*="h-2"][class*="rounded"],
          .${themeId} .progress-bar,
          .${themeId} [role="progressbar"] {
            background-color: ${colorTheme.primary} !important;
          }
          
          /* Dots, circles, and indicators */
          .${themeId} [class*="rounded-full"][class*="h-"][class*="w-"]:not([class*="px-"]) {
            background-color: ${colorTheme.primary} !important;
          }
          .${themeId} .rounded-full.border {
            border-color: ${colorTheme.border} !important;
          }
          
          /* Percentage text and numeric accents */
          .${themeId} [class*="font-bold"][class*="text-"][class*="xl"]:not(.text-white):not([class*="text-4xl"]):not([class*="text-3xl"]):not([class*="text-2xl"]) {
            color: ${colorTheme.primary} !important;
          }
          
          /* CheckCircle and success icons */
          .${themeId} .text-success svg.lucide,
          .${themeId} svg.lucide-check-circle,
          .${themeId} svg.lucide-check-circle-2 {
            color: ${colorTheme.light} !important;
          }
          
          /* Calendar, Clock, and timeline icons */
          .${themeId} svg.lucide-calendar,
          .${themeId} svg.lucide-clock,
          .${themeId} .text-primary > svg {
            color: ${colorTheme.primary} !important;
          }
          
          /* FINAL CATCH-ALL: Any element with teal-like colors */
          .${themeId} *[class*="primary"]:not(.text-white):not(p):not([class*="text-4xl"]):not([class*="text-3xl"]):not([class*="text-2xl"]) {
            /* Will be caught by above rules */
          }
          
          /* Numbers and percentages in badge/pill contexts */
          .${themeId} [class*="inline-flex"] [class*="font-bold"],
          .${themeId} [class*="inline-flex"] [class*="font-semibold"],
          .${themeId} [class*="rounded-full"] [class*="font-bold"],
          .${themeId} [class*="rounded-full"] [class*="font-semibold"] {
            /* Let text color inherit from parent */
          }
          
          /* Dividers and separators */
          .${themeId} hr,
          .${themeId} [class*="border-t"],
          .${themeId} [class*="border-b"] {
            border-color: ${colorTheme.border} !important;
          }
          
          /* All text with primary intent that isn't body text */
          .${themeId} :is(h1, h2, h3, h4, h5, h6, .text-heading, .text-title, .text-primary, [class*="font-bold"], [class*="font-semibold"]):not(p *):not(div.text-white *) {
            color: ${colorTheme.primary} !important;
          }
          
          /* Typography with primary semantic meaning */
          .${themeId} .text-sm.font-bold.text-primary,
          .${themeId} .text-sm.font-semibold.text-primary,
          .${themeId} .text-xs.font-bold.text-primary,
          .${themeId} .text-xs.font-semibold.text-primary,
          .${themeId} .uppercase.text-primary,
          .${themeId} .tracking-wider.text-primary {
            color: ${colorTheme.primary} !important;
          }
          
          /* Motion components and animated elements */
          .${themeId} [class*="motion"],
          .${themeId} .motion-div {
            /* Inherit color correctly */
          }
          
          /* Ensure all icon wrappers with bg-primary variants use section color */
          .${themeId} [class*="bg-primary\\/"] {
            background-color: ${colorTheme.bg} !important;
          }
        `,
        }}
      />
      <div className={themeId}>{children}</div>
    </>
  );
}

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

  // Check if this is the light metrics theme
  const isLightMetricsTheme = colorTheme.primary === 'rgb(20, 184, 166)';

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: isLightMetricsTheme
            ? `
          /* LIGHT METRICS THEME - High contrast, legible design */
          
          /* Body text - dark for readability on light backgrounds */
          .${themeId} p,
          .${themeId} p.text-foreground,
          .${themeId} .text-body,
          .${themeId} div:not([class*="text-primary"]) > span,
          .${themeId} .text-sm:not(.text-primary):not([class*="text-primary"]),
          .${themeId} .text-xs:not(.text-primary):not([class*="text-primary"]),
          .${themeId} .text-base:not(.text-primary):not([class*="text-primary"]) {
            color: rgb(17, 24, 39) !important; /* gray-900 */
          }
          
          .${themeId} .text-text-secondary,
          .${themeId} .text-foreground.text-text-secondary {
            color: rgb(75, 85, 99) !important; /* gray-600 */
          }
          
          .${themeId} .text-white {
            color: rgb(17, 24, 39) !important; /* gray-900 */
          }
          
          /* Headings - dark for contrast */
          .${themeId} h1,
          .${themeId} h2,
          .${themeId} h3,
          .${themeId} h4,
          .${themeId} h5,
          .${themeId} h6 {
            color: rgb(17, 24, 39) !important; /* gray-900 */
          }
          
          /* Semantic heading classes */
          .${themeId} .text-heading,
          .${themeId} .text-title {
            color: rgb(17, 24, 39) !important; /* gray-900 */
          }
          
          /* Primary accent color - teal for highlights only */
          .${themeId} .text-primary,
          .${themeId} span.text-primary,
          .${themeId} div.text-primary {
            color: ${colorTheme.primary} !important;
          }
          
          /* Large numbers and metric values - dark for readability */
          .${themeId} .text-4xl,
          .${themeId} .text-3xl,
          .${themeId} .text-2xl,
          .${themeId} [class*="text-4xl"],
          .${themeId} [class*="text-3xl"],
          .${themeId} [class*="text-2xl"] {
            color: rgb(17, 24, 39) !important; /* gray-900 */
          }
          
          /* Backgrounds - light and clean */
          .${themeId} .bg-white {
            background-color: white !important;
          }
          
          .${themeId} .bg-gray-50 {
            background-color: rgb(249, 250, 251) !important;
          }
          
          .${themeId} .bg-gray-100 {
            background-color: rgb(243, 244, 246) !important;
          }
          
          /* Borders - subtle gray */
          .${themeId} .border-gray-200 {
            border-color: rgb(229, 231, 235) !important;
          }
          
          .${themeId} .border-gray-100 {
            border-color: rgb(243, 244, 246) !important;
          }
          
          /* Teal accent backgrounds */
          .${themeId} .bg-teal-50 {
            background-color: rgb(240, 253, 250) !important;
          }
          
          .${themeId} .bg-teal-100 {
            background-color: rgb(204, 251, 241) !important;
          }
          
          .${themeId} .bg-teal-600 {
            background-color: ${colorTheme.primary} !important;
          }
          
          /* Teal accent text */
          .${themeId} .text-teal-600 {
            color: ${colorTheme.primary} !important;
          }
          
          .${themeId} .text-teal-700 {
            color: ${colorTheme.dark} !important;
          }
          
          /* Green success colors */
          .${themeId} .text-green-600 {
            color: rgb(22, 163, 74) !important;
          }
          
          .${themeId} .bg-green-50 {
            background-color: rgb(240, 253, 244) !important;
          }
          
          .${themeId} .bg-green-100 {
            background-color: rgb(220, 252, 231) !important;
          }
          
          /* Progress bars */
          .${themeId} .bg-gray-200 {
            background-color: rgb(229, 231, 235) !important;
          }
          
          /* Shadows - subtle and clean */
          .${themeId} .shadow-sm {
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
          }
          
          .${themeId} .shadow-lg {
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          }
          
          /* Override all glass effects for clean design */
          .${themeId} .glass-card,
          .${themeId} .glass-panel,
          .${themeId} .glass-strong {
            background: white !important;
            backdrop-filter: none !important;
            border: 1px solid rgb(229, 231, 235) !important;
          }
          
          /* Icons inherit text color */
          .${themeId} svg {
            color: currentColor !important;
          }
          `
            : `
          /* DARK THEME - Original implementation */
          
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
          `,
        }}
      />
      <div className={themeId}>{children}</div>
    </>
  );
}

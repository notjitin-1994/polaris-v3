/**
 * Blueprint Viewer Component Exports
 */

export { BlueprintViewer } from './BlueprintViewer';
export { ViewerHeaderSimplified } from './ViewerHeaderSimplified';
export { ViewerSidebarEnhanced } from './ViewerSidebarEnhanced';
export { ViewerContent } from './ViewerContent';
export { CommandPalette } from './CommandPalette';
export { EnhancedMarkdownRenderer } from './EnhancedMarkdownRenderer';
export { PresentationView } from './PresentationView';
export { PresentationControls } from './PresentationControls';
export { PresentationToolbar } from './PresentationToolbar';
export { PresentationSlide } from './PresentationSlide';
export { PresenterNotes } from './PresenterNotes';
export { SlideGridOverview } from './SlideGridOverview';
export { SlidePreview } from './SlidePreview';
export { ColorThemeProvider } from './ColorThemeProvider';
export { FocusMode } from './FocusMode';
export { ViewerErrorBoundary } from './ErrorBoundary';
export { ViewModeDropdown } from './ViewModeDropdown';
export { ActionsMenu } from './ActionsMenu';

// Sidebar sections
export { AIAssistantSection } from './sidebar/AIAssistantSection';
export { ReportsSection } from './sidebar/ReportsSection';
export { AnnotationsSection } from './sidebar/AnnotationsSection';

// Presenter view components
export { 
  PresenterViewWindow, 
  RichTextNotesEditor, 
  DrawingCanvas, 
  LaserPointer, 
  PresenterToolbar 
} from './presenter';

export type { ViewMode, LayoutMode, ViewerState, CustomReport, ReportTheme } from './BlueprintViewer';
export type { PresenterTool, DrawingSettings } from './presenter';

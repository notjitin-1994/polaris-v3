/**
 * Drawing Canvas
 * Full-featured drawing overlay with pen, highlighter, shapes, and eraser
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { PresenterTool, DrawingSettings } from './PresenterViewWindow';

interface DrawingCanvasProps {
  isActive: boolean;
  tool: PresenterTool;
  settings: DrawingSettings;
  onClear: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  tool: PresenterTool;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
}

export function DrawingCanvas({
  isActive,
  tool,
  settings,
  onClear,
}: DrawingCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    redrawCanvas();
  }, []);

  // Redraw all paths
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.globalAlpha = path.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (path.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
      } else if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  // Draw current path
  const drawCurrentPath = () => {
    const canvas = canvasRef.current;
    if (!canvas || currentPath.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas();

    ctx.beginPath();
    ctx.strokeStyle = settings.color;
    ctx.lineWidth = settings.size;
    ctx.globalAlpha = settings.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    currentPath.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  // Draw shape preview
  const drawShapePreview = (end: Point) => {
    if (!shapeStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas();

    ctx.beginPath();
    ctx.strokeStyle = settings.color;
    ctx.lineWidth = settings.size;
    ctx.globalAlpha = settings.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw rectangle
    const width = end.x - shapeStart.x;
    const height = end.y - shapeStart.y;
    ctx.strokeRect(shapeStart.x, shapeStart.y, width, height);

    ctx.globalAlpha = 1;
  };

  // Get mouse position
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || tool === 'none') return;

    const pos = getMousePos(e);
    setIsDrawing(true);

    if (tool === 'shape') {
      setShapeStart(pos);
    } else {
      setCurrentPath([pos]);
    }
  };

  // Mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawing) return;

    const pos = getMousePos(e);

    if (tool === 'shape' && shapeStart) {
      drawShapePreview(pos);
    } else {
      setCurrentPath((prev) => [...prev, pos]);
      drawCurrentPath();
    }
  };

  // Mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawing) return;

    if (tool === 'shape' && shapeStart) {
      const pos = getMousePos(e);

      // Create rectangle path
      const rectPath: Point[] = [
        shapeStart,
        { x: pos.x, y: shapeStart.y },
        pos,
        { x: shapeStart.x, y: pos.y },
        shapeStart,
      ];

      setPaths((prev) => [
        ...prev,
        {
          tool,
          points: rectPath,
          color: settings.color,
          size: settings.size,
          opacity: settings.opacity,
        },
      ]);

      setShapeStart(null);
    } else if (currentPath.length > 0) {
      setPaths((prev) => [
        ...prev,
        {
          tool,
          points: currentPath,
          color: settings.color,
          size: settings.size,
          opacity: settings.opacity,
        },
      ]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    redrawCanvas();
  };

  // Clear canvas
  useEffect(() => {
    if (paths.length === 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [paths]);

  // Update canvas when paths change
  useEffect(() => {
    redrawCanvas();
  }, [paths]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{
        cursor:
          tool === 'eraser'
            ? 'crosshair'
            : tool === 'pen' || tool === 'highlighter'
              ? 'crosshair'
              : tool === 'shape'
                ? 'crosshair'
                : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDrawing) {
          handleMouseUp({} as React.MouseEvent<HTMLCanvasElement>);
        }
      }}
    />
  );
}

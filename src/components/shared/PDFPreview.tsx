'use client';

import { useEffect, useRef, useState } from 'react';

interface PDFPreviewProps {
  url: string;
  className?: string;
}

export function PDFPreview({ url, className = '' }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function renderPDF() {
      if (!canvasRef.current || !containerRef.current) return;

      try {
        setLoading(true);
        setError(null);

        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        const pdfjsVersion = '3.11.174'; // Match the version we installed
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;

        // Get the first page
        const page = await pdf.getPage(1);

        // Prepare canvas for rendering
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Canvas context not available');

        // Calculate scale to fit the container while maintaining aspect ratio
        const viewport = page.getViewport({ scale: 1.0 });
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        // Calculate scale to fit either width or height while maintaining aspect ratio
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Set canvas CSS dimensions
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        // Center the canvas in the container
        canvas.style.position = 'absolute';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';

        // Render the page
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          background: 'rgb(255, 255, 255)',
        };

        if (isMounted) {
          await page.render(renderContext).promise;
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering PDF:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setLoading(false);
        }
      }
    }

    renderPDF();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  );
} 
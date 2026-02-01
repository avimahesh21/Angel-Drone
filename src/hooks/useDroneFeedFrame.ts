"use client";

import { useCallback, useRef, useState } from "react";

const JPEG_QUALITY = 0.85;

export function useDroneFeedFrame(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const getOrCreateCanvas = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    return canvas;
  }, [videoRef]);

  const captureFrame = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      const canvas = getOrCreateCanvas();
      if (!video || !canvas) {
        reject(new Error("Video not ready or no frame available"));
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob from frame"));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    });
  }, [videoRef, getOrCreateCanvas]);

  const setReady = useCallback((ready: boolean) => setIsReady(ready), []);

  return { captureFrame, isReady, setReady };
}

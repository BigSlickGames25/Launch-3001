import { useEffect, useRef } from "react";

export function useGameLoop(
  isRunning: boolean,
  onFrame: (deltaSeconds: number, elapsedSeconds: number) => void
) {
  const onFrameRef = useRef(onFrame);
  const animationFrameRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let lastFrame: number | null = null;

    function frame(now: number) {
      if (lastFrame === null) {
        lastFrame = now;
      }

      const deltaSeconds = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      elapsedRef.current += deltaSeconds;
      onFrameRef.current(deltaSeconds, elapsedRef.current);
      animationFrameRef.current = requestAnimationFrame(frame);
    }

    animationFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);
}


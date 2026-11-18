import { useCallback, useEffect, useRef, useState } from "react";

function formatRemaining(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function useSleepTimer(onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [stopAtEnd, setStopAtEnd] = useState(false);
  const expireRef = useRef(onExpire);
  const startedRef = useRef(false);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  const isCountingDown = secondsLeft > 0;

  useEffect(() => {
    if (!isCountingDown) return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isCountingDown]);

  useEffect(() => {
    if (secondsLeft > 0 || !startedRef.current) return;
    startedRef.current = false;
    expireRef.current?.();
  }, [secondsLeft]);

  const startMinutes = useCallback((minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    startedRef.current = true;
    setStopAtEnd(false);
    setSecondsLeft(Math.round(minutes * 60));
  }, []);

  const startAtEnd = useCallback(() => {
    startedRef.current = false;
    setSecondsLeft(0);
    setStopAtEnd(true);
  }, []);

  const cancel = useCallback(() => {
    startedRef.current = false;
    setSecondsLeft(0);
    setStopAtEnd(false);
  }, []);

  const label = secondsLeft > 0
    ? formatRemaining(secondsLeft)
    : stopAtEnd
      ? "Fin du verset"
      : null;

  return {
    secondsLeft,
    stopAtEnd,
    isActive: secondsLeft > 0 || stopAtEnd,
    label,
    startMinutes,
    startAtEnd,
    cancel,
  };
}

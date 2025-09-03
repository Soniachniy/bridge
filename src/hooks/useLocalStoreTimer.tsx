import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "timer";

const formatTimeLeft = (timeLeft: number) => {
  console.log(timeLeft);
  console.log(timeLeft / (60 * 60 * 1000));
  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
};

export const useLocalStoreTimer = () => {
  const [localTime, setLocalTime] = useState(0);

  const setTimer = () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    );
    setLocalTime(24 * 60 * 59 * 1000);
  };

  const getTimer = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  };

  const clearTimer = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = getTimer();
      if (!deadline) return;
      console.log("deadline", deadline);
      console.log("Date.now()", Date.now());
      console.log(
        "Number(deadline) - Date.now()",
        Number(deadline) - Date.now()
      );
      const timeLeft = Number(deadline) - Date.now();
      if (timeLeft <= 0) {
        clearTimer();
        setLocalTime(0);
        return;
      }
      setLocalTime(timeLeft);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    setTimer,
    getTimer,
    clearTimer,
    timeLeft: localTime,
    timeLeftFormatted: formatTimeLeft(localTime),
  };
};

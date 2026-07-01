import { useState, useEffect, useCallback } from "react";

export function useViewedTracking() {
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("viewed_notifications");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem("viewed_notifications", JSON.stringify(Array.from(viewedIds)));
  }, [viewedIds]);

  const markAsViewed = useCallback((id) => {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return { viewedIds, markAsViewed };
}

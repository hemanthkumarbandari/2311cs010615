import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { logger } from "../utils/logger";

export function useNotifications(params = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNotifications(params);
        const list = data?.notifications || [];
        setNotifications(list);
        setTotal(data?.total || list.length);
        logger.info("Notifications loaded successfully");
      } catch (err) {
        setError(err.message || "Failed to load notifications");
        logger.error("Error in useNotifications hook", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.page, params.limit, params.notification_type]);

  const totalPages = Math.ceil(total / (params.limit || 10)) || 1;

  return { notifications, total, totalPages, loading, error };
}

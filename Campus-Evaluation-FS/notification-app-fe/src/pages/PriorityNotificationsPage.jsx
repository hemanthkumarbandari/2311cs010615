import { useState, useEffect, useMemo } from "react";
import { Alert, Box, CircularProgress, Divider, Stack, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { NotificationCard } from "../components/NotificationCard";
import { fetchNotifications } from "../api/notifications";
import { useViewedTracking } from "../hooks/useViewedTracking";
import { logger } from "../utils/logger";

const WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

export function PriorityNotificationsPage() {
  const [nValue, setNValue] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { viewedIds, markAsViewed } = useViewedTracking();

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNotifications({ page: 1, limit: 100, notification_type: "All" });
        const list = data?.notifications || [];
        
        const sorted = [...list].sort((a, b) => {
          const typeA = a.Type;
          const typeB = b.Type;
          const weightA = WEIGHTS[typeA] || 0;
          const weightB = WEIGHTS[typeB] || 0;
          if (weightA !== weightB) {
            return weightB - weightA;
          }
          return new Date(b.Timestamp) - new Date(a.Timestamp);
        });
        
        setNotifications(sorted);
        logger.info("Priority notifications sorted successfully");
      } catch (err) {
        logger.error("Failed to fetch priority notifications", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const displayList = useMemo(() => notifications.slice(0, nValue), [notifications, nValue]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h6" fontWeight={700}>Priority Notifications</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Top N</InputLabel>
          <Select value={nValue} label="Top N" onChange={(e) => setNValue(e.target.value)}>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}

      {!loading && error && <Alert severity="error" sx={{ mb: 3 }}>Failed to load notifications: {error}</Alert>}

      {!loading && !error && displayList.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>No priority notifications found.</Alert>
      )}

      {!loading && !error && displayList.length > 0 && (
        <Stack spacing={1.5}>
          {displayList.map((n) => (
            <NotificationCard 
              key={n.ID} 
              notification={n} 
              isViewed={viewedIds.has(n.ID)} 
              onRender={markAsViewed} 
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

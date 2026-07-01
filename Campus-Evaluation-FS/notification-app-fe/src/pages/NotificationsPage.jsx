import { useState, useMemo } from "react";
import { Alert, Box, CircularProgress, Divider, Pagination, Stack, Typography } from "@mui/material";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { useViewedTracking } from "../hooks/useViewedTracking";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 10;

  const params = useMemo(() => ({ page, limit, notification_type: filter }), [page, limit, filter]);
  const { notifications, totalPages, loading, error } = useNotifications(params);
  const { viewedIds, markAsViewed } = useViewedTracking();

  const handleFilterChange = (_, newFilter) => {
    if (newFilter) {
      setFilter(newFilter);
      setPage(1);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Typography variant="h6" fontWeight={700}>All Notifications</Typography>
      </Stack>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ mb: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}

      {!loading && error && <Alert severity="error" sx={{ mb: 3 }}>Failed to load notifications: {error}</Alert>}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>No notifications found.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <NotificationCard 
              key={n.ID} 
              notification={n} 
              isViewed={viewedIds.has(n.ID)} 
              onRender={markAsViewed} 
            />
          ))}
        </Stack>
      )}

      {!loading && !error && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}

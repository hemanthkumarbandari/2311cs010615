import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { useEffect, useRef } from "react";

export function NotificationCard({ notification, isViewed, onRender }) {
  const { ID, Type, Message, Timestamp } = notification;
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isViewed && onRender && ID) {
      onRender(ID);
    }
  }, [ID, isViewed, onRender]);

  const displayType = Type || "Notification";
  const displayDate = Timestamp || new Date().toISOString();

  return (
    <Card 
      ref={cardRef} 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        bgcolor: isViewed ? "transparent" : "action.hover",
        borderLeft: isViewed ? "1px solid" : "4px solid",
        borderColor: isViewed ? "divider" : "primary.main"
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip 
            label={displayType} 
            size="small" 
            color="primary" 
            variant={isViewed ? "outlined" : "filled"} 
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(displayDate).toLocaleString()}
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={isViewed ? "normal" : "bold"}>
          {Message}
        </Typography>
      </CardContent>
    </Card>
  );
}

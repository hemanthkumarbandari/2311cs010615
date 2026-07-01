import { useState } from "react";
import { Box, Container, Tabs, Tab, Paper } from "@mui/material";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotificationsPage } from "./pages/PriorityNotificationsPage";

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} variant="fullWidth">
              <Tab label="All Notifications" />
              <Tab label="Priority Notifications" />
            </Tabs>
          </Box>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {tab === 0 && <NotificationsPage />}
            {tab === 1 && <PriorityNotificationsPage />}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
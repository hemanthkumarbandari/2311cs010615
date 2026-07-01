export default function loggingMiddleware() {
  return {
    name: 'logging-middleware',
    configureServer(server) {
      // General logging middleware
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/evaluation-service')) {
          console.log(`[LOCAL API] ${req.method} ${req.url}`);
        }
        next();
      });

      // API mock
      server.middlewares.use('/evaluation-service/notifications', (req, res, next) => {
        // Parse query params manually since we are using raw Node req/res
        const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const type = url.searchParams.get('notification_type') || 'All';

        // Mock data
        const allNotifications = [
          { ID: "1", Type: "Placement", Message: "New placement drive at Google", Timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { ID: "2", Type: "Result", Message: "Semester 6 results declared", Timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
          { ID: "3", Type: "Event", Message: "Hackathon registration opens tomorrow", Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
          { ID: "4", Type: "Placement", Message: "Microsoft interview shortlists", Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
          { ID: "5", Type: "Result", Message: "Re-evaluation results for Sem 5", Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
          { ID: "6", Type: "Event", Message: "Alumni Meet 2026 scheduled", Timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
        ];

        let filtered = allNotifications;
        if (type !== 'All') {
          filtered = allNotifications.filter(n => n.Type === type);
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = filtered.slice(startIndex, endIndex);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          notifications: paginated,
          total,
          totalPages,
          currentPage: page
        }));
      });
    }
  };
}

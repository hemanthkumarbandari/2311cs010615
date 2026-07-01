Stage 1

# GET /api/notifications
Returns all notifications for the user.
* Headers: Authorization: Bearer <token>
* Query: page, limit
* Response (200): List of notifications
* Errors: 401

# GET /api/notifications/unread
Returns only unread notifications.
* Headers: Authorization: Bearer <token>
* Query: page, limit
* Response (200): List of unread notifications
* Errors: 401

# PATCH /api/notifications/:id/read
Marks one notification as read.
* Headers: Authorization: Bearer <token>, Content-Type: application/json
* Response (200): Updated notification
* Errors: 400, 401, 404

# PATCH /api/notifications/read-all
Marks all notifications as read.
* Headers: Authorization: Bearer <token>, Content-Type: application/json
* Response (200): Message and updated count
* Errors: 401

# Real-time Notification Mechanism
We use WebSockets (`/ws/notifications`) for real-time updates. The user connects with their token. The server pushes new notifications instantly, avoiding constant polling.

# Stage 2

## Storage
PostgreSQL. It handles structured data well, guarantees consistency for read states, and lets us easily filter by user and timestamp.

## DB Schema
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    type VARCHAR(50), -- Event, Result, Placement
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student ON notifications(student_id);
CREATE INDEX idx_created ON notifications(created_at);
```

## Scaling Issues
With 50k+ users and millions of rows, database queries will get slow without proper indexes. High insert rates create index overhead, and keeping old notifications will bloat the table.

## Solutions
Add a composite index on `(student_id, is_read, created_at)` for faster lookups. Use pagination so we don't load everything at once. Archive or delete old read notifications to keep the table light.

## Queries

**Fetch all (paginated):**
```sql
SELECT * FROM notifications WHERE student_id = 'uuid' ORDER BY created_at DESC LIMIT 20;
```

**Fetch unread:**
```sql
SELECT * FROM notifications WHERE student_id = 'uuid' AND is_read = FALSE ORDER BY created_at DESC;
```

**Mark single read:**
```sql
UPDATE notifications SET is_read = TRUE WHERE id = 'uuid' AND student_id = 'uuid';
```

**Mark all read:**
```sql
UPDATE notifications SET is_read = TRUE WHERE student_id = 'uuid' AND is_read = FALSE;
```

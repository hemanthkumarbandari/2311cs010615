Stage 1;

# GET /api/notifications

Returns all notifications for the logged-in user.

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
* Body: None
* Response (200): Updated notification
* Errors: 400, 401, 404

# PATCH /api/notifications/read-all

Marks all notifications as read.

* Headers: Authorization: Bearer <token>, Content-Type: application/json
* Body: None
* Response (200): Message and updated count
* Errors: 401

# Real-time Notification Mechanism

A WebSocket connection (`/ws/notifications`) is used for real-time updates. The user connects using a valid token. The server sends new notifications instantly whenever they are created..

# Stage 2

## Persistent Storage Choice
PostgreSQL is recommended for its robust support for structured relational data and mature indexing capabilities. It provides the strong consistency required to reliably track the read/unread state of notifications across concurrent requests. Additionally, PostgreSQL's advanced querying allows for efficient filtering and sorting by user, read status, and timestamp.

## Database Schema
```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_student_id ON notifications(student_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## Scaling Challenges
As data volume grows to millions of rows with 50k+ users, slow sequential scans can occur on queries lacking proper composite indexes. High-write insertion rates will introduce index maintenance overhead and potential read/write contention. Furthermore, accumulating old, read notifications will lead to table bloat and degrade overall database performance.

## Proposed Solutions
To maintain performance, we should add a composite index on `(student_id, is_read, created_at)` to optimize the most common read queries. Implementing pagination (cursor-based or limit/offset) will prevent the system from returning excessively large result sets. We can also utilize table partitioning or archive old, read notifications to a separate table to minimize bloat on the active dataset.

## Sample SQL Queries

**Fetch all notifications for a user (paginated):**
```sql
SELECT id, student_id, type, message, is_read, created_at
FROM notifications
WHERE student_id = 'some-user-uuid'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**Fetch unread notifications for a user:**
```sql
SELECT id, student_id, type, message, is_read, created_at
FROM notifications
WHERE student_id = 'some-user-uuid' AND is_read = FALSE
ORDER BY created_at DESC;
```

**Mark a single notification as read:**
```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = 'some-notification-uuid' AND student_id = 'some-user-uuid';
```

**Mark all notifications as read for a user:**
```sql
UPDATE notifications
SET is_read = TRUE
WHERE student_id = 'some-user-uuid' AND is_read = FALSE;
```

# Stage 1

## GET /api/notifications
- Headers: `Authorization: Bearer <token>`
- Query: `?page=1&limit=20`
- Response: `[{"id": 1, "userId": 1, "type": "Event", "message": "hello", "isRead": false, "createdAt": "2023-01-01"}]`

## GET /api/notifications/unread
- Headers: `Authorization: Bearer <token>`
- Query: `?page=1&limit=20`
- Response: `[{"id": 1, "userId": 1, "type": "Event", "message": "hello", "isRead": false, "createdAt": "2023-01-01"}]`

## PATCH /api/notifications/:id/read
- Headers: `Authorization: Bearer <token>`
- Body: `{}`
- Response: `{"id": 1, "isRead": true}`

## PATCH /api/notifications/read-all
- Headers: `Authorization: Bearer <token>`
- Body: `{}`
- Response: `{"message": "success"}`

### Real-time Mechanism
Use WebSockets at `/ws/notifications`. Connect using the auth token after login. The server pushes new notifications directly to the client as they are created to avoid HTTP polling.

# Stage 2

Postgres is chosen because the data is relational and requires efficient filtering and sorting by user ID, read status, and timestamp.

```sql
CREATE TYPE notif_type AS ENUM ('Event', 'Result', 'Placement');
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    type notif_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

At scale, full table scans slow down queries and the table bloats. We fix this by adding composite indexes on common query patterns, using pagination, and archiving old notifications.

```sql
SELECT * FROM notifications WHERE student_id = 'uuid' ORDER BY created_at DESC LIMIT 20 OFFSET 0;
SELECT * FROM notifications WHERE student_id = 'uuid' AND is_read = false ORDER BY created_at DESC;
UPDATE notifications SET is_read = true WHERE id = 'uuid' AND student_id = 'uuid';
UPDATE notifications SET is_read = true WHERE student_id = 'uuid' AND is_read = false;
```

# Stage 3

The query is slow because it lacks an index, forcing a full table scan and an expensive memory sort. 
Fix this by adding a composite index on `(student_id, is_read, created_at)` and selecting specific columns instead of `*`.
Indexing every column is bad because it wastes storage space and slows down write operations due to index maintenance overhead.

```sql
SELECT student_id 
FROM notifications 
WHERE type = 'Placement' AND created_at >= NOW() - INTERVAL '7 days';
```

# Stage 4

Problem: Hitting the database for unread counts on every page load overloads the DB with heavy read queries.
Fix: Cache the unread counts in Redis, use pagination for lists, and rely on WebSocket pushes instead of polling.
Tradeoffs: Caching introduces a risk of stale data, pagination requires more total requests, and WebSockets add infrastructure complexity.

# Stage 5

The pseudocode uses sequential processing, which is slow and blocks execution. It lacks error handling and retries, meaning a partial failure leaves the system in an inconsistent state.
Log the 200 failed emails and push them to a retry queue for asynchronous processing.
DB save and email should not be one transaction because email APIs are external and unreliable, which will lock DB rows unnecessarily.

```python
def send_notifications(users, message):
    save_all_to_db(users, message)
    for batch in chunk(users, 50):
        queue_async_emails(batch, message)

def async_email_worker(job):
    try:
        send_email(job.user, job.message)
    except Exception:
        push_to_retry_queue(job)
```

# Stage 6

Maintain a min-heap of size N for each user, scored by a combination of notification type weight (Placement > Result > Event) and recency. 

When a new notification arrives, compare it to the root of the heap. If its score is higher, pop the root and insert the new one in place, completely avoiding full recalculations.

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

"# 2311cs010615" 
# Notification System API

## Overview

This project contains the REST API design for a notification system. It allows users to view notifications, check unread notifications, mark notifications as read, and receive real-time updates.

## Features

* Get all notifications
* Get unread notifications
* Mark a notification as read
* Mark all notifications as read
* Real-time notifications using WebSocket

## API Endpoints

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/api/notifications`          | Get all notifications          |
| GET    | `/api/notifications/unread`   | Get unread notifications       |
| PATCH  | `/api/notifications/:id/read` | Mark a notification as read    |
| PATCH  | `/api/notifications/read-all` | Mark all notifications as read |

## Authentication

All API requests require:

`Authorization: Bearer <token>`

## Real-time Notifications

A WebSocket connection is available at `/ws/notifications`. After authentication, the server sends new notifications to the user in real time.

## Status Codes

* 200 - Success
* 400 - Bad Request
* 401 - Unauthorized
* 404 - Not Found

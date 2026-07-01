import { logger } from "../utils/logger";

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

export async function fetchNotifications(params = {}) {
  try {
    const url = new URL(API_URL);
    if (params.page) url.searchParams.append("page", params.page);
    if (params.limit) url.searchParams.append("limit", params.limit);
    if (params.notification_type && params.notification_type !== "All") {
      url.searchParams.append("notification_type", params.notification_type);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch notifications API", error);
    throw error;
  }
}

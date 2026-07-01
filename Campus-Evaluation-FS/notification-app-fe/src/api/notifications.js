import { logger } from "../utils/logger";

const API_URL = "/evaluation-service/notifications";

export async function fetchNotifications(params = {}) {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.notification_type && params.notification_type !== "All") {
      searchParams.append("notification_type", params.notification_type);
    }

    const urlString = searchParams.toString() ? `${API_URL}?${searchParams.toString()}` : API_URL;

    const response = await fetch(urlString, {
      headers: {
        'Authorization': 'Bearer dummy-token'
      }
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch notifications API", error);
    throw error;
  }
}

import type {
  ActivityLog,
  ActivityQuery,
  Notification,
  NotificationQuery,
  UnreadCountResponse,
} from "../types";

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  Object.assign(headers, options.headers || {});

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed with status ${response.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const str = params.toString();
  return str ? `?${str}` : "";
}

export const activityApi = {
  // ── Activity Logs ──────────────────────────────────────────────────────────
  async getLogs(query: ActivityQuery): Promise<{ success: boolean; data: ActivityLog[] }> {
    return apiRequest<{ success: boolean; data: ActivityLog[] }>(
      `/api/v1/activity/logs${buildQueryString(query as unknown as Record<string, unknown>)}`
    );
  },

  async getLog(id: string): Promise<{ success: boolean; data: ActivityLog }> {
    return apiRequest<{ success: boolean; data: ActivityLog }>(
      `/api/v1/activity/logs/${id}`
    );
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  async getNotifications(query: NotificationQuery): Promise<{ success: boolean; data: Notification[] }> {
    const filters = {
      ...query,
      isRead: query.isRead !== undefined ? String(query.isRead) : undefined,
    };
    return apiRequest<{ success: boolean; data: Notification[] }>(
      `/api/v1/activity/notifications${buildQueryString(filters as unknown as Record<string, unknown>)}`
    );
  },

  async getNotification(id: string): Promise<{ success: boolean; data: Notification }> {
    return apiRequest<{ success: boolean; data: Notification }>(
      `/api/v1/activity/notifications/${id}`
    );
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiRequest<UnreadCountResponse>(
      "/api/v1/activity/notifications/unread-count"
    );
  },

  async markAsRead(id: string): Promise<{ success: boolean; data: Notification }> {
    return apiRequest<{ success: boolean; data: Notification }>(
      `/api/v1/activity/notifications/${id}/read`,
      { method: "PATCH" }
    );
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      "/api/v1/activity/notifications/read-all",
      { method: "PATCH" }
    );
  },

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/v1/activity/notifications/${id}`,
      { method: "DELETE" }
    );
  },
};
export default activityApi;

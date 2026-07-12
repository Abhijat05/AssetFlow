import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityApi } from "../services/api";
import type { ActivityQuery, NotificationQuery } from "../types";
import { toast } from "sonner";

export const ACTIVITY_KEYS = {
  logs: (query: ActivityQuery) => ["activity", "logs", query],
  notifications: (query: NotificationQuery) => ["activity", "notifications", query],
  unreadCount: () => ["activity", "notifications", "unread-count"],
};

export function useActivityLogs(query: ActivityQuery) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.logs(query),
    queryFn: () => activityApi.getLogs(query).then((res) => res.data),
  });
}

export function useNotifications(query: NotificationQuery, refetchInterval = 10000) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.notifications(query),
    queryFn: () => activityApi.getNotifications(query).then((res) => res.data),
    refetchInterval,
  });
}

export function useNotificationUnreadCount(refetchInterval = 10000) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.unreadCount(),
    queryFn: () => activityApi.getUnreadCount().then((res) => res.data.count),
    refetchInterval,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activityApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIVITY_KEYS.unreadCount() });
      qc.invalidateQueries({ queryKey: ["activity", "notifications"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to mark notification as read");
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => activityApi.markAllAsRead(),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      qc.invalidateQueries({ queryKey: ACTIVITY_KEYS.unreadCount() });
      qc.invalidateQueries({ queryKey: ["activity", "notifications"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to mark all as read");
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activityApi.deleteNotification(id),
    onSuccess: () => {
      toast.success("Notification deleted");
      qc.invalidateQueries({ queryKey: ACTIVITY_KEYS.unreadCount() });
      qc.invalidateQueries({ queryKey: ["activity", "notifications"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete notification");
    },
  });
}

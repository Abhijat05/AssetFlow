import { notificationRepository } from "../repositories/notification.repository.js";
import type { NotificationInput } from "../types/index.js";

export const NotificationService = {
  send(data: NotificationInput): void {
    notificationRepository.create(data).catch((err) => {
      console.error("[NotificationService] Failed to send notification:", err);
    });
  },

  async sendAsync(data: NotificationInput) {
    return notificationRepository.create(data);
  },

  sendBulk(userIds: string[], data: Omit<NotificationInput, "userId">): void {
    for (const userId of userIds) {
      notificationRepository.create({ ...data, userId }).catch((err) => {
        console.error("[NotificationService] Failed to send bulk notification:", err);
      });
    }
  },
};

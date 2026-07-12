import type { Role } from "../../../types/index.js";

interface RoleChangeEvent {
  performedBy: string;
  targetUserId: string;
  fromRole: Role;
  toRole: Role;
}

// TODO: Persist to an activity_logs table when the Audits module is implemented
export const activityLogService = {
  async logRoleChange(event: RoleChangeEvent): Promise<void> {
    console.log(
      `[ActivityLog] ROLE_CHANGE | user=${event.targetUserId} | ${event.fromRole} → ${event.toRole} | by=${event.performedBy}`
    );
  },
};

import { logRepository } from "../repositories/log.repository.js";
import type { LogInput } from "../types/index.js";

export const ActivityLogger = {
  log(data: LogInput): void {
    logRepository.create(data).catch((err) => {
      console.error("[ActivityLogger] Failed to write log:", err);
    });
  },
};

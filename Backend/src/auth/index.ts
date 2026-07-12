import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db, { client } from "../db/index.js"; // db used by drizzleAdapter, client used in hooks
import * as schema from "../db/schema/index.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Replace with a real email service (e.g. Resend, Nodemailer)
      console.log(`[Password Reset] To: ${user.email} | URL: ${url}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5-minute client-side cache
    },
  },

  // Extend the user model with role and status.
  // input: false ensures clients cannot set these fields on signup.
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "EMPLOYEE",
        input: false,
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        input: false,
        required: false,
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Prevent inactive users from obtaining new sessions.
        // Raw query avoids drizzle-orm dual-instance type conflict with better-auth.
        before: async (session) => {
          const rows = await client<{ status: string }[]>`
            SELECT status FROM "user" WHERE id = ${session.userId} LIMIT 1
          `;
          if (rows[0]?.status === "INACTIVE") {
            return false;
          }
          return { data: session };
        },
      },
    },
  },

  trustedOrigins: [env.BETTER_AUTH_URL, "http://localhost:5173"],
});

export type Auth = typeof auth;

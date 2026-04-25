import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  clearChatHistory,
  createActivityScore,
  createAppointment,
  createChild,
  createNotification,
  deleteChild,
  getAllActivityScores,
  getAllAppointments,
  getAllChildren,
  getAllModules,
  getAllUsers,
  getActivityScoresByChild,
  getAppointmentById,
  getAppointmentsByUserId,
  getChatHistory,
  getChildById,
  getChildrenByUserId,
  getModuleById,
  getModuleCount,
  getNotificationsByUserId,
  getUserById,
  markAllNotificationsRead,
  markNotificationRead,
  saveChatMessage,
  seedModules,
  updateAppointmentStatus,
  updateChild,
  updateUserProfile,
} from "./db";
import { MODULE_SEED_DATA } from "./moduleData";

// Admin credentials (constant)
const ADMIN_USERNAME = "alira_admin";
const ADMIN_PASSWORD = "AliraAdmin2024!";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── User / Profile ────────────────────────────────────────────────────────
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getUserById(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          language: z.enum(["en", "fil"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        if (user.passwordHash) {
          const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
          if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
        }
        const hash = await bcrypt.hash(input.newPassword, 10);
        await updateUserProfile(ctx.user.id, { passwordHash: hash });
        return { success: true };
      }),

    completeRegistration: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1),
          birthdate: z.string(),
          address: z.string().min(1),
          phone: z.string().min(1),
          email: z.string().email(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, {
          fullName: input.fullName,
          birthdate: new Date(input.birthdate),
          address: input.address,
          phone: input.phone,
          email: input.email,
        });
        return { success: true };
      }),
  }),

  // ─── Children ──────────────────────────────────────────────────────────────
  children: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getChildrenByUserId(ctx.user.id);
    }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const child = await getChildById(input.id);
      if (!child || child.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      return child;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          age: z.number().min(0).max(18),
          birthdate: z.string(),
          gender: z.enum(["male", "female", "other"]),
          isClinicallyDiagnosed: z.boolean(),
          diagnosisDetails: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await createChild({
          userId: ctx.user.id,
          name: input.name,
          age: input.age,
          birthdate: new Date(input.birthdate),
          gender: input.gender,
          isClinicallyDiagnosed: input.isClinicallyDiagnosed,
          diagnosisDetails: input.diagnosisDetails ?? null,
        });
        return { id, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          age: z.number().min(0).max(18).optional(),
          birthdate: z.string().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          isClinicallyDiagnosed: z.boolean().optional(),
          diagnosisDetails: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const child = await getChildById(input.id);
        if (!child || child.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        const { id, ...data } = input;
        await updateChild(id, {
          ...data,
          birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const child = await getChildById(input.id);
        if (!child || child.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        await deleteChild(input.id);
        return { success: true };
      }),
  }),

  // ─── Modules ───────────────────────────────────────────────────────────────
  modules: router({
    list: protectedProcedure.query(async () => {
      const count = await getModuleCount();
      if (count === 0) await seedModules(MODULE_SEED_DATA);
      return getAllModules();
    }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const count = await getModuleCount();
      if (count === 0) await seedModules(MODULE_SEED_DATA);
      const mod = await getModuleById(input.id);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND" });
      return mod;
    }),

    seed: protectedProcedure.mutation(async () => {
      await seedModules(MODULE_SEED_DATA);
      return { success: true };
    }),
  }),

  // ─── Progress / Activity Scores ────────────────────────────────────────────
  progress: router({
    getByChild: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ ctx, input }) => {
        const child = await getChildById(input.childId);
        if (!child || child.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        return getActivityScoresByChild(input.childId);
      }),

    record: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          moduleId: z.number(),
          score: z.number().min(0).max(100),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const child = await getChildById(input.childId);
        if (!child || child.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        const id = await createActivityScore({
          childId: input.childId,
          userId: ctx.user.id,
          moduleId: input.moduleId,
          score: input.score,
          notes: input.notes ?? null,
          completedAt: new Date(),
        });
        return { id, success: true };
      }),
  }),

  // ─── Appointments ──────────────────────────────────────────────────────────
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getAppointmentsByUserId(ctx.user.id);
    }),

    book: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          clinicName: z.string().min(1),
          clinicAddress: z.string().optional(),
          appointmentDate: z.string(),
          preferredTime: z.string().min(1),
          guardianName: z.string().min(1),
          guardianPhone: z.string().min(1),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const child = await getChildById(input.childId);
        if (!child || child.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        const id = await createAppointment({
          userId: ctx.user.id,
          childId: input.childId,
          clinicName: input.clinicName,
          clinicAddress: input.clinicAddress ?? null,
          appointmentDate: new Date(input.appointmentDate),
          preferredTime: input.preferredTime,
          guardianName: input.guardianName,
          guardianPhone: input.guardianPhone,
          notes: input.notes ?? null,
          status: "pending",
          reminderSent: false,
        });
        // Create notification
        await createNotification({
          userId: ctx.user.id,
          title: "Appointment Booked",
          message: `Your appointment at ${input.clinicName} for ${child.name} on ${input.appointmentDate} at ${input.preferredTime} has been booked.`,
          type: "appointment_booked",
          isRead: false,
        });
        return { id, success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const appt = await getAppointmentById(input.id);
        if (!appt || appt.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        await updateAppointmentStatus(input.id, "cancelled");
        return { success: true };
      }),
  }),

  // ─── ALI Chatbot ───────────────────────────────────────────────────────────
  chat: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      return getChatHistory(ctx.user.id, 50);
    }),

    send: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await saveChatMessage({ userId: ctx.user.id, role: "user", content: input.message });

        // Get recent history for context
        const history = await getChatHistory(ctx.user.id, 20);
        const messages = [
          {
            role: "system" as const,
            content: `You are ALI, a compassionate and knowledgeable AI companion for parents and guardians of children with autism in the Philippines. Your role is to:
- Provide evidence-based guidance on autism care, therapy approaches, and developmental support
- Help parents understand their child's needs and behaviors
- Offer practical strategies for daily routines, communication, and skill-building
- Share information about autism resources and support in the Philippines
- Provide emotional support and encouragement to caregivers
- Explain therapeutic approaches like ABA, DIR/Floortime, TEACCH, and NDBI
- Be warm, empathetic, and culturally sensitive to Filipino families
- Always recommend professional consultation for medical or clinical decisions
- Focus exclusively on autism care, child development, and caregiver support topics
Keep responses concise, warm, and actionable.`,
          },
          ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof rawContent === "string" ? rawContent : "I'm here to help. Could you please rephrase your question?";

        // Save assistant response
        await saveChatMessage({ userId: ctx.user.id, role: "assistant", content: assistantMessage });

        return { message: assistantMessage };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearChatHistory(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsByUserId(ctx.user.id);
    }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin credentials" });
        }
        return { success: true, token: Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString("base64") };
      }),

    getUsers: publicProcedure
      .input(z.object({ adminToken: z.string() }))
      .query(async ({ input }) => {
        validateAdminToken(input.adminToken);
        return getAllUsers();
      }),

    getChildren: publicProcedure
      .input(z.object({ adminToken: z.string() }))
      .query(async ({ input }) => {
        validateAdminToken(input.adminToken);
        return getAllChildren();
      }),

    getAppointments: publicProcedure
      .input(z.object({ adminToken: z.string() }))
      .query(async ({ input }) => {
        validateAdminToken(input.adminToken);
        return getAllAppointments();
      }),

    getActivityScores: publicProcedure
      .input(z.object({ adminToken: z.string() }))
      .query(async ({ input }) => {
        validateAdminToken(input.adminToken);
        return getAllActivityScores();
      }),

    updateAppointmentStatus: publicProcedure
      .input(
        z.object({
          adminToken: z.string(),
          id: z.number(),
          status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
        })
      )
      .mutation(async ({ input }) => {
        validateAdminToken(input.adminToken);
        await updateAppointmentStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

function validateAdminToken(token: string): void {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    if (!decoded.startsWith(ADMIN_USERNAME + ":")) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
    }
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
  }
}

export type AppRouter = typeof appRouter;

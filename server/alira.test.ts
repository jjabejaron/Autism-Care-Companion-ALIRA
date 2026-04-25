import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ─────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeAuthCtx(): TrpcContext {
  return makeCtx({
    user: {
      id: 1,
      openId: "test-user-open-id",
      name: "Test Parent",
      email: "parent@test.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Parent");
    expect(result?.email).toBe("parent@test.com");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── Children ─────────────────────────────────────────────────────────────────
describe("children.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.children.list()).rejects.toThrow();
  });
});

describe("children.create", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.children.create({
        name: "Test Child",
        age: 4,
        birthdate: "2020-01-01",
        gender: "male",
        isClinicallyDiagnosed: false,
      })
    ).rejects.toThrow();
  });
});

// ─── Modules ─────────────────────────────────────────────────────────────────
describe("modules.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.modules.list()).rejects.toThrow();
  });
});

// ─── Progress ─────────────────────────────────────────────────────────────────
describe("progress.getByChild", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.progress.getByChild({ childId: 1 })).rejects.toThrow();
  });
});

// ─── Appointments ─────────────────────────────────────────────────────────────
describe("appointments.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.appointments.list()).rejects.toThrow();
  });
});

// ─── Notifications ────────────────────────────────────────────────────────────
describe("notifications.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.notifications.list()).rejects.toThrow();
  });
});

// ─── Admin ────────────────────────────────────────────────────────────────────
describe("admin.login", () => {
  it("rejects invalid credentials", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.admin.login({ username: "wrong", password: "wrong" })
    ).rejects.toThrow();
  });

  it("accepts valid admin credentials", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.admin.login({
      username: "alira_admin",
      password: "AliraAdmin2024!",
    });
    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
  });
});

// ─── Chat ─────────────────────────────────────────────────────────────────────
describe("chat.getHistory", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.chat.getHistory()).rejects.toThrow();
  });
});

// ─── User ─────────────────────────────────────────────────────────────────────
describe("user.getProfile", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.user.getProfile()).rejects.toThrow();
  });
});

import { vi } from "vitest";

export const testPrisma= {
    user:{
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
    },
    asset:{
        findMany: vi.fn(),
        create: vi.fn()
    },
    reportCal:{
        findMany: vi.fn()
    },
    jobLog:{
        create: vi.fn()
    },
};
import { vi } from "vitest";

export const mockPrismaFn=()=> {
    return{
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  asset: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  reportCal: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  jobLog: {
    create: vi.fn(),
  },
}
}
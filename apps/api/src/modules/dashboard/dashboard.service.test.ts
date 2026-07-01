import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "./dashboard.service";
import { whereExpReport } from "../../types/helper";
import { prisma } from "../../lib/prisma";
// import { mockPrismaFn } from "../../tests/util/mockPrisma";

// const testPrisma= mockPrismaFn();
vi.mock("../../lib/prisma", () => ({
  prisma:{
    asset: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("../../types/helper", () => ({
  whereExpReport: vi.fn(),
}));

describe("dash service tests", () => {
  const service = new DashboardService();
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("dash stats data-test", async () => {
    vi.mocked(whereExpReport).mockResolvedValue({createdBy:1});
    vi.mocked(prisma.asset.count).mockResolvedValueOnce(20) // total
      .mockResolvedValueOnce(3)//exp
      .mockResolvedValueOnce(2);//ris

    vi.mocked(prisma.asset.groupBy)
      .mockResolvedValueOnce([
        { fileHash: "abc", _count:{id: 2}},
        { fileHash: "xyz", _count:{id: 3}},
      ]as any)
      .mockResolvedValueOnce([
        { status: "UNDER_REVIEW", _count: { id: 6 } },
        { status: "FAILED", _count: { id: 4 } },
      ]as any);
    const result = await service.getStats(1, "ADMIN");

    expect(result).toEqual({totalAssets:20,expring: 3,risk: 2,
      dupes: 2,processStatus: {pending: 6,failed: 4,
        pendingPer: 60, failedPer: 40,},
    });

    expect(whereExpReport).toHaveBeenCalledWith("ADMIN", 1);
    expect(prisma.asset.count).toHaveBeenCalledTimes(3);
    expect(prisma.asset.groupBy).toHaveBeenCalledTimes(2);
  });
});
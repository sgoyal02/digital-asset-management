import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardController } from "./dashboard.controller";
import { mockReq } from "../../tests/util/mockReq";
import { mockResponse } from "../../tests/util/mockRes";
import { DashboardService } from "./dashboard.service";
import { sendSuccess, sendError } from "../../response";

vi.mock("./dashboard.service");
vi.mock("../../response", () => ({
  sendSuccess: vi.fn(),
  sendError: vi.fn(),
}));

describe("dash controller-tests", () => {
  const controller = new DashboardController();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dash state-data test", async () => {
    const stats= {totalAssets: 20, expring: 3,risk: 2,dupes: 2,
      processStatus: {pending: 6,failed: 4, pendingPer: 60, failedPer: 40,}
    };
    vi.spyOn(DashboardService.prototype,"getStats").mockResolvedValue(stats);

    const req = mockReq({
      user:{id: 1, role: "ADMIN"}
    });
    const res = mockResponse();
    await controller.getStats(req as any, res as any);
    expect(DashboardService.prototype.getStats).toHaveBeenCalledWith(1, "ADMIN");
    expect(sendSuccess).toHaveBeenCalledWith(res,stats,"Dashboard stats fetch success");
  });

  it("err test-service error throw", async () => {
    vi.spyOn(DashboardService.prototype, "getStats").mockRejectedValue(new Error("Something went wrong"));
    const req = mockReq({
      user: {id: 1,role: "ADMIN"}
    });

    const res = mockResponse();
    await controller.getStats(req as any, res as any);
    expect(sendError).toHaveBeenCalledWith(res,"Something went wrong", 500);
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth.middleware";
import { mockReq } from "../tests/util/mockReq";
import { mockResponse } from "../tests/util/mockRes";

vi.mock("jsonwebtoken", () => ({
    default: {
        verify: vi.fn(),
    },
}));

vi.mock("../../src/response", () => ({
    sendError: vi.fn((res, message, status) => {
        return res.status(status).json({
            success: false,
            message,
        });
    }),
}));

describe("authMiddleware test cases", () => {
    const next = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("401 err- token missing", () => {
        const req = mockReq({
            headers: {},
        });
        const res = mockResponse();
        authMiddleware(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("token valid- call next- add token", () => {
        const req = mockReq({
            headers: {
                authorization: "Bearer valid-token",
            },
        });
        const res = mockResponse();
        const decodedUser = {
            id: 1,
            email: "test@test.com",
        };
        vi.mocked(jwt.verify).mockReturnValue(decodedUser as any);
        authMiddleware(req as any, res as any, next);

        expect(jwt.verify).toHaveBeenCalled();
        expect(req.user).toEqual(decodedUser);

        expect(next).toHaveBeenCalledOnce();
    });

    it("401 err- token invalid", () => {
        const req = mockReq({
            headers: {
                authorization: "Bearer invalid-tok",
            },
        });
        const res = mockResponse();
        vi.mocked(jwt.verify).mockImplementation(() => {
            throw new Error("invalid token");
        });
        authMiddleware(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
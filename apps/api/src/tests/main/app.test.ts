import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../app";
describe("app test setup route", () => {
    it("404 for missing route", async () => {
        const res = await request(app).get("/unknown-route");
        expect(res.status).toBe(404);
    });
});
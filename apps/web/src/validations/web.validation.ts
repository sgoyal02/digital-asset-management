import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Please enter valid email")),
  password: z.string().trim().min(1, "Password is required")
});
import { Router } from "express";
import { authRouter } from "./modules/auth/auth.router";
import { dashRouter } from "./modules/dashboard/dashboard.router";
import { assetsRouter } from "./modules/assets/assets.router";

const router = Router();
router.use('/auth', authRouter);
router.use('/dashboard', dashRouter);
router.use('/assets', assetsRouter);
export {router as globalRouter};
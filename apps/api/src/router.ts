import { Router } from "express";
import { authRouter } from "./modules/auth/auth.router";
import { dashRouter } from "./modules/dashboard/dashboard.router";
import { assetsRouter } from "./modules/assets/assets.router";
import { collectionRouter } from "./modules/collections/collections.route";

const router = Router();
router.use('/auth', authRouter);
router.use('/dashboard', dashRouter);
router.use('/assets', assetsRouter);
router.use('/collections', collectionRouter);
export {router as globalRouter};
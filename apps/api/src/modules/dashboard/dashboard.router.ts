import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../middleware/auth.middleware";


const router = Router();
const controller= new DashboardController();
router.get('/stats', authMiddleware, controller.getStats);

export{router as dashRouter};
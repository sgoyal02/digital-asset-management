import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { sendError, sendSuccess } from "../../response";
import { AuthReq } from "../../middleware/auth.middleware";

const dashboardService= new DashboardService();
export class DashboardController{
    async getStats(req:AuthReq, res: Response){     //req as any?
        try{
            const userId= req.user!.id; //-- ?? req.user.id
            const role= req.user!.role;
            const stats= await dashboardService.getStats(userId, role);
            sendSuccess(res, stats, "Dashboard stats fetch success");
        }catch(err:any){
            const code= err.statusCode || 500;
            return sendError(res, err.message, code);
        }
    } 
}
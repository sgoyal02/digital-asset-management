import { Response } from "express";
import { AuthReq } from "../../middleware/auth.middleware";
import { ReportService } from "./reports.service";
import { sendError, sendSuccess } from "../../response";

const reportService= new ReportService();
export class ReportController{
    async getUsageTrends(req:AuthReq, res:Response){
    try{
      const userId= req.user!.id;
      const role= req.user!.role;
      // const days= Math.min(Number(req.query.days)|| 30, 90);
      const result = await reportService.getUsageTrends(userId,role,
        {days:Number(req.query.days), assetType:req.query.type as string, deptId:Number(req.query.dept)}
      );
      sendSuccess(res, result, 'fetch success:usage trend report');
    }catch(err:any){
      return sendError(res, err.message, err.statusCode|| 500);
      }
    }
  
  async getDuplicates(req:AuthReq, res:Response){
    try{
      const userId= req.user!.id;
      const role= req.user!.role;
      const result = await reportService.getDuplicates(userId,role,
        {days:Number(req.query.days), assetType: req.query.type as string, deptId:Number(req.query.dept)}
      );
      sendSuccess(res, result, 'fetch success:duplicates report');
    }catch(err:any){
      return sendError(res, err.message, err.statusCode|| 500);
      }
  }

  async getCompliance(req:AuthReq, res: Response) {
  try {
    const userId= req.user!.id;
    const role= req.user!.role;
    const result = await reportService.getCompliance(userId, role,
      {days: Number(req.query.days), assetType:req.query.type as string, deptId:Number(req.query.dept)}
    );
    sendSuccess(res, result, "fetch success:compliance report");
  } catch (err:any) {
    return sendError(res, err.message, err.statusCode|| 500);
  }
  }
}
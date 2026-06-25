import { Response } from "express";
import { AuthReq } from "../../middleware/auth.middleware";
import { sendError, sendSuccess } from "../../response";
import { JobsService } from "./jobs.service";

const jobsService = new JobsService();

export class JobsController{
  async getJobs(req:AuthReq, res:Response) {
    try {
      if (req.user!.role!== 'ADMIN') {
        return sendError(res, 'access denie', 403);
      }
      const limit=Number(req.query.limit)|| 10;
      const newJobs= await jobsService.getJobs(limit);
      sendSuccess(res, newJobs, 'jobs fetch success');
    } catch(err:any){
      return sendError(res, err.message, err.statusCode|| 500);
    }
  }
}
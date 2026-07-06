import { Response } from "express";
import { AuthReq } from "../../middleware/auth.middleware";
import { sendError, sendSuccess } from "../../response";
import { JobsService } from "./jobs.service";
import { ApiError } from "../../types/helper";

const jobsService = new JobsService();

export class JobsController{
  async getJobs(req:AuthReq, res:Response) {
    try {
      if (req.user!.role!== 'ADMIN') {
        return sendError(res, 'access deny', 403);
      }
      const limit=Number(req.query.limit)|| 10;
      const newJobs= await jobsService.getJobs(limit);
      sendSuccess(res, newJobs, 'jobs fetch success');
    } catch(err:unknown){
      const e= err as ApiError;
      const code= e.statusCode || 500;
      return sendError(res, e.message, code);
    }
  }
}
// modules/jobs/jobs.service.ts
import { prisma } from '../../lib/prisma';

export class JobsService {
  async getJobs(limit=10){
    const jobs= await prisma.jobLog.findMany({
      orderBy:{startedAt:'desc'},take: limit,
      include:{asset:{ select:{fileName:true}}}
    });
    return jobs.map((j:any) => ({
      id:j.id,type: j.type,assetName: j.asset?.fileName ?? '-',
      status:j.status,startedAt: j.startedAt,completedAt: j.finishedAt,
      duration:j.duration? `${(j.duration/1000).toFixed(1)}s` : '-',
      error:j.error?? null,
    }));
  }
}
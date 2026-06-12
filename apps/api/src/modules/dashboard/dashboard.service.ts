import { prisma } from '../../lib/prisma';
import { addDays } from 'date-fns';

export class DashboardService{
  async getStats(userId:number, role:string) {
    const currDate = new Date();
    const totalAssets = await prisma.asset.count({
      where: role === 'ADMIN' ? {} : {ownerId:userId }
    });

    const expring=await prisma.asset.count({
      where:{
        expiryDate:{lte: addDays(currDate, 5), //lessthan equl
          gte: currDate, //greaterthan equal
        },
        isArchived: false,
        ...(role !== 'ADMIN' && {ownerId: userId })
      }
    });

    //exp, rej, --risk count  --pending>1week-high prio ??
    const risk=await prisma.asset.count({
      where: {
        OR: [{status:'EXPIRED'},{status:'REJECTED'}],
        ...(role !== 'ADMIN' && {ownerId:userId })
      }
    });

    //filename, size same --dupes
    const dupesGroup = await prisma.asset.groupBy({
      by:['fileName','size'],
      _count:{id:true},  //--file count in each grp
      having:{id:{_count:{gt: 1}}}, //take grp with >1 file count
      where:role !== 'ADMIN'?{ownerId:userId}:{}
    });
    const dupes = dupesGroup.length;

    const processing= await prisma.asset.groupBy({
      by:['status'], _count:{id:true},
      where:{status:{in:['PENDING', 'FAILED']},
        ...(role !== 'ADMIN' && { ownerId: userId })
      }
    });
    const pending = processing.find((p:any) =>p.status === 'PENDING')?._count.id || 0;
    const failed = processing.find((p:any) =>p.status === 'FAILED')?._count.id || 0;
    const total = pending + failed;
    const pendingPer = total? Math.round((pending/total)* 100): 0;
    const failedPer = total? Math.round((failed/total)* 100): 0;

    return {
     totalAssets, expring, dupes, risk,
      processStatus:{pending, failed,pendingPer,failedPer}
    };
  }
}
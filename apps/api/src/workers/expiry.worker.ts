import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { jobDone, jobFailed, jobStart } from '../types/helper';

export const expiryWorker = () => {
  cron.schedule('0 0 * * *', async()=>{
  console.log('exp worker run:');
  const logId=await jobStart('EXPIRY');
  try{
  const now = new Date();
  //exp now
    const expired = await prisma.asset.updateMany({
      where:{expiryDate: { lte: now },isArchived: false,
        status:{notIn:['EXPIRED', 'ARCHIVED', 'REJECTED' ,'FAILED']}
      },
      data:{status:'EXPIRED'}
    });
    //exp-archive after 3day
    const expTym= new Date(now.getTime()- 3*24*60*60*1000);
    const archived = await prisma.asset.updateMany({
      where: {expiryDate:{lte:expTym},status: 'EXPIRED',
        isArchived: false,
      },
      data:{status:'ARCHIVED',isArchived: true}
    });
    console.log("exp worker done: ",expired.count,archived.count);
    await jobDone(logId);
  }catch(err:unknown){
    console.error('expiry worker fail: ', err);
    const errMsg= err as {data:{message:string, statusCode?:number}};
    await jobFailed(logId, errMsg.data.message);
  }
  });
};
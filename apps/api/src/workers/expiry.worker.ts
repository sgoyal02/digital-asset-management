import cron from 'node-cron';
import { prisma } from '../lib/prisma';

export const expiryWorker = () => {
  cron.schedule('0 0 * * *', async()=>{
  console.log('exp worker run:');
  const now = new Date();
  //exp now
    const expired = await prisma.asset.updateMany({
      where:{expiryDate: { lte: now },isArchived: false,
        status:{notIn:['EXPIRED', 'ARCHIVED', 'REJECTED']}
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
  });
};
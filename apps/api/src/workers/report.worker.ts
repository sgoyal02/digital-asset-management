import { prisma } from '../lib/prisma';
import { getChannel } from '../queue/connection';
import { QUEUES } from '../queue/queues';
import { ReportPayload } from '../types';

const roleKey=(role:string, uId:number) =>
  role=== 'ADMIN'? 'ADMIN': `${role}_${uId}`;

const whereAsExp= async(role:string,userId:number) => {
  if(role=== 'ADMIN')return {};
  if(role=== 'USER')return {ownerId: userId};
  const team= await prisma.user.findMany({      //for manag
    where:{managerId: userId},select:{id: true},
  });
  return{ownerId: {in:[userId, ...team.map(u=>u.id)]}};
};

const calUsageTrends=async(userId:number, role:string, days:number)=>{
  const since= new Date();
  since.setDate(since.getDate()-days);
  const where= await whereAsExp(role, userId);

  const assets= await prisma.asset.findMany({  //1 day cal
    where:{...where,createdAt:{gte: since}},
    select:{createdAt: true}
  });
  console.log("Ass: ", assets);
 
  const byDay:Record<string,number>={};   //grpBy
  for(const a of assets) {
   const date= a.createdAt.toISOString().split('T')[0];
   byDay[date]= (byDay[date]||0) + 1;
  }
  //null data-0
  const calUploads= [];
  for(let i= days-1; i >= 0; i--) {
    const d= new Date();
    d.setDate(d.getDate()-i);
    const date= d.toISOString().split('T')[0];
    calUploads.push({date, count: byDay[date]|| 0 });
  }

  const byStatus = await prisma.asset.groupBy({ //grpBy
    by:['status'], _count:{id: true}, where});
  const byMime = await prisma.asset.groupBy({ //grpBy
    by:['mimeType'], _count:{id: true}, where});
  const typeMap:Record<string, number> = {};
  for(const m of byMime){
    const t= m.mimeType.startsWith('image/')? 'Image'
    :m.mimeType.startsWith('video/')? 'Video'
    :m.mimeType.startsWith('audio/')? 'Audio': 'Doc';
    typeMap[t] = (typeMap[t]|| 0) + m._count.id;
  }
  console.log("cal: ", calUploads, byStatus,typeMap )

  return {calUploads, byStatus:byStatus.map(r =>({ name: r.status, count: r._count.id })),
    byType:Object.entries(typeMap).map(([name,count])=>({name, count})),
  };
}


export const reportWorker= async()=> {
  const ch= getChannel();
  ch.prefetch(1);
  ch.consume(QUEUES.REPORT, async(msg)=>{
    if(!msg) return;
    const{type,userId,role,days=5}:ReportPayload= JSON.parse(msg.content.toString());
    console.log("rep worker in: ", msg.content);
    try{
      let payload: any;
      if (type==='USAGE_TRENDS')payload= await calUsageTrends(userId,role,days);
      
      await prisma.reportCal.upsert({
        where:{type_role_days:{ type, role:roleKey(role,userId), days}},
        create:{type,role:roleKey(role,userId),days, payload},
        update:{payload, createdAt:new Date()},
      });
      ch.ack(msg);
    }catch(err:any) {
      console.error("report worker fail:", err);
      ch.nack(msg,false,false);
    }
  });
  console.log("report worker run");
};
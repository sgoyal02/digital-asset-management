import { prisma } from '../lib/prisma';
import { getChannel } from '../queue/connection';
import { QUEUES } from '../queue/queues';
import { ReportFilters, ReportPayload } from '../types';
import { whereExpReport } from '../types/helper';

const roleKey=(role:string, uId:number) =>
  role=== 'ADMIN'? 'ADMIN': `${role}_${uId}`;

const whereAsExp= async(role:string,userId:number) => {
  if(role=== 'ADMIN')return {};
  if(role=== 'USER')return {ownerId: userId};
  const team= await prisma.user.findMany({      //for manag
    where:{managerId: userId},select:{id: true},
  });
  return{ownerId: {in:[userId, ...team.map((u:any)=>u.id)]}};
};

const calUsageTrends=async(userId:number, role:string, days:number|undefined)=>{
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

  return {calUploads, byStatus:byStatus.map((r:any) =>({ name: r.status, count: r._count.id })),
    byType:Object.entries(typeMap).map(([name,count])=>({name, count})),
  };
}

const calDupes= async(userId: number, role:string, filters:ReportFilters)=>{
  const where= await whereAsExp(role,userId);
  const [dupeCount,cleanCount, dupeSizeRaw] = await Promise.all([
    prisma.asset.count({where:{...where, isDupe: true}}),
    prisma.asset.count({where:{ ...where, isDupe: false}}),
    prisma.asset.aggregate({where:{ ...where, isDupe: true}, _sum:{size: true}}),
  ]);
  const dupeGrps= await prisma.asset.groupBy({by:['fileHash'], _count:{id: true }, //samehash dupe
    having:{id:{ _count:{gt: 1 }}},
    where:{...where, fileHash:{not: null }},
  });

  return{duplication:[
      {name:'Duplicates', count: dupeCount},
      {name:'Clean', count: cleanCount},
    ],
    dupeGroups:dupeGrps.length,
    storageDupe:(Number(dupeSizeRaw._sum.size?? 0)/1024/1024).toFixed(2),
  };
}

const calCompliance= async(userId: number, role: string, filters?: ReportFilters) => {
  const where= await whereExpReport(role, userId, filters);
  const assets= await prisma.asset.findMany({where,
    select:{status: true, expiryDate: true,isArchived: true,},
  });
  const currDay = new Date();
  const result = {healthy: 0, expiring_soon: 0,expired:0,archived: 0,rejected: 0};
  for(const a of assets) {
    if(a.isArchived) result.archived++;
    else if(a.status === "REJECTED") result.rejected++;
    else if(a.expiryDate && a.expiryDate< currDay) result.expired++;
    else if(a.expiryDate && a.expiryDate > currDay && a.expiryDate< new Date(currDay.getTime() + 30*24*60*60*1000)){
      result.expiring_soon++;
    }else{
      result.healthy++;
    }
  }
  return result;
};

export const reportWorker= async()=> {
  const ch= getChannel();
  ch.prefetch(1);
  ch.consume(QUEUES.REPORT, async(msg:any)=>{
    if(!msg) return;
    const{type,userId,role,filters}:ReportPayload= JSON.parse(msg.content.toString());
    console.log("rep worker in: ", msg.content);
    try{
      let payload: any;
      if (type==='USAGE_TRENDS')payload= await calUsageTrends(userId,role,filters.days);
      if (type==='DUPLICATES')payload= await calDupes(userId,role, filters);
      if (type==='COMPLIANCE')payload= await calCompliance(userId,role, filters);
      
      await prisma.reportCal.upsert({
        where:{type_role_days:{ type, role:roleKey(role,userId), days:filters.days}},
        create:{type,role:roleKey(role,userId), days:filters.days, payload},
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
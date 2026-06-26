import { prisma } from '../lib/prisma';
import { getChannel } from '../queue/connection';
import { QUEUES } from '../queue/queues';
import { ReportFilters, ReportPayload } from '../types';
import { jobDone, jobFailed, jobStart, whereExpReport } from '../types/helper';

const roleKey=(role:string, uId:number)=> role=== 'ADMIN'? 'ADMIN': `${role}_${uId}`;

const calUsageTrends=async(userId:number, role:string, filters:ReportFilters)=>{
  const where= await whereExpReport(role, userId, filters);
  const assets= await prisma.asset.findMany({  //1 day cal
    where:{...where},
    select:{createdAt:true}
  });
  console.log("Ass usage calc: ", assets);
 
  const byDay:Record<string,number>={};   //grpBy
  for(const a of assets) {
   const date= a.createdAt.toISOString().split('T')[0];
   byDay[date]= (byDay[date]||0) + 1;
  }
  //null data-0
  const calUploads= [];
  for(let i= (filters.days!)-1; i >= 0; i--) {
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

  return {calUploads, byStatus:byStatus.map((r:any) =>({ name: r.status, count: r._count.id })),
    byType:Object.entries(typeMap).map(([name,count])=>({name, count})),
  };
}

const calDupes= async(userId: number, role:string, filters:ReportFilters)=>{
  const where= await whereExpReport(role,userId, filters);
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

const calCompliance= async(userId: number, role: string, filters:ReportFilters) => {
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
  const labelMap:Record<string, string>= {
  healthy: "Healthy", expiring_soon: "Expiring Soon",
  expired: "Expired", archived: "Archived", rejected: "Rejected"};

  return Object.entries(result).map(([name, count]) => ({
  name:labelMap[name]?? name, count
  }));
};

export const calReport=async(type: string,userId: number,role: string,filters: ReportFilters)=> {
  if (type=== 'USAGE_TRENDS') return calUsageTrends(userId, role, filters);
  if (type=== 'DUPLICATES') return calDupes(userId, role, filters);
  if (type=== 'COMPLIANCE') return calCompliance(userId, role, filters);
  throw new Error(`diff report type:${type}`);
};

export const reportWorker= async()=> {
  const ch= getChannel();
  ch.prefetch(1);
  ch.consume(QUEUES.REPORT, async(msg:any)=>{
    if(!msg) return;
    const{type,userId,role,filters}:ReportPayload= JSON.parse(msg.content.toString());
    console.log("rep worker in: ", filters);
    const logId= await jobStart('REPORT');
    try{
      let payload: any;
      payload= await calReport(type, userId, role, filters);
      console.log("payload worker rep:", payload);
      await prisma.reportCal.upsert({
        where:{type_role_days_assetType_deptId:{type, role:roleKey(role,userId), days:filters.days!, assetType:filters.assetType!, deptId:filters.deptId!}},
        create:{type,role:roleKey(role,userId), days:filters.days, 
              payload, assetType:filters.assetType, deptId: filters.deptId},
        update:{payload, createdAt:new Date()},
      });
      ch.ack(msg);
      await jobDone(logId);
    }catch(err:any) {
      console.error("report worker fail:", err);
      await jobFailed(logId, err.message);
      ch.nack(msg,false,false);
    }
  });
};
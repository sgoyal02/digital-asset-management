import { ReportFilters } from ".";
import { AssetStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const markAssetStatus=async(aId:number, aStatus:AssetStatus)=>{
    return prisma.asset.update({
    where:{id:aId},
    data:{status:aStatus}
  });
}

export const whereExpReport= async(role:string, uId:number, filters?:ReportFilters) => {
  let where:any= {};
  if (role=== "ADMIN"){where= {}} 
  else if (role=== "USER") {
    where.ownerId= uId;
  }else{ //mangr
    const team= await prisma.user.findMany({
      where:{managerId:uId},select:{id:true}
    });
    where.ownerId= {in:[uId, ...team.map(u => u.id)]};
  }

  if (filters?.assetType && filters.assetType!== "A"){
    if(filters.assetType==='D'){
      where.AND = [{mimeType:{not:{startsWith: 'image/'}}},
      {mimeType:{not:{startsWith: 'video/'}}}, {mimeType:{not:{startsWith: 'audio/'}}},
      ];
    }else{
    const map:any= {I:{startsWith: "image/"},V:{startsWith: "video/"},AU:{startsWith: "audio/"}};
    where.mimeType= map[filters.assetType];
    }
  }

  if (filters?.deptId && filters?.deptId!== -1) { //-1 for all
    where.departmentId= filters.deptId; //chk to do-null?
  }
  if(filters?.days){
    const since= new Date();
    since.setHours(0,0,0,0);
    since.setDate(since.getDate()-filters.days + 1);
    console.log("sice: ", since)
    where.createdAt={gte: since};
  }
  return where;
};

export const jobStart= async(type:string, aId?:number) => {
  const log= await prisma.jobLog.create({
    data:{type, assetId:aId ?? null, status:'RUNNING'}
  });
  return log.id;
};

export const jobDone= async(logId: number) => {
  const log= await prisma.jobLog.findUnique({where:{id: logId}});
  if (!log) return;
  const tym= Date.now()- log.startedAt.getTime();
  await prisma.jobLog.update({
    where:{id:logId},
    data:{status:'DONE', completedAt:new Date(), duration:tym}
  });
};

export const jobFailed= async(logId: number, err: string) => {
  const log= await prisma.jobLog.findUnique({ where: { id: logId } });
  if(!log) return;
  const duration= Date.now()-log.startedAt.getTime();
  await prisma.jobLog.update({
    where:{id: logId},
    data:{status: 'FAILED', completedAt: new Date(), duration, error:err}
  });
};
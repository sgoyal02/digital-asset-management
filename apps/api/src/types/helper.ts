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

  if (filters?.type && filters.type!== "A"){
    const map:any = {I: "image/",V: "video/", AU: "audio/", D: "doc"};
    if (filters.type!== "D") {
      where.mimeType={startsWith:map[filters.type]};
    }
  }

  if (filters?.deptId) {
    where.department= filters.deptId; //chk to do-null?
  }
  return where;
};

import { prisma } from '../../lib/prisma';
import { publishReport } from '../../queue/publisher';
import { ReportFilters } from '../../types';

const CACHE_MIN= 1;
const roleKey=(role:string, uId:number)=> role=== 'ADMIN'? 'ADMIN': `${role}_${uId}`;
const isExp= (calAt:Date)=>{
  const tym= Date.now()- calAt.getTime();
  return tym> CACHE_MIN*60*1000;
};

export class ReportService{
  private async calData(type:'USAGE_TRENDS'|'DUPLICATES'|'COMPLIANCE', userId: number, role: string,filters:ReportFilters){
    const userRole= role=== 'ADMIN'? 'ADMIN': `${role}_${userId}`;
    const days= filters.days?? 5;
    const deptId= filters.deptId?? null;
    const aType= filters.type??null;
    const existData = await prisma.reportCal.findUnique({
      where:{type_role_days:{type, role:userRole, days}},
      // where:{type_role_days_assetType_deptId:{type, role:userRole, days, deptId, assetType:aType}},
    });
    console.log("servie existData: ", existData, isExp);
    if(existData && !isExp(existData.createdAt)) {
      return{data:existData.payload, fresh: true, createdAt:existData.createdAt};
    }
    await publishReport({type,userId, role, days});
    if (existData) {
      return{data:existData.payload, fresh: false,createdAt:existData.createdAt};
    }
    return{data: null, fresh: false, createdAt: null};
  }

  async getUsageTrends(userId:number,role:string, filters:ReportFilters){
    return this.calData('USAGE_TRENDS', userId, role, filters);
  }
  async getDuplicates(userId:number,role:string,filters:ReportFilters){
    return this.calData('DUPLICATES', userId, role, filters)
  }

  async getCompliance(userId:number,role:string, filters:ReportFilters){
    return this.calData('COMPLIANCE', userId, role, filters)
  }

}
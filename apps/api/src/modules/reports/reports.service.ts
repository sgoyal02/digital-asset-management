
import { prisma } from '../../lib/prisma';
import { publishReport } from '../../queue/publisher';
import { ReportFilters } from '../../types';
import { calReport } from '../../workers/report.worker';

const CACHE_MIN= 0.5;
const isExp= (calAt:Date)=>{
  const tym= Date.now()- calAt.getTime();
  return tym> CACHE_MIN*60*1000;
};

export class ReportService{
  private async calData(type:'USAGE_TRENDS'|'DUPLICATES'|'COMPLIANCE', userId: number, role: string,filters:ReportFilters){
    const userRole= role=== 'ADMIN'? 'ADMIN': `${role}_${userId}`;
    const days= filters.days?? 7;
    const deptId= filters.deptId?? -1;
    const assetType= filters.assetType??'A';
    const updatedFil:ReportFilters={days, assetType,deptId};
    const existData = await prisma.reportCal.findUnique({
      where:{type_role_days_assetType_deptId:{type, role:userRole, days, assetType, deptId}},
    });
    if(existData && !isExp(existData.createdAt)) {
      return{data:existData.payload, fresh: true, createdAt:existData.createdAt};
    }
    
    await publishReport({type,userId, role, filters:updatedFil});
    if (existData) {
      return{data:existData.payload, fresh: false,createdAt:existData.createdAt};
    }
    //cal if no cach
    const payload= await calReport(type, userId, role, updatedFil);
    
    await prisma.reportCal.create({
      data: { type, role: userRole, days, assetType, deptId, payload },
    });

    return { data: payload, fresh: true, createdAt: new Date()};
    // return{data: null, fresh: false, createdAt: null};
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
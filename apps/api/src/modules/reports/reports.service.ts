
import { prisma } from '../../lib/prisma';
import { publishReport } from '../../queue/publisher';

const CACHE_MIN= 1;
const roleKey=(role:string, uId:number)=> role=== 'ADMIN'? 'ADMIN': `${role}_${uId}`;
const isExp= (calAt:Date)=>{
  const tym= Date.now()- calAt.getTime();
  return tym> CACHE_MIN*60*1000;
};

export class ReportService{
  private async calData(type:'USAGE_TRENDS'|'DUPLICATES', userId: number, role: string,days:number= 5){
    const userRole = roleKey(role, userId);
    const existData = await prisma.reportCal.findUnique({
      where:{type_role_days:{type, role:userRole, days}},
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

  async getUsageTrends(userId:number,role:string,days:number){
    return this.calData('USAGE_TRENDS', userId, role, days);
  }
  async getDuplicates(userId:number,role:string){
    return this.calData('DUPLICATES', userId, role, 30)
  }

}
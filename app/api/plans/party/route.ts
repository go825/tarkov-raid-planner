import { and, eq, inArray } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { planMembers, raidPlans, taskProgress } from "@/db/schema";

const COLORS=["#d7ff45","#ffb547","#7dd8ff","#f47458","#c6a7ff"];
const parse=(value:string)=>{try{const parsed=JSON.parse(value);return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{}}catch{return {}}};

export async function GET(request:Request){
  const user=await getChatGPTUser();if(!user)return Response.json({error:"Authentication required"},{status:401});
  const url=new URL(request.url),shareId=url.searchParams.get("share"),mode=url.searchParams.get("mode")??"regular";
  if(!shareId||!new Set(["regular","pve"]).has(mode))return Response.json({error:"Invalid request"},{status:400});
  const db=getDb();const [plan]=await db.select().from(raidPlans).where(eq(raidPlans.shareId,shareId)).limit(1);if(!plan)return Response.json({error:"Plan not found"},{status:404});
  const members=await db.select().from(planMembers).where(eq(planMembers.planId,plan.id));
  if(plan.userId!==user.userId&&!members.some((member)=>member.userId===user.userId))return Response.json({error:"Join the squad before viewing progress"},{status:403});
  const roster=[{userId:plan.userId,displayName:plan.ownerName,ready:plan.ownerReady},...members.map((member)=>({userId:member.userId,displayName:member.displayName,ready:member.ready}))];
  const ids=roster.map((member)=>member.userId);const rows=ids.length?await db.select().from(taskProgress).where(and(inArray(taskProgress.userId,ids),eq(taskProgress.gameMode,mode))):[];const byUser=new Map(rows.map((row)=>[row.userId,row]));
  return Response.json({members:roster.map((member,index)=>{const progress=byUser.get(member.userId);return{...member,color:COLORS[index%COLORS.length],taskStates:parse(progress?.taskStates??"{}"),objectiveStates:parse(progress?.objectiveStates??"{}"),updatedAt:progress?.updatedAt??null}})});
}

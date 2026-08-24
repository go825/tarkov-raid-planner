import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { raidPlans } from "@/db/schema";

async function database() { const {getDb}=await import("@/db"); return getDb(); }

function view(plan: typeof raidPlans.$inferSelect) {
  return { map: plan.map, selectedTaskIds: JSON.parse(plan.selectedTaskIds), routeTaskIds: JSON.parse(plan.routeTaskIds), shareId: plan.shareId, updatedAt: plan.updatedAt };
}

export async function GET(request: Request) {
  const url=new URL(request.url); const shareId=url.searchParams.get("share");
  if (shareId) {
    const db=await database();
    const [plan]=await db.select().from(raidPlans).where(eq(raidPlans.shareId,shareId)).limit(1);
    return plan?Response.json({plan:view(plan)}):Response.json({error:"Plan not found"},{status:404});
  }
  const user=await getChatGPTUser(); if(!user) return Response.json({error:"Authentication required"},{status:401});
  const map=url.searchParams.get("map"); if(!map) return Response.json({error:"map is required"},{status:400});
  const db=await database();
  const [plan]=await db.select().from(raidPlans).where(and(eq(raidPlans.userId,user.userId),eq(raidPlans.map,map))).limit(1);
  return Response.json({plan:plan?view(plan):null});
}

export async function PUT(request: Request) {
  const user=await getChatGPTUser(); if(!user) return Response.json({error:"Authentication required"},{status:401});
  const body=await request.json() as {map?:string;selectedTaskIds?:unknown;routeTaskIds?:unknown};
  if(!body.map||!Array.isArray(body.selectedTaskIds)||!Array.isArray(body.routeTaskIds)) return Response.json({error:"Invalid plan"},{status:400});
  const selected=body.selectedTaskIds.filter((id):id is string=>typeof id==="string").slice(0,200);
  const route=body.routeTaskIds.filter((id):id is string=>typeof id==="string"&&selected.includes(id)).slice(0,200);
  const id=`${user.userId}:${body.map}`; const now=new Date().toISOString(); const shareId=crypto.randomUUID().replaceAll("-","").slice(0,16); const db=await database();
  await db.insert(raidPlans).values({id,userId:user.userId,map:body.map,selectedTaskIds:JSON.stringify(selected),routeTaskIds:JSON.stringify(route),shareId,updatedAt:now})
    .onConflictDoUpdate({target:raidPlans.id,set:{selectedTaskIds:JSON.stringify(selected),routeTaskIds:JSON.stringify(route),updatedAt:now}});
  const [plan]=await db.select().from(raidPlans).where(eq(raidPlans.id,id)).limit(1);
  return Response.json({plan:view(plan)});
}

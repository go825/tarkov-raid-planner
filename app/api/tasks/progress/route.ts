import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { taskProgress } from "@/db/schema";

const MODES=new Set(["regular","pve"]);
const parse=(value:string)=>{try{const parsed=JSON.parse(value);return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{}}catch{return {}}};
const clean=(value:unknown,allowed:Set<string>)=>Object.fromEntries(Object.entries(value&&typeof value==="object"&&!Array.isArray(value)?value:{}).filter(([,state])=>allowed.has(String(state))));

export async function GET(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:"Authentication required"},{status:401});const mode=new URL(request.url).searchParams.get("mode")??"regular";if(!MODES.has(mode))return Response.json({error:"Invalid mode"},{status:400});const [row]=await getDb().select().from(taskProgress).where(and(eq(taskProgress.userId,user.userId),eq(taskProgress.gameMode,mode))).limit(1);return Response.json({progress:{taskStates:parse(row?.taskStates??"{}"),objectiveStates:parse(row?.objectiveStates??"{}"),updatedAt:row?.updatedAt??null}})}

export async function PUT(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:"Authentication required"},{status:401});const body=await request.json() as {mode?:string;taskStates?:unknown;objectiveStates?:unknown};const mode=body.mode??"regular";if(!MODES.has(mode))return Response.json({error:"Invalid mode"},{status:400});const taskStates=clean(body.taskStates,new Set(["available","active","completed"]));const objectiveStates=clean(body.objectiveStates,new Set(["pending","in_progress","completed","handover"]));const values={userId:user.userId,gameMode:mode,taskStates:JSON.stringify(taskStates),objectiveStates:JSON.stringify(objectiveStates),updatedAt:new Date().toISOString()};await getDb().insert(taskProgress).values(values).onConflictDoUpdate({target:[taskProgress.userId,taskProgress.gameMode],set:values});return Response.json({progress:{taskStates,objectiveStates,updatedAt:values.updatedAt}})}

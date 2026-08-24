import assert from "node:assert/strict";
import test from "node:test";
import {buildPartyDashboard} from "../lib/planner/party.mjs";

test("merges shared objectives and ranks maps by members and objectives",()=>{
  const tasks=[{id:"task",name:"Shared job",objectives:[{id:"o1",description:"Visit dorms",type:"visit",mapScope:"specific",maps:[{name:"Customs"}]},{id:"o2",description:"Eliminate PMCs",type:"shoot",mapScope:"any",maps:[]}]}];
  const members=[{userId:"a",displayName:"A",color:"#a",taskStates:{task:"active"},objectiveStates:{}},{userId:"b",displayName:"B",color:"#b",taskStates:{task:"active"},objectiveStates:{o2:"completed"}}];
  const result=buildPartyDashboard(tasks,members);
  assert.equal(result.groups.find((group)=>group.id==="o1").owners.length,2);
  assert.deepEqual(result.recommendations[0],{map:"Customs",objectiveCount:2,memberCount:2,score:6,objectiveIds:["o1","o2"]});
});

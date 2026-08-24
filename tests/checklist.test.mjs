import assert from "node:assert/strict";import test from "node:test";import {buildChecklist} from "../lib/planner/checklist.mjs";
const task={id:"task",minPlayerLevel:15,objectives:[{id:"key",type:"findQuestItem",description:"Get case",requiredKeys:[["key-1"]]},{id:"give",type:"giveItem",description:"Hand over markers",count:2,foundInRaid:true,items:["item"]}]};
test("classifies level keys raid work and handover items",()=>{const items=buildChecklist([task],{playerLevel:10,keyIds:[]});assert.deepEqual(items.map((item)=>item.status),["MISSING","MISSING","IN RAID","MISSING"]);assert.equal(items.at(-1).foundInRaid,true)});
test("marks owned key ready",()=>assert.equal(buildChecklist([task],{playerLevel:20,keyIds:["key-1"]})[0].status,"READY"));

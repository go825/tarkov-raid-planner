import assert from "node:assert/strict";
import test from "node:test";
import {isRaidCandidate,isTaskLocked} from "../lib/planner/progress.mjs";

test("locks tasks by level and incomplete prerequisites",()=>{
  assert.equal(isTaskLocked({minPlayerLevel:10,prerequisiteTaskIds:[]},9,{}),true);
  assert.equal(isTaskLocked({minPlayerLevel:1,prerequisiteTaskIds:["first"]},10,{first:"active"}),true);
  assert.equal(isTaskLocked({minPlayerLevel:1,prerequisiteTaskIds:["first"]},10,{first:"completed"}),false);
});

test("raid candidates require active tasks and unfinished objectives once tracking starts",()=>{
  assert.equal(isRaidCandidate({sourceTaskId:"task",objectiveId:"objective"},{},{}),false);
  const task={sourceTaskId:"task",objectiveId:"objective"};
  assert.equal(isRaidCandidate(task,{},{}),false);
  assert.equal(isRaidCandidate(task,{task:"available"},{}),false);
  assert.equal(isRaidCandidate(task,{task:"active"},{objective:"completed"}),false);
  assert.equal(isRaidCandidate(task,{task:"active"},{objective:"in_progress"}),true);
});

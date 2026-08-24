import assert from "node:assert/strict";
import test from "node:test";
import {boundsFor,distance3d,floorFor,objectivePoint,projectPoint} from "../lib/planner/projection.mjs";

test("projects Tarkov x/z coordinates into map percentages",()=>{const bounds=boundsFor([{x:0,y:0,z:0},{x:100,y:0,z:200}],0);assert.deepEqual(projectPoint({x:50,y:0,z:100},bounds),{x:50,y:50})});
test("extracts objective coordinates and classifies floors",()=>{const point=objectivePoint({possibleLocations:[{positions:[{x:2,y:-4,z:8}]}]});assert.deepEqual(point,{x:2,y:-4,z:8});assert.equal(floorFor(point),"B1");assert.equal(floorFor({x:0,y:8,z:0}),"UPPER")});
test("calculates 3d route distance",()=>assert.equal(distance3d({x:0,y:0,z:0},{x:3,y:4,z:12}),13));

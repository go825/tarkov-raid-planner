export function values(record: unknown): any[];
export function translateTree(value: any, primary?: Record<string, string>, fallback?: Record<string, string>): any;
export function mergePatch(base: any, patch: any): any;
export function applyTaskOverlay(tasks: Record<string, any>, overlay: any, mode: string, locale: string): Record<string, any>;
export function hasCoordinates(objective: any): boolean;
export function objectiveMapScope(objective: any): "specific" | "multiple" | "any" | "none";
export function objectiveMatchesMap(objective: any, mapFilter: string): boolean;
export function normalizeTasks(taskRecord: Record<string, any>, mapRecord: Record<string, any>): any[];

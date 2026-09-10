import { Asset } from "cc";

export type ResourceScopeId = string;
export type ResourceLoadKey = string;
export type AssetType<T extends Asset> = new (...args: any[]) => T;
export interface ResourceLoadItem<T extends Asset = Asset> {
    path: string;
    type: AssetType<T>;
}

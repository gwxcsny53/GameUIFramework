import { Asset, SpriteFrame, Prefab, sp, AudioClip } from "cc";
import { IService } from "../../core/service/IService";
import { ResourceLoadKey, ResourceScopeId, ResourceLoadItem } from "./ResourceTypes";

export interface IResourceService extends IService {
    load<T extends Asset>(scopeId: ResourceScopeId, path: string, type: new (...args: any[]) => T): Promise<T>;
    loadMany(scopeId: ResourceScopeId, items: Array<ResourceLoadItem>, onProgress?: (loaded: number, total: number) => void): Promise<Map<ResourceLoadKey, Asset>>;

    loadSpriteFrame(scopeId: ResourceScopeId, path: string): Promise<SpriteFrame>;
    loadPrefab(scopeId: ResourceScopeId, path: string): Promise<Prefab>;
    loadSkeleton(scopeId: ResourceScopeId, path: string): Promise<sp.SkeletonData>;
    loadAudio(scopeId: ResourceScopeId, path: string): Promise<AudioClip>;

    release(scopeId: ResourceScopeId, path: string, type: new (...args: any[]) => Asset): void;
    disposeScope(scopeId: ResourceScopeId): void;
}

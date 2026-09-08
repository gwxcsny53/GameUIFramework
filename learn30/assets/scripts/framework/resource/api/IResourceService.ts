import { Asset, SpriteFrame, Prefab, sp, AudioClip } from "cc";
import { IService } from "../../core/service/IService";
import { ResourceLoadItem } from "../internal/ResourceService";
import { ResourceLoadKey } from "./ResourceTypes";

export interface IResourceService extends IService {
    load<T extends Asset>(scopeId: string, path: string, type: new (...args: any[]) => T): Promise<T>;
    loadMany(scopeId: string, items: Array<ResourceLoadItem>, onProgress?: (loaded: number, total: number) => void): Promise<Map<ResourceLoadKey, Asset>>;

    loadSpriteFrame(scopeId: string, path: string): Promise<SpriteFrame>;
    loadPrefab(scopeId: string, path: string): Promise<Prefab>;
    loadSkeleton(scopeId: string, path: string): Promise<sp.SkeletonData>;
    loadAudio(scopeId: string, path: string): Promise<AudioClip>;

    release(scopeId: string, path: string, type: new (...args: any[]) => Asset): void;
}

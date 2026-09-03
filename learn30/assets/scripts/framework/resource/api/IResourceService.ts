import { Asset, SpriteFrame, Prefab, sp, AudioClip } from "cc";
import { IService } from "../../core/service/IService";

export interface IResourceService extends IService {
    load<T extends Asset>(scopeId: string, path: string, type: new (...args: any[]) => T): Promise<T>;

    loadSpriteFrame(scopeId: string, path: string): Promise<SpriteFrame>;
    loadPrefab(scopeId: string, path: string): Promise<Prefab>;
    loadSkeleton(scopeId: string, path: string): Promise<sp.SkeletonData>;
    loadAudio(scopeId: string, path: string): Promise<AudioClip>;

    release(scopeId: string, path: string, type: new (...args: any[]) => Asset): void;
}

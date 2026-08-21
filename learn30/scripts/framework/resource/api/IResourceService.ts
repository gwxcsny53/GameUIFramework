import { Asset, SpriteFrame, Prefab, sp, AudioClip } from "cc";
import { IService } from "../../core/service/IService";

export interface IResourceService extends IService {
    load<T extends Asset>(path: string, type: new (...args: any[]) => T): Promise<T>;

    loadSpriteFrame(path: string): Promise<SpriteFrame>;
    loadPrefab(path: string): Promise<Prefab>;
    loadSkeleton(path: string): Promise<sp.SkeletonData>;
    loadAudio(path: string): Promise<AudioClip>;

    release(path: string, type: new (...args: any[]) => Asset): void;
}

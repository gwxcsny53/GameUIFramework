import { Asset, SpriteFrame, Prefab, sp, AudioClip, resources } from "cc";
import { IResourceService } from "../api/IResourceService";
import { AssetCache } from "./AssetCache";

type AssetType<T extends Asset> = new (...args: any[]) => T;

export class ResourceService implements IResourceService {
    public readonly name = "ResourceService";

    private cache = new AssetCache();

    public async init(): Promise<void> {}

    public async start(): Promise<void> {}

    public async clear(): Promise<void> {}

    public async load<T extends Asset>(path: string, type: AssetType<T>): Promise<T> {
        const key = this.makeKey(path, type);
        // 查找缓存
        const catched = this.cache.get<T>(key);
        if (catched) {
            return catched;
        }
        // 加载资源
        const asset = await this.loadAsset<T>(path, type);
        // 缓存
        this.cache.set(key, asset);

        return asset;
    }

    public async loadSpriteFrame(path: string): Promise<SpriteFrame> {
        return this.load(path, SpriteFrame);
    }

    public async loadPrefab(path: string): Promise<Prefab> {
        return this.load(path, Prefab);
    }

    public async loadSkeleton(path: string): Promise<sp.SkeletonData> {
        return this.load(path, sp.SkeletonData);
    }

    public async loadAudio(path: string): Promise<AudioClip> {
        return this.load(path, AudioClip);
    }

    public release(path: string, type: new (...args: any[]) => Asset): void {}

    private loadAsset<T extends Asset>(path: string, type: AssetType<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, type, (err, asset) => {
                if (err || !asset) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    private makeKey<T extends Asset>(path: string, type: AssetType<T>): string {
        return `${type.name}:${path}`;
    }
}

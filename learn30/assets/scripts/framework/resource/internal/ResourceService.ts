import { Asset, SpriteFrame, Prefab, sp, AudioClip, resources } from "cc";
import { IResourceService } from "../api/IResourceService";
import { AssetCache } from "./AssetCache";

type AssetType<T extends Asset> = new (...args: any[]) => T;
type ScopeId = string;
type LoadKey = string;
export class ResourceService implements IResourceService {
    public readonly name = "ResourceService";

    private cache = new AssetCache();

    private _scopeKeys = new Map<ScopeId, Set<LoadKey>>();

    public async init(): Promise<void> {}

    public async start(): Promise<void> {}

    public async clear(): Promise<void> {
        if (this._scopeKeys.size > 0) {
            const scopeIds = Array.from(this._scopeKeys.keys());
            for (const scopeId of scopeIds) {
                this.disposeScope(scopeId);
            }
        }
        this.cache.clear();
        this._scopeKeys.clear();
    }

    public async load<T extends Asset>(scopeId: ScopeId, path: string, type: AssetType<T>): Promise<T> {
        const key = this.makeKey(path, type);
        // 查找缓存
        const cacheEntry = this.cache.get<T>(key);

        if (cacheEntry) {
            const cachedAsset = cacheEntry.asset;
            if (!cacheEntry.holders.has(scopeId)) {
                cacheEntry.asset.addRef();
                cacheEntry.holders.add(scopeId);

                this.trackScope(scopeId, key);
            }
            return cachedAsset;
        }
        // 加载资源
        const asset = await this.loadAsset<T>(path, type);
        asset.addRef(); // 增加引用计数，防止被自动释放
        // 缓存
        this.cache.set(key, {
            asset,
            holders: new Set([scopeId]),
        });

        this.trackScope(scopeId, key);

        return asset;
    }

    public async loadSpriteFrame(scopeId: ScopeId, path: string): Promise<SpriteFrame> {
        return this.load(scopeId, path, SpriteFrame);
    }

    public async loadPrefab(scopeId: ScopeId, path: string): Promise<Prefab> {
        return this.load(scopeId, path, Prefab);
    }

    public async loadSkeleton(scopeId: ScopeId, path: string): Promise<sp.SkeletonData> {
        return this.load(scopeId, path, sp.SkeletonData);
    }

    public async loadAudio(scopeId: ScopeId, path: string): Promise<AudioClip> {
        return this.load(scopeId, path, AudioClip);
    }

    public release<T extends Asset>(scopeId: ScopeId, path: string, type: AssetType<T>): void {
        const key = this.makeKey(path, type);
        this.releaseByKey(scopeId, key);
    }

    public disposeScope(scopeId: ScopeId): void {
        if (!this._scopeKeys.has(scopeId)) {
            return;
        }
        const keys = this._scopeKeys.get(scopeId);
        if (!keys || keys.size === 0) {
            return;
        }

        const keyList = Array.from(keys);

        for (const key of keyList) {
            this.releaseByKey(scopeId, key);
        }
    }

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

    private makeKey<T extends Asset>(path: string, type: AssetType<T>): LoadKey {
        return `${type.name}:${path}`;
    }

    private trackScope(scopeId: ScopeId, key: LoadKey): void {
        let keys = this._scopeKeys.get(scopeId);
        if (!keys) {
            keys = new Set<LoadKey>();
            this._scopeKeys.set(scopeId, keys);
        }
        keys.add(key);
    }

    private releaseByKey(scopeId: ScopeId, key: LoadKey) {
        const cacheEntry = this.cache.get(key);
        if (!cacheEntry) {
            return;
        }
        if (!cacheEntry.holders.has(scopeId)) {
            return;
        }

        if (this._scopeKeys.has(scopeId)) {
            this._scopeKeys.get(scopeId).delete(key);
        }

        cacheEntry.holders.delete(scopeId);
        cacheEntry.asset.decRef();

        const keys = this._scopeKeys.get(scopeId);
        if (keys) {
            keys.delete(key);
            if (keys.size === 0) {
                this._scopeKeys.delete(scopeId);
            }
        }

        if (cacheEntry.holders.size === 0) {
            this.cache.remove(key);
        }
    }
}

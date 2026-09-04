import { Asset, SpriteFrame, Prefab, sp, AudioClip, resources } from "cc";
import { IResourceService } from "../api/IResourceService";
import { AssetCache } from "./AssetCache";
import { ResourceLoadKey, ResourceScopeId } from "../api/ResourceTypes";

type AssetType<T extends Asset> = new (...args: any[]) => T;

export class ResourceService implements IResourceService {
    public readonly name = "ResourceService";

    private cache = new AssetCache();
    // scopeId -> Set<ResourceLoadKey>  与 cache 存储相反的关系
    private _scopeKeys = new Map<ResourceScopeId, Set<ResourceLoadKey>>();
    // ResourceLoadKey -> Promise<Asset> 防止同一个资源多次加载
    private _loadings = new Map<ResourceLoadKey, Promise<Asset>>();

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

    public async load<T extends Asset>(scopeId: ResourceScopeId, path: string, type: AssetType<T>): Promise<T> {
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
        // 检查是否正在loading
        const loading = this._loadings.get(key);
        if (loading) {
            const asset = (await loading) as T;
            const cacheEntry = this.cache.get<T>(key);

            if (cacheEntry && !cacheEntry.holders.has(scopeId)) {
                cacheEntry.asset.addRef();
                cacheEntry.holders.add(scopeId);
                this.trackScope(scopeId, key);
            }
            return asset;
        }
        // 无cache 非loading 进行初次加载
        const loadAndCache = this.loadAndCache(path, type, key);
        this._loadings.set(key, loadAndCache);
        try {
            const asset = await loadAndCache;
            const cacheEntry = this.cache.get(key);
            if (!cacheEntry) {
                throw new Error(`[ResourceService] Asset loaded but cache entry missing: ${key}`);
            }
            if (!cacheEntry.holders.has(scopeId)) {
                asset.addRef(); // 增加引用计数，防止被自动释放
                cacheEntry.holders.add(scopeId);
                this.trackScope(scopeId, key);
            }
            return asset;
        } finally {
            this._loadings.delete(key);
        }
    }

    public async loadSpriteFrame(scopeId: ResourceScopeId, path: string): Promise<SpriteFrame> {
        return this.load(scopeId, path, SpriteFrame);
    }

    public async loadPrefab(scopeId: ResourceScopeId, path: string): Promise<Prefab> {
        return this.load(scopeId, path, Prefab);
    }

    public async loadSkeleton(scopeId: ResourceScopeId, path: string): Promise<sp.SkeletonData> {
        return this.load(scopeId, path, sp.SkeletonData);
    }

    public async loadAudio(scopeId: ResourceScopeId, path: string): Promise<AudioClip> {
        return this.load(scopeId, path, AudioClip);
    }
    /**
     * 释放指定scopeId下的指定path资源
     * @param scopeId
     * @param path
     * @param type
     */
    public release<T extends Asset>(scopeId: ResourceScopeId, path: string, type: AssetType<T>): void {
        const key = this.makeKey(path, type);
        this.releaseByKey(scopeId, key);
    }
    /**
     * 释放相同ScopeId的所有资源
     * @param scopeId
     * @returns
     */
    public disposeScope(scopeId: ResourceScopeId): void {
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

    private makeKey<T extends Asset>(path: string, type: AssetType<T>): ResourceLoadKey {
        return `${type.name}:${path}`;
    }

    private trackScope(scopeId: ResourceScopeId, key: ResourceLoadKey): void {
        let keys = this._scopeKeys.get(scopeId);
        if (!keys) {
            keys = new Set<ResourceLoadKey>();
            this._scopeKeys.set(scopeId, keys);
        }
        keys.add(key);
    }

    private releaseByKey(scopeId: ResourceScopeId, key: ResourceLoadKey) {
        const cacheEntry = this.cache.get(key);
        if (!cacheEntry) {
            return;
        }
        if (!cacheEntry.holders.has(scopeId)) {
            return;
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

    private async loadAndCache<T extends Asset>(path: string, type: AssetType<T>, key: ResourceLoadKey): Promise<T> {
        const asset = await this.loadAsset<T>(path, type);

        this.cache.set(key, {
            asset,
            holders: new Set(),
        });

        return asset;
    }
}

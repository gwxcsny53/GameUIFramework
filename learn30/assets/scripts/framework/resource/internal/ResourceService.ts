import { Asset, SpriteFrame, Prefab, sp, AudioClip, resources, isValid } from "cc";
import { IResourceService } from "../api/IResourceService";
import { AssetCache, CacheEntry } from "./AssetCache";
import { ResourceLoadKey, ResourceScopeId } from "../api/ResourceTypes";

type AssetType<T extends Asset> = new (...args: any[]) => T;

interface LoadingEntry<T extends Asset = Asset> {
    promise: Promise<T>;
    waiters: number;
}

export class ResourceService implements IResourceService {
    public readonly name = "ResourceService";

    private cache = new AssetCache();
    // scopeId -> Set<ResourceLoadKey>  与 cache 存储相反的关系
    private _scopeKeys = new Map<ResourceScopeId, Set<ResourceLoadKey>>();
    // ResourceLoadKey -> Promise<Asset> 防止同一个资源多次加载
    private _loadings = new Map<ResourceLoadKey, LoadingEntry>();
    // scopeVersions 记录每个scopeId的版本号,检查disposeScope后是否获取的还是上一代的资源版本
    private _scopeVersions = new Map<ResourceScopeId, number>();
    // 用于clear的全局版本 每次clear都会将之前版本{加载/正在加载}的内容清空
    private _globalVersion = 0;

    public async init(): Promise<void> {}

    public async start(): Promise<void> {}

    public async clear(): Promise<void> {
        this._globalVersion++;

        if (this._scopeKeys.size > 0) {
            const scopeIds = Array.from(this._scopeKeys.keys());
            for (const scopeId of scopeIds) {
                this.disposeScope(scopeId);
            }
        }
        this._scopeKeys.clear();
    }

    public async load<T extends Asset>(scopeId: ResourceScopeId, path: string, type: AssetType<T>): Promise<T> {
        const key = this.makeKey(path, type);
        const version = this.getScopeVersion(scopeId);
        const globalVersion = this._globalVersion;
        // 查找缓存
        let cacheEntry = this.cache.get<T>(key);
        if (cacheEntry) {
            const cachedAsset = cacheEntry.asset;
            if (!isValid(cachedAsset)) {
                // throw new Error(`[ResourceService] ${scopeId} asset 已经被释放`);
                this.removeInvalidedCacheEntry(key, cacheEntry);
                cacheEntry = null;
            } else {
                this.attachScope(cacheEntry, scopeId, key);
                return cachedAsset;
            }
        }

        // 检查是否正在loading
        let loadingEntry = this._loadings.get(key) as LoadingEntry<T> | undefined;
        if (!loadingEntry) {
            const promise = this.loadAndCache(path, type, key);
            loadingEntry = { promise, waiters: 0 };
            this._loadings.set(key, loadingEntry);
        }

        loadingEntry.waiters++;

        try {
            const asset = await loadingEntry.promise;
            if (!isValid(asset)) {
                throw new Error(`[ResourceService] ${scopeId} asset 已经被释放`);
            }
            if (!this.isRequestValid(scopeId, version, globalVersion)) {
                throw new Error(`[ResourceService] ${scopeId} version 版本过期 , stale request!`);
            }
            const cacheEntry = this.cache.get<T>(key);
            if (!cacheEntry) {
                throw new Error(`[ResourceService] Asset loaded but cache entry missing: ${key}`);
            }
            this.attachScope(cacheEntry, scopeId, key);
            return asset;
        } finally {
            loadingEntry.waiters--;

            if (loadingEntry.waiters === 0) {
                if (this._loadings.get(key) === loadingEntry) {
                    this._loadings.delete(key);
                }

                const cacheEntry = this.cache.get<T>(key);

                if (cacheEntry && cacheEntry.holders.size === 0) {
                    this.cache.remove(key);
                }
            }
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
        // 放在最前面,就是防止还未设置上scopeKey时就执行了disposeScope
        // 更新 scppeId 版本号
        this.bumpScopeVersion(scopeId);

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
        if (isValid(cacheEntry.asset)) {
            cacheEntry.asset.decRef();
        }

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

    private getScopeVersion(scopeId: ResourceScopeId): number {
        const version = this._scopeVersions.get(scopeId);
        return version ?? 0;
    }

    private bumpScopeVersion(scopeId: ResourceScopeId): void {
        const version = this.getScopeVersion(scopeId);
        this._scopeVersions.set(scopeId, version + 1);
    }

    private attachScope<T extends Asset>(cacheEntry: CacheEntry<T>, scopeId: ResourceScopeId, key: ResourceLoadKey) {
        if (cacheEntry.holders.has(scopeId)) {
            return;
        }

        cacheEntry.asset.addRef(); // 增加引用计数，防止被自动释放
        cacheEntry.holders.add(scopeId);
        this.trackScope(scopeId, key);
    }

    private isRequestValid(scopeId: ResourceScopeId, scopeVersion: number, globalVersion: number): boolean {
        return scopeVersion === this.getScopeVersion(scopeId) && globalVersion === this._globalVersion;
    }

    private removeInvalidedCacheEntry(key: ResourceLoadKey, cacheEntry: CacheEntry) {
        for (const scopeId of cacheEntry.holders) {
            const keys = this._scopeKeys.get(scopeId);
            if (!keys) {
                continue;
            }

            keys.delete(key);

            if (keys.size === 0) {
                this._scopeKeys.delete(scopeId);
            }
        }

        this.cache.remove(key);
    }
}

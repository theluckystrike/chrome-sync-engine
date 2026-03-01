/**
 * Sync Engine — Two-way sync between storage.sync and local
 */
export class SyncEngine {
    private syncKey: string;
    private mergeStrategy: 'local-wins' | 'remote-wins' | 'newest' = 'newest';

    constructor(syncKey: string = '__sync_data__', strategy?: 'local-wins' | 'remote-wins' | 'newest') {
        this.syncKey = syncKey;
        if (strategy) this.mergeStrategy = strategy;
    }

    /** Push local data to sync storage */
    async push(data: Record<string, any>): Promise<void> {
        const payload = { ...data, __syncTs: Date.now() };
        const size = JSON.stringify(payload).length;
        if (size > 102400) throw new Error(`Sync data exceeds 100KB quota (${(size / 1024).toFixed(1)}KB)`);
        await chrome.storage.sync.set({ [this.syncKey]: payload });
    }

    /** Pull data from sync storage */
    async pull(): Promise<Record<string, any> | null> {
        const result = await chrome.storage.sync.get(this.syncKey);
        return result[this.syncKey] || null;
    }

    /** Sync local and remote data */
    async sync(localData: Record<string, any>): Promise<Record<string, any>> {
        const remote = await this.pull();
        if (!remote) { await this.push(localData); return localData; }

        const merged = this.merge(localData, remote);
        await this.push(merged);
        await chrome.storage.local.set({ [this.syncKey]: merged });
        return merged;
    }

    /** Merge local and remote data */
    private merge(local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
        switch (this.mergeStrategy) {
            case 'local-wins': return { ...remote, ...local };
            case 'remote-wins': return { ...local, ...remote };
            case 'newest': {
                const localTs = local.__syncTs || 0;
                const remoteTs = remote.__syncTs || 0;
                return localTs >= remoteTs ? { ...remote, ...local } : { ...local, ...remote };
            }
        }
    }

    /** Get sync quota usage */
    async getQuotaUsage(): Promise<{ used: number; total: number; percent: number }> {
        const result = await chrome.storage.sync.get(this.syncKey);
        const used = JSON.stringify(result).length;
        return { used, total: 102400, percent: Math.round((used / 102400) * 100) };
    }

    /** Listen for sync changes from other devices */
    onRemoteChange(callback: (data: Record<string, any>) => void): void {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync' && changes[this.syncKey]?.newValue) {
                callback(changes[this.syncKey].newValue);
            }
        });
    }

    /** Clear sync data */
    async clear(): Promise<void> { await chrome.storage.sync.remove(this.syncKey); }
}

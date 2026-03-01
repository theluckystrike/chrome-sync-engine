# chrome-sync-engine — Two-Way Storage Sync
> **Built by [Zovo](https://zovo.one)** | `npm i chrome-sync-engine`

Sync between chrome.storage.sync and local with merge strategies, quota management, and remote change detection.

```typescript
import { SyncEngine } from 'chrome-sync-engine';
const sync = new SyncEngine('settings', 'newest');
const merged = await sync.sync(localSettings);
sync.onRemoteChange((data) => applySettings(data));
const usage = await sync.getQuotaUsage();
```
MIT License

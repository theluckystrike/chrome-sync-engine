# chrome-sync-engine

Two-way storage sync for Chrome extensions. Handles conflict resolution with configurable merge strategies, quota management, and real-time change listeners. Built for Manifest V3.

INSTALLATION

```bash
npm install chrome-sync-engine
```

QUICK START

```typescript
import { SyncEngine } from 'chrome-sync-engine';

const engine = new SyncEngine();

// Sync local data with remote storage
const merged = await engine.sync({ theme: 'dark', fontSize: 14 });

// Push data to sync storage directly
await engine.push({ theme: 'dark', fontSize: 14 });

// Pull latest data from sync storage
const remote = await engine.pull();
```

MERGE STRATEGIES

The constructor accepts a storage key and one of three merge strategies.

```typescript
// Local data always wins conflicts
const engine = new SyncEngine('my_key', 'local-wins');

// Remote data always wins conflicts
const engine = new SyncEngine('my_key', 'remote-wins');

// Most recent write wins (default)
const engine = new SyncEngine('my_key', 'newest');
```

When no key is provided, the default storage key is `__sync_data__`.

API

SyncEngine(syncKey?, strategy?)

Creates a new sync engine instance.

- syncKey (string, optional) - Storage key used in chrome.storage.sync. Defaults to `__sync_data__`.
- strategy (string, optional) - One of `local-wins`, `remote-wins`, or `newest`. Defaults to `newest`.

push(data)

Pushes a local data object to chrome.storage.sync. Throws if the payload exceeds the 100KB sync quota.

pull()

Pulls the current data from chrome.storage.sync. Returns `null` if nothing is stored.

sync(localData)

Two-way sync. Pulls remote data, merges it with localData using the configured strategy, then writes the result to both sync and local storage. Returns the merged object.

getQuotaUsage()

Returns an object with `used` (bytes), `total` (102400), and `percent` fields showing current sync storage consumption.

onRemoteChange(callback)

Registers a listener for changes made on other devices. The callback receives the new data object whenever remote sync storage updates.

clear()

Removes all data stored under the sync key.

QUOTA MANAGEMENT

Chrome sync storage has a 100KB per-item limit. The engine validates payload size before writing and throws a descriptive error if the data exceeds the quota.

```typescript
const usage = await engine.getQuotaUsage();
console.log(`Using ${usage.percent}% of sync quota`);
```

LISTENING FOR REMOTE CHANGES

React to changes pushed from other signed-in devices.

```typescript
engine.onRemoteChange((data) => {
  console.log('Remote update received', data);
  applySettings(data);
});
```

REQUIREMENTS

- Chrome extension with `storage` permission declared in manifest.json
- Manifest V3 compatible

DEVELOPMENT

```bash
git clone https://github.com/theluckystrike/chrome-sync-engine.git
cd chrome-sync-engine
npm install
npm run build
```

LICENSE

MIT. See LICENSE file for details.

---

Built by theluckystrike. Part of the zovo.one ecosystem.

[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / createRemoteBrowser

# Function: createRemoteBrowser()

```ts
function createRemoteBrowser(options): RemoteBrowser;
```

Defined in: [src/sync/createRemoteBrowser.ts:172](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/createRemoteBrowser.ts#L172)

Creates a stateful directory browser around a remote file system.

The returned browser caches the most recent listing and applies sort/filter
settings on each refresh. Navigation methods return a snapshot so UI layers can
render synchronously without re-reading state.

## Parameters

| Parameter | Type                                                                        | Description            |
| --------- | --------------------------------------------------------------------------- | ---------------------- |
| `options` | [`CreateRemoteBrowserOptions`](../interfaces/CreateRemoteBrowserOptions.md) | Browser configuration. |

## Returns

[`RemoteBrowser`](../interfaces/RemoteBrowser.md)

Stateful browser bound to the supplied file system.

# CLI Cross-Repo Dependency Matrix

> **Purpose**: Keep public CLI work aligned with premium APIs.
> Update this file when adding CLI commands or premium endpoints.

## Why This Matters

- Prevents drift between CLI client and premium backend
- Clarifies which premium endpoints power each CLI command
- Speeds up planning and reduces integration bugs

---

## Matrix: Public CLI → Premium API

### CLI Login (`jeffreysprompts.com-uw7z`)

| Premium Component | Bead ID |
|-------------------|---------|
| Device code endpoints | `jeffreysprompts_premium-0o1` |
| Verification page | `jeffreysprompts_premium-qdm` |
| CLI auth page | `jeffreysprompts_premium-mn0` |
| JWT/token utilities | `jeffreysprompts_premium-qnl` |
| Refresh/revoke tokens | `jeffreysprompts_premium-0ve` |
| device_codes schema | `jeffreysprompts_premium-h8r` |
| CLI device code tests | `jeffreysprompts_premium-wdao` |

### CLI Sync (`jeffreysprompts.com-hiff`)

| Premium Component | Bead ID |
|-------------------|---------|
| CLI sync endpoints | `jeffreysprompts_premium-67o` |

### CLI Collections (`jeffreysprompts.com-wlg3`)

| Premium Component | Bead ID |
|-------------------|---------|
| Collections endpoints (via sync) | `jeffreysprompts_premium-67o` |

### CLI Offline/Cache (`jeffreysprompts.com-xzgq`)

| Premium Component | Bead ID |
|-------------------|---------|
| Sync endpoints for offline data | `jeffreysprompts_premium-67o` |

### CLI API Documentation (`jeffreysprompts.com-t524`)

| Premium Component | Bead ID |
|-------------------|---------|
| Sync endpoints | `jeffreysprompts_premium-67o` |
| Device code endpoints | `jeffreysprompts_premium-0o1` |
| Token refresh/revoke | `jeffreysprompts_premium-0ve` |
| JWT utilities | `jeffreysprompts_premium-qnl` |

### CLI Integration Docs (`jeffreysprompts.com-rd99`)

| Premium Component | Bead ID |
|-------------------|---------|
| Device code endpoints | `jeffreysprompts_premium-0o1` |
| Verification page | `jeffreysprompts_premium-qdm` |
| CLI auth page | `jeffreysprompts_premium-mn0` |
| JWT utilities | `jeffreysprompts_premium-qnl` |
| Token refresh/revoke | `jeffreysprompts_premium-0ve` |
| Sync endpoints | `jeffreysprompts_premium-67o` |

---

## Matrix: Premium API → Public CLI Consumers

### Skills CRUD & Install/Export Endpoints (`jeffreysprompts_premium-6x3`)

| Public Consumer | Bead ID |
|-----------------|---------|
| CLI skills commands | `jeffreysprompts.com-bojj` |
| CLI API documentation | `jeffreysprompts.com-t524` |
| CLI integration docs | `jeffreysprompts.com-rd99` |

---

## Update Rules

1. **Adding a new CLI command**: Add the premium dependency to this matrix
2. **Adding a new premium CLI endpoint**: Add the public CLI consumer to this matrix
3. **Removing a command/endpoint**: Update both sections accordingly

---

## Premium Endpoint Summary

| Endpoint Category | Bead ID | Description |
|-------------------|---------|-------------|
| Device Code Auth | `jeffreysprompts_premium-0o1` | OAuth device flow endpoints |
| Verification UI | `jeffreysprompts_premium-qdm` | User verification page |
| CLI Auth UI | `jeffreysprompts_premium-mn0` | CLI authentication page |
| JWT Utils | `jeffreysprompts_premium-qnl` | Token generation/validation |
| Token Lifecycle | `jeffreysprompts_premium-0ve` | Refresh and revocation |
| Device Codes Schema | `jeffreysprompts_premium-h8r` | Database schema for device codes |
| CLI Sync | `jeffreysprompts_premium-67o` | Library sync, collections, offline |
| Skills CRUD | `jeffreysprompts_premium-6x3` | Skills management API |
| Device Code Tests | `jeffreysprompts_premium-wdao` | E2E tests for device code flow |

---

## Cross-Repo Mirror

This document is mirrored in the premium repo:
- Premium bead: `jeffreysprompts_premium-zqsv`

Keep both copies in sync when making updates.

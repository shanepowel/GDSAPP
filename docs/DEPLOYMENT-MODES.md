# Two deployments: internal vs client

Play A and Play B must not share one URL or one database with mixed roles. Run **two Vercel projects** (or two environments with separate databases).

| Vercel project | Env | Audience | Database |
|----------------|-----|----------|----------|
| `assemble-internal` | `DEPLOYMENT_MODE=internal` | Amplified delivery teams | Neon DB A (private) |
| `assemble-client` | `DEPLOYMENT_MODE=client` | NRW (or authority) operators | Neon DB B (NRW-owned) |

Set both on the server and in the browser:

```env
DEPLOYMENT_MODE=client
NEXT_PUBLIC_DEPLOYMENT_MODE=client
```

## What changes in the UI

| Feature | Internal | Client |
|---------|----------|--------|
| Banner | Play A delivery instance | Play B client assurance |
| Portfolio | Delivery roll-up | Portfolio assurance (emphasised) |
| Handover pack | Hidden from nav (use when delivering B) | In nav |
| Call-off page | Competitive framing, point-movers | Assurance criteria, priority gaps |
| `/api/health` | Reports `deploymentMode` | Same |

## Conflict firewall

- Never point supplier staff at the **client** database or URL to review bids.
- Never load competitor submission data into the **internal** instance for NRW governance.
- Handover pack (in-app and `docs/handover/`) documents NRW operation.

See [NRW-FRAMEWORK-STRATEGY.md](./NRW-FRAMEWORK-STRATEGY.md) section 3.

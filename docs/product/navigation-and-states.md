# Navigation and journey map

Task UIX-01 preparation. The paths below are intended routes, not claims that those screens are implemented. Existing dashboard/widget still show foundation status. Merchant workflow approval remains DEC-02.

## Merchant navigation

| Area | Intended path | Primary job | Required states |
| --- | --- | --- | --- |
| Account | /login, /signup, /recover | Establish/recover verified identity | Invalid/expired link, retry, revoked session |
| Onboarding | /onboarding | Resume workspace/store/knowledge/widget setup | Saved step, missing permission, failed sync, test-only vs enabled |
| Inbox | /inbox and /inbox/:conversationId | Discover, reply, assign and resolve | Loading, no conversations, filtered empty, failed fetch, permission denied, disconnected, stale revision |
| Knowledge | /knowledge and /knowledge/:sourceId | Import, review, replace and remove | Every intake state, partial extraction, pending review, deletion in progress |
| Integrations | /integrations | Connect one store; inspect current health | Disconnected, connecting, syncing, ready, expired/revoked, retrying |
| Usage | /usage | Understand volume/cost/limits | No data, delayed reconciliation, near cap, exhausted, disputed unit |
| Settings | /settings/business, /settings/team | Business policy, staff and permissions | Unsaved edits, invalid fields, expired invite, last-owner protection |
| Billing | /settings/billing | Plan, invoices and cancellation | Trial, active, pending change, failed payment, cancellation scheduled, cancelled |
| Privacy/offboarding | /settings/data | Export, delete, disconnect | Reauthentication, pending export/deletion, retention exception, completion evidence |

The header holds organization switching, current identity and global notices. Inbox is the single source for conversations: product/order/knowledge views link to the same conversation rather than creating parallel inboxes. Staff notes are visually and technically distinct from shopper messages.

## Shopper journey

Open widget -> clear AI disclosure and channel availability -> message -> visible sending/delivered/failed state -> grounded answer/product choice OR private-order verification -> optional merchant checkout -> human request/takeover -> resolution. Never claim a human is online without coverage evidence. Offline contact capture states its purpose and expected support window.

## Interaction requirements

Keyboard access follows meaningful DOM order; visible focus, skip/navigation landmarks and accessible control names are required. Opening a dialog moves focus into it and closing returns focus to its trigger. Error summaries link to fields; asynchronous status is announced without repeatedly reading the whole transcript. Mobile navigation collapses without hiding primary inbox/handoff actions. Empty screens offer the next valid action; unauthorized screens never briefly render another tenant's data.

Authentication, tenant isolation and working APIs precede acceptance of connected screens. Mock screen states must be labeled and cannot be marked as completed merchant journeys.

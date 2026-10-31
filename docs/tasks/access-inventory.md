# Access and approval inventory

Recorded 2026-10-31. This inventory contains no credential values. Account ownership and incident responsibility are different decisions.

| Capability | Observed status | Needed for acceptance |
| --- | --- | --- |
| GitHub repository | Authorized read/write operations succeeded for NanaAddoDBa/AI-Sales-Customer-Support-SaaS; branch and PR created | Review/merge decision; keep remote SHA evidence |
| GitHub checks | Hosted workflows can install the pinned lockfile and execute checks | Passing results at the tested commit, not merely a workflow file |
| User Windows folder | Earlier checkpoint records the requested path; this session has no mounted C: drive | Local Codex must inspect dirty files, fetch safely, run checks and record actual HEAD |
| Local database | No current disposable database was started by this batch | Approved local runtime, migrations and real two-tenant/actual-role tests |
| Hosted database/auth/storage | No project selected, provisioned or modified in this batch | Explicit development project and authorized configuration; production separate |
| Model provider | No live credential, endpoint or processing policy validated | Approved provider/project, region/processing settings and spend limit |
| Commerce store | No pilot store/platform authorization supplied to this batch | Choose the real store/connector, installation permission and test orders |
| Billing | No billing account or distribution route validated | Route-compatible provider, test account and owner business verification |
| Hosting | No application resources provisioned | Approved accounts, projects, regions and spending ceiling |
| DNS/domain | No intended domain or control validated | Owner-selected domain and authorized DNS changes |
| Transactional email | Only synthetic no-network transport implemented | Sender-domain verification, provider credentials and authorized delivery tests |
| WhatsApp | No business/number assets changed or messages sent | Channel scope, authorized business/number, relevant access and real-channel tests |
| Privacy/commercial review | No legal approval asserted | Actual business identity, policies, provider chain and appropriate review |
| Operations | No on-call or support responsibility assigned by this batch | Named operator, coverage, alert destination and recovery expectations |

## Handling access

Use the account owner's approved secret/environment interface. Never commit credentials, place them in a task ledger, or paste them into ordinary chat. Do not infer unrestricted production access from a connected app. Inspect a designated development resource before modifying it. No purchases, real charges, live customer messages or production deployments are authorized by this inventory.

## Windows reconciliation

Target: `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`.

Inspect the Git root, origin, current branch, HEAD and dirty files first. Fetch the implementation branch. Preserve unrelated changes and use a normal fast-forward or reviewed merge; never reset the user's directory or force-push. Run the documented checks locally and record the matching local/remote SHAs. Hosted CI cannot replace this check.

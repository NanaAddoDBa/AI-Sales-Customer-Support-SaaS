# Cost model

Checked against official public pages on 20 October 2026. Vendor prices below are in USD unless explicitly stated in EUR. Estimates are not quotes, exchange-rate conversions, capacity guarantees or profit forecasts. VAT/taxes, card currency conversion, developer labor, legal/security review, acquisition costs, WhatsApp charges and payment fees are additional unless stated.

## Small hosted setup, before AI and channel/payment fees

| Item | Monthly planning amount | Basis |
|---|---:|---|
| Static dashboard/widget hosting | $0 | Cloudflare Pages static-asset requests are free; dynamic functions and other limits are separate [S3] |
| Production + small staging database projects | $35 | Supabase Pro starts at $25; another project starts at $10 [S1] |
| API + worker + light staging runtime | $20–60 | Own resource estimate; Railway Pro has a $20 usage minimum, not $20 plus the same included usage [S2] |
| Transactional email | $0–20 | Resend Free has 3,000/month and 100/day; Pro starts at $20 [S7] |
| Monitoring and separate object backup | $10–40 | Planning allowance, not a selected vendor quote |
| Domain, annual cost spread monthly | $1–3 | Planning allowance; actual TLD/registrar varies |
| Fixed/low-usage subtotal | $66–158 | Rounded working budget: $70–160; higher compute, storage and egress are extra |

Supabase point-in-time recovery is not included in this subtotal; public pricing starts at approximately $100/month for the add-on [S1]. Match backup spending to the agreed acceptable data loss. Free project pausing/backups and low plan limits must not be confused with production reliability.

## Model calculation

Illustrative conversation consumption across ALL inference requests, including repeated context and tools:

- 25,000 input tokens.
- 2,500 output tokens.
- No cache discount assumed.

Claude Haiku 4.5's OpenRouter listing gives a standard $1 input / $5 output per million tokens and a European route price of $1.10 / $5.50 [S10]. This is a costing reference, not a claim it is the best model for this product.

```text
Standard raw inference:
25,000 / 1,000,000 * $1.00 + 2,500 / 1,000,000 * $5.00
= $0.03750 per conversation

Regional price example:
25,000 / 1,000,000 * $1.10 + 2,500 / 1,000,000 * $5.50
= $0.04125 per conversation

With an 8% Business credit-purchase fee allocated to consumed credits:
$0.04125 * 1.08 = $0.04455 per conversation
```

OpenRouter Standard charges 5.5% and Business 8% on credit purchases, not as an extra fee on every request [S9]. The calculation allocates that cash cost for budgeting. A region label is not a promise of strict EU-only processing; review actual endpoints and terms.

Add a planning allowance of 30% for embeddings, evaluations, additional successful calls, longer conversations and occasional stronger-model routing. This is an assumption, not a guaranteed ceiling. OCR, images, audio and premium-model heavy use require a separate model.

| Monthly conversations | Inference plus allocated Business fee | With 30% planning allowance |
|---:|---:|---:|
| 2,000 | $89.10 | $115.83 |
| 10,000 | $445.50 | $579.15 |
| 50,000 | $2,227.50 | $2,895.75 |

## Total operating scenarios

| Scenario | Working monthly budget |
|---|---:|
| Local development/light experimentation | $0–30, depending on paid model calls |
| Hosted pilot, 2,000 text conversations/month | Approximately $200–300 |
| Early commercial use, 10,000 conversations/month | Approximately $700–1,000 |
| Higher usage, 50,000 conversations/month | Approximately $3,000–4,200 |

Higher tiers allow additional runtime/observability capacity. These scenarios inherit the token/model assumptions above; they are not user-count-based scalability claims. Measure p95 conversation length and concurrency, not only averages. The excluded costs in the opening paragraph remain excluded.

A three-month pilot operating reserve at $200–300/month is $600–900, before development-tool subscriptions, labor, professional review, messaging and taxes. This is a cash-reserve scenario, not an implementation time estimate.

## WhatsApp

Meta charges for eligible delivered messages by recipient market and category. Service messages during the rolling 24-hour customer-service window are free of Meta message charges; utility responses within that window are also free under the pricing policy [S8]. Approved templates are required outside the service window, and opt-in/opt-out and escalation requirements apply [S8].

Budget separately for AI inference, paid templates and any third-party solution-provider markup. Do not sell unlimited WhatsApp usage. A SaaS conversation allowance is a commercial definition, not Meta's billing unit.

## SaaS subscription collection

Stripe Germany currently lists 1.5% + EUR 0.25 for standard EEA cards, and Stripe Billing pay-as-you-go lists 0.7% of Billing volume [S13]. On a EUR 99 subscription charged to such a card, the combined illustrative amount is EUR 2.428, approximately EUR 2.43, before other applicable products, card categories, FX, disputes or taxes. For Shopify App Store installs, use Shopify App Pricing or its permitted billing system rather than assuming Stripe is allowed; an off-platform exception requires Shopify's permission [S18]. Shopify billing fees/revenue share are separate from the Stripe example.

## Suggested validation pricing, not a market quote

Test EUR 99–149/month with a clearly bounded allowance, such as 500 text conversations, and a setup fee only where actual onboarding service is provided. Charge WhatsApp template costs separately or with an explicit allowance; obtain agreement for overages. Keep a hard limit on cost per conversation/tenant as well as a customer-facing conversation count.

Define a conversation explicitly, such as a customer support session ending after an agreed idle window, with maximum length and fair-use provisions. Do not imply the commercial unit is identical to WhatsApp's pricing model.

## Profitability model

```text
Contribution per merchant =
subscription revenue excluding VAT
- payment/billing fees
- AI and messaging usage
- allocated variable hosting
- merchant-specific support labor

Operating profit =
sum of merchant contributions
- shared infrastructure
- development/maintenance labor
- customer acquisition
- professional services and other overhead
```

Avoid treating revenue minus token costs as profit. Track cost per tenant from the first release. A merchant that requires custom engineering at a low subscription price can be unprofitable even when inference is inexpensive.

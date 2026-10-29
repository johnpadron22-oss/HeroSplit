# HeroSplit — Live Payment Test Guide

This checklist walks through end-to-end payment testing in **production**
(Stripe live mode). Complete every step before announcing public launch.

---

## Prerequisites

- [ ] Stripe account in **live mode** (not test mode)
- [ ] `STRIPE_SECRET_KEY` in Vercel is a **live** key (`sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` is for the **live** webhook endpoint
- [ ] `STRIPE_PRO_PRICE_ID` is a live price ID (`price_...`) for the monthly plan
- [ ] `STRIPE_PRO_ANNUAL_PRICE_ID` is a live price ID for the annual plan
- [ ] A real credit/debit card to complete a charge
- [ ] Payout schedule verified in Stripe Dashboard → Payouts

---

## Step 1 — Verify Stripe Payouts Are Configured

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Settings → Payouts**
3. Confirm a bank account is linked (routing + account number verified)
4. Note the payout schedule (typically 2 business days after a charge)
5. [ ] Bank account linked and verified ✅

---

## Step 2 — Test Monthly Subscription ($4.99)

1. Open the app at your production URL (e.g. `https://herosplit.vercel.app`)
2. Sign in with your Google account
3. Click **Upgrade to Pro** (monthly plan)
4. You should be redirected to Stripe Checkout — verify:
   - [ ] HTTPS padlock visible
   - [ ] Product name shows "HeroSplit Pro" (monthly)
   - [ ] Price shows $4.99/month
5. Enter real card details and complete the checkout
6. [ ] Redirected back to app with `?checkout=success` in URL
7. [ ] Pro badge / Pro features unlock immediately in the app

### Verify Webhook Received

8. In Stripe Dashboard → **Webhooks** → your endpoint → **Recent deliveries**
9. [ ] `checkout.session.completed` event shows `200 OK`
10. Check InstantDB Dashboard → userSubscriptions table:
    - [ ] A new row exists for your `userId`
    - [ ] `isPro: true`
    - [ ] `stripeCustomerId` populated with `cus_...`
    - [ ] `plan: "monthly"`
    - [ ] `subscribedAt` timestamp is set

---

## Step 3 — Test Annual Subscription ($39.99)

1. Create a second test account (different Google account), or cancel Step 2 subscription first
2. Repeat Step 2 for the **annual** plan
3. [ ] Price shows $39.99/year in Stripe Checkout
4. [ ] `checkout.session.completed` webhook received with `200 OK`
5. [ ] `userSubscriptions` row has `plan: "annual"`

---

## Step 4 — Test Billing Portal (Manage Subscription)

1. While logged in as a Pro user, go to **Profile** in the app
2. [ ] "Manage Subscription" button is visible
3. Click **Manage Subscription** → Stripe billing portal opens
4. [ ] Portal shows current plan, next billing date, and card on file
5. Test **Cancel Subscription** in the portal:
   - [ ] Portal confirms cancellation at end of period
   - Return to app — Pro access should remain until period end
6. Wait for Stripe to send `customer.subscription.deleted` webhook (fires at period end)
   - For testing purposes, you can use **Stripe Dashboard → Subscriptions → Cancel immediately**
7. [ ] `customer.subscription.deleted` webhook received with `200 OK`
8. [ ] `userSubscriptions` row updated: `isPro: false`, `cancelledAt` timestamp set
9. [ ] Pro features locked in app after page refresh

---

## Step 5 — Verify Money Hits Bank Account

1. In Stripe Dashboard → **Payments**, find the $4.99 charge
2. [ ] Payment status: **Succeeded**
3. [ ] Amount: $4.99 (minus Stripe fee ~2.9% + 30¢ = net ~$4.55)
4. Go to **Payouts** tab
5. [ ] A pending payout is scheduled for your linked bank account
6. Wait 1–2 business days for the payout to settle
7. [ ] Check your bank account — funds arrived ✅

---

## Step 6 — Rate Limit Test

Verify the API rate limiter is working:

```bash
# Should get 429 after 5 requests within 60s from same IP
for i in {1..7}; do
  curl -s -o /dev/null -w "Attempt $i: HTTP %{http_code}\n" \
    -X POST https://herosplit.vercel.app/api/create-checkout \
    -H "Content-Type: application/json" \
    -d '{"userId":"test","plan":"monthly"}'
done
```

Expected: First 5 requests return 200 or 400 (valid request, may fail without real key), requests 6–7 return `429 Too Many Requests`.

- [ ] Rate limiter triggers at the expected threshold ✅

---

## Step 7 — CORS Test

Verify that the API only accepts requests from the allowed origin:

```bash
# Request from allowed origin — should succeed (200 or 400)
curl -s -o /dev/null -w "Allowed origin: HTTP %{http_code}\n" \
  -X POST https://herosplit.vercel.app/api/create-checkout \
  -H "Content-Type: application/json" \
  -H "Origin: https://herosplit.vercel.app" \
  -d '{"userId":"test","plan":"monthly"}'

# Preflight from disallowed origin
curl -s -o /dev/null -w "Disallowed origin preflight: HTTP %{http_code}\n" \
  -X OPTIONS https://herosplit.vercel.app/api/create-checkout \
  -H "Origin: https://evil.example.com" \
  -H "Access-Control-Request-Method: POST"
```

- [ ] Allowed origin request: 200 or 400 ✅
- [ ] Disallowed origin: CORS headers not present or origin not reflected ✅

---

## Step 8 — Security: Client Cannot Self-Grant Pro

Verify the P0 security fix is in place:

1. Open browser DevTools console on the app (while logged in as a free user)
2. Try to run:
   ```js
   // This should fail — userSubscriptions.update is locked to admin SDK
   db.transact([db.tx.userSubscriptions["any-id"].update({ isPro: true })]);
   ```
3. [ ] InstantDB rejects the write with a permission error
4. [ ] Refresh page — still shows as free user ✅

---

## Post-Launch Checklist

- [ ] Set up Stripe email notifications for failed payments (Stripe Dashboard → Settings → Emails)
- [ ] Enable Stripe Radar fraud rules (Dashboard → Radar)
- [ ] Set up a webhook alert for repeated `payment_intent.payment_failed` events
- [ ] Configure Stripe tax collection if required (Dashboard → Tax)
- [ ] Run `node scripts/backup-db.mjs` before and after first paid user signs up
- [ ] Set up a recurring backup cron (e.g., daily via GitHub Actions or a cron job)

---

## Troubleshooting

| Issue | Check |
|---|---|
| Checkout redirect fails | Verify `FRONTEND_URL` in Vercel env vars (no trailing slash) |
| Webhook returns 400 | Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret in Stripe dashboard |
| Pro doesn't unlock after payment | Check webhook delivery logs in Stripe; check `INSTANT_ADMIN_TOKEN` in Vercel env |
| Annual plan fails with 500 | Verify `STRIPE_PRO_ANNUAL_PRICE_ID` is set in Vercel env vars |
| Portal 400 "Invalid customerId" | User's `stripeCustomerId` not set — check webhook wrote to `userSubscriptions.stripeCustomerId` |

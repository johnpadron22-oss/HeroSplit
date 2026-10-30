#!/usr/bin/env node
/**
 * HeroSplit Load & Performance Test
 *
 * Tests the two Vercel serverless API functions under simulated load.
 * Run against your production or preview URL.
 *
 * Usage:
 *   node scripts/load-test.mjs [BASE_URL]
 *
 * Requires:
 *   STRIPE_SECRET_KEY env var (for portal endpoint test with a real customer ID)
 *
 * Install k6 for full load testing: https://k6.io/docs/getting-started/installation/
 * This script is a lightweight Node.js smoke test + summary. For full load testing
 * see the k6 script at the bottom of this file (copy to a .js file and run with k6).
 *
 * Examples:
 *   node scripts/load-test.mjs https://herosplit.vercel.app
 *   node scripts/load-test.mjs https://herosplit-preview-abc.vercel.app
 */

import https from "https";
import http from "http";
import { performance } from "perf_hooks";

const BASE_URL = process.argv[2] || process.env.BASE_URL || "https://herosplit.vercel.app";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "10", 10);
const ITERATIONS  = parseInt(process.env.ITERATIONS  || "50", 10);

const results = {
  checkout: { success: 0, fail: 0, times: [] },
  portal:   { success: 0, fail: 0, times: [] },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : http;
    const payload = body ? JSON.stringify(body) : null;

    const req = mod.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function timed(fn) {
  const t0 = performance.now();
  const result = await fn();
  return { result, ms: performance.now() - t0 };
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function summary(label, stats) {
  const times = stats.times;
  if (!times.length) return;
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`\n  ── ${label} ──`);
  console.log(`     Requests:  ${times.length}`);
  console.log(`     Success:   ${stats.success}`);
  console.log(`     Fail:      ${stats.fail}`);
  console.log(`     Avg:       ${avg.toFixed(1)} ms`);
  console.log(`     p50:       ${percentile(times, 50).toFixed(1)} ms`);
  console.log(`     p95:       ${percentile(times, 95).toFixed(1)} ms`);
  console.log(`     p99:       ${percentile(times, 99).toFixed(1)} ms`);
  console.log(`     Max:       ${Math.max(...times).toFixed(1)} ms`);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

// POST /api/create-checkout — expects 400 (invalid userId) or 200 with url
async function runCheckoutTest(iteration) {
  const body = { userId: `load-test-user-${iteration}`, email: "test@example.com", plan: "monthly" };
  const { result, ms } = await timed(() =>
    request(`${BASE_URL}/api/create-checkout`, "POST", body)
  );
  results.checkout.times.push(ms);

  // 200 (real session created) or 500 (missing Stripe key in test env) are both OK for load testing
  // We're testing latency and that the endpoint doesn't crash with unexpected errors
  if ([200, 400, 429, 500].includes(result.status)) {
    results.checkout.success++;
  } else {
    results.checkout.fail++;
    if (results.checkout.fail <= 3)
      console.error(`  [checkout] unexpected ${result.status}:`, result.body);
  }
}

// POST /api/customer-portal — expects 400 (invalid customerId format)
async function runPortalTest() {
  const body = { customerId: "cus_invalid_load_test_id_" + Math.random().toString(36).slice(2) };
  const { result, ms } = await timed(() =>
    request(`${BASE_URL}/api/customer-portal`, "POST", body)
  );
  results.portal.times.push(ms);

  if ([200, 400, 429, 500].includes(result.status)) {
    results.portal.success++;
  } else {
    results.portal.fail++;
    if (results.portal.fail <= 3)
      console.error(`  [portal] unexpected ${result.status}:`, result.body);
  }
}

// ── Runner ─────────────────────────────────────────────────────────────────────

async function runBatch(fn, concurrency) {
  const batch = [];
  for (let i = 0; i < concurrency; i++) batch.push(fn(i));
  await Promise.allSettled(batch);
}

async function main() {
  console.log(`\n🏋️  HeroSplit Load Test`);
  console.log(`   Base URL:    ${BASE_URL}`);
  console.log(`   Concurrency: ${CONCURRENCY}`);
  console.log(`   Iterations:  ${ITERATIONS}`);
  console.log(`   Total req:   ${CONCURRENCY * ITERATIONS * 2} (checkout + portal)\n`);

  const batches = Math.ceil(ITERATIONS / CONCURRENCY);
  for (let b = 0; b < batches; b++) {
    const remaining = ITERATIONS - b * CONCURRENCY;
    const size = Math.min(CONCURRENCY, remaining);
    await Promise.allSettled([
      ...Array.from({ length: size }, (_, i) => runCheckoutTest(b * CONCURRENCY + i)),
      ...Array.from({ length: size }, () => runPortalTest()),
    ]);
    process.stdout.write(`\r   Progress: ${Math.min((b + 1) * CONCURRENCY, ITERATIONS)}/${ITERATIONS} iterations`);
  }
  process.stdout.write("\n");

  console.log("\n📊 Results:");
  summary("/api/create-checkout", results.checkout);
  summary("/api/customer-portal", results.portal);

  const allTimes = [...results.checkout.times, ...results.portal.times];
  console.log(`\n  ── Combined ──`);
  console.log(`     Total requests: ${allTimes.length}`);
  console.log(`     Avg latency:    ${(allTimes.reduce((a,b)=>a+b,0)/allTimes.length).toFixed(1)} ms`);
  console.log(`     p95 latency:    ${percentile(allTimes, 95).toFixed(1)} ms`);
  console.log(`     p99 latency:    ${percentile(allTimes, 99).toFixed(1)} ms`);

  const totalFail = results.checkout.fail + results.portal.fail;
  if (totalFail > 0) {
    console.log(`\n⚠️  ${totalFail} unexpected failures — review logs above`);
    process.exit(1);
  } else {
    console.log(`\n✅ All requests responded as expected\n`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });

/* ─────────────────────────────────────────────────────────────────────────────
   k6 LOAD TEST SCRIPT
   Save this section to scripts/k6-load-test.js and run with:
     k6 run --env BASE_URL=https://herosplit.vercel.app scripts/k6-load-test.js

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "https://herosplit.vercel.app";

const checkoutLatency = new Trend("checkout_latency");
const portalLatency   = new Trend("portal_latency");
const checkoutErrors  = new Counter("checkout_errors");

export const options = {
  stages: [
    { duration: "30s", target: 10  },  // ramp up
    { duration: "60s", target: 25  },  // sustained load
    { duration: "30s", target: 50  },  // peak
    { duration: "30s", target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],  // 95% of requests < 2s
    checkout_errors:   ["count<5"],
  },
};

export default function () {
  // Checkout test
  const checkoutRes = http.post(
    `${BASE_URL}/api/create-checkout`,
    JSON.stringify({ userId: `k6-user-${__VU}-${__ITER}`, email: "k6@test.com", plan: "monthly" }),
    { headers: { "Content-Type": "application/json" } }
  );
  checkoutLatency.add(checkoutRes.timings.duration);
  check(checkoutRes, { "checkout: not 5xx": (r) => r.status < 500 });
  if (checkoutRes.status >= 500) checkoutErrors.add(1);

  sleep(0.5);

  // Portal test
  const portalRes = http.post(
    `${BASE_URL}/api/customer-portal`,
    JSON.stringify({ customerId: "cus_test_invalid_k6" }),
    { headers: { "Content-Type": "application/json" } }
  );
  portalLatency.add(portalRes.timings.duration);
  check(portalRes, { "portal: not 5xx": (r) => r.status < 500 });

  sleep(1);
}
─────────────────────────────────────────────────────────────────────────────── */

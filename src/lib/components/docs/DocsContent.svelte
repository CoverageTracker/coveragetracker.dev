<script lang="ts">
  import CodeBlock from './CodeBlock.svelte';
  import Callout from './Callout.svelte';

  const cloneCode = `git clone https://github.com/your-org/coverage-tracker
cd coverage-tracker
npm install`;

  const d1Create = `npx wrangler d1 create coverage`;

  const wranglerJsonc = `"d1_databases": [
  {
    "binding": "DB",
    "database_name": "coverage",
    "database_id": "paste-your-id-here",   // ← add this line
    "migrations_dir": "migrations"
  }
]`;

  const migrate = `npm run db:migrate:remote`;

  const convertKey = `node -e "const c=require('crypto'), fs=require('fs');
const key=c.createPrivateKey(fs.readFileSync(process.argv[1],'utf8'));
process.stdout.write(key.export({type:'pkcs8',format:'pem'}));" \\
  your-app.private-key.pem | npx wrangler secret put GITHUB_APP_PRIVATE_KEY`;

  const secrets = `npx wrangler secret put GITHUB_APP_ID          # numeric, e.g. 1234567
npx wrangler secret put GITHUB_APP_CLIENT_ID   # starts with "Iv23…"
npx wrangler secret put GITHUB_APP_PRIVATE_KEY # if not piped earlier
npx wrangler secret put GITHUB_WEBHOOK_SECRET  # from the GitHub App step
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN  # myteam.cloudflareaccess.com
npx wrangler secret put CF_ACCESS_AUD          # AUD tag UUID from Access app`;

  const deploy = `npm --prefix dashboard install
npm run deploy

# Deployed coverage-tracker triggers
#   coverage-tracker.yourdomain.com (custom domain)`;

  const waf = `CLOUDFLARE_API_TOKEN=<token> ZONE_DOMAIN=yourdomain.com \\
  node scripts/setup-waf-rules.mjs`;

  const verify = `npx wrangler d1 execute DB --remote \\
  --command "SELECT * FROM owners"

npx wrangler d1 execute DB --remote \\
  --command "SELECT full_slug, default_branch, badge_enabled FROM projects"`;

  const upload = `coverage-tracker upload ./lcov.info`;

  const enableBadge = `# find the project id
npx wrangler d1 execute DB --remote \\
  --command "SELECT id, full_slug FROM projects"

# enable the public badge endpoint
curl -X PATCH …/api/admin/projects/1/badge \\
  -H "Cf-Access-Jwt-Assertion: <token>" \\
  -d '{"enabled": true}'`;

  const badgeMd = `![coverage](https://img.shields.io/endpoint?url=
  https://coverage-tracker.yourdomain.com
  /api/badge/owner/repo/coverage.json)`;

  const payload = `{
  "line_coverage": 82.4,
  "branch_coverage": 79.1,
  "cyclomatic": 4.2,
  "cognitive": 2.1,
  "duplication_pct": 1.8,
  "maintainability": 95.0
}`;

  const routing = `POST /api/ci/coverage   ← OIDC-verified, project-scoped
GET  /api/projects/*    ← Cloudflare Access JWT
GET  /api/badge/*       ← public (per-project opt-in)
POST /api/webhooks/*    ← GitHub App HMAC
GET  /api/health        ← public
*                       ← dashboard SPA (static assets)`;

  const api = [
    { m: 'POST', p: '/api/ci/coverage', a: 'OIDC', d: 'Push typed coverage metrics from CI' },
    { m: 'GET', p: '/api/projects', a: 'Access', d: 'List all registered owners and repos' },
    { m: 'GET', p: '/api/projects/:owner/:repo/metrics', a: 'Access', d: 'Trend data for one repo' },
    { m: 'GET', p: '/api/baseline/:owner/:repo', a: 'OIDC', d: 'Latest value on default branch' },
    { m: 'GET', p: '/api/badge/:owner/:repo/:metric.json', a: 'Public', d: 'shields.io endpoint (opt-in repos)' },
    { m: 'POST', p: '/api/webhooks/github', a: 'HMAC', d: 'GitHub App installation events' },
    { m: 'POST', p: '/api/admin/resync', a: 'Access', d: 'Reconcile projects against GitHub' },
    { m: 'PATCH', p: '/api/admin/projects/:id/badge', a: 'Access', d: 'Toggle badge visibility' },
    { m: 'GET', p: '/api/health', a: 'Public', d: 'Liveness check' }
  ];

  const steps = [
    { t: 'Install the GitHub App', b: 'On the repos you want to track. The Worker registers them automatically via an <code>installation</code> webhook.' },
    { t: 'Push from CI', b: 'A reporting step runs after your test suite, collects coverage / complexity / duplication numbers, and posts them using a GitHub Actions OIDC token — no static secret.' },
    { t: 'View trends', b: 'The dashboard, served as static assets by the same Worker, is protected by Cloudflare Access so only you can see it.' },
    { t: 'Embed a badge', b: 'Optionally opt a repo into the public, shields.io-compatible badge endpoint and drop the Markdown into your README.' }
  ];
</script>

<main class="content">
  <section id="overview">
    <div class="kicker mono">// getting started</div>
    <h2 class="mono">Overview</h2>
    <p>Coverage Tracker is a <strong>self-hosted</strong> dashboard that tracks code coverage, cyclomatic complexity, and code duplication across your GitHub repositories — with trend charts, per-PR diff checks, and README badges.</p>
    <p>It runs entirely on your own Cloudflare account: a single <strong>Worker</strong> serves both the dashboard SPA and the API, backed by a <strong>D1</strong> database. Your data stays in your own database — no SaaS, no subscriptions, no third-party access to your metrics.</p>
    <Callout title="Self-hosted by design">
      One instance per deployer, not multi-tenant. A single Worker and one <code>wrangler.json</code> on one apex domain. Everything below assumes you are deploying your own instance.
    </Callout>
  </section>

  <section id="how-it-works">
    <div class="kicker mono">// architecture</div>
    <h2 class="mono">How it works</h2>
    <p>The flow is four moving parts: your CI pushes metrics, the Worker validates and stores them, D1 keeps the history, and the dashboard reads trends back.</p>
    <ol class="steplist">
      {#each steps as s}
        <li>
          <h3 class="mono">{s.t}</h3>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          <p>{@html s.b}</p>
        </li>
      {/each}
    </ol>
    <h3 class="mono">Request routing</h3>
    <p>Only <code class="t">/api/*</code> hits the Worker first; everything else is served asset-first as a single-page app. Each API route enforces its own auth in code.</p>
    <CodeBlock file="routing" code={routing} />
  </section>

  <section id="quick-start">
    <div class="kicker mono">// the short version</div>
    <h2 class="mono">Quick start</h2>
    <p>If you already run on Cloudflare, the whole setup is six moves. Each links to its full section below.</p>
    <ol>
      <li>Add your domain to Cloudflare (DNS proxied through Cloudflare).</li>
      <li>Create the D1 database and apply the migration.</li>
      <li>Create a <strong>GitHub App</strong> (webhooks + API access).</li>
      <li>Create a <strong>GitHub OAuth App</strong> (Cloudflare Access login).</li>
      <li>Configure Cloudflare Zero Trust, set secrets, and deploy the Worker.</li>
      <li>Install the GitHub App on your repos.</li>
    </ol>
    <p>Or skip the manual route entirely — the <strong>Deploy to Cloudflare</strong> button provisions the Worker and D1 automatically. You still complete the GitHub App, Zero Trust, and secrets steps afterward.</p>
    <CodeBlock file="clone & install" code={cloneCode} />
  </section>

  <section id="prerequisites">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">Prerequisites</h2>
    <ul>
      <li>A <strong>Cloudflare account</strong> (free tier is sufficient).</li>
      <li>A <strong>domain managed by Cloudflare</strong> — DNS must be proxied through Cloudflare.</li>
      <li>A <strong>GitHub account</strong> (personal or org) with admin access to the repos you want to track.</li>
      <li><strong>Node.js 18+</strong> and <strong>npm</strong> installed locally.</li>
      <li><strong>Wrangler</strong> authenticated: <code class="t">npx wrangler login</code>.</li>
    </ul>
    <p>If your domain's DNS lives elsewhere, add the domain in the Cloudflare dashboard, pick the Free plan, and replace the registrar's nameservers with the two Cloudflare provides. You do <strong>not</strong> need to create a DNS record for the Worker subdomain — the deploy step handles that.</p>
  </section>

  <section id="domain-database">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">Domain &amp; database</h2>
    <p>Create your D1 database, then wire its id into <code class="t">wrangler.jsonc</code> and apply the schema migration.</p>
    <CodeBlock file="create D1" code={d1Create} />
    <p>Copy the <code class="t">database_id</code> from the output into the <code class="t">d1_databases</code> entry of <code class="t">wrangler.jsonc</code>:</p>
    <CodeBlock file="wrangler.jsonc" lang="jsonc" code={wranglerJsonc} />
    <p>Then apply the migration to your remote database:</p>
    <CodeBlock file="migrate" code={migrate} />
    <Callout title="Note">
      The committed <code>wrangler.jsonc</code> intentionally omits <code>database_id</code> so the Deploy to Cloudflare button can provision D1 automatically. For manual installs, add the field as shown.
    </Callout>
  </section>

  <section id="github-app">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">GitHub App</h2>
    <Callout variant="warn" title="Two separate integrations">
      The <strong>GitHub App</strong> (this step) handles webhook events and API access. The <strong>GitHub OAuth App</strong> (next section) handles dashboard login via Cloudflare Access. Create them separately — do not conflate them.
    </Callout>
    <p>From the account or org that will host the app, go to <strong>Settings → Developer settings → GitHub Apps → New GitHub App</strong> and fill in:</p>
    <table class="deftable">
      <thead><tr><th>Field</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>GitHub App name</td><td>Globally unique, e.g. <code>your-coverage-tracker</code></td></tr>
        <tr><td>Homepage URL</td><td><code>https://coverage-tracker.yourdomain.com</code></td></tr>
        <tr><td>Webhook → Active</td><td>checked</td></tr>
        <tr><td>Webhook URL</td><td><code>…/webhooks/github</code></td></tr>
        <tr><td>Webhook secret</td><td>Generate 32 random bytes — save this value</td></tr>
      </tbody>
    </table>
    <p>Leave <strong>Callback URL</strong>, <strong>OAuth during installation</strong>, and <strong>Setup URL</strong> blank. Under repository permissions set <strong>Metadata: read-only</strong> and <strong>Checks: read &amp; write</strong> — nothing else. Subscribe to both <strong>Installation target</strong> and <strong>Installation repositories</strong> events. For a private instance, choose <strong>Only on this account</strong>.</p>
    <h3 class="mono">Convert the private key</h3>
    <p>GitHub downloads a PKCS#1 <code class="t">.pem</code>; the Worker requires PKCS#8. Convert it with Node — no OpenSSL needed:</p>
    <CodeBlock file="convert key" code={convertKey} />
    <p>From the app's settings page, note the <strong>App ID</strong> and <strong>Client ID</strong> — you set these as secrets next.</p>
  </section>

  <section id="cloudflare-access">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">Cloudflare Access</h2>
    <p>In <strong>Zero Trust</strong>, choose a team name (becomes <code class="t">myteam.cloudflareaccess.com</code>). Then create a <strong>GitHub OAuth App</strong> for dashboard login with callback URL <code class="t">https://myteam.cloudflareaccess.com/cdn-cgi/access/callback</code>, and add GitHub as an identity provider in <strong>Settings → Authentication</strong> using that OAuth App's client id and secret.</p>
    <p>You will create <strong>two</strong> Access applications for the same hostname:</p>
    <table class="deftable">
      <thead><tr><th>App</th><th>Path</th><th>Policy</th></tr></thead>
      <tbody>
        <tr><td>Dashboard (Allow)</td><td><em>blank — whole host</em></td><td>Allow → your email. Copy the <strong>AUD tag</strong> → <code>CF_ACCESS_AUD</code></td></tr>
        <tr><td>API Bypass</td><td><code>/api</code></td><td>Bypass → Everyone</td></tr>
      </tbody>
    </table>
    <Callout variant="warn" title="Critical invariant">
      Never put an Access <em>Allow</em> policy on <code>/api/*</code>. Machine callers (CI OIDC, webhooks, health) must reach the Worker unauthenticated at the edge — API auth is enforced in code. The bypass only removes the edge OAuth redirect; no <code>/api/*</code> route is left unprotected.
    </Callout>
  </section>

  <section id="secrets">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">Secrets</h2>
    <p>Set every value with <code class="t">wrangler secret put</code> — secrets are never committed. <code class="t">wrangler.json</code> references names only.</p>
    <CodeBlock file="wrangler secrets" code={secrets} />
    <Callout variant="warn" title="Never set in production">
      <code>DEV_BYPASS_SECRET</code> belongs only in <code>.dev.vars</code> for local dev. Setting it via <code>wrangler secret put</code> silently disables all Access JWT verification.
    </Callout>
  </section>

  <section id="deploy">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">Deploy the Worker</h2>
    <p>Make sure dashboard dependencies are installed, then deploy. The command applies pending D1 migrations and compiles the SvelteKit dashboard before uploading.</p>
    <CodeBlock file="deploy" code={deploy} />
    <p>If <strong>Bot Fight Mode</strong> or <strong>Browser Integrity Check</strong> is enabled on your zone, add WAF skip rules for the machine-caller routes (this is separate from the Access bypass — Bot Fight Mode fires before Access):</p>
    <CodeBlock file="WAF skip rules" code={waf} />
  </section>

  <section id="verify">
    <div class="kicker mono">// installation</div>
    <h2 class="mono">Install &amp; verify</h2>
    <p>From the GitHub App's settings page → <strong>Install App</strong> → choose the account or org → select repos. This fires an <code class="t">installation: created</code> webhook that populates the <code class="t">owners</code> and <code class="t">projects</code> tables.</p>
    <p>Confirm the webhook landed:</p>
    <CodeBlock file="verify" code={verify} />
    <p>One row per account in <code class="t">owners</code> and one per repo in <code class="t">projects</code> means the install is complete. <code class="t">badge_enabled</code> is <code class="t">0</code> by default — opt in per repo below. If a table is empty, check <code class="t">npx wrangler tail</code>; if owners has rows but projects is empty, trigger a manual resync via <code class="t">POST /api/admin/resync</code>.</p>
  </section>

  <section id="ingest">
    <div class="kicker mono">// usage</div>
    <h2 class="mono">Ingest from CI</h2>
    <p>Add a workflow step that runs after your test suite and posts coverage to <code class="t">/api/ci/coverage</code> using a GitHub Actions OIDC token. There is <strong>no static ingest secret</strong>: the Worker verifies the token signature and checks the <code class="t">repository</code> claim against your registered projects, so only your repos can push data. Re-running CI for the same commit is a safe no-op.</p>
    <CodeBlock file="upload step" code={upload} />
    <p>The reporting Action accepts lcov or cobertura reports from any CI — Jest, Vitest, pytest-cov, go test, JaCoCo, SimpleCov. Trend history is append-only; PR jobs read baselines but never write.</p>
  </section>

  <section id="badges">
    <div class="kicker mono">// usage</div>
    <h2 class="mono">Status badges</h2>
    <p>Badge numbers are opt-in per repo. Find the project id, enable it, then paste the snippet into your README. Available metrics: <code class="t">coverage</code>, <code class="t">complexity</code>, <code class="t">duplication</code>.</p>
    <CodeBlock file="enable badge" code={enableBadge} />
    <p>Then drop the shields.io endpoint badge into your README:</p>
    <CodeBlock file="README.md" lang="md" code={badgeMd} />
    <span class="realbadge mono"><span class="l">coverage</span><span class="r">94%</span></span>
  </section>

  <section id="dashboard">
    <div class="kicker mono">// usage</div>
    <h2 class="mono">Dashboard</h2>
    <p>The SvelteKit dashboard is compiled by <code class="t">wrangler deploy</code> automatically and served as static assets by the same Worker — there is no separate Pages project. After first deploy, visit <code class="t">https://coverage-tracker.yourdomain.com</code>; Cloudflare Access prompts you to log in with the identity provider you configured. Once authenticated, the dashboard shows all registered repos and their per-metric, per-branch trend charts.</p>
    <Callout title="Blank page or 404?">
      Check the SvelteKit build completed, that <code>assets.directory</code> points to <code>./dashboard/build</code>, and that <code>run_worker_first: ["/api/*"]</code> is set so non-API paths serve the SPA.
    </Callout>
  </section>

  <section id="api">
    <div class="kicker mono">// reference</div>
    <h2 class="mono">API reference</h2>
    <table class="deftable">
      <thead><tr><th>Method &amp; path</th><th>Auth</th><th>Description</th></tr></thead>
      <tbody>
        {#each api as r}
          <tr>
            <td><span class="method mono">{r.m}</span> <code>{r.p}</code></td>
            <td>{r.a}</td>
            <td>{r.d}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section id="ingest-payload">
    <div class="kicker mono">// reference</div>
    <h2 class="mono">Ingest payload</h2>
    <p><code class="t">line_coverage</code> is required; all other fields are optional. <code class="t">repository</code>, <code class="t">branch</code>, and <code class="t">commit_sha</code> are derived from the OIDC token claims — they are not accepted in the body.</p>
    <CodeBlock file="POST /api/ci/coverage" lang="json" code={payload} />
  </section>

  <div class="pagefoot">
    <a class="pf" href="/#how"><span class="pl mono">← Back to</span><span class="pt mono">Marketing site</span></a>
    <a class="pf right" href="#overview"><span class="pl mono">Top ↑</span><span class="pt mono">Overview</span></a>
  </div>
</main>

<style>
  .content { min-width: 0; max-width: 760px; }
  .content section { scroll-margin-top: 88px; padding-bottom: 8px; }
  .content section + section { margin-top: 48px; padding-top: 44px; border-top: 1px solid var(--border); }

  .kicker {
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: 12px;
  }
  .content h2 { font-size: 27px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 16px; }
  .content h3 { font-size: 16px; font-weight: 600; margin: 30px 0 10px; }
  .content p { font-size: 15px; line-height: 1.66; color: var(--muted); margin: 0 0 15px; }
  .content :global(strong) { color: var(--text); font-weight: 600; }

  .content ul, .content ol { margin: 0 0 15px; padding-left: 22px; }
  .content li { font-size: 15px; line-height: 1.66; color: var(--muted); margin-bottom: 7px; }
  .content li::marker { color: var(--muted); }

  /* inline code — global so it reaches markup inside {@html} and children */
  .content :global(code) {
    font-family: var(--font-mono);
    font-size: 0.86em;
    background: var(--elevated);
    color: var(--text);
    padding: 2px 6px;
    border-radius: 5px;
  }

  /* step list */
  .steplist { counter-reset: s; list-style: none; padding: 0; margin: 0 0 6px; }
  .steplist > li { position: relative; padding: 0 0 22px 42px; margin: 0; }
  .steplist > li:not(:last-child)::after {
    content: ''; position: absolute; left: 13px; top: 30px; bottom: 2px; width: 1px; background: var(--border);
  }
  .steplist > li::before {
    counter-increment: s; content: counter(s);
    position: absolute; left: 0; top: 0; width: 27px; height: 27px; border-radius: 50%;
    background: var(--card); border: 1px solid var(--border); color: var(--primary);
    font-family: var(--font-mono); font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .steplist > li h3 { margin: 2px 0 6px; font-size: 15px; }
  .steplist > li p { margin: 0; }

  /* definition / api table */
  .deftable {
    width: 100%; border-collapse: collapse;
    border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
    margin: 0 0 18px; font-size: 14px;
  }
  .deftable th {
    text-align: left; font-family: var(--font-mono);
    font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); font-weight: 600; background: var(--card);
    padding: 11px 14px; border-bottom: 1px solid var(--border);
  }
  .deftable td { padding: 11px 14px; border-bottom: 1px solid var(--border); color: var(--muted); line-height: 1.5; vertical-align: top; }
  .deftable tr:last-child td { border-bottom: 0; }
  .deftable td:first-child { color: var(--text); }
  .deftable :global(code) { white-space: nowrap; }

  .method {
    font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 5px;
    background: var(--accent-fill); color: var(--primary);
  }

  .realbadge { display: inline-flex; height: 22px; border-radius: 4px; overflow: hidden; font-size: 12px; }
  .realbadge .l { display: flex; align-items: center; padding: 0 9px; background: #3c3c43; color: #fff; }
  .realbadge .r { display: flex; align-items: center; padding: 0 9px; background: var(--status-pass); color: #13231a; font-weight: 700; }

  .pagefoot { margin-top: 54px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .pf { display: inline-flex; flex-direction: column; gap: 3px; padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px; background: var(--card); transition: border-color 120ms ease; }
  .pf:hover { border-color: var(--primary); }
  .pf.right { text-align: right; align-items: flex-end; }
  .pl { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .pt { font-size: 14px; font-weight: 600; color: var(--text); }
</style>

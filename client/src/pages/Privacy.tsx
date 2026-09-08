import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to HeroSplit
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-display font-black mb-2">
            <span className="text-hero">HERO</span>SPLIT — Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Effective date: September 8, 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-black [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-foreground">

          <p>
            This Privacy Policy explains what data HeroSplit ("we", "us", "our") collects, how we use it, and your rights regarding that data. We are committed to being straightforward about our practices — no hidden tracking, no selling your data.
          </p>

          <h2>1. Data We Collect</h2>

          <p><strong>Account data (via Google OAuth):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your Google email address</li>
            <li>Your Google user ID (used internally to identify your account)</li>
          </ul>
          <p>We do not receive your Google password. We do not access your Google contacts, calendar, Drive, or any other Google services.</p>

          <p><strong>Profile data (created when you use the Service):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display alias (derived from your email username)</li>
            <li>Chosen archetype (e.g., Dark Vigilante, Void Sorcerer)</li>
            <li>Experience level (beginner, intermediate, advanced, veteran)</li>
            <li>XP total, rank, current streak, longest streak, total workouts completed</li>
            <li>Subscription status (free or Pro)</li>
          </ul>

          <p><strong>Workout data:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Workout session logs: date, duration, workout name, XP earned</li>
            <li>Sets data: exercise name, weight, and reps per set (only for Pro users who log sets)</li>
          </ul>

          <p><strong>Feedback data (optional, when submitted):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Feedback category, message text, and timestamp</li>
            <li>Current page path, archetype, and experience level at time of submission</li>
          </ul>

          <p><strong>Payment data:</strong></p>
          <p>
            Payments are processed by <strong>Stripe</strong>. We never see or store your credit card number, CVV, or full payment details. What we receive from Stripe after a successful subscription is a Stripe Customer ID (a token like <code className="text-xs bg-white/5 px-1 py-0.5 rounded">cus_xxx</code>) used to manage your billing portal access. Stripe's privacy practices are described at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-hero hover:underline">stripe.com/privacy</a>.
          </p>

          <p><strong>Technical data (automatic):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address (used only for rate limiting abuse prevention; not stored long-term)</li>
            <li>Standard server access logs (retained by Vercel per their infrastructure practices)</li>
          </ul>

          <p>We do not use cookies for tracking. We do not use advertising networks. We do not use third-party analytics tools (e.g., Google Analytics, Mixpanel).</p>

          <h2>2. How We Use Your Data</h2>
          <p>We use your data only for the following purposes ("lawful bases" under GDPR — see Section 11 for EEA-specific details):</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>To provide the Service (contract performance):</strong> authenticate you, display your profile, save your workout history, calculate your XP and streaks, and manage your Pro subscription.</li>
            <li><strong>To improve the Service (legitimate interest):</strong> feedback submissions help us decide what features to build next (characters, programs, bug fixes).</li>
            <li><strong>To communicate with you (contract performance / legitimate interest):</strong> we may send you emails about significant changes to the Service or your subscription. We do not send marketing emails unless you opt in.</li>
            <li><strong>To prevent abuse (legitimate interest):</strong> IP addresses are used in-memory for rate limiting API requests and are not persisted to any database.</li>
          </ul>

          <h2>3. Who We Share Data With</h2>
          <p>We share your data only with the third-party services that power the app. Each acts as a data processor on our behalf:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-foreground font-bold">Service</th>
                  <th className="text-left py-2 pr-4 text-foreground font-bold">Purpose</th>
                  <th className="text-left py-2 pr-4 text-foreground font-bold">Data Shared</th>
                  <th className="text-left py-2 text-foreground font-bold">Privacy Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-foreground">InstantDB</td>
                  <td className="py-2.5 pr-4">Real-time database storing all app data</td>
                  <td className="py-2.5 pr-4">All profile, workout, subscription, and feedback data</td>
                  <td className="py-2.5"><a href="https://www.instantdb.com/privacy" target="_blank" rel="noopener noreferrer" className="text-hero hover:underline">instantdb.com/privacy</a></td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-foreground">Stripe</td>
                  <td className="py-2.5 pr-4">Payment processing for Pro subscriptions</td>
                  <td className="py-2.5 pr-4">Email address, payment details (never stored by us)</td>
                  <td className="py-2.5"><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-hero hover:underline">stripe.com/privacy</a></td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-foreground">Vercel</td>
                  <td className="py-2.5 pr-4">Hosting and serverless API functions</td>
                  <td className="py-2.5 pr-4">IP addresses in server access logs</td>
                  <td className="py-2.5"><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-hero hover:underline">vercel.com/legal/privacy-policy</a></td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-foreground">Google OAuth</td>
                  <td className="py-2.5 pr-4">Sign-in authentication only</td>
                  <td className="py-2.5 pr-4">Email and Google user ID</td>
                  <td className="py-2.5"><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-hero hover:underline">policies.google.com/privacy</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>We do not sell, rent, or trade your personal data to any other third party. Ever.</p>

          <h2>4. Data Retention</h2>
          <p>
            We retain your account and workout data for as long as your account is active. If you request deletion of your account, we will delete your personal data within 30 days, except where retention is required by law (e.g., billing records may be kept for up to 7 years for tax and legal compliance). Anonymized or aggregated data (with no personal identifiers) may be retained indefinitely for product improvement purposes.
          </p>

          <h2>5. Your Rights (General)</h2>
          <p>Regardless of where you live, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access:</strong> request a copy of the data we hold about you.</li>
            <li><strong>Correction:</strong> request that we correct inaccurate data.</li>
            <li><strong>Deletion:</strong> request that we delete your account and associated data.</li>
            <li><strong>Portability:</strong> request your workout history in a machine-readable format.</li>
            <li><strong>Objection:</strong> object to any processing of your data.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a>. We will respond within 30 days (45 days for California residents, extendable by an additional 45 days with notice).
          </p>

          <h2>6. California Residents — CCPA Rights</h2>
          <p>
            If you are a California resident, the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), provides you with specific rights regarding your personal information.
          </p>
          <p><strong>Categories of personal information collected:</strong> identifiers (name, email, user ID); commercial information (subscription status, Stripe Customer ID); internet or network activity (IP address, log data); and inferences drawn from the above (XP rank, streak performance).</p>
          <p><strong>Your CCPA rights:</strong></p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Right to Know.</strong> You have the right to request that we disclose what personal information we have collected about you, the categories of sources, the business purpose, and any third parties we share it with.</li>
            <li><strong>Right to Delete.</strong> You have the right to request deletion of personal information we have collected, subject to certain exceptions (e.g., completing transactions, legal obligations).</li>
            <li><strong>Right to Correct.</strong> You have the right to request correction of inaccurate personal information.</li>
            <li><strong>Right to Opt-Out of Sale or Sharing.</strong> We do not sell or share personal information with third parties for cross-context behavioral advertising. No opt-out is required, but you may contact us to confirm.</li>
            <li><strong>Right to Limit Use of Sensitive Personal Information.</strong> We do not collect sensitive personal information as defined by the CPRA beyond what is necessary to provide the Service.</li>
            <li><strong>Right to Non-Discrimination.</strong> We will not deny you the Service, charge you a different price, or provide a lower quality of service because you exercised any CCPA right.</li>
          </ul>
          <p>
            To submit a CCPA request, email <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a> with the subject line "CCPA Request." We may need to verify your identity before responding. We will respond within 45 days.
          </p>

          <h2>7. EEA and UK Residents — GDPR Rights</h2>
          <p>
            If you are in the European Economic Area (EEA) or United Kingdom, the General Data Protection Regulation (GDPR) and applicable national laws give you additional rights. HeroSplit acts as the data controller for personal data processed through the Service.
          </p>
          <p><strong>Lawful basis for processing:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Contract performance (Art. 6(1)(b)):</strong> processing necessary to provide the Service you signed up for (authentication, workout tracking, subscription management).</li>
            <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> abuse prevention, service improvement through aggregated feedback analysis, and communicating material service changes.</li>
            <li><strong>Consent (Art. 6(1)(a)):</strong> optional marketing communications, if you have opted in.</li>
          </ul>
          <p><strong>Your GDPR rights:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Right of access (Art. 15)</li>
            <li>Right to rectification (Art. 16)</li>
            <li>Right to erasure / "right to be forgotten" (Art. 17)</li>
            <li>Right to restriction of processing (Art. 18)</li>
            <li>Right to data portability (Art. 20)</li>
            <li>Right to object (Art. 21)</li>
            <li>Right not to be subject to automated individual decision-making (Art. 22) — we do not use purely automated decision-making that produces legal or similarly significant effects</li>
          </ul>
          <p>
            To exercise these rights, contact us at <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a>. You also have the right to lodge a complaint with your local supervisory authority (e.g., ICO in the UK, CNIL in France).
          </p>
          <p>
            <strong>International transfers.</strong> Your data is processed in the United States. Transfers from the EEA to the US are made on the basis of the EU-US Data Privacy Framework (or, where applicable, Standard Contractual Clauses with our sub-processors). Our key sub-processors (Stripe, Vercel) maintain DPF certification or SCCs. Contact us for details.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            HeroSplit is not directed to children under 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal data, contact us and we will delete it promptly. For EEA users, we do not knowingly process data of children under 16 without verifiable parental consent.
          </p>

          <h2>9. Data Security</h2>
          <p>
            We use industry-standard measures to protect your data: HTTPS for all data in transit, server-side input validation on all API endpoints, rate limiting to prevent abuse, and InstantDB's permission system to ensure users can only access their own data. Subscription status is write-locked to our server-side Stripe webhook — clients cannot modify it. No payment card data is stored on our servers — Stripe handles all payment processing.
          </p>
          <p>
            No system is 100% secure. In the event of a data breach affecting your personal data, we will notify you by email within 72 hours of becoming aware of it (as required by GDPR Art. 33/34 and applicable US state breach notification laws).
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material changes we will email you at your registered address at least 14 days before the changes take effect. The "Effective date" at the top of this page reflects when the current version took effect.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions, requests, or concerns about this Privacy Policy? Contact us at:{" "}
            <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">
              johnpadron22@gmail.com
            </a>
          </p>
          <p className="text-xs">
            For EEA/UK users, the data controller is HeroSplit, reachable at the email address above.
          </p>
        </div>
      </div>
    </div>
  );
}

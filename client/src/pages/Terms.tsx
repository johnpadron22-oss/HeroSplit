import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to HeroSplit
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-display font-black mb-2">
            <span className="text-hero">HERO</span>SPLIT — Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Effective date: September 8, 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-black [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-foreground">

          <p>
            These Terms of Service ("Terms") govern your access to and use of HeroSplit (the "Service"), operated by HeroSplit ("we", "us", or "our"). By creating an account or using the Service you agree to these Terms. If you do not agree, do not use the Service.
          </p>

          <h2>1. The Service</h2>
          <p>
            HeroSplit is a fitness web application that provides anime- and hero-themed workout programs, XP progression, streak tracking, loot drops, and related features. Some features are available for free; others require a paid Pro subscription.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use the Service. If you are under 18, you represent that a parent or guardian has reviewed and agreed to these Terms on your behalf. By using the Service you represent that you meet these requirements.
          </p>

          <h2>3. Your Account</h2>
          <p>
            You sign in using Google OAuth. You are responsible for all activity that occurs under your account. You must not share your account credentials or allow others to access your account. Notify us immediately at <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a> if you believe your account has been compromised.
          </p>

          <h2>4. Free and Pro Plans</h2>
          <p>
            <strong>Free plan:</strong> Access to Hero workouts, Foundation Series, Blueprint Series, XP progression, streaks, and loot drops at no charge.
          </p>
          <p>
            <strong>Pro plan:</strong> Adds Villain Tier workouts, 10 Anime Arc programs, Nemesis Series (Push/Pull/Legs + Hypertrophy), and full workout history with sets and weights. Pro is billed monthly ($4.99/month) or annually ($39.99/year), charged via Stripe.
          </p>
          <p>
            Subscriptions auto-renew at the end of each billing period. You may cancel at any time through the billing portal; cancellation takes effect at the end of the current paid period and you will retain Pro access until then. We do not offer refunds for partial billing periods except where required by law.
          </p>
          <p>
            We reserve the right to change pricing with at least 30 days' advance notice sent to your registered email address.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Service for any unlawful purpose or in violation of any regulations.</li>
            <li>Attempt to gain unauthorized access to the Service, its servers, or any related systems.</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the Service.</li>
            <li>Use automated tools (bots, scrapers, crawlers) to access or extract data from the Service.</li>
            <li>Impersonate another person or entity.</li>
            <li>Submit content that is abusive, harassing, threatening, defamatory, obscene, or illegal through the feedback system.</li>
          </ul>

          <h2>6. User-Generated Content</h2>
          <p>
            "User Content" means any information, data, text, or other material you submit to the Service, including workout feedback, feature requests, alias names, and any other content you provide through the Service's input forms.
          </p>
          <p>
            <strong>License Grant.</strong> By submitting User Content, you grant HeroSplit a perpetual, irrevocable, worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, distribute, display, and create derivative works from your User Content for any purpose related to operating and improving the Service. This license survives termination of your account.
          </p>
          <p>
            <strong>Your Representations.</strong> You represent and warrant that: (a) you own or have the necessary rights to submit your User Content and grant the license above; (b) your User Content does not infringe any third-party intellectual property, privacy, or publicity rights; and (c) your User Content complies with these Terms and applicable law.
          </p>
          <p>
            <strong>Prohibited Content.</strong> You may not submit User Content that: (i) infringes any copyright, trademark, patent, trade secret, or other intellectual property right; (ii) violates any person's right of privacy or publicity; (iii) is defamatory, obscene, pornographic, abusive, harassing, threatening, or hateful; (iv) promotes illegal activity; or (v) contains malicious code, viruses, or other harmful software.
          </p>
          <p>
            <strong>DMCA / Copyright Takedowns.</strong> HeroSplit respects intellectual property rights and will respond to clear notices of copyright infringement submitted in accordance with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been reproduced through the Service in a way that constitutes infringement, send a written notice to <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a> containing: (a) your electronic or physical signature; (b) identification of the copyrighted work claimed to be infringed; (c) identification of the infringing material and its location in the Service; (d) your contact information; (e) a statement that you have a good-faith belief the use is not authorized; and (f) a statement under penalty of perjury that the information in your notice is accurate. Counter-notifications may also be submitted to the same address per the DMCA process.
          </p>
          <p>
            <strong>No Obligation to Monitor.</strong> We have no obligation to monitor, review, or screen User Content, but we reserve the right to remove or disable access to any User Content at our sole discretion and without notice.
          </p>

          <h2>7. Fitness Disclaimer</h2>
          <p>
            <strong>HeroSplit is not a medical service.</strong> The workout programs provided are for general fitness and entertainment purposes only. They are not medical advice, diagnosis, or treatment. Before beginning any exercise program, especially if you have a medical condition, injury, or are new to exercise, consult a qualified healthcare professional. You exercise at your own risk. We are not liable for any injury, illness, or other harm resulting from use of the workout programs.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service, including its design, code, workout programs, XP system, and all original content, is owned by HeroSplit and protected by copyright and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any part of the Service without our written permission.
          </p>
          <p>
            Character names and themes inspired by existing franchises (e.g., Dragon Ball, Naruto, Jujutsu Kaisen) are used for descriptive and thematic purposes. HeroSplit is not affiliated with, endorsed by, or sponsored by the owners of those franchises.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate your account at any time if we believe you have violated these Terms. You may delete your account by contacting us at <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a>. Upon termination your right to use the Service ceases immediately; we will delete your data in accordance with our Privacy Policy.
          </p>

          <h2>10. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, HEROSPLIT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $10 USD IF YOU HAVE NOT MADE ANY PAYMENTS.
          </p>

          <h2>12. Binding Arbitration and Class Action Waiver</h2>
          <p>
            <strong>Please read this section carefully — it affects your legal rights.</strong>
          </p>
          <p>
            <strong>Agreement to Arbitrate.</strong> You and HeroSplit agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Service ("Dispute") shall be resolved exclusively through final and binding individual arbitration, rather than in a court, except as set forth below. This agreement to arbitrate is governed by the Federal Arbitration Act (FAA).
          </p>
          <p>
            <strong>Exceptions.</strong> Either party may bring an individual action in small claims court (provided the Dispute qualifies). Either party may seek emergency injunctive or equitable relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration. Nothing in this section prevents you from reporting violations of law to applicable government agencies.
          </p>
          <p>
            <strong>Arbitration Process.</strong> Arbitration will be administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules, which are available at <a href="https://www.adr.org" className="text-hero hover:underline" target="_blank" rel="noopener noreferrer">www.adr.org</a>. The arbitration will take place in Florida, USA or via video conference. If the AAA is unavailable, the parties will agree on an alternative arbitral forum.
          </p>
          <p>
            <strong>CLASS ACTION WAIVER.</strong> YOU AND HEROSPLIT EACH WAIVE THE RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR REPRESENTATIVE PROCEEDING. All Disputes must be brought solely in your individual capacity and not as a plaintiff or class member in any purported class or representative proceeding. The arbitrator may not consolidate more than one person's claims or preside over any class or representative proceeding.
          </p>
          <p>
            <strong>Opt-Out.</strong> You may opt out of this arbitration agreement within 30 days of first accepting these Terms by sending a written notice to <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">johnpadron22@gmail.com</a> with the subject line "Arbitration Opt-Out" and including your name, email address, and a statement that you wish to opt out. Opting out does not affect any other part of these Terms.
          </p>
          <p>
            <strong>Costs.</strong> For Disputes where the amount in controversy is less than $10,000, HeroSplit will pay all AAA filing and arbitrator fees. For larger Disputes, AAA fee-shifting rules apply.
          </p>
          <p>
            <strong>Severability.</strong> If the class action waiver is found unenforceable, then the arbitration agreement will not apply to that Dispute and the Dispute must be brought in court under Section 13 below.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Florida, United States, without regard to its conflict of law principles. For Disputes not subject to arbitration under Section 12, you consent to the exclusive jurisdiction of the state and federal courts located in Florida.
          </p>

          <h2>14. Privacy and Data</h2>
          <p>
            Your use of the Service is also governed by our <Link href="/privacy" className="text-hero hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. The Privacy Policy describes how we collect, use, and share your information, including rights available to California residents under the CCPA and rights available to residents of the European Economic Area under the GDPR.
          </p>

          <h2>15. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by sending an email to your registered address or by displaying a notice in the Service at least 14 days before the changes take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
          </p>

          <h2>16. Contact</h2>
          <p>
            Questions about these Terms? Contact us at:{" "}
            <a href="mailto:johnpadron22@gmail.com" className="text-hero hover:underline">
              johnpadron22@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

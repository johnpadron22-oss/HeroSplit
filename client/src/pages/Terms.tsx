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
          <p className="text-sm text-muted-foreground">Effective date: August 18, 2026</p>
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
            <li>Submit content that is abusive, harassing, or illegal through the feedback system.</li>
          </ul>

          <h2>6. Fitness Disclaimer</h2>
          <p>
            <strong>HeroSplit is not a medical service.</strong> The workout programs provided are for general fitness and entertainment purposes only. They are not medical advice, diagnosis, or treatment. Before beginning any exercise program, especially if you have a medical condition, injury, or are new to exercise, consult a qualified healthcare professional. You exercise at your own risk. We are not liable for any injury, illness, or other harm resulting from use of the workout programs.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            The Service, including its design, code, workout programs, XP system, and all original content, is owned by HeroSplit and protected by copyright and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any part of the Service without our written permission.
          </p>
          <p>
            Character names and themes inspired by existing franchises (e.g., Dragon Ball, Naruto, Jujutsu Kaisen) are used for descriptive and thematic purposes. HeroSplit is not affiliated with, endorsed by, or sponsored by the owners of those franchises.
          </p>

          <h2>8. User Content</h2>
          <p>
            When you submit feedback, feature requests, or other content through the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and incorporate that content for the purpose of improving the Service. We will never sell your feedback to third parties.
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

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Florida, United States, without regard to its conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved in the courts of Florida.
          </p>

          <h2>13. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by sending an email to your registered address or by displaying a notice in the Service at least 14 days before the changes take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
          </p>

          <h2>14. Contact</h2>
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

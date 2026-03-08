import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0f1021 50%, #0a0b14 100%)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-sm" style={{ color: '#8b8a9e' }}>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-8" style={{ color: '#f1f0f5' }}>
          Terms & Rules
        </h1>

        {/* About */}
        <Section title="About OnlineResultPortal">
          <p>OnlineResultPortal is a platform that enables schools, academies, and educational institutions to publish student results online through beautifully designed, branded portals. School owners can upload results via Excel and share a unique link with students and parents.</p>
        </Section>

        {/* How It Works */}
        <Section title="How It Works">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create an account with your email address.</li>
            <li>Add your school/institution name and choose a design template.</li>
            <li>Upload student results via an Excel spreadsheet.</li>
            <li>Preview, confirm, and publish your result portal.</li>
            <li>Share your unique portal link with students — they can check results instantly.</li>
          </ol>
        </Section>

        {/* Credit Policy */}
        <Section title="Credit Policy">
          <ul className="list-disc list-inside space-y-2">
            <li>Every new school receives <strong>20 free credits</strong> as a welcome bonus.</li>
            <li>Each student result check costs <strong>1 credit</strong>.</li>
            <li>Excel uploads are free for the first 2 uploads; after that, each upload costs <strong>10 credits</strong>.</li>
            <li>Template/design changes are free for the first 3 changes; after that, each change costs <strong>5 credits</strong>.</li>
            <li>Bulk marksheet downloads for 400+ students receive a <strong>20% discount</strong> on credits.</li>
            <li>Additional credits can be purchased by contacting the admin via WhatsApp.</li>
            <li>Credit packages may include bonus credits — bonus credits are not counted for referral commissions.</li>
          </ul>
        </Section>

        {/* Referral Program */}
        <Section title="Referral Program Rules">
          <p className="mb-3">You can earn money by inviting other school owners to use OnlineResultPortal. Here are the rules:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Every registered user gets a unique referral code and link.</li>
            <li>When someone signs up using your referral link and later purchases credits, you earn a <strong>10% commission</strong> in PKR.</li>
            <li>Commission is calculated on the <strong>paid credit amount only</strong> — bonus credits are excluded.</li>
            <li>The commission rate is <strong>₨0.9 per paid credit</strong> purchased by your referral (based on ₨9/credit pricing).</li>
            <li>
              ⚠️ Maximum earning cap: <strong>₨2,000</strong> per referrer. Once your total referral earnings reach ₨2,000, no further commissions will be credited.
            </li>
            <li>Earnings can be <strong>withdrawn</strong> via JazzCash/Easypaisa or <strong>exchanged for credits</strong> at ₨9 per credit.</li>
            <li>Minimum withdrawal amount is <strong>₨400</strong>.</li>
            <li>Withdrawal requests are processed within <strong>2 business days</strong>.</li>
            <li>Self-referrals are not allowed and will be automatically rejected.</li>
            <li>OnlineResultPortal reserves the right to modify or discontinue the referral program at any time.</li>
          </ul>
        </Section>

        {/* General Terms */}
        <Section title="General Terms">
          <ul className="list-disc list-inside space-y-2">
            <li>OnlineResultPortal is provided "as is" without warranties of any kind.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            <li>Uploaded data (student results) remains the responsibility of the school owner.</li>
            <li>We do not share your data with third parties.</li>
            <li>These terms may be updated at any time. Continued use of the platform constitutes acceptance of updated terms.</li>
          </ul>
        </Section>

        <p className="mt-10 text-xs" style={{ color: '#4a4960' }}>
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-lg sm:text-xl font-semibold mb-3" style={{ color: '#a78bfa' }}>
        {title}
      </h2>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: '#9d9cb2' }}>
        {children}
      </div>
    </div>
  );
}

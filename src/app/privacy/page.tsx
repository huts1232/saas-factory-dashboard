export default function PrivacyPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto prose prose-invert prose-sm">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-text-secondary">Last updated: March 19, 2026</p>

      <h2 className="text-lg font-semibold mt-6">1. Data We Collect</h2>
      <p className="text-text-secondary">We collect your email address and name for account management. Project ideas and generated specifications are stored to provide the service. API keys are encrypted at rest.</p>

      <h2 className="text-lg font-semibold mt-6">2. BYOK & API Keys</h2>
      <p className="text-text-secondary">Your API keys are stored encrypted in our database and are only used to execute pipeline operations on your behalf. We never share your keys with third parties or use them for any purpose other than running your requested operations.</p>

      <h2 className="text-lg font-semibold mt-6">3. Data Retention</h2>
      <p className="text-text-secondary">Project data is retained as long as your account is active. You can delete individual projects or your entire account at any time. Upon account deletion, all associated data is permanently removed within 30 days.</p>

      <h2 className="text-lg font-semibold mt-6">4. Third-Party Services</h2>
      <p className="text-text-secondary">We use Supabase for authentication and data storage, Vercel for hosting, and Stripe for payments. Each has their own privacy policy governing their handling of your data.</p>

      <h2 className="text-lg font-semibold mt-6">5. Cookies</h2>
      <p className="text-text-secondary">We use essential cookies for authentication and session management. No tracking or advertising cookies are used.</p>

      <h2 className="text-lg font-semibold mt-6">6. Contact</h2>
      <p className="text-text-secondary">For privacy-related questions, contact us at privacy@saasfactory.dev</p>
    </div>
  )
}

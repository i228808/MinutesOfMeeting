import StaticPageLayout, { legalStyles } from '../layouts/StaticPageLayout';

const BRAND = 'Minute Maker';

export default function PrivacyPage() {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="Your privacy matters to us"
            lastUpdated="January 30, 2025"
        >
            <div style={legalStyles.section}>
                <p style={legalStyles.paragraph}>
                    At {BRAND}, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                    disclose, and safeguard your information when you use our meeting automation service.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>1. Information We Collect</h2>

                <h3 style={legalStyles.subheading}>Personal Information</h3>
                <p style={legalStyles.paragraph}>
                    When you create an account, we collect:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Name and email address</li>
                    <li style={legalStyles.listItem}>Payment information (processed securely via Stripe)</li>
                    <li style={legalStyles.listItem}>Profile information you choose to provide</li>
                </ul>

                <h3 style={legalStyles.subheading}>Meeting Data</h3>
                <p style={legalStyles.paragraph}>
                    When you use our service, we process:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Audio recordings you upload</li>
                    <li style={legalStyles.listItem}>Generated transcripts and summaries</li>
                    <li style={legalStyles.listItem}>Action items and extracted insights</li>
                    <li style={legalStyles.listItem}>Generated contracts and documents</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>2. How We Use Your Information</h2>
                <p style={legalStyles.paragraph}>
                    We use the information we collect to:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Provide, maintain, and improve our services</li>
                    <li style={legalStyles.listItem}>Process your transactions and manage your account</li>
                    <li style={legalStyles.listItem}>Send you technical notices and support messages</li>
                    <li style={legalStyles.listItem}>Respond to your comments and questions</li>
                    <li style={legalStyles.listItem}>Analyze usage patterns to enhance user experience</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>3. Data Security</h2>
                <p style={legalStyles.paragraph}>
                    We implement industry-standard security measures to protect your data:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>End-to-end encryption for all data in transit</li>
                    <li style={legalStyles.listItem}>AES-256 encryption for data at rest</li>
                    <li style={legalStyles.listItem}>SOC 2 Type II certified infrastructure</li>
                    <li style={legalStyles.listItem}>Regular security audits and penetration testing</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>4. Data Retention</h2>
                <p style={legalStyles.paragraph}>
                    We retain your meeting data for as long as your account is active. Your data remains available
                    until you choose to delete specific meetings or your account. When you delete meeting content,
                    it is permanently removed from our systems. You can delete your data at any time through
                    your account settings or by contacting us.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>5. Third-Party Services</h2>
                <p style={legalStyles.paragraph}>
                    We use trusted third-party services to help provide our service. Your data is only shared
                    with these providers as necessary to deliver our services:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}><strong>OpenAI Whisper API</strong> — Audio transcription</li>
                    <li style={legalStyles.listItem}><strong>Google AI (Gemini)</strong> — Meeting analysis and insights</li>
                    <li style={legalStyles.listItem}><strong>Stripe</strong> — Payment processing</li>
                </ul>
                <p style={legalStyles.paragraph}>
                    We do not sell, share, or provide your data to any third parties for marketing or other purposes.
                    Your meeting content is processed solely to provide you with transcription and analysis features.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>6. Your Rights</h2>
                <p style={legalStyles.paragraph}>
                    You have the right to:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Access your personal data</li>
                    <li style={legalStyles.listItem}>Correct inaccurate data</li>
                    <li style={legalStyles.listItem}>Request deletion of your data</li>
                    <li style={legalStyles.listItem}>Export your data in a portable format</li>
                    <li style={legalStyles.listItem}>Opt out of marketing communications</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>7. Contact Us</h2>
                <p style={legalStyles.paragraph}>
                    If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p style={legalStyles.paragraph}>
                    <strong>Email:</strong> administrator@minutemaker.tech
                </p>
            </div>
        </StaticPageLayout>
    );
}

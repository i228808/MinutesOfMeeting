import StaticPageLayout, { legalStyles } from '../layouts/StaticPageLayout';

const BRAND = 'Brevity';

export default function TermsPage() {
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="Please read these terms carefully"
            lastUpdated="January 30, 2025"
        >
            <div style={legalStyles.section}>
                <p style={legalStyles.paragraph}>
                    Welcome to {BRAND}. By accessing or using our service, you agree to be bound by these
                    Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>1. Acceptance of Terms</h2>
                <p style={legalStyles.paragraph}>
                    By creating an account or using {BRAND}, you acknowledge that you have read, understood,
                    and agree to be bound by these Terms and our Privacy Policy. If you are using {BRAND} on
                    behalf of an organization, you represent that you have authority to bind that organization.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>2. Description of Service</h2>
                <p style={legalStyles.paragraph}>
                    {BRAND} provides an AI-powered meeting automation platform that includes:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Audio transcription and speaker identification</li>
                    <li style={legalStyles.listItem}>AI-powered meeting analysis and summarization</li>
                    <li style={legalStyles.listItem}>Action item and deadline extraction</li>
                    <li style={legalStyles.listItem}>Contract generation from meeting content</li>
                    <li style={legalStyles.listItem}>Calendar integration and task synchronization</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>3. User Accounts</h2>
                <p style={legalStyles.paragraph}>
                    To use {BRAND}, you must create an account. You are responsible for:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Maintaining the security of your account credentials</li>
                    <li style={legalStyles.listItem}>All activities that occur under your account</li>
                    <li style={legalStyles.listItem}>Notifying us immediately of any unauthorized access</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>4. Acceptable Use</h2>
                <p style={legalStyles.paragraph}>
                    You agree not to use {BRAND} to:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Violate any applicable laws or regulations</li>
                    <li style={legalStyles.listItem}>Record or transcribe conversations without proper consent</li>
                    <li style={legalStyles.listItem}>Upload content that infringes intellectual property rights</li>
                    <li style={legalStyles.listItem}>Attempt to reverse engineer or compromise our systems</li>
                    <li style={legalStyles.listItem}>Use the service for any illegal or harmful purposes</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>5. Payment and Billing</h2>
                <p style={legalStyles.paragraph}>
                    For paid plans, you agree to pay all fees according to the pricing and billing terms presented
                    at the time of purchase. Subscription fees are billed in advance on a monthly or annual basis.
                    All payments are non-refundable except as required by law.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>6. Intellectual Property</h2>
                <p style={legalStyles.paragraph}>
                    You retain ownership of all content you upload to {BRAND}. By using our service, you grant us
                    a limited license to process your content solely to provide the service. We retain ownership of
                    the {BRAND} platform, including all software, algorithms, and user interface designs.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>7. Limitation of Liability</h2>
                <p style={legalStyles.paragraph}>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, {BRAND.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                    OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>8. Disclaimer of Warranties</h2>
                <p style={legalStyles.paragraph}>
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT
                    WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. GENERATED
                    CONTRACTS ARE FOR REFERENCE ONLY AND SHOULD BE REVIEWED BY QUALIFIED LEGAL COUNSEL.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>9. Termination</h2>
                <p style={legalStyles.paragraph}>
                    We may suspend or terminate your access to {BRAND} at any time for violation of these Terms.
                    You may cancel your account at any time through your account settings. Upon termination,
                    your right to use the service ceases immediately.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>10. Changes to Terms</h2>
                <p style={legalStyles.paragraph}>
                    We may modify these Terms at any time. We will notify you of material changes via email or
                    through the service. Continued use of {BRAND} after changes constitutes acceptance of the
                    modified Terms.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>11. Contact</h2>
                <p style={legalStyles.paragraph}>
                    For questions about these Terms, please contact us at:
                </p>
                <p style={legalStyles.paragraph}>
                    <strong>Email:</strong> legal@getbrevity.com<br />
                    <strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105
                </p>
            </div>
        </StaticPageLayout>
    );
}

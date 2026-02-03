import StaticPageLayout, { legalStyles } from '../layouts/StaticPageLayout';

const BRAND = 'Minute Maker';

export default function GDPRPage() {
    return (
        <StaticPageLayout
            title="GDPR Compliance"
            subtitle="Our commitment to data protection"
            lastUpdated="January 30, 2025"
        >
            <div style={legalStyles.section}>
                <p style={legalStyles.paragraph}>
                    {BRAND} is committed to complying with the General Data Protection Regulation (GDPR) and
                    protecting the personal data of our users in the European Union and European Economic Area.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Our Role as a Data Processor</h2>
                <p style={legalStyles.paragraph}>
                    When you use {BRAND} to process meeting recordings, we act as a data processor on your behalf.
                    You remain the data controller and are responsible for ensuring you have the appropriate legal
                    basis for processing personal data through our service.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Your Rights Under GDPR</h2>
                <p style={legalStyles.paragraph}>
                    As a data subject, you have the following rights:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}><strong>Right of Access</strong> — Request a copy of your personal data</li>
                    <li style={legalStyles.listItem}><strong>Right to Rectification</strong> — Correct inaccurate personal data</li>
                    <li style={legalStyles.listItem}><strong>Right to Erasure</strong> — Request deletion of your data ("right to be forgotten")</li>
                    <li style={legalStyles.listItem}><strong>Right to Restrict Processing</strong> — Limit how we use your data</li>
                    <li style={legalStyles.listItem}><strong>Right to Data Portability</strong> — Export your data in a machine-readable format</li>
                    <li style={legalStyles.listItem}><strong>Right to Object</strong> — Object to processing based on legitimate interests</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Data Processing Agreement</h2>
                <p style={legalStyles.paragraph}>
                    For business customers who require a Data Processing Agreement (DPA) to meet their GDPR
                    compliance obligations, we offer a standard DPA that can be executed upon request.
                    Contact our legal team at legal@minutemaker.com to request a DPA.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Data Transfer Mechanisms</h2>
                <p style={legalStyles.paragraph}>
                    For transfers of personal data outside the EU/EEA, we rely on:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li style={legalStyles.listItem}>Adequacy decisions where applicable</li>
                    <li style={legalStyles.listItem}>Additional technical and organizational measures as appropriate</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Security Measures</h2>
                <p style={legalStyles.paragraph}>
                    We implement appropriate technical and organizational measures to ensure a level of security
                    appropriate to the risk, including:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Encryption of personal data in transit and at rest</li>
                    <li style={legalStyles.listItem}>Regular security assessments and penetration testing</li>
                    <li style={legalStyles.listItem}>Access controls and audit logging</li>
                    <li style={legalStyles.listItem}>Staff training on data protection</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Data Protection Officer</h2>
                <p style={legalStyles.paragraph}>
                    For GDPR-related inquiries, please contact our Data Protection Officer:
                </p>
                <p style={legalStyles.paragraph}>
                    <strong>Email:</strong> dpo@minutemaker.com<br />
                    <strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Supervisory Authority</h2>
                <p style={legalStyles.paragraph}>
                    If you believe your data protection rights have been violated, you have the right to lodge
                    a complaint with a supervisory authority in the EU Member State where you reside or work.
                </p>
            </div>
        </StaticPageLayout>
    );
}

import StaticPageLayout, { legalStyles } from '../layouts/StaticPageLayout';

const BRAND = 'Minute Maker';

export default function RefundPage() {
    return (
        <StaticPageLayout
            title="Refund Policy"
            subtitle="Our commitment to your satisfaction"
            lastUpdated="February 5, 2026"
        >
            <div style={legalStyles.section}>
                <p style={legalStyles.paragraph}>
                    At {BRAND}, we want you to be completely satisfied with your purchase. If you're not happy
                    with our service, we offer a straightforward refund policy.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>7-Day Refund Policy</h2>
                <p style={legalStyles.paragraph}>
                    You may request a full refund within <strong>7 days</strong> of your initial purchase or
                    subscription renewal. This applies to all paid subscription tiers (Starter, Pro, and Unlimited).
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>How to Request a Refund</h2>
                <p style={legalStyles.paragraph}>
                    To request a refund, please contact us at:
                </p>
                <p style={legalStyles.paragraph}>
                    <strong>Email:</strong> administrator@minutemaker.tech
                </p>
                <p style={legalStyles.paragraph}>
                    Include your account email address and the reason for your refund request. We aim to process
                    all refund requests within 2-3 business days.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Refund Processing</h2>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}>Refunds are processed to your original payment method</li>
                    <li style={legalStyles.listItem}>Processing time is typically 5-10 business days depending on your bank</li>
                    <li style={legalStyles.listItem}>You will receive an email confirmation once your refund is processed</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>After Your Refund</h2>
                <p style={legalStyles.paragraph}>
                    Once your refund is processed, your subscription will be cancelled and your account will be
                    downgraded to the free tier. You will retain access to any data you've created, but premium
                    features will no longer be available.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Exceptions</h2>
                <p style={legalStyles.paragraph}>
                    Refund requests made after the 7-day window will be reviewed on a case-by-case basis.
                    We reserve the right to deny refund requests that appear to be abusive of this policy.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Questions?</h2>
                <p style={legalStyles.paragraph}>
                    If you have any questions about our refund policy, please contact us at
                    administrator@minutemaker.tech.
                </p>
            </div>
        </StaticPageLayout>
    );
}

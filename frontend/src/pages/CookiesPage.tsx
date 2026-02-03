import StaticPageLayout, { legalStyles } from '../layouts/StaticPageLayout';

const BRAND = 'Brevity';

export default function CookiesPage() {
    return (
        <StaticPageLayout
            title="Cookie Policy"
            subtitle="How we use cookies and similar technologies"
            lastUpdated="January 30, 2025"
        >
            <div style={legalStyles.section}>
                <p style={legalStyles.paragraph}>
                    This Cookie Policy explains how {BRAND} uses cookies and similar technologies to recognize
                    you when you visit our website and use our services.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>What Are Cookies?</h2>
                <p style={legalStyles.paragraph}>
                    Cookies are small data files placed on your device when you visit a website. They are widely
                    used to make websites work efficiently and provide reporting information.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Types of Cookies We Use</h2>

                <h3 style={legalStyles.subheading}>Essential Cookies</h3>
                <p style={legalStyles.paragraph}>
                    These cookies are required for the basic functionality of our service. They enable you to
                    log in, navigate the application, and use core features. You cannot opt out of essential cookies.
                </p>

                <h3 style={legalStyles.subheading}>Analytics Cookies</h3>
                <p style={legalStyles.paragraph}>
                    We use analytics cookies to understand how visitors interact with our website. This helps us
                    improve our service and user experience. These cookies collect information anonymously.
                </p>

                <h3 style={legalStyles.subheading}>Functional Cookies</h3>
                <p style={legalStyles.paragraph}>
                    These cookies remember choices you make (such as theme preferences) to provide enhanced,
                    personalized features.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Managing Cookies</h2>
                <p style={legalStyles.paragraph}>
                    Most web browsers allow you to control cookies through their settings. You can set your
                    browser to refuse all or some cookies, or to alert you when cookies are being sent.
                    Note that disabling certain cookies may affect the functionality of our service.
                </p>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Third-Party Cookies</h2>
                <p style={legalStyles.paragraph}>
                    Some cookies on our site are placed by third-party services we use:
                </p>
                <ul style={legalStyles.list}>
                    <li style={legalStyles.listItem}><strong>Google Analytics</strong> — Website analytics</li>
                    <li style={legalStyles.listItem}><strong>Stripe</strong> — Payment processing</li>
                    <li style={legalStyles.listItem}><strong>Intercom</strong> — Customer support chat</li>
                </ul>
            </div>

            <div style={legalStyles.section}>
                <h2 style={legalStyles.heading}>Contact Us</h2>
                <p style={legalStyles.paragraph}>
                    If you have questions about our use of cookies, please contact us at privacy@getbrevity.com.
                </p>
            </div>
        </StaticPageLayout>
    );
}

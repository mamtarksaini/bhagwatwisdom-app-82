
import { PageLayout } from "@/components/layout/PageLayout";

const PrivacyPage = () => {
  return (
    <PageLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
    >
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you:</p>
        <ul>
          <li>Create or modify your account</li>
          <li>Use our services or features</li>
          <li>Contact customer support</li>
          <li>Complete surveys or participate in promotions</li>
        </ul>
        
        <p>This information may include:</p>
        <ul>
          <li>Name, email address, and other contact information</li>
          <li>User credentials</li>
          <li>Payment information when you subscribe to premium services</li>
          <li>Your interactions with our services, like problems submitted to the Problem Solver</li>
          <li>Communications with us</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and customer service requests</li>
          <li>Develop new products and services</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          <li>Personalize and improve your experience</li>
        </ul>

        <h2>3. Sharing of Information</h2>
        <p>We may share information about you as follows:</p>
        <ul>
          <li>With service providers who perform services on our behalf</li>
          <li>With business partners, with your consent</li>
          <li>In response to legal process or when we believe disclosure is necessary to protect rights</li>
          <li>In connection with a merger, sale of company assets, financing, or acquisition</li>
        </ul>

        <h2>4. Your Choices</h2>
        <p>Account Information: You may update, correct, or delete your account information at any time by logging into your account or contacting us.</p>
        <p>Marketing Communications: You may opt out of receiving promotional emails by following the instructions in those emails.</p>
        <p>Cookies: Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject cookies.</p>

        <h2>5. Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>

        <h2>6. Children's Privacy</h2>
        <p>Our services are not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>

        <h2>7. Changes to This Privacy Policy</h2>
        <p>We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@bhagwatwisdom.com.</p>

        <p className="text-muted-foreground mt-8">Last updated: June 15, 2023</p>
      </div>
    </PageLayout>
  );
};

export default PrivacyPage;

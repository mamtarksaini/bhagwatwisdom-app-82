
import { PageLayout } from "@/components/layout/PageLayout";

const TermsPage = () => {
  return (
    <PageLayout
      title="Terms and Conditions"
      description="Please read these terms carefully before using our services."
    >
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead">
          These Terms and Conditions ("Terms") govern your access to and use of Bhagwat Wisdom's website, mobile application, and services.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.</p>

        <h2>2. Changes to Terms</h2>
        <p>We may modify the Terms at any time. If we make changes, we will provide notice, such as by updating the date at the top of the Terms and by displaying a notice on our Services. Your continued use of our Services after any such updates constitutes your acceptance of the revised Terms.</p>

        <h2>3. Privacy Policy</h2>
        <p>Our Privacy Policy describes how we handle the information you provide to us. By using our Services, you acknowledge that we will collect, use and share your information as described in our Privacy Policy.</p>

        <h2>4. Account Registration</h2>
        <p>You may need to register for an account to access certain features of our Services. When you register, you agree to provide accurate information and to keep your information up to date. You are responsible for safeguarding your account authentication credentials.</p>

        <h2>5. User Content</h2>
        <p>Our Services may allow you to post, link, store, share, or otherwise provide content ("User Content"). By providing User Content, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, copy, modify, create derivative works based on, distribute, publicly display, publicly perform, and otherwise exploit in any manner such User Content in all formats and distribution channels now known or hereafter devised.</p>

        <h2>6. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any applicable law or regulation</li>
          <li>Use our Services for any illegal purpose</li>
          <li>Interfere with or disrupt our Services or servers</li>
          <li>Access or use our Services to send spam or unsolicited messages</li>
          <li>Impersonate any person or entity</li>
          <li>Collect or store personal data about other users without their permission</li>
        </ul>

        <h2>7. Termination</h2>
        <p>We may terminate or suspend your access to and use of the Services at our sole discretion, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>OUR SERVICES ARE PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

        <h2>9. Limitation of Liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR ACCESS TO OR USE OF THE SERVICES.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>

        <h2>11. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at legal@bhagwatwisdom.com.</p>

        <p className="text-muted-foreground mt-8">Last updated: June 15, 2023</p>
      </div>
    </PageLayout>
  );
};

export default TermsPage;

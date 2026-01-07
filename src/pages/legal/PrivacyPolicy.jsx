import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to StudyBrick
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
                        <p className="text-neutral-500 text-sm mt-1">Last updated: January 2026</p>
                    </div>
                </div>

                <div className="prose prose-neutral max-w-none">
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        At StudyBrick, we take your privacy seriously. This policy explains what information we collect,
                        how we use it, and the choices you have. We've tried to keep this simple and readable.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What We Collect</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        When you use StudyBrick, we collect:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                        <li><strong>Account information:</strong> Your name, email address, and profile details you provide during signup or onboarding.</li>
                        <li><strong>Usage data:</strong> How you interact with the platform—which pages you visit, features you use, and when you log in.</li>
                        <li><strong>Device information:</strong> Basic details like your browser type and screen size to ensure the app works well for you.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How We Use Your Data</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We use your information to:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                        <li>Authenticate you and keep your account secure</li>
                        <li>Provide access to features based on your subscription plan</li>
                        <li>Improve the platform based on how it's being used</li>
                        <li>Send important updates about your account or service changes</li>
                    </ul>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        We don't sell your data to advertisers or third parties.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Data Security</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We use industry-standard security measures to protect your data. This includes encrypted connections (HTTPS),
                        secure authentication through Firebase, and regular security reviews. While no system is 100% secure,
                        we take reasonable steps to keep your information safe.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Cookies</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We use essential cookies to keep you logged in and remember your preferences (like dark mode).
                        We don't use tracking cookies for advertising. Some basic analytics cookies help us understand
                        how the platform is used so we can improve it.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Third-Party Services</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        StudyBrick uses trusted third-party services to operate:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                        <li><strong>Firebase:</strong> For authentication and database storage</li>
                        <li><strong>Vercel:</strong> For hosting the application</li>
                        <li><strong>Google Analytics:</strong> For basic usage insights (anonymized)</li>
                    </ul>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        These services have their own privacy policies. We only share what's necessary to provide our service.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Your Rights</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        You have the right to:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                        <li>Access the personal data we have about you</li>
                        <li>Request corrections to your information</li>
                        <li>Ask us to delete your account and associated data</li>
                        <li>Export your data in a readable format</li>
                    </ul>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        To exercise any of these rights, contact us at the email below.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Changes to This Policy</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We may update this policy from time to time. If we make significant changes, we'll notify you
                        through the app or by email. The "last updated" date at the top tells you when this was last revised.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Contact Us</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        If you have questions about this policy or how we handle your data, reach out to us:
                    </p>
                    <p className="text-neutral-900 font-medium mt-2">
                        📧 support@studybrick.in
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-neutral-200">
                    <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                        <Link to="/terms-of-service" className="hover:text-neutral-900 transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/login" className="hover:text-neutral-900 transition-colors">
                            Back to Login
                        </Link>
                    </div>
                    <p className="text-sm text-neutral-400 mt-4">
                        © {new Date().getFullYear()} StudyBrick. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;

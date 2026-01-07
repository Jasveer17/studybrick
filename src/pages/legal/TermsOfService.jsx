import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfService = () => {
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
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
                        <p className="text-neutral-500 text-sm mt-1">Last updated: January 2026</p>
                    </div>
                </div>

                <div className="prose prose-neutral max-w-none">
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        Welcome to StudyBrick. By using our platform, you agree to these terms.
                        Please read them carefully—they explain your rights and responsibilities as a user.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What StudyBrick Is</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        StudyBrick is a question paper builder for educational institutions and educators.
                        It helps you browse, select, and compile questions into printable question papers.
                        The platform is designed for academic and educational use only.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Acceptable Use</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        You agree to use StudyBrick only for legitimate educational purposes. This means:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                        <li>Creating question papers for your institution or personal study</li>
                        <li>Accessing content you're authorized to view based on your subscription</li>
                        <li>Not sharing your login credentials with others</li>
                        <li>Not attempting to scrape, copy, or redistribute our question bank</li>
                        <li>Not using the platform for any unlawful or harmful activities</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Your Account</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        You're responsible for keeping your account secure. Use a strong password and don't share
                        your login details. If you notice any unauthorized access, let us know immediately.
                    </p>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        We may create accounts for institutional users. In such cases, the institution admin
                        is responsible for managing user access within their organization.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Subscriptions & Access</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        Access to StudyBrick features depends on your subscription plan:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                        <li>Plans are time-bound and expire on the date shown in your profile</li>
                        <li>We don't offer automatic renewals—you'll need to contact us to extend</li>
                        <li>Payments are generally non-refundable unless we explicitly agree otherwise</li>
                        <li>We reserve the right to modify pricing with reasonable notice</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Content & Intellectual Property</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        All questions, study materials, and content on StudyBrick are owned by us or our content partners.
                        You may not redistribute, resell, or publish this content outside of your intended use.
                    </p>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        <strong>Question papers you generate</strong> are for your personal or institutional use only.
                        You cannot sell them or share them publicly without permission.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Service Availability</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We aim to keep StudyBrick available and reliable, but we can't guarantee 100% uptime.
                        Occasionally, we may need to perform maintenance or updates that temporarily affect access.
                        We'll try to notify you in advance when possible.
                    </p>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        StudyBrick is provided "as is" without warranties of any kind. We're not liable for
                        any losses resulting from service interruptions or data issues.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Termination</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We may suspend or terminate your account if you violate these terms or misuse the platform.
                        This includes sharing content illegally, attempting to bypass restrictions, or engaging
                        in any behavior that harms other users or our service.
                    </p>
                    <p className="text-neutral-600 leading-relaxed mt-4">
                        You can also close your account at any time by contacting us. Upon termination,
                        your access ends and we may delete your data after a reasonable period.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Changes to These Terms</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        We may update these terms occasionally. If we make significant changes, we'll notify you
                        through the app or by email. Continuing to use StudyBrick after changes means you accept the new terms.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Contact Us</h2>
                    <p className="text-neutral-600 leading-relaxed">
                        Questions about these terms? Get in touch:
                    </p>
                    <p className="text-neutral-900 font-medium mt-2">
                        📧 support@studybrick.in
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-neutral-200">
                    <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                        <Link to="/privacy-policy" className="hover:text-neutral-900 transition-colors">
                            Privacy Policy
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

export default TermsOfService;

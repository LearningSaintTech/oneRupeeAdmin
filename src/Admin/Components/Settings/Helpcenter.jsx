import React, { useState } from "react";
import { Search, BookOpen, User, CreditCard, Laptop, MessageCircle, Mail, Phone } from "lucide-react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Account",
      question: "How do I update my profile?",
      answer: "Go to ‘My Profile’ from your dashboard and click on Edit to update your details.",
      icon: <User className="text-blue-500 w-6 h-6" />,
    },
    {
      category: "Courses",
      question: "How do I enroll in a course?",
      answer: "Visit the Courses page, choose your course, and click on ‘Enroll Now’.",
      icon: <BookOpen className="text-green-500 w-6 h-6" />,
    },
    {
      category: "Payments",
      question: "Which payment methods are accepted?",
      answer: "We accept UPI, credit/debit cards, and net banking.",
      icon: <CreditCard className="text-yellow-500 w-6 h-6" />,
    },
    {
      category: "Technical",
      question: "Videos are not loading, what should I do?",
      answer: "Check your internet connection or try refreshing the page. If the problem persists, contact support.",
      icon: <Laptop className="text-red-500 w-6 h-6" />,
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Help Center 🎓</h1>
        <p className="text-gray-600">We’re here to support your learning journey</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10 relative">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm"
        />
        <Search className="absolute right-4 top-3.5 text-gray-400 w-6 h-6" />
      </div>

      {/* FAQs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                {faq.icon}
                <div>
                  <p className="text-xs text-indigo-500 uppercase tracking-wide">
                    {faq.category}
                  </p>
                  <h3 className="font-semibold text-lg text-gray-800">{faq.question}</h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm flex-1">{faq.answer}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No results found...</p>
        )}
      </div>

      {/* Contact Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Need more help?
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-6 text-center">
            <MessageCircle className="mx-auto mb-4 text-green-500 w-10 h-10" />
            <h3 className="font-semibold mb-2">Chat with Counselor</h3>
            <p className="text-gray-500 text-sm mb-3">Get academic guidance anytime.</p>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-medium hover:opacity-90">
              Start Chat
            </button>
          </div>

          <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-6 text-center">
            <Mail className="mx-auto mb-4 text-blue-500 w-10 h-10" />
            <h3 className="font-semibold mb-2">Email Academic Support</h3>
            <p className="text-gray-500 text-sm mb-3">We’ll respond within 12 hours.</p>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium hover:opacity-90">
              Send Email
            </button>
          </div>

          <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-6 text-center">
            <Phone className="mx-auto mb-4 text-yellow-500 w-10 h-10" />
            <h3 className="font-semibold mb-2">Call Helpline</h3>
            <p className="text-gray-500 text-sm mb-3">Reach us directly for urgent queries.</p>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium hover:opacity-90">
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

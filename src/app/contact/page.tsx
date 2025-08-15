"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HeadphonesIcon,
  Building,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        "Message sent successfully! We'll get back to you within 24 hours."
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "general",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@showpass.com",
      description: "Send us an email anytime",
      color: "purple",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri 9AM-6PM PST",
      color: "blue",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "123 Event Street, San Francisco, CA",
      description: "Our main office",
      color: "green",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      details: "Available 24/7",
      description: "Instant support via chat",
      color: "pink",
    },
  ];

  const supportCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "events", label: "Event Management" },
    { value: "partnership", label: "Partnership" },
    { value: "feedback", label: "Feedback" },
  ];

  const faqItems = [
    {
      question: "How do I create my first event?",
      answer:
        "Simply sign up for an organizer account, click 'Create Event', and follow our step-by-step wizard to set up your event details, ticketing, and publish it to the world.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers. All transactions are processed securely with industry-standard encryption.",
    },
    {
      question: "How much does ShowPass cost?",
      answer:
        "ShowPass charges a small service fee per ticket sold. There are no upfront costs or monthly fees. You only pay when you sell tickets, making it risk-free to get started.",
    },
    {
      question: "Can I customize my event page?",
      answer:
        "Yes! You can customize your event page with your branding, images, colors, and detailed descriptions. You can also add custom fields and integrate with your existing marketing tools.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="relative z-10 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 text-sm text-purple-300 backdrop-blur-sm">
              <HeadphonesIcon size={16} className="mr-2" />
              Get in Touch
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              We're Here to
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Help You Succeed
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Have questions about ShowPass? Need help with your event? Our
              friendly support team is ready to assist you every step of the
              way.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${
                    item.color === "purple"
                      ? "from-purple-500 to-purple-600"
                      : item.color === "blue"
                      ? "from-blue-500 to-cyan-500"
                      : item.color === "green"
                      ? "from-green-500 to-emerald-500"
                      : "from-pink-500 to-rose-500"
                  } flex items-center justify-center`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-purple-400 font-medium mb-2">
                  {item.details}
                </p>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16 sm:mb-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                      >
                        {supportCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 resize-none"
                      placeholder="Tell us more about how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-900/25"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-start gap-2">
                      <CheckCircle
                        size={20}
                        className="text-green-400 mt-0.5 flex-shrink-0"
                      />
                      {faq.question}
                    </h3>
                    <p className="text-gray-400 leading-relaxed pl-7">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Additional Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Globe size={20} className="text-blue-400" />
                  Need More Help?
                </h3>
                <p className="text-gray-300 mb-4">
                  Check out our comprehensive help center with detailed guides,
                  tutorials, and troubleshooting tips.
                </p>
                <a
                  href="/help"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300"
                >
                  <Building size={16} />
                  Visit Help Center
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Business Hours & Location */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock size={20} className="text-purple-400" />
                Business Hours
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="text-white font-medium">
                    9:00 AM - 6:00 PM PST
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-white font-medium">
                    10:00 AM - 4:00 PM PST
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-white font-medium">Closed</span>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Live chat available 24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-purple-400" />
                Our Location
              </h3>
              <div className="text-gray-300 space-y-2">
                <p className="text-white font-medium">ShowPass Headquarters</p>
                <p>123 Event Street, Suite 100</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
              <div className="mt-6">
                <a
                  href="https://maps.google.com/?q=123+Event+Street+San+Francisco+CA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-300"
                >
                  <MapPin size={16} />
                  View on Map
                </a>
              </div>
            </div>
          </motion.div>

          {/* Emergency Support */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="text-red-400" size={24} />
                <h2 className="text-2xl font-bold text-white">
                  Event Day Emergency Support
                </h2>
              </div>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Having issues during your live event? Our emergency support team
                is available 24/7 to help you resolve critical issues quickly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+15551234567"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <Phone size={18} />
                  Emergency Hotline
                </a>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300">
                  <MessageCircle size={18} />
                  Priority Chat
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

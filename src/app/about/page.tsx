"use client";

import { motion } from "framer-motion";
import {
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Sparkles,
  CalendarIcon,
  TicketCheck,
  Building,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default function AboutPage() {
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

  const stats = [
    { number: "10K+", label: "Events Created", icon: CalendarIcon },
    { number: "50K+", label: "Tickets Sold", icon: TicketCheck },
    { number: "500+", label: "Organizers", icon: Users },
    { number: "25+", label: "Cities", icon: Globe },
  ];

  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To democratize event management by providing powerful, intuitive tools that help organizers create memorable experiences while connecting communities.",
      color: "purple",
    },
    {
      icon: Heart,
      title: "Our Values",
      description:
        "We believe in transparency, innovation, and putting our users first. Every feature we build is designed with the organizer and attendee experience in mind.",
      color: "pink",
    },
    {
      icon: Award,
      title: "Our Promise",
      description:
        "Reliable, secure, and scalable event management solutions that grow with you, from intimate gatherings to large-scale conferences.",
      color: "blue",
    },
  ];

  const team = [
    {
      name: "Muhammed Abiodun",
      role: "CEO & Founder",
      bio: "Full-stack developer and entrepreneur passionate about leveraging cutting-edge technology to create seamless event experiences. With expertise in modern web technologies, I'm building ShowPass to revolutionize how communities connect through events.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
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
              <Sparkles size={16} className="mr-2" />
              About ShowPass
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Connecting Communities
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Through Events
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              ShowPass is more than just an event management platform. We're a
              community-driven company dedicated to making event organization
              seamless, accessible, and enjoyable for everyone.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all duration-300"
              >
                <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="mb-16 sm:mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose ShowPass?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                We're committed to providing the best event management
                experience through our core values and mission.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                      feature.color === "purple"
                        ? "from-purple-500 to-purple-600"
                        : feature.color === "pink"
                        ? "from-pink-500 to-rose-500"
                        : "from-blue-500 to-cyan-500"
                    } flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Story Section */}
          <motion.div
            className="mb-16 sm:mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 sm:p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                  My Story
                </h2>
                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    ShowPass was born from my personal experience as both an
                    event organizer and a developer. I recognized the gap
                    between powerful, expensive enterprise solutions and simple
                    but limited tools available to smaller organizers and
                    individual entrepreneurs.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    As a full-stack developer with a passion for creating
                    user-centric applications, I set out to build a platform
                    that combines enterprise-level functionality with an
                    intuitive, accessible design. ShowPass represents my vision
                    of democratizing professional event management tools.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Today, ShowPass continues to evolve as I work directly with
                    organizers to understand their needs and implement features
                    that make a real difference. Every line of code is written
                    with the goal of making event management simpler, more
                    efficient, and more enjoyable.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            className="mb-16 sm:mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Meet the Founder
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                The visionary behind ShowPass, dedicated to revolutionizing
                event management and bringing communities together.
              </p>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-all duration-300 group max-w-md"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-300">
                  <img
                    src={team[0].image}
                    alt={team[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {team[0].name}
                </h3>
                <p className="text-purple-400 text-lg font-medium mb-4">
                  {team[0].role}
                </p>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {team[0].bio}
                </p>

                {/* Additional founder details */}
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-center gap-2">
                    <Building className="h-4 w-4 text-purple-400" />
                    <span>Building the future of events</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span>Connecting communities worldwide</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Future team message */}
            <motion.div
              variants={itemVariants}
              className="text-center mt-12 p-6 bg-slate-800/20 rounded-xl border border-slate-700/30"
            >
              <h4 className="text-lg font-semibold text-white mb-2">
                Growing Our Team
              </h4>
              <p className="text-gray-400">
                ShowPass is expanding! We're looking for passionate individuals
                who share our vision of revolutionizing event management.
                <a
                  href="/contact"
                  className="text-purple-400 hover:text-purple-300 ml-1 underline"
                >
                  Get in touch
                </a>{" "}
                if you'd like to join our mission.
              </p>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Create Amazing Events?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of organizers who trust ShowPass to bring their
                events to life. Start your journey with us today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/auth/signup"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-900/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free
                </motion.a>
                <motion.a
                  href="/contact"
                  className="px-8 py-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Us
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

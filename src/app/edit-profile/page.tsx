"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  return (
      <EditProfileContent />
  );
}

function EditProfileContent() {
  const {
    user,
    userProfile,
    updateUserProfile,
    fetchUserProfile,
    isLoading,
    error,
  } = useAuthStore();

  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    website: "",
    socialLinks: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    businessName: "",
    businessPhone: "",
    businessWebsite: "",
    businessAddress: "",
    businessType: "individual",
  });

  const isOrganizer = user?.role === "organizer";

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bio: userProfile?.bio || "",
        website: userProfile?.website || "",
        socialLinks: {
          twitter: userProfile?.socialLinks?.twitter || "",
          facebook: userProfile?.socialLinks?.facebook || "",
          instagram: userProfile?.socialLinks?.instagram || "",
          linkedin: userProfile?.socialLinks?.linkedin || "",
        },
        businessName: userProfile?.businessName || "",
        businessPhone: userProfile?.businessPhone || "",
        businessWebsite: userProfile?.businessWebsite || "",
        businessAddress: userProfile?.businessAddress || "",
        businessType: userProfile?.businessType || "individual",
      });
    }
  }, [user, userProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("socialLinks.")) {
      const socialKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateUserProfile(formData);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/profile">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-slate-400">
              Update your personal information and preferences
            </p>
          </div>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {successMessage}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Camera className="text-purple-400" size={20} />
                Profile Picture
              </h2>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {formData.firstName?.charAt(0)}
                    {formData.lastName?.charAt(0)}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <p className="text-white font-medium mb-2">
                    Change profile picture
                  </p>
                  <p className="text-slate-400 text-sm">
                    Upload a new avatar or choose from gallery
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="text-blue-400" size={20} />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-white font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Globe className="text-green-400" size={20} />
                Social Media Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="socialLinks.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="socialLinks.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleInputChange}
                    placeholder="facebook.com/username"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Business Information (Organizers Only) */}
            {isOrganizer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Briefcase className="text-purple-400" size={20} />
                  Business Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Business Type
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="organization">Organization</option>
                      <option value="nonprofit">Non-profit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Business Phone
                    </label>
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Business Website
                    </label>
                    <input
                      type="url"
                      name="businessWebsite"
                      value={formData.businessWebsite}
                      onChange={handleInputChange}
                      placeholder="https://your-business.com"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-white font-medium mb-2">
                    Business Address
                  </label>
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter your business address..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-end"
            >
              <Link href="/profile">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

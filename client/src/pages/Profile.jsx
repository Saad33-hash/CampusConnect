import { useState, useEffect } from 'react';
import { authAPI, uploadAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    university: '',
    department: '',
    year: '',
    skills: [],
    interests: [],
    resumeUrl: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        university: user.university || '',
        department: user.department || '',
        year: user.year || '',
        skills: user.skills || [],
        interests: user.interests || [],
        resumeUrl: user.resumeUrl || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interestToRemove) }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAPI.uploadAvatar(file);
      updateUser({ avatar: result.url });
      showToast('Avatar updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Resume must be less than 10MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAPI.uploadResume(file);
      setFormData(prev => ({ ...prev, resumeUrl: result.url }));
      showToast('Resume uploaded successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authAPI.updateProfile(formData);
      updateUser(result.user);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finder-theme min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full bg-[#1152d4]"></div>
              <h1 className="text-2xl font-semibold text-[#1E293B]">Profile Settings</h1>
            </div>
            <p className="text-[#64748B] ml-5 text-sm">Manage your profile information and preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
            {/* Avatar Section */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Profile Photo</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={user?.avatar || 'https://via.placeholder.com/150'}
                    alt={user?.displayName}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-[#E2E8F0]"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] hover:bg-[#EBF1FF] text-[#1E293B] rounded-lg cursor-pointer transition font-medium text-sm border border-[#E2E8F0]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-[#64748B] mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B]"
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B] resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-[#64748B] mt-1">{formData.bio.length}/500 characters</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">University</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B]"
                    placeholder="Your university"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B]"
                    placeholder="Your department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B] bg-white"
                  >
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF1FF] text-[#1152d4] rounded-lg text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#1152d4]/60 hover:text-[#1152d4] transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {formData.skills.length === 0 && (
                  <p className="text-sm text-[#64748B]">No skills added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B]"
                  placeholder="Add a skill..."
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#EBF1FF] text-[#1E293B] rounded-lg transition font-medium text-sm border border-[#E2E8F0]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] text-[#1E293B] rounded-lg text-sm font-medium border border-[#E2E8F0]"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-[#64748B] hover:text-[#1E293B] transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {formData.interests.length === 0 && (
                  <p className="text-sm text-[#64748B]">No interests added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest(e)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 outline-none transition text-[#1E293B]"
                  placeholder="Add an interest..."
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#EBF1FF] text-[#1E293B] rounded-lg transition font-medium text-sm border border-[#E2E8F0]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Resume</h2>
              {formData.resumeUrl ? (
                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#EBF1FF] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">Resume uploaded</p>
                      <a
                        href={formData.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1152d4] hover:underline"
                      >
                        View resume
                      </a>
                    </div>
                  </div>
                  <label className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-lg cursor-pointer transition text-sm font-medium">
                    Replace
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E2E8F0] rounded-lg cursor-pointer hover:border-[#1152d4]/30 hover:bg-[#F8FAFC] transition">
                  <svg className="w-10 h-10 text-[#64748B] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                  </svg>
                  <p className="text-sm font-medium text-[#1E293B]">Click to upload resume</p>
                  <p className="text-xs text-[#64748B] mt-1">PDF only, max 10MB</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#1152d4] hover:bg-[#0d42a8] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

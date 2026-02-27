import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// SVG Icons
const AcademicIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StartupIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BriefcaseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const HackathonIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const POST_TYPES = [
  { value: 'academic-project', label: 'Academic Project', Icon: AcademicIcon, gradient: 'from-violet-500 to-purple-600', bg: 'violet' },
  { value: 'startup-gig', label: 'Startup Gig', Icon: StartupIcon, gradient: 'from-orange-500 to-rose-500', bg: 'orange' },
  { value: 'part-time-job', label: 'Part-time Job', Icon: BriefcaseIcon, gradient: 'from-cyan-500 to-blue-600', bg: 'cyan' },
  { value: 'hackathon', label: 'Hackathon', Icon: HackathonIcon, gradient: 'from-emerald-500 to-teal-600', bg: 'emerald' },
];

const COMPENSATION_TYPES = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'equity', label: 'Equity' },
  { value: 'negotiable', label: 'Negotiable' },
];

const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'on-campus', label: 'On Campus' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'flexible', label: 'Flexible' },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    requiredSkills: [],
    tags: [],
    deadline: '',
    compensation: { type: 'negotiable', amount: '' },
    location: 'flexible',
    duration: '',
    teamSize: '',
    // Type-specific fields
    eventDate: '',
    venue: '',
    courseCode: '',
    professor: '',
    companyName: '',
    website: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('compensation.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        compensation: { ...prev.compensation, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'skill') addSkill();
      else addTag();
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        status: isDraft ? 'draft' : 'open',
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
      };

      // Remove empty optional fields
      Object.keys(postData).forEach(key => {
        if (postData[key] === '' || postData[key] === undefined) {
          delete postData[key];
        }
      });

      await postsAPI.createPost(postData);
      showToast(isDraft ? 'Draft saved successfully!' : 'Post published successfully!', 'success');
      navigate('/posts');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'academic-project':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="e.g., CS 301"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Professor/Supervisor
              </label>
              <input
                type="text"
                name="professor"
                value={formData.professor}
                onChange={handleChange}
                placeholder="e.g., Dr. Smith"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        );
      case 'startup-gig':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company/Startup Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., TechStart Inc."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        );
      case 'hackathon':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., University Hall, Online"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-8 rounded-full bg-blue-600"></div>
                <h1 className="text-2xl font-semibold text-slate-900">Create New Post</h1>
              </div>
              <p className="text-slate-500 ml-5 text-sm">Share an opportunity with the campus community</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Post Type Selection — Glassmorphism Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/80 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Opportunity Type</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {POST_TYPES.map((type) => {
                    const TypeIcon = type.Icon;
                    const isSelected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-center overflow-hidden ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 mx-auto mb-2.5 rounded-xl flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                          isSelected ? 'text-blue-700' : 'text-slate-600'
                        }`}>
                          {type.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Info — Glassmorphism Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/80 ring-1 ring-slate-900/5 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Basic Information</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="e.g., Looking for React Developer for Campus App"
                    className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">{formData.title.length}/100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    maxLength={5000}
                    placeholder="Describe the opportunity, responsibilities, requirements, and what you're looking for..."
                    className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all text-slate-800 placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">{formData.description.length}/5000 characters</p>
                </div>

                {/* Type-specific fields */}
                {formData.type && renderTypeSpecificFields()}
              </div>

              {/* Skills & Tags — Glassmorphism Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/80 ring-1 ring-slate-900/5 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Skills & Tags</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Required Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'skill')}
                      placeholder="Type a skill and press Enter"
                      className="flex-1 px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {formData.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium border border-emerald-100"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-emerald-800 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'tag')}
                      placeholder="Add tags for better discoverability"
                      className="flex-1 px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-800 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Details — Glassmorphism Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/80 ring-1 ring-slate-900/5 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Location
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                    >
                      {LOCATION_TYPES.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 3 months, Ongoing"
                      className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Team Size Needed
                    </label>
                    <input
                      type="number"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      min="1"
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Compensation Type
                    </label>
                    <select
                      name="compensation.type"
                      value={formData.compensation.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                    >
                      {COMPENSATION_TYPES.map((comp) => (
                        <option key={comp.value} value={comp.value}>{comp.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.compensation.type === 'paid' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Amount/Rate
                      </label>
                      <input
                        type="text"
                        name="compensation.amount"
                        value={formData.compensation.amount}
                        onChange={handleChange}
                        placeholder="e.g., $20/hr, $500 fixed"
                        className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/80 ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={loading || !formData.type || !formData.title}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.type || !formData.title || !formData.description}
                      className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </span>
                      ) : 'Publish Post'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


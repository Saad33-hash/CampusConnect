import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const TYPE_CONFIG = {
  'academic-project': { label: 'Academic project', bg: 'bg-violet-100', text: 'text-violet-700' },
  'startup-gig': { label: 'Startup gig', bg: 'bg-orange-100', text: 'text-orange-700' },
  'part-time-job': { label: 'Part-time', bg: 'bg-[#EBF1FF]', text: 'text-[#1152d4]' },
  'hackathon': { label: 'Hackathon', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

// Circular Progress Score Component
const ScoreCircle = ({ score }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // emerald
    if (score >= 60) return '#1152d4'; // royal blue
    if (score >= 40) return '#F59E0B'; // amber
    return '#94A3B8'; // slate
  };

  const color = getScoreColor(score);

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#1E293B] font-bold text-sm">{score}</span>
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  const { post, rankingScore, reasons } = recommendation;
  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG['academic-project'];
  
  const isNew = reasons?.some(r => r.type === 'new');
  const isUrgent = reasons?.some(r => r.type === 'urgent');

  return (
    <Link
      to={`/posts/${post._id}`}
      className="block bg-white rounded-xl border border-[#E2E8F0] hover:border-[#1152d4]/30 hover:shadow-lg hover:shadow-[#1152d4]/5 transition-all duration-200 p-5 group"
    >
      {/* Type Label */}
      <p className="text-xs text-[#64748B] font-medium mb-2">
        {post.type === 'part-time-job' ? 'Premium job' : typeConfig.label}
      </p>
      
      {/* Title Row with Score */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#1E293B] text-lg leading-tight group-hover:text-[#1152d4] transition-colors">
              {post.title}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
              {typeConfig.label}
            </span>
          </div>
        </div>
        <ScoreCircle score={rankingScore} />
      </div>

      {/* Description */}
      <p className="text-[#64748B] text-sm line-clamp-1 mb-3">
        {post.description}
      </p>

      {/* Skills */}
      {post.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.requiredSkills.slice(0, 2).map((skill, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-[#EBF1FF] text-[#1152d4] rounded-md text-xs font-medium">
              {skill}
            </span>
          ))}
          {post.requiredSkills.length > 2 && (
            <span className="px-2.5 py-1 bg-[#F8FAFC] text-[#64748B] rounded-md text-xs font-medium">
              +{post.requiredSkills.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer: Creator + Status */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-2 min-w-0">
          {post.creator?.avatar ? (
            <img src={post.creator.avatar} alt="" className="w-6 h-6 rounded-full shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#1152d4] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {post.creator?.displayName?.[0] || '?'}
            </div>
          )}
          <span className="text-sm text-[#1E293B] font-medium truncate">{post.creator?.displayName}</span>
          {post.creator?.university && (
            <span className="text-sm text-[#64748B] truncate">• {post.creator.university}</span>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isNew && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Just posted
            </span>
          )}
          {isUrgent && !isNew && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Closing soon
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'top-matches', label: 'Best Matches' },
    { id: 'trending', label: 'Trending' },
    { id: 'new', label: 'Just Posted' },
    { id: 'closing-soon', label: 'Closing Soon' },
  ];

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (activeCategory === 'all') {
        response = await recommendationsAPI.getRecommendations({ limit: 20 });
      } else {
        response = await recommendationsAPI.getCategoryRecommendations(activeCategory, 20);
      }
      
      setRecommendations(response.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1E293B] mb-1">
              Recommended for You
            </h1>
            <p className="text-[#64748B] text-sm">
              AI-powered recommendations based on your profile, skills, and activity
            </p>
          </div>

        {/* Profile completion prompt */}
        {user && (!user.skills?.length || !user.interests?.length) && (
          <div className="bg-[#EBF1FF] border border-[#1152d4]/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1152d4]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1E293B]">Complete your profile for better recommendations</p>
                <p className="text-sm text-[#1152d4]">Add skills and interests to get more accurate matches</p>
              </div>
              <Link
                to="/profile"
                className="px-4 py-2 bg-[#1152d4] text-white rounded-lg text-sm font-medium hover:bg-[#0d42a8] transition-colors"
              >
                Update Profile
              </Link>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button 
            onClick={fetchRecommendations}
            className="p-2 text-[#64748B] hover:text-[#1152d4] hover:bg-[#EBF1FF] rounded-lg transition-colors"
            title="Refresh recommendations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="w-px h-6 bg-[#E2E8F0]"></div>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1E293B] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#1152d4]/30 hover:text-[#1152d4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1152d4] rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2 bg-[#1152d4] text-white rounded-lg hover:bg-[#0d42a8] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#EBF1FF] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No recommendations yet</h3>
            <p className="text-[#64748B] mb-4">
              {activeCategory !== 'all' 
                ? 'Try a different category or check back later'
                : 'Complete your profile to get personalized recommendations'}
            </p>
            <Link
              to="/posts"
              className="inline-block px-4 py-2 bg-[#1152d4] text-white rounded-lg hover:bg-[#0d42a8] transition-colors"
            >
              Browse All Opportunities
            </Link>
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, idx) => (
              <RecommendationCard key={rec.post._id || idx} recommendation={rec} />
            ))}
          </div>
        )}

        {/* Score Legend */}
        {!loading && recommendations.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-xl border border-[#E2E8F0]">
            <h3 className="font-semibold text-[#1E293B] mb-4">How rankings work</h3>
            <div className="flex flex-wrap gap-6 md:gap-10 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1E293B]">80+</span>
                  <p className="text-xs text-[#64748B]">Excellent match</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1152d4" strokeWidth="3" strokeDasharray="88" strokeDashoffset="35" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1E293B]">60-79</span>
                  <p className="text-xs text-[#64748B]">Good match</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="88" strokeDashoffset="50" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1E293B]">40-59</span>
                  <p className="text-xs text-[#64748B]">Potential match</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray="88" strokeDashoffset="66" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1E293B]">&lt;40</span>
                  <p className="text-xs text-[#64748B]">Low match</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#64748B]">
              Scores are based on skills match (40%), behavior patterns (20%), post freshness (15%), profile fit (15%), and popularity (10%).
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}


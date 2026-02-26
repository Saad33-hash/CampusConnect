import { Link } from 'react-router-dom';

// SVG Icons as components
const AcademicIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StartupIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const HackathonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const TYPE_CONFIG = {
  'academic-project': { 
    label: 'Academic', 
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-500/10',
    textColor: 'text-violet-600',
    Icon: AcademicIcon
  },
  'startup-gig': { 
    label: 'Startup', 
    gradient: 'from-orange-500 to-rose-500',
    bgLight: 'bg-orange-500/10',
    textColor: 'text-orange-600',
    Icon: StartupIcon
  },
  'part-time-job': { 
    label: 'Part-time', 
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-500/10',
    textColor: 'text-cyan-600',
    Icon: BriefcaseIcon
  },
  'hackathon': { 
    label: 'Hackathon', 
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    Icon: HackathonIcon
  },
};

const STATUS_CONFIG = {
  'open': { label: 'Open', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-600', dotClass: 'bg-emerald-500' },
  'closed': { label: 'Closed', bgClass: 'bg-slate-500/10', textClass: 'text-slate-500', dotClass: 'bg-slate-400' },
  'filled': { label: 'Filled', bgClass: 'bg-blue-500/10', textClass: 'text-blue-600', dotClass: 'bg-blue-500' },
  'draft': { label: 'Draft', bgClass: 'bg-amber-500/10', textClass: 'text-amber-600', dotClass: 'bg-amber-500' },
};

// Match score badge colors
const getMatchScoreStyle = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'ring-emerald-500/20' };
  if (score >= 60) return { bg: 'bg-blue-500/10', text: 'text-blue-600', ring: 'ring-blue-500/20' };
  if (score >= 40) return { bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'ring-amber-500/20' };
  return { bg: 'bg-slate-500/10', text: 'text-slate-500', ring: 'ring-slate-500/20' };
};

export default function PostCard({ post, showStatus = false }) {
  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG['academic-project'];
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG['open'];
  const TypeIcon = typeConfig.Icon;
  const matchScoreStyle = post.matchScore !== undefined ? getMatchScoreStyle(post.matchScore) : null;

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'w', seconds: 604800 },
      { label: 'd', seconds: 86400 },
      { label: 'h', seconds: 3600 },
      { label: 'm', seconds: 60 },
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count}${interval.label}`;
      }
    }
    return 'now';
  };

  const formatDeadline = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      to={`/posts/${post._id}`}
      className="group relative block bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden"
    >
      {/* Gradient accent bar */}
      <div className={`h-1 bg-linear-to-r ${typeConfig.gradient}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${typeConfig.bgLight} ${typeConfig.textColor}`}>
              <TypeIcon />
              {typeConfig.label}
            </span>
            {showStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass} animate-pulse`} />
                {statusConfig.label}
              </span>
            )}
            {/* Match Score Badge */}
            {matchScoreStyle && post.matchScore > 0 && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${matchScoreStyle.bg} ${matchScoreStyle.text} ring-1 ${matchScoreStyle.ring}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {post.matchScore}% Match
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium bg-slate-100/80 px-2 py-1 rounded-md shrink-0">
            {getTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Skills */}
        {post.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-slate-100/80 text-slate-600 rounded-md text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {post.requiredSkills.length > 3 && (
              <span className="px-2.5 py-1 text-slate-400 text-xs font-medium">
                +{post.requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100/80">
          <div className="flex items-center gap-2.5">
            {post.creator?.avatar ? (
              <img
                src={post.creator.avatar}
                alt={post.creator.displayName}
                className="w-7 h-7 rounded-full ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className={`w-7 h-7 rounded-full bg-linear-to-br ${typeConfig.gradient} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                {post.creator?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-sm text-slate-600 font-medium truncate max-w-[100px]">
              {post.creator?.displayName || 'Anonymous'}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {post.deadline && (
              <span className={`flex items-center gap-1 ${new Date(post.deadline) < new Date() ? 'text-red-400' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDeadline(post.deadline)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.views || 0}
            </span>
          </div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-linear-to-br ${typeConfig.gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none`} />
    </Link>
  );
}


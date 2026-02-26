/**
 * Job Recommendation Ranking Service
 * Ranks opportunities based on user profile, behavior, and post quality
 */

const Post = require('../Model/Post');
const Application = require('../Model/Application');
const { calculateMatchScore } = require('./matchScore');

// Weights for different ranking factors
const RANKING_WEIGHTS = {
  matchScore: 0.40,        // Profile match (skills, interests)
  freshness: 0.15,         // How recent the post is
  popularity: 0.10,        // Views and applications
  behaviorMatch: 0.20,     // Based on user's past behavior
  profileFit: 0.15         // Additional profile factors
};

/**
 * Get ranked job recommendations for a user
 */
const getRecommendations = async (user, options = {}) => {
  const { limit = 10, excludeApplied = true } = options;

  try {
    // Get all open posts
    let query = { status: 'open' };
    
    // Exclude user's own posts
    if (user._id) {
      query.creator = { $ne: user._id };
    }

    const posts = await Post.find(query)
      .populate('creator', 'displayName avatar university')
      .sort({ createdAt: -1 })
      .limit(100); // Get more than needed for ranking

    if (posts.length === 0) {
      return { recommendations: [], totalCount: 0 };
    }

    // Get user's application history for behavior analysis
    let appliedPostIds = [];
    let userBehavior = { preferredTypes: {}, preferredSkills: {} };
    
    if (user._id) {
      const applications = await Application.find({ applicant: user._id })
        .populate('post', 'type requiredSkills tags');
      
      appliedPostIds = applications.map(a => a.post?._id?.toString()).filter(Boolean);
      userBehavior = analyzeUserBehavior(applications);
    }

    // Filter out already applied posts if requested
    let eligiblePosts = posts;
    if (excludeApplied && appliedPostIds.length > 0) {
      eligiblePosts = posts.filter(p => !appliedPostIds.includes(p._id.toString()));
    }

    // Calculate ranking score for each post
    const rankedPosts = eligiblePosts.map(post => {
      const scores = calculateRankingScores(user, post, userBehavior, posts);
      const totalScore = calculateTotalScore(scores);
      
      return {
        post: post.toObject(),
        rankingScore: Math.round(totalScore),
        scores: scores,
        reasons: generateRecommendationReasons(scores, post, user)
      };
    });

    // Sort by ranking score (descending)
    rankedPosts.sort((a, b) => b.rankingScore - a.rankingScore);

    // Return top recommendations
    const recommendations = rankedPosts.slice(0, limit);

    return {
      recommendations,
      totalCount: rankedPosts.length
    };
  } catch (error) {
    console.error('Recommendation error:', error);
    throw error;
  }
};

/**
 * Analyze user's past behavior from applications
 */
const analyzeUserBehavior = (applications) => {
  const behavior = {
    preferredTypes: {},
    preferredSkills: {},
    preferredLocations: {}
  };

  applications.forEach(app => {
    if (!app.post) return;

    // Track preferred post types
    const type = app.post.type;
    behavior.preferredTypes[type] = (behavior.preferredTypes[type] || 0) + 1;

    // Track preferred skills
    (app.post.requiredSkills || []).forEach(skill => {
      const s = skill.toLowerCase();
      behavior.preferredSkills[s] = (behavior.preferredSkills[s] || 0) + 1;
    });
  });

  return behavior;
};

/**
 * Calculate individual ranking scores
 */
const calculateRankingScores = (user, post, userBehavior, allPosts) => {
  const postObj = post.toObject ? post.toObject() : post;
  
  // 1. Match Score (from existing system)
  const matchResult = calculateMatchScore(user, postObj);
  const matchScore = matchResult.score;

  // 2. Freshness Score (newer = better)
  const ageInDays = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const freshnessScore = Math.max(0, 100 - (ageInDays * 3)); // Lose 3 points per day

  // 3. Popularity Score (normalized views + applications)
  const maxViews = Math.max(...allPosts.map(p => p.views || 0), 1);
  const maxApps = Math.max(...allPosts.map(p => p.applicationsCount || 0), 1);
  const viewScore = ((post.views || 0) / maxViews) * 50;
  const appScore = ((post.applicationsCount || 0) / maxApps) * 50;
  const popularityScore = viewScore + appScore;

  // 4. Behavior Match Score (based on user's past applications)
  let behaviorScore = 50; // Base score
  
  // Bonus for preferred post types
  if (userBehavior.preferredTypes[post.type]) {
    behaviorScore += Math.min(30, userBehavior.preferredTypes[post.type] * 10);
  }
  
  // Bonus for matching skills user has applied to before
  const postSkills = (post.requiredSkills || []).map(s => s.toLowerCase());
  const matchedBehaviorSkills = postSkills.filter(s => userBehavior.preferredSkills[s]);
  behaviorScore += Math.min(20, matchedBehaviorSkills.length * 5);

  // 5. Profile Fit Score (additional factors)
  let profileFitScore = 50;
  
  // University match bonus
  if (user.university && post.creator?.university === user.university) {
    profileFitScore += 25;
  }
  
  // Deadline proximity bonus (posts expiring soon get boost)
  if (post.deadline) {
    const daysUntilDeadline = (new Date(post.deadline) - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
      profileFitScore += 15; // Urgency bonus
    }
  }
  
  // Resume required check
  if (post.requiresResume && !user.resumeUrl) {
    profileFitScore -= 20; // Penalty if resume required but user doesn't have one
  }

  return {
    match: Math.min(100, matchScore),
    freshness: Math.min(100, freshnessScore),
    popularity: Math.min(100, popularityScore),
    behavior: Math.min(100, behaviorScore),
    profileFit: Math.min(100, profileFitScore)
  };
};

/**
 * Calculate total weighted score
 */
const calculateTotalScore = (scores) => {
  return (
    scores.match * RANKING_WEIGHTS.matchScore +
    scores.freshness * RANKING_WEIGHTS.freshness +
    scores.popularity * RANKING_WEIGHTS.popularity +
    scores.behavior * RANKING_WEIGHTS.behaviorMatch +
    scores.profileFit * RANKING_WEIGHTS.profileFit
  );
};

/**
 * Generate human-readable reasons for recommendation
 */
const generateRecommendationReasons = (scores, post, user) => {
  const reasons = [];

  // Skills match
  if (scores.match >= 70) {
    reasons.push({ type: 'skills', text: 'Strong skills match', icon: 'check' });
  } else if (scores.match >= 50) {
    reasons.push({ type: 'skills', text: 'Good skills match', icon: 'check' });
  }

  // Freshness
  if (scores.freshness >= 90) {
    reasons.push({ type: 'new', text: 'Just posted', icon: 'clock' });
  } else if (scores.freshness >= 70) {
    reasons.push({ type: 'new', text: 'Recently posted', icon: 'clock' });
  }

  // Popularity
  if (scores.popularity >= 70) {
    reasons.push({ type: 'trending', text: 'Trending opportunity', icon: 'fire' });
  }

  // Behavior
  if (scores.behavior >= 70) {
    reasons.push({ type: 'behavior', text: 'Similar to posts you\'ve liked', icon: 'heart' });
  }

  // University match
  if (user.university && post.creator?.university === user.university) {
    reasons.push({ type: 'campus', text: 'Same campus', icon: 'building' });
  }

  // Deadline urgency
  if (post.deadline) {
    const daysUntilDeadline = (new Date(post.deadline) - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline > 0 && daysUntilDeadline <= 3) {
      reasons.push({ type: 'urgent', text: 'Closing soon!', icon: 'alert' });
    }
  }

  return reasons.slice(0, 3); // Max 3 reasons
};

/**
 * Get recommendation for a specific category
 */
const getCategoryRecommendations = async (user, category, limit = 5) => {
  const result = await getRecommendations(user, { limit: 50 });
  
  let filtered;
  switch (category) {
    case 'top-matches':
      filtered = result.recommendations.filter(r => r.scores.match >= 60);
      break;
    case 'trending':
      filtered = result.recommendations.filter(r => r.scores.popularity >= 50);
      filtered.sort((a, b) => b.scores.popularity - a.scores.popularity);
      break;
    case 'new':
      filtered = result.recommendations.filter(r => r.scores.freshness >= 80);
      break;
    case 'closing-soon':
      filtered = result.recommendations.filter(r => {
        if (!r.post.deadline) return false;
        const days = (new Date(r.post.deadline) - Date.now()) / (1000 * 60 * 60 * 24);
        return days > 0 && days <= 7;
      });
      break;
    default:
      filtered = result.recommendations;
  }

  return filtered.slice(0, limit);
};

module.exports = {
  getRecommendations,
  getCategoryRecommendations
};

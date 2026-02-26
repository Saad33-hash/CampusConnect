/**
 * Calculate match score between a user profile and a job posting
 * Returns a score from 0-100
 */

const calculateMatchScore = (user, post) => {
  if (!user || !post) return { score: 0, breakdown: { skills: null, hasResume: false, hasProfile: false } };

  let totalScore = 0;
  let totalWeight = 0;

  // 1. Skills Match (60% weight)
  const skillsWeight = 60;
  const userSkills = (user.skills || []).map(s => s.toLowerCase().trim());
  const requiredSkills = (post.requiredSkills || []).map(s => s.toLowerCase().trim());
  
  if (requiredSkills.length > 0) {
    const matchedSkills = userSkills.filter(skill => 
      requiredSkills.some(req => 
        req.includes(skill) || skill.includes(req) || 
        levenshteinSimilarity(skill, req) > 0.8
      )
    );
    const skillScore = Math.min(100, (matchedSkills.length / requiredSkills.length) * 100);
    totalScore += skillScore * skillsWeight;
    totalWeight += skillsWeight;
  }

  // 2. Interests/Tags Match (25% weight)
  const interestsWeight = 25;
  const userInterests = (user.interests || []).map(i => i.toLowerCase().trim());
  const postTags = (post.tags || []).map(t => t.toLowerCase().trim());
  
  if (postTags.length > 0 && userInterests.length > 0) {
    const matchedInterests = userInterests.filter(interest =>
      postTags.some(tag => 
        tag.includes(interest) || interest.includes(tag) ||
        levenshteinSimilarity(interest, tag) > 0.7
      )
    );
    const interestScore = Math.min(100, (matchedInterests.length / postTags.length) * 100);
    totalScore += interestScore * interestsWeight;
    totalWeight += interestsWeight;
  }

  // 3. Profile Completeness Bonus (15% weight)
  const profileWeight = 15;
  let profileScore = 0;
  if (user.resumeUrl) profileScore += 40;
  if (user.bio && user.bio.length > 50) profileScore += 20;
  if (user.university) profileScore += 20;
  if (userSkills.length >= 3) profileScore += 20;
  totalScore += profileScore * profileWeight;
  totalWeight += profileWeight;

  // Calculate final percentage
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  
  // Return score with breakdown
  return {
    score: Math.min(100, Math.max(0, finalScore)),
    breakdown: {
      skills: requiredSkills.length > 0 ? {
        matched: userSkills.filter(skill => 
          requiredSkills.some(req => 
            req.includes(skill) || skill.includes(req) ||
            levenshteinSimilarity(skill, req) > 0.8
          )
        ).length,
        required: requiredSkills.length
      } : null,
      hasResume: !!user.resumeUrl,
      hasProfile: !!(user.bio && user.university)
    }
  };
};

// Simple Levenshtein distance similarity (0-1 scale)
const levenshteinSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0;
  
  const matrix = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - (distance / maxLen);
};

// Get match score label/color based on score
const getMatchLevel = (score) => {
  if (score >= 80) return { level: 'Excellent', color: 'emerald' };
  if (score >= 60) return { level: 'Good', color: 'blue' };
  if (score >= 40) return { level: 'Fair', color: 'amber' };
  return { level: 'Low', color: 'slate' };
};

module.exports = { calculateMatchScore, getMatchLevel };

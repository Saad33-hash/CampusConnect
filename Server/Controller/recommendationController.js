const recommendationService = require('../services/recommendationService');

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const { limit = 10, excludeApplied = 'true' } = req.query;

    const result = await recommendationService.getRecommendations(user, {
      limit: parseInt(limit),
      excludeApplied: excludeApplied === 'true'
    });

    res.json({
      success: true,
      recommendations: result.recommendations,
      totalCount: result.totalCount
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
};

// Get category-specific recommendations
exports.getCategoryRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const { category } = req.params;
    const { limit = 5 } = req.query;

    const validCategories = ['top-matches', 'trending', 'new', 'closing-soon'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const recommendations = await recommendationService.getCategoryRecommendations(
      user,
      category,
      parseInt(limit)
    );

    res.json({
      success: true,
      category,
      recommendations
    });
  } catch (error) {
    console.error('Get category recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category recommendations'
    });
  }
};

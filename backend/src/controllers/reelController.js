const { validationResult } = require('express-validator');
const prismaReelService = require('../services/prismaReelService');

const getReels = async (req, res) => {
  try {
    const reels = await prismaReelService.getFeed(req.user.id);
    return res.status(200).json({
      success: true,
      count: reels.length,
      data: { reels },
    });
  } catch (err) {
    console.error('getReels error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const toggleReelLike = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { reelId } = req.params;
    const result = await prismaReelService.toggleLike(reelId, req.user.id);

    return res.status(200).json({
      success: true,
      message: result.likedByMe ? 'Reel liked' : 'Reel unliked',
      data: result,
    });
  } catch (err) {
    console.error('toggleReelLike error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getReelComments = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { reelId } = req.params;
    const comments = await prismaReelService.getComments(reelId);

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: { comments },
    });
  } catch (err) {
    console.error('getReelComments error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addReelComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { reelId } = req.params;
    const { comment } = req.body;

    const result = await prismaReelService.addComment(reelId, req.user.id, comment.trim());

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      data: result,
    });
  } catch (err) {
    console.error('addReelComment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getReels,
  toggleReelLike,
  getReelComments,
  addReelComment,
};

const { validationResult } = require('express-validator');
const prismaReelService = require('../services/prismaReelService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getReels = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 5, maxLimit: 20 });
    const { rows, total } = await prismaReelService.getFeed(req.user.id, { skip, limit });

    return res.status(200).json({
      success: true,
      count: rows.length,
      pagination: buildPaginationMeta({ page, limit, total }),
      data: { reels: rows },
    });
  } catch (err) {
    if (err.code === 'P2021') {
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: buildPaginationMeta({ page: 1, limit: 5, total: 0 }),
        data: { reels: [] },
        message: 'Reels data is not initialized yet',
      });
    }
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
    if (err.code === 'P2021') {
      return res.status(503).json({ success: false, message: 'Reels feature is not initialized yet' });
    }
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
    if (err.code === 'P2021') {
      return res.status(200).json({ success: true, count: 0, data: { comments: [] } });
    }
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
    if (err.code === 'P2021') {
      return res.status(503).json({ success: false, message: 'Reels feature is not initialized yet' });
    }
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

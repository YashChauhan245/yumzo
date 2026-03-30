const { validationResult } = require('express-validator');
const groupOrderService = require('../services/groupOrderService');

const createRoom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const room = await groupOrderService.createRoom({
      hostUser: req.user,
      restaurantId: req.body.restaurant_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Group order room created',
      data: { room },
    });
  } catch (error) {
    if (error.message === 'Restaurant not found') {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error('createRoom error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const room = await groupOrderService.joinRoom(req.params.roomCode, req.user);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: { room },
    });
  } catch (error) {
    console.error('joinRoom error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await groupOrderService.getRoom(req.params.roomCode, req.user);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({ success: true, data: { room } });
  } catch (error) {
    console.error('getRoom error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await groupOrderService.addItem({
      code: req.params.roomCode,
      user: req.user,
      menuItemId: req.body.menu_item_id,
      quantity: req.body.quantity,
    });

    if (result.error) {
      const status = result.error.includes('not found') ? 404 : 400;
      return res.status(status).json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Item added to group room',
      data: { room: result.room },
    });
  } catch (error) {
    console.error('group addItem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await groupOrderService.updateItem({
      code: req.params.roomCode,
      itemId: req.params.itemId,
      user: req.user,
      quantity: req.body.quantity,
    });

    if (result.error) {
      const status = result.error.includes('not found') ? 404 : 403;
      return res.status(status).json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Room item updated',
      data: { room: result.room },
    });
  } catch (error) {
    console.error('updateItem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeItem = async (req, res) => {
  try {
    const result = await groupOrderService.removeItem({
      code: req.params.roomCode,
      itemId: req.params.itemId,
      user: req.user,
    });

    if (result.error) {
      const status = result.error.includes('not found') ? 404 : 403;
      return res.status(status).json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Room item removed',
      data: { room: result.room },
    });
  } catch (error) {
    console.error('removeItem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const checkoutRoom = async (req, res) => {
  try {
    const result = await groupOrderService.checkoutToHostCart({
      code: req.params.roomCode,
      user: req.user,
    });

    if (result.error) {
      const status = result.error.includes('not found') ? 404 : 403;
      return res.status(status).json({ success: false, message: result.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Room synced to host cart. Proceed to checkout.',
      data: {
        room: result.room,
        synced_items: result.synced_items,
      },
    });
  } catch (error) {
    console.error('checkoutRoom error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  addItem,
  updateItem,
  removeItem,
  checkoutRoom,
};

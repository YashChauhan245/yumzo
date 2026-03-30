let ioInstance = null;

const setSocketServer = (io) => {
  ioInstance = io;
};

const getSocketServer = () => ioInstance;

const emitOrderUpdate = (orderPayload) => {
  if (!ioInstance) return;
  ioInstance.emit('order:created', orderPayload);
};

const emitOrderStatusUpdate = (orderPayload) => {
  if (!ioInstance) return;
  ioInstance.emit('order:status', orderPayload);
};

const emitOrderLocationUpdate = (orderId, locationPayload) => {
  if (!ioInstance || !orderId) return;
  ioInstance.to(`order:${orderId}`).emit('order:location', locationPayload);
};

module.exports = {
  setSocketServer,
  getSocketServer,
  emitOrderUpdate,
  emitOrderStatusUpdate,
  emitOrderLocationUpdate,
};

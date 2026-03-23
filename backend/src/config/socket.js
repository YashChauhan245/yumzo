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

module.exports = {
  setSocketServer,
  getSocketServer,
  emitOrderUpdate,
  emitOrderStatusUpdate,
};

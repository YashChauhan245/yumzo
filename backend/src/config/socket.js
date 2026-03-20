let ioInstance = null;

const setSocketServer = (io) => {
  ioInstance = io;
};

const getSocketServer = () => ioInstance;

const emitOrderUpdate = (orderPayload) => {
  if (!ioInstance) return;
  ioInstance.emit('order:created', orderPayload);
};

module.exports = {
  setSocketServer,
  getSocketServer,
  emitOrderUpdate,
};

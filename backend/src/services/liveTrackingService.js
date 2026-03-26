const latestOrderLocations = new Map();

const setOrderLocation = ({
  orderId,
  driverId,
  latitude,
  longitude,
  accuracy = null,
  heading = null,
  speed = null,
}) => {
  const payload = {
    order_id: orderId,
    driver_id: driverId,
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    updated_at: new Date().toISOString(),
  };

  latestOrderLocations.set(orderId, payload);
  return payload;
};

const getOrderLocation = (orderId) => latestOrderLocations.get(orderId) || null;

const clearOrderLocation = (orderId) => {
  latestOrderLocations.delete(orderId);
};

module.exports = {
  setOrderLocation,
  getOrderLocation,
  clearOrderLocation,
};

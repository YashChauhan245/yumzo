const formatAddressText = (address) => {
  const chunks = [address.line1, address.line2, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  return chunks.join(', ');
};

module.exports = {
  formatAddressText,
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getPagination = (query, { defaultLimit = 10, maxLimit = 50 } = {}) => {
  const page = parsePositiveInt(query?.page, 1);
  const limit = Math.min(parsePositiveInt(query?.limit, defaultLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPagination,
  buildPaginationMeta,
};

// Custom request sanitizer to prevent NoSQL query injection & script tags
function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key of Object.keys(obj)) {
    // Prevent NoSQL operators like $gt, $where, $regex injection in user fields
    if (key.startsWith('$')) {
      delete obj[key];
      continue;
    }

    if (typeof obj[key] === 'string') {
      // Strip potential script injections while preserving normal punctuation
      obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanObject(obj[key]);
    }
  }
  return obj;
}

const sanitizeInput = (req, res, next) => {
  if (req.body) cleanObject(req.body);
  if (req.query) cleanObject(req.query);
  if (req.params) cleanObject(req.params);
  next();
};

module.exports = sanitizeInput;

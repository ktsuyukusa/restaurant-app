// Disabled in production
module.exports = async function handler(_req, res) {
  return res.status(410).json({ error: 'Gone' });
}
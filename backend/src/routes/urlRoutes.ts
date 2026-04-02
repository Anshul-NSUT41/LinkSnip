import { Router } from 'express';
import { body } from 'express-validator';
import {
  shortenUrl,
  getUserLinks,
  deleteUrl,
  updateUrl,
  getUrlAnalytics,
  bulkShortenUrls,
  exportAnalytics,
} from '../controllers/urlController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// POST /api/url/shorten - Create short URL (works for both guests and auth users)
router.post(
  '/shorten',
  optionalAuth,
  validate([
    body('originalUrl')
      .trim()
      .notEmpty()
      .withMessage('URL is required')
      .isURL({ require_protocol: true })
      .withMessage('Please enter a valid URL with http:// or https://'),
  ]),
  shortenUrl
);

// POST /api/url/bulk-shorten - Bulk shorten URLs (optional auth)
router.post(
  '/bulk-shorten',
  optionalAuth,
  validate([
    body('urls')
      .isArray({ min: 1, max: 50 })
      .withMessage('Provide 1-50 URLs'),
  ]),
  bulkShortenUrls
);

// GET /api/url/user-links - Get authenticated user's links
router.get('/user-links', authenticate, getUserLinks);

// GET /api/url/analytics/:id - Get URL analytics
router.get('/analytics/:id', authenticate, getUrlAnalytics);

// GET /api/url/export/:id - Export analytics as CSV
router.get('/export/:id', authenticate, exportAnalytics);

// PUT /api/url/:id - Update a URL
router.put('/:id', authenticate, updateUrl);

// DELETE /api/url/:id - Delete a URL
router.delete('/:id', authenticate, deleteUrl);

export default router;

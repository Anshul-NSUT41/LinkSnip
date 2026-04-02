import { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';
import QRCode from 'qrcode';
import mongoose from 'mongoose';
import Url from '../models/Url';
import { generateShortCode, validateAlias, isSpamUrl, isValidUrl } from '../services/urlService';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a shortened URL
 * POST /api/url/shorten
 */
export const shortenUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originalUrl, customAlias, password, expiresAt } = req.body;

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      res.status(400).json({ message: 'Please enter a valid URL (must start with http:// or https://)' });
      return;
    }

    // Check for spam URLs
    if (isSpamUrl(originalUrl)) {
      res.status(400).json({ message: 'This URL appears to be a shortened URL already. Please use the original URL.' });
      return;
    }

    let shortCode: string;

    // Handle custom alias
    if (customAlias) {
      const aliasValidation = validateAlias(customAlias);
      if (!aliasValidation.valid) {
        res.status(400).json({ message: aliasValidation.message });
        return;
      }

      // Check if alias is already taken
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        res.status(409).json({ message: 'This alias is already taken. Please choose another.' });
        return;
      }

      shortCode = customAlias;
    } else {
      shortCode = await generateShortCode();
    }

    // Create URL document
    const url = new Url({
      originalUrl,
      shortCode,
      customAlias: customAlias || undefined,
      userId: req.user?._id || undefined,
      password: password || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await url.save();

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.status(201).json({
      message: 'URL shortened successfully',
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl,
        qrCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        hasPassword: !!url.password,
      },
    });
  } catch (error) {
    console.error('Shorten URL error:', error);
    res.status(500).json({ message: 'Failed to shorten URL' });
  }
};

/**
 * Redirect to original URL
 * GET /:shortCode
 */
export const redirectUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      res.status(404).json({ message: 'Short URL not found or has been deactivated' });
      return;
    }

    // Check expiration
    if (url.expiresAt && new Date() > url.expiresAt) {
      res.status(410).json({ message: 'This short URL has expired' });
      return;
    }

    // Check password protection
    if (url.password) {
      const providedPassword = req.query.password as string || req.headers['x-link-password'] as string;
      if (!providedPassword || providedPassword !== url.password) {
        res.status(403).json({
          message: 'This link is password protected',
          requiresPassword: true,
        });
        return;
      }
    }

    // Track visit
    const parser = new UAParser(req.headers['user-agent'] as string);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    url.clickCount += 1;
    url.lastVisitedAt = new Date();
    url.visitHistory.push({
      timestamp: new Date(),
      ip: (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', ''),
      userAgent: (req.headers['user-agent'] as string) || 'unknown',
      browser: browserInfo.name || 'unknown',
      os: osInfo.name || 'unknown',
      device: deviceInfo.type || 'desktop',
      referrer: (req.headers.referer || req.headers.referrer || 'direct') as string,
    });

    await url.save();

    // Redirect to original URL
    res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Redirect failed' });
  }
};

/**
 * Get all URLs for authenticated user
 * GET /api/url/user-links
 */
export const getUserLinks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    // Build query
    const query: any = { userId };

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort(sort as string)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-visitHistory -password');

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    const formattedUrls = urls.map((url) => ({
      id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      customAlias: url.customAlias,
      clickCount: url.clickCount,
      isActive: url.isActive,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      lastVisitedAt: url.lastVisitedAt,
      isExpired: url.expiresAt ? new Date() > url.expiresAt : false,
    }));

    res.json({
      urls: formattedUrls,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get user links error:', error);
    res.status(500).json({ message: 'Failed to fetch links' });
  }
};

/**
 * Delete a URL
 * DELETE /api/url/:id
 */
export const deleteUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      res.status(404).json({ message: 'URL not found' });
      return;
    }

    await Url.deleteOne({ _id: id });

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Failed to delete URL' });
  }
};

/**
 * Update a URL (alias, expiration, active status)
 * PUT /api/url/:id
 */
export const updateUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { customAlias, expiresAt, isActive, password } = req.body;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      res.status(404).json({ message: 'URL not found' });
      return;
    }

    // Update custom alias
    if (customAlias !== undefined) {
      if (customAlias) {
        const aliasValidation = validateAlias(customAlias);
        if (!aliasValidation.valid) {
          res.status(400).json({ message: aliasValidation.message });
          return;
        }

        // Check if alias is taken by another URL
        const existing = await Url.findOne({
          shortCode: customAlias,
          _id: { $ne: new mongoose.Types.ObjectId(id as string) },
        });
        if (existing) {
          res.status(409).json({ message: 'This alias is already taken' });
          return;
        }

        url.shortCode = customAlias;
        url.customAlias = customAlias;
      }
    }

    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    }

    if (isActive !== undefined) {
      url.isActive = isActive;
    }

    if (password !== undefined) {
      url.password = password || undefined;
    }

    await url.save();

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    res.json({
      message: 'URL updated successfully',
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${baseUrl}/${url.shortCode}`,
        customAlias: url.customAlias,
        clickCount: url.clickCount,
        isActive: url.isActive,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
      },
    });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ message: 'Failed to update URL' });
  }
};

/**
 * Get analytics for a specific URL
 * GET /api/url/analytics/:id
 */
export const getUrlAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      res.status(404).json({ message: 'URL not found' });
      return;
    }

    // Calculate analytics from visit history
    const visitHistory = url.visitHistory || [];

    // Browser stats
    const browserStats: Record<string, number> = {};
    const osStats: Record<string, number> = {};
    const deviceStats: Record<string, number> = {};
    const referrerStats: Record<string, number> = {};

    // Click trends (last 30 days)
    const clickTrends: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      clickTrends[dateStr] = 0;
    }

    visitHistory.forEach((visit) => {
      // Browser stats
      const browser = visit.browser || 'unknown';
      browserStats[browser] = (browserStats[browser] || 0) + 1;

      // OS stats
      const os = visit.os || 'unknown';
      osStats[os] = (osStats[os] || 0) + 1;

      // Device stats
      const device = visit.device || 'desktop';
      deviceStats[device] = (deviceStats[device] || 0) + 1;

      // Referrer stats
      const referrer = visit.referrer || 'direct';
      referrerStats[referrer] = (referrerStats[referrer] || 0) + 1;

      // Click trends
      const visitDate = new Date(visit.timestamp);
      if (visitDate >= thirtyDaysAgo) {
        const dateStr = visitDate.toISOString().split('T')[0];
        if (clickTrends[dateStr] !== undefined) {
          clickTrends[dateStr]++;
        }
      }
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    // Generate QR code
    const shortUrl = `${baseUrl}/${url.shortCode}`;
    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
    });

    res.json({
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl,
        qrCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        lastVisitedAt: url.lastVisitedAt,
        isActive: url.isActive,
      },
      analytics: {
        totalClicks: url.clickCount,
        clickTrends: Object.entries(clickTrends).map(([date, count]) => ({
          date,
          clicks: count,
        })),
        browsers: Object.entries(browserStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        operatingSystems: Object.entries(osStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        devices: Object.entries(deviceStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        referrers: Object.entries(referrerStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

/**
 * Bulk shorten URLs
 * POST /api/url/bulk-shorten
 */
export const bulkShortenUrls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({ message: 'Please provide an array of URLs' });
      return;
    }

    if (urls.length > 50) {
      res.status(400).json({ message: 'Maximum 50 URLs can be shortened at once' });
      return;
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const results = [];

    for (const originalUrl of urls) {
      if (!isValidUrl(originalUrl)) {
        results.push({ originalUrl, error: 'Invalid URL format' });
        continue;
      }

      const shortCode = await generateShortCode();
      const url = new Url({
        originalUrl,
        shortCode,
        userId: req.user?._id || undefined,
      });

      await url.save();

      results.push({
        originalUrl,
        shortCode,
        shortUrl: `${baseUrl}/${shortCode}`,
      });
    }

    res.status(201).json({
      message: `${results.filter((r) => !('error' in r)).length} URLs shortened successfully`,
      results,
    });
  } catch (error) {
    console.error('Bulk shorten error:', error);
    res.status(500).json({ message: 'Failed to bulk shorten URLs' });
  }
};

/**
 * Export analytics as CSV
 * GET /api/url/export/:id
 */
export const exportAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      res.status(404).json({ message: 'URL not found' });
      return;
    }

    // Build CSV
    const headers = 'Timestamp,Browser,OS,Device,Referrer\n';
    const rows = url.visitHistory
      .map((v) =>
        [
          new Date(v.timestamp).toISOString(),
          v.browser || 'unknown',
          v.os || 'unknown',
          v.device || 'desktop',
          v.referrer || 'direct',
        ].join(',')
      )
      .join('\n');

    const csv = headers + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${url.shortCode}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Failed to export analytics' });
  }
};

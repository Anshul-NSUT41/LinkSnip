import { nanoid } from 'nanoid';
import Url from '../models/Url';

// List of blocked/reserved keywords to avoid collision with routes
const RESERVED_CODES = new Set([
  'api', 'admin', 'login', 'register', 'dashboard',
  'analytics', 'settings', 'profile', 'health', 'docs',
]);

// Simple spam URL pattern detection
const SPAM_PATTERNS = [
  /bit\.ly/i,
  /tinyurl/i,
  /t\.co/i,
  // Add more patterns as needed
];

/**
 * Generate a unique short code (6-8 characters)
 * Retries up to 10 times to avoid collisions
 */
export const generateShortCode = async (length: number = 7): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = nanoid(length);

    // Skip reserved keywords
    if (RESERVED_CODES.has(code.toLowerCase())) {
      attempts++;
      continue;
    }

    // Check for collision in database
    const existing = await Url.findOne({ shortCode: code });
    if (!existing) {
      return code;
    }

    attempts++;
  }

  // Fallback: use longer code to reduce collision chance
  return nanoid(12);
};

/**
 * Validate a custom alias
 */
export const validateAlias = (alias: string): { valid: boolean; message?: string } => {
  if (alias.length < 3) {
    return { valid: false, message: 'Alias must be at least 3 characters' };
  }

  if (alias.length > 30) {
    return { valid: false, message: 'Alias must be at most 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
    return { valid: false, message: 'Alias can only contain letters, numbers, hyphens and underscores' };
  }

  if (RESERVED_CODES.has(alias.toLowerCase())) {
    return { valid: false, message: 'This alias is reserved' };
  }

  return { valid: true };
};

/**
 * Check if URL might be spam
 */
export const isSpamUrl = (url: string): boolean => {
  return SPAM_PATTERNS.some((pattern) => pattern.test(url));
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

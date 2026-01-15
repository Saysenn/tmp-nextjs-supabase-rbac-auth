/**
 * Validation utilities for user inputs
 * Provides secure validation for authentication and user data
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Validates password strength and requirements
 * @param password - The password to validate
 * @returns Validation result with errors and strength rating
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum length (prevent DOS attacks)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  // Calculate strength
  const hasLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteriaMetCount = [hasLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (criteriaMetCount >= 4 && password.length >= 12) {
    strength = 'strong';
  } else if (criteriaMetCount >= 3 && password.length >= 8) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validates email format
 * @param email - The email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Basic validation
  if (!emailRegex.test(email)) {
    return false;
  }

  // Length validation
  if (email.length > 254) {
    return false;
  }

  // Check for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Sanitizes user input by removing dangerous characters
 * @param input - The input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param input - The input to sanitize
 * @returns HTML-safe string
 */
export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validates that a string contains only alphanumeric characters and common punctuation
 * @param input - The input to validate
 * @returns True if valid, false otherwise
 */
export function isAlphanumericWithPunctuation(input: string): boolean {
  return /^[a-zA-Z0-9\s\-_.,!?'"]+$/.test(input);
}

/**
 * Validates full name format
 * @param name - The name to validate
 * @returns Object with isValid and error message
 */
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return { isValid: false, error: 'Name is required' };
  }

  if (sanitized.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (sanitized.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and dots (for international names)
  if (!/^[a-zA-ZÀ-ÿ\s\-'.]+$/.test(sanitized)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Rate limiting helper - checks if too many attempts have been made
 * @param key - Unique identifier for the action (e.g., email address)
 * @param attempts - Number of attempts made
 * @param maxAttempts - Maximum allowed attempts
 * @param timeWindow - Time window in milliseconds
 * @returns True if rate limit exceeded
 */
export function isRateLimitExceeded(
  key: string,
  attempts: number,
  maxAttempts: number = 5,
  timeWindow: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  return attempts >= maxAttempts;
}

/**
 * Generates a secure random token (not cryptographically secure, use server-side crypto for sensitive operations)
 * @param length - Length of the token
 * @returns Random token string
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

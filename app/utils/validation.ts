export const validation = {
  email: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  password: (password: string): { valid: boolean; strength: "weak" | "medium" | "strong" } => {
    if (password.length < 6) return { valid: false, strength: "weak" };
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;
    if (score >= 3) return { valid: true, strength: "strong" };
    if (score >= 2) return { valid: true, strength: "medium" };
    return { valid: true, strength: "weak" };
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  match: (value: string, other: string): boolean => {
    return value === other;
  },

  url: (url: string): boolean => {
    // Safety: Never throw during validation
    // Return false for invalid or empty URLs
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return false;
    }
    try {
      // Only validate URLs if we can safely construct them
      const testUrl = new URL(url, 'http://localhost');
      return testUrl.protocol === 'http:' || testUrl.protocol === 'https:';
    } catch (error) {
      // Log silently and return false - never throw
      return false;
    }
  },
};

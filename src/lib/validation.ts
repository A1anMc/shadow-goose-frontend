import { z } from 'zod';
import { logger } from './logger';

// Base validation schemas
export const BaseSchema = z.object({
  id: z.number().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Grant validation schemas
export const GrantSchema = BaseSchema.extend({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000000, 'Amount is too large'),
  
  deadline: z.string()
    .datetime('Invalid deadline format')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Deadline must be in the future'
    }),
  
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
  
  status: z.enum(['open', 'closing_soon', 'closing_today', 'closed', 'expired'])
    .default('open'),
  
  organization: z.string()
    .min(1, 'Organization is required')
    .max(200, 'Organization must be less than 200 characters'),
  
  eligibility: z.string()
    .max(1000, 'Eligibility must be less than 1000 characters')
    .optional(),
  
  requirements: z.string()
    .max(2000, 'Requirements must be less than 2000 characters')
    .optional(),
});

// Grant application validation schemas
export const GrantApplicationSchema = BaseSchema.extend({
  grant_id: z.number().positive('Valid grant ID is required'),
  
  title: z.string()
    .min(1, 'Application title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  
  budget: z.number()
    .positive('Budget must be positive')
    .max(1000000000, 'Budget is too large'),
  
  timeline: z.string()
    .min(1, 'Timeline is required')
    .max(500, 'Timeline must be less than 500 characters'),
  
  status: z.enum(['draft', 'in_progress', 'submitted', 'approved', 'rejected'])
    .default('draft'),
  
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .default('medium'),
});

// User input validation schemas
export const UserInputSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  role: z.enum(['admin', 'manager', 'user'])
    .default('user'),
});

// Login credentials validation
export const LoginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
  
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

// Search filters validation
export const SearchFiltersSchema = z.object({
  category: z.string().optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
  status: z.enum(['open', 'closing_soon', 'closing_today', 'closed', 'expired']).optional(),
  organization: z.string().optional(),
  keyword: z.string().max(100, 'Keyword must be less than 100 characters').optional(),
});

// Analytics query validation
export const AnalyticsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  category: z.string().optional(),
  organization: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

// Validation helper functions
export class ValidationService {
  // Validate data against a schema
  static validate<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: string[] } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
         } catch (error) {
       if (error instanceof z.ZodError) {
         const zodError = error as z.ZodError;
         const errors = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
         logger.warn('Validation failed', {
           errors,
           data: JSON.stringify(data)
         });
         return { success: false, errors };
       }
      
      logger.error('Validation error', error);
      return { success: false, errors: ['Validation failed'] };
    }
  }

  // Sanitize input data
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  // Validate and sanitize user input
  static validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: string[] } {
    // First sanitize string inputs
    const sanitizedData = this.sanitizeObject(data);
    
    // Then validate
    return this.validate(schema, sanitizedData);
  }

  // Recursively sanitize object properties
  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeInput(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  // Check if data is safe for database operations
  static isSafeForDatabase(data: any): boolean {
    const jsonString = JSON.stringify(data);
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(exec|execute|xp_|sp_)\b)/i,
    ];
    
    return !sqlPatterns.some(pattern => pattern.test(jsonString));
  }

  // Validate file upload
  static validateFileUpload(file: File): { success: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    // Check filename
    const filename = file.name.toLowerCase();
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Invalid filename');
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true };
  }
}

// Export commonly used validation functions
export const validateGrant = (data: any) => ValidationService.validate(GrantSchema, data);
export const validateGrantApplication = (data: any) => ValidationService.validate(GrantApplicationSchema, data);
export const validateUserInput = (data: any) => ValidationService.validate(UserInputSchema, data);
export const validateLogin = (data: any) => ValidationService.validate(LoginSchema, data);
export const validateSearchFilters = (data: any) => ValidationService.validate(SearchFiltersSchema, data);
export const validateAnalyticsQuery = (data: any) => ValidationService.validate(AnalyticsQuerySchema, data);

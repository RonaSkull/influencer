/**
 * Environment Validation & Configuration
 * 
 * Valida todas as variáveis de ambiente necessárias
 * Fornece fallbacks seguros e warnings informativos
 */

export interface EnvConfig {
  // LLM Providers
  GROQ_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  
  // Image Generation
  LEONARDO_API_KEY?: string;
  STABILITY_API_KEY?: string;
  REPLICATE_API_KEY?: string;
  
  // Video Generation
  RUNML_API_KEY?: string;
  PIKA_API_KEY?: string;
  HEYGEN_API_KEY?: string;
  
  // Text-to-Speech
  ELEVENLABS_API_KEY?: string;
  PLAYHT_API_KEY?: string;
  
  // Database
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_KEY?: string;
  
  // Payments
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID_PRO?: string;
  STRIPE_PRICE_ID_AGENCY?: string;
  
  // Social Media
  INSTAGRAM_ACCESS_TOKEN?: string;
  TIKTOK_ACCESS_TOKEN?: string;
  META_APP_ID?: string;
  META_APP_SECRET?: string;
  
  // WhatsApp
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_WHATSAPP_NUMBER?: string;
  
  // General
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL?: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
}

export class EnvValidator {
  private config: EnvConfig;
  private warnings: string[] = [];
  private errors: string[] = [];
  
  constructor() {
    this.config = {
      // LLM
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      
      // Images
      LEONARDO_API_KEY: process.env.LEONARDO_API_KEY,
      STABILITY_API_KEY: process.env.STABILITY_API_KEY,
      REPLICATE_API_KEY: process.env.REPLICATE_API_KEY,
      
      // Video
      RUNML_API_KEY: process.env.RUNML_API_KEY,
      PIKA_API_KEY: process.env.PIKA_API_KEY,
      HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
      
      // TTS
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      PLAYHT_API_KEY: process.env.PLAYHT_API_KEY,
      
      // Database
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      
      // Payments
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
      STRIPE_PRICE_ID_AGENCY: process.env.STRIPE_PRICE_ID_AGENCY,
      
      // Social
      INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
      TIKTOK_ACCESS_TOKEN: process.env.TIKTOK_ACCESS_TOKEN,
      META_APP_ID: process.env.META_APP_ID,
      META_APP_SECRET: process.env.META_APP_SECRET,
      
      // WhatsApp
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
      
      // General
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      APP_URL: process.env.APP_URL,
      LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info'
    };
    
    this.validate();
  }
  
  private validate(): void {
    // ==================== CRITICAL (Must Have) ====================
    
    if (!this.config.GROQ_API_KEY) {
      this.errors.push(
        '❌ GROQ_API_KEY missing - Required for script generation (free tier: 500k tokens/day)'
      );
    }
    
    if (!this.config.NODE_ENV) {
      this.errors.push('❌ NODE_ENV missing - Must be development, production, or test');
    }
    
    // ==================== IMPORTANT (Should Have) ====================
    
    if (!this.config.LEONARDO_API_KEY) {
      this.warnings.push(
        '⚠️ LEONARDO_API_KEY missing - Image generation will use placeholders (free tier: 150 images/day)'
      );
    }
    
    if (!this.config.ELEVENLABS_API_KEY && !this.config.PLAYHT_API_KEY) {
      this.warnings.push(
        '⚠️ No TTS provider configured - Audio generation will not work'
      );
    }
    
    // ==================== OPTIONAL (Nice to Have) ====================
    
    if (!this.config.SUPABASE_URL) {
      this.warnings.push(
        '💭 SUPABASE_URL missing - Database features disabled (user auth, analytics, persistence)'
      );
    }
    
    if (!this.config.STRIPE_SECRET_KEY) {
      this.warnings.push(
        '💭 STRIPE_SECRET_KEY missing - Payment processing disabled'
      );
    }
    
    if (!this.config.INSTAGRAM_ACCESS_TOKEN) {
      this.warnings.push(
        '💭 INSTAGRAM_ACCESS_TOKEN missing - Auto-posting to Instagram disabled'
      );
    }
    
    if (!this.config.TWILIO_ACCOUNT_SID) {
      this.warnings.push(
        '💭 Twilio credentials missing - WhatsApp automation disabled'
      );
    }
  }
  
  /**
   * Get validation result
   */
  validateAndGetReport(): { valid: boolean; warnings: string[]; errors: string[] } {
    return {
      valid: this.errors.length === 0,
      warnings: this.warnings,
      errors: this.errors
    };
  }
  
  /**
   * Print validation report to console
   */
  printReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ENVIRONMENT VALIDATION REPORT');
    console.log('='.repeat(60) + '\n');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All environment variables configured correctly!\n');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log('🚨 ERRORS (Must fix before running):\n');
      this.errors.forEach(err => console.log(`  ${err}`));
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS (Features will be limited):\n');
      this.warnings.forEach(warn => console.log(`  ${warn}`));
      console.log('');
    }
    
    console.log('='.repeat(60) + '\n');
    
    if (this.errors.length > 0) {
      console.log('❌ Cannot start application with missing required variables.\n');
      console.log('Create a .env file with:\n');
      console.log('  GROQ_API_KEY=your_key_here\n');
      console.log('Get your free Groq API key at: https://console.groq.com\n');
      console.log('');
      process.exit(1);
    }
  }
  
  /**
   * Get configuration safely
   */
  getConfig(): EnvConfig {
    return { ...this.config };
  }
  
  /**
   * Check if specific feature is available
   */
  hasFeature(feature: 'llm' | 'image' | 'video' | 'tts' | 'database' | 'payments' | 'social'): boolean {
    switch (feature) {
      case 'llm':
        return !!this.config.GROQ_API_KEY || !!this.config.OPENAI_API_KEY;
      case 'image':
        return !!this.config.LEONARDO_API_KEY || !!this.config.STABILITY_API_KEY;
      case 'video':
        return !!this.config.RUNML_API_KEY || !!this.config.PIKA_API_KEY || !!this.config.HEYGEN_API_KEY;
      case 'tts':
        return !!this.config.ELEVENLABS_API_KEY || !!this.config.PLAYHT_API_KEY;
      case 'database':
        return !!this.config.SUPABASE_URL && !!this.config.SUPABASE_ANON_KEY;
      case 'payments':
        return !!this.config.STRIPE_SECRET_KEY;
      case 'social':
        return !!this.config.INSTAGRAM_ACCESS_TOKEN;
      default:
        return false;
    }
  }
}

// Create and export singleton
const validator = new EnvValidator();

// Auto-validate on import in development mode
if (validator.getConfig().NODE_ENV === 'development') {
  validator.printReport();
}

export const env = validator.getConfig();
export const envValidator = validator;
export default env;

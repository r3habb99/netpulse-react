/**
 * Ad Service
 * Manages rewarded video ads and ad network integration
 */

import { logInfo } from '../utils';

export interface AdConfig {
  provider: 'google' | 'unity' | 'admob' | 'mock';
  testMode: boolean;
  adUnitId?: string;
  rewardAmount: number;
  cooldownPeriod: number; // minutes between ads
}

export interface AdRewardResult {
  success: boolean;
  creditsAwarded: number;
  message: string;
  nextAdAvailable?: number;
}

export class AdService {
  private static instance: AdService;
  private config: AdConfig;
  private isInitialized = false;
  private lastAdWatched = 0;

  private constructor(config: AdConfig) {
    const defaultConfig = {
      provider: 'mock' as const, // Default to mock for development
      testMode: process.env.NODE_ENV === 'development',
      rewardAmount: 1,
      cooldownPeriod: process.env.NODE_ENV === 'development' ? 0.1 : 5, // 6 seconds for dev, 5 minutes for prod
    };

    this.config = {
      ...defaultConfig,
      ...config
    };
  }

  public static getInstance(config?: AdConfig): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService(config || {
        provider: 'mock',
        testMode: process.env.NODE_ENV === 'development',
        rewardAmount: 1,
        cooldownPeriod: process.env.NODE_ENV === 'development' ? 0.1 : 5
      });
    }
    return AdService.instance;
  }

  /**
   * Initialize ad service
   */
  public async initialize(): Promise<boolean> {
    try {
      logInfo(`Initializing ad service with provider: ${this.config.provider}`, 'AdService');

      switch (this.config.provider) {
        case 'google':
          return await this.initializeGoogleAds();
        case 'unity':
          return await this.initializeUnityAds();
        case 'admob':
          return await this.initializeAdMob();
        case 'mock':
        default:
          return await this.initializeMockAds();
      }
    } catch (error) {
      console.error('Failed to initialize ad service:', error);
      return false;
    }
  }

  /**
   * Initialize Google Ads (AdSense)
   */
  private async initializeGoogleAds(): Promise<boolean> {
    try {
      // Load Google AdSense script
      if (!(window as any).adsbygoogle) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      this.isInitialized = true;
      logInfo('Google Ads initialized successfully', 'AdService');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Ads:', error);
      return false;
    }
  }

  /**
   * Initialize Unity Ads
   */
  private async initializeUnityAds(): Promise<boolean> {
    try {
      // Unity Ads initialization would go here
      // This is a placeholder for actual Unity Ads SDK integration
      console.warn('Unity Ads not implemented yet, falling back to mock');
      return await this.initializeMockAds();
    } catch (error) {
      console.error('Failed to initialize Unity Ads:', error);
      return false;
    }
  }

  /**
   * Initialize AdMob (for mobile apps)
   */
  private async initializeAdMob(): Promise<boolean> {
    try {
      // AdMob initialization would go here
      // This is a placeholder for actual AdMob SDK integration
      console.warn('AdMob not implemented yet, falling back to mock');
      return await this.initializeMockAds();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      return false;
    }
  }

  /**
   * Initialize mock ads for development/testing
   */
  private async initializeMockAds(): Promise<boolean> {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.isInitialized = true;
    logInfo('Mock ads initialized successfully', 'AdService');
    return true;
  }

  /**
   * Check if ads are available
   */
  public isAdAvailable(): boolean {
    if (!this.isInitialized) {
      return false;
    }

    // Check cooldown period
    const now = Date.now();
    const cooldownMs = this.config.cooldownPeriod * 60 * 1000;
    
    return (now - this.lastAdWatched) >= cooldownMs;
  }

  /**
   * Get time until next ad is available
   */
  public getNextAdAvailableTime(): number {
    const now = Date.now();
    const cooldownMs = this.config.cooldownPeriod * 60 * 1000;
    const nextAvailable = this.lastAdWatched + cooldownMs;
    
    return Math.max(0, nextAvailable - now);
  }

  /**
   * Show rewarded video ad
   */
  public async showRewardedAd(): Promise<AdRewardResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        creditsAwarded: 0,
        message: 'Ad service not initialized'
      };
    }

    if (!this.isAdAvailable()) {
      const nextAvailable = this.getNextAdAvailableTime();
      const minutesLeft = Math.ceil(nextAvailable / (60 * 1000));
      
      return {
        success: false,
        creditsAwarded: 0,
        message: `Please wait ${minutesLeft} minutes before watching another ad`,
        nextAdAvailable: nextAvailable
      };
    }

    try {
      logInfo('Showing rewarded ad', 'AdService');

      switch (this.config.provider) {
        case 'google':
          return await this.showGoogleRewardedAd();
        case 'unity':
          return await this.showUnityRewardedAd();
        case 'admob':
          return await this.showAdMobRewardedAd();
        case 'mock':
        default:
          return await this.showMockRewardedAd();
      }
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return {
        success: false,
        creditsAwarded: 0,
        message: 'Failed to load ad. Please try again later.'
      };
    }
  }

  /**
   * Show Google rewarded ad
   */
  private async showGoogleRewardedAd(): Promise<AdRewardResult> {
    // Placeholder for Google Ads implementation
    // In a real implementation, you would use Google's rewarded ad API
    console.warn('Google rewarded ads not fully implemented, using mock');
    return await this.showMockRewardedAd();
  }

  /**
   * Show Unity rewarded ad
   */
  private async showUnityRewardedAd(): Promise<AdRewardResult> {
    // Placeholder for Unity Ads implementation
    console.warn('Unity rewarded ads not implemented, using mock');
    return await this.showMockRewardedAd();
  }

  /**
   * Show AdMob rewarded ad
   */
  private async showAdMobRewardedAd(): Promise<AdRewardResult> {
    // Placeholder for AdMob implementation
    console.warn('AdMob rewarded ads not implemented, using mock');
    return await this.showMockRewardedAd();
  }

  /**
   * Show mock rewarded ad (for development/testing)
   */
  private async showMockRewardedAd(): Promise<AdRewardResult> {
    return new Promise((resolve) => {
      // Simulate ad loading and display
      const adModal = this.createMockAdModal();
      document.body.appendChild(adModal);

      // Simulate ad duration (3 seconds for faster testing)
      let countdown = 3;
      const countdownElement = adModal.querySelector('.ad-countdown') as HTMLElement;
      const skipButton = adModal.querySelector('.ad-skip-btn') as HTMLButtonElement;
      const rewardButton = adModal.querySelector('.ad-reward-btn') as HTMLButtonElement;

      const updateCountdown = () => {
        countdownElement.textContent = `${countdown}s`;
        countdown--;

        if (countdown < 0) {
          // Ad finished, enable reward button
          countdownElement.textContent = 'Ad Complete!';
          skipButton.style.display = 'none';
          rewardButton.style.display = 'block';
          rewardButton.disabled = false;
        } else {
          setTimeout(updateCountdown, 1000);
        }
      };

      updateCountdown();

      // Handle skip (no reward)
      skipButton.onclick = () => {
        document.body.removeChild(adModal);
        resolve({
          success: false,
          creditsAwarded: 0,
          message: 'Ad was skipped. No credits awarded.'
        });
      };

      // Handle reward claim
      rewardButton.onclick = () => {
        document.body.removeChild(adModal);
        this.lastAdWatched = Date.now();
        
        // Award credits (placeholder - implement premium service integration later)
        // premiumService.awardAdCredits(this.config.rewardAmount);
        
        resolve({
          success: true,
          creditsAwarded: this.config.rewardAmount,
          message: `Great! You earned ${this.config.rewardAmount} ad credit${this.config.rewardAmount > 1 ? 's' : ''}!`,
          nextAdAvailable: this.getNextAdAvailableTime()
        });
      };
    });
  }

  /**
   * Create mock ad modal for testing
   */
  private createMockAdModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'ad-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: fadeIn 0.3s ease-out;
    `;

    // Random mock ad content for variety
    const mockAds = [
      { emoji: '🎮', title: 'Epic Mobile Game', subtitle: 'Download now and get 1000 coins!' },
      { emoji: '🛒', title: 'Super Shopping App', subtitle: 'Save 50% on your first order!' },
      { emoji: '📱', title: 'Amazing Photo Editor', subtitle: 'Transform your photos like a pro!' },
      { emoji: '🎵', title: 'Music Streaming Plus', subtitle: 'Listen to millions of songs!' },
      { emoji: '🍕', title: 'Food Delivery Fast', subtitle: 'Order now and get free delivery!' }
    ];

    const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];

    modal.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .ad-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          animation: pulse 2s infinite;
        }
        .ad-countdown-circle {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 8px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div style="
        background: white;
        border-radius: 16px;
        padding: 0;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        position: relative;
      ">
        <div class="ad-content" style="
          padding: 24px;
          margin-bottom: 20px;
        ">
          <div style="font-size: 64px; margin-bottom: 12px;">${randomAd.emoji}</div>
          <h3 style="margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 700;">${randomAd.title}</h3>
          <p style="margin: 0; opacity: 0.9; font-size: 1rem;">${randomAd.subtitle}</p>
        </div>

        <div style="padding: 0 24px 24px;">
          <div style="margin-bottom: 20px;">
            <div class="ad-countdown-circle"></div>
            <div class="ad-countdown" style="font-weight: bold; color: #333; font-size: 1.1rem;">3s</div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 4px;">Watch to earn 1 credit 💰</div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="ad-skip-btn" style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.2s ease;
              flex: 1;
              max-width: 120px;
            " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
              Skip Ad
            </button>
            <button class="ad-reward-btn" style="
              background: #10b981;
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              display: none;
              transition: all 0.2s ease;
              flex: 1;
              max-width: 140px;
            " disabled onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
              🎉 Claim Reward
            </button>
          </div>
        </div>

        <div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.5);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        ">
          AD
        </div>
      </div>
    `;

    return modal;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AdConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logInfo('Ad service configuration updated', 'AdService');
  }

  /**
   * Get current configuration
   */
  public getConfig(): AdConfig {
    return { ...this.config };
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const adService = AdService.getInstance();

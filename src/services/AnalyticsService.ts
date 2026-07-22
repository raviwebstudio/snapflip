import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  constructor(analyticsRepo: AnalyticsRepository = new AnalyticsRepository()) {
    this.analyticsRepo = analyticsRepo;
  }

  async logEvent(albumId: string, eventType: 'view' | 'qr_open' | 'download' | 'share' | 'album_open' | 'unique_view' | 'page_view' | 'share_click' | 'download_click' | 'time_spent', visitorHash: string, metadata: any = {}): Promise<void> {
    await this.analyticsRepo.logEvent({
      album_id: albumId,
      event_type: eventType,
      visitor_hash: visitorHash,
      device: metadata.device,
      browser: metadata.browser,
      country: metadata.country,
      referrer: metadata.referrer
    });
  }

  async getAlbumStats(albumId: string): Promise<{ views: number; uniqueVisitors: number; downloads: number; shares: number }> {
    return this.analyticsRepo.getAlbumStats(albumId);
  }
}

import { supabase } from '../lib/supabase';

export interface AlbumAnalytics {
  id: string;
  album_id: string;
  event_type: 'view' | 'qr_open' | 'download' | 'share' | 'album_open' | 'unique_view' | 'page_view' | 'share_click' | 'download_click' | 'time_spent';
  visitor_hash: string;
  device?: string;
  browser?: string;
  country?: string;
  referrer?: string;
  created_at: string;
}

export class AnalyticsRepository {
  async logEvent(event: Partial<AlbumAnalytics>): Promise<AlbumAnalytics> {
    const { data, error } = await supabase
      .from('album_analytics')
      .insert({
        album_id: event.album_id,
        event_type: event.event_type,
        visitor_hash: event.visitor_hash,
        device: event.device,
        browser: event.browser,
        country: event.country,
        referrer: event.referrer,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging analytics event:', error);
      throw error;
    }

    return data;
  }

  async getAlbumStats(albumId: string): Promise<{ views: number; uniqueVisitors: number; downloads: number; shares: number }> {
    const { data, error } = await supabase
      .from('album_analytics')
      .select('event_type, visitor_hash')
      .eq('album_id', albumId);

    if (error) {
      console.error('Error fetching analytics stats:', error);
      throw error;
    }

    const stats = {
      views: 0,
      uniqueVisitors: 0,
      downloads: 0,
      shares: 0,
    };

    const uniqueVisitors = new Set<string>();

    (data || []).forEach((row: any) => {
      if (row.event_type === 'view') {
        stats.views++;
        uniqueVisitors.add(row.visitor_hash);
      } else if (row.event_type === 'download') {
        stats.downloads++;
      } else if (row.event_type === 'share') {
        stats.shares++;
      }
    });

    stats.uniqueVisitors = uniqueVisitors.size;

    return stats;
  }
}

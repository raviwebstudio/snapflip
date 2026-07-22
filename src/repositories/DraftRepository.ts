import { supabase } from '../lib/supabase';

export interface Draft {
  id: string;
  album_id: string;
  payload: any;
  created_at: string;
  updated_at: string;
}

export class DraftRepository {
  async findByAlbum(albumId: string): Promise<Draft | null> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('album_id', albumId)
      .maybeSingle();

    if (error) {
      console.error('Error finding draft by album:', error);
      throw error;
    }

    return data;
  }

  async save(albumId: string, payload: any): Promise<Draft> {
    // Check if draft already exists
    const existing = await this.findByAlbum(albumId);

    if (existing) {
      const { data, error } = await supabase
        .from('drafts')
        .update({
          payload,
          updated_at: new Date().toISOString()
        })
        .eq('album_id', albumId)
        .select()
        .single();

      if (error) {
        console.error('Error updating draft:', error);
        throw error;
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from('drafts')
        .insert({
          album_id: albumId,
          payload
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting draft:', error);
        throw error;
      }
      return data;
    }
  }

  async delete(albumId: string): Promise<boolean> {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('album_id', albumId);

    if (error) {
      console.error('Error deleting draft:', error);
      return false;
    }

    return true;
  }
}

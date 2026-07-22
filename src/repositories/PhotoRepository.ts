import { supabase } from '../lib/supabase';

export interface AlbumPhoto {
  id: string;
  album_id: string;
  storage_file_id: string;
  order_index: number;
  orientation: number;
  created_at: string;
  updated_at: string;
  // Joined from storage_files
  url?: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  provider_id?: string;
}

export class PhotoRepository {
  async findByAlbum(albumId: string): Promise<AlbumPhoto[]> {
    const { data, error } = await supabase
      .from('album_photos')
      .select(`
        id,
        album_id,
        storage_file_id,
        order_index,
        orientation,
        created_at,
        updated_at,
        storage_files (
          google_file_id,
          original_path,
          optimized_path,
          thumbnail_path
        )
      `)
      .eq('album_id', albumId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching photos by album:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      album_id: item.album_id,
      storage_file_id: item.storage_file_id,
      order_index: item.order_index,
      orientation: item.orientation,
      created_at: item.created_at,
      updated_at: item.updated_at,
      url: item.storage_files?.original_path,
      optimizedUrl: item.storage_files?.optimized_path,
      thumbnailUrl: item.storage_files?.thumbnail_path,
      provider_id: item.storage_files?.google_file_id,
    }));
  }

  async create(photo: Partial<AlbumPhoto>): Promise<AlbumPhoto> {
    const { data, error } = await supabase
      .from('album_photos')
      .insert({
        album_id: photo.album_id,
        storage_file_id: photo.storage_file_id,
        order_index: photo.order_index,
        orientation: photo.orientation,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating photo:', error);
      throw error;
    }

    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('album_photos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting photo:', error);
      return false;
    }

    return true;
  }

  async countByAlbum(albumId: string): Promise<number> {
    const { count, error } = await supabase
      .from('album_photos')
      .select('*', { count: 'exact', head: true })
      .eq('album_id', albumId);

    if (error) {
      console.error('Error counting photos:', error);
      throw error;
    }

    return count || 0;
  }

  async updateOrder(photoId: string, orderIndex: number): Promise<boolean> {
    const { error } = await supabase
      .from('album_photos')
      .update({ order_index: orderIndex })
      .eq('id', photoId);

    if (error) {
      console.error('Error updating photo order:', error);
      return false;
    }

    return true;
  }
}

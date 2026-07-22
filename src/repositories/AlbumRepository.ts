import { supabase } from '../lib/supabase';

export interface Album {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'shared' | 'archived';
  visibility: 'public' | 'password_protected';
  created_at: string;
  updated_at: string;
  published_at?: string;
  soft_delete_at?: string;
}

export class AlbumRepository {
  async findById(id: string): Promise<Album | null> {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', id)
      .is('soft_delete_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error finding album by id:', error);
      throw error;
    }

    return data;
  }

  async findBySlug(slug: string): Promise<Album | null> {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('slug', slug)
      .is('soft_delete_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error finding album by slug:', error);
      throw error;
    }

    return data;
  }

  async create(album: Partial<Album>): Promise<Album> {
    const { data, error } = await supabase
      .from('albums')
      .insert({
        user_id: album.user_id,
        title: album.title,
        slug: album.slug,
        status: album.status || 'draft',
        visibility: album.visibility || 'public',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating album:', error);
      throw error;
    }

    return data;
  }

  async update(id: string, data: Partial<Album>): Promise<Album> {
    const { data: updatedData, error } = await supabase
      .from('albums')
      .update({
        title: data.title,
        slug: data.slug,
        status: data.status,
        visibility: data.visibility,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating album:', error);
      throw error;
    }

    return updatedData;
  }

  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('albums')
      .update({ soft_delete_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error soft deleting album:', error);
      return false;
    }

    return true;
  }

  async restore(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('albums')
      .update({ soft_delete_at: null })
      .eq('id', id);

    if (error) {
      console.error('Error restoring album:', error);
      return false;
    }

    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error hard deleting album:', error);
      return false;
    }

    return true;
  }
}

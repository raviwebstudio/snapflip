import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
  updated_at: string;
  soft_delete_at?: string;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('soft_delete_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }

    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .is('soft_delete_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }

    return data;
  }

  async create(user: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        role: user.role || 'creator',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const { data: updatedData, error } = await supabase
      .from('users')
      .update({
        name: data.name,
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return updatedData;
  }

  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ soft_delete_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error soft deleting user:', error);
      return false;
    }

    return true;
  }
}

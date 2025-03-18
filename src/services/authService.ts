
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { Profile } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

export const fetchUserSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const fetchUserProfile = async (userId: string) => {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return profileData as Profile;
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { error };
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        is_premium: false,
      } as any);
    }

    toast({
      title: "Account created",
      description: "Please check your email for verification link.",
    });

    return { error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { error };
  }
};

export const signOutUser = async () => {
  return await supabase.auth.signOut();
};

export const updateUserProfile = async (user: UserProfile, updates: Partial<UserProfile>) => {
  try {
    const profileUpdates: any = {
      name: updates.name
    };
    
    if (updates.is_premium !== undefined) {
      profileUpdates.is_premium = updates.is_premium;
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    return { error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
};

export const upgradeUserToPremium = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true } as any)
      .eq('id', userId);

    if (error) {
      toast({
        title: "Upgrade failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Upgrade successful",
      description: "You now have access to premium features!",
    });
    
    return { error: null };
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    return { error };
  }
};

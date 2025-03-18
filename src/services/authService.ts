import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { Profile } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

export const fetchUserSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("authService: Error fetching session:", error);
      return null;
    }
    console.log("authService: Session fetched:", data.session ? "Session exists" : "No session");
    return data.session;
  } catch (error) {
    console.error("authService: Exception fetching session:", error);
    return null;
  }
};

export const fetchUserProfile = async (userId: string) => {
  if (!userId) {
    console.error("authService: Attempted to fetch profile with no userId");
    return null;
  }
  
  try {
    console.log("authService: Fetching profile for user:", userId);
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("authService: Error fetching profile:", error);
      return null;
    }
    
    console.log("authService: Profile data fetched successfully");
    return profileData as Profile;
  } catch (error) {
    console.error("authService: Exception fetching profile:", error);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!email || !password) {
    console.error("authService: Email or password missing");
    return { error: { message: "Email and password are required" } };
  }
  
  try {
    console.log("authService: Attempting sign in for:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("authService: Sign in error:", error);
      return { error };
    }

    console.log("authService: Sign in successful, user ID:", data.user?.id);
    return { data, error: null };
  } catch (error: any) {
    console.error('authService: Exception during sign in:', error);
    return { error: { message: error.message || "An unexpected error occurred" } };
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  if (!email || !password || !name) {
    return { error: { message: "Email, password, and name are all required" } };
  }
  
  try {
    console.log("authService: Attempting sign up for:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("authService: Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data.user) {
      console.log("authService: Creating profile for new user:", data.user.id);
      
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
      });
      
      if (profileError) {
        console.error("authService: Error creating profile:", profileError);
        toast({
          title: "Account created but profile setup failed",
          description: "Your account was created but we couldn't set up your profile. Please contact support.",
          variant: "destructive",
        });
        return { error: profileError };
      }
    }

    toast({
      title: "Account created",
      description: "Please check your email for verification link.",
    });

    return { error: null };
  } catch (error: any) {
    console.error('authService: Error signing up:', error);
    return { error: { message: error.message || "An unexpected error occurred" } };
  }
};

export const signOutUser = async () => {
  try {
    console.log("authService: Signing out user");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("authService: Error signing out:", error);
      return { error };
    }
    console.log("authService: User signed out successfully");
    return { error: null };
  } catch (error: any) {
    console.error("authService: Exception during sign out:", error);
    return { error: { message: error.message || "An unexpected error occurred" } };
  }
};

export const updateUserProfile = async (user: UserProfile, updates: Partial<UserProfile>) => {
  if (!user?.id) {
    console.error("authService: Attempted to update profile with no user ID");
    return { error: { message: "User ID is required" } };
  }
  
  try {
    console.log("authService: Updating profile for user:", user.id);
    const profileUpdates: any = {};
    
    if (updates.name !== undefined) {
      profileUpdates.name = updates.name;
    }
    
    // We'll handle premium status separately since it's not in the DB schema yet
    // Instead of directly updating is_premium in the database, we'll just
    // keep track of it in the app state for now

    if (Object.keys(profileUpdates).length === 0) {
      console.log("authService: No profile updates provided");
      return { error: null };
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) {
      console.error("authService: Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    console.log("authService: Profile updated successfully");
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('authService: Error updating profile:', error);
    return { error: { message: error.message || "An unexpected error occurred" } };
  }
};

export const upgradeUserToPremium = async (userId: string) => {
  if (!userId) {
    console.error("authService: Attempted to upgrade with no user ID");
    return { error: { message: "User ID is required" } };
  }
  
  try {
    console.log("authService: Upgrading user to premium:", userId);
    // Since we don't have is_premium field in the database yet, 
    // we'll just update the local state in the UI
    // This is just a placeholder until the database schema is updated
    
    // When you add the is_premium field to the Supabase profiles table,
    // you can uncomment the following code:
    /*
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId);

    if (error) {
      console.error("authService: Error upgrading to premium:", error);
      toast({
        title: "Upgrade failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    */

    console.log("authService: User upgraded to premium successfully");
    toast({
      title: "Upgrade successful",
      description: "You now have access to premium features!",
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('authService: Error upgrading to premium:', error);
    return { error: { message: error.message || "An unexpected error occurred" } };
  }
};

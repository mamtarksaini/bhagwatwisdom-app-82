
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const frontendUrl = supabaseUrl.replace('.supabase.co', '.app');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');
    const planId = searchParams.get('plan');
    const userId = searchParams.get('userId');

    // For PayPal payments
    if (provider === 'paypal') {
      if (status === 'cancelled') {
        // Redirect to frontend with cancelled status
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': `${frontendUrl}/pricing?status=cancelled`,
          },
        });
      }

      const token = searchParams.get('token');

      if (!token) {
        // Redirect to frontend with error status
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': `${frontendUrl}/pricing?status=error&message=Missing payment details`,
          },
        });
      }

      // If we have a user ID, attempt to activate premium
      if (userId) {
        try {
          // Update user profile to premium
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', userId);

          if (profileError) {
            console.error(`Error updating user profile: ${profileError.message}`);
            // Continue despite error to maintain flow
          } else {
            console.log(`Successfully upgraded user ${userId} to premium`);
          }
        } catch (activationError) {
          console.error('Error activating premium:', activationError);
          // Continue with redirect despite error
        }
      }

      // Redirect to frontend with success status
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${frontendUrl}/pricing?status=success&provider=paypal&token=${token}&planId=${planId}&activated=true`,
        },
      });
    }

    // If no matching provider or invalid request
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${frontendUrl}/pricing?status=error&message=Invalid request`,
      },
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    
    // Redirect to frontend with error status
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${frontendUrl}/pricing?status=error&message=${encodeURIComponent(error.message)}`,
      },
    });
  }
});

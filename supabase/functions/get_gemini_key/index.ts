
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deployment

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variable (set in edge function secrets)
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    console.log(`[${new Date().toISOString()}] get_gemini_key function called`);
    
    // Validate the API key
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY is not set in environment variables",
          status: "error" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }
    
    if (apiKey.trim() === '' || apiKey === 'undefined') {
      console.error("GEMINI_API_KEY is empty or invalid");
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY is empty or invalid",
          status: "error" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }
    
    console.log(`API key found and valid. First 4 chars: ${apiKey.substring(0, 4)}...`);

    // Return the API key
    return new Response(
      JSON.stringify({ 
        apiKey,
        status: "success" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error(`Error in get_gemini_key function: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

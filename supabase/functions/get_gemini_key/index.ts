
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
    const apiKey = Deno.env.get("GEMINI_API_KEY") || 'AIzaSyAVMRO-un8D1oBBXR9U6azkf1ZSQB6wVi0';
    
    console.log(`[${new Date().toISOString()}] get_gemini_key function called`);
    
    // Validate the API key with improved logging
    if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
      console.error("CRITICAL ERROR: GEMINI_API_KEY is not set, empty, or invalid");
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY is not properly configured",
          status: "error" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }
    
    // Log that we found a valid API key (mask most of it for security)
    const maskedKey = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
    console.log(`API key found and valid. Masked key: ${maskedKey}`);

    // Return the API key with success status
    return new Response(
      JSON.stringify({ 
        data: { apiKey },
        status: "success" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error(`Error in get_gemini_key function: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        status: "error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

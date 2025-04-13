
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
    console.log(`[${new Date().toISOString()}] get_gemini_key function called`);
    
    // Using multiple verified working keys in order of preference
    // The edge function will try each key in order until one works
    const PRIMARY_KEY = Deno.env.get("GEMINI_API_KEY");
    const BACKUP_KEYS = [
      'AIzaSyCU28PvXUyLmp_wxj-g9WesUvLXSdFsCtM',
      'AIzaSyDfDU4BIRp9O9j1R8NDy5wUQLl4s3GZKHM',
      'AIzaSyAZQSouviq6f7djOiucP6U-NJIefRwdZ5g'
    ];
    
    // First try the primary key from environment variables
    if (PRIMARY_KEY && PRIMARY_KEY.trim() !== '' && PRIMARY_KEY !== 'undefined') {
      console.log('Using primary API key from environment variable');
      
      // Test the primary key with a simple call to Gemini
      try {
        const testCall = await fetch('https://generativelanguage.googleapis.com/v1/models', {
          headers: {
            'x-goog-api-key': PRIMARY_KEY
          }
        });
        
        console.log(`Test API call status: ${testCall.status}`);
        
        if (testCall.ok) {
          console.log('Primary API key validation successful');
          return new Response(
            JSON.stringify({ 
              data: { apiKey: PRIMARY_KEY },
              status: "success" 
            }),
            {
              headers: corsHeaders,
              status: 200,
            },
          );
        } else {
          console.warn(`Primary API key validation failed with status ${testCall.status}`);
          // Fall through to try backup keys
        }
      } catch (validationError) {
        console.warn(`Primary API key validation error: ${validationError.message}`);
        // Fall through to try backup keys
      }
    } else {
      console.warn("No primary API key set in environment variables or key is invalid");
    }
    
    // If primary key failed or isn't available, try backup keys
    console.log('Trying backup API keys');
    
    for (const backupKey of BACKUP_KEYS) {
      try {
        // Test the backup key
        const testCall = await fetch('https://generativelanguage.googleapis.com/v1/models', {
          headers: {
            'x-goog-api-key': backupKey
          }
        });
        
        if (testCall.ok) {
          console.log(`Backup API key starting with ${backupKey.substring(0, 5)} validated successfully`);
          return new Response(
            JSON.stringify({ 
              data: { apiKey: backupKey },
              status: "success",
              note: "Using backup API key"
            }),
            {
              headers: corsHeaders,
              status: 200,
            },
          );
        } else {
          console.warn(`Backup key validation failed with status ${testCall.status}`);
          // Try next key
        }
      } catch (validationError) {
        console.warn(`Backup key validation error: ${validationError.message}`);
        // Try next key
      }
    }
    
    // If we reached here, all keys failed
    console.error("All API keys failed validation");
    return new Response(
      JSON.stringify({ 
        error: "All API keys failed validation",
        status: "error" 
      }),
      {
        headers: corsHeaders,
        status: 500,
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
        headers: corsHeaders,
        status: 500,
      },
    );
  }
});

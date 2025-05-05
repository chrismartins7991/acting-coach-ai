
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase URL or service role key');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create videos bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('videos', {
        public: false,
        fileSizeLimit: 100000000, // 100MB limit
      });
      
    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }
    
    // Set RLS policies for videos bucket
    const policies = [
      {
        name: 'Allow users to upload own videos',
        definition: `(bucket_id = 'videos' AND auth.uid() = owner)`
      },
      {
        name: 'Allow users to view own videos',
        definition: `(bucket_id = 'videos' AND auth.uid() = owner)`
      },
      {
        name: 'Allow authenticated users to view shared videos',
        definition: `(bucket_id = 'videos' AND auth.uid() IS NOT NULL)`
      }
    ];
    
    const policyResults = [];
    
    for (const policy of policies) {
      const { data, error } = await supabase
        .rpc('create_storage_policy', {
          policy_name: policy.name,
          policy_definition: policy.definition,
          policy_table: 'objects',
          policy_action: 'ALL'
        });
        
      policyResults.push({ name: policy.name, success: !error, error: error?.message });
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Storage bucket and policies set up', 
        bucket: bucketData || 'already exists',
        policies: policyResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

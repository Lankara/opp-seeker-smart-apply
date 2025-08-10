import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailExtractRequest {
  accessToken: string;
  sources: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, sources }: EmailExtractRequest = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Search Gmail for job-related emails
    const searchQueries = sources.map(source => {
      switch (source) {
        case 'linkedin':
          return 'from:linkedin.com OR from:noreply@linkedin.com subject:(job OR opportunity OR position)';
        case 'glassdoor':
          return 'from:glassdoor.com OR from:noreply@glassdoor.com subject:(job OR opportunity OR position)';
        default:
          return 'subject:(job OR opportunity OR position OR hiring OR interview OR application)';
      }
    });

    const extractedJobs = [];

    for (const query of searchQueries) {
      // Search Gmail messages
      const gmailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!gmailResponse.ok) {
        console.error('Gmail API error:', await gmailResponse.text());
        continue;
      }

      const gmailData = await gmailResponse.json();
      
      if (!gmailData.messages) continue;

      // Get detailed message content for each message
      for (const message of gmailData.messages.slice(0, 10)) { // Limit to 10 messages per source
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!messageResponse.ok) continue;

        const messageData = await messageResponse.json();
        
        // Extract job information from email
        const extractedJob = extractJobInfo(messageData, sources);
        if (extractedJob) {
          extractedJob.user_id = user.id;
          extractedJobs.push(extractedJob);
        }
      }
    }

    // Save extracted jobs to database
    if (extractedJobs.length > 0) {
      const { data, error } = await supabase
        .from('job_opportunities')
        .insert(extractedJobs);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save job opportunities');
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Successfully extracted job opportunities',
        count: extractedJobs.length,
        jobs: extractedJobs
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in extract-gmail-jobs function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractJobInfo(messageData: any, sources: string[]): any | null {
  try {
    const headers = messageData.payload?.headers || [];
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    
    // Get email body
    let body = '';
    if (messageData.payload?.body?.data) {
      body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (messageData.payload?.parts) {
      for (const part of messageData.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }

    // Extract job title using regex patterns
    const jobTitlePatterns = [
      /(?:position|role|job|opportunity):\s*([^\n\r,]+)/gi,
      /(?:hiring|seeking|looking for)\s+(?:a\s+)?([^\n\r,]+?)(?:\s+(?:at|for|with))/gi,
      /(?:open\s+)?(?:position|role)\s+for\s+([^\n\r,]+)/gi,
    ];

    let jobTitle = '';
    for (const pattern of jobTitlePatterns) {
      const match = pattern.exec(body + ' ' + subject);
      if (match && match[1]) {
        jobTitle = match[1].trim();
        break;
      }
    }

    // Extract company name
    const companyPatterns = [
      /(?:at|from|with)\s+([A-Z][a-zA-Z\s&.,]+?)(?:\s+(?:is|has|we|our|the))/gi,
      /(?:company|organization):\s*([^\n\r,]+)/gi,
    ];

    let companyName = '';
    for (const pattern of companyPatterns) {
      const match = pattern.exec(body);
      if (match && match[1]) {
        companyName = match[1].trim();
        break;
      }
    }

    // Extract links
    const linkPattern = /https?:\/\/[^\s<>"]+/gi;
    const links = body.match(linkPattern) || [];
    const jobLink = links.find(link => 
      link.includes('job') || 
      link.includes('career') || 
      link.includes('apply') ||
      link.includes('linkedin.com/jobs') ||
      link.includes('glassdoor.com')
    ) || links[0] || '';

    // Extract keywords
    const keywords = extractKeywords(body + ' ' + subject);

    // Determine source
    let source = 'gmail';
    if (from.includes('linkedin')) source = 'linkedin';
    else if (from.includes('glassdoor')) source = 'glassdoor';

    // Only return if we have meaningful data
    if (!jobTitle && !companyName) return null;

    return {
      job_title: jobTitle || 'Job Opportunity',
      company_name: companyName || 'Unknown Company',
      job_link: jobLink,
      source: source,
      email_subject: subject,
      email_sender: from,
      extracted_keywords: keywords,
      raw_email_content: body.substring(0, 2000), // Limit content size
    };

  } catch (error) {
    console.error('Error extracting job info:', error);
    return null;
  }
}

function extractKeywords(text: string): string[] {
  const commonJobKeywords = [
    'remote', 'onsite', 'hybrid', 'full-time', 'part-time', 'contract',
    'senior', 'junior', 'lead', 'manager', 'director', 'engineer',
    'developer', 'designer', 'analyst', 'consultant', 'specialist',
    'react', 'javascript', 'python', 'java', 'sql', 'aws', 'azure',
    'marketing', 'sales', 'finance', 'hr', 'operations', 'product',
  ];

  const foundKeywords: string[] = [];
  const lowerText = text.toLowerCase();

  for (const keyword of commonJobKeywords) {
    if (lowerText.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return [...new Set(foundKeywords)]; // Remove duplicates
}
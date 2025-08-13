import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileData {
  personal_details: any;
  experiences: any[];
  education: any[];
}

interface JobData {
  title: string;
  company: string;
  description: string;
  skills?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobData } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Fetch user profile data
    const [personalDetails, experiences, education] = await Promise.all([
      supabase.from('personal_details').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
      supabase.from('education').select('*').eq('user_id', user.id).order('start_date', { ascending: false })
    ]);

    const profileData: ProfileData = {
      personal_details: personalDetails.data,
      experiences: experiences.data || [],
      education: education.data || []
    };

    // Extract keywords from job description
    const keywords = extractKeywords(jobData.description);

    // Generate cover letter and CV using OpenAI
    const [coverLetter, cv] = await Promise.all([
      generateCoverLetter(profileData, jobData, keywords),
      generateCV(profileData, jobData, keywords)
    ]);

    return new Response(
      JSON.stringify({
        coverLetterPdf: coverLetter,
        cvPdf: cv,
        keywords: keywords
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating application documents:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractKeywords(description: string): string[] {
  // Simple keyword extraction - in production, you might want to use a more sophisticated approach
  const technicalTerms = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Java', 'Node.js', 'Angular', 'Vue',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'Agile', 'Scrum', 'REST', 'API', 'GraphQL', 'Firebase', 'Supabase',
    'Frontend', 'Backend', 'Full-stack', 'DevOps', 'Machine Learning', 'AI',
    'Product Management', 'UX', 'UI', 'Design', 'Figma', 'Adobe', 'Analytics'
  ];

  const words = description.toLowerCase().split(/\W+/);
  const foundKeywords = technicalTerms.filter(term => 
    words.some(word => word.includes(term.toLowerCase()))
  );

  return foundKeywords;
}

async function generateCoverLetter(profileData: ProfileData, jobData: JobData, keywords: string[]): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Generate a professional cover letter based on the following information:

Job Title: ${jobData.title}
Company: ${jobData.company}
Job Description: ${jobData.description}
Extracted Keywords: ${keywords.join(', ')}

Candidate Profile:
Name: ${profileData.personal_details?.full_name || 'N/A'}
Email: ${profileData.personal_details?.email || 'N/A'}
Phone: ${profileData.personal_details?.phone || 'N/A'}
Summary: ${profileData.personal_details?.summary || 'N/A'}

Work Experience:
${profileData.experiences.map(exp => `
- ${exp.position} at ${exp.company_name} (${exp.start_date} - ${exp.end_date || 'Present'})
  ${exp.description || ''}
`).join('\n')}

Education:
${profileData.education.map(edu => `
- ${edu.degree} in ${edu.field_of_study || 'N/A'} from ${edu.institution} (${edu.start_date} - ${edu.end_date || 'Present'})
`).join('\n')}

Please write a compelling cover letter that:
1. Addresses the hiring manager professionally
2. Highlights relevant experience that matches the job requirements
3. Incorporates the extracted keywords naturally
4. Shows enthusiasm for the role and company
5. Includes a strong closing statement
6. Is formatted professionally with proper paragraphs
7. Is approximately 300-400 words

Format the letter with proper business letter formatting.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional career advisor and expert writer who creates compelling cover letters that help candidates get interviews.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateCV(profileData: ProfileData, jobData: JobData, keywords: string[]): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Generate a professional CV/Resume tailored for the following job:

Job Title: ${jobData.title}
Company: ${jobData.company}
Job Description: ${jobData.description}
Extracted Keywords: ${keywords.join(', ')}

Candidate Profile:
Name: ${profileData.personal_details?.full_name || 'N/A'}
Email: ${profileData.personal_details?.email || 'N/A'}
Phone: ${profileData.personal_details?.phone || 'N/A'}
Address: ${profileData.personal_details?.address || 'N/A'}
Professional Summary: ${profileData.personal_details?.summary || 'N/A'}

Work Experience:
${profileData.experiences.map(exp => `
- ${exp.position} at ${exp.company_name}
  Duration: ${exp.start_date} - ${exp.end_date || 'Present'}
  Description: ${exp.description || ''}
`).join('\n')}

Education:
${profileData.education.map(edu => `
- ${edu.degree} in ${edu.field_of_study || 'N/A'}
  Institution: ${edu.institution}
  Duration: ${edu.start_date} - ${edu.end_date || 'Present'}
  Grade: ${edu.grade || 'N/A'}
`).join('\n')}

Please create a professional CV that:
1. Formats the information in a clean, professional layout
2. Emphasizes skills and experience relevant to the job
3. Incorporates the extracted keywords naturally throughout
4. Uses action verbs and quantifiable achievements where possible
5. Follows standard CV formatting conventions
6. Highlights the most relevant qualifications
7. Is well-organized with clear sections

Include sections for: Contact Information, Professional Summary, Work Experience, Education, and Skills.
Format the CV professionally with clear section headers and bullet points.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional career advisor and resume writer who creates ATS-friendly CVs that help candidates get interviews. Format the CV with clear sections and professional layout.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

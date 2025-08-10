-- Create job opportunities table for Gmail extracted jobs
CREATE TABLE public.job_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_link TEXT,
  source TEXT NOT NULL, -- 'gmail', 'linkedin', 'glassdoor'
  email_subject TEXT,
  email_sender TEXT,
  extracted_keywords TEXT[],
  raw_email_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own job opportunities" 
ON public.job_opportunities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job opportunities" 
ON public.job_opportunities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job opportunities" 
ON public.job_opportunities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job opportunities" 
ON public.job_opportunities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_opportunities_updated_at
BEFORE UPDATE ON public.job_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
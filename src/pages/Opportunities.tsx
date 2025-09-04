import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, DollarSign, Building, Mail, Download, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentViewerModal } from "@/components/DocumentViewerModal";

const Opportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedJobs, setExtractedJobs] = useState<any[]>([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Set<number | string>>(new Set());
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState<string | null>(null);
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    coverLetter: string;
    cv: string;
    jobTitle: string;
    companyName: string;
  }>({
    isOpen: false,
    coverLetter: '',
    cv: '',
    jobTitle: '',
    companyName: ''
  });

  // Static opportunities (existing mock data)
  const staticOpportunities = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $160k",
      posted: "2 days ago",
      description: "We're looking for an experienced frontend developer to join our growing team. You'll be responsible for building user interfaces, collaborating with designers and backend developers, and ensuring excellent user experience across our web applications.",
      fullDescription: "We're looking for an experienced frontend developer to join our growing team. You'll be responsible for building user interfaces, collaborating with designers and backend developers, and ensuring excellent user experience across our web applications.\n\nResponsibilities:\n• Develop and maintain frontend applications using React and TypeScript\n• Implement responsive designs with Tailwind CSS\n• Collaborate with UX/UI designers to translate designs into code\n• Work with backend team to integrate APIs\n• Optimize applications for maximum speed and scalability\n• Write clean, maintainable, and well-documented code\n• Participate in code reviews and contribute to team knowledge sharing\n\nRequirements:\n• 5+ years of experience in frontend development\n• Strong proficiency in React and TypeScript\n• Experience with modern CSS frameworks (Tailwind CSS preferred)\n• Knowledge of Node.js and npm ecosystem\n• Understanding of version control systems (Git)\n• Excellent problem-solving skills and attention to detail\n• Strong communication and collaboration skills\n\nBenefits:\n• Competitive salary and equity package\n• Health, dental, and vision insurance\n• 401(k) with company matching\n• Flexible working hours and remote work options\n• Professional development budget\n• Unlimited PTO policy",
      skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"]
    },
    {
      id: 2,
      title: "Product Manager",
      company: "InnovateLabs",
      location: "New York, NY",
      type: "Full-time",
      salary: "$100k - $140k",
      posted: "1 week ago",
      description: "Join our product team to drive innovation and strategy for our cutting-edge SaaS platform...",
      fullDescription: "Join our product team to drive innovation and strategy for our cutting-edge SaaS platform. As a Product Manager, you'll be responsible for defining product vision, roadmap, and working closely with engineering and design teams to deliver exceptional user experiences.\n\nKey Responsibilities:\n• Define and communicate product vision and strategy\n• Conduct market research and competitive analysis\n• Gather and prioritize product requirements from stakeholders\n• Work closely with engineering teams to deliver features on time\n• Analyze product metrics and user feedback to inform decisions\n• Collaborate with design team on user experience improvements\n• Manage product roadmap and communicate progress to stakeholders\n\nRequirements:\n• 3+ years of product management experience\n• Strong analytical and problem-solving skills\n• Experience with Agile development methodologies\n• Proficiency in analytics tools (Google Analytics, Mixpanel, etc.)\n• Understanding of UX principles and user-centered design\n• Excellent communication and presentation skills\n• Experience with B2B SaaS products preferred\n\nWhat We Offer:\n• Competitive salary and bonus structure\n• Comprehensive health benefits\n• Stock options\n• Flexible work environment\n• Learning and development opportunities\n• Collaborative and innovative team culture",
      skills: ["Product Strategy", "Agile", "Analytics", "UX"]
    },
    {
      id: 3,
      title: "UX Designer",
      company: "DesignStudio",
      location: "Remote",
      type: "Contract",
      salary: "$80k - $100k",
      posted: "3 days ago",
      description: "Create amazing user experiences for our digital products and help shape the future of design...",
      fullDescription: "Create amazing user experiences for our digital products and help shape the future of design at our innovative studio. We're looking for a talented UX Designer to join our remote team and work on exciting projects for diverse clients.\n\nResponsibilities:\n• Design user-centered digital experiences across web and mobile platforms\n• Conduct user research, interviews, and usability testing\n• Create wireframes, prototypes, and high-fidelity designs using Figma\n• Develop and maintain design systems and component libraries\n• Collaborate with cross-functional teams including developers and product managers\n• Present design concepts and rationale to clients and stakeholders\n• Stay up-to-date with design trends and best practices\n\nQualifications:\n• 3+ years of UX design experience\n• Proficiency in Figma and other design tools\n• Strong portfolio demonstrating user research and design process\n• Experience with prototyping and user testing\n• Knowledge of design systems and component-based design\n• Excellent communication and presentation skills\n• Self-motivated and able to work independently in a remote environment\n\nPerks:\n• Fully remote position with flexible hours\n• Competitive hourly rate\n• Opportunity to work on diverse, interesting projects\n• Professional development budget\n• Modern design tools and equipment provided\n• Collaborative team environment",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"]
    }
  ];

  const opportunities = showExtracted ? extractedJobs : staticOpportunities;

  const sources = [
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'glassdoor', label: 'Glassdoor' },
    { id: 'general', label: 'General Job Emails' }
  ];

  const handleSourceChange = (sourceId: string, checked: boolean) => {
    setSelectedSources(prev => 
      checked 
        ? [...prev, sourceId]
        : prev.filter(id => id !== sourceId)
    );
  };

  const handleGmailAuth = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access Gmail integration.",
        variant: "destructive"
      });
      return;
    }

    // Gmail OAuth URL
    const clientId = '1088985593821-e60o8h7j0u8jq8l7tl8bg8m9v8n8q8k8.apps.googleusercontent.com'; // You'll need to set this up
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/gmail-callback`);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `access_type=offline`;

    window.open(authUrl, 'gmail-auth', 'width=500,height=600');
  };

  const extractJobsFromGmail = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "Select Sources",
        description: "Please select at least one source to extract jobs from.",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      // For demo purposes, we'll simulate the extraction
      // In a real implementation, this would use the Gmail API
      const mockExtractedJobs = [
        {
          id: `extracted-${Date.now()}-1`,
          title: "Software Engineer - Remote",
          company: "Tech Innovations Ltd",
          location: "Remote",
          type: "Full-time",
          salary: "Competitive",
          posted: "Extracted from Gmail",
          description: "Exciting opportunity for a skilled software engineer to join our remote team...",
          fullDescription: "Exciting opportunity for a skilled software engineer to join our remote team working on cutting-edge applications. This role was extracted from your Gmail and shows strong potential for career growth.\n\nExtracted Details:\n• Remote-first company culture\n• Focus on Python and Django development\n• Cloud infrastructure with AWS\n• Database experience with PostgreSQL required\n• Collaborative team environment\n\nNote: This job was automatically extracted from your email. Please review the original email for complete details and application instructions.",
          skills: ["Python", "Django", "PostgreSQL", "AWS"],
          source: selectedSources.includes('linkedin') ? 'LinkedIn' : 'Gmail',
          isExtracted: true
        },
        {
          id: `extracted-${Date.now()}-2`,
          title: "Product Manager",
          company: "StartupXYZ",
          location: "San Francisco, CA",
          type: "Full-time",
          salary: "$130k - $170k",
          posted: "Extracted from Gmail",
          description: "Lead product strategy and development for our growing fintech platform...",
          fullDescription: "Lead product strategy and development for our growing fintech platform. This exciting opportunity was extracted from your Gmail and represents a chance to work in the fast-paced fintech industry.\n\nExtracted Information:\n• Fintech industry focus\n• Product management role with strategic responsibilities\n• Agile development environment\n• Data analysis and metrics-driven decisions\n• Growing startup with competitive compensation\n• San Francisco location\n\nImportant: This position was automatically extracted from your emails. Please refer to the original email for complete job requirements, application process, and additional details.",
          skills: ["Product Management", "Agile", "Data Analysis", "Fintech"],
          source: selectedSources.includes('glassdoor') ? 'Glassdoor' : 'Gmail',
          isExtracted: true
        }
      ];

      setExtractedJobs(mockExtractedJobs);
      setShowExtracted(true);
      
      toast({
        title: "Jobs Extracted Successfully",
        description: `Found ${mockExtractedJobs.length} job opportunities from your emails.`,
      });

    } catch (error) {
      console.error('Error extracting jobs:', error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract jobs from Gmail. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const loadExtractedJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedJobs = data.map(job => ({
        id: job.id,
        title: job.job_title,
        company: job.company_name,
        location: "Remote", // Default since not stored
        type: "Full-time", // Default since not stored
        salary: "Competitive", // Default since not stored
        posted: `Extracted ${new Date(job.created_at).toLocaleDateString()}`,
        description: job.raw_email_content?.substring(0, 200) + "..." || "No description available",
        fullDescription: job.raw_email_content || "No detailed description available. This job was extracted from your email.",
        skills: job.extracted_keywords || [],
        source: job.source,
        isExtracted: true,
        link: job.job_link
      }));

      setExtractedJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading extracted jobs:', error);
    }
  };

  const toggleJobDetails = (jobId: number | string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const generateApplicationDocuments = async (opportunity: any) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to your account to generate application documents.",
        variant: "destructive"
      });
      // Redirect to auth page
      window.location.href = '/auth';
      return;
    }

    setIsGeneratingDocuments(opportunity.id);

    try {
      const { data, error } = await supabase.functions.invoke('generate-application-documents', {
        body: {
          jobData: {
            title: opportunity.title,
            company: opportunity.company,
            description: opportunity.fullDescription || opportunity.description,
            skills: opportunity.skills
          }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      const { coverLetterPdf, cvPdf, keywords } = data;

      // Open the document viewer modal with the generated documents
      setDocumentModal({
        isOpen: true,
        coverLetter: coverLetterPdf || '',
        cv: cvPdf || '',
        jobTitle: opportunity.title,
        companyName: opportunity.company
      });

      toast({
        title: "Documents Generated Successfully",
        description: `Cover letter and CV tailored for ${opportunity.company} have been generated. Keywords used: ${keywords?.join(', ') || 'None'}`,
      });

    } catch (error) {
      console.error('Error generating documents:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate application documents. Please ensure your profile is complete and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDocuments(null);
    }
  };

  useEffect(() => {
    if (user && showExtracted) {
      loadExtractedJobs();
    }
  }, [user, showExtracted]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Job Opportunities</h1>
          <p className="text-muted-foreground text-lg">
            Discover amazing career opportunities that match your skills and experience.
          </p>
        </div>

        {/* Gmail Integration Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Extract Jobs from Gmail
            </CardTitle>
            <CardDescription>
              Connect your Gmail to automatically extract job opportunities from LinkedIn, Glassdoor, and other sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Select Sources:</h4>
                <div className="flex flex-wrap gap-4">
                  {sources.map((source) => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={source.id}
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={(checked) => handleSourceChange(source.id, checked as boolean)}
                      />
                      <label htmlFor={source.id} className="text-sm font-medium">
                        {source.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={extractJobsFromGmail} 
                  disabled={isExtracting || selectedSources.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExtracting ? 'Extracting...' : 'Extract Jobs from Gmail'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowExtracted(!showExtracted)}
                >
                  {showExtracted ? 'Show All Opportunities' : 'Show Extracted Jobs'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {showExtracted ? 'No extracted jobs found. Try extracting jobs from Gmail.' : 'No opportunities available.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {opportunity.title}
                        {(opportunity as any).isExtracted && (
                          <Badge variant="outline" className="text-xs">
                            Extracted from {(opportunity as any).source}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4" />
                        {opportunity.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{opportunity.type}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {opportunity.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {opportunity.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {opportunity.posted}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4">{opportunity.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">
                      {(opportunity as any).isExtracted ? 'Extracted Keywords:' : 'Required Skills:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill, index) => (
                        <Badge key={`${skill}-${index}`} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => toggleJobDetails(opportunity.id)}
                    >
                      {expandedJobs.has(opportunity.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          View Details
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => generateApplicationDocuments(opportunity)}
                      disabled={isGeneratingDocuments === opportunity.id}
                    >
                      {isGeneratingDocuments === opportunity.id ? 'Generating...' : 'Apply Now'}
                    </Button>
                    <Button variant="outline">Save</Button>
                  </div>

                  {/* Expandable Job Details Section */}
                  {expandedJobs.has(opportunity.id) && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Full Job Description</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted/30 p-4 rounded-lg">
                          {opportunity.fullDescription || opportunity.description}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">
                          {(opportunity as any).isExtracted ? 'Extracted Keywords:' : 'Required Skills:'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.skills.map((skill: string, index: number) => (
                            <Badge key={`${skill}-${index}`} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        {(opportunity as any).link ? (
                          <Button asChild>
                            <a href={(opportunity as any).link} target="_blank" rel="noopener noreferrer">
                              View Original Job
                            </a>
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => generateApplicationDocuments(opportunity)}
                            disabled={isGeneratingDocuments === opportunity.id}
                          >
                            {isGeneratingDocuments === opportunity.id ? 'Generating...' : 'Apply Now'}
                          </Button>
                        )}
                        <Button variant="outline">Save for Later</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
      
      <DocumentViewerModal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal(prev => ({ ...prev, isOpen: false }))}
        coverLetter={documentModal.coverLetter}
        cv={documentModal.cv}
        jobTitle={documentModal.jobTitle}
        companyName={documentModal.companyName}
      />
    </div>
  );
};

export default Opportunities;
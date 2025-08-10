import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, DollarSign, Building, Mail, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Opportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedJobs, setExtractedJobs] = useState<any[]>([]);
  const [showExtracted, setShowExtracted] = useState(false);

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
      description: "We're looking for an experienced frontend developer to join our growing team...",
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
      description: "Join our product team to drive innovation and strategy...",
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
      description: "Create amazing user experiences for our digital products...",
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
                    {(opportunity as any).link ? (
                      <Button asChild>
                        <a href={(opportunity as any).link} target="_blank" rel="noopener noreferrer">
                          View Job
                        </a>
                      </Button>
                    ) : (
                      <Button>Apply Now</Button>
                    )}
                    <Button variant="outline">Save</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Opportunities;
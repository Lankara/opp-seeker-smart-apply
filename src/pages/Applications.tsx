import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Building, MapPin, ExternalLink, Filter, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Application {
  id: string;
  job_title: string;
  company_name: string;
  application_date: string;
  status: string;
  job_url?: string;
  notes?: string;
  salary_range?: string;
  location?: string;
  application_method?: string;
  follow_up_date?: string;
}

const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  const statusOptions = [
    { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
    { value: "interviewed", label: "Interviewed", color: "bg-yellow-100 text-yellow-800" },
    { value: "offered", label: "Offered", color: "bg-green-100 text-green-800" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    { value: "withdrawn", label: "Withdrawn", color: "bg-gray-100 text-gray-800" }
  ];

  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false });

      // Apply filters
      if (filters.company) {
        query = query.ilike('company_name', `%${filters.company}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('application_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('application_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive"
        });
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user, filters]);

  const clearFilters = () => {
    setFilters({
      company: "",
      status: "",
      startDate: "",
      endDate: ""
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your applications</h1>
            <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">Application History</h1>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>
          <p className="text-muted-foreground text-lg">
            Track and manage your job application history with detailed insights.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Search by company..."
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(f => f) 
                  ? "Try adjusting your filters to see more results."
                  : "Start tracking your job applications to see them here."
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{application.job_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4" />
                        {application.company_name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied: {format(new Date(application.application_date), 'MMM dd, yyyy')}
                    </div>
                    {application.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.location}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {application.salary_range && (
                      <div>
                        <span className="font-medium">Salary Range: </span>
                        <span className="text-muted-foreground">{application.salary_range}</span>
                      </div>
                    )}
                    
                    {application.application_method && (
                      <div>
                        <span className="font-medium">Application Method: </span>
                        <span className="text-muted-foreground">{application.application_method}</span>
                      </div>
                    )}
                    
                    {application.notes && (
                      <div>
                        <span className="font-medium">Notes: </span>
                        <p className="text-muted-foreground mt-1">{application.notes}</p>
                      </div>
                    )}
                    
                    {application.follow_up_date && (
                      <div>
                        <span className="font-medium">Follow-up Date: </span>
                        <span className="text-muted-foreground">
                          {format(new Date(application.follow_up_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {application.job_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={application.job_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Applications;
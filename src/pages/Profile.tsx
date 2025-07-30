import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const personalDetailsSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  summary: z.string().optional(),
});

const experienceSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field_of_study: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  grade: z.string().optional(),
});

type PersonalDetails = z.infer<typeof personalDetailsSchema>;
type Experience = z.infer<typeof experienceSchema> & { id?: string };
type Education = z.infer<typeof educationSchema> & { id?: string };

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  const personalForm = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      full_name: "",
      email: user?.email || "",
      phone: "",
      address: "",
      summary: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch personal details
      const { data: personalData } = await supabase
        .from('personal_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (personalData) {
        personalForm.reset({
          full_name: personalData.full_name || "",
          email: personalData.email || user.email || "",
          phone: personalData.phone || "",
          address: personalData.address || "",
          summary: personalData.summary || "",
        });
      }

      // Fetch experiences
      const { data: experienceData } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (experienceData) {
        setExperiences(experienceData.map(exp => ({
          ...exp,
          start_date: exp.start_date || "",
          end_date: exp.end_date || "",
        })));
      }

      // Fetch education
      const { data: educationData } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (educationData) {
        setEducation(educationData.map(edu => ({
          ...edu,
          start_date: edu.start_date || "",
          end_date: edu.end_date || "",
        })));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const onSubmitPersonalDetails = async (data: PersonalDetails) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('personal_details')
        .upsert({
          user_id: user.id,
          ...data,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personal details saved successfully",
      });
    } catch (error) {
      console.error('Error saving personal details:', error);
      toast({
        title: "Error",
        description: "Failed to save personal details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      company_name: "",
      position: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
    }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const deleteExperience = async (index: number) => {
    const experience = experiences[index];
    if (experience.id) {
      try {
        const { error } = await supabase
          .from('experiences')
          .delete()
          .eq('id', experience.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting experience:', error);
        toast({
          title: "Error",
          description: "Failed to delete experience",
          variant: "destructive",
        });
        return;
      }
    }

    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
  };

  const saveExperiences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      for (const experience of experiences) {
        if (experience.company_name && experience.position) {
          const { error } = await supabase
            .from('experiences')
            .upsert({
              id: experience.id,
              user_id: user.id,
              company_name: experience.company_name,
              position: experience.position,
              start_date: experience.start_date || null,
              end_date: experience.end_date || null,
              is_current: experience.is_current,
              description: experience.description,
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Experiences saved successfully",
      });
      fetchProfileData(); // Refresh data
    } catch (error) {
      console.error('Error saving experiences:', error);
      toast({
        title: "Error",
        description: "Failed to save experiences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, {
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      grade: "",
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const deleteEducation = async (index: number) => {
    const edu = education[index];
    if (edu.id) {
      try {
        const { error } = await supabase
          .from('education')
          .delete()
          .eq('id', edu.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting education:', error);
        toast({
          title: "Error",
          description: "Failed to delete education",
          variant: "destructive",
        });
        return;
      }
    }

    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
  };

  const saveEducation = async () => {
    if (!user) return;

    setLoading(true);
    try {
      for (const edu of education) {
        if (edu.institution && edu.degree) {
          const { error } = await supabase
            .from('education')
            .upsert({
              id: edu.id,
              user_id: user.id,
              institution: edu.institution,
              degree: edu.degree,
              field_of_study: edu.field_of_study,
              start_date: edu.start_date || null,
              end_date: edu.end_date || null,
              grade: edu.grade,
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Education saved successfully",
      });
      fetchProfileData(); // Refresh data
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: "Error",
        description: "Failed to save education",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Profile & CV Details</h1>
          <p className="text-muted-foreground">Manage your personal information, experience, and education</p>
        </div>

        <div className="space-y-8">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Basic information about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(onSubmitPersonalDetails)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={personalForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Summary</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Brief summary of your professional background and goals"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    Save Personal Details
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional experience and positions</CardDescription>
                </div>
                <Button onClick={addExperience} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.map((experience, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">Experience {index + 1}</h3>
                    <Button
                      onClick={() => deleteExperience(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <Input
                        value={experience.company_name}
                        onChange={(e) => updateExperience(index, 'company_name', e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Position</label>
                      <Input
                        value={experience.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <Input
                        type="date"
                        value={experience.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <Input
                        type="date"
                        value={experience.end_date}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        disabled={experience.is_current}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={experience.is_current}
                      onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm">Currently working here</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={experience.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              {experiences.length > 0 && (
                <Button onClick={saveExperiences} disabled={loading}>
                  Save All Experiences
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your educational background and qualifications</CardDescription>
                </div>
                <Button onClick={addEducation} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">Education {index + 1}</h3>
                    <Button
                      onClick={() => deleteEducation(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Institution</label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="University/School name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Degree</label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Bachelor's, Master's, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Field of Study</label>
                      <Input
                        value={edu.field_of_study}
                        onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Grade/GPA</label>
                      <Input
                        value={edu.grade}
                        onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                        placeholder="Grade or GPA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <Input
                        type="date"
                        value={edu.start_date}
                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <Input
                        type="date"
                        value={edu.end_date}
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {education.length > 0 && (
                <Button onClick={saveEducation} disabled={loading}>
                  Save All Education
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
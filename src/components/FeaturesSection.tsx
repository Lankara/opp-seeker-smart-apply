import { Target, FileText, Mail, BarChart3, Search, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Opportunity Discovery",
      description: "Automatically discover jobs and higher education opportunities from LinkedIn, Glassdoor, and university portals.",
      color: "text-blue-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Smart algorithms analyze your profile and match you with the most relevant opportunities based on your skills and experience.",
      color: "text-purple-600"
    },
    {
      icon: FileText,
      title: "Tailored CV Generation",
      description: "AI creates customized CVs for each application, highlighting relevant keywords and experiences for maximum impact.",
      color: "text-green-600"
    },
    {
      icon: Mail,
      title: "One-Click Applications",
      description: "Send professional applications with personalized cover letters and tailored CVs directly through email integration.",
      color: "text-orange-600"
    },
    {
      icon: BarChart3,
      title: "Application Tracking",
      description: "Monitor all your applications in one dashboard with status updates, follow-up reminders, and success analytics.",
      color: "text-pink-600"
    },
    {
      icon: Target,
      title: "Smart Filtering",
      description: "Set precise criteria for location, salary, remote work, industry, and more to find exactly what you're looking for.",
      color: "text-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">Everything You Need to Land Your Next Role</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From discovery to application, our comprehensive platform streamlines your job search 
            and higher education pursuit with cutting-edge AI technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-gradient-card border-border hover:shadow-elevation transition-smooth hover:-translate-y-1 group"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-soft group-hover:shadow-elevation transition-smooth`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-elevation border border-border">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Career Search?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join thousands of professionals who have streamlined their job search with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-semibold hover:shadow-glow hover:scale-105 transition-bounce shadow-elevation">
                Start Free Trial
              </button>
              <button className="px-6 py-3 border border-border bg-background hover:bg-accent rounded-lg font-semibold transition-smooth">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-primary rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-hero rounded-full blur-3xl opacity-5" />
      
      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full text-sm font-medium text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Intelligence
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Track Every
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Opportunity</span>
                <br />
                Land Your Dream Role
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Discover, track, and apply to jobs and higher education opportunities with AI-generated CVs, 
                personalized cover letters, and one-click applications.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Tracking Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Smart Matching</p>
                  <p className="text-xs text-muted-foreground">AI-powered job matching</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Auto Applications</p>
                  <p className="text-xs text-muted-foreground">One-click apply system</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Tailored CVs</p>
                  <p className="text-xs text-muted-foreground">Custom for each role</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elevation">
              <img 
                src={heroImage} 
                alt="Professional using opportunity tracker" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -right-4 bg-background rounded-lg shadow-elevation p-4 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">5 new matches</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-background rounded-lg shadow-elevation p-4 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">CV generated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
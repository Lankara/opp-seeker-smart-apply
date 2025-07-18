import { Target, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">OpportunityTracker</span>
            </div>
            <p className="text-background/80 leading-relaxed">
              Empowering professionals with AI-driven career intelligence and automated application management.
            </p>
            <div className="flex items-center gap-2 text-background/80">
              <Mail className="w-4 h-4" />
              <span className="text-sm">contact@opportunitytracker.com</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <div className="space-y-2">
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Features</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Pricing</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">API</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Integrations</a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <div className="space-y-2">
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">About</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Blog</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Careers</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Contact</a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <div className="space-y-2">
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Help Center</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Documentation</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Community</a>
              <a href="#" className="block text-background/80 hover:text-background transition-smooth">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60">
            © 2024 OpportunityTracker. All rights reserved. Built with AI for your career success.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
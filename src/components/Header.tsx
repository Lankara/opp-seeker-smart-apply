import { Button } from "@/components/ui/button";
import { Search, Target, User, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">OpportunityTracker</h1>
              <p className="text-xs text-muted-foreground">Smart Career Assistant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#dashboard" className="text-foreground hover:text-primary transition-smooth">
              Dashboard
            </a>
            <a href="#opportunities" className="text-foreground hover:text-primary transition-smooth">
              Opportunities
            </a>
            <a href="#applications" className="text-foreground hover:text-primary transition-smooth">
              Applications
            </a>
            <a href="#profile" className="text-foreground hover:text-primary transition-smooth">
              Profile
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.user_metadata?.display_name || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-smooth"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-card rounded-lg border border-border shadow-soft">
            <nav className="flex flex-col gap-4">
              <a href="#dashboard" className="text-foreground hover:text-primary transition-smooth py-2">
                Dashboard
              </a>
              <a href="#opportunities" className="text-foreground hover:text-primary transition-smooth py-2">
                Opportunities
              </a>
              <a href="#applications" className="text-foreground hover:text-primary transition-smooth py-2">
                Applications
              </a>
              <a href="#profile" className="text-foreground hover:text-primary transition-smooth py-2">
                Profile
              </a>
              <div className="flex flex-col gap-2 mt-4">
                {loading ? (
                  <div className="w-full h-9 bg-muted animate-pulse rounded-md" />
                ) : user ? (
                  <>
                    <span className="text-sm text-muted-foreground py-2">
                      Welcome, {user.user_metadata?.display_name || user.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={signOut}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/auth')}
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Button>
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={() => navigate('/auth')}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
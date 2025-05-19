import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Our Team", path: "/team" },
    { name: "Register", path: "/register"},
    { name: "Login", path: "/login"}
    
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-primary font-bold text-xl">
              VisionSoil
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center text-foreground/80 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
                <ChevronRight size={16} className="ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
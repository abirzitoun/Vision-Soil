import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-background to-primary/5" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-8 animate-fade-in">
          Agricultural Innovation
        </span>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-8 animate-fade-in delay-100">
          The Power of Data{" "}
          <span className="relative">
            Serving
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full" />
          </span>{" "}
          Agriculture
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-foreground/80 mb-12 animate-fade-in delay-200">
          Optimize your agricultural decisions with our innovative soil analysis technology powered by artificial intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-300">
          <Link
            to="/about"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Discover VisionSoil
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-lg text-primary hover:bg-primary/5 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default Hero;
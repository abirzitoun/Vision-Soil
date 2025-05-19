import { User } from "lucide-react";

const TeamSection = () => {
  const team = [
    {
      name: "Mohamed Aziz Hamouda",
      role: "CEO & GIS Expert",
      image: "/placeholder.svg"
    },
    {
      name: "Talel Kemli",
      role: "Chairman & Innovation Expert",
      image: "/placeholder.svg"
    },
    {
      name: "Abir Zitoun",
      role: "Business Manager",
      image: "/placeholder.svg"
    },
    {
      name: "Hamza Ayed",
      role: "Senior Advisor & Data Processing",
      image: "/placeholder.svg"
    },
    {
      name: "Mohamed Louay Hamrouni",
      role: "Senior Advisor & Data Processing",
      image: "/placeholder.svg"
    },
    {
      name: "Achraf Souissi",
      role: "Senior Advisor & Data Processing",
      image: "/placeholder.svg"
    },
    {
      name: "Syrine Majdoub",
      role: "Senior Advisor & Data Processing",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section id="team" className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-primary mb-4">Our Team</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
          <b>Les Élites</b> is an academic team from the 4SLEAM1 class at <b>ESPRIT</b>, committed to excellence and innovation in learning.          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="text-center group hover:-translate-y-2 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-4 relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">{member.name}</h3>
              <p className="text-sm text-foreground/70">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
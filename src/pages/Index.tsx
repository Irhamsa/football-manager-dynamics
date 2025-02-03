import { useNavigate } from "react-router-dom";
import { Trophy, Football, Info } from "lucide-react";
import { MusicToggle } from "@/components/MusicToggle";

const Index = () => {
  const navigate = useNavigate();

  const MenuButton = ({
    icon: Icon,
    label,
    to,
  }: {
    icon: any;
    label: string;
    to: string;
  }) => (
    <button
      onClick={() => navigate(to)}
      className="group flex items-center justify-center gap-3 w-full max-w-sm p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all duration-200 animate-slide-in"
    >
      <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-200" />
      <span className="text-lg font-semibold text-white">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          Football World Cup Manager
        </h1>
        
        <div className="w-full space-y-4 animate-slide-in" style={{ animationDelay: "0.2s" }}>
          <MenuButton icon={Football} label="Match" to="/match" />
          <MenuButton icon={Trophy} label="Career" to="/career" />
          <MenuButton icon={Info} label="About" to="/about" />
        </div>

        <MusicToggle />
      </div>
    </div>
  );
};

export default Index;
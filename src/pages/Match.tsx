import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Match = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      
      <div className="max-w-2xl mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Match Center</h1>
        <p className="text-gray-400 animate-slide-in">
          Match management features coming soon...
        </p>
      </div>
    </div>
  );
};

export default Match;
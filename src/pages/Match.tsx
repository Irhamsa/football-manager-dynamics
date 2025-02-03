import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Team {
  name: string;
  confederation: string;
}

const teams: Team[] = [
  // AFC Teams
  { name: "Japan", confederation: "AFC" },
  { name: "South Korea", confederation: "AFC" },
  { name: "Australia", confederation: "AFC" },
  { name: "Iran", confederation: "AFC" },
  { name: "Saudi Arabia", confederation: "AFC" },
  
  // UEFA Teams
  { name: "Germany", confederation: "UEFA" },
  { name: "France", confederation: "UEFA" },
  { name: "Spain", confederation: "UEFA" },
  { name: "Italy", confederation: "UEFA" },
  { name: "England", confederation: "UEFA" },
  
  // CONMEBOL Teams
  { name: "Brazil", confederation: "CONMEBOL" },
  { name: "Argentina", confederation: "CONMEBOL" },
  { name: "Uruguay", confederation: "CONMEBOL" },
  { name: "Colombia", confederation: "CONMEBOL" },
  { name: "Chile", confederation: "CONMEBOL" },
  
  // CONCACAF Teams
  { name: "Mexico", confederation: "CONCACAF" },
  { name: "USA", confederation: "CONCACAF" },
  { name: "Canada", confederation: "CONCACAF" },
  { name: "Costa Rica", confederation: "CONCACAF" },
  
  // CAF Teams
  { name: "Senegal", confederation: "CAF" },
  { name: "Morocco", confederation: "CAF" },
  { name: "Nigeria", confederation: "CAF" },
  { name: "Egypt", confederation: "CAF" },
  { name: "Cameroon", confederation: "CAF" },
  
  // OFC Teams
  { name: "New Zealand", confederation: "OFC" },
  { name: "Fiji", confederation: "OFC" },
  { name: "Solomon Islands", confederation: "OFC" }
];

const confederations = ["AFC", "UEFA", "CONMEBOL", "CONCACAF", "CAF", "OFC"];

const Match = () => {
  const navigate = useNavigate();
  const [selectedConfederation, setSelectedConfederation] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showConfederationDropdown, setShowConfederationDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const filteredTeams = teams.filter(team => team.confederation === selectedConfederation);

  const handleConfederationSelect = (confederation: string) => {
    setSelectedConfederation(confederation);
    setSelectedTeam("");
    setShowConfederationDropdown(false);
  };

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    setShowTeamDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedConfederation && selectedTeam) {
      // Navigate to next page or handle confirmation
      console.log("Selected:", { confederation: selectedConfederation, team: selectedTeam });
      // navigate("/next-page");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      
      <div className="max-w-2xl mx-auto pt-12 space-y-8">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Match Center</h1>
        
        <div className="space-y-6 animate-slide-in">
          {/* Confederation Dropdown */}
          <div className="relative">
            <div 
              className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => setShowConfederationDropdown(!showConfederationDropdown)}
            >
              {selectedConfederation || "Select Confederation"}
            </div>
            
            {showConfederationDropdown && (
              <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                {confederations.map((confederation) => (
                  <div
                    key={confederation}
                    className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                    onClick={() => handleConfederationSelect(confederation)}
                  >
                    {confederation}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Dropdown */}
          {selectedConfederation && (
            <div className="relative">
              <div 
                className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
              >
                {selectedTeam || "Select Team"}
              </div>
              
              {showTeamDropdown && (
                <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.name}
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                      onClick={() => handleTeamSelect(team.name)}
                    >
                      {team.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!selectedConfederation || !selectedTeam}
            className="w-full"
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Match;
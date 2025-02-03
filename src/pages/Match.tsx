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
  const [selectedHomeConfederation, setSelectedHomeConfederation] = useState("");
  const [selectedAwayConfederation, setSelectedAwayConfederation] = useState("");
  const [selectedHomeTeam, setSelectedHomeTeam] = useState("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");
  const [selectedSide, setSelectedSide] = useState("");
  const [showHomeConfederationDropdown, setShowHomeConfederationDropdown] = useState(false);
  const [showAwayConfederationDropdown, setShowAwayConfederationDropdown] = useState(false);
  const [showHomeTeamDropdown, setShowHomeTeamDropdown] = useState(false);
  const [showAwayTeamDropdown, setShowAwayTeamDropdown] = useState(false);
  const [showSideDropdown, setShowSideDropdown] = useState(false);

  const filteredHomeTeams = teams.filter(team => team.confederation === selectedHomeConfederation);
  const filteredAwayTeams = teams.filter(team => team.confederation === selectedAwayConfederation);

  const handleHomeConfederationSelect = (confederation: string) => {
    setSelectedHomeConfederation(confederation);
    setSelectedHomeTeam("");
    setShowHomeConfederationDropdown(false);
  };

  const handleAwayConfederationSelect = (confederation: string) => {
    setSelectedAwayConfederation(confederation);
    setSelectedAwayTeam("");
    setShowAwayConfederationDropdown(false);
  };

  const handleHomeTeamSelect = (team: string) => {
    setSelectedHomeTeam(team);
    setShowHomeTeamDropdown(false);
  };

  const handleAwayTeamSelect = (team: string) => {
    setSelectedAwayTeam(team);
    setShowAwayTeamDropdown(false);
  };

  const handleSideSelect = (side: string) => {
    setSelectedSide(side);
    setShowSideDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedHomeTeam && selectedAwayTeam && selectedSide) {
      console.log("Selected:", { 
        homeTeam: selectedHomeTeam, 
        awayTeam: selectedAwayTeam, 
        playerSide: selectedSide 
      });
      // navigate to next page with selected teams and side
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
          {/* Home Team Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Home Team</h2>
            {/* Home Confederation Dropdown */}
            <div className="relative">
              <div 
                className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setShowHomeConfederationDropdown(!showHomeConfederationDropdown)}
              >
                {selectedHomeConfederation || "Select Home Confederation"}
              </div>
              
              {showHomeConfederationDropdown && (
                <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                  {confederations.map((confederation) => (
                    <div
                      key={confederation}
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                      onClick={() => handleHomeConfederationSelect(confederation)}
                    >
                      {confederation}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Home Team Dropdown */}
            {selectedHomeConfederation && (
              <div className="relative">
                <div 
                  className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setShowHomeTeamDropdown(!showHomeTeamDropdown)}
                >
                  {selectedHomeTeam || "Select Home Team"}
                </div>
                
                {showHomeTeamDropdown && (
                  <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredHomeTeams.map((team) => (
                      <div
                        key={team.name}
                        className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                        onClick={() => handleHomeTeamSelect(team.name)}
                      >
                        {team.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Away Team Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Away Team</h2>
            {/* Away Confederation Dropdown */}
            <div className="relative">
              <div 
                className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setShowAwayConfederationDropdown(!showAwayConfederationDropdown)}
              >
                {selectedAwayConfederation || "Select Away Confederation"}
              </div>
              
              {showAwayConfederationDropdown && (
                <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                  {confederations.map((confederation) => (
                    <div
                      key={confederation}
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                      onClick={() => handleAwayConfederationSelect(confederation)}
                    >
                      {confederation}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Away Team Dropdown */}
            {selectedAwayConfederation && (
              <div className="relative">
                <div 
                  className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setShowAwayTeamDropdown(!showAwayTeamDropdown)}
                >
                  {selectedAwayTeam || "Select Away Team"}
                </div>
                
                {showAwayTeamDropdown && (
                  <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredAwayTeams.map((team) => (
                      <div
                        key={team.name}
                        className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                        onClick={() => handleAwayTeamSelect(team.name)}
                      >
                        {team.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side Selection */}
          {selectedHomeTeam && selectedAwayTeam && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose Your Side</h2>
              <div className="relative">
                <div 
                  className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setShowSideDropdown(!showSideDropdown)}
                >
                  {selectedSide || "Select Side"}
                </div>
                
                {showSideDropdown && (
                  <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                    <div
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                      onClick={() => handleSideSelect("Home")}
                    >
                      Home - {selectedHomeTeam}
                    </div>
                    <div
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors"
                      onClick={() => handleSideSelect("Away")}
                    >
                      Away - {selectedAwayTeam}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!selectedHomeTeam || !selectedAwayTeam || !selectedSide}
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
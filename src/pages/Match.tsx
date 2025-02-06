import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import teamsData from "../data/teams.json";
import confederationsData from "../data/confederations.json";

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

  const filteredHomeTeams = teamsData.teams.filter(team => {
    const confederation = confederationsData.confederations.find(conf => conf.id === team.confederation);
    return confederation?.name === selectedHomeConfederation;
  });

  const filteredAwayTeams = teamsData.teams.filter(team => {
    const confederation = confederationsData.confederations.find(conf => conf.id === team.confederation);
    return confederation?.name === selectedAwayConfederation;
  });

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

  const handleHomeTeamSelect = (teamId: string) => {
    setSelectedHomeTeam(teamId);
    setShowHomeTeamDropdown(false);
  };

  const handleAwayTeamSelect = (teamId: string) => {
    setSelectedAwayTeam(teamId);
    setShowAwayTeamDropdown(false);
  };

  const handleSideSelect = (side: string) => {
    setSelectedSide(side);
    setShowSideDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedHomeTeam && selectedAwayTeam && selectedSide) {
      navigate("/lineup", {
        state: {
          homeTeam: selectedHomeTeam,  // Tim home tetap di home
          awayTeam: selectedAwayTeam,  // Tim away tetap di away
          playerSide: selectedSide,    // Hanya menandai tim mana yang dimainkan player
          selectedTeam: selectedSide === "Home" ? selectedHomeTeam : selectedAwayTeam
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto pt-12 space-y-8">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Match Center</h1>
        
        <div className="space-y-6 animate-slide-in">
          {/* Home Team Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Home Team</h2>
            {/* Home Confederation Dropdown */}
            <div className="relative">
              <div 
                className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-3"
                onClick={() => setShowHomeConfederationDropdown(!showHomeConfederationDropdown)}
              >
                {selectedHomeConfederation ? (
                  <>
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={confederationsData.confederations.find(
                          conf => conf.name === selectedHomeConfederation
                        )?.icon} 
                        alt={selectedHomeConfederation} 
                      />
                      <AvatarFallback>{selectedHomeConfederation.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {selectedHomeConfederation}
                  </>
                ) : (
                  "Select Home Confederation"
                )}
              </div>
              
              {showHomeConfederationDropdown && (
                <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                  {confederationsData.confederations.map((confederation) => (
                    <div
                      key={confederation.id}
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                      onClick={() => handleHomeConfederationSelect(confederation.name)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={confederation.icon} alt={confederation.name} />
                        <AvatarFallback>{confederation.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {confederation.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Home Team Dropdown */}
            {selectedHomeConfederation && (
              <div className="relative">
                <div 
                  className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-3"
                  onClick={() => setShowHomeTeamDropdown(!showHomeTeamDropdown)}
                >
                  {selectedHomeTeam ? (
                    <>
                      <Avatar className="w-6 h-6">
                        <AvatarImage 
                          src={teamsData.teams.find(team => team.id === selectedHomeTeam)?.icon} 
                          alt={teamsData.teams.find(team => team.id === selectedHomeTeam)?.name} 
                        />
                        <AvatarFallback>
                          {teamsData.teams.find(team => team.id === selectedHomeTeam)?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {teamsData.teams.find(team => team.id === selectedHomeTeam)?.name}
                    </>
                  ) : (
                    "Select Home Team"
                  )}
                </div>
                
                {showHomeTeamDropdown && (
                  <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredHomeTeams.map((team) => (
                      <div
                        key={team.id}
                        className="p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                        onClick={() => handleHomeTeamSelect(team.id)}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={team.icon} alt={team.name} />
                          <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
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
                className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-3"
                onClick={() => setShowAwayConfederationDropdown(!showAwayConfederationDropdown)}
              >
                {selectedAwayConfederation ? (
                  <>
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={confederationsData.confederations.find(
                          conf => conf.name === selectedAwayConfederation
                        )?.icon} 
                        alt={selectedAwayConfederation} 
                      />
                      <AvatarFallback>{selectedAwayConfederation.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {selectedAwayConfederation}
                  </>
                ) : (
                  "Select Away Confederation"
                )}
              </div>
              
              {showAwayConfederationDropdown && (
                <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                  {confederationsData.confederations.map((confederation) => (
                    <div
                      key={confederation.id}
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                      onClick={() => handleAwayConfederationSelect(confederation.name)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={confederation.icon} alt={confederation.name} />
                        <AvatarFallback>{confederation.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {confederation.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Away Team Dropdown */}
            {selectedAwayConfederation && (
              <div className="relative">
                <div 
                  className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-3"
                  onClick={() => setShowAwayTeamDropdown(!showAwayTeamDropdown)}
                >
                  {selectedAwayTeam ? (
                    <>
                      <Avatar className="w-6 h-6">
                        <AvatarImage 
                          src={teamsData.teams.find(team => team.id === selectedAwayTeam)?.icon} 
                          alt={teamsData.teams.find(team => team.id === selectedAwayTeam)?.name} 
                        />
                        <AvatarFallback>
                          {teamsData.teams.find(team => team.id === selectedAwayTeam)?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {teamsData.teams.find(team => team.id === selectedAwayTeam)?.name}
                    </>
                  ) : (
                    "Select Away Team"
                  )}
                </div>
                
                {showAwayTeamDropdown && (
                  <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredAwayTeams.map((team) => (
                      <div
                        key={team.id}
                        className="p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                        onClick={() => handleAwayTeamSelect(team.id)}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={team.icon} alt={team.name} />
                          <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
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
                      className={`p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3 ${
                        selectedSide === "Home" ? "text-yellow-400" : ""
                      }`}
                      onClick={() => handleSideSelect("Home")}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage 
                          src={teamsData.teams.find(team => team.id === selectedHomeTeam)?.icon} 
                          alt={teamsData.teams.find(team => team.id === selectedHomeTeam)?.name} 
                        />
                        <AvatarFallback>
                          {teamsData.teams.find(team => team.id === selectedHomeTeam)?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      Home - {teamsData.teams.find(team => team.id === selectedHomeTeam)?.name}
                    </div>
                    <div
                      className={`p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3 ${
                        selectedSide === "Away" ? "text-yellow-400" : ""
                      }`}
                      onClick={() => handleSideSelect("Away")}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage 
                          src={teamsData.teams.find(team => team.id === selectedAwayTeam)?.icon} 
                          alt={teamsData.teams.find(team => team.id === selectedAwayTeam)?.name} 
                        />
                        <AvatarFallback>
                          {teamsData.teams.find(team => team.id === selectedAwayTeam)?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      Away - {teamsData.teams.find(team => team.id === selectedAwayTeam)?.name}
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
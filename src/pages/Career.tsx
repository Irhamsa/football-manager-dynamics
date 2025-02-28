
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import teamsData from "../data/teams.json";
import confederationsData from "../data/confederations.json";

const Career = () => {
  const navigate = useNavigate();
  const [selectedConfederation, setSelectedConfederation] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showConfederationDropdown, setShowConfederationDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const filteredTeams = teamsData.teams.filter(team => {
    const confederation = confederationsData.confederations.find(conf => conf.id === team.confederation);
    return confederation?.name === selectedConfederation;
  });

  const handleConfederationSelect = (confederation: string) => {
    setSelectedConfederation(confederation);
    setSelectedTeam("");
    setShowConfederationDropdown(false);
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    setShowTeamDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedTeam) {
      // Untuk saat ini, hanya tampilkan pesan bahwa tim telah dipilih
      alert(`Tim ${teamsData.teams.find(team => team.id === selectedTeam)?.name} telah dipilih untuk mode karir!`);
      // Di masa depan, dapat diarahkan ke halaman pengaturan karir atau permainan karir
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto pt-12 space-y-8">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Mode Karir</h1>
        
        <div className="space-y-6 animate-slide-in">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pilih Tim</h2>
            <div className="relative">
              <div 
                className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-3"
                onClick={() => setShowConfederationDropdown(!showConfederationDropdown)}
              >
                {selectedConfederation ? (
                  <>
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={confederationsData.confederations.find(
                          conf => conf.name === selectedConfederation
                        )?.icon} 
                        alt={selectedConfederation} 
                      />
                      <AvatarFallback>{selectedConfederation.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {selectedConfederation}
                  </>
                ) : (
                  "Pilih Konfederasi"
                )}
              </div>
              
              {showConfederationDropdown && (
                <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50">
                  {confederationsData.confederations.map((confederation) => (
                    <div
                      key={confederation.id}
                      className="p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                      onClick={() => handleConfederationSelect(confederation.name)}
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

            {selectedConfederation && (
              <div className="relative">
                <div 
                  className="w-full p-4 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-3"
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                >
                  {selectedTeam ? (
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={teamsData.teams.find(team => team.id === selectedTeam)?.icon} 
                          alt={teamsData.teams.find(team => team.id === selectedTeam)?.name} 
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "/placeholder.svg";
                          }}
                        />
                        <AvatarFallback>
                          {teamsData.teams.find(team => team.id === selectedTeam)?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{teamsData.teams.find(team => team.id === selectedTeam)?.name}</span>
                    </div>
                  ) : (
                    "Pilih Tim"
                  )}
                </div>
                
                {showTeamDropdown && (
                  <div className="absolute w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredTeams.map((team) => (
                      <div
                        key={team.id}
                        className="p-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                        onClick={() => handleTeamSelect(team.id)}
                      >
                        <Avatar className="w-8 h-8">
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

          <Button
            onClick={handleConfirm}
            disabled={!selectedTeam}
            className="w-full"
          >
            Konfirmasi Pemilihan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Career;

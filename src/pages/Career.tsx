
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import teamsData from "../data/teams.json";
import confederationsData from "../data/confederations.json";

// Qualification rounds configuration per confederation
const qualificationRounds = {
  "AFC": [
    { name: "Babak Pertama", teams: 12, qualification: 8 },
    { name: "Babak Kedua", teams: 40, qualification: 12 },
    { name: "Babak Ketiga", teams: 12, qualification: 4, playoff: 1 }
  ],
  "UEFA": [
    { name: "Fase Grup", teams: 55, qualification: 13 }
  ],
  "CONMEBOL": [
    { name: "Fase Liga", teams: 10, qualification: 4, playoff: 1 }
  ],
  "CONCACAF": [
    { name: "Babak Pertama", teams: 30, qualification: 6 },
    { name: "Babak Kedua", teams: 8, qualification: 3, playoff: 1 }
  ],
  "CAF": [
    { name: "Babak Pertama", teams: 28, qualification: 14 },
    { name: "Babak Kedua", teams: 14, qualification: 5 }
  ],
  "OFC": [
    { name: "Fase Grup", teams: 11, qualification: 1, playoff: 1 }
  ]
};

const Career = () => {
  const navigate = useNavigate();
  const [selectedConfederation, setSelectedConfederation] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showConfederationDropdown, setShowConfederationDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  
  // Career mode state
  const [careerStarted, setCareerStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [qualificationProgress, setQualificationProgress] = useState(0);
  const [worldCupQualified, setWorldCupQualified] = useState(false);

  const filteredTeams = teamsData.teams.filter(team => {
    const confederation = confederationsData.confederations.find(conf => conf.id === team.confederation);
    return confederation?.name === selectedConfederation;
  });

  const handleConfederationSelect = (confederation: string) => {
    setSelectedConfederation(confederation);
    setSelectedTeam("");
    setShowConfederationDropdown(false);
    // Reset career state when confederation changes
    setCareerStarted(false);
    setCurrentRound(0);
    setQualificationProgress(0);
    setWorldCupQualified(false);
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    setShowTeamDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedTeam && selectedConfederation) {
      const teamName = teamsData.teams.find(team => team.id === selectedTeam)?.name;
      toast.success(`Tim ${teamName} telah dipilih untuk mode karir!`);
      setCareerStarted(true);
      setQualificationProgress(0);
      setCurrentRound(0);
      setWorldCupQualified(false);
    } else {
      toast.error("Silahkan pilih konfederasi dan tim terlebih dahulu!");
    }
  };

  const simulateQualificationRound = () => {
    const confRounds = qualificationRounds[selectedConfederation as keyof typeof qualificationRounds] || [];
    
    if (currentRound >= confRounds.length) {
      // All rounds completed, qualified for World Cup
      setWorldCupQualified(true);
      toast.success("Selamat! Tim Anda telah lolos ke Piala Dunia!");
      return;
    }
    
    const round = confRounds[currentRound];
    const teamName = teamsData.teams.find(team => team.id === selectedTeam)?.name;
    const teamStrength = teamsData.teams.find(team => team.id === selectedTeam)?.serangan || 70;
    
    // Simple qualification simulation based on team strength
    const qualificationChance = Math.min(85, teamStrength + Math.random() * 20);
    const isQualified = qualificationChance > 65; // 65% threshold for qualification
    
    if (isQualified) {
      toast.success(`${teamName} berhasil lolos dari ${round.name}!`);
      setCurrentRound(currentRound + 1);
      // Calculate progress based on rounds completed
      const totalRounds = confRounds.length;
      setQualificationProgress(((currentRound + 1) / totalRounds) * 100);
    } else {
      toast.error(`${teamName} gagal lolos dari ${round.name}. Coba lagi tahun depan.`);
      // Reset career progress
      setCareerStarted(false);
      setCurrentRound(0);
      setQualificationProgress(0);
    }
  };

  const startWorldCup = () => {
    toast.success("Piala Dunia dimulai! Fitur ini akan datang segera.");
    // Future implementation: Navigate to World Cup tournament page
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
        
        {!careerStarted ? (
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
        ) : worldCupQualified ? (
          // World Cup stage
          <div className="space-y-6 animate-slide-in">
            <div className="bg-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-center mb-4">Piala Dunia</h2>
              <div className="text-center mb-6">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage 
                    src={teamsData.teams.find(team => team.id === selectedTeam)?.icon} 
                    alt={teamsData.teams.find(team => team.id === selectedTeam)?.name} 
                  />
                  <AvatarFallback>
                    {teamsData.teams.find(team => team.id === selectedTeam)?.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">
                  {teamsData.teams.find(team => team.id === selectedTeam)?.name}
                </h3>
                <div className="text-green-500 font-semibold mt-2">
                  Tim Anda telah lolos ke Piala Dunia!
                </div>
              </div>
              
              <Button 
                onClick={startWorldCup} 
                className="w-full"
              >
                Mulai Piala Dunia
              </Button>
            </div>
          </div>
        ) : (
          // Qualification stage
          <div className="space-y-6 animate-slide-in">
            <div className="bg-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-center mb-4">Kualifikasi Piala Dunia - {selectedConfederation}</h2>
              <div className="text-center mb-6">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage 
                    src={teamsData.teams.find(team => team.id === selectedTeam)?.icon} 
                    alt={teamsData.teams.find(team => team.id === selectedTeam)?.name} 
                  />
                  <AvatarFallback>
                    {teamsData.teams.find(team => team.id === selectedTeam)?.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">
                  {teamsData.teams.find(team => team.id === selectedTeam)?.name}
                </h3>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Kualifikasi Piala Dunia</span>
                  <span>{qualificationProgress}%</span>
                </div>
                <Progress value={qualificationProgress} className="w-full" />
              </div>
              
              {qualificationRounds[selectedConfederation as keyof typeof qualificationRounds] && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Tahapan Kualifikasi:</h3>
                  <div className="space-y-2">
                    {qualificationRounds[selectedConfederation as keyof typeof qualificationRounds].map((round, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg ${idx === currentRound ? 'bg-primary/20 font-medium' : 'bg-card/80'}`}
                      >
                        {round.name} - {round.qualification} tim lolos langsung 
                        {round.playoff ? `, ${round.playoff} tim ke playoff` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={simulateQualificationRound} 
                className="w-full"
              >
                Simulasi {qualificationRounds[selectedConfederation as keyof typeof qualificationRounds]?.[currentRound]?.name || "Kualifikasi"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Career;

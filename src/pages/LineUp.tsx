
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import teamsData from "../data/teams.json";
import playersData from "../data/players.json";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
  playerSide: string;
  selectedTeam: string;
}

const LineUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;

  if (!state) {
    navigate("/match");
    return null;
  }

  const { homeTeam, awayTeam, playerSide, selectedTeam } = state;
  
  const teamPlayers = playersData.players.filter(
    (player) => player.teamId === selectedTeam
  );

  const selectedTeamData = teamsData.teams.find(
    (team) => team.id === selectedTeam
  );

  const calculateOverall = (abilities: any) => {
    const values = Object.values(abilities) as number[];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const handlePlayerSelect = (playerId: string) => {
    const player = teamPlayers.find(p => p.id === playerId);
    if (!player) return;

    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
      return;
    }

    const hasGoalkeeper = selectedPlayers.some(id => 
      teamPlayers.find(p => p.id === id)?.position === "GK"
    );
    if (player.position === "GK" && hasGoalkeeper) {
      toast({
        title: "Kesalahan Pemilihan",
        description: "Anda hanya dapat memilih satu kiper",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlayers.length >= 11) {
      toast({
        title: "Kesalahan Pemilihan",
        description: "Anda hanya dapat memilih 11 pemain",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlayers(prev => [...prev, playerId]);
  };

  const handleConfirm = () => {
    const hasGoalkeeper = selectedPlayers.some(id => 
      teamPlayers.find(p => p.id === id)?.position === "GK"
    );

    if (selectedPlayers.length !== 11) {
      toast({
        title: "Kesalahan Pemilihan",
        description: "Anda harus memilih tepat 11 pemain",
        variant: "destructive"
      });
      return;
    }

    if (!hasGoalkeeper) {
      toast({
        title: "Kesalahan Pemilihan",
        description: "Anda harus memilih satu kiper",
        variant: "destructive"
      });
      return;
    }

    navigate("/tactics", {
      state: {
        homeTeam,
        awayTeam,
        selectedPlayers,
        playerSide
      }
    });
  };

  const handleBack = () => {
    if (location.state) {
      navigate("/match", { 
        state: { 
          homeTeam, 
          awayTeam,
          playerSide 
        } 
      });
    } else {
      navigate("/match");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Pemilihan Tim</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={selectedTeamData?.icon}
                alt={selectedTeamData?.name}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = "/placeholder.svg";
                }}
              />
              <AvatarFallback>
                {selectedTeamData?.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold">Skuad {selectedTeamData?.name}</h1>
          </div>
          <div className="text-lg">
            Terpilih: {selectedPlayers.length}/11
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamPlayers.map((player) => (
            <div
              key={player.id}
              className={`bg-card p-4 rounded-lg shadow-md transition-all cursor-pointer
                ${selectedPlayers.includes(player.id) 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-lg'}`}
              onClick={() => handlePlayerSelect(player.id)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={player.icon}
                    alt={player.name}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "/placeholder.svg";
                    }}
                  />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{player.position}</span>
                    {player.alternativePositions.length > 0 && (
                      <span>
                        ({player.alternativePositions.join(", ")})
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    Nilai: {calculateOverall(player.abilities)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleConfirm}
            disabled={selectedPlayers.length !== 11}
          >
            Konfirmasi Pemilihan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LineUp;

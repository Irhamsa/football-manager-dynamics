import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import teamsData from "../data/teams.json";
import playersData from "../data/players.json";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
  playerSide: string;
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

  const { homeTeam, awayTeam, playerSide } = state;
  const selectedTeamId = playerSide === "Home" ? homeTeam : awayTeam;
  const opponentTeamId = playerSide === "Home" ? awayTeam : homeTeam;
  
  const teamPlayers = playersData.players.filter(
    (player) => player.teamId === selectedTeamId
  );

  const selectedTeam = teamsData.teams.find(
    (team) => team.id === selectedTeamId
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

    // Check if we already have a goalkeeper
    const hasGoalkeeper = selectedPlayers.some(id => 
      teamPlayers.find(p => p.id === id)?.position === "GK"
    );
    if (player.position === "GK" && hasGoalkeeper) {
      toast({
        title: "Selection Error",
        description: "You can only select one goalkeeper",
        variant: "destructive"
      });
      return;
    }

    // Check if we have 11 players
    if (selectedPlayers.length >= 11) {
      toast({
        title: "Selection Error",
        description: "You can only select 11 players",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlayers(prev => [...prev, playerId]);
  };

  const handleConfirm = () => {
    // Check if we have exactly 11 players and one goalkeeper
    const hasGoalkeeper = selectedPlayers.some(id => 
      teamPlayers.find(p => p.id === id)?.position === "GK"
    );

    if (selectedPlayers.length !== 11 || !hasGoalkeeper) {
      toast({
        title: "Selection Error",
        description: "You must select exactly 11 players including one goalkeeper",
        variant: "destructive"
      });
      return;
    }

    // Navigate to simulation with selected players
    navigate("/simulation", {
      state: {
        selectedTeamId,
        opponentTeamId,
        selectedPlayers,
        playerSide
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <button
        onClick={() => navigate("/match")}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="max-w-4xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={selectedTeam?.icon} alt={selectedTeam?.name} />
              <AvatarFallback>
                {selectedTeam?.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold">{selectedTeam?.name} Squad</h1>
          </div>
          <div className="text-lg">
            Selected: {selectedPlayers.length}/11
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
                <Avatar>
                  <AvatarImage src={player.icon} alt={player.name} />
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
                    OVR: {calculateOverall(player.abilities)}
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
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LineUp;

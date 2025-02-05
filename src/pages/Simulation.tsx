import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home } from "lucide-react";
import teamsData from "../data/teams.json";
import playersData from "../data/players.json";

interface LocationState {
  selectedTeamId: string;
  opponentTeamId: string;
  selectedPlayers: string[];
  playerSide: string;
}

const Simulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameEvents, setGameEvents] = useState<string[]>([]);

  if (!state) {
    navigate("/match");
    return null;
  }

  const { selectedTeamId, opponentTeamId, selectedPlayers, playerSide } = state;

  const selectedTeam = teamsData.teams.find(team => team.id === selectedTeamId);
  const opponentTeam = teamsData.teams.find(team => team.id === opponentTeamId);

  // Get opponent team players and randomly select 11 including one GK
  const opponentPlayers = playersData.players.filter(p => p.teamId === opponentTeamId);
  const [aiSelectedPlayers] = useState(() => {
    const goalkeeper = opponentPlayers.find(p => p.position === "GK");
    const outfieldPlayers = opponentPlayers.filter(p => p.position !== "GK")
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    return goalkeeper ? [...outfieldPlayers, goalkeeper].map(p => p.id) : [];
  });

  const calculateTeamAttackOverall = (playerIds: string[]) => {
    const players = playerIds.map(id => playersData.players.find(p => p.id === id))
      .filter(p => p && (p.position.includes("ST") || p.position.includes("W") || p.position.includes("AM")));
    
    if (!players.length) return 0;
    
    return Math.round(players.reduce((acc, player) => {
      if (!player) return acc;
      return acc + (player.abilities.shooting + player.abilities.dribbling + player.abilities.pace) / 3;
    }, 0) / players.length);
  };

  const calculateTeamDefenseOverall = (playerIds: string[]) => {
    const players = playerIds.map(id => playersData.players.find(p => p.id === id))
      .filter(p => p && (p.position.includes("B") || p.position.includes("DM")));
    
    if (!players.length) return 0;
    
    return Math.round(players.reduce((acc, player) => {
      if (!player) return acc;
      return acc + (player.abilities.defending + player.abilities.physical) / 2;
    }, 0) / players.length);
  };

  const simulateAttack = (attackingTeam: string[], defendingTeam: string[]) => {
    const attackOverall = calculateTeamAttackOverall(attackingTeam);
    const defenseOverall = calculateTeamDefenseOverall(defendingTeam);
    
    // Add randomness factor to give lower-rated teams a chance
    const randomFactor = Math.random() * 30; // Increased randomness
    const upsetFactor = defenseOverall > attackOverall ? 10 : 0; // Bonus for underdogs
    
    const attackRoll = attackOverall + randomFactor;
    const defenseRoll = defenseOverall + randomFactor + upsetFactor;
    
    return attackRoll > defenseRoll;
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(() => {
      if (gameTime >= 90) {
        setIsPlaying(false);
        return;
      }

      setGameTime(prev => prev + 1);

      // Simulate attacks every few minutes
      if (gameTime % 5 === 0) {
        // Home team attack
        if (simulateAttack(
          playerSide === "Home" ? selectedPlayers : aiSelectedPlayers,
          playerSide === "Home" ? aiSelectedPlayers : selectedPlayers
        )) {
          setScore(prev => ({ ...prev, home: prev.home + 1 }));
          setGameEvents(prev => [...prev, `${gameTime}' Goal for ${selectedTeam?.name}!`]);
        }

        // Away team attack
        if (simulateAttack(
          playerSide === "Away" ? selectedPlayers : aiSelectedPlayers,
          playerSide === "Away" ? aiSelectedPlayers : selectedPlayers
        )) {
          setScore(prev => ({ ...prev, away: prev.away + 1 }));
          setGameEvents(prev => [...prev, `${gameTime}' Goal for ${opponentTeam?.name}!`]);
        }
      }
    }, 1000);

    return () => clearInterval(gameInterval);
  }, [isPlaying, gameTime]);

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

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Match Simulation</h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <span className="text-xl">{selectedTeam?.name}</span>
            <div className="text-6xl font-bold">
              {score.home} - {score.away}
            </div>
            <span className="text-xl">{opponentTeam?.name}</span>
          </div>
          <div className="text-xl mb-4">
            Time: {gameTime}'
          </div>
          {!isPlaying && gameTime === 0 && (
            <Button onClick={() => setIsPlaying(true)}>
              Start Match
            </Button>
          )}
          {isPlaying && (
            <Button onClick={() => setIsPlaying(false)}>
              Pause
            </Button>
          )}
        </div>

        <div className="bg-card p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Match Events</h2>
          <div className="space-y-2">
            {gameEvents.map((event, index) => (
              <div key={index} className="text-sm">
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
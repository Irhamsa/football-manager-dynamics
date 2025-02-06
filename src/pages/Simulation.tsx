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

interface GameEvent {
  minute: number;
  type: "goal" | "commentary";
  team: string;
  description: string;
  scorer?: string;
}

const Simulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);

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

  const getAttackers = (playerIds: string[]) => {
    return playerIds
      .map(id => playersData.players.find(p => p.id === id))
      .filter(p => p && (p.position === "ST" || p.position === "CF" || p.position === "RW" || p.position === "LW" || p.position === "CAM"))
      .map(p => p!);
  };

  const generateCommentary = (minute: number, type: "chance" | "possession" | "tackle") => {
    const commentaries = {
      chance: [
        "A great opportunity!",
        "That was close!",
        "They're threatening the goal!",
        "The keeper was beaten but it goes wide!",
        "A brilliant move but couldn't finish!"
      ],
      possession: [
        "Controlling the game well",
        "Beautiful passing display",
        "Dominating possession",
        "Keeping the ball well",
        "Patient build-up play"
      ],
      tackle: [
        "Great defensive work!",
        "Brilliant tackle!",
        "The defense stands strong",
        "They've won the ball back",
        "Solid defensive display"
      ]
    };
    
    const commentary = commentaries[type][Math.floor(Math.random() * commentaries[type].length)];
    return {
      minute,
      type: "commentary" as const,
      team: Math.random() > 0.5 ? selectedTeamId : opponentTeamId,
      description: commentary
    };
  };

  const calculateTeamStrength = (playerIds: string[]) => {
    const players = playerIds.map(id => playersData.players.find(p => p.id === id))
      .filter(p => p !== undefined);
    
    if (!players.length) return 0;
    
    // Calculate weighted average based on position and abilities
    return players.reduce((acc, player) => {
      if (!player) return acc;
      
      switch (player.position) {
        case "ST":
        case "CF":
          return acc + ((player.abilities.shooting * 3 + player.abilities.pace * 2 + player.abilities.dribbling) / 6);
        case "CAM":
        case "CM":
          return acc + ((player.abilities.passing * 3 + player.abilities.dribbling * 2 + player.abilities.shooting) / 6);
        case "CDM":
          return acc + ((player.abilities.defending * 3 + player.abilities.physical * 2 + player.abilities.passing) / 6);
        case "CB":
          return acc + ((player.abilities.defending * 3 + player.abilities.physical * 2 + player.abilities.pace) / 6);
        case "GK":
          return acc + ((player.abilities.defending * 4 + player.abilities.physical) / 5);
        default:
          return acc + Object.values(player.abilities).reduce((sum, val) => sum + val, 0) / 6;
      }
    }, 0) / players.length;
  };

  const simulateAttack = (attackingTeam: string[], defendingTeam: string[]) => {
    const attackingStrength = calculateTeamStrength(attackingTeam);
    const defendingStrength = calculateTeamStrength(defendingTeam);
    
    // Base probability calculation with more realistic values
    const strengthDifference = attackingStrength - defendingStrength;
    let baseProb = 0.08; // Reduced base probability to 8%
    
    // Adjust probability based on strength difference
    baseProb += (strengthDifference / 300); // Reduced impact of strength difference
    
    // Add small random factor (0-0.05)
    const randomFactor = Math.random() * 0.05;
    
    // Add underdog bonus
    const underdogBonus = defendingStrength > attackingStrength ? 0.03 : 0;
    
    // Final probability calculation with stricter limits
    const finalProb = Math.max(0.03, Math.min(0.15, baseProb + randomFactor + underdogBonus));
    
    return Math.random() < finalProb;
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(() => {
      if (gameTime >= 90) {
        setIsPlaying(false);
        return;
      }

      setGameTime(prev => prev + 1);

      // Add random commentary with reduced frequency
      if (Math.random() < 0.2) { // Reduced to 20% chance
        const commentaryType = ["chance", "possession", "tackle"][Math.floor(Math.random() * 3)] as "chance" | "possession" | "tackle";
        setGameEvents(prev => [...prev, generateCommentary(gameTime, commentaryType)]);
      }

      // Simulate attacks with reduced frequency
      if (Math.random() < 0.15) { // Reduced to 15% chance
        // Home team attack
        const homeAttackers = getAttackers(playerSide === "Home" ? selectedPlayers : aiSelectedPlayers);
        if (simulateAttack(
          playerSide === "Home" ? selectedPlayers : aiSelectedPlayers,
          playerSide === "Home" ? aiSelectedPlayers : selectedPlayers
        )) {
          const scorer = homeAttackers[Math.floor(Math.random() * homeAttackers.length)];
          if (scorer) {
            setScore(prev => ({ ...prev, home: prev.home + 1 }));
            setGameEvents(prev => [...prev, {
              minute: gameTime,
              type: "goal",
              team: playerSide === "Home" ? selectedTeamId : opponentTeamId,
              description: `GOAL! ${scorer.name} finds the back of the net!`,
              scorer: scorer.name
            }]);
          }
        }

        // Away team attack with slightly different timing
        if (Math.random() < 0.15) { // Independent chance for away team
          const awayAttackers = getAttackers(playerSide === "Away" ? selectedPlayers : aiSelectedPlayers);
          if (simulateAttack(
            playerSide === "Away" ? selectedPlayers : aiSelectedPlayers,
            playerSide === "Away" ? aiSelectedPlayers : selectedPlayers
          )) {
            const scorer = awayAttackers[Math.floor(Math.random() * awayAttackers.length)];
            if (scorer) {
              setScore(prev => ({ ...prev, away: prev.away + 1 }));
              setGameEvents(prev => [...prev, {
                minute: gameTime,
                type: "goal",
                team: playerSide === "Away" ? selectedTeamId : opponentTeamId,
                description: `GOAL! ${scorer.name} scores for ${playerSide === "Away" ? selectedTeam?.name : opponentTeam?.name}!`,
                scorer: scorer.name
              }]);
            }
          }
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
            <div className="text-center">
              <img src={selectedTeam?.icon} alt={selectedTeam?.name} className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl">{selectedTeam?.name}</span>
            </div>
            <div className="text-6xl font-bold">
              {score.home} - {score.away}
            </div>
            <div className="text-center">
              <img src={opponentTeam?.icon} alt={opponentTeam?.name} className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl">{opponentTeam?.name}</span>
            </div>
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
          <h2 className="text-xl font-bold mb-4">Match Commentary</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {gameEvents.map((event, index) => (
              <div 
                key={index} 
                className={`p-2 rounded ${
                  event.type === "goal" 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground"
                }`}
              >
                <span className="font-semibold">{event.minute}'</span> - {event.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
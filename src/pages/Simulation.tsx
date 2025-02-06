import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home } from "lucide-react";
import teamsData from "../data/teams.json";
import playersData from "../data/players.json";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
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

  const { homeTeam, awayTeam, selectedPlayers, playerSide } = state;

  const homeTeamData = teamsData.teams.find(team => team.id === homeTeam);
  const awayTeamData = teamsData.teams.find(team => team.id === awayTeam);

  const playerTeamId = playerSide === "Home" ? homeTeam : awayTeam;
  const aiTeamId = playerSide === "Home" ? awayTeam : homeTeam;

  const opponentPlayers = playersData.players.filter(p => p.teamId === aiTeamId);
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
      .filter(p => p && (p.position === "ST" || p.position === "CF" || p.position === "RW" || p.position === "LW" || p.position === "CAM" || p.position === "CM"))
      .map(p => p!);
  };

  const generateCommentary = (minute: number, type: "chance" | "possession" | "tackle") => {
    const commentaries = {
      chance: [
        "Peluang bagus!",
        "Hampir saja!",
        "Mereka mengancam gawang!",
        "Kiper terlewati tapi melebar!",
        "Gerakan brilian tapi tidak berhasil!"
      ],
      possession: [
        "Mengontrol permainan dengan baik",
        "Passing yang indah",
        "Mendominasi penguasaan bola",
        "Menjaga bola dengan baik",
        "Membangun serangan dengan sabar"
      ],
      tackle: [
        "Pertahanan yang bagus!",
        "Tekel brilian!",
        "Pertahanan berdiri kokoh",
        "Mereka berhasil merebut bola",
        "Pertahanan yang solid"
      ]
    };
    
    const commentary = commentaries[type][Math.floor(Math.random() * commentaries[type].length)];
    return {
      minute,
      type: "commentary" as const,
      team: Math.random() > 0.5 ? playerTeamId : aiTeamId,
      description: commentary
    };
  };

  const calculateTeamStrength = (playerIds: string[]) => {
    const players = playerIds.map(id => playersData.players.find(p => p.id === id))
      .filter(p => p !== undefined);
    
    if (!players.length) return 0;
    
    return players.reduce((acc, player) => {
      if (!player) return acc;
      
      switch (player.position) {
        case "ST":
          return acc + ((player.abilities.shooting * 3 + player.abilities.pace * 2 + player.abilities.dribbling + player.abilities.physical) / 6);
        case "CF":
          return acc + ((player.abilities.shooting * 3 + player.abilities.pace * 2 + player.abilities.passing + player.abilities.physical) / 6);
        case "RW":
        case "LW":
          return acc + ((player.abilities.pace * 3 + player.abilities.dribbling * 2 + player.abilities.physical + player.abilities.passing) / 6);
        case "CAM":
        case "CM":
          return acc + ((player.abilities.passing * 3 + player.abilities.dribbling * 2 + player.abilities.shooting) / 6);
        case "CDM":
          return acc + ((player.abilities.defending * 3 + player.abilities.physical * 2 + player.abilities.passing) / 6);
        case "CB":
          return acc + ((player.abilities.defending * 3 + player.abilities.physical * 2 + player.abilities.positioning + (player.abilities.pace / 2)) / 6);
        case "LB":
        case "RB":
          return acc + ((player.abilities.pace * 3 + player.abilities.physical * 2 + player.abilities.defending + (player.abilities.passing / 2) + (player.abilities.dribbling / 3)) / 6);
        case "GK":
          return acc + ((player.abilities.reflexes * 4 + player.abilities.positioning + player.abilities.handling + player.abilities.diving) / 5);
        default:
          return acc + Object.values(player.abilities).reduce((sum, val) => sum + val, 0) / 6;
      }
    }, 0) / players.length;
  };

  const simulateAttack = (attackingTeam: string[], defendingTeam: string[]) => {
    const attackingStrength = calculateTeamStrength(attackingTeam);
    const defendingStrength = calculateTeamStrength(defendingTeam);
    
    const strengthDifference = attackingStrength - defendingStrength;
    let baseProb = 0.08;
    
    baseProb += (strengthDifference / 300);
    
    const randomFactor = Math.random() * 0.05;
    
    const underdogBonus = defendingStrength > attackingStrength ? 0.03 : 0;
    
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

      if (Math.random() < 0.2) {
        const commentaryType = ["chance", "possession", "tackle"][Math.floor(Math.random() * 3)] as "chance" | "possession" | "tackle";
        setGameEvents(prev => [...prev, generateCommentary(gameTime, commentaryType)]);
      }

      if (Math.random() < 0.15) {
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
              team: playerSide === "Home" ? playerTeamId : aiTeamId,
              description: `GOL! ${scorer.name} berhasil mencatatkan namanya di papan skor!`,
              scorer: scorer.name
            }]);
          }
        }

        if (Math.random() < 0.15) {
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
                team: playerSide === "Away" ? playerTeamId : aiTeamId,
                description: `GOL! ${scorer.name} mencetak gol untuk ${playerSide === "Away" ? awayTeamData?.name : homeTeamData?.name}!`,
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

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Simulasi Pertandingan</h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className={`text-center ${playerSide === "Home" ? "text-yellow-400" : ""}`}>
              <img src={homeTeamData?.icon} alt={homeTeamData?.name} className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl">{homeTeamData?.name}</span>
            </div>
            <div className="text-6xl font-bold">
              {score.home} - {score.away}
            </div>
            <div className={`text-center ${playerSide === "Away" ? "text-yellow-400" : ""}`}>
              <img src={awayTeamData?.icon} alt={awayTeamData?.name} className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl">{awayTeamData?.name}</span>
            </div>
          </div>
          <div className="text-xl mb-4">
            Waktu: {gameTime}'
          </div>
          {!isPlaying && gameTime === 0 && (
            <Button onClick={() => setIsPlaying(true)}>
              Mulai Pertandingan
            </Button>
          )}
          {isPlaying && (
            <Button onClick={() => setIsPlaying(false)}>
              Jeda
            </Button>
          )}
        </div>

        <div className="bg-card p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Komentar Pertandingan</h2>
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
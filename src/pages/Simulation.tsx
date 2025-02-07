import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import teamsData from "../data/teams.json";
import playersData from "../data/players.json";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
  selectedPlayers: string[];
  playerSide: string;
  formation: { strength: number };
  tactics: any;
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

  const { homeTeam, awayTeam, selectedPlayers, playerSide, formation, tactics } = state;

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

  const generateCommentary = (minute: number, type: "chance" | "possession" | "tackle", homeTeam: string, awayTeam: string, playerSide: string) => {
    const teamCommentaries = {
      home: {
        chance: [
          `${homeTeam} menciptakan peluang emas melalui serangan yang terstruktur!`,
          `Pergerakan dinamis dari para pemain ${homeTeam}!`,
          `${homeTeam} mengancam pertahanan lawan dengan kombinasi passing yang apik!`,
          `Serangan berbahaya dari ${homeTeam} melalui sayap!`,
          `${homeTeam} membangun serangan dengan sangat baik!`
        ],
        possession: [
          `${homeTeam} mendominasi penguasaan bola dengan passing pendek yang presisi`,
          `Permainan posesif yang ditunjukkan ${homeTeam} sangat efektif`,
          `${homeTeam} dengan sabar membangun serangan dari lini belakang`,
          `Kontrol bola yang sempurna dari para pemain ${homeTeam}`,
          `${homeTeam} mendikte jalannya pertandingan dengan penguasaan bola yang baik`
        ],
        tackle: [
          `Pertahanan solid dari barisan belakang ${homeTeam}!`,
          `Tekel brilian dari defender ${homeTeam}!`,
          `${homeTeam} berhasil mematahkan serangan dengan timing yang tepat`,
          `Organisasi pertahanan ${homeTeam} sangat rapi`,
          `${homeTeam} sukses mengamankan pertahanan mereka!`
        ]
      },
      away: {
        chance: [
          `${awayTeam} mengancam melalui serangan balik yang cepat!`,
          `Peluang bagus tercipta untuk ${awayTeam}!`,
          `${awayTeam} hampir membuat kejutan dengan serangan mendadak!`,
          `Pergerakan tanpa bola yang berbahaya dari ${awayTeam}!`,
          `${awayTeam} menciptakan kesempatan mencetak gol!`
        ],
        possession: [
          `${awayTeam} mulai menguasai jalannya permainan`,
          `Rotasi bola yang bagus dari ${awayTeam}`,
          `${awayTeam} bermain dengan tempo yang terkontrol`,
          `Distribusi bola yang akurat dari lini tengah ${awayTeam}`,
          `${awayTeam} berhasil mengatur ritme permainan`
        ],
        tackle: [
          `Antisipasi sempurna dari pertahanan ${awayTeam}!`,
          `${awayTeam} bermain disiplin di lini belakang!`,
          `Pressing agresif dari para pemain ${awayTeam}!`,
          `${awayTeam} menunjukkan pertahanan yang kompak`,
          `Lini belakang ${awayTeam} bermain dengan sangat baik!`
        ]
      }
    };
    
    const team = Math.random() > 0.5 ? 'home' : 'away';
    const commentary = teamCommentaries[team][type][Math.floor(Math.random() * teamCommentaries[team][type].length)];
    
    return {
      minute,
      type: "commentary" as const,
      team: team === 'home' ? homeTeam : awayTeam,
      description: commentary
    };
  };

  const calculateTeamStrength = (playerIds: string[], tactic: any) => {
    const baseStrength = playerIds
      .map(id => playersData.players.find(p => p.id === id))
      .filter(p => p !== undefined)
      .reduce((acc, player) => {
        if (!player) return acc;
        
        const positionBonus = {
          "ST": tactic.attributes.counter * 0.3 + tactic.attributes.possession * 0.1,
          "CF": tactic.attributes.possession * 0.2 + tactic.attributes.passing * 0.2,
          "RW": tactic.attributes.counter * 0.2 + tactic.attributes.pressure * 0.2,
          "LW": tactic.attributes.counter * 0.2 + tactic.attributes.pressure * 0.2,
          "CAM": tactic.attributes.passing * 0.3 + tactic.attributes.possession * 0.2,
          "CM": tactic.attributes.passing * 0.25 + tactic.attributes.possession * 0.25,
          "CDM": tactic.attributes.defensive * 0.3 + tactic.attributes.pressure * 0.2,
          "CB": tactic.attributes.defensive * 0.4,
          "LB": tactic.attributes.pressure * 0.2 + tactic.attributes.counter * 0.1,
          "RB": tactic.attributes.pressure * 0.2 + tactic.attributes.counter * 0.1,
          "GK": tactic.attributes.defensive * 0.2
        }[player.position] || 0;

        return acc + (
          Object.values(player.abilities).reduce((sum, val) => sum + val, 0) / 6
        ) * (1 + positionBonus);
      }, 0) / playerIds.length;

    return baseStrength;
  };

  const simulateAttack = (
    attackingTeam: string[], 
    defendingTeam: string[], 
    attackingTactics: any, 
    defendingTactics: any
  ) => {
    const BASE_GOAL_CHANCE = 0.08;
    
    // Pengaruh taktik pada peluang gol
    const attackingModifier = (
      (attackingTactics.settings.mentality / 100) * 0.1 +
      (attackingTactics.settings.attackStyle / 100) * 0.1 +
      (attackingTactics.settings.attackTempo / 100) * 0.1 +
      (attackingTactics.settings.risk / 100) * 0.05
    );

    const defendingModifier = (
      (defendingTactics.settings.defenseLine / 100) * 0.1 +
      (defendingTactics.settings.marking / 100) * 0.1 +
      (defendingTactics.settings.defenseStyle / 100) * 0.1 +
      (defendingTactics.settings.pressing / 100) * 0.05
    );

    // Faktor acak untuk menambah ketidakpastian
    const randomFactor = (Math.random() - 0.5) * 0.1;

    const finalChance = BASE_GOAL_CHANCE + 
      attackingModifier - 
      defendingModifier + 
      randomFactor;

    return Math.random() < Math.max(0.01, Math.min(0.2, finalChance));
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(() => {
      if (gameTime >= 90) {
        setIsPlaying(false);
        toast({
          title: "Pertandingan Selesai",
          description: "Pertandingan telah berakhir!",
        });
        setTimeout(() => {
          navigate("/match");
        }, 3000);
        return;
      }

      setGameTime(prev => prev + 1);

      if (Math.random() < 0.2) {
        const commentaryType = ["chance", "possession", "tackle"][Math.floor(Math.random() * 3)] as "chance" | "possession" | "tackle";
        setGameEvents(prev => [...prev, generateCommentary(gameTime, commentaryType, homeTeam, awayTeam, playerSide)]);
      }

      if (Math.random() < 0.15) {
        const homeAttackers = getAttackers(playerSide === "Home" ? selectedPlayers : aiSelectedPlayers);
        if (simulateAttack(
          playerSide === "Home" ? selectedPlayers : aiSelectedPlayers,
          playerSide === "Home" ? aiSelectedPlayers : selectedPlayers,
          tactics.home,
          tactics.away
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
            playerSide === "Away" ? aiSelectedPlayers : selectedPlayers,
            tactics.away,
            tactics.home
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
              <Avatar>
                <AvatarImage 
                  src={homeTeamData?.icon} 
                  alt={homeTeamData?.name}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "/placeholder.svg";
                  }}
                />
                <AvatarFallback>{homeTeamData?.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-xl">{homeTeamData?.name}</span>
            </div>
            <div className="text-6xl font-bold">
              {score.home} - {score.away}
            </div>
            <div className={`text-center ${playerSide === "Away" ? "text-yellow-400" : ""}`}>
              <Avatar>
                <AvatarImage 
                  src={awayTeamData?.icon} 
                  alt={awayTeamData?.name}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "/placeholder.svg";
                  }}
                />
                <AvatarFallback>{awayTeamData?.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
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

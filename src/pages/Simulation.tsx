import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, Play, Pause } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import teamsData from "../data/teams.json";
import playersData from "../data/players.json";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
  playerSide: string;
  tactics: {
    home: Record<string, number>;
    away: Record<string, number>;
    homeStrength: number;
    awayStrength: number;
  };
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
  const [gameEnded, setGameEnded] = useState(false);

  if (!state) {
    navigate("/match");
    return null;
  }

  const { homeTeam, awayTeam, playerSide, tactics } = state;

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

  const generateCommentary = (minute: number, type: "chance" | "possession" | "tackle", homeTeamName: string, awayTeamName: string, playerSide: string) => {
    const teamCommentaries = {
      home: {
        chance: [
          `${homeTeamName} menciptakan peluang emas melalui serangan yang terstruktur!`,
          `Pergerakan dinamis dari para pemain ${homeTeamName}!`,
          `${homeTeamName} mengancam pertahanan lawan dengan kombinasi passing yang apik!`,
          `Serangan berbahaya dari ${homeTeamName} melalui sayap!`,
          `${homeTeamName} membangun serangan dengan sangat baik!`
        ],
        possession: [
          `${homeTeamName} mendominasi penguasaan bola dengan passing pendek yang presisi`,
          `Permainan posesif yang ditunjukkan ${homeTeamName} sangat efektif`,
          `${homeTeamName} dengan sabar membangun serangan dari lini belakang`,
          `Kontrol bola yang sempurna dari para pemain ${homeTeamName}`,
          `${homeTeamName} mendikte jalannya pertandingan dengan penguasaan bola yang baik`
        ],
        tackle: [
          `Pertahanan solid dari barisan belakang ${homeTeamName}!`,
          `Tekel brilian dari defender ${homeTeamName}!`,
          `${homeTeamName} berhasil mematahkan serangan dengan timing yang tepat`,
          `Organisasi pertahanan ${homeTeamName} sangat rapi`,
          `${homeTeamName} sukses mengamankan pertahanan mereka!`
        ]
      },
      away: {
        chance: [
          `${awayTeamName} mengancam melalui serangan balik yang cepat!`,
          `Peluang bagus tercipta untuk ${awayTeamName}!`,
          `${awayTeamName} hampir membuat kejutan dengan serangan mendadak!`,
          `Pergerakan tanpa bola yang berbahaya dari ${awayTeamName}!`,
          `${awayTeamName} menciptakan kesempatan mencetak gol!`
        ],
        possession: [
          `${awayTeamName} mulai menguasai jalannya permainan`,
          `Rotasi bola yang bagus dari ${awayTeamName}`,
          `${awayTeamName} bermain dengan tempo yang terkontrol`,
          `Distribusi bola yang akurat dari lini tengah ${awayTeamName}`,
          `${awayTeamName} berhasil mengatur ritme permainan`
        ],
        tackle: [
          `Antisipasi sempurna dari pertahanan ${awayTeamName}!`,
          `${awayTeamName} bermain disiplin di lini belakang!`,
          `Pressing agresif dari para pemain ${awayTeamName}!`,
          `${awayTeamName} menunjukkan pertahanan yang kompak`,
          `${awayTeamName} lini belakang bermain dengan sangat baik!`
        ]
      }
    };
    
    const team = Math.random() > 0.5 ? 'home' : 'away';
    const commentary = teamCommentaries[team][type][Math.floor(Math.random() * teamCommentaries[team][type].length)];
    
    return {
      minute,
      type: "commentary" as const,
      team: team === 'home' ? homeTeamData?.name || "" : awayTeamData?.name || "",
      description: commentary
    };
  };

  const calculateTacticStrength = (settings: Record<string, number>) => {
    const weights = {
      tempo: 0.05,
      playStyle: 0.05,
      attackTempo: 0.08,
      defenseLine: 0.07,
      attackStyle: 0.08,
      defenseStyle: 0.07,
      mentality: 0.1,
      playerDistance: 0.05,
      pressing: 0.07,
      marking: 0.07,
      possession: 0.1,
      width: 0.05,
      crossFrequency: 0.03,
      longShots: 0.03,
      dribbling: 0.05,
      offsideTrap: 0.03,
      counterAttack: 0.05,
      setPieces: 0.02,
      playmaking: 0.07,
      risk: 0.05
    };

    return Object.entries(settings).reduce((strength, [setting, value]) => {
      return strength + (value / 100) * (weights[setting as keyof typeof weights] || 0);
    }, 0);
  };

  const simulateAttack = (
    attackingTeamName: string,
    defendingTeamName: string,
    attackingTactics: Record<string, number>,
    defendingTactics: Record<string, number>,
    attackingStrength: number,
    defendingStrength: number
  ) => {
    const BASE_GOAL_CHANCE = 0.1;
    
    const attackingTeam = teamsData.teams.find(team => team.name === attackingTeamName);
    const defendingTeam = teamsData.teams.find(team => team.name === defendingTeamName);
    
    if (!attackingTeam || !defendingTeam) return false;

    const attackingModifier = (
      (attackingTactics.mentality / 100) * 0.15 +
      (attackingTactics.attackStyle / 100) * 0.15 +
      (attackingTactics.attackTempo / 100) * 0.1 +
      (attackingTactics.risk / 100) * 0.1 +
      (attackingTactics.playmaking / 100) * 0.1 +
      (attackingTactics.counterAttack / 100) * 0.1 +
      (attackingTactics.crossFrequency / 100) * 0.05 +
      (attackingTactics.longShots / 100) * 0.05 +
      (attackingTactics.dribbling / 100) * 0.1 +
      (attackingTactics.width / 100) * 0.05 +
      (attackingTeam.serangan / 100) * 0.2 +
      (attackingTeam.possession / 100) * 0.1
    );

    const defendingModifier = (
      (defendingTactics.defenseLine / 100) * 0.15 +
      (defendingTactics.marking / 100) * 0.15 +
      (defendingTactics.defenseStyle / 100) * 0.1 +
      (defendingTactics.pressing / 100) * 0.1 +
      (defendingTactics.playerDistance / 100) * 0.1 +
      (defendingTactics.offsideTrap / 100) * 0.1 +
      (defendingTeam.defense / 100) * 0.2 +
      ((100 - defendingTactics.risk) / 100) * 0.1
    );

    const possessionInfluence = (
      (attackingTeam.possession / 100) * 0.3 +
      (attackingTactics.possession / 100) * 0.2 +
      (attackingTactics.playStyle / 100) * 0.2 +
      ((100 - defendingTactics.pressing) / 100) * 0.15 +
      ((100 - defendingTeam.defense) / 100) * 0.15
    );

    const tacticalBonus = Math.min(0.1, Math.max(-0.1, 
      attackingModifier - defendingModifier + 
      (possessionInfluence * 0.2)
    ));

    const teamStrengthDifference = (
      (attackingTeam.serangan + attackingTeam.possession) / 2 -
      (defendingTeam.defense + defendingTeam.possession) / 2
    ) / 100 * 0.1;

    const randomFactor = (Math.random() - 0.5) * 0.1;

    const finalChance = BASE_GOAL_CHANCE + 
      tacticalBonus + 
      teamStrengthDifference + 
      randomFactor;

    return Math.random() < Math.max(0.05, Math.min(0.3, finalChance));
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(() => {
      if (gameTime >= 90) {
        setIsPlaying(false);
        setGameEnded(true);
        toast({
          title: "Pertandingan Selesai",
          description: "Pertandingan telah berakhir!",
        });
        return;
      }

      setGameTime(prev => prev + 1);

      if (Math.random() < 0.25) {
        const commentaryType = ["chance", "possession", "tackle"][Math.floor(Math.random() * 3)] as "chance" | "possession" | "tackle";
        setGameEvents(prev => [
          ...prev, 
          generateCommentary(
            gameTime, 
            commentaryType, 
            homeTeamData?.name || "", 
            awayTeamData?.name || "", 
            playerSide
          )
        ]);
      }

      const homeAttackChance = Math.random() < (
        0.15 + 
        (state.tactics.home.mentality / 1000) + 
        (homeTeamData?.possession || 0) / 1000
      );
      
      const awayAttackChance = Math.random() < (
        0.15 + 
        (state.tactics.away.mentality / 1000) + 
        (awayTeamData?.possession || 0) / 1000
      );

      if (homeAttackChance) {
        if (simulateAttack(
          homeTeamData?.name || "",
          awayTeamData?.name || "",
          state.tactics.home,
          state.tactics.away,
          state.tactics.homeStrength,
          state.tactics.awayStrength
        )) {
          setScore(prev => ({ ...prev, home: prev.home + 1 }));
          setGameEvents(prev => [...prev, {
            minute: gameTime,
            type: "goal",
            team: homeTeamData?.name || "",
            description: `GOL! ${homeTeamData?.name} berhasil mencetak gol!`,
          }]);
        }
      }

      if (awayAttackChance) {
        if (simulateAttack(
          awayTeamData?.name || "",
          homeTeamData?.name || "",
          state.tactics.away,
          state.tactics.home,
          state.tactics.awayStrength,
          state.tactics.homeStrength
        )) {
          setScore(prev => ({ ...prev, away: prev.away + 1 }));
          setGameEvents(prev => [...prev, {
            minute: gameTime,
            type: "goal",
            team: awayTeamData?.name || "",
            description: `GOL! ${awayTeamData?.name} mencetak gol!`,
          }]);
        }
      }
    }, 1000);

    return () => clearInterval(gameInterval);
  }, [isPlaying, gameTime]);

  const handleBack = () => {
    navigate("/tactics", {
      state: {
        homeTeam,
        awayTeam,
        playerSide
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Taktik</span>
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
              <Avatar className="w-20 h-20 mx-auto mb-2">
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
              <span className="text-xl block font-medium">{homeTeamData?.name}</span>
            </div>
            <div className="text-6xl font-bold px-8">
              {score.home} - {score.away}
            </div>
            <div className={`text-center ${playerSide === "Away" ? "text-yellow-400" : ""}`}>
              <Avatar className="w-20 h-20 mx-auto mb-2">
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
              <span className="text-xl block font-medium">{awayTeamData?.name}</span>
            </div>
          </div>
          <div className="text-xl mb-4">
            Waktu: {gameTime}'
          </div>
          {!isPlaying && gameTime === 0 && (
            <Button onClick={() => setIsPlaying(true)}>
              <Play className="w-4 h-4 mr-2" />
              Mulai Pertandingan
            </Button>
          )}
          {isPlaying && (
            <Button onClick={() => setIsPlaying(false)}>
              <Pause className="w-4 h-4 mr-2" />
              Jeda
            </Button>
          )}
          {!isPlaying && gameTime > 0 && !gameEnded && (
            <Button onClick={() => setIsPlaying(true)}>
              <Play className="w-4 h-4 mr-2" />
              Lanjutkan
            </Button>
          )}
          {gameEnded && (
            <Button onClick={() => navigate("/match")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pemilihan Tim
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

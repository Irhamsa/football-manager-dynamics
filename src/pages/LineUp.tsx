import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const state = location.state as LocationState;

  if (!state) {
    navigate("/match");
    return null;
  }

  const { homeTeam, awayTeam, playerSide } = state;
  const selectedTeamId = playerSide === "Home" ? homeTeam : awayTeam;
  
  const teamPlayers = playersData.players.filter(
    (player) => player.teamId === selectedTeamId
  );

  const selectedTeam = teamsData.teams.find(
    (team) => team.id === selectedTeamId
  );

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
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16">
            <AvatarImage src={selectedTeam?.icon} alt={selectedTeam?.name} />
            <AvatarFallback>
              {selectedTeam?.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{selectedTeam?.name} Squad</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
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
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>Pace: {player.abilities.pace}</div>
                <div>Shooting: {player.abilities.shooting}</div>
                <div>Passing: {player.abilities.passing}</div>
                <div>Dribbling: {player.abilities.dribbling}</div>
                <div>Defending: {player.abilities.defending}</div>
                <div>Physical: {player.abilities.physical}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineUp;
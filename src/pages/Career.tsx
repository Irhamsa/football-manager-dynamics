import { ArrowLeft, Home, Trophy, Calendar, Users, ChevronRight, Table, Play } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import teamsData from "../data/teams.json";
import confederationsData from "../data/confederations.json";
import playersData from "../data/players.json";

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

// Interface for match data
interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  played: boolean;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  matchType: string;
  leg: 1 | 2; // 1st or 2nd leg
  matchPair: string; // ID to link the two legs of the same fixture
}

// Interface for group standings
interface TeamStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

// Group structure
interface Group {
  name: string;
  teams: string[]; // Team IDs
  standings: TeamStanding[];
  matches: Match[];
}

const Career = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConfederation, setSelectedConfederation] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showConfederationDropdown, setShowConfederationDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  
  // Career mode state
  const [careerStarted, setCareerStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [qualificationProgress, setQualificationProgress] = useState(0);
  const [worldCupQualified, setWorldCupQualified] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(2026);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  
  // Match simulation state 
  const [matchSchedule, setMatchSchedule] = useState<Match[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  // Groups and standings state
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // Handle match results from Simulation page
  useEffect(() => {
    const state = location.state as any;
    if (state?.resumeCareer && state?.matchResult) {
      const result = state.matchResult;
      
      // Update match in schedule
      const updatedSchedule = matchSchedule.map(match => {
        if (match.id === result.matchId) {
          return {
            ...match,
            played: true,
            homeScore: result.homeScore,
            awayScore: result.awayScore
          };
        }
        return match;
      });
      
      setMatchSchedule(updatedSchedule);
      
      // Update group standings if in group stage
      if (currentGroup) {
        updateGroupStandings(result.matchId, result.homeScore, result.awayScore);
      }
      
      // Clear location state to prevent re-processing
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredTeams = teamsData.teams.filter(team => {
    const confederation = confederationsData.confederations.find(conf => conf.id === team.confederation);
    return confederation?.name === selectedConfederation;
  });

  useEffect(() => {
    if (selectedTeam) {
      // Load team players
      const players = playersData.players.filter(player => player.teamId === selectedTeam);
      setTeamPlayers(players);
    }
  }, [selectedTeam]);

  const handleConfederationSelect = (confederation: string) => {
    setSelectedConfederation(confederation);
    setSelectedTeam("");
    setShowConfederationDropdown(false);
    // Reset career state when confederation changes
    setCareerStarted(false);
    setCurrentRound(0);
    setQualificationProgress(0);
    setWorldCupQualified(false);
    setGroups([]);
    setCurrentGroup(null);
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
      setGroups([]);
      
      // Check if confederation uses group format
      const confRounds = qualificationRounds[selectedConfederation as keyof typeof qualificationRounds] || [];
      const currentRoundData = confRounds[currentRound];
      
      if (currentRoundData && (selectedConfederation === "UEFA" || selectedConfederation === "OFC")) {
        // Setup group stage
        generateGroups();
      } else {
        // Setup two-legged fixtures
        generateQualificationMatches();
      }
    } else {
      toast.error("Silahkan pilih konfederasi dan tim terlebih dahulu!");
    }
  };

  // Generate qualification groups for UEFA and OFC
  const generateGroups = () => {
    // For simplicity, let's create just one group with 4 teams including the player's team
    const potentialOpponents = teamsData.teams.filter(team => {
      const teamConf = confederationsData.confederations.find(conf => conf.id === team.confederation);
      return (teamConf?.name === selectedConfederation) && (team.id !== selectedTeam);
    });
    
    // Select 3 random opponents
    const groupOpponents = [...potentialOpponents]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    const groupTeams = [selectedTeam, ...groupOpponents.map(t => t.id)];
    
    // Initialize standings
    const standings: TeamStanding[] = groupTeams.map(teamId => ({
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    }));
    
    // Generate home and away matches for each team against all others
    const matches: Match[] = [];
    let matchIdCounter = 1;
    
    // For each team
    for (let i = 0; i < groupTeams.length; i++) {
      // Against each other team
      for (let j = 0; j < groupTeams.length; j++) {
        if (i !== j) {
          // Create unique ID for match pair to link the two legs
          const matchPairId = `pair_${Math.min(i, j)}_${Math.max(i, j)}`;
          
          // First leg - home
          matches.push({
            id: `match_${matchIdCounter++}`,
            homeTeam: groupTeams[i],
            awayTeam: groupTeams[j],
            played: false,
            homeScore: null,
            awayScore: null,
            round: currentRound + 1,
            matchType: "group",
            leg: 1,
            matchPair: matchPairId
          });
          
          // Second leg - away
          matches.push({
            id: `match_${matchIdCounter++}`,
            homeTeam: groupTeams[j],
            awayTeam: groupTeams[i],
            played: false,
            homeScore: null,
            awayScore: null,
            round: currentRound + 1,
            matchType: "group",
            leg: 2,
            matchPair: matchPairId
          });
        }
      }
    }
    
    // Create the group
    const newGroup: Group = {
      name: "Grup A",
      teams: groupTeams,
      standings,
      matches
    };
    
    setGroups([newGroup]);
    setCurrentGroup(newGroup);
    setMatchSchedule(matches);
  };

  // Update standings after a match is played
  const updateGroupStandings = (matchId: string, homeScore: number, awayScore: number) => {
    if (!currentGroup) return;
    
    // Find the match that was just played
    const matchPlayed = currentGroup.matches.find(m => m.id === matchId);
    if (!matchPlayed) return;
    
    // Make a copy of current standings
    const updatedStandings = [...currentGroup.standings];
    
    // Update home team stats
    const homeTeamStanding = updatedStandings.find(s => s.teamId === matchPlayed.homeTeam);
    if (homeTeamStanding) {
      homeTeamStanding.played += 1;
      homeTeamStanding.goalsFor += homeScore;
      homeTeamStanding.goalsAgainst += awayScore;
      
      if (homeScore > awayScore) {
        homeTeamStanding.won += 1;
        homeTeamStanding.points += 3;
      } else if (homeScore === awayScore) {
        homeTeamStanding.drawn += 1;
        homeTeamStanding.points += 1;
      } else {
        homeTeamStanding.lost += 1;
      }
    }
    
    // Update away team stats
    const awayTeamStanding = updatedStandings.find(s => s.teamId === matchPlayed.awayTeam);
    if (awayTeamStanding) {
      awayTeamStanding.played += 1;
      awayTeamStanding.goalsFor += awayScore;
      awayTeamStanding.goalsAgainst += homeScore;
      
      if (awayScore > homeScore) {
        awayTeamStanding.won += 1;
        awayTeamStanding.points += 3;
      } else if (awayScore === homeScore) {
        awayTeamStanding.drawn += 1;
        awayTeamStanding.points += 1;
      } else {
        awayTeamStanding.lost += 1;
      }
    }
    
    // Sort standings by points, then goal difference, then goals scored
    updatedStandings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (aGD !== bGD) return bGD - aGD;
      return b.goalsFor - a.goalsFor;
    });
    
    // Update the group with new standings
    const updatedGroup = {
      ...currentGroup,
      standings: updatedStandings
    };
    
    setCurrentGroup(updatedGroup);
    
    // Update the group in the groups array
    const updatedGroups = groups.map(g => 
      g.name === updatedGroup.name ? updatedGroup : g
    );
    
    setGroups(updatedGroups);
    
    // Check if all group matches are played
    const allMatchesPlayed = updatedGroup.matches.every(m => m.played);
    if (allMatchesPlayed) {
      // Check if player's team qualified (top 2 in group)
      const playerTeamPosition = updatedStandings.findIndex(s => s.teamId === selectedTeam);
      if (playerTeamPosition === 0 || playerTeamPosition === 1) {
        toast.success("Tim Anda telah lolos ke babak berikutnya!");
        setCurrentRound(currentRound + 1);
        // Calculate progress
        const confRounds = qualificationRounds[selectedConfederation as keyof typeof qualificationRounds] || [];
        const totalRounds = confRounds.length;
        setQualificationProgress(((currentRound + 1) / totalRounds) * 100);
        
        if (currentRound + 1 >= totalRounds) {
          setWorldCupQualified(true);
        } else {
          // Generate next round matches
          generateQualificationMatches();
        }
      } else {
        toast.error("Tim Anda gagal lolos dari grup. Coba lagi tahun depan.");
        // Reset career progress
        setCareerStarted(false);
        setCurrentRound(0);
        setQualificationProgress(0);
      }
    }
  };

  const generateQualificationMatches = () => {
    const confRounds = qualificationRounds[selectedConfederation as keyof typeof qualificationRounds] || [];
    const currentRoundData = confRounds[currentRound];
    
    if (!currentRoundData) return;
    
    // Filter teams from the same confederation
    const potentialOpponents = teamsData.teams.filter(team => {
      const teamConf = confederationsData.confederations.find(conf => conf.id === team.confederation);
      return (teamConf?.name === selectedConfederation) && (team.id !== selectedTeam);
    });
    
    // For knockout rounds, create fewer matches (3 pairs = 6 matches for simplicity)
    const matchCount = 3;
    const newSchedule: Match[] = [];
    let matchIdCounter = 1;
    
    // Create a subset of random opponents
    const randomOpponents = [...potentialOpponents]
      .sort(() => 0.5 - Math.random())
      .slice(0, matchCount);
    
    // Create home and away matches against each opponent (two-legged ties)
    for (const opponent of randomOpponents) {
      const matchPairId = `pair_${selectedTeam}_${opponent.id}`;
      
      // First leg - home
      newSchedule.push({
        id: `match_${matchIdCounter++}`,
        homeTeam: selectedTeam,
        awayTeam: opponent.id,
        played: false,
        homeScore: null,
        awayScore: null,
        round: currentRound + 1,
        matchType: "qualification",
        leg: 1,
        matchPair: matchPairId
      });
      
      // Second leg - away
      newSchedule.push({
        id: `match_${matchIdCounter++}`,
        homeTeam: opponent.id,
        awayTeam: selectedTeam,
        played: false,
        homeScore: null,
        awayScore: null,
        round: currentRound + 1,
        matchType: "qualification",
        leg: 2,
        matchPair: matchPairId
      });
    }
    
    setMatchSchedule(newSchedule);
    setCurrentMatchIndex(0);
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
    
    // Group matches by pair ID to handle two-legged ties
    const matchPairs: Record<string, Match[]> = {};
    
    matchSchedule.forEach(match => {
      if (!match.played && match.round === currentRound + 1) {
        if (!matchPairs[match.matchPair]) {
          matchPairs[match.matchPair] = [];
        }
        matchPairs[match.matchPair].push(match);
      }
    });
    
    let wonTies = 0;
    let totalTies = Object.keys(matchPairs).length;
    const updatedSchedule = [...matchSchedule];
    
    // Simulate each tie
    Object.entries(matchPairs).forEach(([pairId, matches]) => {
      let playerTeamAggregateGoals = 0;
      let opponentAggregateGoals = 0;
      
      // Simulate both legs
      matches.forEach(match => {
        const isHomeMatch = match.homeTeam === selectedTeam;
        const opponentId = isHomeMatch ? match.awayTeam : match.homeTeam;
        const opponentStrength = teamsData.teams.find(team => team.id === opponentId)?.serangan || 65;
        
        // Add home advantage
        const effectiveTeamStrength = isHomeMatch ? teamStrength + 5 : teamStrength;
        const effectiveOpponentStrength = !isHomeMatch ? opponentStrength + 5 : opponentStrength;
        
        // Generate scores
        const teamScore = Math.floor(Math.random() * (effectiveTeamStrength / 20)) + (effectiveTeamStrength > 75 ? 1 : 0);
        const opponentScore = Math.floor(Math.random() * (effectiveOpponentStrength / 20)) + (effectiveOpponentStrength > 75 ? 1 : 0);
        
        // Update match in schedule
        const matchIndex = updatedSchedule.findIndex(m => m.id === match.id);
        if (matchIndex !== -1) {
          updatedSchedule[matchIndex] = {
            ...match,
            played: true,
            homeScore: isHomeMatch ? teamScore : opponentScore,
            awayScore: isHomeMatch ? opponentScore : teamScore
          };
        }
        
        // Track aggregate score
        if (isHomeMatch) {
          playerTeamAggregateGoals += teamScore;
          opponentAggregateGoals += opponentScore;
        } else {
          playerTeamAggregateGoals += teamScore;
          opponentAggregateGoals += opponentScore;
        }
      });
      
      // Determine winner of the tie
      if (playerTeamAggregateGoals > opponentAggregateGoals) {
        wonTies++;
      }
    });
    
    setMatchSchedule(updatedSchedule);
    
    // Determine if qualified to next round based on ties won
    const qualificationRate = wonTies / totalTies;
    const isQualified = qualificationRate >= 0.5; // Need to win at least half of ties
    
    if (isQualified) {
      toast.success(`${teamName} berhasil lolos dari ${round.name}!`);
      setCurrentRound(currentRound + 1);
      // Calculate progress based on rounds completed
      const totalRounds = confRounds.length;
      setQualificationProgress(((currentRound + 1) / totalRounds) * 100);
      
      // Check if all rounds are completed
      if (currentRound + 1 >= totalRounds) {
        setWorldCupQualified(true);
      } else {
        // Generate next round matches
        setTimeout(() => {
          generateQualificationMatches();
        }, 500);
      }
    } else {
      toast.error(`${teamName} gagal lolos dari ${round.name}. Coba lagi tahun depan.`);
      // Reset career progress
      setCareerStarted(false);
      setCurrentRound(0);
      setQualificationProgress(0);
    }
  };

  const playMatch = (matchIndex: number) => {
    if (matchIndex >= matchSchedule.length) return;
    
    const match = matchSchedule[matchIndex];
    
    // Navigate to match screen with the selected teams
    navigate("/tactics", {
      state: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        playerSide: match.homeTeam === selectedTeam ? "Home" : "Away",
        returnPath: "/career",
        matchData: match
      }
    });
  };

  const startWorldCup = () => {
    // Generate World Cup groups and matches
    setCurrentSeason(currentSeason + 4); // World Cup every 4 years
    toast.success(`Piala Dunia ${currentSeason} dimulai!`);
    
    // In a real implementation, we would:
    // 1. Generate World Cup groups
    // 2. Create a schedule of group stage matches
    // 3. Set up knockout rounds
    
    // For now, navigate to a simple world cup simulation
    navigate("/career/worldcup", {
      state: {
        team: selectedTeam,
        season: currentSeason
      }
    });
  };

  const viewTeamSquad = () => {
    toast.success("Melihat skuad tim");
    // Could navigate to a squad management page in the future
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
              <h2 className="text-2xl font-bold text-center mb-4">Piala Dunia {currentSeason}</h2>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <Button 
                  onClick={startWorldCup} 
                  className="flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Mulai Piala Dunia
                </Button>
                
                <Button 
                  onClick={viewTeamSquad} 
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Lihat Skuad Tim
                </Button>
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-1" />
                Musim: {currentSeason}
              </div>
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
                <div className="mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Musim: {currentSeason}
                </div>
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
              
              {/* Group Standings Table (only shown if in group stage) */}
              {currentGroup && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Klasemen Grup:</h3>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Table className="w-4 h-4" />
                      <span>Tabel</span>
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-2 text-left">Tim</th>
                          <th className="px-3 py-2 text-center">M</th>
                          <th className="px-3 py-2 text-center">M</th>
                          <th className="px-3 py-2 text-center">S</th>
                          <th className="px-3 py-2 text-center">K</th>
                          <th className="px-3 py-2 text-center">GM</th>
                          <th className="px-3 py-2 text-center">GK</th>
                          <th className="px-3 py-2 text-center">+/-</th>
                          <th className="px-3 py-2 text-center">Poin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentGroup.standings.map((standing, idx) => {
                          const team = teamsData.teams.find(t => t.id === standing.teamId);
                          const isPlayerTeam = standing.teamId === selectedTeam;
                          
                          return (
                            <tr 
                              key={standing.teamId} 
                              className={`border-b border-border/40 ${
                                isPlayerTeam ? 'bg-primary/5 font-medium' : ''
                              } ${idx < 2 ? 'text-green-500' : ''}`}
                            >
                              <td className="px-3 py-2 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{idx + 1}</span>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={team?.icon} alt={team?.name} />
                                    <AvatarFallback>{team?.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <span className={isPlayerTeam ? 'font-semibold' : ''}>
                                    {team?.name}

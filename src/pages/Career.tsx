
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, ArrowLeft, Home } from "lucide-react";
import confederationsData from "../data/confederations.json";
import teamsData from "../data/teams.json";
import { useNavigate } from "react-router-dom";

const Career = () => {
  const navigate = useNavigate();
  const [selectedConfederation, setSelectedConfederation] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [careerYear, setCareerYear] = useState(2024);
  const [qualificationPhase, setQualificationPhase] = useState(1);
  const [groups, setGroups] = useState<string[][]>([]);
  const [fixtures, setFixtures] = useState<
    {
      homeTeam: string;
      awayTeam: string;
      homeScore: number | null;
      awayScore: number | null;
      played: boolean;
      leg: number;
    }[]
  >([]);
  const [groupStandings, setGroupStandings] = useState<
    {
      teamId: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
    }[][]
  >([]);
  const [allMatchesPlayed, setAllMatchesPlayed] = useState(false);
  const [qualifiedTeams, setQualifiedTeams] = useState<string[]>([]);
  const [eliminatedTeams, setEliminatedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (started && selectedTeam) {
      initializeQualificationPhase();
    }
  }, [started, careerYear, qualificationPhase, selectedTeam]);

  useEffect(() => {
    if (groups.length > 0) {
      generateFixtures();
    }
  }, [groups]);

  useEffect(() => {
    if (fixtures.length > 0) {
      calculateGroupStandings();
    }
  }, [fixtures]);

  useEffect(() => {
    if (fixtures.length > 0) {
      setAllMatchesPlayed(fixtures.every((fixture) => fixture.played));
    }
  }, [fixtures]);

  const startCareer = () => {
    if (selectedTeam) {
      console.log("Starting career with team:", selectedTeam);
      setStarted(true);
    }
  };

  const initializeQualificationPhase = () => {
    switch (qualificationPhase) {
      case 1:
        initializeFirstRound();
        break;
      case 2:
        initializeSecondRound();
        break;
      case 3:
        initializeThirdRound();
        break;
      case 4:
        initializeFourthRound();
        break;
      case 5:
        initializeFifthRound();
        break;
      default:
        initializeFirstRound();
    }
  };

  const initializeFirstRound = () => {
    const asianTeams = teamsData.teams
      .filter((team) => team.confederation === "afc")
      .sort((a, b) => {
        const ratingA = (a.serangan || 0) + (a.possession || 0) + (a.defense || 0);
        const ratingB = (b.serangan || 0) + (b.possession || 0) + (b.defense || 0);
        return ratingB - ratingA;
      });

    const lowerRankedTeams = asianTeams.slice(26, 46);
    
    const newGroups = [];
    for (let i = 0; i < 10; i++) {
      newGroups.push([lowerRankedTeams[i * 2].id, lowerRankedTeams[i * 2 + 1].id]);
    }
    
    setGroups(newGroups);
    setGroupStandings(newGroups.map(() => []));
  };

  const initializeSecondRound = () => {
    const asianTeams = teamsData.teams
      .filter((team) => team.confederation === "afc")
      .sort((a, b) => {
        const ratingA = (a.serangan || 0) + (a.possession || 0) + (a.defense || 0);
        const ratingB = (b.serangan || 0) + (b.possession || 0) + (b.defense || 0);
        return ratingB - ratingA;
      });

    const topTeams = asianTeams.slice(0, 26).map(team => team.id);
    
    const secondRoundTeams = [...topTeams, ...qualifiedTeams.slice(0, 10)];
    
    const newGroups = [];
    const shuffledTeams = [...secondRoundTeams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 9; i++) {
      newGroups.push(shuffledTeams.slice(i * 4, (i + 1) * 4));
    }
    
    setGroups(newGroups);
    setGroupStandings(newGroups.map(() => []));
  };

  const initializeThirdRound = () => {
    const shuffledTeams = [...qualifiedTeams].sort(() => Math.random() - 0.5);
    const newGroups = [];
    
    for (let i = 0; i < 3; i++) {
      newGroups.push(shuffledTeams.slice(i * 6, (i + 1) * 6));
    }
    
    setGroups(newGroups);
    setGroupStandings(newGroups.map(() => []));
  };

  const initializeFourthRound = () => {
    const shuffledTeams = [...qualifiedTeams].sort(() => Math.random() - 0.5);
    const newGroups = [];
    
    for (let i = 0; i < 2; i++) {
      newGroups.push(shuffledTeams.slice(i * 3, (i + 1) * 3));
    }
    
    setGroups(newGroups);
    setGroupStandings(newGroups.map(() => []));
  };

  const initializeFifthRound = () => {
    setGroups([qualifiedTeams]);
    setGroupStandings([[]]);
  };

  const generateFixtures = () => {
    const newFixtures = [];
    groups.forEach((group) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          newFixtures.push({
            homeTeam: group[i],
            awayTeam: group[j],
            homeScore: null,
            awayScore: null,
            played: false,
            leg: 1,
          });
          
          if (qualificationPhase <= 3 || qualificationPhase === 5) {
            newFixtures.push({
              homeTeam: group[j],
              awayTeam: group[i],
              homeScore: null,
              awayScore: null,
              played: false,
              leg: 2,
            });
          }
        }
      }
    });
    setFixtures(newFixtures);
  };

  const playMatch = (fixtureIndex: number) => {
    const updatedFixtures = [...fixtures];
    const homeScore = Math.floor(Math.random() * 5);
    const awayScore = Math.floor(Math.random() * 5);
    updatedFixtures[fixtureIndex] = {
      ...updatedFixtures[fixtureIndex],
      homeScore: homeScore,
      awayScore: awayScore,
      played: true,
    };
    setFixtures(updatedFixtures);
    calculateGroupStandings();
  };

  const calculateGroupStandings = () => {
    const initialStandings = groups.map((group) =>
      group.map((teamId) => ({
        teamId: teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      }))
    );

    fixtures.forEach((fixture) => {
      if (fixture.played) {
        groups.forEach((group, groupIndex) => {
          if (group.includes(fixture.homeTeam) && group.includes(fixture.awayTeam)) {
            const homeTeamIndex = initialStandings[groupIndex].findIndex(
              (standing) => standing.teamId === fixture.homeTeam
            );
            const awayTeamIndex = initialStandings[groupIndex].findIndex(
              (standing) => standing.teamId === fixture.awayTeam
            );

            if (homeTeamIndex !== -1 && awayTeamIndex !== -1) {
              initialStandings[groupIndex][homeTeamIndex].played++;
              initialStandings[groupIndex][awayTeamIndex].played++;
              initialStandings[groupIndex][homeTeamIndex].goalsFor +=
                fixture.homeScore || 0;
              initialStandings[groupIndex][homeTeamIndex].goalsAgainst +=
                fixture.awayScore || 0;
              initialStandings[groupIndex][awayTeamIndex].goalsFor +=
                fixture.awayScore || 0;
              initialStandings[groupIndex][awayTeamIndex].goalsAgainst +=
                fixture.homeScore || 0;
              initialStandings[groupIndex][homeTeamIndex].goalDifference =
                initialStandings[groupIndex][homeTeamIndex].goalsFor -
                initialStandings[groupIndex][homeTeamIndex].goalsAgainst;
              initialStandings[groupIndex][awayTeamIndex].goalDifference =
                initialStandings[groupIndex][awayTeamIndex].goalsFor -
                initialStandings[groupIndex][awayTeamIndex].goalsAgainst;

              if ((fixture.homeScore || 0) > (fixture.awayScore || 0)) {
                initialStandings[groupIndex][homeTeamIndex].won++;
                initialStandings[groupIndex][awayTeamIndex].lost++;
                initialStandings[groupIndex][homeTeamIndex].points += 3;
              } else if ((fixture.homeScore || 0) < (fixture.awayScore || 0)) {
                initialStandings[groupIndex][awayTeamIndex].won++;
                initialStandings[groupIndex][homeTeamIndex].lost++;
                initialStandings[groupIndex][awayTeamIndex].points += 3;
              } else {
                initialStandings[groupIndex][homeTeamIndex].drawn++;
                initialStandings[groupIndex][awayTeamIndex].drawn++;
                initialStandings[groupIndex][homeTeamIndex].points += 1;
                initialStandings[groupIndex][awayTeamIndex].points += 1;
              }
            }
          }
        });
      }
    });
    setGroupStandings(initialStandings);
  };

  const advancePhase = () => {
    const newQualifiedTeams: string[] = [];
    
    if (qualificationPhase === 1) {
      groupStandings.forEach((group) => {
        const sortedGroup = [...group].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        
        if (sortedGroup.length > 0) {
          newQualifiedTeams.push(sortedGroup[0].teamId);
        }
      });
      
      setQualifiedTeams(newQualifiedTeams);
      setQualificationPhase(2);
    } else if (qualificationPhase === 2) {
      groupStandings.forEach((group) => {
        const sortedGroup = [...group].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        
        if (sortedGroup.length >= 2) {
          newQualifiedTeams.push(sortedGroup[0].teamId, sortedGroup[1].teamId);
        }
      });
      
      setQualifiedTeams(newQualifiedTeams);
      setQualificationPhase(3);
    } else if (qualificationPhase === 3) {
      groupStandings.forEach((group) => {
        const sortedGroup = [...group].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        
        if (sortedGroup.length >= 4) {
          newQualifiedTeams.push(
            sortedGroup[0].teamId, 
            sortedGroup[1].teamId,
            sortedGroup[2].teamId,
            sortedGroup[3].teamId
          );
        }
      });
      
      const directQualifiers: string[] = [];
      groupStandings.forEach((group) => {
        const sortedGroup = [...group].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        
        if (sortedGroup.length >= 2) {
          directQualifiers.push(sortedGroup[0].teamId, sortedGroup[1].teamId);
        }
      });
      
      setQualifiedTeams(newQualifiedTeams);
      setQualificationPhase(4);
    } else if (qualificationPhase === 4) {
      groupStandings.forEach((group) => {
        const sortedGroup = [...group].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        
        if (sortedGroup.length >= 2) {
          newQualifiedTeams.push(sortedGroup[1].teamId);
        }
      });
      
      setQualifiedTeams(newQualifiedTeams);
      setQualificationPhase(5);
    } else if (qualificationPhase === 5) {
      setQualificationPhase(1);
      setCareerYear(careerYear + 1);
    }
    
    setFixtures([]);
  };

  const getQualificationPhaseTitle = () => {
    switch (qualificationPhase) {
      case 1:
        return "Babak Pertama - 20 tim (peringkat 27-46)";
      case 2:
        return "Babak Kedua - 36 tim (peringkat 1-26 dan 10 pemenang babak pertama)";
      case 3:
        return "Babak Ketiga - 18 tim dalam 3 grup";
      case 4:
        return "Babak Keempat - 6 tim dalam 2 grup";
      case 5:
        return "Babak Kelima - Playoff antar konfederasi";
      default:
        return "";
    }
  };

  const getTeamById = (teamId: string) => {
    return teamsData.teams.find((team) => team.id === teamId);
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-6">
        Mode Karir
      </h1>

      {!started ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Pilih Konfederasi</h2>
              <Select value={selectedConfederation} onValueChange={setSelectedConfederation}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Pilih Konfederasi" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {confederationsData.confederations.map((confederation) => (
                    <SelectItem key={confederation.id} value={confederation.id}>
                      {confederation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Pilih Tim</h2>
              {selectedConfederation && (
                <Select value={selectedTeam || ""} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Pilih Tim" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-background">
                    {teamsData.teams
                      .filter((team) => team.confederation === selectedConfederation)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={team.icon}
                              alt={team.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                            <span>{team.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedTeam}
            onClick={startCareer}
          >
            Mulai Karir
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Mengelola{" "}
              {selectedTeam && getTeamById(selectedTeam)?.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                Tahun: {careerYear}
              </span>
              <Button onClick={advancePhase} disabled={!allMatchesPlayed}>
                {qualificationPhase < 5 ? "Lanjut ke Babak Berikutnya" : "Mulai Musim Baru"}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold">{getQualificationPhaseTitle()}</h3>
          </div>

          <Tabs defaultValue="standings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="standings">Klasemen Grup</TabsTrigger>
              <TabsTrigger value="fixtures">Jadwal Pertandingan</TabsTrigger>
              <TabsTrigger value="results">Hasil Pertandingan</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-6">
              {groups.map((group, groupIndex) => (
                <Card key={groupIndex}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Grup {String.fromCharCode(65 + groupIndex)}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-primary/10 text-foreground">
                            <th className="p-2 text-left">Tim</th>
                            <th className="p-2 text-center">P</th>
                            <th className="p-2 text-center">M</th>
                            <th className="p-2 text-center">S</th>
                            <th className="p-2 text-center">K</th>
                            <th className="p-2 text-center">GM</th>
                            <th className="p-2 text-center">GK</th>
                            <th className="p-2 text-center">SG</th>
                            <th className="p-2 text-center">Poin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupStandings[groupIndex] && groupStandings[groupIndex]
                            .sort((a, b) => {
                              if (b.points !== a.points) return b.points - a.points;
                              if (b.goalDifference !== a.goalDifference)
                                return b.goalDifference - a.goalDifference;
                              return b.goalsFor - a.goalsFor;
                            })
                            .map((standing) => {
                              const team = teamsData.teams.find(
                                (t) => t.id === standing.teamId
                              );
                              const isUserTeam = selectedTeam === standing.teamId;
                              return (
                                <tr
                                  key={standing.teamId}
                                  className={`border-b border-border ${
                                    isUserTeam ? "bg-primary/5" : ""
                                  }`}
                                >
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={team?.icon}
                                        alt={team?.name}
                                        className="w-6 h-6 object-cover"
                                      />
                                      <span
                                        className={
                                          isUserTeam ? "font-bold" : ""
                                        }
                                      >
                                        {team?.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-2 text-center">{standing.played}</td>
                                  <td className="p-2 text-center">{standing.won}</td>
                                  <td className="p-2 text-center">{standing.drawn}</td>
                                  <td className="p-2 text-center">{standing.lost}</td>
                                  <td className="p-2 text-center">{standing.goalsFor}</td>
                                  <td className="p-2 text-center">{standing.goalsAgainst}</td>
                                  <td className="p-2 text-center">{standing.goalDifference}</td>
                                  <td className="p-2 text-center font-bold">{standing.points}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="fixtures" className="space-y-6">
              {groups.map((group, groupIndex) => (
                <Card key={groupIndex}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Grup {String.fromCharCode(65 + groupIndex)}
                    </h3>
                    <div className="space-y-4">
                      {fixtures
                        .filter(
                          (fixture) =>
                            !fixture.played &&
                            group.includes(fixture.homeTeam) &&
                            group.includes(fixture.awayTeam)
                        )
                        .map((fixture, fixtureIndex) => {
                          const homeTeam = teamsData.teams.find(
                            (team) => team.id === fixture.homeTeam
                          );
                          const awayTeam = teamsData.teams.find(
                            (team) => team.id === fixture.awayTeam
                          );
                          const isUserMatch =
                            fixture.homeTeam === selectedTeam ||
                            fixture.awayTeam === selectedTeam;

                          return (
                            <div
                              key={fixtureIndex}
                              className={`p-4 border rounded-lg ${
                                isUserMatch
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1 flex items-center justify-end gap-2">
                                  <span
                                    className={`${
                                      fixture.homeTeam === selectedTeam
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    {homeTeam?.name}
                                  </span>
                                  <img
                                    src={homeTeam?.icon}
                                    alt={homeTeam?.name}
                                    className="w-6 h-6 object-cover"
                                  />
                                </div>

                                <div className="mx-4 text-center">
                                  <span className="px-3 py-1 rounded text-sm bg-background">
                                    {fixture.leg === 1 ? "Leg 1" : "Leg 2"}
                                  </span>
                                </div>

                                <div className="flex-1 flex items-center gap-2">
                                  <img
                                    src={awayTeam?.icon}
                                    alt={awayTeam?.name}
                                    className="w-6 h-6 object-cover"
                                  />
                                  <span
                                    className={`${
                                      fixture.awayTeam === selectedTeam
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    {awayTeam?.name}
                                  </span>
                                </div>
                              </div>

                              {(isUserMatch || !selectedTeam) && (
                                <div className="mt-3 flex justify-center">
                                  <Button
                                    size="sm"
                                    onClick={() => playMatch(
                                      fixtures.findIndex(
                                        (f) => 
                                          f.homeTeam === fixture.homeTeam && 
                                          f.awayTeam === fixture.awayTeam &&
                                          f.leg === fixture.leg
                                      )
                                    )}
                                    className="gap-1"
                                  >
                                    <Play className="w-4 h-4" /> Main
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {groups.map((group, groupIndex) => (
                <Card key={groupIndex}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Grup {String.fromCharCode(65 + groupIndex)}
                    </h3>
                    <div className="space-y-4">
                      {fixtures
                        .filter(
                          (fixture) =>
                            fixture.played &&
                            group.includes(fixture.homeTeam) &&
                            group.includes(fixture.awayTeam)
                        )
                        .map((fixture, fixtureIndex) => {
                          const homeTeam = teamsData.teams.find(
                            (team) => team.id === fixture.homeTeam
                          );
                          const awayTeam = teamsData.teams.find(
                            (team) => team.id === fixture.awayTeam
                          );
                          const isUserMatch =
                            fixture.homeTeam === selectedTeam ||
                            fixture.awayTeam === selectedTeam;

                          return (
                            <div
                              key={fixtureIndex}
                              className={`p-4 border rounded-lg ${
                                isUserMatch
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1 flex items-center justify-end gap-2">
                                  <span
                                    className={`${
                                      fixture.homeTeam === selectedTeam
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    {homeTeam?.name}
                                  </span>
                                  <img
                                    src={homeTeam?.icon}
                                    alt={homeTeam?.name}
                                    className="w-6 h-6 object-cover"
                                  />
                                </div>

                                <div className="mx-4 flex flex-col items-center">
                                  <div className="text-xl font-bold">
                                    {fixture.homeScore} - {fixture.awayScore}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {fixture.leg === 1 ? "Leg 1" : "Leg 2"}
                                  </span>
                                </div>

                                <div className="flex-1 flex items-center gap-2">
                                  <img
                                    src={awayTeam?.icon}
                                    alt={awayTeam?.name}
                                    className="w-6 h-6 object-cover"
                                  />
                                  <span
                                    className={`${
                                      fixture.awayTeam === selectedTeam
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    {awayTeam?.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Career;

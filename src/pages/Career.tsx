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
import { Play } from "lucide-react";
import confederationsData from "../data/confederations.json";
import teamsData from "../data/teams.json";

const Career = () => {
  const [selectedConfederation, setSelectedConfederation] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [careerYear, setCareerYear] = useState(2024);
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
  >([[], [], [], []]);
  const [allMatchesPlayed, setAllMatchesPlayed] = useState(false);

  useEffect(() => {
    if (started) {
      generateGroups();
    }
  }, [started, careerYear]);

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
    setStarted(true);
  };

  const generateGroups = () => {
    const selectedTeams = teamsData
      .filter((team) => team.confederation === selectedConfederation)
      .map((team) => team.id);
    const shuffledTeams = [...selectedTeams].sort(() => Math.random() - 0.5);
    const newGroups = [];
    for (let i = 0; i < 4; i++) {
      newGroups.push(shuffledTeams.slice(i * 4, (i + 1) * 4));
    }
    setGroups(newGroups);
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

    fixtures.forEach((fixture, index) => {
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

  const advanceYear = () => {
    setCareerYear(careerYear + 1);
    generateGroups();
    setFixtures([]);
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Career Mode
      </h1>

      {!started ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Select Confederation</h2>
              <Select value={selectedConfederation} onValueChange={setSelectedConfederation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Confederation" />
                </SelectTrigger>
                <SelectContent>
                  {confederationsData.map((confederation) => (
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
              <h2 className="text-xl font-semibold mb-4">Team Selection</h2>
              {selectedConfederation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {teamsData
                    .filter((team) => team.confederation === selectedConfederation)
                    .map((team) => (
                      <div
                        key={team.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                          selectedTeam === team.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        <img
                          src={`/images/teams/${team.flag}`}
                          alt={team.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span>{team.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedTeam}
            onClick={startCareer}
          >
            Start Career
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Managing{" "}
              {teamsData.find((team) => team.id === selectedTeam)?.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                Year: {careerYear}
              </span>
              <Button onClick={advanceYear} disabled={!allMatchesPlayed}>
                Advance Year
              </Button>
            </div>
          </div>

          <Tabs defaultValue="standings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="standings">Group Standings</TabsTrigger>
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-6">
              {groups.map((group, groupIndex) => (
                <Card key={groupIndex}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Group {String.fromCharCode(65 + groupIndex)}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-primary/10 text-foreground">
                            <th className="p-2 text-left">Team</th>
                            <th className="p-2 text-center">P</th>
                            <th className="p-2 text-center">W</th>
                            <th className="p-2 text-center">D</th>
                            <th className="p-2 text-center">L</th>
                            <th className="p-2 text-center">GF</th>
                            <th className="p-2 text-center">GA</th>
                            <th className="p-2 text-center">GD</th>
                            <th className="p-2 text-center">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupStandings[groupIndex]
                            .sort((a, b) => {
                              if (b.points !== a.points) return b.points - a.points;
                              if (b.goalDifference !== a.goalDifference)
                                return b.goalDifference - a.goalDifference;
                              return b.goalsFor - a.goalsFor;
                            })
                            .map((standing) => {
                              const team = teamsData.find(
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
                                        src={`/images/teams/${team?.flag}`}
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
                      Group {String.fromCharCode(65 + groupIndex)}
                    </h3>
                    <div className="space-y-4">
                      {fixtures
                        .filter(
                          (fixture) =>
                            !fixture.played &&
                            groups[groupIndex].includes(fixture.homeTeam)
                        )
                        .map((fixture, fixtureIndex) => {
                          const homeTeam = teamsData.find(
                            (team) => team.id === fixture.homeTeam
                          );
                          const awayTeam = teamsData.find(
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
                                    src={`/images/teams/${homeTeam?.flag}`}
                                    alt={homeTeam?.name}
                                    className="w-6 h-6 object-cover"
                                  />
                                </div>

                                <div className="mx-4 text-center">
                                  <span className="px-3 py-1 rounded text-sm bg-background">
                                    {fixture.leg === 1 ? "1st Leg" : "2nd Leg"}
                                  </span>
                                </div>

                                <div className="flex-1 flex items-center gap-2">
                                  <img
                                    src={`/images/teams/${awayTeam?.flag}`}
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

                              {isUserMatch && (
                                <div className="mt-3 flex justify-center">
                                  <Button
                                    size="sm"
                                    onClick={() => playMatch(fixtureIndex)}
                                    className="gap-1"
                                  >
                                    <Play className="w-4 h-4" /> Play Match
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
                      Group {String.fromCharCode(65 + groupIndex)}
                    </h3>
                    <div className="space-y-4">
                      {fixtures
                        .filter(
                          (fixture) =>
                            fixture.played &&
                            groups[groupIndex].includes(fixture.homeTeam)
                        )
                        .map((fixture, fixtureIndex) => {
                          const homeTeam = teamsData.find(
                            (team) => team.id === fixture.homeTeam
                          );
                          const awayTeam = teamsData.find(
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
                                    src={`/images/teams/${homeTeam?.flag}`}
                                    alt={homeTeam?.name}
                                    className="w-6 h-6 object-cover"
                                  />
                                </div>

                                <div className="mx-4 flex flex-col items-center">
                                  <div className="text-xl font-bold">
                                    {fixture.homeScore} - {fixture.awayScore}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {fixture.leg === 1 ? "1st Leg" : "2nd Leg"}
                                  </span>
                                </div>

                                <div className="flex-1 flex items-center gap-2">
                                  <img
                                    src={`/images/teams/${awayTeam?.flag}`}
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

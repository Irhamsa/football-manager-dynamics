
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
  selectedPlayers: string[];
  playerSide: string;
}

const tactics = [
  { 
    id: "possession",
    name: "Possession Game",
    description: "Menguasai bola dengan passing pendek",
    attributes: {
      possession: 0.3,
      passing: 0.25,
      pressure: 0.1,
      counter: -0.1,
      defensive: -0.05
    }
  },
  {
    id: "counter",
    name: "Counter Attack",
    description: "Bertahan dan menyerang dengan cepat",
    attributes: {
      possession: -0.15,
      passing: 0.1,
      pressure: -0.1,
      counter: 0.35,
      defensive: 0.15
    }
  },
  {
    id: "tiki_taka",
    name: "Tiki-taka",
    description: "Passing cepat dengan pergerakan dinamis",
    attributes: {
      possession: 0.35,
      passing: 0.3,
      pressure: 0.15,
      counter: -0.15,
      defensive: -0.1
    }
  },
  {
    id: "high_pressure",
    name: "High Pressure",
    description: "Menekan lawan secara agresif",
    attributes: {
      possession: 0.1,
      passing: 0,
      pressure: 0.35,
      counter: 0.15,
      defensive: -0.2
    }
  },
  {
    id: "park_bus",
    name: "Park The Bus",
    description: "Bertahan sangat dalam",
    attributes: {
      possession: -0.25,
      passing: -0.15,
      pressure: -0.2,
      counter: 0.1,
      defensive: 0.35
    }
  }
];

const aiTacticSelection = (teamStrength: number, opponentStrength: number) => {
  if (teamStrength > opponentStrength + 10) {
    return "possession"; // Tim lebih kuat bermain menguasai
  } else if (teamStrength < opponentStrength - 10) {
    return "park_bus"; // Tim lebih lemah bertahan
  } else if (teamStrength < opponentStrength - 5) {
    return "counter"; // Tim sedikit lebih lemah counter attack
  } else if (Math.abs(teamStrength - opponentStrength) <= 5) {
    return "high_pressure"; // Tim seimbang bermain pressing
  } else {
    return "tiki_taka"; // Default tiki-taka
  }
};

const Tactics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [selectedTactic, setSelectedTactic] = useState("");

  const state = location.state as LocationState;
  
  if (!state || !state.homeTeam || !state.awayTeam || !state.selectedPlayers || !state.playerSide) {
    console.log("Missing state:", state);
    navigate("/match");
    return null;
  }

  const handleConfirm = () => {
    if (!selectedTactic) {
      toast({
        title: "Kesalahan",
        description: "Silakan pilih taktik terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const tactic = tactics.find(t => t.id === selectedTactic);
    if (!tactic) {
      toast({
        title: "Kesalahan",
        description: "Taktik tidak valid",
        variant: "destructive"
      });
      return;
    }

    // Pilih taktik AI untuk lawan secara otomatis
    const aiTactic = tactics.find(t => t.id === aiTacticSelection(75, 70)); // Contoh nilai kekuatan tim

    navigate("/simulation", {
      state: {
        ...state,
        playerTactic: tactic,
        aiTactic: aiTactic
      }
    });
  };

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

      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-8">Pilih Taktik Tim</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tactics.map((tactic) => (
            <div
              key={tactic.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedTactic === tactic.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-600 hover:border-primary"
              }`}
              onClick={() => setSelectedTactic(tactic.id)}
            >
              <h3 className="text-xl font-semibold">{tactic.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {tactic.description}
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  Possession: {Math.round(tactic.attributes.possession * 100)}%
                </div>
                <div className="text-sm">
                  Passing: {Math.round(tactic.attributes.passing * 100)}%
                </div>
                <div className="text-sm">
                  Pressure: {Math.round(tactic.attributes.pressure * 100)}%
                </div>
                <div className="text-sm">
                  Counter: {Math.round(tactic.attributes.counter * 100)}%
                </div>
                <div className="text-sm">
                  Defensive: {Math.round(tactic.attributes.defensive * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleConfirm}
            disabled={!selectedTactic}
            className="w-full md:w-auto"
          >
            Konfirmasi Taktik
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tactics;

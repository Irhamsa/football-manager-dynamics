
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

const formations = [
  { id: "4-4-2", name: "4-4-2", strength: 0.1 },
  { id: "4-3-3", name: "4-3-3", strength: 0.12 },
  { id: "4-2-3-1", name: "4-2-3-1", strength: 0.11 },
  { id: "3-5-2", name: "3-5-2", strength: 0.09 },
  { id: "5-3-2", name: "5-3-2", strength: 0.08 },
  { id: "4-5-1", name: "4-5-1", strength: 0.07 },
  { id: "3-4-3", name: "3-4-3", strength: 0.13 },
  { id: "5-4-1", name: "5-4-1", strength: 0.06 },
  { id: "4-1-4-1", name: "4-1-4-1", strength: 0.08 },
  { id: "4-4-1-1", name: "4-4-1-1", strength: 0.09 },
  { id: "4-3-2-1", name: "4-3-2-1", strength: 0.11 },
  { id: "3-5-1-1", name: "3-5-1-1", strength: 0.08 },
  { id: "3-4-2-1", name: "3-4-2-1", strength: 0.1 },
  { id: "5-2-3", name: "5-2-3", strength: 0.09 },
  { id: "3-3-3-1", name: "3-3-3-1", strength: 0.07 },
  { id: "4-2-2-2", name: "4-2-2-2", strength: 0.1 },
  { id: "4-1-3-2", name: "4-1-3-2", strength: 0.09 },
  { id: "3-6-1", name: "3-6-1", strength: 0.06 },
  { id: "5-3-1-1", name: "5-3-1-1", strength: 0.07 },
  { id: "2-3-5", name: "2-3-5", strength: 0.15 }
];

const Tactics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;
  const [selectedFormation, setSelectedFormation] = useState("");

  if (!state) {
    navigate("/match");
    return null;
  }

  const handleConfirm = () => {
    if (!selectedFormation) {
      toast({
        title: "Kesalahan",
        description: "Silakan pilih formasi terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const formation = formations.find(f => f.id === selectedFormation);

    navigate("/simulation", {
      state: {
        ...state,
        formation: formation
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
        <h1 className="text-3xl font-bold mb-8">Pilih Formasi Tim</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {formations.map((formation) => (
            <div
              key={formation.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedFormation === formation.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-600 hover:border-primary"
              }`}
              onClick={() => setSelectedFormation(formation.id)}
            >
              <h3 className="text-xl font-semibold text-center">{formation.name}</h3>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleConfirm}>
            Konfirmasi Formasi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tactics;

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface LocationState {
  homeTeam: string;
  awayTeam: string;
  playerSide: string;
}

interface TacticSetting {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
  defaultValue: number;
}

const tacticSettings: TacticSetting[] = [
  {
    id: "tempo",
    name: "Tempo Permainan",
    description: "Kecepatan dalam memainkan bola",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "playStyle",
    name: "Gaya Bermain",
    description: "Tingkat agresifitas dalam menyerang",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "attackTempo",
    name: "Tempo Serangan",
    description: "Kecepatan dalam melakukan serangan",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "defenseLine",
    name: "Garis Pertahanan",
    description: "Posisi lini pertahanan (rendah-tinggi)",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "attackStyle",
    name: "Gaya Serangan",
    description: "Pendek-langsung dalam menyerang",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "defenseStyle",
    name: "Gaya Bertahan",
    description: "Pasif-agresif dalam bertahan",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "mentality",
    name: "Mentalitas",
    description: "Bertahan-menyerang",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "playerDistance",
    name: "Jarak Antar Pemain",
    description: "Rapat-renggang",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "pressing",
    name: "Intensitas Pressing",
    description: "Tingkat agresifitas dalam menekan",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "marking",
    name: "Sistem Marking",
    description: "Zona-man to man",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "possession",
    name: "Penguasaan Bola",
    description: "Prioritas penguasaan bola",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "width",
    name: "Lebar Permainan",
    description: "Sempit-lebar",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "crossFrequency",
    name: "Frekuensi Crossing",
    description: "Seberapa sering melakukan crossing",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "longShots",
    name: "Tembakan Jarak Jauh",
    description: "Frekuensi tembakan jarak jauh",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "dribbling",
    name: "Prioritas Dribbling",
    description: "Seberapa sering melakukan dribbling",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "offsideTrap",
    name: "Jebakan Offside",
    description: "Penggunaan taktik offside trap",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "counterAttack",
    name: "Serangan Balik",
    description: "Prioritas serangan balik",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "setPieces",
    name: "Strategi Bola Mati",
    description: "Agresifitas dalam bola mati",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "playmaking",
    name: "Kreativitas",
    description: "Kebebasan dalam menciptakan peluang",
    min: 0,
    max: 100,
    defaultValue: 50
  },
  {
    id: "risk",
    name: "Pengambilan Risiko",
    description: "Tingkat pengambilan risiko",
    min: 0,
    max: 100,
    defaultValue: 50
  }
];

const calculateTacticStrength = (settings: Record<string, number>) => {
  const weights = {
    tempo: 0.05,
    playStyle: 0.05,
    attackTempo: 0.05,
    defenseLine: 0.05,
    attackStyle: 0.05,
    defenseStyle: 0.05,
    mentality: 0.05,
    playerDistance: 0.05,
    pressing: 0.05,
    marking: 0.05,
    possession: 0.05,
    width: 0.05,
    crossFrequency: 0.05,
    longShots: 0.05,
    dribbling: 0.05,
    offsideTrap: 0.05,
    counterAttack: 0.05,
    setPieces: 0.05,
    playmaking: 0.05,
    risk: 0.05
  };

  return Object.entries(settings).reduce((strength, [setting, value]) => {
    return strength + (value / 100) * (weights[setting as keyof typeof weights] || 0);
  }, 0);
};

const aiTacticSelection = (teamStrength: number, opponentStrength: number) => {
  const settings: Record<string, number> = {};
  
  if (teamStrength > opponentStrength + 10) {
    settings.mentality = 75;
    settings.defenseLine = 70;
    settings.pressing = 70;
    settings.possession = 70;
    settings.attackStyle = 70;
  } else if (teamStrength < opponentStrength - 10) {
    settings.mentality = 30;
    settings.defenseLine = 30;
    settings.pressing = 40;
    settings.counterAttack = 80;
    settings.risk = 30;
  } else {
    settings.mentality = 50;
    settings.defenseLine = 50;
    settings.pressing = 60;
    settings.possession = 55;
    settings.risk = 50;
  }

  tacticSettings.forEach(setting => {
    if (settings[setting.id] === undefined) {
      settings[setting.id] = setting.defaultValue;
    }
  });

  return settings;
};

const Tactics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [tacticValues, setTacticValues] = useState<Record<string, number>>(() => {
    const initialValues: Record<string, number> = {};
    tacticSettings.forEach(setting => {
      initialValues[setting.id] = setting.defaultValue;
    });
    return initialValues;
  });

  const state = location.state as LocationState;
  
  if (!state || !state.homeTeam || !state.awayTeam || !state.playerSide) {
    console.log("Missing state:", state);
    navigate("/match");
    return null;
  }

  const handleConfirm = () => {
    const playerTacticStrength = calculateTacticStrength(tacticValues);
    const aiTactics = aiTacticSelection(75, 70);
    const aiTacticStrength = calculateTacticStrength(aiTactics);

    navigate("/simulation", {
      state: {
        ...state,
        tactics: {
          home: state.playerSide === "Home" ? tacticValues : aiTactics,
          away: state.playerSide === "Away" ? tacticValues : aiTactics,
          homeStrength: state.playerSide === "Home" ? playerTacticStrength : aiTacticStrength,
          awayStrength: state.playerSide === "Away" ? playerTacticStrength : aiTacticStrength
        }
      }
    });
  };

  const handleSliderChange = (settingId: string, value: number[]) => {
    setTacticValues(prev => ({
      ...prev,
      [settingId]: value[0]
    }));
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

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pengaturan Taktik Tim</h1>

        <div className="grid gap-6">
          {tacticSettings.map((setting) => (
            <div key={setting.id} className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{setting.name}</h3>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <span className="font-mono">{tacticValues[setting.id]}%</span>
              </div>
              <Slider
                defaultValue={[setting.defaultValue]}
                max={setting.max}
                min={setting.min}
                step={1}
                value={[tacticValues[setting.id]]}
                onValueChange={(value) => handleSliderChange(setting.id, value)}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleConfirm}
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

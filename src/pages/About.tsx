import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </button>
      
      <div className="max-w-2xl mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Tentang</h1>
        <div className="space-y-4 text-gray-400 animate-slide-in">
          <p>
            Selamat datang di Football World Cup Manager, pendamping utama Anda untuk mengelola
            tim sepak bola dan kompetisi.
          </p>
          <p>
            Aplikasi ini dirancang untuk memberikan pengalaman manajemen sepak bola yang mendalam
            dengan fitur modern dan kontrol yang intuitif.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
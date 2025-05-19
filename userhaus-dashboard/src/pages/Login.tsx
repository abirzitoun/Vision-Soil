import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs !");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8081/login", {
        email,
        password,
      }, {
        withCredentials: true, // Permet d'envoyer les cookies/session
      });

      console.log("Réponse du serveur :", response.data);

      if (response.data.success) {
        const { user } = response.data;
      
        // 🔹 Vérification du statut avant connexion
        if (user.role === "engineer" && user.status !== "approved") {
          toast.error("Your account is pending approval.");
          return;
        }
       console.log(user.status)
        toast.success("Connexion réussie !");
        window.localStorage.setItem("authToken", response.data.token);
        window.localStorage.setItem("userRole", user.role);
        window.localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userId", user.id); // ✅ Correction ici

        console.log("Utilisateur connecté :", user);

        // 🔹 Redirection selon le rôle
        switch (user.role) {
          case "admin":
            window.location.href = "/admin";
            break;
          case "engineer":
            window.location.href = "/engineer";
            break;
          case "farmer":
            window.location.href = "/farmer";
            break;
          default:
            window.location.href = "/dashboard";
            break;
        }
      } else {
        toast.error(response.data.message || "Échec de la connexion.");
      }
    } catch (error: any) {
      console.error("Erreur de connexion :", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 animate-fade-in">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary tracking-wider mb-8">
              VisionSoil
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/748752d5-b978-4d52-8b9e-49122420b7c8.png"
          alt="Agriculture tech"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>
    </div>
  );
};

export default Login;

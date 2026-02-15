"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";

export default function PromotionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS POUR LA MODALE DU MATCH ---
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [latestMatch, setLatestMatch] = useState<any>(null);
  const [noMatchFound, setNoMatchFound] = useState(false); // ✅ État pour gérer l'absence de match
  // ----------------------------------------------
  
  // --- ÉTATS POUR LA MODALE CONDITIONS ---
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  // --------------------------------------

  // --- NOUVEL ÉTAT POUR LA LIGHTBOX (IMAGE EN GRAND) ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // -----------------------------------------------------

  // URL de ce site de promo
  const PROMO_URL = "https://dunkly.vercel.app";
  // URL de l'app de gestion
  const APP_URL = "https://dunkly-app.vercel.app";
  // URL de téléchargement du fichier .exe
  const EXE_DOWNLOAD_URL = "https://github.com/Anthonyz150/dunkly-app/releases/download/v.0.1.2/Dunkly.Setup.0.1.0.exe";

  useEffect(() => {
    document.title = "Dunkly - Plateforme de Résultats de Basket";
  }, []);

  useEffect(() => {
    // 1. Charger le PROCHAIN match à venir
    const fetchNextMatch = async () => {
      const now = new Date().toISOString(); 

      const { data, error } = await supabase
        .from('matchs')
        .select('*, competition(*)') 
        .gte('date', now) // Date du match >= Date actuelle
        .order('date', { ascending: true }) // Le plus proche d'abord
        .limit(1);
      
      if (error) {
        console.error("Erreur Supabase:", error);
      }
      
      if (data && data.length > 0) {
        setLatestMatch(data[0]);
        setNoMatchFound(false); // ✅ Match trouvé
      } else {
        console.log("Aucun match à venir trouvé.");
        setLatestMatch(null); 
        setNoMatchFound(true); // ✅ Aucun match trouvé
      }
    };
    fetchNextMatch();

    // 2. Écouter les changements en temps réel
    const channel = supabase
      .channel('match-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matchs',
          filter: latestMatch ? `id=eq.${latestMatch.id}` : undefined, 
        },
        (payload) => {
          console.log('Changement reçu!', payload);
          setLatestMatch(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [latestMatch?.id]);

  useEffect(() => {
    // Vérifier la session actuelle au chargement
    const getSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user);
      setLoading(false);
    };
    getSession();

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- FONCTION POUR OBTENIR L'INITIALE ---
  const getUserInitial = () => {
    if (!user) return "";
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  // --- DONNÉES DES IMAGES POUR LA LIGHTBOX ---
  const screenshotData = [
    { src: "/images/1screenshot-dashboard.png", alt: "Capture d'écran du tableau de bord Dunkly" },
    { src: "/images/screenchot-championship.png", alt: "Capture d'écran de la gestion des championnats" },
    { src: "/images/screenchot-teams.png", alt: "Capture d'écran de la gestion des équipes" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* NAVBAR */}
      <nav className="p-4 md:p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <span className="text-2xl font-bold text-white flex items-center gap-2">
          <span className='text-3xl'>🏀</span> <span className='hidden sm:inline'>DUNKLY</span>
        </span>

        {/* --- LOGIQUE D'AFFICHAGE DANS LA NAVBAR --- */}
        {loading ? (
          <div className="w-10 h-10 bg-slate-800 animate-pulse rounded-full"></div>
        ) : user ? (
          // Affiche l'initiale du profil si connecté
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href={APP_URL}
              className="text-xs md:text-sm text-slate-400 hover:text-white"
            >
              Mon Dashboard
            </Link>
            <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              {getUserInitial()}
            </div>
          </div>
        ) : (
          // --- LIEN DE TÉLÉCHARGEMENT .EXE (Visible uniquement sur PC: md:flex) ---
          <a
            href={EXE_DOWNLOAD_URL}
            download="DunklySetup.exe"
            className="hidden md:flex bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-500 transition shadow-lg items-center gap-2"
          >
            <span>📥</span> Télécharger pour Windows
          </a>
        )}

      </nav>

      {/* HERO SECTION */}
      <header className="py-16 md:py-24 text-center px-4 md:px-6 bg-slate-900 rounded-b-[30px] md:rounded-b-[40px]">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
          La plateforme des <br /> résultats de <span className="text-orange-500">Basket-ball</span>.
        </h1>
        <p className="mt-6 md:mt-8 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Retrouvez vos championnats, clubs, matchs et résultats en temps réel. Simple, rapide, efficace.
        </p>
        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* --- BOUTON REJOINDRE --- */}
          <Link
            href={`${APP_URL}/login?redirect=${encodeURIComponent(PROMO_URL)}`}
            className="inline-block bg-orange-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-full text-md md:text-lg font-bold hover:bg-orange-500 transition shadow-xl shadow-orange-950/30"
          >
            Rejoignez-nous dès maintenant
          </Link>
          
          {/* --- BOUTON POUR OUVRIR LA MODALE MATCH --- */}
          <button
            onClick={() => setIsMatchModalOpen(true)}
            className="inline-block bg-slate-700 text-white px-8 py-4 md:px-10 md:py-5 rounded-full text-md md:text-lg font-bold hover:bg-slate-600 transition"
          >
            Voir le prochain match
          </button>
          {/* -------------------------------------- */}
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: "Gestion Complète", desc: "Clubs et équipes au même endroit.", icon: "🛡️", color: "text-blue-400" },
            { title: "Matchs en Direct", desc: "Scores et résultats mis à jour instantanément.", icon: "⏱️", color: "text-green-400" },
            { title: "Championnats", desc: "Suivez les classements de toutes vos compétitions.", icon: "🏆", color: "text-yellow-400" },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className={`text-4xl mb-6 ${feature.color}`}>{feature.icon}</div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APERÇU DE L'APPLICATION (SCREENSHOTS) */}
      <section className="py-16 md:py-24 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-12">
            Aperçu de l'application
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-12">
            Découvrez l'interface intuitive de Dunkly et facilitez l'affichage des résultats.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {screenshotData.map((screenshot, index) => (
              <div 
                key={index} 
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl cursor-pointer transform transition hover:scale-105 hover:border-orange-500"
                onClick={() => setSelectedImage(screenshot.src)}
              >
                <img 
                  src={screenshot.src}
                  alt={screenshot.alt} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            ))}
          </div>
          <p className="mt-12 text-md text-slate-400">
            *Les interfaces peuvent varier légèrement en fonction des mises à jour.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12">
            Ils utilisent Dunkly
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
              <p className="text-slate-300 italic text-lg">
                "Dunkly a changé ma vison sur le basketball. Le dynamisme des résultats est incroyable !"
              </p>
              <div className="flex items-center mt-6 gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white">M</div>
                <div>
                  <p className="font-bold text-white">Marc Dubois</p>
                  <p className="text-sm text-slate-500">Utilisateur</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
              <p className="text-slate-300 italic text-lg">
                "Simple, rapide et efficace. L'application Windows est très intuitive."
              </p>
              <div className="flex items-center mt-6 gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white">S</div>
                <div>
                  <p className="font-bold text-white">Sophie Martin</p>
                  <p className="text-sm text-slate-500">Utilisateur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 md:py-24 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-lg font-bold text-white">Est-ce que Dunkly est vraiment gratuit ?</h4>
              <p className="text-slate-400 mt-2">Oui ! Dunkly est 100% gratuit pour les amateurs de basketball. Il n'y a pas d'abonnement requis.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-lg font-bold text-white">Sur quels appareils puis-je utiliser Dunkly ?</h4>
              <p className="text-slate-400 mt-2">L'application est disponible en téléchargement sur Windows (via le bouton ci-dessus). Les résultats sont consultables sur n'importe quel navigateur mobile ou ordinateur.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-lg font-bold text-white">Comment ça marche ?</h4>
              <p className="text-slate-400 mt-2">Il vous suffit de créer un compte et le tour est joué. Vous retrouverez ensuite vos équipes avec vos compétitions favorites.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="border-t border-slate-800 py-10 mt-12 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-slate-500">
          <p className="font-bold text-white mb-2">🏀 DUNKLY</p>
          <p className='text-sm'>© 2026 Dunkly. Tous droits réservés.</p>
          <button
            onClick={() => setIsTermsOpen(true)}
            className="text-sm text-slate-600 hover:text-white underline bg-transparent border-none p-0 cursor-pointer"
          >
            Conditions d'utilisation
          </button>
        </div>
      </footer>

      {/* --- MODALE CONDITIONS --- */}
      {isTermsOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Conditions d'utilisation</h2>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="text-slate-400 hover:text-white text-3xl"
              >
                &times;
              </button>
            </div>
            <div className="prose prose-invert text-slate-300">
              <p>Dernière mise à jour : 11 février 2026</p>
              <h3 className="text-xl font-bold text-white mt-4">1. Acceptation des conditions</h3>
              <p>En utilisant Dunkly, vous acceptez d'être lié par ces conditions d'utilisation.</p>
              <h3 className="text-xl font-bold text-white mt-4">2. Description du service</h3>
              <p>Dunkly est une plateforme gratuite de gestion de résultats de basket-ball.</p>
              <h3 className="text-xl font-bold text-white mt-4">3. Confidentialité</h3>
              <p>Vos données sont traitées avec soin. Nous ne vendons pas vos informations personnelles.</p>
              <h3 className="text-xl font-bold text-white mt-4">4. Modification du service</h3>
              <p>Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment.</p>
            </div>
          </div>
        </div>
      )}
      {/* ---------------------------------- */}

      {/* --- COMPOSANT MODALE MATCH EN DIRECT --- */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {noMatchFound ? "Prochain match" : "Prochain match"}
                </h2>
                <button
                    onClick={() => setIsMatchModalOpen(false)}
                    className="text-slate-400 hover:text-white text-3xl"
                >
                    &times;
                </button>
            </div>
            
            {/* ✅ LOGIQUE D'AFFICHAGE DANS LA MODALE */}
            {noMatchFound ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-4">🗓️</p>
                <h3 className="text-xl font-bold text-white">Aucun match à venir</h3>
                <p className="text-slate-400 mt-2">Revenez plus tard pour découvrir les prochaines rencontres !</p>
              </div>
            ) : latestMatch && (
              <div className="text-center">
                  {/* --- AFFICHAGE LOGO COMPETITION --- */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                      {latestMatch.competition?.logo_url && (
                          <img src={latestMatch.competition.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                      )}
                      <h3 className="text-sm text-slate-400 uppercase tracking-widest">
                          {latestMatch.competition?.nom || "Compétition"}
                      </h3>
                  </div>
                  
                  {/* --- BLOC SCORE ET LOGOS --- */}
                  <div className="flex justify-center items-center gap-4 my-8">
                      <div className="flex-1 text-right flex items-center justify-end gap-3">
                          <div className="text-xl font-bold">{latestMatch.clubA}</div>
                          {latestMatch.logo_urlA ? (
                              <img src={latestMatch.logo_urlA} alt={latestMatch.clubA} className="w-12 h-12 rounded-full object-contain bg-white p-1" />
                          ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xl">
                                  {latestMatch.clubA ? latestMatch.clubA[0] : "A"}
                              </div>
                          )}
                      </div>

                      <div className="flex items-center gap-3">
                          <div className="text-5xl font-extrabold text-orange-500">{latestMatch.scoreA ?? 0}</div>
                          <div className="text-3xl text-slate-600 font-bold">-</div>
                          <div className="text-5xl font-extrabold text-orange-500">{latestMatch.scoreB ?? 0}</div>
                      </div>

                      <div className="flex-1 text-left flex items-center justify-start gap-3">
                          {latestMatch.logo_urlB ? (
                              <img src={latestMatch.logo_urlB} alt={latestMatch.clubB} className="w-12 h-12 rounded-full object-contain bg-white p-1" />
                          ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xl">
                                  {latestMatch.clubB ? latestMatch.clubB[0] : "B"}
                              </div>
                          )}
                          <div className="text-xl font-bold">{latestMatch.clubB}</div>
                      </div>
                  </div>

                  <p className="text-slate-300 text-lg">📍 {latestMatch.lieu}</p>
                  <p className={`mt-4 font-bold ${latestMatch.status === 'termine' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {latestMatch.status === 'termine' ? '✅ Match Terminé' : '🕒 Match à venir / En cours'}
                  </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ---------------------------------- */}

      {/* --- LIGHTBOX (MODALE IMAGE AGRANDIE) --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Aperçu agrandi" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 -right-4 text-white text-4xl p-2 hover:text-orange-500 transition"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

    </div>
  );
}
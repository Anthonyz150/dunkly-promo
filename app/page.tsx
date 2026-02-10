"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; // Assurez-vous que ce chemin est correct

export default function PromotionPage() {
  const [user, setUser] = useState<any>(null);
  
  // Définissez vos URLs réelles ici
  const APP_URL = "https://app.dunkly.com";
  const PROMO_URL = "https://promo.dunkly.com"; // URL de ce site de promo
  
  // URL de redirection encodée pour le lien de connexion
  const loginUrl = `${APP_URL}/login?redirect=${encodeURIComponent(PROMO_URL)}`;

  useEffect(() => {
    // Vérifier la session actuelle au chargement
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user);
    };
    getSession();
  }, []);

  return (
    // Fond sombre style Dunkly
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <span className="text-2xl font-bold text-white flex items-center gap-2">
          <span className='text-3xl'>🏀</span> DUNKLY
        </span>

        {/* Logique d'affichage du bouton */}
        {user ? (
          <Link 
            href={APP_URL} 
            className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition shadow-lg"
          >
            Aller au Dashboard
          </Link>
        ) : (
          <Link 
            href={loginUrl} 
            className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-500 transition shadow-lg"
          >
            Se connecter
          </Link>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className="py-24 text-center px-6 bg-slate-900 rounded-b-[40px]">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
          La plateforme ultime de <br /> gestion de <span className="text-orange-500">Basket-ball</span>.
        </h1>
        <p className="mt-8 text-xl text-slate-300 max-w-2xl mx-auto">
          Gérez vos championnats, clubs, matchs et résultats en temps réel. Simple, rapide, efficace.
        </p>
        <div className="mt-12">
          <Link 
            href={`${APP_URL}/register?redirect=${encodeURIComponent(PROMO_URL)}`}
            className="bg-orange-600 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-orange-500 transition shadow-xl shadow-orange-950/30"
          >
            Créer un club gratuitement
          </Link>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Gestion Complète", desc: "Clubs, équipes et joueurs au même endroit.", icon: "🛡️", color: "text-blue-400" },
            { title: "Matchs en Direct", desc: "Scores et résultats mis à jour instantanément.", icon: "⏱️", color: "text-green-400" },
            { title: "Championnats", desc: "Suivez les classements de toutes vos compétitions.", icon: "🏆", color: "text-yellow-400" },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className={`text-4xl mb-6 ${feature.color}`}>{feature.icon}</div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="border-t border-slate-800 py-12 mt-12 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500">
          <p className="font-bold text-white mb-2">🏀 DUNKLY</p>
          <p>© 2026 Dunkly. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from 'next/link';

export default function MatchDetailPagePublic({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Charger le match initialement
    const fetchMatch = async () => {
      const { data } = await supabase
        .from('matchs')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (data) setMatch(data);
      setLoading(false);
    };

    fetchMatch();

    // 2. Écouter les changements en temps réel (ÉTAPE 3)
    const channel = supabase
      .channel('match-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matchs',
          filter: `id=eq.${matchId}`, // Écoute uniquement ce match
        },
        (payload) => {
          console.log('Changement reçu!', payload);
          setMatch(payload.new); // Met à jour l'affichage
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10">Chargement...</div>;
  if (!match) return <div className="min-h-screen bg-slate-950 text-white p-10">Match introuvable.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <Link href="/" className="text-orange-500 hover:text-orange-400 mb-6 inline-block">← Retour à l'accueil</Link>
      
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
        <h1 className="text-sm text-slate-400 uppercase tracking-widest">{match.competition}</h1>
        
        <div className="flex justify-center items-center gap-6 my-8">
            <div className="text-2xl font-bold flex-1 text-right">{match.clubA}</div>
            <div className="text-6xl font-extrabold text-orange-500">{match.scoreA}</div>
            <div className="text-4xl text-slate-600">-</div>
            <div className="text-6xl font-extrabold text-orange-500">{match.scoreB}</div>
            <div className="text-2xl font-bold flex-1 text-left">{match.clubB}</div>
        </div>

        <p className="text-slate-300 text-lg">📍 {match.lieu}</p>
        <p className={`mt-4 font-bold ${match.status === 'termine' ? 'text-green-400' : 'text-yellow-400'}`}>
            {match.status === 'termine' ? '✅ Match Terminé' : '🕒 Match à venir / En cours'}
        </p>
      </div>
    </div>
  );
}
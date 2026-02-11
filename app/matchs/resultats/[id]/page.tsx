// app/matchs/resultats/[id]/page.tsx
"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase"; 

export default function MatchDetailPagePublic({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    // 1. Charger le match initialement
    const fetchMatch = async () => {
      const { data } = await supabase
        .from('matchs')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (data) setMatch(data);
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

  if (!match) return <div>Chargement...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{match.clubA} vs {match.clubB}</h1>
      <p>Score: {match.scoreA} - {match.scoreB}</p>
      <p>Statut: {match.status}</p>
    </div>
  );
}
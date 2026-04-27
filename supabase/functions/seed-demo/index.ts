// Seed demo data for TTAP Maroc
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CITIES = ["Marrakech", "Agadir", "Fès", "Ouarzazate", "Chefchaouen", "Casablanca", "Rabat", "Tanger"];
const COMPANY_NAMES = [
  "Atlas Travel Services", "Sahara Express Tours", "Médina Transport", "Royal Maroc Coach",
  "Désert & Oasis Voyages", "Riad Shuttle", "Kasbah Lines", "Tanjawi Tours",
  "Phoenicia Trans", "Berber Wheels",
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(a: T[]) => a[rand(0, a.length - 1)];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Skip if already seeded
    const { count } = await supabase.from("transporters").select("*", { count: "exact", head: true });
    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ ok: true, seeded: false, message: "Déjà initialisé" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transporters
    const transportersPayload = COMPANY_NAMES.map((name) => ({
      company_name: name,
      phone: `+212 6${rand(10, 99)} ${rand(100, 999)} ${rand(100, 999)}`,
      email: `contact@${name.toLowerCase().replace(/[^a-z]/g, "")}.ma`,
    }));
    const { data: transporters, error: tErr } = await supabase.from("transporters").insert(transportersPayload).select();
    if (tErr) throw tErr;

    // Destinations
    const destPayload = CITIES.map((c) => ({ city_name: c }));
    const { error: dErr } = await supabase.from("destinations").insert(destPayload);
    if (dErr) throw dErr;

    // Trips (100, seasonal weighting)
    const tripsPayload: any[] = [];
    while (tripsPayload.length < 100) {
      let dep = pick(CITIES);
      let dest = pick(CITIES);
      while (dest === dep) dest = pick(CITIES);
      const month = rand(0, 11);
      const day = rand(1, 28);
      const seasonalBoost = [0, 1, 2, 5, 6, 7, 8, 9].includes(month) ? 1 : 0.4;
      if (Math.random() > seasonalBoost) continue;
      tripsPayload.push({
        transporter_id: pick(transporters!).id,
        departure_city: dep,
        destination_city: dest,
        date: `2025-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        price: rand(80, 850),
      });
    }
    const { data: trips, error: trErr } = await supabase.from("trips").insert(tripsPayload).select();
    if (trErr) throw trErr;

    // Reservations (300)
    const resPayload = Array.from({ length: 300 }, () => ({
      trip_id: pick(trips!).id,
      number_of_passengers: rand(1, 12),
    }));
    const { error: rErr } = await supabase.from("reservations").insert(resPayload);
    if (rErr) throw rErr;

    return new Response(JSON.stringify({
      ok: true, seeded: true,
      counts: { transporters: transporters!.length, destinations: CITIES.length, trips: trips!.length, reservations: 300 },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

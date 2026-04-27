// Supabase-backed data layer using React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Transporter = {
  id: string;
  company_name: string;
  phone: string | null;
  email: string | null;
};

export type Destination = {
  id: string;
  city_name: string;
};

export type Trip = {
  id: string;
  transporter_id: string | null;
  departure_city: string;
  destination_city: string;
  date: string;
  price: number;
};

export type Reservation = {
  id: string;
  trip_id: string;
  number_of_passengers: number;
};

export type DB = {
  transporters: Transporter[];
  destinations: Destination[];
  trips: Trip[];
  reservations: Reservation[];
};

const EMPTY_DB: DB = { transporters: [], destinations: [], trips: [], reservations: [] };

async function fetchAll(): Promise<DB> {
  const [t, d, tr, r] = await Promise.all([
    supabase.from("transporters").select("*").order("company_name"),
    supabase.from("destinations").select("*").order("city_name"),
    supabase.from("trips").select("*").order("date", { ascending: false }).limit(1000),
    supabase.from("reservations").select("*").limit(1000),
  ]);
  return {
    transporters: (t.data ?? []) as Transporter[],
    destinations: (d.data ?? []) as Destination[],
    trips: ((tr.data ?? []) as any[]).map((x) => ({ ...x, price: Number(x.price) })) as Trip[],
    reservations: (r.data ?? []) as Reservation[],
  };
}

export function useDB(): DB {
  const { data } = useQuery({ queryKey: ["db"], queryFn: fetchAll });
  return data ?? EMPTY_DB;
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["db"] });
}

// Mutations exposed as a hook
export function useStore() {
  const invalidate = useInvalidate();

  return {
    // Transporters
    addTransporter: async (t: Omit<Transporter, "id">) => {
      const { error } = await supabase.from("transporters").insert(t);
      if (error) throw error;
      invalidate();
    },
    updateTransporter: async (id: string, t: Partial<Transporter>) => {
      const { error } = await supabase.from("transporters").update(t).eq("id", id);
      if (error) throw error;
      invalidate();
    },
    deleteTransporter: async (id: string) => {
      const { error } = await supabase.from("transporters").delete().eq("id", id);
      if (error) throw error;
      invalidate();
    },

    // Destinations
    addDestination: async (d: Omit<Destination, "id">) => {
      const { error } = await supabase.from("destinations").insert(d);
      if (error) throw error;
      invalidate();
    },
    updateDestination: async (id: string, d: Partial<Destination>) => {
      const { error } = await supabase.from("destinations").update(d).eq("id", id);
      if (error) throw error;
      invalidate();
    },
    deleteDestination: async (id: string) => {
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
      invalidate();
    },

    // Trips
    addTrip: async (t: Omit<Trip, "id">) => {
      const { error } = await supabase.from("trips").insert(t);
      if (error) throw error;
      invalidate();
    },
    updateTrip: async (id: string, t: Partial<Trip>) => {
      const { error } = await supabase.from("trips").update(t).eq("id", id);
      if (error) throw error;
      invalidate();
    },
    deleteTrip: async (id: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
      invalidate();
    },

    // Reservations
    addReservation: async (r: Omit<Reservation, "id">) => {
      const { error } = await supabase.from("reservations").insert(r);
      if (error) throw error;
      invalidate();
    },
    updateReservation: async (id: string, r: Partial<Reservation>) => {
      const { error } = await supabase.from("reservations").update(r).eq("id", id);
      if (error) throw error;
      invalidate();
    },
    deleteReservation: async (id: string) => {
      const { error } = await supabase.from("reservations").delete().eq("id", id);
      if (error) throw error;
      invalidate();
    },
  };
}

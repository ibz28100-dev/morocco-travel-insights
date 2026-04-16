// In-memory data store with localStorage persistence + demo seed
export type Transporter = {
  id: string;
  company_name: string;
  phone: string;
  email: string;
};

export type Destination = {
  id: string;
  city_name: string;
};

export type Trip = {
  id: string;
  transporter_id: string;
  departure_city: string;
  destination_city: string;
  date: string; // ISO date
  price: number;
};

export type Reservation = {
  id: string;
  trip_id: string;
  number_of_passengers: number;
};

const KEY = "ttap-morocco-data-v1";

const CITIES = ["Marrakech", "Agadir", "Fès", "Ouarzazate", "Chefchaouen", "Casablanca", "Rabat", "Tanger"];

const COMPANY_NAMES = [
  "Atlas Travel Services",
  "Sahara Express Tours",
  "Médina Transport",
  "Royal Maroc Coach",
  "Désert & Oasis Voyages",
  "Riad Shuttle",
  "Kasbah Lines",
  "Tanjawi Tours",
  "Phoenicia Trans",
  "Berber Wheels",
];

const uid = () => Math.random().toString(36).slice(2, 10);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(a: T[]) => a[rand(0, a.length - 1)];

function generateSeed() {
  const transporters: Transporter[] = COMPANY_NAMES.map((name, i) => ({
    id: uid(),
    company_name: name,
    phone: `+212 6${rand(10, 99)} ${rand(100, 999)} ${rand(100, 999)}`,
    email: `contact@${name.toLowerCase().replace(/[^a-z]/g, "")}.ma`,
  }));

  const destinations: Destination[] = CITIES.map((c) => ({ id: uid(), city_name: c }));

  const trips: Trip[] = [];
  for (let i = 0; i < 100; i++) {
    let dep = pick(CITIES);
    let dest = pick(CITIES);
    while (dest === dep) dest = pick(CITIES);
    const month = rand(0, 11);
    const day = rand(1, 28);
    // Seasonal weighting: more trips in summer & spring
    const seasonalBoost = [0, 1, 2, 5, 6, 7, 8, 9].includes(month) ? 1 : 0.4;
    if (Math.random() > seasonalBoost) { i--; continue; }
    trips.push({
      id: uid(),
      transporter_id: pick(transporters).id,
      departure_city: dep,
      destination_city: dest,
      date: new Date(2025, month, day).toISOString().slice(0, 10),
      price: rand(80, 850),
    });
  }

  const reservations: Reservation[] = [];
  for (let i = 0; i < 300; i++) {
    reservations.push({
      id: uid(),
      trip_id: pick(trips).id,
      number_of_passengers: rand(1, 12),
    });
  }

  return { transporters, destinations, trips, reservations };
}

type DB = ReturnType<typeof generateSeed>;

function load(): DB {
  if (typeof window === "undefined") return generateSeed();
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fallthrough */ }
  }
  const seed = generateSeed();
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

let db: DB = load();
const listeners = new Set<() => void>();
const emit = () => { save(db); listeners.forEach((l) => l()); };

export const store = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  getSnapshot: () => db,
  reset() { localStorage.removeItem(KEY); db = load(); emit(); },

  // Transporters
  addTransporter(t: Omit<Transporter, "id">) { db.transporters.push({ ...t, id: uid() }); emit(); },
  updateTransporter(id: string, t: Partial<Transporter>) {
    db.transporters = db.transporters.map((x) => (x.id === id ? { ...x, ...t } : x)); emit();
  },
  deleteTransporter(id: string) {
    db.transporters = db.transporters.filter((x) => x.id !== id); emit();
  },

  // Destinations
  addDestination(d: Omit<Destination, "id">) { db.destinations.push({ ...d, id: uid() }); emit(); },
  updateDestination(id: string, d: Partial<Destination>) {
    db.destinations = db.destinations.map((x) => (x.id === id ? { ...x, ...d } : x)); emit();
  },
  deleteDestination(id: string) {
    db.destinations = db.destinations.filter((x) => x.id !== id); emit();
  },

  // Trips
  addTrip(t: Omit<Trip, "id">) { db.trips.push({ ...t, id: uid() }); emit(); },
  updateTrip(id: string, t: Partial<Trip>) {
    db.trips = db.trips.map((x) => (x.id === id ? { ...x, ...t } : x)); emit();
  },
  deleteTrip(id: string) {
    db.trips = db.trips.filter((x) => x.id !== id);
    db.reservations = db.reservations.filter((r) => r.trip_id !== id);
    emit();
  },

  // Reservations
  addReservation(r: Omit<Reservation, "id">) { db.reservations.push({ ...r, id: uid() }); emit(); },
  updateReservation(id: string, r: Partial<Reservation>) {
    db.reservations = db.reservations.map((x) => (x.id === id ? { ...x, ...r } : x)); emit();
  },
  deleteReservation(id: string) {
    db.reservations = db.reservations.filter((x) => x.id !== id); emit();
  },
};

import { useEffect, useState } from "react";
export function useDB() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => setTick((n) => n + 1));
    return () => { unsub; };
  }, []);
  return store.getSnapshot();
}

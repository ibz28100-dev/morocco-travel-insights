import marrakech from "@/assets/cities/marrakech.jpg";
import agadir from "@/assets/cities/agadir.jpg";
import fes from "@/assets/cities/fes.jpg";
import ouarzazate from "@/assets/cities/ouarzazate.jpg";
import chefchaouen from "@/assets/cities/chefchaouen.jpg";
import casablanca from "@/assets/cities/casablanca.jpg";
import rabat from "@/assets/cities/rabat.jpg";
import tangier from "@/assets/cities/tangier.jpg";

export const CITY_IMAGES: Record<string, string> = {
  Marrakech: marrakech,
  Agadir: agadir,
  Fès: fes,
  Ouarzazate: ouarzazate,
  Chefchaouen: chefchaouen,
  Casablanca: casablanca,
  Rabat: rabat,
  Tanger: tangier,
};

export const CITY_DESCRIPTIONS: Record<string, string> = {
  Marrakech: "La ville rouge, joyau impérial et place Jemaa el-Fna.",
  Agadir: "Station balnéaire de l'Atlantique, plages de sable doré.",
  Fès: "Capitale spirituelle, médina classée UNESCO.",
  Ouarzazate: "Porte du désert, kasbahs et studios de cinéma.",
  Chefchaouen: "La perle bleue du Rif, ruelles peintes en azur.",
  Casablanca: "Métropole économique, mosquée Hassan II.",
  Rabat: "Capitale royale, Kasbah des Oudayas.",
  Tanger: "Porte de l'Afrique, détroit de Gibraltar.",
};

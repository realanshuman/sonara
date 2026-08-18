import type { Drug } from "./types";

/**
 * Demo drug reference — a hand-picked slice of commonly prescribed Indian
 * brands so the prescription builder and allergy check have something real
 * to resolve against.
 *
 * FR-RX-2 (PRD §6.8): production must licence a real Indian drug database.
 * This file is a stand-in for development only — it is deliberately small
 * and deliberately not generated.
 */
export const DRUGS: Drug[] = [
  { id: "d-dolo650", brand: "Dolo 650", generic: "Paracetamol", salt: "Paracetamol", strength: "650mg", form: "tablet", schedule: "OTC" },
  { id: "d-crocin", brand: "Crocin Advance", generic: "Paracetamol", salt: "Paracetamol", strength: "500mg", form: "tablet", schedule: "OTC" },
  { id: "d-calpol", brand: "Calpol 250", generic: "Paracetamol", salt: "Paracetamol", strength: "250mg/5ml", form: "syrup", schedule: "OTC" },
  { id: "d-azithral", brand: "Azithral 500", generic: "Azithromycin", salt: "Azithromycin", strength: "500mg", form: "tablet", schedule: "H", saltFamily: "macrolide" },
  { id: "d-mox", brand: "Mox 500", generic: "Amoxicillin", salt: "Amoxicillin", strength: "500mg", form: "capsule", schedule: "H", saltFamily: "penicillin" },
  { id: "d-augmentin", brand: "Augmentin 625 Duo", generic: "Amoxicillin + Clavulanic acid", salt: "Amoxicillin 500mg + Clavulanate 125mg", strength: "625mg", form: "tablet", schedule: "H", saltFamily: "penicillin" },
  { id: "d-pan40", brand: "Pan 40", generic: "Pantoprazole", salt: "Pantoprazole", strength: "40mg", form: "tablet", schedule: "H" },
  { id: "d-omez", brand: "Omez 20", generic: "Omeprazole", salt: "Omeprazole", strength: "20mg", form: "capsule", schedule: "H" },
  { id: "d-telma", brand: "Telma 40", generic: "Telmisartan", salt: "Telmisartan", strength: "40mg", form: "tablet", schedule: "H" },
  { id: "d-telma-h", brand: "Telma H", generic: "Telmisartan + Hydrochlorothiazide", salt: "Telmisartan 40mg + HCTZ 12.5mg", strength: "40/12.5mg", form: "tablet", schedule: "H" },
  { id: "d-amlong", brand: "Amlong 5", generic: "Amlodipine", salt: "Amlodipine", strength: "5mg", form: "tablet", schedule: "H" },
  { id: "d-ecosprin", brand: "Ecosprin 75", generic: "Aspirin", salt: "Acetylsalicylic acid", strength: "75mg", form: "tablet", schedule: "H", saltFamily: "nsaid" },
  { id: "d-glycomet", brand: "Glycomet 500 SR", generic: "Metformin", salt: "Metformin", strength: "500mg", form: "tablet", schedule: "H" },
  { id: "d-amaryl", brand: "Amaryl 1", generic: "Glimepiride", salt: "Glimepiride", strength: "1mg", form: "tablet", schedule: "H" },
  { id: "d-montair", brand: "Montair LC", generic: "Montelukast + Levocetirizine", salt: "Montelukast 10mg + Levocetirizine 5mg", strength: "10/5mg", form: "tablet", schedule: "H" },
  { id: "d-allegra", brand: "Allegra 120", generic: "Fexofenadine", salt: "Fexofenadine", strength: "120mg", form: "tablet", schedule: "H" },
  { id: "d-cetzine", brand: "Cetzine 10", generic: "Cetirizine", salt: "Cetirizine", strength: "10mg", form: "tablet", schedule: "OTC" },
  { id: "d-sinarest", brand: "Sinarest", generic: "Paracetamol + Phenylephrine + CPM", salt: "Paracetamol 500mg + Phenylephrine 10mg + Chlorpheniramine 2mg", strength: "—", form: "tablet", schedule: "OTC" },
  { id: "d-otrivin", brand: "Otrivin 0.1%", generic: "Xylometazoline", salt: "Xylometazoline", strength: "0.1%", form: "nasal drops", schedule: "OTC" },
  { id: "d-ascoril", brand: "Ascoril LS", generic: "Ambroxol + Levosalbutamol + Guaifenesin", salt: "Ambroxol 30mg + Levosalbutamol 1mg + Guaifenesin 50mg", strength: "per 5ml", form: "syrup", schedule: "H" },
  { id: "d-grilinctus", brand: "Grilinctus", generic: "Dextromethorphan + CPM", salt: "Dextromethorphan 5mg + Chlorpheniramine 2.5mg", strength: "per 5ml", form: "syrup", schedule: "H" },
  { id: "d-betadine", brand: "Betadine Gargle", generic: "Povidone-iodine", salt: "Povidone-iodine 2%", strength: "2%", form: "gargle", schedule: "OTC" },
  { id: "d-electral", brand: "Electral", generic: "ORS", salt: "WHO oral rehydration salts", strength: "21.8g sachet", form: "powder", schedule: "OTC" },
  { id: "d-rantac", brand: "Rantac 150", generic: "Ranitidine", salt: "Ranitidine", strength: "150mg", form: "tablet", schedule: "H" },
  { id: "d-zerodol", brand: "Zerodol SP", generic: "Aceclofenac + Serratiopeptidase + Paracetamol", salt: "Aceclofenac 100mg + Serratiopeptidase 15mg + Paracetamol 325mg", strength: "—", form: "tablet", schedule: "H", saltFamily: "nsaid" },
  { id: "d-combiflam", brand: "Combiflam", generic: "Ibuprofen + Paracetamol", salt: "Ibuprofen 400mg + Paracetamol 325mg", strength: "—", form: "tablet", schedule: "OTC", saltFamily: "nsaid" },
  { id: "d-ibugesic", brand: "Ibugesic Plus", generic: "Ibuprofen + Paracetamol", salt: "Ibuprofen 100mg + Paracetamol 162.5mg", strength: "per 5ml", form: "syrup", schedule: "OTC", saltFamily: "nsaid" },
  { id: "d-shelcal", brand: "Shelcal 500", generic: "Calcium + Vitamin D3", salt: "Calcium carbonate 1250mg + Vit D3 250IU", strength: "500mg", form: "tablet", schedule: "OTC" },
  { id: "d-becosules", brand: "Becosules", generic: "B-complex + Vitamin C", salt: "B-complex with Vitamin C", strength: "—", form: "capsule", schedule: "OTC" },
  { id: "d-thyronorm", brand: "Thyronorm 50", generic: "Levothyroxine", salt: "Levothyroxine sodium", strength: "50mcg", form: "tablet", schedule: "H" },
  { id: "d-eltroxin", brand: "Eltroxin 25", generic: "Levothyroxine", salt: "Levothyroxine sodium", strength: "25mcg", form: "tablet", schedule: "H" },
  { id: "d-asthalin", brand: "Asthalin Inhaler", generic: "Salbutamol", salt: "Salbutamol 100mcg/dose", strength: "100mcg", form: "inhaler", schedule: "H" },
  { id: "d-budecort", brand: "Budecort 200", generic: "Budesonide", salt: "Budesonide 200mcg/dose", strength: "200mcg", form: "inhaler", schedule: "H" },
  { id: "d-deriphyllin", brand: "Deriphyllin", generic: "Etofylline + Theophylline", salt: "Etofylline 77mg + Theophylline 23mg", strength: "—", form: "tablet", schedule: "H" },
  { id: "d-norflox", brand: "Norflox TZ", generic: "Norfloxacin + Tinidazole", salt: "Norfloxacin 400mg + Tinidazole 600mg", strength: "—", form: "tablet", schedule: "H", saltFamily: "fluoroquinolone" },
  { id: "d-sporlac", brand: "Sporlac DS", generic: "Lactobacillus", salt: "Lactic acid bacillus 120M spores", strength: "—", form: "tablet", schedule: "OTC" },
  { id: "d-cyclopam", brand: "Cyclopam", generic: "Dicyclomine + Paracetamol", salt: "Dicyclomine 20mg + Paracetamol 500mg", strength: "—", form: "tablet", schedule: "H" },
  { id: "d-meftal", brand: "Meftal Spas", generic: "Mefenamic acid + Dicyclomine", salt: "Mefenamic acid 250mg + Dicyclomine 10mg", strength: "—", form: "tablet", schedule: "H", saltFamily: "nsaid" },
  { id: "d-volini", brand: "Volini Gel", generic: "Diclofenac", salt: "Diclofenac diethylamine 1.16%", strength: "30g", form: "gel", schedule: "OTC", saltFamily: "nsaid" },
  { id: "d-chymoral", brand: "Chymoral Forte", generic: "Trypsin + Chymotrypsin", salt: "Trypsin-chymotrypsin 100000 AU", strength: "—", form: "tablet", schedule: "H" },
];

export function searchDrugs(q: string, limit = 8): Drug[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const scored = DRUGS.map((d) => {
    const brand = d.brand.toLowerCase();
    const generic = d.generic.toLowerCase();
    let score = -1;
    if (brand.startsWith(s)) score = 100;
    else if (brand.includes(s)) score = 60;
    else if (generic.startsWith(s)) score = 50;
    else if (generic.includes(s)) score = 30;
    else if (d.salt.toLowerCase().includes(s)) score = 20;
    return { d, score };
  })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.d.brand.localeCompare(b.d.brand));
  return scored.slice(0, limit).map((x) => x.d);
}

export function drugById(id?: string): Drug | undefined {
  return id ? DRUGS.find((d) => d.id === id) : undefined;
}

/**
 * FR-RX-3 — blocking allergy check. Matches a drug (or free text) against
 * the patient's recorded allergy labels via salt families and substrings.
 */
export function allergyConflict(
  drug: { drugId?: string; freeTextName?: string },
  allergyLabels: string[],
): { allergy: string; drugName: string } | null {
  const record = drugById(drug.drugId);
  const name = record?.brand ?? drug.freeTextName ?? "";
  const hay = [
    record?.brand,
    record?.generic,
    record?.salt,
    record?.saltFamily,
    drug.freeTextName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const FAMILIES: Record<string, string[]> = {
    penicillin: ["penicillin", "amoxicillin", "ampicillin", "amoxyclav", "augmentin"],
    nsaid: ["nsaid", "ibuprofen", "diclofenac", "aspirin", "aceclofenac", "mefenamic", "naproxen"],
    sulfa: ["sulfa", "sulphonamide", "sulfamethoxazole", "cotrimoxazole"],
    macrolide: ["macrolide", "azithromycin", "erythromycin", "clarithromycin"],
    fluoroquinolone: ["fluoroquinolone", "quinolone", "ciprofloxacin", "norfloxacin", "ofloxacin"],
  };

  for (const raw of allergyLabels) {
    const a = raw.toLowerCase();
    // direct substring either way
    if (a && (hay.includes(a) || a.split(/[\s(]/).some((w) => w.length > 3 && hay.includes(w)))) {
      return { allergy: raw, drugName: name };
    }
    // family expansion: allergy label names a family member or the family
    for (const [family, members] of Object.entries(FAMILIES)) {
      const allergyInFamily = members.some((m) => a.includes(m)) || a.includes(family);
      const drugInFamily =
        record?.saltFamily === family || members.some((m) => hay.includes(m));
      if (allergyInFamily && drugInFamily) {
        return { allergy: raw, drugName: name };
      }
    }
  }
  return null;
}

export const FREQUENCIES = [
  { value: "1-0-1", label: "1-0-1 · morning & night" },
  { value: "1-1-1", label: "1-1-1 · thrice daily" },
  { value: "1-0-0", label: "1-0-0 · morning" },
  { value: "0-0-1", label: "0-0-1 · night" },
  { value: "1-1-1-1", label: "QID · four times" },
  { value: "SOS", label: "SOS · when needed" },
  { value: "STAT", label: "STAT · once now" },
  { value: "weekly", label: "Once a week" },
];

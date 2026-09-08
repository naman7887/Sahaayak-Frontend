// Cooperative & Federation Service
// Addresses SIH Problem Statement SIH26089 (Cooperative Gig Services Platform)

const LOCAL_STORAGE_COOPS_KEY = "sahaayak_cooperatives_data";

const DEFAULT_COOPERATIVES = [
  {
    id: "coop-001",
    name: "Delhi Shramik Sahakari Samiti",
    registrationNumber: "DL/COOP/2023/1049",
    type: "Primary Cooperative Society",
    state: "Delhi",
    city: "New Delhi",
    address: "Pahar Ganj Community Center, New Delhi - 110055",
    contactPerson: "Ramesh Sharma",
    phone: "+91 98101 23456",
    email: "contact@delhishramik.org",
    isActive: true,
    totalWorkers: 85,
    establishedYear: 2021,
    servicesCovered: ["Electrician", "Plumber", "Carpenter"],
    federationId: "fed-001",
  },
  {
    id: "coop-002",
    name: "Maharashtra Griha Seva Sahakari Sanstha",
    registrationNumber: "MH/PUN/2022/8821",
    type: "Primary Cooperative Society",
    state: "Maharashtra",
    city: "Pune",
    address: "Shivaji Nagar, Pune, Maharashtra - 411005",
    contactPerson: "Sunita Patil",
    phone: "+91 98220 87654",
    email: "info@grihaseva.org",
    isActive: true,
    totalWorkers: 112,
    establishedYear: 2022,
    servicesCovered: ["Domestic Helper", "Caregiver", "Cleaner"],
    federationId: "fed-001",
  },
  {
    id: "coop-003",
    name: "Bengaluru Urban Artisan Cooperative",
    registrationNumber: "KA/BLR/2024/5512",
    type: "Primary Cooperative Society",
    state: "Karnataka",
    city: "Bengaluru",
    address: "Jayanagar 4th Block, Bengaluru, Karnataka - 560011",
    contactPerson: "K. Venkatesh",
    phone: "+91 94480 34567",
    email: "artisan.coop@blr.org",
    isActive: true,
    totalWorkers: 64,
    establishedYear: 2024,
    servicesCovered: ["Painter", "Technician", "Gardener"],
    federationId: "fed-002",
  },
  {
    id: "coop-004",
    name: "Lucknow Kaushal Vikas Sahakari",
    registrationNumber: "UP/LKO/2023/7719",
    type: "Primary Cooperative Society",
    state: "Uttar Pradesh",
    city: "Lucknow",
    address: "Hazratganj Market Complex, Lucknow, UP - 226001",
    contactPerson: "Mahesh Chandra",
    phone: "+91 94150 99887",
    email: "lko.sahakari@upcoop.org",
    isActive: true,
    totalWorkers: 73,
    establishedYear: 2023,
    servicesCovered: ["Driver", "Electrician", "Cleaners"],
    federationId: "fed-002",
  },
];

const DEFAULT_FEDERATIONS = [
  {
    id: "fed-001",
    name: "National Federation of Urban & Domestic Gig Workers (NFUDGW)",
    registrationNumber: "MSCS/HQ/2024/0089",
    type: "Apex Multi-State Cooperative Federation",
    state: "National",
    headquarters: "New Delhi",
    registeredUnder: "Multi-State Co-operative Societies Act, 2002",
    affiliatedSocietiesCount: 18,
    totalCoveredWorkers: 1850,
    welfareFundBalance: "₹ 42,50,000",
    president: "Dr. Arvind Swaminathan",
    contactEmail: "apex@nfudgw.gov.in",
  },
  {
    id: "fed-002",
    name: "All India Federation of Technical & Artisan Cooperatives",
    registrationNumber: "MSCS/HQ/2025/0114",
    type: "State Apex Federation",
    state: "Multi-State (North & South Zones)",
    headquarters: "Bengaluru",
    registeredUnder: "Multi-State Co-operative Societies Act, 2002",
    affiliatedSocietiesCount: 12,
    totalCoveredWorkers: 1240,
    welfareFundBalance: "₹ 28,00,000",
    president: "Smt. Kamala Nair",
    contactEmail: "contact@artisanfederation.org",
  },
];

export const cooperativeService = {
  getCooperatives: async () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_COOPS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    localStorage.setItem(LOCAL_STORAGE_COOPS_KEY, JSON.stringify(DEFAULT_COOPERATIVES));
    return DEFAULT_COOPERATIVES;
  },

  getFederations: async () => {
    return DEFAULT_FEDERATIONS;
  },

  addCooperative: async (coopData) => {
    const list = await cooperativeService.getCooperatives();
    const newCoop = {
      ...coopData,
      id: `coop-${Date.now().toString().slice(-4)}`,
      totalWorkers: 0,
      isActive: true,
      establishedYear: new Date().getFullYear(),
    };
    const updated = [newCoop, ...list];
    localStorage.setItem(LOCAL_STORAGE_COOPS_KEY, JSON.stringify(updated));
    return newCoop;
  },

  toggleCooperativeStatus: async (id) => {
    const list = await cooperativeService.getCooperatives();
    const updated = list.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    localStorage.setItem(LOCAL_STORAGE_COOPS_KEY, JSON.stringify(updated));
    return updated.find((c) => c.id === id);
  },
};

export default cooperativeService;

// ===== ENUMS =====
export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
}

export const PRODUCTION_STATUS = {
  AVAILABLE: 'AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
}

export const SALE_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDEE: 'VALIDEE',
  ANNULEE: 'ANNULEE',
}

export const INVOICE_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  UNPAID: 'UNPAID',
}

// ===== UTILISATEURS =====
export const users = [
  {
    id: 1,
    nom: 'Benali',
    prenom: 'Ahmed',
    email: 'admin@halaldistrib.fr',
    accessCode: 'ADM001',
    role: 'ADMIN',
    status: STATUS.ACTIVE,
    dateCreation: '2024-01-15',
  },
  {
    id: 2,
    nom: 'Kaddour',
    prenom: 'Fatima',
    email: 'ventes@halaldistrib.fr',
    accessCode: 'VNT001',
    role: 'SALES',
    status: STATUS.ACTIVE,
    dateCreation: '2024-02-20',
  },
  {
    id: 3,
    nom: 'Mansouri',
    prenom: 'Youssef',
    email: 'stock@halaldistrib.fr',
    accessCode: 'STK001',
    role: 'STOCK',
    status: STATUS.ACTIVE,
    dateCreation: '2024-03-10',
  },
  {
    id: 4,
    nom: 'Amrani',
    prenom: 'Sara',
    email: 'sara.amrani@halaldistrib.fr',
    accessCode: 'VNT002',
    role: 'SALES',
    status: STATUS.INACTIVE,
    dateCreation: '2024-04-05',
  },
]

// ===== FOURNISSEURS =====
export const suppliers = [
  {
    id: 1,
    nom: 'Abattoir Halal Lyon',
    adresse: '45 Rue de la Viande, 69000 Lyon',
    contact: '04 72 00 00 01',
    email: 'contact@abattoirlyon.fr',
  },
  {
    id: 2,
    nom: 'Ferme Bio Halal Marseille',
    adresse: '12 Chemin des Oliviers, 13000 Marseille',
    contact: '04 91 00 00 02',
    email: 'info@fermebiohalal.fr',
  },
  {
    id: 3,
    nom: 'Boucherie Gros Paris',
    adresse: '78 Avenue des Champs, 75008 Paris',
    contact: '01 42 00 00 03',
    email: 'commandes@boucherieparis.fr',
  },
  {
    id: 4,
    nom: 'Viandes Halal du Sud',
    adresse: '23 Boulevard du Commerce, 31000 Toulouse',
    contact: '05 61 00 00 04',
    email: 'ventes@viandessud.fr',
  },
]

// ===== CLIENTS =====
export const clients = [
  {
    id: 1,
    nom: 'Boucherie Al Baraka',
    adresse: '15 Rue du Marché, 75011 Paris',
    contact: '01 43 00 00 10',
    email: 'albaraka@email.fr',
    type: 'Boutique',
  },
  {
    id: 2,
    nom: 'Restaurant Le Palmier',
    adresse: '89 Avenue de la République, 93100 Montreuil',
    contact: '01 48 00 00 11',
    email: 'lepalmier@resto.fr',
    type: 'Entreprise',
  },
  {
    id: 3,
    nom: 'Superette Médina',
    adresse: '34 Rue Jean Jaurès, 93200 Saint-Denis',
    contact: '01 49 00 00 12',
    email: 'medina@superette.fr',
    type: 'Point de vente local',
  },
  {
    id: 4,
    nom: 'Traiteur Salam',
    adresse: '56 Rue de la Paix, 75002 Paris',
    contact: '01 42 00 00 13',
    email: 'salam.traiteur@email.fr',
    type: 'Entreprise',
  },
  {
    id: 5,
    nom: 'Boucherie Essalam',
    adresse: '22 Rue des Lilas, 69003 Lyon',
    contact: '04 78 00 00 14',
    email: 'essalam@boucherie.fr',
    type: 'Boutique',
  },
]

// ===== ARTICLES (avec categorie) =====
export const articles = [
  {
    id: 1,
    reference: 'ART-001',
    nom: 'Poulet Halal Entier',
    prix: 8.50,
    unite: 'kg',
    categorie: 'Volaille',
    seuilMinimum: 50,
  },
  {
    id: 2,
    reference: 'ART-002',
    nom: 'Cuisses de Poulet Halal',
    prix: 6.90,
    unite: 'kg',
    categorie: 'Volaille',
    seuilMinimum: 30,
  },
  {
    id: 3,
    reference: 'ART-003',
    nom: 'Filet de Poulet Halal',
    prix: 12.50,
    unite: 'kg',
    categorie: 'Volaille',
    seuilMinimum: 20,
  },
  {
    id: 4,
    reference: 'ART-004',
    nom: 'Viande Hachée Boeuf Halal',
    prix: 14.90,
    unite: 'kg',
    categorie: 'Boeuf',
    seuilMinimum: 40,
  },
  {
    id: 5,
    reference: 'ART-005',
    nom: 'Entrecôte Boeuf Halal',
    prix: 24.90,
    unite: 'kg',
    categorie: 'Boeuf',
    seuilMinimum: 15,
  },
  {
    id: 6,
    reference: 'ART-006',
    nom: 'Gigot Agneau Halal',
    prix: 18.50,
    unite: 'kg',
    categorie: 'Agneau',
    seuilMinimum: 25,
  },
  {
    id: 7,
    reference: 'ART-007',
    nom: 'Côtelettes Agneau Halal',
    prix: 22.00,
    unite: 'kg',
    categorie: 'Agneau',
    seuilMinimum: 20,
  },
  {
    id: 8,
    reference: 'ART-008',
    nom: 'Merguez Halal',
    prix: 11.90,
    unite: 'kg',
    categorie: 'Charcuterie',
    seuilMinimum: 50,
  },
]

// ===== LOTS DE PRODUCTION =====
export const productionLots = [
  {
    id: 1,
    numeroLot: 'LOT-2024-001',
    articleId: 1,
    articleNom: 'Poulet Halal Entier',
    quantite: 500,
    status: PRODUCTION_STATUS.AVAILABLE,
    dateProduction: '2024-11-01',
    certificatAbattage: 'CERT-HAL-2024-001',
  },
  {
    id: 2,
    numeroLot: 'LOT-2024-002',
    articleId: 4,
    articleNom: 'Viande Hachée Boeuf Halal',
    quantite: 300,
    status: PRODUCTION_STATUS.AVAILABLE,
    dateProduction: '2024-11-05',
    certificatAbattage: 'CERT-HAL-2024-002',
  },
  {
    id: 3,
    numeroLot: 'LOT-2024-003',
    articleId: 6,
    articleNom: 'Gigot Agneau Halal',
    quantite: 150,
    status: PRODUCTION_STATUS.IN_PROGRESS,
    dateProduction: '2024-11-10',
    certificatAbattage: 'CERT-HAL-2024-003',
  },
  {
    id: 4,
    numeroLot: 'LOT-2024-004',
    articleId: 8,
    articleNom: 'Merguez Halal',
    quantite: 400,
    status: PRODUCTION_STATUS.AVAILABLE,
    dateProduction: '2024-11-12',
    certificatAbattage: 'CERT-HAL-2024-004',
  },
]

// ===== STOCK =====
export const stock = [
  {
    id: 1,
    articleId: 1,
    articleNom: 'Poulet Halal Entier',
    quantiteDisponible: 450,
    derniereMiseAJour: '2024-11-15',
  },
  {
    id: 2,
    articleId: 2,
    articleNom: 'Cuisses de Poulet Halal',
    quantiteDisponible: 280,
    derniereMiseAJour: '2024-11-14',
  },
  {
    id: 3,
    articleId: 3,
    articleNom: 'Filet de Poulet Halal',
    quantiteDisponible: 120,
    derniereMiseAJour: '2024-11-15',
  },
  {
    id: 4,
    articleId: 4,
    articleNom: 'Viande Hachée Boeuf Halal',
    quantiteDisponible: 250,
    derniereMiseAJour: '2024-11-15',
  },
  {
    id: 5,
    articleId: 5,
    articleNom: 'Entrecôte Boeuf Halal',
    quantiteDisponible: 85,
    derniereMiseAJour: '2024-11-13',
  },
  {
    id: 6,
    articleId: 6,
    articleNom: 'Gigot Agneau Halal',
    quantiteDisponible: 95,
    derniereMiseAJour: '2024-11-14',
  },
  {
    id: 7,
    articleId: 7,
    articleNom: 'Côtelettes Agneau Halal',
    quantiteDisponible: 60,
    derniereMiseAJour: '2024-11-12',
  },
  {
    id: 8,
    articleId: 8,
    articleNom: 'Merguez Halal',
    quantiteDisponible: 350,
    derniereMiseAJour: '2024-11-15',
  },
]

// ===== MOUVEMENTS DE STOCK =====
export const stockMovements = [
  {
    id: 1,
    articleId: 1,
    type: "ENTREE",
    quantite: 500,
    motif: "Production",
    date: "2024-11-01"
  },
  {
    id: 2,
    articleId: 1,
    type: "SORTIE",
    quantite: 50,
    motif: "Vente",
    date: "2024-11-14"
  },
  {
    id: 3,
    articleId: 4,
    type: "ENTREE",
    quantite: 300,
    motif: "Production",
    date: "2024-11-05"
  },
  {
    id: 4,
    articleId: 4,
    type: "SORTIE",
    quantite: 50,
    motif: "Vente",
    date: "2024-11-15"
  },
  {
    id: 5,
    articleId: 8,
    type: "ENTREE",
    quantite: 400,
    motif: "Production",
    date: "2024-11-12"
  },
  {
    id: 6,
    articleId: 8,
    type: "SORTIE",
    quantite: 50,
    motif: "Perte",
    date: "2024-11-15"
  }
]

// ===== VENTES =====
export const sales = [
  {
    // Case 1: VALIDEE — multiple articles, should have a corresponding invoice
    id: 1,
    numero: 'VNT-2024-001',
    clientId: 1,
    clientNom: 'Boucherie Al Baraka',
    adresseLivraison: '15 Rue du Marché, 75011 Paris',
    dateLivraison: '2024-11-16',
    total: 1229.00,
    status: SALE_STATUS.VALIDEE,
    dateCreation: '2024-11-14',
  },
  {
    // Case 2: EN_ATTENTE — should NOT have a corresponding invoice yet
    id: 2,
    numero: 'VNT-2024-002',
    clientId: 2,
    clientNom: 'Restaurant Le Palmier',
    adresseLivraison: '89 Avenue de la République, 93100 Montreuil',
    dateLivraison: '2024-11-22',
    total: 682.50,
    status: SALE_STATUS.EN_ATTENTE,
    dateCreation: '2024-11-15',
  },
  {
    // Case 3: ANNULEE — should appear cancelled in the list
    id: 3,
    numero: 'VNT-2024-003',
    clientId: 3,
    clientNom: 'Superette Médina',
    adresseLivraison: '34 Rue Jean Jaurès, 93200 Saint-Denis',
    dateLivraison: '2024-11-18',
    total: 447.00,
    status: SALE_STATUS.ANNULEE,
    dateCreation: '2024-11-13',
  },
  {
    // Case 4: VALIDEE — large total to test layout/spacing
    id: 4,
    numero: 'VNT-2024-004',
    clientId: 4,
    clientNom: 'Traiteur Salam',
    adresseLivraison: '56 Rue de la Paix, 75002 Paris',
    dateLivraison: '2024-11-20',
    total: 12450.80,
    status: SALE_STATUS.VALIDEE,
    dateCreation: '2024-11-16',
  },
  {
    // Case 5a: EN_ATTENTE — Boutique client
    id: 5,
    numero: 'VNT-2024-005',
    clientId: 5,
    clientNom: 'Boucherie Essalam',
    adresseLivraison: '22 Rue des Lilas, 69003 Lyon',
    dateLivraison: '2024-11-25',
    total: 345.00,
    status: SALE_STATUS.EN_ATTENTE,
    dateCreation: '2024-11-17',
  },
]

// ===== ARTICLES DE VENTE =====
export const saleItems = [
  {
    id: 1,
    saleId: 1,
    articleId: 1,
    articleNom: 'Poulet Halal Entier',
    quantite: 50,
    prixUnitaire: 8.50,
    total: 425.00,
  },
  {
    id: 2,
    saleId: 1,
    articleId: 4,
    articleNom: 'Viande Hachée Boeuf Halal',
    quantite: 30,
    prixUnitaire: 14.90,
    total: 447.00,
  },
  {
    id: 3,
    saleId: 1,
    articleId: 8,
    articleNom: 'Merguez Halal',
    quantite: 30,
    prixUnitaire: 11.90,
    total: 357.00,
  },
  {
    id: 4,
    saleId: 2,
    articleId: 3,
    articleNom: 'Filet de Poulet Halal',
    quantite: 25,
    prixUnitaire: 12.50,
    total: 312.50,
  },
  {
    id: 5,
    saleId: 2,
    articleId: 6,
    articleNom: 'Gigot Agneau Halal',
    quantite: 20,
    prixUnitaire: 18.50,
    total: 370.00,
  },
  {
    id: 6,
    saleId: 3,
    articleId: 5,
    articleNom: 'Entrecôte Boeuf Halal',
    quantite: 40,
    prixUnitaire: 24.90,
    total: 996.00,
  },
  {
    id: 7,
    saleId: 3,
    articleId: 7,
    articleNom: 'Côtelettes Agneau Halal',
    quantite: 50,
    prixUnitaire: 22.00,
    total: 1100.00,
  },
]

// ===== FACTURES =====
export const invoices = [
  {
    // Linked to Sale 1 (VALIDEE)
    id: 1,
    numero: 'FAC-2024-001',
    saleId: 1,
    clientId: 1,
    clientNom: 'Boucherie Al Baraka',
    montantTotal: 1229.00,
    status: INVOICE_STATUS.PAID,
    dateEmission: '2024-11-14',
    dateEcheance: '2024-12-14',
  },
  {
    // Linked to Sale 4 (VALIDEE — large total)
    id: 2,
    numero: 'FAC-2024-002',
    saleId: 4,
    clientId: 4,
    clientNom: 'Traiteur Salam',
    montantTotal: 12450.80,
    status: INVOICE_STATUS.UNPAID,
    dateEmission: '2024-11-16',
    dateEcheance: '2024-12-16',
  },
  {
    // Old invoice, Entreprise client
    id: 3,
    numero: 'FAC-2024-003',
    saleId: 2,
    clientId: 2,
    clientNom: 'Restaurant Le Palmier',
    montantTotal: 682.50,
    status: INVOICE_STATUS.PENDING,
    dateEmission: '2024-10-01',
    dateEcheance: '2024-11-01',
  },
]

// ===== DONNÉES GRAPHIQUES =====
export const salesByMonth = [
  { mois: 'Jan', ventes: 12500 },
  { mois: 'Fév', ventes: 15800 },
  { mois: 'Mar', ventes: 18200 },
  { mois: 'Avr', ventes: 14500 },
  { mois: 'Mai', ventes: 21000 },
  { mois: 'Juin', ventes: 19500 },
  { mois: 'Juil', ventes: 22800 },
  { mois: 'Août', ventes: 17200 },
  { mois: 'Sep', ventes: 24500 },
  { mois: 'Oct', ventes: 28000 },
  { mois: 'Nov', ventes: 31200 },
  { mois: 'Déc', ventes: 35000 },
]

export const stockByArticle = [
  { article: 'Poulet Entier', quantite: 450 },
  { article: 'Cuisses Poulet', quantite: 280 },
  { article: 'Filet Poulet', quantite: 120 },
  { article: 'Hachée Boeuf', quantite: 250 },
  { article: 'Entrecôte', quantite: 85 },
  { article: 'Gigot Agneau', quantite: 95 },
  { article: 'Côtelettes', quantite: 60 },
  { article: 'Merguez', quantite: 350 },
]

export const invoiceStatusData = [
  { statut: 'Payé', nombre: 2, fill: '#22c55e' },
  { statut: 'En attente', nombre: 1, fill: '#f59e0b' },
  { statut: 'Non payé', nombre: 2, fill: '#ef4444' },
]

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Génère un code d'accès basé sur le rôle
export function generateAccessCode(role = 'USR') {
  const prefix = role.substring(0, 3).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${random}`
}

// Génère un ID numérique unique
let idCounter = 1000
export function generateId() {
  return ++idCounter
}

// Formatte un prix en euros
export function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Formatte une date en format français
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Labels pour les statuts utilisateur
export const STATUS_LABELS = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
}

// Labels pour les statuts de production
export const PRODUCTION_STATUS_LABELS = {
  AVAILABLE: 'Disponible',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
}

// Labels pour les statuts de vente
export const SALE_STATUS_LABELS = {
  DELIVERED: 'Livrée',
  IN_PREPARATION: 'En préparation',
  PENDING: 'En attente',
}

// Labels pour les statuts de facture
export const INVOICE_STATUS_LABELS = {
  PAID: 'Payé',
  PENDING: 'En attente',
  UNPAID: 'Non payé',
}

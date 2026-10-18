import { ServiceName, ServiceCategory } from '../types'

export interface ServiceMeta {
  name: ServiceName
  category: ServiceCategory
  avgPrice: number
  stages: number
  color: string
}

export const SERVICES_CONFIG: Record<ServiceName, ServiceMeta> = {
  'Private Limited Company': {
    name: 'Private Limited Company',
    category: 'Company Formation',
    avgPrice: 14999,
    stages: 5,
    color: '#2563EB', // Blue
  },
  'LLP Registration': {
    name: 'LLP Registration',
    category: 'Company Formation',
    avgPrice: 11999,
    stages: 4,
    color: '#3B82F6', // Lighter Blue
  },
  'GST Registration & Filing': {
    name: 'GST Registration & Filing',
    category: 'Tax & Compliance',
    avgPrice: 4999,
    stages: 3,
    color: '#10B981', // Green
  },
  'Annual Compliance': {
    name: 'Annual Compliance',
    category: 'Tax & Compliance',
    avgPrice: 18999,
    stages: 5,
    color: '#059669', // Darker Green
  },
  'Penalty & Late Filing': {
    name: 'Penalty & Late Filing',
    category: 'Tax & Compliance',
    avgPrice: 8499,
    stages: 3,
    color: '#F59E0B', // Amber
  },
  'Trademark Registration': {
    name: 'Trademark Registration',
    category: 'Intellectual Property',
    avgPrice: 7999,
    stages: 4,
    color: '#8B5CF6', // Purple
  },
  'FSSAI License': {
    name: 'FSSAI License',
    category: 'Licenses & Certifications',
    avgPrice: 9499,
    stages: 3,
    color: '#EC4899', // Pink
  },
  'ISO Certification': {
    name: 'ISO Certification',
    category: 'Licenses & Certifications',
    avgPrice: 24999,
    stages: 6,
    color: '#6366F1', // Indigo
  },
  'Startup India Registration': {
    name: 'Startup India Registration',
    category: 'Company Formation',
    avgPrice: 12499,
    stages: 4,
    color: '#06B6D4', // Cyan
  },
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Company Formation',
  'Tax & Compliance',
  'Intellectual Property',
  'Licenses & Certifications',
]

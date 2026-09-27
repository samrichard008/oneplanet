export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: 'user' | 'Admin';
  citizenStatus: 'Citizen' | 'Non-Citizen' | 'Below 18';
  nic?: string;
  passport?: string;
  address: string;
  district: string;
  bio: string;
  plantedCount: number;
  taggedCount: number;
}

export interface Project {
  id: string;
  name: string;
  area: string;
  location: string;
  description: string;
  totalTrees: number;
  status: 'Active' | 'Inactive';
}

export interface Tree {
  id: string;
  treeName: string;
  scientificName: string;
  planterName: string;
  donorName: string;
  donorMessage: string;
  plantedDate: string;
  lastUpdatedDate: string;
  status: string; // 'Planted' | 'Tagged'
  area: string;
  location: string;
  projectId: string;
  images: string[];
}

export interface PlantRequest {
  id: string;
  userId: string;
  userName: string;
  contactNo: string;
  date: string;
  dedicationDetails: {
    type: 'Gift for' | 'In memory of' | 'No dedication';
    name: string;
    description: string;
  };
  paymentSlip: string;
  status: 'Pending Approval' | 'Approved' | 'Planted' | 'Rejected';
}

export interface TagRequest {
  id: string;
  userId: string;
  userName: string;
  planterName: string;
  donorName: string;
  plantName: string;
  scientificName: string;
  plantedDate: string;
  area: string;
  location: string;
  planterImage: string;
  plantImages: string[];
  donorMessage: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  date: string;
}

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  conservationStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern';
  endemicStatus: 'Endemic' | 'Native' | 'Introduced';
  category: 'Timber' | 'Medicinal' | 'Fruit' | 'Soil Conservation';
  nativeZone: string;
  description: string;
  images: string[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  issueType: 'Payment issue' | 'Tree Tagging issue' | 'Account & Profile issue' | 'General inquiries';
  date: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  message: string;
  reply: string;
  proofImage?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Tree Updates' | 'Payment Verification';
  date: string;
  read: boolean;
}

export interface SystemSettings {
  bankName: string;
  branch: string;
  accountNo: string;
  accountName: string;
  pricePerTree: number;
}

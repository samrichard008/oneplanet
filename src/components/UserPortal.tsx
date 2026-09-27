import React, { useState, useEffect } from 'react';
import { User, Tree, Project, PlantRequest, TagRequest, Species, SupportTicket, Notification, SystemSettings } from '../types';
import SrilankaMap from './SrilankaMap';
import { 
  Home, Map, Scan, User as UserIcon, BookOpen, Heart, 
  PlusCircle, Trash2, Calendar, FileText, CheckCircle2, 
  MapPin, Upload, Camera, HelpCircle, Phone, Mail, 
  MessageSquare, ChevronRight, ArrowLeft, Loader2, Eye, Bell, Globe, Settings, LogOut, Search
} from 'lucide-react';

interface UserPortalProps {
  user: User;
  onLogout: () => void;
  lang: 'en' | 'si' | 'ta';
  setLang: (lang: 'en' | 'si' | 'ta') => void;
  t: any;
}

export default function UserPortal({ user: initialUser, onLogout, lang, setLang, t }: UserPortalProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'scan' | 'profile'>('home');
  const [subScreen, setSubScreen] = useState<string | null>(null); // 'plant_tree', 'tag_plant', 'directory', 'become_protector', 'planted_list', 'tagged_list', 'help_support', 'account_settings', 'notifications'
  
  // Detail selection states
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  // Db State loaded from server
  const [trees, setTrees] = useState<Tree[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [plantRequests, setPlantRequests] = useState<PlantRequest[]>([]);
  const [tagRequests, setTagRequests] = useState<TagRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [requestDedicationType, setRequestDedicationType] = useState<'Gift for' | 'In memory of' | 'No dedication'>('No dedication');
  const [requestDedicationName, setRequestDedicationName] = useState('');
  const [requestDedicationDesc, setRequestDedicationDesc] = useState('');
  const [requestSlip, setRequestSlip] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Tag Tree form state
  const [tagPlantName, setTagPlantName] = useState('');
  const [tagScientificName, setTagScientificName] = useState('');
  const [tagPlantedDate, setTagPlantedDate] = useState('');
  const [tagArea, setTagArea] = useState('Galle');
  const [tagLocation, setTagLocation] = useState('');
  const [tagPlanterImage, setTagPlanterImage] = useState('');
  const [tagPlantImages, setTagPlantImages] = useState<string[]>([]);
  const [tagDonorMessage, setTagDonorMessage] = useState('');
  const [tagSuccess, setTagSuccess] = useState(false);

  // AI Recognition scanner state
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ commonName: string; scientificName: string; description: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  // Support ticket form state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportIssueType, setSupportIssueType] = useState<'Payment issue' | 'Tree Tagging issue' | 'Account & Profile issue' | 'General inquiries'>('General inquiries');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Account Settings form state
  const [profileName, setProfileName] = useState(user.fullName);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileMobile, setProfileMobile] = useState(user.mobile);
  const [profileNic, setProfileNic] = useState(user.nic || '');
  const [profileDistrict, setProfileDistrict] = useState(user.district);
  const [profileAddress, setProfileAddress] = useState(user.address);
  const [profileBio, setProfileBio] = useState(user.bio);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Search/Filters states
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'All' | 'Endemic' | 'Threatened' | 'Medicinal'>('All');
  const [mapSearch, setMapSearch] = useState('');
  const [notifFilter, setNotifFilter] = useState<'All' | 'Tree Updates' | 'Payment Verification'>('All');

  // Load state from DB
  const loadDatabase = async () => {
    try {
      const [treesRes, speciesRes, reqsRes, settingsRes, notifsRes] = await Promise.all([
        fetch('/api/trees'),
        fetch('/api/plant-directory'),
        fetch('/api/plant-requests'),
        fetch('/api/settings'),
        fetch('/api/notifications')
      ]);
      if (treesRes.ok) setTrees(await treesRes.json());
      if (speciesRes.ok) setSpecies(await speciesRes.json());
      if (reqsRes.ok) setPlantRequests(await reqsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
    } catch (e) {
      console.error("Error loading user state from server", e);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Update profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileName,
          email: profileEmail,
          mobile: profileMobile,
          nic: profileNic,
          district: profileDistrict,
          address: profileAddress,
          bio: profileBio
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit support ticket
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          subject: supportSubject,
          issueType: supportIssueType,
          message: supportMessage
        })
      });
      if (res.ok) {
        setSupportSuccess(true);
        setSupportSubject('');
        setSupportMessage('');
        setTimeout(() => setSupportSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit plantation request
  const handlePlantRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSlip) {
      alert("Please upload/attach payment slip image first");
      return;
    }
    setRequestSubmitting(true);
    try {
      const res = await fetch('/api/plant-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          contactNo: user.mobile,
          dedicationDetails: {
            type: requestDedicationType,
            name: requestDedicationType !== 'No dedication' ? requestDedicationName : '',
            description: requestDedicationType !== 'No dedication' ? requestDedicationDesc : 'Dedicated for reforestation'
          },
          paymentSlip: requestSlip
        })
      });
      if (res.ok) {
        await loadDatabase();
        setRequestDedicationType('No dedication');
        setRequestDedicationName('');
        setRequestDedicationDesc('');
        setRequestSlip('');
        setSubScreen('plant_tree'); // return to list view
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Submit tagging request
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagPlantName || !tagPlanterImage) {
      alert("Please fill name and attach planter image proof");
      return;
    }
    try {
      const res = await fetch('/api/tag-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          plantName: tagPlantName,
          scientificName: tagScientificName,
          plantedDate: tagPlantedDate,
          area: tagArea,
          location: tagLocation,
          planterImage: tagPlanterImage,
          plantImages: tagPlantImages,
          donorMessage: tagDonorMessage
        })
      });
      if (res.ok) {
        setTagSuccess(true);
        setTagPlantName('');
        setTagScientificName('');
        setTagPlantedDate('');
        setTagLocation('');
        setTagPlanterImage('');
        setTagPlantImages([]);
        setTagDonorMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Mock Slip/Receipt base64 generation for easier testing
  const handleMockUpload = (setter: (val: string) => void) => {
    // Standard mock base64 for beautiful leaves or slips
    setter("https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=400");
  };

  const handleMockRecognitionUpload = () => {
    // Preset mock leaf images
    const leafPresets = [
      {
        url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=300",
        name: "Naa Tree (Mesua ferrea)",
        sci: "Mesua ferrea",
        desc: "Sri Lanka's national tree. Highly valued for beautiful white flowers with rich fragrance, elegant blood-red young leaves, and heavy iron-wood trunk used in traditional temples."
      },
      {
        url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=300",
        name: "Hora Tree (Ceylon Dipterocarpus)",
        sci: "Dipterocarpus zeylanicus",
        desc: "An endemic towering giant rainforest tree of southwestern wet zone. Key for preserving the moisture levels in soil and supporting the wet-zone bird species."
      }
    ];

    const pick = leafPresets[Math.floor(Math.random() * leafPresets.length)];
    setScanImage(pick.url);
    // Auto fill recognition result or trigger AI call
    setScanResult(null);
  };

  // Run Real/Mock Server-side AI Plant Recognition
  const handleIdentifyPlant = async () => {
    if (!scanImage) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/gemini/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: scanImage })
      });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  // Filter species directory lists
  const filteredSpeciesList = species.filter(s => {
    const matchesSearch = s.commonName.toLowerCase().includes(directorySearch.toLowerCase()) || 
                          s.scientificName.toLowerCase().includes(directorySearch.toLowerCase());
    if (!matchesSearch) return false;
    if (directoryFilter === 'All') return true;
    if (directoryFilter === 'Endemic') return s.endemicStatus === 'Endemic';
    if (directoryFilter === 'Threatened') return s.conservationStatus === 'Endangered' || s.conservationStatus === 'Critically Endangered';
    if (directoryFilter === 'Medicinal') return s.category === 'Medicinal';
    return true;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 border-x border-slate-200 flex flex-col shadow-2xl relative pb-20">
      
      {/* APP TOP TITLE BAR */}
      <header className="sticky top-0 bg-emerald-800 text-white px-4 py-3.5 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {subScreen && (
            <button onClick={() => { setSubScreen(null); setSelectedSpecies(null); setSelectedTree(null); }} className="p-1 hover:bg-emerald-700 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              {t.title}
            </h1>
            <p className="text-[9px] text-emerald-100/80 -mt-0.5">{t.tagline}</p>
          </div>
        </div>

        {/* User Stats/Avatar on header */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <h2 className="text-xs font-bold leading-3">{user.fullName}</h2>
            <span className="text-[8px] text-emerald-200 uppercase tracking-wider">{t.roleMember}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center font-bold text-xs shadow-sm">
            {user.fullName.charAt(0)}
          </div>
        </div>
      </header>

      {/* PORTAL MAIN BODY */}
      <main className="flex-1 p-4 overflow-y-auto">
        
        {/* SUB-SCREEN CONTROLLER */}
        {subScreen === 'plant_tree' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                <Heart className="w-5 h-5 text-emerald-600" />
                {t.plantTree}
              </h3>
              <button 
                onClick={() => setSubScreen('new_plant_request')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                + New Request
              </button>
            </div>

            {/* Request Filter bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-xs text-slate-500 flex items-center gap-1 justify-between">
              <span>Filter by Date, Dedication or Status</span>
              <span className="font-semibold text-emerald-700">All ({plantRequests.filter(r => r.userId === user.id).length})</span>
            </div>

            {/* Current plant requests table list */}
            <div className="space-y-3">
              {plantRequests.filter(r => r.userId === user.id).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                  No active tree planting requests. Start a new request and secure a tree!
                </div>
              ) : (
                plantRequests.filter(r => r.userId === user.id).map((req, idx) => (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                        <span className="text-xs font-bold text-slate-700">Request #{req.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{req.date}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Dedication Status</span>
                        <span className="font-semibold text-slate-700">{req.dedicationDetails.type}</span>
                        {req.dedicationDetails.name && (
                          <span className="block text-slate-500 font-medium">({req.dedicationDetails.name})</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Status</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          req.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Planted' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          • {req.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                      &ldquo;{req.dedicationDetails.description}&rdquo;
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {subScreen === 'new_plant_request' && (
          <form onSubmit={handlePlantRequestSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">New Planting Request</h4>
              <button type="button" onClick={() => setSubScreen('plant_tree')} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Cancel</button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
              🌍 <strong>Request ONE PLANET to plant an endemic tree for you.</strong> We will take care of soil preparation, planting, and lifetime protection with our volunteer team.
            </p>

            {/* Dedication Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Dedication Details</label>
              <select
                value={requestDedicationType}
                onChange={(e: any) => setRequestDedicationType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="No dedication">No dedication</option>
                <option value="Gift for">Gift for someone special</option>
                <option value="In memory of">In memory of a loved one</option>
              </select>
            </div>

            {requestDedicationType !== 'No dedication' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Name of the Person</label>
                  <input
                    type="text"
                    required
                    value={requestDedicationName}
                    onChange={(e) => setRequestDedicationName(e.target.value)}
                    placeholder="E.g. Nimal or Grandfather"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Dedication message/description</label>
                  <textarea
                    required
                    rows={2}
                    value={requestDedicationDesc}
                    onChange={(e) => setRequestDedicationDesc(e.target.value)}
                    placeholder="Write a warm note of memory or blessing..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Bank details preview */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <h5 className="font-bold text-slate-700 text-xs">Bank Account Details</h5>
              <p className="text-[10px] text-slate-500 leading-normal">
                Please deposit payment of <strong className="text-emerald-700">LKR {settings?.pricePerTree || 1500}</strong> to the following account and attach the payment receipt slip below.
              </p>
              <div className="text-xs space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between"><span className="text-slate-400">Bank:</span> <strong className="text-slate-700">{settings?.bankName || 'Bank of Ceylon'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Branch:</span> <span className="text-slate-700 font-semibold">{settings?.branch || 'Colombo Fort'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Account No:</span> <strong className="text-emerald-800">{settings?.accountNo || '12345678'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Account Name:</span> <span className="text-slate-700 text-[10px] font-bold">{settings?.accountName || 'One Planet Trust'}</span></div>
              </div>
            </div>

            {/* Payment verification slip upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Payment Verification</label>
              {requestSlip ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-200 h-24">
                  <img src={requestSlip} alt="slip" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setRequestSlip('')} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer" onClick={() => handleMockUpload(setRequestSlip)}>
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-600">Attach Payment Slip receipt</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">(Click to simulate slip upload)</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={requestSubmitting}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1"
            >
              {requestSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
            </button>
          </form>
        )}

        {subScreen === 'tag_plant' && (
          <form onSubmit={handleTagSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Tag Your Plant</h4>
              <button type="button" onClick={() => { setSubScreen(null); setTagSuccess(false); }} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Close</button>
            </div>

            {tagSuccess ? (
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-800 text-sm">Your Plant Tag Submitted!</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed px-4">
                    Once our conservation team reviews and approves the GPS location coordinates and photos, it will be mapped on the public live map!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setTagSuccess(false); setSubScreen(null); }}
                  className="bg-emerald-800 text-white font-bold text-xs py-2 px-6 rounded-full hover:bg-emerald-900 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <p className="text-[10px] text-slate-500">
                  Report a native tree you have planted in your neighborhood or backgarden, and request verification badge!
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Planter Name *</label>
                    <input
                      type="text"
                      required
                      value={tagPlantName}
                      onChange={(e) => setTagPlantName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Donor Name</label>
                    <input
                      type="text"
                      value={tagDonorMessage}
                      onChange={(e) => setTagDonorMessage(e.target.value)}
                      placeholder="Optional sponsor"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Plant Common Name *</label>
                    <input
                      type="text"
                      required
                      value={tagPlantName}
                      onChange={(e) => setTagPlantName(e.target.value)}
                      placeholder="E.g. Naa Tree"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Scientific Name</label>
                    <input
                      type="text"
                      value={tagScientificName}
                      onChange={(e) => setTagScientificName(e.target.value)}
                      placeholder="E.g. Mesua ferrea"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Planted Date *</label>
                    <input
                      type="date"
                      required
                      value={tagPlantedDate}
                      onChange={(e) => setTagPlantedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Area District *</label>
                    <select
                      value={tagArea}
                      onChange={(e: any) => setTagArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Galle">Galle</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Kandy">Kandy</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Location Coordinates or Google Map Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagLocation}
                      onChange={(e) => setTagLocation(e.target.value)}
                      placeholder="E.g. 6.0535° N, 80.2210° E"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTagLocation("6.0535° N, 80.2210° E")}
                      className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 rounded-xl transition flex items-center gap-0.5"
                    >
                      <MapPin className="w-3 h-3" /> Auto-Fetch
                    </button>
                  </div>
                </div>

                {/* Upload proof photos */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 block">Upload Planter Image *</label>
                  {tagPlanterImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-100 h-20 w-32">
                      <img src={tagPlanterImage} alt="planter" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setTagPlanterImage('')} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMockUpload(setTagPlanterImage)}
                      className="border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-600 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 w-full"
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      Upload Planter Image (Proof Photo)
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Donor / Dedication Message</label>
                  <textarea
                    rows={2}
                    value={tagDonorMessage}
                    onChange={(e) => setTagDonorMessage(e.target.value)}
                    placeholder="E.g. May this tree bless our family forest cover"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition"
                >
                  Submit for Approval
                </button>
              </div>
            )}
          </form>
        )}

        {subScreen === 'directory' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              {t.plantDirectory}
            </h3>

            {/* Directory Search & Toggle bar */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Common or Scientific Name..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none shadow-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Toggles bar */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                {(['All', 'Endemic', 'Threatened', 'Medicinal'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setDirectoryFilter(cat)}
                    className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap ${
                      directoryFilter === cat 
                        ? 'bg-emerald-800 text-white shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {selectedSpecies ? (
              /* Species details view (Page 13) */
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 animate-fadeIn">
                <button 
                  onClick={() => setSelectedSpecies(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Species List
                </button>

                {/* Main image carousel simulated */}
                <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-100 border border-slate-100">
                  <img src={selectedSpecies.images[0]} alt={selectedSpecies.commonName} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="w-2 h-2 rounded-full bg-white/50"></span>
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="font-extrabold text-slate-800 text-base">{selectedSpecies.commonName}</h4>
                  <p className="text-xs text-emerald-700 italic font-semibold">{selectedSpecies.scientificName}</p>
                </div>

                <div className="flex justify-center gap-2">
                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{selectedSpecies.endemicStatus}</span>
                  <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{selectedSpecies.conservationStatus}</span>
                  <span className="bg-blue-50 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{selectedSpecies.category}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div>
                    <strong className="text-slate-600 block">Native Ecological Zone</strong>
                    <span className="text-slate-500">{selectedSpecies.nativeZone}</span>
                  </div>
                  <div>
                    <strong className="text-slate-600 block">Description</strong>
                    <p className="text-slate-500 leading-relaxed text-justify">{selectedSpecies.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-[10px] font-bold text-slate-500">
                  🍃 Verified & Curated by Planet Protectors Conservation Team
                </div>
              </div>
            ) : (
              /* Species List view (Page 12) */
              <div className="space-y-3">
                {filteredSpeciesList.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                    No matching species found.
                  </div>
                ) : (
                  filteredSpeciesList.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedSpecies(s)}
                      className="bg-white rounded-2xl border border-slate-100 p-3 flex gap-3 cursor-pointer hover:border-emerald-200 transition shadow-sm items-center justify-between group"
                    >
                      <div className="flex gap-3 items-center">
                        <img src={s.images[0]} alt={s.commonName} className="w-14 h-14 rounded-xl object-cover border border-slate-50" />
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{s.commonName}</h4>
                          <p className="text-[10px] text-emerald-700 italic font-semibold">{s.scientificName}</p>
                          <span className="text-[9px] text-slate-400 font-medium block">{s.endemicStatus} • {s.conservationStatus}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {subScreen === 'become_protector' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <Heart className="w-8 h-8 text-emerald-600 fill-emerald-600" />
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-800 text-base">Become a Planet Protector!</h4>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                You are being directed to our official global website to explore forest projects, register as an active volunteer member, or support our conservation causes through donations.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left text-[11px] text-slate-600 leading-normal">
              <strong>✨ What you can do next:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 font-medium text-slate-500">
                <li>Register as a certified Field Inspector</li>
                <li>Sponsor entire acres of montane forests</li>
                <li>Join native seed-ball throwing campaigns</li>
              </ul>
            </div>

            <a 
              href="https://planetprotectors.org" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-sm transition"
            >
              🌐 Visit Our Official Website
            </a>
          </div>
        )}

        {subScreen === 'planted_list' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              My Planted Trees ({trees.filter(t => t.planterName === user.fullName).length})
            </h3>
            <div className="space-y-3">
              {trees.filter(t => t.planterName === user.fullName).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border">
                  No trees currently registered as Planted.
                </div>
              ) : (
                trees.filter(t => t.planterName === user.fullName).map((t, idx) => (
                  <div key={t.id} className="bg-white border p-3 rounded-2xl flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-800">{t.treeName}</h4>
                      <p className="text-[10px] text-slate-400 italic">{t.scientificName}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Planted: {t.plantedDate} | Location: {t.area}</p>
                    </div>
                    <button onClick={() => { setSelectedTree(t); setSubScreen('tree_profile'); }} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {subScreen === 'tagged_list' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-emerald-600" />
              My Tagged Trees ({trees.filter(t => t.planterName === user.fullName && t.status === 'Tagged').length})
            </h3>
            <div className="space-y-3">
              {trees.filter(t => t.planterName === user.fullName && t.status === 'Tagged').length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border">
                  No trees currently verified and Tagged. Tag a tree today!
                </div>
              ) : (
                trees.filter(t => t.planterName === user.fullName && t.status === 'Tagged').map((t, idx) => (
                  <div key={t.id} className="bg-white border p-3 rounded-2xl flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-800">{t.treeName}</h4>
                      <p className="text-[10px] text-slate-400 italic">{t.scientificName}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Tagged: {t.plantedDate} | Coords: {t.location}</p>
                    </div>
                    <button onClick={() => { setSelectedTree(t); setSubScreen('tree_profile'); }} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {subScreen === 'tree_profile' && selectedTree && (
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 animate-fadeIn">
            <button onClick={() => setSubScreen(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            {/* Simulated leaf photo slider */}
            <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-100 border border-slate-100">
              <img src={selectedTree.images[0]} alt={selectedTree.treeName} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1 text-center">
              <h4 className="font-extrabold text-slate-800 text-base">{selectedTree.treeName}</h4>
              <p className="text-xs text-emerald-700 italic font-semibold">{selectedTree.scientificName}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-400">Tree ID:</span> <strong className="text-slate-800">{selectedTree.id}</strong></div>
                <div><span className="text-slate-400">Project Area:</span> <strong className="text-emerald-800">{selectedTree.area}</strong></div>
                <div><span className="text-slate-400">Planter Name:</span> <strong className="text-slate-700">{selectedTree.planterName}</strong></div>
                <div><span className="text-slate-400">Planted Date:</span> <span className="text-slate-600 font-medium">{selectedTree.plantedDate}</span></div>
              </div>

              {selectedTree.donorMessage && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-500 italic mt-2">
                  &ldquo;{selectedTree.donorMessage}&rdquo;
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setActiveTab('map'); setMapSearch(selectedTree.id); setSubScreen(null); }}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 rounded-xl text-center"
              >
                View On Map
              </button>
              <button 
                onClick={() => alert(`Share Link: ${window.location.origin}/tree/${selectedTree.id} copied to clipboard!`)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl hover:bg-slate-50"
              >
                Share Profile
              </button>
            </div>
          </div>
        )}

        {subScreen === 'account_settings' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Account Settings</h4>
              <button type="button" onClick={() => setSubScreen(null)} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Cancel</button>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 text-[10px] font-bold text-center">
                ✓ Personal profile updated successfully!
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Full Name</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Email Address</label>
                <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Mobile Number</label>
                <input type="text" value={profileMobile} onChange={(e) => setProfileMobile(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">NIC / Passport No.</label>
                <input type="text" value={profileNic} onChange={(e) => setProfileNic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">District</label>
                <input type="text" value={profileDistrict} onChange={(e) => setProfileDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Address</label>
                <input type="text" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Bio Description</label>
                <textarea rows={2} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition">
              Save Changes
            </button>
          </form>
        )}

        {subScreen === 'notifications' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
              <Bell className="w-5 h-5 text-emerald-600" />
              Notifications
            </h3>

            {/* Notification Filters */}
            <div className="flex gap-1.5 text-xs">
              {(['All', 'Tree Updates', 'Payment Verification'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setNotifFilter(f)}
                  className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap ${
                    notifFilter === f 
                      ? 'bg-emerald-800 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3">
              {notifications
                .filter(n => n.userId === user.id)
                .filter(n => notifFilter === 'All' ? true : n.type === notifFilter)
                .length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                    No notifications to display.
                  </div>
                ) : (
                  notifications
                    .filter(n => n.userId === user.id)
                    .filter(n => notifFilter === 'All' ? true : n.type === notifFilter)
                    .map(n => (
                      <div key={n.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500"></div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{n.type}</span>
                          <span className="text-[9px] text-slate-400">{n.date}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 mt-1.5">{n.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">{n.message}</p>
                      </div>
                    ))
                )}
            </div>
          </div>
        )}

        {subScreen === 'help_support' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              Help & Support Guides
            </h3>

            {/* FAQ collapse simulators */}
            <div className="space-y-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <h4 className="font-extrabold text-slate-800 text-xs text-emerald-800">📌 How to Tag a Tree (5 Steps)</h4>
                <ol className="list-decimal list-inside text-[10px] text-slate-500 space-y-1 leading-normal">
                  <li>Go to your dashboard menu</li>
                  <li>Click on <strong className="text-slate-700">Tag Your Plant</strong></li>
                  <li>Fill in the species details and exact coordinates location</li>
                  <li>Attach clear proof photos of the sapling and planter</li>
                  <li>Submit for review (added to map on admin approval)</li>
                </ol>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <h4 className="font-extrabold text-slate-800 text-xs text-emerald-800">📌 How to Plant a Tree (6 Steps)</h4>
                <ol className="list-decimal list-inside text-[10px] text-slate-500 space-y-1 leading-normal">
                  <li>Go to <strong className="text-slate-700">Plant a tree</strong> in your dashboard</li>
                  <li>Select dedication options (Gift or memory)</li>
                  <li>Make payment to our official Ceylon Bank Account</li>
                  <li>Upload payment slip and submit</li>
                  <li>Our team will send a notification on verification</li>
                  <li>Check live status on your map and profile anytime</li>
                </ol>
              </div>

              {/* Support Tickets submission form */}
              <form onSubmit={handleSupportSubmit} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-slate-800 border-b pb-2">📩 Get in Touch (Submit Support Ticket)</h4>
                
                {supportSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 p-2 text-center text-[10px] font-bold rounded-xl">
                    ✓ Support request submitted! We will reply shortly.
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500">Contact Email</label>
                      <input type="text" disabled value={user.email} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11px]" />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500">Issue Type</label>
                      <select 
                        value={supportIssueType} 
                        onChange={(e: any) => setSupportIssueType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                      >
                        <option value="Payment issue">Payment issue</option>
                        <option value="Tree Tagging issue">Tree Tagging issue</option>
                        <option value="Account & Profile issue">Account & Profile issue</option>
                        <option value="General inquiries">General inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-500">Subject</label>
                    <input 
                      type="text" 
                      required 
                      value={supportSubject} 
                      onChange={(e) => setSupportSubject(e.target.value)} 
                      placeholder="E.g. Verified status issue"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px]" 
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-500">Message Details</label>
                    <textarea 
                      required 
                      rows={3} 
                      value={supportMessage} 
                      onChange={(e) => setSupportMessage(e.target.value)} 
                      placeholder="Detail your problem here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] resize-none" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-xl text-xs transition">
                  Send Message
                </button>

                <div className="text-center pt-2 border-t text-[10px] text-slate-400 space-y-0.5 leading-none">
                  <div>Hotline Support / Email Direct:</div>
                  <strong className="text-slate-600">planetprotectors10@gmail.com</strong>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DEFAULT TAB CONTROLLER VIEWS */}
        {!subScreen && (
          <div>
            {activeTab === 'home' && (
              <div className="space-y-4">
                {/* Dashboard contributor badge */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex justify-between items-center">
                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[9px] uppercase font-black tracking-wider text-emerald-200 bg-emerald-900/40 px-2 py-0.5 rounded-full inline-block">Contributor Portal</span>
                    <h3 className="font-extrabold text-base leading-tight">Welcome, {user.fullName}!</h3>
                    <p className="text-[10px] text-emerald-100/80 leading-normal">
                      Track your planted saplings and view live tree-tag approvals in real-time.
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-emerald-700/30 border border-emerald-600/50 flex items-center justify-center relative z-10">
                    <Heart className="w-8 h-8 text-emerald-300 fill-emerald-300 animate-pulse" />
                  </div>
                </div>

                {/* KPI/Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div onClick={() => setSubScreen('planted_list')} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition cursor-pointer flex gap-3 items-center">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Planted Trees</span>
                      <strong className="text-base text-slate-800">{user.plantedCount}</strong>
                    </div>
                  </div>

                  <div onClick={() => setSubScreen('tagged_list')} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition cursor-pointer flex gap-3 items-center">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tagged Trees</span>
                      <strong className="text-base text-slate-800">{user.taggedCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Menu items as big beautiful tiles */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Services & Management</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setSubScreen('plant_tree')}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-100 transition cursor-pointer flex flex-col justify-between h-24"
                    >
                      <PlusCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <strong className="text-xs text-slate-800 block leading-tight">Plant a Tree</strong>
                        <span className="text-[9px] text-slate-400">Request native seeds</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSubScreen('tag_plant')}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-100 transition cursor-pointer flex flex-col justify-between h-24"
                    >
                      <MapPin className="w-6 h-6 text-emerald-600" />
                      <div>
                        <strong className="text-xs text-slate-800 block leading-tight">Tag Your Plant</strong>
                        <span className="text-[9px] text-slate-400">Map your backyard tree</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSubScreen('directory')}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-100 transition cursor-pointer flex flex-col justify-between h-24"
                    >
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                      <div>
                        <strong className="text-xs text-slate-800 block leading-tight">Plant Directory</strong>
                        <span className="text-[9px] text-slate-400">48+ Sri Lankan species</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setActiveTab('scan')}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-100 transition cursor-pointer flex flex-col justify-between h-24"
                    >
                      <Scan className="w-6 h-6 text-emerald-600" />
                      <div>
                        <strong className="text-xs text-slate-800 block leading-tight">Plant Recognition</strong>
                        <span className="text-[9px] text-slate-400">AI instant scanner</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSubScreen('become_protector')}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-100 transition cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center">
                      <Heart className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      <div>
                        <strong className="text-xs text-slate-800 block leading-none">Become a Protector</strong>
                        <span className="text-[9px] text-slate-400 mt-1 block">Help plant over 3,000+ trees</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                    <Map className="w-5 h-5 text-emerald-600" />
                    Planted Canopy Map
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Sri Lanka Portal</span>
                </div>

                {/* Srilanka map */}
                <SrilankaMap 
                  trees={trees} 
                  onSelectTree={(t) => { setSelectedTree(t); setSubScreen('tree_profile'); }}
                  searchQuery={mapSearch}
                />

                {/* Search query box */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tree ID, donor, species name..."
                    value={mapSearch}
                    onChange={(e) => setMapSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            {activeTab === 'scan' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                    <Scan className="w-5 h-5 text-emerald-600 animate-pulse" />
                    Identify Your Plant Instantly
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Powered by Google Gemini 3.8-flash AI. Upload a clear photograph of a leaf or flower blossom.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col items-center justify-center relative min-h-[220px]">
                  {scanImage ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="relative rounded-2xl overflow-hidden h-40 w-full max-w-xs border mb-3">
                        <img src={scanImage} alt="uploaded leaf" className="w-full h-full object-cover" />
                        <button onClick={() => { setScanImage(null); setScanResult(null); }} className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {scanResult ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 w-full text-xs space-y-2 text-left animate-fadeIn">
                          <div className="flex justify-between items-center border-b border-emerald-100 pb-1.5 mb-1">
                            <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">Official Identification</span>
                            <span className="text-[8px] text-emerald-600 font-bold">Accuracy High</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block leading-none">Plant Common Name</span>
                            <strong className="text-slate-800 text-sm">{scanResult.commonName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block leading-none">Scientific Name</span>
                            <span className="text-emerald-800 italic font-bold">{scanResult.scientificName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block leading-none">Botanical Profile</span>
                            <p className="text-slate-600 leading-relaxed text-justify mt-0.5">{scanResult.description}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleIdentifyPlant}
                          disabled={scanning}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-6 rounded-full transition shadow-sm w-full max-w-xs flex items-center justify-center gap-1.5"
                        >
                          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                          Identify Plant Now
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-3.5 w-full">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                        <Camera className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs px-2">
                        Take a photo or choose an image from your device gallery. Center the leaf in the middle.
                      </p>
                      <div className="flex gap-2 w-full max-w-xs justify-center">
                        <button
                          type="button"
                          onClick={handleMockRecognitionUpload}
                          className="bg-white hover:bg-slate-50 border text-slate-700 font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <Camera className="w-4 h-4 text-emerald-600" /> Camera
                        </button>
                        <button
                          type="button"
                          onClick={handleMockRecognitionUpload}
                          className="bg-white hover:bg-slate-50 border text-slate-700 font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <Upload className="w-4 h-4 text-emerald-600" /> Gallery
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col items-center text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-lg flex items-center justify-center border border-emerald-100 shadow-sm relative">
                    {user.fullName.charAt(0)}
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{user.fullName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t.roleMember}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 italic max-w-xs px-2 leading-relaxed">
                    &ldquo;{user.bio || 'Volunteering with green movements.'}&rdquo;
                  </p>
                </div>

                {/* Contribution counter stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border p-3 rounded-2xl text-center space-y-0.5">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Planted Trees</span>
                    <strong className="text-lg text-emerald-700">{user.plantedCount}</strong>
                  </div>
                  <div className="bg-white border p-3 rounded-2xl text-center space-y-0.5">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Tagged Trees</span>
                    <strong className="text-lg text-emerald-700">{user.taggedCount}</strong>
                  </div>
                </div>

                {/* Sub Menu Links list */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 text-xs text-slate-700">
                  <div onClick={() => setSubScreen('account_settings')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex gap-2 items-center"><Settings className="w-4 h-4 text-emerald-600" /> <span>Account Settings</span></div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                  <div onClick={() => setSubScreen('notifications')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex gap-2 items-center"><Bell className="w-4 h-4 text-emerald-600" /> <span>Notifications</span></div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                  <div onClick={() => setSubScreen('help_support')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex gap-2 items-center"><HelpCircle className="w-4 h-4 text-emerald-600" /> <span>Help & Support</span></div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>

                  {/* Language switch inline preview */}
                  <div className="p-3.5 flex justify-between items-center">
                    <div className="flex gap-2 items-center"><Globe className="w-4 h-4 text-emerald-600" /> <span>Portal Language</span></div>
                    <div className="flex gap-1.5 text-[10px] font-bold">
                      <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded-full ${lang === 'en' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>EN</button>
                      <button onClick={() => setLang('si')} className={`px-2 py-0.5 rounded-full ${lang === 'si' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>සිං</button>
                      <button onClick={() => setLang('ta')} className={`px-2 py-0.5 rounded-full ${lang === 'ta' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>தமிழ்</button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER TAB NAVIGATION BAR */}
      <footer className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 h-16 grid grid-cols-4 items-center z-10">
        <button 
          onClick={() => { setActiveTab('home'); setSubScreen(null); }}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === 'home' && !subScreen ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">{t.home}</span>
        </button>

        <button 
          onClick={() => { setActiveTab('map'); setSubScreen(null); }}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === 'map' && !subScreen ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">{t.map}</span>
        </button>

        <button 
          onClick={() => { setActiveTab('scan'); setSubScreen(null); }}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === 'scan' && !subScreen ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Scan className="w-5 h-5 animate-pulse" />
          <span className="text-[9px] tracking-wide">{t.scan}</span>
        </button>

        <button 
          onClick={() => { setActiveTab('profile'); setSubScreen(null); }}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === 'profile' && !subScreen ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">{t.profile}</span>
        </button>
      </footer>

    </div>
  );
}

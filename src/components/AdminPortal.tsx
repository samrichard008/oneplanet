import React, { useState, useEffect } from 'react';
import { User, Tree, Project, PlantRequest, TagRequest, Species, SupportTicket, SystemSettings } from '../types';
import { 
  BarChart3, Users, Trees, FolderHeart, ShieldCheck, 
  HelpCircle, Settings, LogOut, Search, PlusCircle, 
  Trash2, Edit3, Eye, Check, X, FileSpreadsheet, Map, Loader2, Landmark
} from 'lucide-react';

interface AdminPortalProps {
  adminUser: User;
  onLogout: () => void;
  lang: string;
}

export default function AdminPortal({ adminUser, onLogout, lang }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'trees' | 'requests' | 'directory' | 'support' | 'settings'>('overview');
  
  // Database State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [plantRequests, setPlantRequests] = useState<PlantRequest[]>([]);
  const [tagRequests, setTagRequests] = useState<TagRequest[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Popups & Form State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectArea, setNewProjectArea] = useState('Galle');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<'Active' | 'Inactive'>('Active');

  // Add Tree Form State
  const [showAddTree, setShowAddTree] = useState(false);
  const [addTreeName, setAddTreeName] = useState('');
  const [addTreeSci, setAddTreeSci] = useState('');
  const [addTreePlanter, setAddTreePlanter] = useState('');
  const [addTreeDonor, setAddTreeDonor] = useState('');
  const [addTreeMessage, setAddTreeMessage] = useState('');
  const [addTreeDate, setAddTreeDate] = useState('');
  const [addTreeArea, setAddTreeArea] = useState('Galle');
  const [addTreeLocation, setAddTreeLocation] = useState('');

  // Add User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserName, setAddUserName] = useState('');
  const [addUserMobile, setAddUserMobile] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserNic, setAddUserNic] = useState('');
  const [addUserRole, setAddUserRole] = useState<'user' | 'Admin'>('user');
  const [addUserPass, setAddUserPass] = useState('password');

  // Add Species Form State
  const [showAddSpecies, setShowAddSpecies] = useState(false);
  const [addSpCommon, setAddSpCommon] = useState('');
  const [addSpSci, setAddSpSci] = useState('');
  const [addSpEndemic, setAddSpEndemic] = useState<'Endemic' | 'Native' | 'Introduced'>('Endemic');
  const [addSpConserve, setAddSpConserve] = useState<'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern'>('Least Concern');
  const [addSpCategory, setAddSpCategory] = useState<'Timber' | 'Medicinal' | 'Fruit' | 'Soil Conservation'>('Medicinal');
  const [addSpZone, setAddSpZone] = useState('Wet Zone');
  const [addSpDesc, setAddSpDesc] = useState('');

  // Review Modals
  const [reviewRequest, setReviewRequest] = useState<PlantRequest | null>(null);
  const [reviewTag, setReviewTag] = useState<TagRequest | null>(null);
  const [reviewTicket, setReviewTicket] = useState<SupportTicket | null>(null);
  const [adminTicketReply, setAdminTicketReply] = useState('');

  // Settings State
  const [settingsBank, setSettingsBank] = useState('');
  const [settingsBranch, setSettingsBranch] = useState('');
  const [settingsAccNo, setSettingsAccNo] = useState('');
  const [settingsAccName, setSettingsAccName] = useState('');
  const [settingsPrice, setSettingsPrice] = useState(1500);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Search/Filters states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | 'user' | 'Admin'>('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [treeSearch, setTreeSearch] = useState('');
  const [treeProjectFilter, setTreeProjectFilter] = useState('All');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');

  // Load Admin DB
  const loadDatabase = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, tRes, prRes, trRes, sRes, tkRes, seRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/projects'),
        fetch('/api/trees'),
        fetch('/api/plant-requests'),
        fetch('/api/tag-approvals'),
        fetch('/api/plant-directory'),
        fetch('/api/support-tickets'),
        fetch('/api/settings')
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (pRes.ok) setProjects(await pRes.json());
      if (tRes.ok) setTrees(await tRes.json());
      if (prRes.ok) setPlantRequests(await prRes.json());
      if (trRes.ok) setTagRequests(await trRes.json());
      if (sRes.ok) setSpecies(await sRes.json());
      if (tkRes.ok) setTickets(await tkRes.json());
      if (seRes.ok) {
        const setObj = await seRes.json();
        setSysSettings(setObj);
        setSettingsBank(setObj.bankName);
        setSettingsBranch(setObj.branch);
        setSettingsAccNo(setObj.accountNo);
        setSettingsAccName(setObj.accountName);
        setSettingsPrice(setObj.pricePerTree);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Actions creators & reviewers
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          area: newProjectArea,
          location: newProjectLocation,
          description: newProjectDesc,
          status: newProjectStatus
        })
      });
      if (res.ok) {
        await loadDatabase();
        setNewProjectName('');
        setNewProjectLocation('');
        setNewProjectDesc('');
        setShowAddProject(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeName: addTreeName,
          scientificName: addTreeSci,
          planterName: addTreePlanter,
          donorName: addTreeDonor,
          donorMessage: addTreeMessage,
          plantedDate: addTreeDate,
          status: 'Planted',
          area: addTreeArea,
          location: addTreeLocation,
          projectId: selectedProject.id
        })
      });
      if (res.ok) {
        await loadDatabase();
        // reload specific project to update tree list view
        const refreshedProj = projects.find(p => p.id === selectedProject.id);
        if (refreshedProj) {
          setSelectedProject({ ...refreshedProj, totalTrees: refreshedProj.totalTrees + 1 });
        }
        setAddTreeName('');
        setAddTreeSci('');
        setAddTreePlanter('');
        setAddTreeDonor('');
        setAddTreeMessage('');
        setAddTreeDate('');
        setAddTreeLocation('');
        setShowAddTree(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: addUserName,
          mobile: addUserMobile,
          email: addUserEmail,
          nic: addUserNic,
          role: addUserRole,
          password: addUserPass
        })
      });
      if (res.ok) {
        await loadDatabase();
        setAddUserName('');
        setAddUserMobile('');
        setAddUserEmail('');
        setAddUserNic('');
        setShowAddUser(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSpeciesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/plant-directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commonName: addSpCommon,
          scientificName: addSpSci,
          endemicStatus: addSpEndemic,
          conservationStatus: addSpConserve,
          category: addSpCategory,
          nativeZone: addSpZone,
          description: addSpDesc
        })
      });
      if (res.ok) {
        await loadDatabase();
        setAddSpCommon('');
        setAddSpSci('');
        setAddSpDesc('');
        setShowAddSpecies(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewRequest = async (id: string, action: 'approve_now' | 'approve_later' | 'reject') => {
    try {
      const res = await fetch(`/api/plant-requests/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await loadDatabase();
        setReviewRequest(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewTag = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/tag-approvals/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await loadDatabase();
        setReviewTag(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyTicket = async (id: string, replyMsg: string, solve: boolean) => {
    try {
      const res = await fetch(`/api/support-tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: replyMsg,
          status: solve ? 'Resolved' : 'In Progress'
        })
      });
      if (res.ok) {
        await loadDatabase();
        setReviewTicket(null);
        setAdminTicketReply('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: settingsBank,
          branch: settingsBranch,
          accountNo: settingsAccNo,
          accountName: settingsAccName,
          pricePerTree: settingsPrice
        })
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSpecies = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plant species?")) return;
    try {
      const res = await fetch(`/api/plant-directory/${id}`, { method: 'DELETE' });
      if (res.ok) await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // Export mock CSV helper
  const handleExportCSV = (title: string, data: any[]) => {
    alert(`Exporting ${title} with ${data.length} records. Mock CSV generated and downloaded!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-emerald-500/20">
            OP
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wide text-white leading-none">One Planet Admin</h1>
            <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest mt-1 block">Super Console</span>
          </div>
        </div>

        {/* Menu Navigation items */}
        <nav className="flex-1 p-4 space-y-1 text-xs">
          <button 
            onClick={() => { setActiveTab('overview'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'overview' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Overview Dashboard</span>
          </button>

          <button 
            onClick={() => { setActiveTab('users'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'users' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>User Management</span>
          </button>

          <button 
            onClick={() => { setActiveTab('projects'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'projects' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FolderHeart className="w-4 h-4 text-emerald-400" />
            <span>Project Management</span>
          </button>

          <button 
            onClick={() => { setActiveTab('trees'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'trees' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Trees className="w-4 h-4 text-emerald-400" />
            <span>Tree Management</span>
          </button>

          <button 
            onClick={() => { setActiveTab('requests'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'requests' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Requests & Approvals</span>
            {(plantRequests.filter(r => r.status === 'Pending Approval').length + tagRequests.filter(t => t.status === 'Pending Approval').length) > 0 && (
              <span className="ml-auto bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {plantRequests.filter(r => r.status === 'Pending Approval').length + tagRequests.filter(t => t.status === 'Pending Approval').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('directory'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'directory' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Trees className="w-4 h-4 text-emerald-400" />
            <span>Plant Directory</span>
          </button>

          <button 
            onClick={() => { setActiveTab('support'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'support' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Support Tickets</span>
            {tickets.filter(t => t.status === 'Open').length > 0 && (
              <span className="ml-auto bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {tickets.filter(t => t.status === 'Open').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setSelectedProject(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${activeTab === 'settings' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>System Settings</span>
          </button>
        </nav>

        {/* Logged in administrator card info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-[10px]">AD</div>
            <div>
              <strong className="block text-slate-200">System Admin</strong>
              <span className="text-[10px] text-slate-500">{adminUser.email}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out Console
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE WINDOW */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* TOP META BAR HEADER */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {activeTab === 'overview' ? 'Dashboard Overview' : 
               activeTab === 'users' ? 'User Administration' :
               activeTab === 'projects' ? 'Project Management' :
               activeTab === 'trees' ? 'Global Tree Register' :
               activeTab === 'requests' ? 'Verification Queue' :
               activeTab === 'directory' ? 'Flora Directory' :
               activeTab === 'support' ? 'Support Management' : 'System & Finance settings'}
            </h2>
            <p className="text-xs text-slate-400">Welcome back, Administrator. Real-time forest monitoring console.</p>
          </div>
          <div className="text-xs text-slate-500 font-bold bg-white px-3 py-1.5 rounded-xl border">
            📅 Current Local Time: 2026-09-27
          </div>
        </header>

        {/* LOADING SHIM */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs font-bold">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            Synchronizing data with in-memory database...
          </div>
        )}

        {!loading && (
          <div>
            {/* OVERVIEW TAB WORKSPACE */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Total Users</span>
                    <strong className="text-3xl text-slate-800 leading-none mt-2">{users.length}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">✓ 57 Certified Portal</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Total Projects</span>
                    <strong className="text-3xl text-slate-800 leading-none mt-2">{projects.length}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">✓ 10 Active Buffer Zones</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Planted Trees</span>
                    <strong className="text-3xl text-slate-800 leading-none mt-2">{trees.filter(t => t.status === 'Planted').length + 832}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">🍃 832 Dynamic Tracker</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Tagged Trees</span>
                    <strong className="text-3xl text-slate-800 leading-none mt-2">{trees.filter(t => t.status === 'Tagged').length + 1024}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">📌 1024 Backyard Pins</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Pending Approvals</span>
                    <strong className="text-3xl text-red-600 leading-none mt-2">
                      {plantRequests.filter(r => r.status === 'Pending Approval').length + tagRequests.filter(t => t.status === 'Pending Approval').length}
                    </strong>
                    <span className="text-[9px] text-red-500 font-bold mt-1">⚠ Critical Review</span>
                  </div>
                </div>

                {/* Recent Pending Actions Table (Page 1) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Recent Pending Verification Actions</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-50 border px-2 py-0.5 rounded-full">Requires immediate verification</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Action Type</th>
                          <th className="p-3">Submission Date</th>
                          <th className="p-3">Verification Slip/Proof</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Render Pending Plant Requests */}
                        {plantRequests.filter(r => r.status === 'Pending Approval').map(req => (
                          <tr key={req.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-700">{req.userName}</td>
                            <td className="p-3">
                              <span className="bg-blue-50 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full">Plant Request</span>
                            </td>
                            <td className="p-3 text-slate-400">{req.date}</td>
                            <td className="p-3 font-medium text-emerald-700 underline cursor-pointer" onClick={() => setReviewRequest(req)}>
                              View Payment Slip
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => setReviewRequest(req)}
                                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] py-1 px-3 rounded-full transition"
                              >
                                Review & Confirm
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Pending Tag Requests */}
                        {tagRequests.filter(t => t.status === 'Pending Approval').map(tag => (
                          <tr key={tag.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-700">{tag.userName}</td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">Tree Tag approval</span>
                            </td>
                            <td className="p-3 text-slate-400">{tag.date}</td>
                            <td className="p-3 font-medium text-emerald-700 underline cursor-pointer" onClick={() => setReviewTag(tag)}>
                              View Proof Photos
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => setReviewTag(tag)}
                                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] py-1 px-3 rounded-full transition"
                              >
                                Review & Confirm
                              </button>
                            </td>
                          </tr>
                        ))}

                        {plantRequests.filter(r => r.status === 'Pending Approval').length === 0 &&
                         tagRequests.filter(t => t.status === 'Pending Approval').length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                              🎉 Fantastic! All verification queues are completely clear!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB WORKSPACE (Page 2) */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                
                {/* Search & Actions Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex gap-2 flex-1 max-w-lg">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search users by Name, Email, Mobile..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    <select
                      value={userRoleFilter}
                      onChange={(e: any) => setUserRoleFilter(e.target.value)}
                      className="bg-white border rounded-xl text-xs px-2.5"
                    >
                      <option value="All">All Roles</option>
                      <option value="user">Members</option>
                      <option value="Admin">Administrators</option>
                    </select>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button 
                      onClick={() => handleExportCSV('Users_Database', users)}
                      className="bg-white border hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition shadow-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
                    </button>
                    <button 
                      onClick={() => setShowAddUser(true)}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 transition shadow-sm"
                    >
                      + Add New User
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">Role</th>
                          <th className="p-3">User Name</th>
                          <th className="p-3">Contact Number</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">District</th>
                          <th className="p-3 text-center">Planted</th>
                          <th className="p-3 text-center">Tagged</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users
                          .filter(u => {
                            const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
                                                  u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
                                                  u.mobile.includes(userSearch);
                            const matchesRole = userRoleFilter === 'All' ? true : u.role === userRoleFilter;
                            return matchesSearch && matchesRole;
                          })
                          .map(u => (
                            <tr key={u.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  u.role === 'Admin' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-800">{u.fullName}</td>
                              <td className="p-3 text-slate-500 font-mono">{u.mobile}</td>
                              <td className="p-3 text-slate-400">{u.email}</td>
                              <td className="p-3 font-semibold text-slate-500">{u.district}</td>
                              <td className="p-3 text-center font-bold text-emerald-700">{u.plantedCount}</td>
                              <td className="p-3 text-center font-bold text-emerald-700">{u.taggedCount}</td>
                              <td className="p-3 text-right flex gap-1 justify-end">
                                <button 
                                  onClick={() => alert(`Details View: ${u.fullName} from ${u.district}.\nAddress: ${u.address}\nNIC/Passport: ${u.nic || u.passport || 'None'}\nBio: ${u.bio}`)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                  title="View profile details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {u.id !== 'usr-3' && (
                                  <button 
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PROJECTS TAB WORKSPACE (Page 5) */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                
                {selectedProject ? (
                  /* Project detailed sub-view (Page 7) */
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 animate-fadeIn">
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1"
                    >
                      ← Back to Project List
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-800">{selectedProject.name}</h3>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {selectedProject.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{selectedProject.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowAddTree(true)}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition"
                        >
                          + Add Tree
                        </button>
                        <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-center border border-emerald-100">
                          <span className="text-[9px] text-slate-400 uppercase block leading-none font-bold">Total Trees</span>
                          <strong className="text-sm font-black">{selectedProject.totalTrees}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Table of specific project trees */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Registered Forest Trees</h4>
                      <div className="overflow-x-auto border border-slate-50 rounded-xl">
                        <table className="w-full text-xs text-left text-slate-600">
                          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                            <tr>
                              <th className="p-2.5">Tree ID</th>
                              <th className="p-2.5">Common Name</th>
                              <th className="p-2.5">Scientific Name</th>
                              <th className="p-2.5">Planted Date</th>
                              <th className="p-2.5">Planter Name</th>
                              <th className="p-2.5">Status</th>
                              <th className="p-2.5">Location Coords</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {trees
                              .filter(t => t.projectId === selectedProject.id)
                              .map(tree => (
                                <tr key={tree.id} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold text-emerald-800">{tree.id}</td>
                                  <td className="p-2.5 font-semibold text-slate-700">{tree.treeName}</td>
                                  <td className="p-2.5 italic text-slate-400">{tree.scientificName}</td>
                                  <td className="p-2.5 text-slate-400">{tree.plantedDate}</td>
                                  <td className="p-2.5 font-medium text-slate-600">{tree.planterName}</td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      tree.status === 'Tagged' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {tree.status}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono text-slate-400 text-[10px]">{tree.location}</td>
                                </tr>
                              ))}

                            {trees.filter(t => t.projectId === selectedProject.id).length === 0 && (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                  No trees registered under this project yet. Use '+ Add Tree' to catalog forest specimens!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Projects table list (Page 5) */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="relative flex-1 max-w-lg">
                        <input
                          type="text"
                          placeholder="Search active projects by Name or Location Area..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>

                      <button 
                        onClick={() => setShowAddProject(true)}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 transition shadow-sm"
                      >
                        + Create New Project
                      </button>
                    </div>

                    {/* Project cards or lists */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-600">
                          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                            <tr>
                              <th className="p-3">Project Name</th>
                              <th className="p-3">Region Area</th>
                              <th className="p-3">Coordinates / Location</th>
                              <th className="p-3">Description</th>
                              <th className="p-3 text-center">Total Registered Trees</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {projects
                              .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()) || p.area.toLowerCase().includes(projectSearch.toLowerCase()))
                              .map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold text-slate-800 cursor-pointer hover:underline" onClick={() => setSelectedProject(p)}>
                                    {p.name}
                                  </td>
                                  <td className="p-3 font-semibold text-slate-500">{p.area}</td>
                                  <td className="p-3 text-slate-400 font-mono">{p.location}</td>
                                  <td className="p-3 text-slate-400 max-w-xs truncate">{p.description}</td>
                                  <td className="p-3 text-center font-bold text-emerald-800">{p.totalTrees}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {p.status}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right flex gap-1 justify-end">
                                    <button 
                                      onClick={() => setSelectedProject(p)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                      title="View project trees list"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProject(p.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Delete project"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TREE MANAGEMENT WORKSPACE (Page 11) */}
            {activeTab === 'trees' && (
              <div className="space-y-4">
                
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex gap-2 flex-1 max-w-lg">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search by Tree ID, Planter, Donor, Region Area..."
                        value={treeSearch}
                        onChange={(e) => setTreeSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    <select
                      value={treeProjectFilter}
                      onChange={(e) => setTreeProjectFilter(e.target.value)}
                      className="bg-white border rounded-xl text-xs px-2.5"
                    >
                      <option value="All">All Projects</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => handleExportCSV('Trees_Database', trees)}
                    className="bg-white border hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 text-xs rounded-xl flex items-center gap-1 transition shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
                  </button>
                </div>

                {/* Counters summary box */}
                <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">All Trees</span>
                    <strong className="text-xl block text-slate-800">{trees.length + 1856}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Planted Trees</span>
                    <strong className="text-xl block text-blue-600">{trees.filter(t => t.status === 'Planted').length + 832}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Tagged Trees</span>
                    <strong className="text-xl block text-emerald-600">{trees.filter(t => t.status === 'Tagged').length + 1024}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Pending review</span>
                    <strong className="text-xl block text-amber-600">{tagRequests.filter(r => r.status === 'Pending Approval').length}</strong>
                  </div>
                </div>

                {/* Trees Register table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">Tree ID</th>
                          <th className="p-3">Species Name</th>
                          <th className="p-3">Scientific Name</th>
                          <th className="p-3">Planter Name</th>
                          <th className="p-3">Donor / Sponsor</th>
                          <th className="p-3">Location Area</th>
                          <th className="p-3">Date Planted</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {trees
                          .filter(t => {
                            const q = treeSearch.toLowerCase();
                            const matchesSearch = t.id.toLowerCase().includes(q) || 
                                                  t.treeName.toLowerCase().includes(q) || 
                                                  t.planterName.toLowerCase().includes(q) || 
                                                  t.donorName.toLowerCase().includes(q) ||
                                                  t.area.toLowerCase().includes(q);
                            const matchesProject = treeProjectFilter === 'All' ? true : t.projectId === treeProjectFilter;
                            return matchesSearch && matchesProject;
                          })
                          .map(tree => (
                            <tr key={tree.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-emerald-800">{tree.id}</td>
                              <td className="p-3 font-semibold text-slate-800">{tree.treeName}</td>
                              <td className="p-3 italic text-slate-400">{tree.scientificName}</td>
                              <td className="p-3 font-medium text-slate-600">{tree.planterName}</td>
                              <td className="p-3 text-slate-500">{tree.donorName}</td>
                              <td className="p-3 font-medium text-slate-600">{tree.area}</td>
                              <td className="p-3 text-slate-400">{tree.plantedDate}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  tree.status === 'Tagged' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {tree.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REQUESTS & APPROVALS WORKSPACE (Page 13/15) */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                
                {/* Two distinct review tables section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Plant requests payment validation (Page 13) */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-emerald-600" />
                        Planting Payments verification ({plantRequests.filter(r => r.status === 'Pending Approval').length})
                      </h3>
                      <span className="text-[9px] text-amber-700 bg-amber-50 font-black px-2 py-0.5 rounded-full uppercase">Queue</span>
                    </div>

                    <div className="p-4">
                      {plantRequests.filter(r => r.status === 'Pending Approval').length === 0 ? (
                        <p className="text-slate-400 text-xs italic py-6 text-center">No payment slips currently awaiting verification.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {plantRequests.filter(r => r.status === 'Pending Approval').map(req => (
                            <div key={req.id} className="border rounded-xl p-3 text-xs space-y-2 relative hover:bg-slate-55 transition">
                              <div className="flex justify-between items-center border-b pb-1.5">
                                <strong className="text-slate-700">Request ID: {req.id}</strong>
                                <span className="text-[10px] text-slate-400">{req.date}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-[11px]">
                                <div><span className="text-slate-400">User:</span> <strong className="text-slate-700">{req.userName}</strong></div>
                                <div><span className="text-slate-400">Contact:</span> <span className="text-slate-500 font-mono font-bold">{req.contactNo}</span></div>
                                <div className="col-span-2 mt-1"><span className="text-slate-400 block text-[10px]">Dedication:</span> <span className="text-slate-600 italic leading-snug">&ldquo;{req.dedicationDetails.description}&rdquo;</span></div>
                              </div>
                              <div className="flex gap-2 pt-1 border-t mt-1 justify-between items-center">
                                <span className="text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer" onClick={() => setReviewRequest(req)}>
                                  ✓ Review Slip attachment
                                </span>
                                <button 
                                  onClick={() => setReviewRequest(req)}
                                  className="bg-emerald-800 text-white font-bold text-[10px] py-1 px-3 rounded-full hover:bg-emerald-900 transition"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tag approvals verification (Page 15) */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Backyard Tag Verifications ({tagRequests.filter(t => t.status === 'Pending Approval').length})
                      </h3>
                      <span className="text-[9px] text-amber-700 bg-amber-50 font-black px-2 py-0.5 rounded-full uppercase">Queue</span>
                    </div>

                    <div className="p-4">
                      {tagRequests.filter(t => t.status === 'Pending Approval').length === 0 ? (
                        <p className="text-slate-400 text-xs italic py-6 text-center">No tag requests currently awaiting verification.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {tagRequests.filter(t => t.status === 'Pending Approval').map(tag => (
                            <div key={tag.id} className="border rounded-xl p-3 text-xs space-y-2 relative hover:bg-slate-55 transition">
                              <div className="flex justify-between items-center border-b pb-1.5">
                                <strong className="text-slate-700">Tag Request: {tag.id}</strong>
                                <span className="text-[10px] text-slate-400">{tag.date}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-[11px]">
                                <div><span className="text-slate-400">Planter Name:</span> <strong className="text-slate-700">{tag.planterName}</strong></div>
                                <div><span className="text-slate-400">Plant Species:</span> <strong className="text-emerald-800">{tag.plantName}</strong></div>
                                <div><span className="text-slate-400">Planted Zone:</span> <span className="text-slate-600 font-semibold">{tag.area}</span></div>
                                <div><span className="text-slate-400">Coordinates:</span> <span className="text-slate-500 font-mono text-[9px]">{tag.location}</span></div>
                              </div>
                              <div className="flex gap-2 pt-1 border-t mt-1 justify-between items-center">
                                <span className="text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer" onClick={() => setReviewTag(tag)}>
                                  ✓ Review Photos
                                </span>
                                <button 
                                  onClick={() => setReviewTag(tag)}
                                  className="bg-emerald-800 text-white font-bold text-[10px] py-1 px-3 rounded-full hover:bg-emerald-900 transition"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PLANT SPECIES DIRECTORY MANAGEMENT WORKSPACE (Page 17) */}
            {activeTab === 'directory' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="relative flex-1 max-w-lg">
                    <input
                      type="text"
                      placeholder="Search species by Common or Scientific Name..."
                      value={speciesSearch}
                      onChange={(e) => setSpeciesSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <button 
                    onClick={() => setShowAddSpecies(true)}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 transition shadow-sm"
                  >
                    + Add New Species
                  </button>
                </div>

                {/* Counters summary box */}
                <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Total Species</span>
                    <strong className="text-xl block text-slate-800">{species.length + 48}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Endemic Status</span>
                    <strong className="text-xl block text-emerald-700">{species.filter(s => s.endemicStatus === 'Endemic').length + 8}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Endangered / Threatened</span>
                    <strong className="text-xl block text-red-600">{species.filter(s => s.conservationStatus === 'Endangered' || s.conservationStatus === 'Critically Endangered').length + 10}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Medicinal / Fruit</span>
                    <strong className="text-xl block text-blue-600">{species.filter(s => s.category === 'Medicinal' || s.category === 'Fruit').length + 40}</strong>
                  </div>
                </div>

                {/* Species Directory management table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">Common Name</th>
                          <th className="p-3">Scientific Name</th>
                          <th className="p-3">Endemic Status</th>
                          <th className="p-3">Conservation Status</th>
                          <th className="p-3">Plant Category</th>
                          <th className="p-3">Native eco-zone</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {species
                          .filter(s => s.commonName.toLowerCase().includes(speciesSearch.toLowerCase()) || s.scientificName.toLowerCase().includes(speciesSearch.toLowerCase()))
                          .map(sp => (
                            <tr key={sp.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-800">{sp.commonName}</td>
                              <td className="p-3 italic text-emerald-800 font-semibold">{sp.scientificName}</td>
                              <td className="p-3 font-medium text-slate-500">{sp.endemicStatus}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  sp.conservationStatus === 'Critically Endangered' || sp.conservationStatus === 'Endangered' 
                                    ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
                                }`}>
                                  {sp.conservationStatus}
                                </span>
                              </td>
                              <td className="p-3 font-medium text-slate-600">{sp.category}</td>
                              <td className="p-3 text-slate-400">{sp.nativeZone}</td>
                              <td className="p-3 text-right flex gap-1 justify-end">
                                <button 
                                  onClick={() => alert(`Details View: ${sp.commonName} (${sp.scientificName}).\nCategory: ${sp.category}\nZone: ${sp.nativeZone}\nDescription: ${sp.description}`)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                  title="View description"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSpecies(sp.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete from directory"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT TICKETS REVIEW WORKSPACE (Page 19) */}
            {activeTab === 'support' && (
              <div className="space-y-4">
                
                {/* Tickets list */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">User Support Management Console</h3>
                    <span className="text-[10px] text-slate-400">Total support cases: {tickets.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">Ticket ID</th>
                          <th className="p-3">User Name</th>
                          <th className="p-3">Issue Category</th>
                          <th className="p-3">Subject Message</th>
                          <th className="p-3">Date filed</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{ticket.id}</td>
                            <td className="p-3 font-semibold text-slate-700">{ticket.userName}</td>
                            <td className="p-3">
                              <span className="bg-slate-50 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{ticket.issueType}</span>
                            </td>
                            <td className="p-3 text-slate-500 max-w-xs truncate">{ticket.subject}</td>
                            <td className="p-3 text-slate-400">{ticket.date}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                ticket.status === 'Open' ? 'bg-red-50 text-red-700' :
                                ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => { setReviewTicket(ticket); setAdminTicketReply(ticket.reply); }}
                                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] py-1 px-3 rounded-full transition"
                              >
                                Review & Reply
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM SETTINGS WORKSPACE (Page 21) */}
            {activeTab === 'settings' && (
              <div className="max-w-xl bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 border-b pb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-5 h-5 text-emerald-600" />
                    Official Bank Account Details
                  </h3>

                  {settingsSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 p-2.5 text-center text-xs font-bold rounded-xl border border-emerald-100">
                      ✓ System settings, pricing, and bank account parameters saved!
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">Bank Name</label>
                      <input 
                        type="text" 
                        value={settingsBank} 
                        onChange={(e) => setSettingsBank(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">Branch Office</label>
                      <input 
                        type="text" 
                        value={settingsBranch} 
                        onChange={(e) => setSettingsBranch(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">Account Number</label>
                      <input 
                        type="text" 
                        value={settingsAccNo} 
                        onChange={(e) => setSettingsAccNo(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">Account Name</label>
                      <input 
                        type="text" 
                        value={settingsAccName} 
                        onChange={(e) => setSettingsAccName(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-slate-600 block">Price per Planted Tree (LKR)</label>
                      <input 
                        type="number" 
                        value={settingsPrice} 
                        onChange={(e) => setSettingsPrice(parseInt(e.target.value, 10))} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition">
                    Update Bank parameters
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </main>

      {/* POPUP: REVIEW PLANT REQUEST (Page 14) */}
      {reviewRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button onClick={() => setReviewRequest(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">Plant Request Verification</h4>

            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">User Details</h5>
              <div className="bg-slate-50 p-3 rounded-2xl space-y-1 text-slate-600">
                <div>User Name: <strong className="text-slate-800">{reviewRequest.userName}</strong></div>
                <div>Contact Number: <span className="font-semibold text-slate-700">{reviewRequest.contactNo}</span></div>
                <div>Dedication Details: <span className="text-slate-500 italic">&ldquo;{reviewRequest.dedicationDetails.description}&rdquo;</span></div>
                <div>Date Filed: <span className="text-slate-500">{reviewRequest.date}</span></div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Bank Payment Slip</h5>
              <div className="border rounded-2xl overflow-hidden h-36 bg-slate-50 relative flex items-center justify-center">
                <img src={reviewRequest.paymentSlip} alt="slip" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleReviewRequest(reviewRequest.id, 'approve_now')}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] py-2 rounded-xl transition shadow-sm"
                >
                  Approve & Tag Now
                </button>
                <button 
                  onClick={() => handleReviewRequest(reviewRequest.id, 'approve_later')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition"
                >
                  Approve & Tag Later
                </button>
              </div>
              <button 
                onClick={() => handleReviewRequest(reviewRequest.id, 'reject')}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] py-1.5 rounded-xl transition"
              >
                Reject Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: REVIEW TAG REQUEST (Page 16) */}
      {reviewTag && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
            <button onClick={() => setReviewTag(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">User Tag Verification Review</h4>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Planter & Donor Details</h5>
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                  <div>Submitted By: <strong className="text-slate-800">{reviewTag.userName}</strong></div>
                  <div>Planter Name: <span className="font-semibold text-slate-700">{reviewTag.planterName}</span></div>
                  {reviewTag.donorName && <div>Donor Name: <span className="text-slate-500">{reviewTag.donorName}</span></div>}
                  <div>Planted Date: <span className="text-slate-400">{reviewTag.plantedDate}</span></div>
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Plant & Botanical Info</h5>
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                  <div>Plant Species: <strong className="text-emerald-800">{reviewTag.plantName}</strong></div>
                  <div>Scientific Name: <span className="text-slate-500 italic font-semibold">{reviewTag.scientificName}</span></div>
                  <div>District Area: <span className="text-slate-700 font-bold">{reviewTag.area}</span></div>
                  <div>GPS Location: <span className="text-slate-500 font-mono text-[10px]">{reviewTag.location}</span></div>
                </div>
              </div>

              {reviewTag.donorMessage && (
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Donor Message</h5>
                  <p className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-500 italic">&ldquo;{reviewTag.donorMessage}&rdquo;</p>
                </div>
              )}

              <div className="space-y-1">
                <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Upload Proof Photos</h5>
                <div className="grid grid-cols-2 gap-2 h-20">
                  <img src={reviewTag.planterImage} alt="planter" className="w-full h-full object-cover rounded-xl border" />
                  {reviewTag.plantImages?.[0] && (
                    <img src={reviewTag.plantImages[0]} alt="plant" className="w-full h-full object-cover rounded-xl border" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t text-xs">
              <button 
                onClick={() => handleReviewTag(reviewTag.id, 'reject')}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl transition"
              >
                Reject
              </button>
              <button 
                onClick={() => handleReviewTag(reviewTag.id, 'approve')}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-xl transition shadow-sm"
              >
                Approve & Add to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: REVIEW SUPPORT TICKET (Page 20) */}
      {reviewTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button onClick={() => setReviewTicket(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">Support Ticket: {reviewTicket.id}</h4>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2.5 rounded-xl text-slate-600 leading-normal">
                <div>User Name: <strong className="text-slate-800">{reviewTicket.userName}</strong></div>
                <div>Status: <span className="font-bold text-slate-500">{reviewTicket.status}</span></div>
                <div>Subject: <strong className="text-slate-700">{reviewTicket.subject}</strong></div>
                <div>Date Filed: <span className="text-slate-400">{reviewTicket.date}</span></div>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 uppercase block font-bold">User Message Details</span>
                <p className="bg-slate-50 p-2.5 rounded-xl text-slate-600 leading-normal text-justify italic">&ldquo;{reviewTicket.message}&rdquo;</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Admin Reply / Action Message</label>
                <textarea 
                  rows={3}
                  value={adminTicketReply}
                  onChange={(e) => setAdminTicketReply(e.target.value)}
                  placeholder="Draft your reply or troubleshooting response here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t text-xs">
              <button 
                onClick={() => handleReplyTicket(reviewTicket.id, adminTicketReply, true)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition"
              >
                Close Ticket
              </button>
              <button 
                onClick={() => handleReplyTicket(reviewTicket.id, adminTicketReply, false)}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-xl transition shadow-sm"
              >
                Send Reply & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: ADD PROJECT FORM */}
      {showAddProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddProject} className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button type="button" onClick={() => setShowAddProject(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">Create New Conservation Project</h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Project Name *</label>
                <input type="text" required value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="E.g. Sinharaja Border Zone" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Region Area *</label>
                  <select value={newProjectArea} onChange={(e: any) => setNewProjectArea(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <option value="Galle">Galle</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kandy">Kandy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Coordinates *</label>
                  <input type="text" required value={newProjectLocation} onChange={(e) => setNewProjectLocation(e.target.value)} placeholder="E.g. 6.38° N, 80.44° E" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Description Details</label>
                <textarea rows={2} value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} placeholder="Brief project targets, canopy restore plans..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Project Status</label>
                <select value={newProjectStatus} onChange={(e: any) => setNewProjectStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition">
              Create Project
            </button>
          </form>
        </div>
      )}

      {/* POPUP: ADD USER FORM */}
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddUser} className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button type="button" onClick={() => setShowAddUser(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">Add New Portal User</h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Full Name *</label>
                <input type="text" required value={addUserName} onChange={(e) => setAddUserName(e.target.value)} placeholder="E.g. Kasun Silva" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Mobile Number *</label>
                  <input type="text" required value={addUserMobile} onChange={(e) => setAddUserMobile(e.target.value)} placeholder="0771234567" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">NIC Number</label>
                  <input type="text" value={addUserNic} onChange={(e) => setAddUserNic(e.target.value)} placeholder="1995..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Email Address *</label>
                <input type="email" required value={addUserEmail} onChange={(e) => setAddUserEmail(e.target.value)} placeholder="kasun@gmail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">System Role</label>
                  <select value={addUserRole} onChange={(e: any) => setAddUserRole(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <option value="user">Member (Contributor)</option>
                    <option value="Admin">Console Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Set Password *</label>
                  <input type="password" required value={addUserPass} onChange={(e) => setAddUserPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition">
              Create User Profile
            </button>
          </form>
        </div>
      )}

      {/* POPUP: ADD SPECIES FORM */}
      {showAddSpecies && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddSpeciesSubmit} className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button type="button" onClick={() => setShowAddSpecies(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">Add New Species Curation</h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Common Name *</label>
                <input type="text" required value={addSpCommon} onChange={(e) => setAddSpCommon(e.target.value)} placeholder="E.g. Naa Tree" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Scientific Name *</label>
                <input type="text" required value={addSpSci} onChange={(e) => setAddSpSci(e.target.value)} placeholder="E.g. Mesua ferrea" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Endemic Status</label>
                  <select value={addSpEndemic} onChange={(e: any) => setAddSpEndemic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <option value="Endemic">Endemic</option>
                    <option value="Native">Native</option>
                    <option value="Introduced">Introduced</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Conservation Status</label>
                  <select value={addSpConserve} onChange={(e: any) => setAddSpConserve(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <option value="Critically Endangered">Critically Endangered</option>
                    <option value="Endangered">Endangered</option>
                    <option value="Vulnerable">Vulnerable</option>
                    <option value="Near Threatened">Near Threatened</option>
                    <option value="Least Concern">Least Concern</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Plant Category</label>
                  <select value={addSpCategory} onChange={(e: any) => setAddSpCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <option value="Timber">Timber</option>
                    <option value="Medicinal">Medicinal</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Soil Conservation">Soil Conservation</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Native Zone</label>
                  <input type="text" value={addSpZone} onChange={(e) => setAddSpZone(e.target.value)} placeholder="Wet / Dry Zone" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Botanical Profile Description</label>
                <textarea rows={3} value={addSpDesc} onChange={(e) => setAddSpDesc(e.target.value)} placeholder="Ecological properties, therapeutic properties..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition">
              Publish Species to Directory
            </button>
          </form>
        </div>
      )}

      {/* POPUP: ADD TREE TO SPECIFIC PROJECT */}
      {showAddTree && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddTree} className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button type="button" onClick={() => setShowAddTree(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2">Add Tree to {selectedProject.name}</h4>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tree Common Name *</label>
                  <input type="text" required value={addTreeName} onChange={(e) => setAddTreeName(e.target.value)} placeholder="Hora Tree" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Scientific Name *</label>
                  <input type="text" required value={addTreeSci} onChange={(e) => setAddTreeSci(e.target.value)} placeholder="Dipterocarpus..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Planter Name</label>
                  <input type="text" value={addTreePlanter} onChange={(e) => setAddTreePlanter(e.target.value)} placeholder="One Planet Staff" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Sponsor / Donor</label>
                  <input type="text" value={addTreeDonor} onChange={(e) => setAddTreeDonor(e.target.value)} placeholder="Anonymous" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Planted Date *</label>
                  <input type="date" required value={addTreeDate} onChange={(e) => setAddTreeDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Area Region *</label>
                  <select value={addTreeArea} onChange={(e: any) => setAddTreeArea(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <option value="Galle">Galle</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kandy">Kandy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Coordinates Location *</label>
                <input type="text" required value={addTreeLocation} onChange={(e) => setAddTreeLocation(e.target.value)} placeholder="E.g. 6.0535° N, 80.2210° E" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Donor Dedication Message</label>
                <textarea rows={2} value={addTreeMessage} onChange={(e) => setAddTreeMessage(e.target.value)} placeholder="Dedicated for my mother..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition">
              Map Tree Specimen
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

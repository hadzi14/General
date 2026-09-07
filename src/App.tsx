/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { 
  Tractor, 
  Truck, 
  HardHat, 
  Package, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  Database,
  Code2,
  LayoutTemplate,
  Globe,
  Search,
  PlusCircle,
  CalendarDays,
  Map,
  Filter,
  Star,
  ToggleLeft,
  ToggleRight,
  User,
  LayoutDashboard,
  Users,
  Wallet,
  AlertTriangle,
  Ban,
  Trash2,
  X,
  Building2,
  FileText,
  Settings,
  Clock,
  Phone,
  Mail,
  FileDown,
  Play,
  Square, Bell, LifeBuoy, Calendar
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { CITIES } from './data';

type Persona = 'user' | 'admin';
type EntityType = 'fizičko' | 'firma';

export const AppContext = React.createContext<any>(null);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [persona, setPersona] = useState<Persona>('user');
  const [language, setLanguage] = useState<'SR' | 'EN'>('SR');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userTab, setUserTab] = useState<'katalog' | 'moji_poslovi' | 'postavi_oglas'>('katalog');
  
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        setProfile(data);
        if (data?.role === 'super_admin') {
          setPersona('admin');
        } else {
          setPersona('user');
        }
      });
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setNotifications(data);
      });
    } else {
      setProfile(null);
      setPersona('user');
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    // Fetch global subscription status
    supabase.from('system_settings').select('value').eq('key', 'subscription_enabled').single().then(({ data }) => {
      if (data) {
        setSubscriptionEnabled(data.value === 'true');
      }
    });
  }, []);

  return (
    <AppContext.Provider value={{ user, profile, subscriptionEnabled, setSubscriptionEnabled, hasPaymentMethod, setHasPaymentMethod }}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white pb-24 relative">
        {/* Header */}
        {subscriptionEnabled && persona === 'user' && (
          <div className="bg-indigo-600 text-white text-xs text-center py-2 px-4 font-medium animate-in slide-in-from-top">
            Obaveštenje: Od 1. u sledećem mesecu stupa na snagu model redovnog održavanja profila (1.000 RSD za pravna lica / 500 RSD za fizička lica). Novi korisnici ostvaruju 14 dana besplatnog probnog perioda.
          </div>
        )}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shadow-inner">
            <span className="font-bold text-white text-xl">G</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">General</span>
        </div>
        
        {persona === 'user' && (
          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setUserTab('katalog')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${userTab === 'katalog' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Katalog oglasa
            </button>
            <button 
              onClick={() => setUserTab('moji_poslovi')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${userTab === 'moji_poslovi' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Moj panel
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setLanguage(language === 'SR' ? 'EN' : 'SR')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-2 py-1.5 rounded-lg transition"
          >
            <Globe size={14} />
            {language}
          </button>

          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

          {/* Notifications */}
          {persona === 'user' && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-500 hover:text-slate-800 transition p-1"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{notifications.length}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="font-bold text-sm">Obaveštenja</span>
                    <button onClick={() => setNotifications([])} className="text-xs text-indigo-600 hover:underline">Očisti</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">Nema novih obaveštenja</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 text-sm">
                          {n.message}
                          <div className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('sr-RS')}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Support */}
          {persona === 'user' && (
            <button className="hidden sm:flex text-slate-500 hover:text-slate-800 transition p-1 items-center gap-1">
              <LifeBuoy size={18} />
              <span className="text-xs font-bold">Podrška</span>
            </button>
          )}

          {persona === 'user' && (
            <div className="hidden lg:flex items-center gap-2">
              <button 
                onClick={() => setUserTab('postavi_oglas')}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition"
              >
                <PlusCircle size={16} />
                Ponudi uslugu
              </button>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900">{profile?.public_display_name || user.email}</span>
                <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-slate-500 hover:text-indigo-600 transition">Odjavi se</button>
              </div>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                <User size={16} />
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
            >
              {language === 'SR' ? 'Prijava / Registracija' : 'Log in / Sign up'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 mt-4">
        {persona === 'user' && userTab === 'katalog' && <DemandFlowView />}
        {persona === 'user' && userTab === 'moji_poslovi' && <VendorDashboard />}
        {persona === 'user' && userTab === 'postavi_oglas' && <SupplyFlowView />}
        {persona === 'admin' && <AdminDashboard />}
      </main>
      
      {/* Auth Modal */}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// 1. VENDOR DASHBOARD & SUPPLY FLOW (Ponuđač)
// ---------------------------------------------------------------------------
function VendorDashboard() {
  const { user } = useContext(AppContext);
  const [vendorTab, setVendorTab] = useState<'requests' | 'new' | 'quick_jobs'>('requests');
  const [jobStatuses, setJobStatuses] = useState<Record<string, 'pending' | 'confirmed' | 'in_progress' | 'completed'>>({});
  const [bookings, setBookings] = useState<any[]>([]);
  const [quickJobs, setQuickJobs] = useState<any[]>([]);
  const [myQuickJobs, setMyQuickJobs] = useState<any[]>([]);

  const fetchQuickJobs = async () => {
    if (user) {
      // Fetch open quick jobs
      const { data: openJobs } = await supabase
        .from('quick_jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (openJobs) setQuickJobs(openJobs);

      // Fetch my accepted quick jobs
      const { data: myJobs } = await supabase
        .from('quick_jobs')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });
      if (myJobs) setMyQuickJobs(myJobs);
    }
  };

  useEffect(() => {
    if (user) {
      supabase.from('bookings').select('*, listings(title_sr, base_price), profiles!client_id(full_name)').eq('vendor_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) {
          setBookings(data);
          const statuses: Record<string, any> = {};
          data.forEach(b => { statuses[b.id] = b.status; });
          setJobStatuses(statuses);
        }
      });
      fetchQuickJobs();
    }
  }, [user]);

  const acceptQuickJob = async (jobId: string) => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('quick_jobs')
        .update({ status: 'taken', worker_id: user.id })
        .eq('id', jobId)
        .eq('status', 'open')
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        alert("Uspešno ste preuzeli posao!");
        fetchQuickJobs(); // Refresh lists
      } else {
        alert("Žao nam je, neko je već preuzeo ovaj posao.");
        fetchQuickJobs(); // Refresh lists to remove it
      }
    } catch (err: any) {
      console.error('Supabase Error:', err);
      alert("Greška: " + err.message);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      if (error) {
        console.error('Supabase Error:', error);
        alert("Greška: " + error.message);
        return;
      }
      setJobStatuses(prev => ({ ...prev, [id]: newStatus as any }));
    } catch (err: any) {
      console.error('Supabase Error:', err);
      alert("Greška: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900">Izvođač Dashboard</h1>
          <p className="text-sm text-slate-500">Upravljajte zahtevima i vašom ponudom.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
          <button 
            onClick={() => setVendorTab('requests')}
            className={`px-4 py-2 text-sm font-bold rounded-md whitespace-nowrap transition ${vendorTab === 'requests' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Moji poslovi
          </button>
          <button 
            onClick={() => setVendorTab('quick_jobs')}
            className={`px-4 py-2 text-sm font-bold rounded-md whitespace-nowrap transition ${vendorTab === 'quick_jobs' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Oglasna tabla (Brzi poslovi)
          </button>
          <button 
            onClick={() => setVendorTab('new')}
            className={`px-4 py-2 text-sm font-bold rounded-md whitespace-nowrap transition ${vendorTab === 'new' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Nova ponuda
          </button>
        </div>
      </div>

      {vendorTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 mb-4">Pristigli zahtevi i Aktivni poslovi</h2>
          {bookings.map(req => {
            const status = jobStatuses[req.id] || req.status || 'pending';
            return (
              <div key={req.id} className={`bg-white border ${status !== 'pending' ? 'border-emerald-200 bg-emerald-50/30' : 'border-indigo-200'} shadow-sm rounded-xl p-5 flex flex-col gap-4 transition-colors`}>
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">ID: {req.id}</span>
                      {status === 'pending' && (
                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                          <Clock size={12} />
                          Novi zahtev
                        </span>
                      )}
                      {status === 'in_progress' && (
                        <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Play size={12} fill="currentColor" />
                          U toku / Radovi aktivni
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          <CheckCircle2 size={12} />
                          Završeno - Čeka se klijent
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{req.listings?.title_sr || 'Oglas'}</h3>
                    <div className="text-sm text-slate-500 mt-1">
                      Naručilac: {status === 'pending' ? `Klijent #${req.client_id.substring(0,5).toUpperCase()}` : (req.profiles?.full_name || 'Klijent')}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      Količina: {req.quantity || 1} • Iznos: {(req.quantity || 1) * (req.listings?.base_price || 0)} RSD
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {status !== 'pending' ? (
                      <div className="bg-white border border-emerald-200 p-4 rounded-lg shadow-sm">
                        <div className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1"><CheckCircle2 size={14} /> Kontakti Otključani</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateStatus(req.id, 'cancelled')} className="px-4 py-2 font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm">Odbij</button>
                        <button 
                          onClick={() => updateStatus(req.id, 'confirmed')}
                          className="px-4 py-2 font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 text-sm"
                        >
                          Potvrdi i Otključaj
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Double Check-in/Check-out controls */}
                {status !== 'pending' && status !== 'cancelled' && (
                  <div className="border-t border-emerald-100 pt-4 mt-2 flex flex-wrap gap-3">
                    {status === 'confirmed' && (
                      <button 
                        onClick={() => updateStatus(req.id, 'in_progress')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition text-sm"
                      >
                        <Play size={16} fill="currentColor" /> Započni rad (Check-in)
                      </button>
                    )}
                    {status === 'in_progress' && (
                      <button 
                        onClick={async () => {
                          const confirmEnd = window.confirm(`Da li ste sigurni da želite da završite ovaj rad?`);
                          
                          if (confirmEnd) {
                            await updateStatus(req.id, 'completed');
                            // Refresh bookings
                            const { data } = await supabase.from('bookings').select('*, listings(title_sr, base_price), profiles!client_id(full_name)').eq('vendor_id', user!.id).order('created_at', { ascending: false });
                            if (data) setBookings(data);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition text-sm shadow-md"
                      >
                        <Square size={16} fill="currentColor" /> Završi rad (Check-out)
                      </button>
                    )}
                    {status === 'completed' && (
                      <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-2 w-full">
                        <CheckCircle2 size={16} />
                        Poslata notifikacija klijentu za potvrdu prijema radova.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {bookings.length === 0 && myQuickJobs.length === 0 && (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
              <p className="text-slate-500">Nemate pristiglih zahteva ni brzih poslova.</p>
            </div>
          )}

          {myQuickJobs.length > 0 && (
            <>
              <h2 className="font-bold text-slate-800 mb-4 mt-8">Preuzeti brzi poslovi</h2>
              {myQuickJobs.map(job => (
                <div key={job.id} className="bg-white border border-indigo-200 shadow-sm rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{job.city} • {job.job_date ? format(new Date(job.job_date), 'dd.MM.yyyy') : 'Nije navedeno'}</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                      {job.price ? `${job.price} €` : 'Dogovor'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {job.description}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                    <CheckCircle2 size={14} /> Posao je preuzet
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {vendorTab === 'quick_jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Oglasna tabla - Brzi poslovi</h2>
            <button onClick={fetchQuickJobs} className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1">
              Osveži
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-4">Poslovi koje su klijenti direktno oglasili. Ko prvi prihvati, dobija posao.</p>
          
          {quickJobs.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
              <p className="text-slate-500">Trenutno nema otvorenih brzih poslova.</p>
            </div>
          ) : (
            quickJobs.map(job => (
              <div key={job.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col gap-4 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{job.city} • {job.job_date ? format(new Date(job.job_date), 'dd.MM.yyyy') : 'Nije navedeno'}</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                    {job.price ? `${job.price} €` : 'Dogovor'}
                  </div>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {job.description}
                </div>
                <button 
                  onClick={() => acceptQuickJob(job.id)}
                  className="mt-2 w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                  Prihvati posao
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {vendorTab === 'new' && <SupplyFlowView />}
    </div>
  );
}

function SupplyFlowView() {
  const { user, profile } = useContext(AppContext);
  const [isInstant, setIsInstant] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Beograd');
  const [radius, setRadius] = useState('Srednji radijus (do 50km)');
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState(25);
  const [priceUnit, setPriceUnit] = useState('/h');
  
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [availabilityRange, setAvailabilityRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Load categories from database
  const [categories, setCategories] = useState<{id: string, name_sr: string, pillar: string}[]>([]);
  
  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(data);
        const uniquePillars = Array.from(new Set(data.map(c => c.pillar)));
        if (uniquePillars.length > 0) {
          setSelectedPillar(uniquePillars[0]);
          const firstPillarSubs = data.filter(c => c.pillar === uniquePillars[0]);
          if (firstPillarSubs.length > 0) {
            setSubCategory(firstPillarSubs[0].id);
          }
        }
      }
    });
  }, []);

  const getUnitsForCategory = (cat: string) => {
    switch(cat) {
      case 'Građevinska mehanizacija': return ['/h', '/dan'];
      case 'Transport i teretna logistika': return ['/tura', '/km'];
      case 'Majstori i terenska radna snaga': return ['/h', '/dan', '/m²'];
      case 'Poljoprivredna mehanizacija': return ['/h', '/dan', '/ha'];
      case 'Komunalne i specijalne usluge': return ['/m³', '/tura'];
      default: return ['/h', '/dan', '/tura'];
    }
  };

  const availableUnits = getUnitsForCategory(selectedPillar);

  // If selected unit is not in available units, switch it
  useEffect(() => {
    if (!availableUnits.includes(priceUnit)) {
      setPriceUnit(availableUnits[0]);
    }
  }, [selectedPillar, availableUnits, priceUnit]);

  // Handle file selection (append up to 6 images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => {
        const combined = [...prev, ...newFiles].slice(0, 6);
        const urls = combined.map(file => URL.createObjectURL(file));
        setImageUrls(urls);
        return combined;
      });
    }
  };

  const handleSubmit = async () => {
    setSubmitStatus('loading');
    
    try {
      // 1. Fetch current authenticad user dynamically
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Supabase Error:', authError);
        alert(authError.message);
        setSubmitStatus('error');
        return;
      }
      
      if (!authUser) {
        alert("Morate biti prijavljeni.");
        setSubmitStatus('idle');
        return;
      }

      if (!title) {
        alert("Unesite naslov ponude.");
        setSubmitStatus('idle');
        return;
      }
      
      if (!subCategory) {
        alert("Izaberite specifičnu uslugu/kategoriju.");
        setSubmitStatus('idle');
        return;
      }
      
      let uploadedImageUrls: string[] = [];
      
      // Upload images using Promise.all
      if (images.length > 0) {
        setUploading(true);
        const uploadPromises = images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${authUser.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Supabase Error:', uploadError);
            throw uploadError;
          }
          
          const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
          return data.publicUrl;
        });
        
        uploadedImageUrls = await Promise.all(uploadPromises);
        setUploading(false);
      }

      const mapPricingUnit = (unit: string) => {
        switch(unit) {
          case '/h': return 'hour';
          case '/dan': return 'day';
          case '/m²': return 'sqm';
          case '/tura':
          case '/km': return 'trip';
          default: return 'fixed';
        }
      };

      const newListing = {
        user_id: authUser.id,
        category_id: subCategory, // subCategory is now the UUID
        title_sr: title,
        description: description,
        base_city: city,
        base_price: price,
        pricing_unit: mapPricingUnit(priceUnit),
        is_instant_available: isInstant,
        is_active: true,
        images: uploadedImageUrls
      };

      const { data: insertedListing, error } = await supabase.from('listings').insert([newListing]).select().single();
      
      if (error) {
        console.error('Supabase Error:', error);
        alert(error.message);
        setSubmitStatus('error');
        return;
      }
      
      // Handle availability dates if set
      if (availabilityRange?.from && availabilityRange?.to) {
        const { error: slotError } = await supabase.from('availability_slots').insert([{
          listing_id: insertedListing.id,
          start_time: availabilityRange.from.toISOString(),
          end_time: availabilityRange.to.toISOString()
        }]);
        if (slotError) {
          console.error('Supabase Error:', slotError);
          alert("Greška pri unosu dostupnosti: " + slotError.message);
        }
      }
      
      setSubmitStatus('success');
      // Reset form
      setTitle('');
      setDescription('');
      setImages([]);
      setImageUrls([]);
    } catch (err: any) {
      console.error('Supabase Error:', err);
      alert(err.message || "Došlo je do greške");
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-slate-900">Kreiraj novu ponudu</h1>
        <p className="text-sm text-slate-500">Jednostavan proces dodavanja resursa na mrežu.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-bold text-slate-800">Osnovne informacije</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Naslov ponude</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Npr. Keramičarski radovi" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Opis ponude / Dodatne napomene</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Unesite detaljan opis usluge, šta je uključeno, i eventualne napomene..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium h-32 resize-y" />
            </div>
          </div>
        </div>

        {/* Step 1: Entity Type */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
            <h2 className="font-bold text-slate-800">Tip naloga i subjekta</h2>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-[10px] text-orange-800 font-medium mb-3">
            <span className="font-bold">Napomena:</span> Pravni podaci su zaključani na osnovu vašeg verifikovanog profila.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                <span>Naziv / Ime</span>
                <span className="text-slate-400 font-normal">Zaključano</span>
              </label>
              <input type="text" value={profile?.full_name || ''} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-sm outline-none text-slate-500 font-medium cursor-not-allowed" />
            </div>
            {profile?.entity_type === 'firma' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                  <span>PIB</span>
                  <span className="text-slate-400 font-normal">Zaključano</span>
                </label>
                <input type="text" value={profile?.pib || ''} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-sm outline-none text-slate-500 font-medium cursor-not-allowed" />
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
            <h2 className="font-bold text-slate-800">Lokacija i doseg</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Baza (Grad)</label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                <MapPin size={16} className="text-slate-400" />
                <select value={city} onChange={e => setCity(e.target.value)} className="bg-transparent outline-none flex-1 font-medium text-slate-700 w-full">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Radijus delovanja (km)</label>
              <select value={radius} onChange={e => setRadius(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 font-medium">
                <option>Samo lokalno (do 20km)</option>
                <option>Srednji radijus (do 50km)</option>
                <option>Nacionalno (cela država)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Category */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</div>
            <h2 className="font-bold text-slate-800">Grana i Podkategorija</h2>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Glavni stub delatnosti</label>
            <select 
              value={selectedPillar} 
              onChange={(e) => {
                const newPillar = e.target.value;
                setSelectedPillar(newPillar);
                const pillarSubs = categories.filter(c => c.pillar === newPillar);
                if (pillarSubs.length > 0) {
                  setSubCategory(pillarSubs[0].id);
                } else {
                  setSubCategory('');
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
            >
              {Array.from(new Set(categories.map(c => c.pillar))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Specifična usluga / mašina</label>
            <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium">
              {categories.filter(c => c.pillar === selectedPillar).map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name_sr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 4: Pricing */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">4</div>
            <h2 className="font-bold text-slate-800">Cenovnik</h2>
          </div>
          <div className="flex gap-4 items-center mb-6">
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none text-slate-900 font-bold text-center" />
            <span className="font-bold text-slate-400">EUR</span>
            <span className="text-slate-300">/</span>
            <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none text-slate-700 font-medium flex-1">
              {availableUnits.map(unit => (
                <option key={unit} value={unit}>Po {unit.replace('/', '')} ({unit})</option>
              ))}
            </select>
          </div>

          <div className="mt-3 text-[10px] text-slate-500 bg-slate-50 p-2 rounded flex items-start gap-2">
            <div className="mt-0.5"><CheckCircle2 size={12} className="text-emerald-500" /></div>
            <p>Napomena o monetizaciji: Platforma General će automatski zadržati <b>2%</b> (Administrativni trošak posredovanja) od iznosa koji ugovorite, prilikom isplate.</p>
          </div>
        </div>

        {/* Step 5: Images */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">5</div>
            <h2 className="font-bold text-slate-800">Galerija slika radova / opreme</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Dodajte do 6 fotografija vaše mehanizacije ili dosadašnjih radova (prva slika će biti naslovna).</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <label className="aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition relative overflow-hidden">
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              <PlusCircle size={20} className="text-slate-400 mb-1" />
              <span className="text-[9px] font-bold text-slate-500 uppercase">Dodaj</span>
            </label>
            {imageUrls.map((url, i) => (
              <div key={i} className="aspect-square bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {[...Array(Math.max(0, 5 - imageUrls.length))].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-slate-300 font-bold">{imageUrls.length + i + 2}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 6: Availability */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">6</div>
            <h2 className="font-bold text-slate-800">Status radne dostupnosti</h2>
          </div>
          
          <div className="grid gap-4">
            {/* Toggle Instant */}
            <div 
              onClick={() => setIsInstant(!isInstant)}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                isInstant ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap size={20} className={isInstant ? 'text-emerald-500' : 'text-slate-400'} fill={isInstant ? 'currentColor' : 'none'} />
                <div>
                  <div className={`font-bold text-sm ${isInstant ? 'text-emerald-700' : 'text-slate-700'}`}>Dostupan odmah (Hitne intervencije)</div>
                  <div className="text-[10px] text-slate-500">Status vas postavlja na live mapu sa zelenom bojom za hitne poslove.</div>
                </div>
              </div>
              {isInstant ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">ILI ZAKAŽI TERMIN</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Calendar */}
            <div className={`p-4 rounded-lg border flex flex-col gap-4 ${!isInstant ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 opacity-50 pointer-events-none'}`}>
              <div className="flex items-center gap-4">
                <CalendarDays size={24} className="text-indigo-500" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-700 mb-1">Dodaj u kalendar</div>
                  <div className="text-xs text-slate-500">Definišite slobodne datume i radno vreme unapred.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 outline-none cursor-pointer text-slate-700 whitespace-nowrap shadow-sm transition-all" 
                >
                  {availabilityRange?.from 
                    ? (availabilityRange.to 
                        ? `${format(availabilityRange.from, 'dd.MM.yyyy')} - ${format(availabilityRange.to, 'dd.MM.yyyy')}`
                        : `${format(availabilityRange.from, 'dd.MM.yyyy')}`)
                    : "Izaberi period"
                  }
                </button>
              </div>
              {showCalendar && (
                <div className="bg-white border border-slate-200 rounded-lg p-2 self-center mt-1 shadow-sm">
                  <DayPicker
                    mode="range"
                    selected={availabilityRange}
                    onSelect={setAvailabilityRange}
                    locale={srLatn}
                    className="text-sm font-medium text-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={submitStatus === 'loading' || submitStatus === 'success'}
          className={`w-full text-white font-bold text-sm py-4 rounded-xl shadow-md transition-colors ${submitStatus === 'loading' ? 'bg-slate-500' : submitStatus === 'success' ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`}
        >
          {submitStatus === 'loading' ? 'Čuvanje...' : submitStatus === 'success' ? 'Uspešno objavljeno!' : 'Objavi ponudu'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. DEMAND FLOW (Naručilac - Pretraga i Mapa)
// ---------------------------------------------------------------------------
function DemandFlowView() {
  const { hasPaymentMethod, setHasPaymentMethod } = useContext(AppContext);
  const [demandTab, setDemandTab] = useState<'search' | 'bookings' | 'post_quick_job'>('search');
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success'>('idle');
  const [showPdf, setShowPdf] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [clientJobStatus, setClientJobStatus] = useState<'confirmed' | 'in_progress' | 'completed' | 'done'>('completed'); // mock status for demo
  
  // Real listings
  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [categories, setCategories] = useState<{id: string, name_sr: string, pillar: string}[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isInstantFilter, setIsInstantFilter] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showGallery, setShowGallery] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Date calculation
  const [bookingRange, setBookingRange] = useState<DateRange | undefined>();
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const { user } = useContext(AppContext);

  // Quick job form state
  const [qjTitle, setQjTitle] = useState('');
  const [qjDescription, setQjDescription] = useState('');
  const [qjCity, setQjCity] = useState('Beograd');
  const [qjPrice, setQjPrice] = useState('');
  const [qjDate, setQjDate] = useState<Date | undefined>();
  const [qjSubmitting, setQjSubmitting] = useState(false);

  const handlePostQuickJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Morate biti prijavljeni da biste postavili oglas.");
      return;
    }
    setQjSubmitting(true);
    try {
      const newJob = {
        client_id: user.id,
        title: qjTitle,
        description: qjDescription,
        city: qjCity,
        price: qjPrice ? parseFloat(qjPrice) : null,
        job_date: qjDate ? qjDate.toISOString() : null,
        status: 'open'
      };

      const { error } = await supabase.from('quick_jobs').insert([newJob]);
      if (error) throw error;
      
      alert("Uspešno ste oglasili brzi posao!");
      setQjTitle('');
      setQjDescription('');
      setQjPrice('');
      setQjDate(undefined);
      setDemandTab('search');
    } catch (err: any) {
      console.error('Supabase error:', err);
      alert("Greška: " + err.message);
    } finally {
      setQjSubmitting(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookings')
      .select('*, listings(title_sr, base_price, pricing_unit, profiles!user_id(full_name, id))')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setMyBookings(data);
    }
  };

  useEffect(() => {
    if (demandTab === 'bookings') {
      fetchMyBookings();
    }
  }, [demandTab, user]);

  const fetchListings = async () => {
    setLoadingListings(true);
    let query = supabase.from('listings').select('*, profiles!user_id(full_name), categories!inner(name_sr, pillar)').eq('is_active', true);
    
    if (selectedCity) {
      query = query.eq('base_city', selectedCity);
    }
    
    if (selectedSubCategory) {
      query = query.eq('categories.name_sr', selectedSubCategory);
    } else if (selectedCategory) {
      query = query.eq('categories.pillar', selectedCategory);
    }
    
    if (isInstantFilter) {
      query = query.eq('is_instant_available', true);
    }
    
    const { data, error } = await query;
    if (data) {
      // Helper to reverse map
      const reverseMapPricingUnit = (unit: string) => {
        switch(unit) {
          case 'hour': return '/h';
          case 'day': return '/dan';
          case 'sqm': return '/m²';
          case 'trip': return '/tura';
          case 'fixed': return 'fiksno';
          default: return unit;
        }
      };

      // Map to keep backwards compatibility with the UI expecting vendor name and old keys
      const mappedData = data.map(item => ({
        ...item,
        title: item.title_sr,
        city: item.base_city,
        price: item.base_price,
        price_unit: reverseMapPricingUnit(item.pricing_unit),
        provider_id: item.user_id,
        vendor: `Izvođač #${item.user_id.substring(0, 5).toUpperCase()}`
      }));
      setListings(mappedData);
    }
    setLoadingListings(false);
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedSubCategory, selectedCity, isInstantFilter]);

  const [availabilitySlots, setAvailabilitySlots] = useState<{start_time: string, end_time: string}[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<{start_time: string, end_time: string}[]>([]);

  useEffect(() => {
    if (selectedListing) {
      setQuantity(1);
      setShowGallery(false);
      setBookingRange(undefined);
      setShowBookingCalendar(false);
      
      // Fetch availability
      supabase.from('availability_slots')
        .select('start_time, end_time')
        .eq('listing_id', selectedListing.id)
        .then(({ data }) => setAvailabilitySlots(data || []));
        
      // Fetch confirmed bookings
      supabase.from('bookings')
        .select('start_time, end_time')
        .eq('listing_id', selectedListing.id)
        .in('status', ['confirmed', 'in_progress'])
        .then(({ data }) => setConfirmedBookings(data || []));
    }
  }, [selectedListing]);

  // Recalculate quantity based on dates if unit is /dan
  useEffect(() => {
    if (selectedListing?.price_unit === '/dan' && bookingRange?.from && bookingRange?.to) {
      const start = bookingRange.from;
      const end = bookingRange.to;
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setQuantity(Math.max(1, diffDays));
      }
    }
  }, [bookingRange, selectedListing]);

  const filteredListings = listings;
  
  const isDateDisabled = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);
    
    // Check if within availability slots
    let isWithinAvailability = false;
    
    // If instant available and no slots, assume all dates are available
    if (availabilitySlots.length === 0) {
      isWithinAvailability = true; 
    } else {
      for (const slot of availabilitySlots) {
        const start = new Date(slot.start_time);
        start.setHours(0,0,0,0);
        const end = new Date(slot.end_time);
        end.setHours(23,59,59,999);
        
        if (checkDate >= start && checkDate <= end) {
          isWithinAvailability = true;
          break;
        }
      }
    }
    
    if (!isWithinAvailability) return true; // Disabled because not available
    
    // Check if overlaps with confirmed bookings
    for (const booking of confirmedBookings) {
      const bStart = new Date(booking.start_time);
      bStart.setHours(0,0,0,0);
      const bEnd = new Date(booking.end_time);
      bEnd.setHours(23,59,59,999);
      
      if (checkDate >= bStart && checkDate <= bEnd) {
        return true; // Disabled because booked
      }
    }
    
    // Disable past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    if (checkDate < today) return true;
    
    return false;
  };
  
  const handleBook = async () => {
    if (!hasPaymentMethod) {
      setShowPaymentModal(true);
      return;
    }
    
    setIsBooking(true);
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Supabase Error:', authError);
        alert(authError.message);
        setIsBooking(false);
        return;
      }
      
      if (!authUser) {
        alert("Prijavite se za rezervaciju.");
        setIsBooking(false);
        return;
      }

      const totalPrice = selectedListing.price * quantity;
      
      const newBooking = {
        listing_id: selectedListing.id,
        client_id: authUser.id,
        vendor_id: selectedListing.provider_id, // Note: provider_id in selectedListing is mapped to item.user_id during fetchListings
        start_time: bookingRange?.from ? bookingRange.from.toISOString() : new Date().toISOString(),
        end_time: bookingRange?.to ? bookingRange.to.toISOString() : new Date().toISOString(),
        quantity: quantity,
        status: 'pending'
      };
      
      const { error } = await supabase.from('bookings').insert([newBooking]);
      
      if (error) {
        console.error('Supabase Error:', error);
        alert(error.message);
        setIsBooking(false);
        return;
      }
      
      setBookingStatus('success');
      alert("Vaš zahtev je uspešno poslat izvođaču!");
      setTimeout(() => setBookingStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Supabase Error:', err);
      alert(err.message || "Greška pri rezervaciji.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="h-auto flex flex-col gap-4 relative">
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
        <button 
          onClick={() => setDemandTab('search')}
          className={`px-4 py-2 text-sm font-bold rounded-md whitespace-nowrap transition ${demandTab === 'search' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pretraga
        </button>
        <button 
          onClick={() => setDemandTab('post_quick_job')}
          className={`px-4 py-2 text-sm font-bold rounded-md whitespace-nowrap transition ${demandTab === 'post_quick_job' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Tražim radnika (Brzi posao)
        </button>
        <button 
          onClick={() => setDemandTab('bookings')}
          className={`px-4 py-2 text-sm font-bold rounded-md whitespace-nowrap transition ${demandTab === 'bookings' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Moje rezervacije
        </button>
      </div>

      {demandTab === 'search' && (
        <div className="space-y-4">
          {/* Top Filters */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Delatnost</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              >
                <option value="">Sve delatnosti</option>
                {Array.from(new Set(categories.map(c => c.pillar))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Podkategorija</label>
              <select 
                value={selectedSubCategory} 
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={!selectedCategory}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 disabled:opacity-50"
              >
                <option value="">Sve podkategorije</option>
                {selectedCategory && categories.filter(c => c.pillar === selectedCategory).map(sub => (
                  <option key={sub.id} value={sub.name_sr}>{sub.name_sr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Grad</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              >
                <option value="">Svi gradovi</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm hover:bg-slate-100 transition">
                <input 
                  type="checkbox" 
                  checked={isInstantFilter}
                  onChange={(e) => setIsInstantFilter(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span className="font-bold text-slate-700">Dostupno odmah</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-slate-800">Pronađeno: {filteredListings.length} oglasa</span>
          </div>

          {/* Grid Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {filteredListings.map(listing => (
              <div 
                key={listing.id}
                onClick={() => setSelectedListing(listing)}
                className={`bg-white border shadow-sm rounded-xl flex flex-col cursor-pointer transition-all hover:shadow-md overflow-hidden ${selectedListing?.id === listing.id ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'}`}
              >
                {listing.images && listing.images.length > 0 && (
                  <div className="h-40 w-full bg-slate-100 overflow-hidden">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                )}
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{listing.title}</h3>
                      <div className="text-xs text-slate-500 mt-1 font-medium">{listing.vendor}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5">
                        <Star size={12} className="text-amber-400" fill="currentColor" /> 
                        <span className="font-bold text-slate-700">{listing.rating}</span> 
                        ({listing.reviews_count} recenzija)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600 text-lg">{listing.price} €</div>
                      <div className="text-[10px] text-slate-500">{listing.price_unit}</div>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin size={14} className="text-slate-400" /> {listing.city}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{listing.categories?.name_sr}</span>
                      {listing.is_instant_available && (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                          <Zap size={10} fill="currentColor" /> Odmah
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 font-medium">Nema rezultata za izabrane filtere.</p>
              <button 
                onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setSelectedCity(''); setIsInstantFilter(false); }}
                className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
              >
                Poništi filtere
              </button>
            </div>
          )}

          {/* Booking Modal / Action Area */}
          {selectedListing && (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 md:bottom-6 md:right-6 bg-white rounded-xl shadow-2xl border border-indigo-100 overflow-hidden animate-in slide-in-from-bottom-4 z-50">
              <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="font-bold text-sm">Rezervišite: {selectedListing.title}</h3>
                <button onClick={() => setSelectedListing(null)} className="hover:bg-indigo-700 p-1 rounded transition"><X size={16}/></button>
              </div>
              <div className="p-5 space-y-4">
                
                {selectedListing.description && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {selectedListing.description}
                  </div>
                )}
                
                {selectedListing.images && selectedListing.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                    {selectedListing.images.map((img, i) => (
                      <div key={i} className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 snap-start">
                        <img src={img} alt={`${selectedListing.title} - slika ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {selectedListing.price_unit === '/dan' ? (
                  <div className="flex flex-col gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50 relative">
                    <span className="text-xs font-bold text-slate-700">Izaberite period iznajmljivanja:</span>
                    <button 
                      type="button"
                      onClick={() => setShowBookingCalendar(!showBookingCalendar)}
                      className="w-full flex items-center justify-between text-xs font-bold bg-white border border-slate-200 rounded p-2.5 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className={bookingRange?.from ? "text-slate-900" : "text-slate-500"}>
                          {bookingRange?.from 
                            ? (bookingRange.to 
                                ? `${format(bookingRange.from, 'dd.MM.yyyy')} - ${format(bookingRange.to, 'dd.MM.yyyy')}`
                                : `${format(bookingRange.from, 'dd.MM.yyyy')}`)
                            : "Odaberi period"}
                        </span>
                      </div>
                    </button>

                    {showBookingCalendar && (
                      <div className="absolute top-[80px] left-0 z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-2 mt-1 w-full flex justify-center">
                        <DayPicker
                          mode="range"
                          selected={bookingRange}
                          onSelect={setBookingRange}
                          locale={srLatn}
                          disabled={isDateDisabled}
                          className="text-sm font-medium text-slate-700 bg-white"
                        />
                      </div>
                    )}
                    
                    {bookingRange?.from && bookingRange?.to && (
                      <div className="text-xs font-bold text-indigo-700 bg-indigo-50 p-2 rounded mt-1">
                        Obračunat broj dana: {quantity}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <span className="text-xs font-bold text-slate-700">Količina ({selectedListing.price_unit}):</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center font-bold bg-white border border-slate-200 rounded p-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                )}
                
                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Osnovna cena ({selectedListing.price_unit})</span>
                    <span className="font-bold text-slate-900">{selectedListing.price} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Ukupno ({quantity} x {selectedListing.price})</span>
                    <span className="font-bold text-slate-900">{selectedListing.price * quantity} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Administrativna naknada (2%)</span>
                    <span>{(selectedListing.price * quantity * 0.02).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-100">
                    <span className="text-slate-900">Ukupno za autorizaciju</span>
                    <span className="text-indigo-600">{(selectedListing.price * quantity * 1.02).toFixed(2)} €</span>
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg text-xs border border-orange-100 text-orange-800">
                  <span className="font-bold">Plaćanje / Autorizacija kartice:</span> Sredstva će biti <strong>samo rezervisana</strong>. Izvođač ima rok od 1 sat da potvrdi. Ako odbije, sredstva se automatski oslobađaju.
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong className="text-slate-700 block mb-1">Pravila otkazivanja (Cancellation Policy):</strong>
                  <ul className="list-disc pl-3 space-y-0.5">
                    <li>Besplatno do 24h pre početka.</li>
                    <li>Unutar 12h-24h: 20% penala na teret naručioca.</li>
                    <li>Ispod 2h / na licu mesta: 50% penala na teret naručioca.</li>
                  </ul>
                </div>
                
                <button 
                  onClick={handleBook}
                  disabled={isBooking || bookingStatus === 'success'}
                  className={`w-full font-bold py-3 text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 ${isBooking ? 'bg-indigo-400 text-white cursor-wait' : bookingStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {isBooking ? 'Autorizacija u toku...' : bookingStatus === 'success' ? <><CheckCircle2 size={16} /> Upit Poslat</> : 'Autorizuj i Pošalji Upit'}
                </button>
                
                {bookingStatus === 'success' && (
                  <div className="text-center text-[10px] font-bold text-emerald-600 animate-in fade-in">
                    Čekamo potvrdu izvođača (rok 1h).<br/>Bićete obavešteni emailom.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {demandTab === 'bookings' && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800">Moje aktivne rezervacije</h2>
          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">Nemate rezervacija.</p>
            </div>
          ) : (
            myBookings.map(booking => (
              <div key={booking.id} className="bg-white border border-indigo-200 shadow-sm rounded-xl p-5 mb-4">
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">ID: {booking.id.substring(0,8).toUpperCase()}</span>
                      {booking.status === 'pending' && (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">Čeka potvrdu izvođača</span>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">Odobreno - Čeka se početak</span>
                      )}
                      {booking.status === 'in_progress' && (
                        <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Play size={12} fill="currentColor" /> Radovi u toku
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          Izvođač je prijavio završetak
                        </span>
                      )}
                      {booking.status === 'done' && (
                        <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          Završeno i isplaćeno
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{booking.listings?.title_sr}</h3>
                    <div className="text-sm text-slate-500 mt-1">
                      Izvođač: {booking.status === 'pending' ? `Izvođač #${booking.listings?.profiles?.id?.substring(0,5).toUpperCase() || 'XXX'}` : booking.listings?.profiles?.full_name}
                    </div>
                    
                    {booking.status !== 'done' && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700">
                        <strong className="block mb-1">Ukupna cena: {(booking.quantity || 1) * (booking.listings?.base_price || 0)} RSD</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <button 
                      onClick={() => setShowPdf(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 font-bold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm"
                    >
                      <FileDown size={16} /> Radni nalog (PDF)
                    </button>

                    {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                      <button 
                        onClick={() => setShowCancel(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 font-bold bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                      >
                        Otkaži rezervaciju
                      </button>
                    )}

                    {booking.status === 'completed' && (
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] text-orange-600 font-bold bg-orange-50 p-2 rounded border border-orange-100">
                          Sredstva se automatski oslobađaju za 24h ako nema prigovora.
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              const { error } = await supabase.from('bookings').update({ status: 'done' }).eq('id', booking.id);
                              if (error) {
                                console.error('Supabase Error:', error);
                                alert("Greška: " + error.message);
                              } else {
                                fetchMyBookings();
                              }
                            } catch (err: any) {
                              console.error('Supabase Error:', err);
                              alert("Greška: " + err.message);
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm shadow-md"
                        >
                          <CheckCircle2 size={18} /> Potvrdi prijem radova
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {demandTab === 'post_quick_job' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h2 className="font-bold text-slate-800 mb-2">Tražim radnika (Brzi posao)</h2>
          <p className="text-sm text-slate-500 mb-6">Hitno vam je potreban izvođač? Opišite šta vam treba i ko prvi prihvati, dobija posao.</p>
          
          <form onSubmit={handlePostQuickJob} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Šta vam je potrebno?</label>
              <input required type="text" value={qjTitle} onChange={e => setQjTitle(e.target.value)} placeholder="Npr. Hitna popravka cevi" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detaljan opis</label>
              <textarea required value={qjDescription} onChange={e => setQjDescription(e.target.value)} placeholder="Opišite problem ili zahtev detaljno..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 h-24 resize-y" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grad</label>
                <select required value={qjCity} onChange={e => setQjCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fiksni budžet (€) - Opciono</label>
                <input type="number" min="1" value={qjPrice} onChange={e => setQjPrice(e.target.value)} placeholder="Npr. 50" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Za kad vam je potrebno?</label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-center">
                <DayPicker
                  mode="single"
                  selected={qjDate}
                  onSelect={setQjDate}
                  locale={srLatn}
                  disabled={{ before: new Date() }}
                  className="text-sm font-medium text-slate-700 bg-transparent"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={qjSubmitting}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {qjSubmitting ? 'Objavljivanje...' : <><Zap size={18} fill="currentColor" /> Objavi Brzi Posao</>}
            </button>
          </form>
        </div>
      )}

      {/* PDF Modal */}
      {showPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPdf(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} /> Radni Nalog / Predračun</div>
              <button onClick={() => setShowPdf(false)} className="text-slate-400 hover:text-slate-700 p-1"><X size={20} /></button>
            </div>
            
            {/* PDF Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
              <div className="bg-white p-10 min-h-[800px] shadow-sm max-w-[210mm] mx-auto text-sm text-slate-800 space-y-8 font-serif">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
                  <div>
                    <div className="text-2xl font-black tracking-tight text-slate-900 mb-1">GENERAL</div>
                    <div className="text-xs text-slate-500 font-sans uppercase tracking-widest">Platforma za tešku mehanizaciju</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">RADNI NALOG / PREDRAČUN</div>
                    <div className="text-slate-500">Br: GEN-2026-0042</div>
                    <div className="text-slate-500">Datum: 06.09.2026.</div>
                  </div>
                </div>
                
                {/* Info block */}
                <div className="grid grid-cols-2 gap-8 font-sans">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Naručilac:</div>
                    <div className="font-bold">Milan PR</div>
                    <div>PIB: 104556677</div>
                    <div>Lokacija: Novi Beograd</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Izvođač:</div>
                    <div className="font-bold">Marko Marković PR Iskop</div>
                    <div>PIB: 109887766</div>
                    <div>Usluga: Mini bager 3.5t</div>
                  </div>
                </div>

                {/* Table */}
                <div className="font-sans mt-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="py-2">Opis Usluge</th>
                        <th className="py-2">Jedinica</th>
                        <th className="py-2 text-center">Količina</th>
                        <th className="py-2 text-right">Iznos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-3">Angažovanje mašine (Mini bager)</td>
                        <td className="py-3">Smena (8h)</td>
                        <td className="py-3 text-center">1</td>
                        <td className="py-3 text-right">160.00 EUR</td>
                      </tr>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <td className="py-3">Administrativna naknada platforme (2%)</td>
                        <td className="py-3"></td>
                        <td className="py-3 text-center"></td>
                        <td className="py-3 text-right">3.20 EUR</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end font-sans">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Osnovica:</span>
                      <span>160.00 EUR</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>UKUPNO:</span>
                      <span>163.20 EUR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <FileDown size={18} /> Preuzmi PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCancel(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Otkazivanje rezervacije</h3>
            <p className="text-sm text-slate-600 mb-4">Trenutno preostalo vreme do početka radova je <strong>manje od 24h</strong> (18h). Primenjuju se pravila otkazivanja.</p>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Plaćen iznos:</span>
                <span className="font-bold">160.00 EUR</span>
              </div>
              <div className="flex justify-between text-sm text-red-600 mb-2">
                <span>Penali za kasno otkazivanje (20%):</span>
                <span className="font-bold">-32.00 EUR</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-red-200 pt-2 mt-2">
                <span className="text-slate-900">Iznos za povraćaj:</span>
                <span className="text-indigo-600">128.00 EUR</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">Odustani</button>
              <button onClick={() => {setShowCancel(false); setClientJobStatus('done');}} className="flex-1 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Potvrdi Otkazivanje</button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Wall Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center border-b border-slate-100 relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full">
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Wallet size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Potrebni podaci o plaćanju</h2>
              <p className="text-sm text-slate-500 mt-1">
                Za slanje upita i angažovanje resursa morate uneti podatke o plaćanju. Sredstva se samo rezervišu i ne skidaju se dok izvođač ne potvrdi posao.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Broj kartice</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="•••• •••• •••• ••••" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ističe</label>
                    <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CVC</label>
                    <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="•••" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => { setHasPaymentMethod(true); setShowPaymentModal(false); }}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
              >
                Dodaj karticu i Nastavi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/// ---------------------------------------------------------------------------
// 3. ADMIN DASHBOARD
// ---------------------------------------------------------------------------
function AdminDashboard() {
  const { subscriptionEnabled, setSubscriptionEnabled } = useContext(AppContext);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  useEffect(() => {
    // Note: Due to RLS, super_admin should have policies that allow them to read all profiles and listings
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setUsers(data);
    });
    supabase.from('listings').select('*, categories(name_sr)').then(({ data }) => {
      if (data) setListings(data);
    });
    supabase.from('bookings').select('*, profiles!client_id(full_name), listings(title_sr, base_price, profiles!user_id(full_name))').then(({ data }) => {
      if (data) setAllBookings(data);
    });
  }, []);

  const toggleSubscription = async () => {
    const newValue = !subscriptionEnabled;
    const { error } = await supabase.from('system_settings').upsert({ key: 'subscription_enabled', value: newValue ? 'true' : 'false' });
    if (!error) {
      setSubscriptionEnabled(newValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900">Admin Panel (Master)</h1>
          <p className="text-sm text-slate-500">Pregled svih transakcija, sporova i korisnika.</p>
        </div>
        <div className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm">Super Admin</div>
      </div>

      {/* Subscription Master Switch */}
      <div className="bg-white border border-indigo-200 shadow-sm rounded-xl p-5 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <LayoutTemplate size={18} className="text-indigo-600" /> Sistem Mesečne Pretplate
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Aktivirajte obaveznu mesečnu pretplatu (redovno održavanje profila) za sve korisnike (1.000 RSD Pravna Lica / 500 RSD Fizička lica). Novi korisnici dobijaju 14 dana Trial perioda.
          </p>
        </div>
        <div>
          <button
            onClick={toggleSubscription}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${subscriptionEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${subscriptionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            <LayoutTemplate size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500">Ukupno Oglasa</div>
            <div className="text-2xl font-black text-slate-900">1,204</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500">Realizovani Poslovi</div>
            <div className="text-2xl font-black text-slate-900">3,450</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500">Platformska Provizija (4%)</div>
            <div className="text-2xl font-black text-slate-900">€45.2K</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* User Management System */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Upravljanje Korisnicima</h3>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Korisnik</th>
                  <th className="px-4 py-3">Uloga</th>
                  <th className="px-4 py-3 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{u.public_display_name || u.full_name}</div>
                      <div className="text-[10px] text-slate-500">{u.email || u.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-1">
                      <button 
                        onClick={async () => {
                          const msg = window.prompt(`Pošalji obaveštenje korisniku ${u.full_name}:`);
                          if(msg) {
                            try {
                              const { error } = await supabase.from('notifications').insert([{ user_id: u.id, message: msg }]);
                              if (error) {
                                console.error('Supabase Error:', error);
                                alert("Greška: " + error.message);
                              } else {
                                alert(`Obaveštenje poslato: ${msg}`);
                              }
                            } catch (err: any) {
                              console.error('Supabase Error:', err);
                              alert("Greška: " + err.message);
                            }
                          }
                        }}
                        title="Pošalji obaveštenje"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Bell size={16} /></button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Da li ste sigurni da želite da ${u.is_active === false ? 'odblokirate' : 'blokirate'} korisnika ${u.full_name}?`)) {
                            try {
                              const newStatus = u.is_active === false ? true : false;
                              const { error } = await supabase.from('profiles').update({ is_active: newStatus }).eq('id', u.id);
                              if (error) {
                                console.error('Supabase Error:', error);
                                alert("Greška: " + error.message);
                              } else {
                                setUsers(users.map(user => user.id === u.id ? { ...user, is_active: newStatus } : user));
                              }
                            } catch (err: any) {
                              console.error('Supabase Error:', err);
                              alert("Greška: " + err.message);
                            }
                          }
                        }}
                        title={u.is_active === false ? "Odblokiraj" : "Blokiraj"} 
                        className={`p-1.5 rounded ${u.is_active === false ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}><Ban size={16} /></button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Da li ste sigurni da želite da OBRIŠETE korisnika ${u.full_name}? Ovo je nepovratno.`)) {
                            try {
                              const { error } = await supabase.from('profiles').delete().eq('id', u.id);
                              if (error) {
                                console.error('Supabase Error:', error);
                                alert("Greška: " + error.message);
                              } else {
                                setUsers(users.filter(user => user.id !== u.id));
                              }
                            } catch (err: any) {
                              console.error('Supabase Error:', err);
                              alert("Greška: " + err.message);
                            }
                          }
                        }}
                        title="Obriši" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Listings Manager */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <LayoutDashboard size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Pregled Oglasa</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ponuđač / Oglas</th>
                  <th className="px-4 py-3 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{l.title_sr}</div>
                      <div className="text-[10px] text-slate-500">{l.categories?.name_sr || l.category_id}</div>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-1">
                      <button 
                        onClick={async () => {
                          try {
                            const newStatus = !l.is_sponsored;
                            const { error } = await supabase.from('listings').update({ is_sponsored: newStatus }).eq('id', l.id);
                            if (error) {
                              console.error('Supabase Error:', error);
                              alert("Greška: " + error.message);
                            } else {
                              setListings(listings.map(item => item.id === l.id ? { ...item, is_sponsored: newStatus } : item));
                            }
                          } catch (err: any) {
                            console.error('Supabase Error:', err);
                            alert("Greška: " + err.message);
                          }
                        }}
                        title={l.is_sponsored ? "Ukloni sponzorisano" : "Označi kao sponzorisano"}
                        className={`p-1.5 rounded ${l.is_sponsored ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}>
                        <Zap size={16} fill={l.is_sponsored ? "currentColor" : "none"} />
                      </button>
                      <button title="Odobri" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"><CheckCircle2 size={16} /></button>
                      <button title="Deaktiviraj" className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded"><Ban size={16} /></button>
                      <button title="Obriši" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Finansijske Transakcije</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Posao</th>
                  <th className="px-4 py-3">Iznos</th>
                  <th className="px-4 py-3">Naša zarada (4%)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map(job => (
                  <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{job.id}</div>
                      <div className="text-[10px] text-slate-500">{job.profiles?.full_name || 'N/A'} ➔ {job.listings?.profiles?.full_name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{(job.quantity || 1) * (job.listings?.base_price || 0)} RSD</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{((job.quantity || 1) * (job.listings?.base_price || 0)) * 0.04} RSD</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${job.status === 'completed' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. AUTH MODAL
// ---------------------------------------------------------------------------
function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pib, setPib] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [entityType, setEntityType] = useState<'Fizičko lice' | 'Firma'>('Fizičko lice');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const finalEntityType = entityType === 'Firma' ? 'company' : 'individual';
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              public_display_name: fullName,
              phone: phone,
              city: city,
              entity_type: finalEntityType,
              pib: entityType === 'Firma' ? (pib || null) : null
            }
          }
        });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-100 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full">
            <X size={18} />
          </button>
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="font-bold text-white text-2xl">G</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{mode === 'login' ? 'Dobrodošli nazad' : 'Pridruži se B2B mreži'}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'login' ? 'Unesite vaše podatke za prijavu.' : 'Jedan nalog za naručivanje usluga i postavljanje oglasa.'}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
          
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tip korisnika</label>
                <select value={entityType} onChange={e => setEntityType(e.target.value as 'Fizičko lice' | 'Firma')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900">
                  <option value="Fizičko lice">Fizičko lice</option>
                  <option value="Firma">Firma</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{entityType === 'Firma' ? 'Naziv firme' : 'Ime i Prezime'}</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="Unesite naziv" />
              </div>
              {entityType === 'Firma' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIB</label>
                  <input required type="text" value={pib} onChange={e => setPib(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="10xxxxxxx" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Broj telefona</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="+381..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grad</label>
                  <select required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900">
                    <option value="">Izaberi grad</option>
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email adresa</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="vas@email.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lozinka</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="••••••••" minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 mt-2 disabled:opacity-50">
            {loading ? 'Molimo sačekajte...' : (mode === 'login' ? 'Prijavi se' : 'Kreiraj B2B nalog')}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            {mode === 'login' ? 'Nemate nalog?' : 'Već imate nalog?'}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="ml-1 text-indigo-600 font-bold hover:underline"
            >
              {mode === 'login' ? 'Registrujte se' : 'Prijavite se'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------

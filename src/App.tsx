import React, { useState } from 'react';
import { translations } from './translations';
import { User } from './types';
import UserPortal from './components/UserPortal';
import AdminPortal from './components/AdminPortal';
import { Heart, Landmark, Check, AlertCircle, HelpCircle } from 'lucide-react';

type Screen = 'splash' | 'login' | 'register' | 'forgot_password' | 'portal';

export default function App() {
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const [screen, setScreen] = useState<Screen>('splash');
  
  // Auth details
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration form details
  const [regName, setRegName] = useState('');
  const [regCitizen, setRegCitizen] = useState<'Citizen' | 'Non-Citizen' | 'Below 18'>('Citizen');
  const [regNic, setRegNic] = useState('');
  const [regPassport, setRegPassport] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDistrict, setRegDistrict] = useState('Galle');

  // Forgot password simulator
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1 = Enter Email, 2 = Enter OTP, 3 = Reset Password
  const [otpSent, setOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '']);
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');

  const t = translations[lang];

  // LOGIN REQUEST
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setScreen('portal');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER REQUEST
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regName,
          citizenStatus: regCitizen,
          nic: regCitizen === 'Citizen' ? regNic : '',
          passport: regCitizen === 'Non-Citizen' ? regPassport : '',
          address: regAddress,
          mobile: regMobile,
          password: regPassword,
          email: regEmail,
          district: regDistrict
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setScreen('portal');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Failed to reach registration server.');
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD SUBMIT
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 1) {
      if (!forgotEmail) return;
      setOtpSent(true);
      setForgotStep(2);
    } else if (forgotStep === 2) {
      if (forgotOtp.join('').length < 4) return;
      setForgotStep(3);
    } else if (forgotStep === 3) {
      if (!forgotNewPass || forgotNewPass !== forgotConfirmPass) {
        alert("Passwords do not match");
        return;
      }
      alert("Password successfully reset! Returning to Login.");
      setScreen('login');
      setForgotStep(1);
      setOtpSent(false);
      setForgotEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* 1. SPLASH SCREEN LANGUAGE SELECTOR (Page 1) */}
      {screen === 'splash' && (
        <div className="max-w-md mx-auto min-h-screen bg-emerald-900 text-white flex flex-col justify-between p-6 shadow-2xl">
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            
            {/* Round Leaf Circle Logo */}
            <div className="w-24 h-24 rounded-full bg-emerald-800 flex items-center justify-center border-4 border-emerald-500/30 shadow-lg relative animate-pulse">
              <Heart className="w-12 h-12 text-emerald-300 fill-emerald-300" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight leading-none text-emerald-50">One Planet</h1>
              <p className="text-xs text-emerald-200">Reforesting and Protecting Sri Lanka, together.</p>
            </div>

            <div className="w-full max-w-xs space-y-4 pt-4">
              <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">{t.selectLang}</h2>
              
              <div className="space-y-3.5">
                <button 
                  onClick={() => { setLang('en'); setScreen('login'); }}
                  className="w-full bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl border border-emerald-700/50 shadow-sm transition active:scale-95"
                >
                  ENGLISH
                </button>
                <button 
                  onClick={() => { setLang('si'); setScreen('login'); }}
                  className="w-full bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl border border-emerald-700/50 shadow-sm transition active:scale-95 text-lg"
                >
                  සිංහල
                </button>
                <button 
                  onClick={() => { setLang('ta'); setScreen('login'); }}
                  className="w-full bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl border border-emerald-700/50 shadow-sm transition active:scale-95 text-base"
                >
                  தமிழ்
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-emerald-300/60 font-medium">
            © 2026 One Planet Sri Lanka Conservation Initiative.
          </div>
        </div>
      )}

      {/* 2. LOGIN SCREEN (Page 2) */}
      {screen === 'login' && (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col justify-between p-6 shadow-2xl relative">
          <div className="flex-1 flex flex-col justify-center space-y-6">
            
            {/* Logo */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center border-2 border-emerald-600/30 shadow-md mx-auto">
                <Heart className="w-8 h-8 text-emerald-300 fill-emerald-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">One Planet</h2>
              <p className="text-xs text-slate-400">Please authenticate with your mobile to proceed.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-800 p-3 rounded-2xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">{t.mobile}</label>
                <input 
                  type="text" 
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="E.g. 0770444657"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none shadow-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 font-medium">Hint: Admin <strong>0771112223</strong> / User <strong>0770444657</strong></span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-600 block">{t.password}</label>
                  <button type="button" onClick={() => setScreen('forgot_password')} className="text-xs text-emerald-700 font-bold hover:underline">{t.forgotPass}</button>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (Try 'password')"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-2xl text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Authenticating...' : t.login}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              {t.noAccount}{' '}
              <button onClick={() => setScreen('register')} className="text-emerald-700 font-bold hover:underline">{t.createAccount}</button>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-4">
            English • සිංහල • தமிழ்
          </div>
        </div>
      )}

      {/* 3. CREATE ACCOUNT (Page 3) */}
      {screen === 'register' && (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
          <div className="space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center border border-emerald-600/30 shadow-md mx-auto">
                <Heart className="w-6 h-6 text-emerald-300 fill-emerald-300" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Create Protector Account</h2>
              <p className="text-xs text-slate-400">Join the native reforestation ecosystem</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-800 p-3 rounded-2xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{t.fullName}</label>
                <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Kasun Perera" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t.citizenStatus}</label>
                  <select 
                    value={regCitizen} 
                    onChange={(e: any) => setRegCitizen(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5"
                  >
                    <option value="Citizen">Citizen</option>
                    <option value="Non-Citizen">Non-Citizen</option>
                    <option value="Below 18">Below 18</option>
                  </select>
                </div>

                <div className="space-y-1">
                  {regCitizen === 'Citizen' && (
                    <>
                      <label className="font-bold text-slate-600 block">{t.nic}</label>
                      <input type="text" required value={regNic} onChange={(e) => setRegNic(e.target.value)} placeholder="19951234..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
                    </>
                  )}
                  {regCitizen === 'Non-Citizen' && (
                    <>
                      <label className="font-bold text-slate-600 block">{t.passport}</label>
                      <input type="text" required value={regPassport} onChange={(e) => setRegPassport(e.target.value)} placeholder="N12345..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
                    </>
                  )}
                  {regCitizen === 'Below 18' && (
                    <>
                      <label className="font-bold text-slate-400 block">Minor Status</label>
                      <span className="text-[10px] text-slate-400 block pt-2.5 font-semibold">No ID Required</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t.district}</label>
                  <select value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5">
                    <option value="Galle">Galle</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Matara">Matara</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t.address}</label>
                  <input type="text" required value={regAddress} onChange={(e) => setRegAddress(e.target.value)} placeholder="Home Address" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{t.email}</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="kasun@gmail.com" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t.mobile}</label>
                  <input type="text" required value={regMobile} onChange={(e) => setRegMobile(e.target.value)} placeholder="0771234567" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t.password}</label>
                  <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="password" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{t.confirmPass}</label>
                <input type="password" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-2xl shadow-sm transition mt-2"
              >
                {loading ? 'Creating Profile...' : 'Register as Protector'}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button onClick={() => setScreen('login')} className="text-emerald-700 font-bold hover:underline">Login</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FORGOT PASSWORD SCREEN (Page 4) */}
      {screen === 'forgot_password' && (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col justify-center p-6 shadow-2xl">
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center border border-emerald-600/30 shadow-md mx-auto">
                <Heart className="w-6 h-6 text-emerald-300 fill-emerald-300" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Forgot Your Password?</h2>
              <p className="text-xs text-slate-400">Reset your One Planet account securely</p>
            </div>

            {forgotStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Enter Your Email</label>
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="E.g. member@gmail.com" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs" 
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs">
                  Send Verification Code
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-4 text-center">
                <span className="text-xs text-slate-500 block leading-relaxed">
                  Verification OTP code sent to: <br/><strong>{forgotEmail || 'bi*******@gmail.com'}</strong>
                </span>

                {/* 4-digit code box mockup */}
                <div className="flex gap-2.5 justify-center py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      required
                      value={forgotOtp[idx]}
                      onChange={(e) => {
                        const val = e.target.value;
                        const copy = [...forgotOtp];
                        copy[idx] = val;
                        setForgotOtp(copy);
                      }}
                      className="w-12 h-12 text-center text-lg font-bold bg-white border rounded-xl"
                    />
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={() => alert("Verification code re-sent to email!")} 
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Resend OTP Code
                </button>

                <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs mt-2">
                  Verify Code
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={forgotNewPass} 
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="New password" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={forgotConfirmPass} 
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="Confirm new password" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs" 
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs">
                  Submit Password Reset
                </button>
              </div>
            )}

            <div className="text-center">
              <button type="button" onClick={() => { setScreen('login'); setForgotStep(1); }} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                Return to Login
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. MAIN PORTALS VIEW (USER VS ADMIN) */}
      {screen === 'portal' && currentUser && (
        <>
          {currentUser.role === 'Admin' ? (
            <AdminPortal 
              adminUser={currentUser} 
              onLogout={() => { setCurrentUser(null); setScreen('login'); }} 
              lang={lang} 
            />
          ) : (
            <UserPortal 
              user={currentUser} 
              onLogout={() => { setCurrentUser(null); setScreen('login'); }} 
              lang={lang} 
              setLang={setLang} 
              t={t} 
            />
          )}
        </>
      )}

    </div>
  );
}

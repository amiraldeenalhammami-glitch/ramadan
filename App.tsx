
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RAMADAN_DATA_2026, RAMADAN_START_DATE_2026, OrangeHeart, BrandTitle, ENGINEER_LINK, ACADEMY_NAME_AR, ACADEMY_NAME_EN, ACADEMY_LINK } from './constants';
import { Clock, Moon, Sun, Calendar, Star, ChevronDown, ChevronUp, LayoutGrid, Download, X, Volume2, Bell, BellOff, BookOpen, Table as TableIcon, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMethodologyExpanded, setIsMethodologyExpanded] = useState(false);
  const [showInstallOverlay, setShowInstallOverlay] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAppStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isAppStandalone);
    
    // إظهار نافذة التثبيت تلقائياً بعد ثانية واحدة فقط ليكون الأمر فورياً
    if (!isAppStandalone && !sessionStorage.getItem('pwa_prompt_dismissed')) {
      const timer = setTimeout(() => {
        setShowInstallOverlay(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const handleCanInstall = () => {
      if (!isAppStandalone && !sessionStorage.getItem('pwa_prompt_dismissed')) {
        setShowInstallOverlay(true);
      }
    };

    window.addEventListener('pwa-can-install', handleCanInstall);

    if (isIOSDevice && !isAppStandalone && !sessionStorage.getItem('pwa_ios_dismissed')) {
      setTimeout(() => setShowInstallOverlay(true), 3000);
    }

    window.addEventListener('appinstalled', () => {
      setShowInstallOverlay(false);
      setIsStandalone(true);
    });

    return () => {
      clearInterval(timer);
      window.removeEventListener('pwa-can-install', handleCanInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        (window as any).deferredInstallPrompt = null;
        setShowInstallOverlay(false);
      }
    } else if (isIOS) {
      alert("للتثبيت على آيفون:\n1. اضغط على زر 'مشاركة' ⎋ في الأسفل.\n2. اختر 'إضافة إلى الشاشة الرئيسية' ⊕.");
      setShowInstallOverlay(false);
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } else {
      // في حال لم يكن المتصفح جاهزاً بعد، نحاول تحفيز المتصفح
      alert("يرجى الضغط على زر التثبيت الذي سيظهر في شريط العنوان أو القائمة الجانبية.");
      setShowInstallOverlay(false);
    }
  };

  const handleLaterClick = () => {
    setShowInstallOverlay(false);
    if (isIOS) sessionStorage.setItem('pwa_ios_dismissed', 'true');
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  useEffect(() => {
    const now = currentTime;
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
  }, [currentTime]);

  const appStatus = useMemo(() => {
    const now = currentTime;
    const start = RAMADAN_START_DATE_2026;
    const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
    if (now < start) return 'PRE_RAMADAN';
    if (diffDays >= 33) return 'POST_RAMADAN';
    if (diffDays >= 30) return 'EID';
    return 'IN_RAMADAN';
  }, [currentTime]);

  const todayIndex = useMemo(() => {
    const diffTime = currentTime.getTime() - RAMADAN_START_DATE_2026.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [currentTime]);

  const todayData = useMemo(() => {
    if (todayIndex >= 0 && todayIndex < RAMADAN_DATA_2026.length) {
      return RAMADAN_DATA_2026[todayIndex];
    }
    return RAMADAN_DATA_2026[0];
  }, [todayIndex]);

  const parseTimeToDate = (timeStr: string, baseDate: Date) => {
    if (timeStr === "-" || !timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const mainCountdown = useMemo(() => {
    const now = currentTime;
    let target = new Date();
    let label = "";

    const imsakToday = parseTimeToDate(todayData.times.imsak, now);
    const maghribToday = parseTimeToDate(todayData.times.maghrib, now);

    if (imsakToday && now < imsakToday) {
      target = imsakToday;
      label = "المتبقي لموعد الإمساك";
    } else if (maghribToday && now < maghribToday) {
      target = maghribToday;
      label = "المتبقي لموعد الإفطار";
    } else {
      const nextDay = RAMADAN_DATA_2026[todayIndex + 1];
      if (nextDay) {
        const nextImsak = parseTimeToDate(nextDay.times.imsak || nextDay.times.fajr, new Date(now.getTime() + 86400000));
        if (nextImsak) target = nextImsak;
      }
      label = "المتبقي لإمساك الغد";
    }

    const diff = Math.max(0, target.getTime() - now.getTime());
    const totalSec = Math.floor(diff / 1000);
    return {
      h: Math.floor(totalSec / 3600),
      m: Math.floor((totalSec % 3600) / 60),
      s: totalSec % 60,
      label
    };
  }, [currentTime, todayData, todayIndex]);

  const nextPrayerCountdown = useMemo(() => {
    const now = currentTime;
    const prayerKeys = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const labels: any = { 
      imsak: 'موعد الإمساك',
      fajr: 'صلاة الفجر', 
      sunrise: 'شروق الشمس', 
      dhuhr: 'صلاة الظهر', 
      asr: 'صلاة العصر', 
      maghrib: 'صلاة المغرب', 
      isha: 'صلاة العشاء' 
    };

    for (const key of prayerKeys) {
      const pTime = parseTimeToDate(todayData.times[key as keyof typeof todayData.times], now);
      if (pTime && pTime > now) {
        const diff = Math.floor((pTime.getTime() - now.getTime()) / 1000);
        return { 
          label: labels[key], 
          h: Math.floor(diff / 3600), 
          m: Math.floor((diff % 3600) / 60), 
          s: diff % 60,
          rawSec: diff
        };
      }
    }
    return null;
  }, [currentTime, todayData]);

  return (
    <div className="min-h-screen islamic-pattern text-slate-900 pb-24 overflow-x-hidden selection:bg-amber-300 antialiased">
      
      {/* نافذة التثبيت الذكية */}
      {showInstallOverlay && !isStandalone && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border-4 border-[#fcc52c] relative overflow-hidden">
            <button onClick={handleLaterClick} className="absolute top-4 left-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"><X size={20} /></button>
            <div className="p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-[#fcc52c] rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-amber-200">
                <Download size={48} className="animate-bounce text-black" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-amiri text-slate-900">ثبت تطبيق الإمساكية الآن</h3>
                <p className="text-slate-600 font-bold text-base leading-relaxed px-4">
                  {isIOS 
                    ? "تابع المواقيت حتى بدون إنترنت بلمسة واحدة من شاشتك الرئيسية." 
                    : "احصل على وصول فوري بضغطة زر واحدة ليعمل التطبيق كتطبيق أصلي."}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleInstallClick} 
                  className="w-full py-5 bg-slate-900 text-[#fcc52c] rounded-2xl font-black text-2xl shadow-xl hover:bg-black transition-all border-b-4 border-amber-600 active:scale-95"
                >
                  {isIOS ? "عرض طريقة التثبيت" : "تثبيت التطبيق الآن"}
                </button>
                <button 
                  onClick={handleLaterClick}
                  className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  تنزيل لاحقاً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-br from-white via-slate-50 to-[#fcc52c]/30 pt-8 pb-20 px-4 text-center border-b border-black/5 relative overflow-hidden arch-header">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <BrandTitle className="mb-4 transform hover:scale-105 transition-transform" />
          <h1 className="text-xl md:text-3xl font-black font-amiri text-slate-800 leading-tight">
            <a href={ACADEMY_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">
              {ACADEMY_NAME_AR}
            </a>
          </h1>
          <p className="text-base md:text-xl font-bold font-amiri text-slate-600 mt-2">تتمنى لكم إفطاراً شهياً وصياماً مقبولاً</p>
          <a href={ENGINEER_LINK} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 py-1.5 px-5 bg-white/60 backdrop-blur-md rounded-xl border border-amber-400/50 hover:bg-white transition-all shadow-sm">
            <OrangeHeart /><span className="font-bold text-sm md:text-base text-slate-900 font-amiri">م. أمير الدين الحمامي</span><OrangeHeart />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto -mt-10 px-3 md:px-4 space-y-10 relative z-20">
        
        {appStatus !== 'POST_RAMADAN' && (
          <section className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 text-center border-b-[8px] border-[#fcc52c] relative">
            <div className="flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 mb-6 bg-slate-900 py-2.5 px-6 rounded-full text-amber-400 font-black text-sm md:text-xl border border-[#fcc52c] shadow-lg">
                <Clock className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                <span className="font-amiri">{mainCountdown.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-2xl mb-8" dir="ltr">
                <TimeUnit value={mainCountdown.h} label="ساعة" />
                <TimeUnit value={mainCountdown.m} label="دقيقة" />
                <TimeUnit value={mainCountdown.s} label="ثانية" />
              </div>

              {nextPrayerCountdown && (
                <div className="w-full max-w-lg mb-8 p-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 rounded-3xl shadow-lg">
                  <div className="bg-white py-4 px-6 rounded-[1.4rem] flex flex-col items-center gap-2">
                    <span className="text-sm md:text-lg font-black text-slate-500 uppercase flex items-center gap-2 font-amiri">
                      <Zap size={18} className="text-amber-500" />
                      المتبقي لـ {nextPrayerCountdown.label}
                    </span>
                    <div className="flex items-center gap-3 font-mono font-black text-slate-950 text-2xl md:text-4xl" dir="ltr">
                      <span className="bg-slate-100 px-3 py-1 rounded-xl">{nextPrayerCountdown.h.toString().padStart(2, '0')}</span>
                      <span className="text-amber-500">:</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-xl">{nextPrayerCountdown.m.toString().padStart(2, '0')}</span>
                      <span className="text-amber-500">:</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-xl text-amber-600">{nextPrayerCountdown.s.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-8 bg-amber-400/20 rounded-full animate-ping opacity-30"></div>
                  
                  <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center transition-transform duration-700 hover:scale-110 z-10">
                    <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_25px_rgba(252,197,44,0.4)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className="fill-slate-900 stroke-amber-500 stroke-[0.3]" />
                    </svg>
                    <div className="relative flex flex-col items-center justify-center text-center z-20 mt-[-10px]">
                      <Clock className="w-5 h-5 md:w-8 md:h-8 text-amber-400 mb-1 opacity-80" />
                      <div className="text-3xl md:text-5xl font-black text-white font-mono flex items-center justify-center gap-1" dir="ltr">
                        <span>{currentTime.getHours().toString().padStart(2, '0')}</span>
                        <span className="text-amber-500 animate-pulse">:</span>
                        <span>{currentTime.getMinutes().toString().padStart(2, '0')}</span>
                        <span className="text-amber-500/50 text-xl md:text-3xl animate-pulse">:</span>
                        <span className="text-xl md:text-3xl text-amber-400">{currentTime.getSeconds().toString().padStart(2, '0')}</span>
                      </div>
                      <div className="mt-2 py-0.5 px-3 bg-amber-500/20 rounded-full border border-amber-500/30">
                        <span className="text-[10px] md:text-xs text-amber-300 font-bold font-amiri uppercase tracking-widest">الوقت الآن</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="flex items-center gap-2 py-2.5 px-6 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                    <span className="text-sm md:text-xl font-black text-amber-900 font-amiri">
                      {appStatus === 'PRE_RAMADAN' ? "أواخر شعبان 1447 هـ" : todayData.displayDay.includes("عيد") ? todayData.displayDay : `${todayData.displayDay} رمضان 1447 هـ`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 py-2.5 px-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs md:text-base font-bold text-slate-700 font-amiri">
                      {currentTime.toLocaleDateString('ar-SY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {!isStandalone && (
                <button onClick={handleInstallClick} className="mt-8 flex items-center gap-3 bg-slate-900 px-10 py-4 rounded-2xl text-[#fcc52c] hover:bg-black font-black transition-all shadow-xl border-b-4 border-amber-600 transform hover:scale-105">
                  <Download size={24} />
                  <span className="text-lg font-amiri uppercase tracking-widest">ثبت التطبيق على هاتفك</span>
                </button>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-3 lg:grid-cols-7 gap-2 md:gap-4">
          <PrayerCard icon={<Star />} name="الإمساك" time={todayData.times.imsak} isActive={nextPrayerCountdown?.label.includes("الإمساك")} special />
          <PrayerCard icon={<Moon />} name="الفجر" time={todayData.times.fajr} isActive={nextPrayerCountdown?.label.includes("الفجر")} />
          <PrayerCard icon={<Sun />} name="الشروق" time={todayData.times.sunrise} isActive={nextPrayerCountdown?.label.includes("شروق")} />
          <PrayerCard icon={<Sun />} name="الظهر" time={todayData.times.dhuhr} isActive={nextPrayerCountdown?.label.includes("الظهر")} />
          <PrayerCard icon={<Sun />} name="العصر" time={todayData.times.asr} isActive={nextPrayerCountdown?.label.includes("العصر")} />
          <PrayerCard icon={<Moon />} name="المغرب" time={todayData.times.maghrib} isActive={nextPrayerCountdown?.label.includes("المغرب")} highlight />
          <PrayerCard icon={<Moon />} name="العشاء" time={todayData.times.isha} isActive={nextPrayerCountdown?.label.includes("العشاء")} />
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-200">
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full bg-slate-900 px-5 py-5 flex items-center justify-between font-bold text-white hover:bg-black transition-all">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-amber-400" />
              <span className="font-amiri text-base md:text-xl">جدول إمساكية رمضان وعيد الفطر 2026 - دمشق</span>
            </div>
            <div className="bg-white/10 p-1 rounded-full">{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
          </button>
          <div className={`transition-all duration-700 overflow-hidden ${isExpanded ? 'max-h-[8000px]' : 'max-h-0'}`}>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-center border-separate border-spacing-y-1 min-w-[1000px]" dir="rtl">
                <thead className="text-slate-500 font-bold text-sm md:text-lg border-b sticky top-0 bg-white z-10">
                  <tr>
                    <th className="py-4 px-2">رمضان</th>
                    <th className="py-4 px-2">اليوم</th>
                    <th className="py-4 px-2">التاريخ</th>
                    <th className="py-4 px-2">الإمساك</th>
                    <th className="py-4 px-2">الفجر</th>
                    <th className="py-4 px-2">الشروق</th>
                    <th className="py-4 px-2">الظهر</th>
                    <th className="py-4 px-2">العصر</th>
                    <th className="py-4 px-2">المغرب</th>
                    <th className="py-4 px-2">العشاء</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 font-amiri">
                  {RAMADAN_DATA_2026.map((day, idx) => {
                    const isToday = idx === todayIndex;
                    let header = null;
                    if (idx === 0) header = "أوله رحمة - العشر الأوائل";
                    else if (idx === 10) header = "أوسطه مغفرة - العشر الأواسط";
                    else if (idx === 20) header = "آخره عتق من النار - العشر الأواخر";
                    else if (idx === 30) header = "أيام عيد الفطر السعيد - تقبل الله طاعتكم";
                    return (
                      <React.Fragment key={idx}>
                        {header && (
                          <tr>
                            <td colSpan={10} className="py-6 px-4 bg-slate-100/50">
                              <div className="flex items-center justify-center gap-4">
                                <div className="h-px bg-amber-400 flex-grow"></div>
                                <span className="text-amber-900 font-black text-xl md:text-2xl px-4 py-1.5 bg-amber-100 rounded-full border border-amber-300 shadow-sm">{header}</span>
                                <div className="h-px bg-amber-400 flex-grow"></div>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr className={`${isToday ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-white hover:bg-slate-50'} transition-colors`}>
                          <td className="py-4 text-amber-600 font-black text-xl">{day.displayDay}</td>
                          <td className="py-4 font-black">{day.dayName}</td>
                          <td className="py-4 text-slate-500 font-sans text-xs">{day.gregorianDate}</td>
                          <td className="py-4 font-mono font-bold" dir="ltr">{day.times.imsak}</td>
                          <td className="py-4 font-mono font-black text-blue-900 bg-blue-50" dir="ltr">{day.times.fajr}</td>
                          <td className="py-4 font-mono text-slate-400" dir="ltr">{day.times.sunrise}</td>
                          <td className="py-4 font-mono" dir="ltr">{day.times.dhuhr}</td>
                          <td className="py-4 font-mono" dir="ltr">{day.times.asr}</td>
                          <td className="py-4 font-mono font-black text-amber-900 bg-amber-50" dir="ltr">{day.times.maghrib}</td>
                          <td className="py-4 font-mono" dir="ltr">{day.times.isha}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-r-[12px] border-amber-400">
          <button 
            onClick={() => setIsMethodologyExpanded(!isMethodologyExpanded)} 
            className="w-full p-8 md:p-10 flex items-center justify-between text-right hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-900 rounded-3xl shadow-xl text-amber-400 group-hover:rotate-6 transition-transform"><BookOpen size={36} /></div>
              <div>
                <h3 className="text-2xl md:text-4xl font-black font-amiri text-slate-900 leading-tight">طريقة حساب التوقيت والتقويم الهاشمي</h3>
                <p className="text-amber-600 font-bold font-amiri text-sm md:text-lg">دراسة فلكية وإدارية وفق التقويم الهاشمي السوري لعام 2026</p>
              </div>
            </div>
            <div className="bg-slate-100 p-3 rounded-full text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
              {isMethodologyExpanded ? <ChevronUp size={32} /> : <ChevronDown size={32} />}
            </div>
          </button>

          <div className={`transition-all duration-700 overflow-hidden ${isMethodologyExpanded ? 'max-h-[15000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 md:p-12 space-y-12 border-t border-slate-100 bg-slate-50/20">
              <div className="prose prose-slate max-w-none font-amiri text-lg md:text-xl text-slate-950 leading-relaxed space-y-8">
                <p className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-950 font-bold">
                  تعتمد هذه الإمساكية بشكل حصري على <span className="text-amber-700 font-black underline decoration-amber-400">التقويم الهاشمي السوري</span>، وهو المرجع الزمني الأدق والأكثر عراقة في الجمهورية العربية السورية لمدينة دمشق وضواحيها.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border-r-4 border-amber-500 shadow-sm space-y-4">
                    <h4 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">لماذا التقويم الهاشمي؟</h4>
                    <p className="text-slate-900 leading-relaxed">لأنه يراعي الطبيعة الجغرافية والتضاريسية المحيطة بمدينة دمشق، ويستخدم زوايا فلكية دقيقة جداً (بين 19 و 19.5 درجة) تتناسب مع خطوط العرض المحلية.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border-r-4 border-amber-500 shadow-sm space-y-4">
                    <h4 className="text-2xl font-black text-slate-950">دقة حسابات الفجر والعشاء</h4>
                    <p className="text-slate-900 leading-relaxed">في التقويم الهاشمي، يتم حساب الفجر الصادق والعشاء بناءً على غياب الشفق الفلكي الحقيقي، مما يضمن أقصى درجات الحيطة للصيام والصلاة.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="flex items-center gap-3 text-2xl md:text-3xl font-black font-amiri text-slate-950">
                  <TableIcon className="text-amber-500" /> 
                  مقارنة المعايير الحسابية العالمية (زوايا الشمس)
                </h4>
                <div className="overflow-x-auto rounded-3xl border border-slate-400 bg-white shadow-xl">
                  <table className="w-full text-right font-amiri text-lg md:text-xl border-collapse">
                    <thead className="bg-slate-950 text-white">
                      <tr>
                        <th className="p-6 text-right font-black border-l border-slate-700">المؤسسة / المعيار الحسابي</th>
                        <th className="p-6 text-center font-black border-l border-slate-700">زاوية الفجر (Fajr)</th>
                        <th className="p-6 text-center font-black border-l border-slate-700">زاوية العشاء (Isha)</th>
                        <th className="p-6 text-right font-black">ملاحظات الدقة لمدينة دمشق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400">
                      <tr className="bg-amber-100 border-2 border-amber-500">
                        <td className="p-6 font-black text-slate-950 border-l border-slate-300 flex items-center gap-2">
                          <Zap size={20} className="text-amber-600 fill-amber-600" /> التقويم الهاشمي (سوريا)
                        </td>
                        <td className="p-6 text-center font-mono text-slate-950 font-black border-l border-slate-300" dir="ltr">19.0° - 19.5°</td>
                        <td className="p-6 text-center font-mono text-slate-950 font-black border-l border-slate-300">متغيرة (نظام محلي)</td>
                        <td className="p-6 text-slate-950 font-black italic">الأكثر دقة للتضاريس السورية والأنسب شرعاً</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-6 font-bold text-slate-700 border-l border-slate-300">رابطة العالم الإسلامي (MWL)</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">18.0°</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">17.0°</td>
                        <td className="p-6 text-slate-500 text-sm">تستخدم في أوروبا ومعظم الدول العربية</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-6 font-bold text-slate-700 border-l border-slate-300">جامعة أم القرى (مكة المكرمة)</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">18.5°</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300">90 دقيقة بعد المغرب</td>
                        <td className="p-6 text-slate-500 text-sm">المعيار المعتمد في المملكة العربية السعودية</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-6 font-bold text-slate-700 border-l border-slate-300">الهيئة المصرية العامة للمساحة</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">19.5°</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">17.5°</td>
                        <td className="p-6 text-slate-500 text-sm">قريبة جداً من معايير التقويم الهاشمي</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-6 font-bold text-slate-700 border-l border-slate-300">جامعة العلوم الإسلامية (كاراتشي)</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">18.0°</td>
                        <td className="p-6 text-center font-mono text-slate-600 border-l border-slate-300" dir="ltr">18.0°</td>
                        <td className="p-6 text-slate-500 text-sm">شائعة في دول شبه القارة الهندية</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <footer className="text-center space-y-8 pt-16 pb-16 border-t border-black/5 relative overflow-hidden">
          <BrandTitle className="mb-2 scale-90 md:scale-100" />
          <p className="text-slate-950 font-bold text-base md:text-xl px-6 font-amiri max-w-2xl mx-auto">
            أُهديت هذه الإمساكية والتقويم الرمضاني إلى روح والدي المرحوم غسان الحمامي، صدقةً جاريةً وذكرى طيبة له، سائلين الله أن يتقبّلها ويجعلها في ميزان حسناته.
          </p>
          <div className="flex justify-center gap-3">{[...Array(5)].map((_, i) => <OrangeHeart key={i} />)}</div>
          <h2 className="font-amiri text-5xl md:text-8xl font-black text-slate-950 drop-shadow-lg">
            {appStatus === 'EID' ? "عيد مبارك" : appStatus === 'POST_RAMADAN' ? "تقبل الله طاعتكم" : "رمضان مبارك"}
          </h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">© 2026 {ACADEMY_NAME_EN} - All Rights Reserved</p>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t-4 border-[#fcc52c] p-3 flex justify-around items-center md:hidden z-50 rounded-t-[2rem] shadow-2xl" dir="rtl">
        <div className="text-center flex flex-col items-center"><span className="text-[9px] text-slate-400 font-black uppercase">الفجر</span><span className="font-black text-lg font-mono text-slate-950" dir="ltr">{todayData.times.fajr}</span></div>
        <div className="text-center transform -translate-y-5">
          <div className="bg-[#fcc52c] shadow-lg px-5 py-1.5 rounded-xl mb-1 border border-black/5 scale-110">
            <span className="text-[9px] text-slate-950 font-black uppercase">الإفطار</span>
          </div>
          <span className="font-black text-2xl font-mono text-amber-950 block" dir="ltr">{todayData.times.maghrib}</span>
        </div>
        <div className="text-center flex flex-col items-center"><span className="text-[9px] text-slate-400 font-black uppercase">العشاء</span><span className="font-black text-lg font-mono text-slate-950" dir="ltr">{todayData.times.isha}</span></div>
      </nav>
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center group">
    <div className="w-20 h-20 md:w-36 md:h-36 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-[2.5rem] flex flex-col items-center justify-center text-slate-950 shadow-inner border border-white group-hover:border-amber-400 transition-all duration-500">
      <span className="text-3xl md:text-7xl font-black font-mono leading-none tracking-tighter" dir="ltr">{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] md:text-sm mt-1 md:mt-2 text-slate-600 font-black font-amiri tracking-wider">{label}</span>
    </div>
  </div>
);

const PrayerCard: React.FC<{ icon: React.ReactNode; name: string; time: string; isActive?: boolean; highlight?: boolean; special?: boolean; }> = ({ icon, name, time, isActive, highlight, special }) => (
  <div className={`p-2 md:p-8 rounded-xl md:rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 border ${isActive ? 'bg-[#fcc52c] text-slate-950 z-20 border-2 border-black animate-prayer-active shadow-xl scale-110' : 'bg-white shadow-md border-slate-50 hover:shadow-xl hover:scale-105 hover:-translate-y-2'} ${highlight && !isActive ? 'bg-amber-50/50 border-amber-200' : ''} ${special && !isActive ? 'border-amber-400 bg-amber-50/10' : ''} transform relative group cursor-pointer`}>
    <div className={`mb-1 md:mb-5 transition-all ${isActive ? 'text-black' : 'text-amber-500 group-hover:scale-110'}`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 20, className: "md:w-10 md:h-10" })}</div>
    <span className={`text-[10px] md:text-xl font-black mb-0.5 md:mb-1 font-amiri tracking-wide ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{name}</span>
    <span className={`text-[12px] md:text-4xl font-mono font-black tracking-tighter ${isActive ? 'text-black' : 'text-slate-950'}`} dir="ltr">{time}</span>
  </div>
);

export default App;

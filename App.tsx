
import React, { useState, useEffect, useMemo } from 'react';
import { RAMADAN_DATA_2026, RAMADAN_START_DATE_2026, OrangeHeart, BrandTitle, ACADEMY_LINK, ENGINEER_LINK } from './constants';
import { Clock, Moon, Sun, Calendar, Star, ChevronDown, ChevronUp, LayoutGrid, PartyPopper, BookOpen, Info, ShieldCheck, TrendingUp, AlertCircle, FileText, Scale, Landmark, Settings, Download, X, Share } from 'lucide-react';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallOverlay, setShowInstallOverlay] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone) {
        setShowInstallOverlay(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (ios && !standalone) {
      const hasSeenPrompt = localStorage.getItem('hasSeenInstallPrompt');
      if (!hasSeenPrompt) {
        setShowInstallOverlay(true);
      }
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallOverlay(false);
    }
  };

  const closeOverlay = () => {
    setShowInstallOverlay(false);
    localStorage.setItem('hasSeenInstallPrompt', 'true');
  };

  const appStatus = useMemo(() => {
    const now = currentTime;
    const start = RAMADAN_START_DATE_2026;
    const endDay = RAMADAN_DATA_2026[29];
    const [mH, mM] = endDay.times.maghrib.split(':').map(Number);
    const endDate = new Date(2026, 2, 21, mH, mM);

    if (now < start) return 'PRE_RAMADAN';
    if (now > endDate) return 'EID';
    return 'IN_RAMADAN';
  }, [currentTime]);

  const currentRamadanDayIndex = useMemo(() => {
    if (appStatus !== 'IN_RAMADAN') return 0;
    const diffTime = currentTime.getTime() - RAMADAN_START_DATE_2026.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(0, diffDays), 29);
  }, [currentTime, appStatus]);

  const todayRamadanData = RAMADAN_DATA_2026[currentRamadanDayIndex];

  const smartCountdown = useMemo(() => {
    const now = currentTime;
    let targetDate = new Date();
    let label = "";

    if (appStatus === 'PRE_RAMADAN') {
      const firstDay = RAMADAN_DATA_2026[0];
      const [h, m] = firstDay.times.imsak.split(':').map(Number);
      targetDate = new Date(RAMADAN_START_DATE_2026);
      targetDate.setHours(h, m, 0);
      label = "الوقت المتبقي لأول إمساك في رمضان";
    } else if (appStatus === 'IN_RAMADAN') {
      const day = RAMADAN_DATA_2026[currentRamadanDayIndex];
      const [fH, fM] = day.times.fajr.split(':').map(Number);
      const [mH, mM] = day.times.maghrib.split(':').map(Number);

      const fajr = new Date(now); fajr.setHours(fH, fM, 0);
      const maghrib = new Date(now); maghrib.setHours(mH, mM, 0);

      if (now < fajr) {
        targetDate = fajr;
        label = "الوقت المتبقي لبدء الصيام (الفجر)";
      } else if (now < maghrib) {
        targetDate = maghrib;
        label = "الوقت المتبقي لموعد الإفطار";
      } else {
        const nextDay = RAMADAN_DATA_2026[currentRamadanDayIndex + 1];
        if (nextDay) {
          const [nfH, nfM] = nextDay.times.fajr.split(':').map(Number);
          targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + 1);
          targetDate.setHours(nfH, nfM, 0);
          label = "الوقت المتبقي لسحور وفجر يوم غد";
        } else {
          return null;
        }
      }
    } else {
      return null;
    }

    const diff = targetDate.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      label
    };
  }, [currentTime, appStatus, currentRamadanDayIndex]);

  const hijriDateDisplay = useMemo(() => {
    if (appStatus === 'PRE_RAMADAN') return "أواخر شعبان 1447 هـ";
    if (appStatus === 'EID') return "شوال 1447 هـ";
    return `${todayRamadanData.displayDay} رمضان 1447 هـ`;
  }, [appStatus, todayRamadanData]);

  return (
    <div className="min-h-screen islamic-pattern text-slate-900 pb-24 overflow-x-hidden selection:bg-amber-300 antialiased">
      
      {/* نافذة التثبيت الذكية */}
      {showInstallOverlay && !isStandalone && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border-4 border-amber-400 relative">
            <button onClick={closeOverlay} className="absolute top-4 left-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <X size={20} className="text-slate-600" />
            </button>
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg transform rotate-3">
                 <Download size={40} className="text-slate-900 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-amiri text-slate-900">تثبيت تطبيق إمساكية أبعاد</h3>
                <p className="text-slate-600 font-amiri text-lg">ثبّت التطبيق الآن للوصول السريع للمواقيت بدون إنترنت وفي أي وقت.</p>
              </div>
              {isIOS ? (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-right space-y-3">
                  <p className="text-amber-900 font-bold flex items-center gap-2 text-sm"><Share size={16} /> لمستخدمي آيفون:</p>
                  <ol className="text-[13px] text-amber-800 list-decimal list-inside space-y-1 font-bold">
                    <li>اضغط على زر المشاركة في متصفح سفاري.</li>
                    <li>اختر "إضافة إلى الشاشة الرئيسية".</li>
                    <li>اضغط على "إضافة" في الزاوية العلوية.</li>
                  </ol>
                </div>
              ) : (
                <button onClick={handleInstallClick} className="w-full py-4 bg-slate-900 text-amber-400 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">
                  <Download size={24} /> <span>تثبيت الآن</span>
                </button>
              )}
              <button onClick={closeOverlay} className="text-slate-400 font-bold text-sm hover:text-slate-600 underline">سأفعل ذلك لاحقاً</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-br from-white via-slate-50 to-[#fcc52c]/30 pt-8 pb-20 px-4 text-center border-b border-black/5 relative overflow-hidden arch-header">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <BrandTitle className="mb-4 transform hover:scale-105 transition-transform duration-500" />
          <div className="flex flex-col items-center gap-1 mb-4">
            <h1 className="text-xl md:text-3xl font-black font-amiri text-slate-800 leading-tight">
              <a href={ACADEMY_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 transition-colors">أكاديمية أبعاد للهندسة المعمارية</a>
            </h1>
            <p className="text-base md:text-xl font-bold font-amiri text-slate-600 italic">تتمنى لكم إفطاراً شهياً وصياماً مقبولاً</p>
          </div>
          <a href={ENGINEER_LINK} target="_blank" rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2 py-1.5 px-5 bg-white/60 backdrop-blur-md rounded-xl border border-amber-400/50 shadow-sm transition-all hover:bg-white/80 group">
            <OrangeHeart />
            <span className="font-bold text-sm md:text-base text-slate-900 font-amiri group-hover:text-orange-700 tracking-wide">م. أمير الدين الحمامي</span>
            <OrangeHeart />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto -mt-10 px-3 md:px-4 space-y-10 relative z-20">
        
        {/* قسم الحالة والمؤقت والساعة الرقمية */}
        <section className="bg-white/95 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-10 text-center border-b-[8px] border-[#fcc52c] relative overflow-hidden">
          <div className="flex flex-col items-center">
            {appStatus === 'EID' && currentTime.getDate() === 21 && currentTime.getMonth() === 2 ? (
              <div className="py-6 space-y-4">
                <PartyPopper className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                <h2 className="text-3xl md:text-5xl font-black font-amiri text-amber-600">عيد فطر سعيد!</h2>
                <p className="text-lg font-bold text-slate-600 font-amiri">تقبل الله منا ومنكم صالح الأعمال</p>
              </div>
            ) : smartCountdown ? (
              <>
                <div className="inline-flex items-center gap-2 mb-6 bg-slate-900 py-2.5 px-6 rounded-full text-amber-400 font-black text-sm md:text-xl border border-[#fcc52c] shadow-lg">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                  <span className="font-amiri">{smartCountdown.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-2xl">
                  <TimeUnit value={smartCountdown.hours} label="ساعة" />
                  <TimeUnit value={smartCountdown.minutes} label="دقيقة" />
                  <TimeUnit value={smartCountdown.seconds} label="ثانية" />
                </div>
              </>
            ) : null}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {/* الساعة الرقمية المستعادة */}
              <div className="flex items-center gap-2 py-2 px-6 bg-slate-900 rounded-xl border border-amber-500 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-xl md:text-3xl font-black text-white font-mono tracking-tighter">
                  {currentTime.getHours().toString().padStart(2, '0')}
                  <span className="animate-pulse mx-1 text-amber-500">:</span>
                  {currentTime.getMinutes().toString().padStart(2, '0')}
                  <span className="text-xs md:text-lg text-amber-400/70 ml-1">
                    <span className="mx-0.5">:</span>
                    {currentTime.getSeconds().toString().padStart(2, '0')}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 py-2 px-6 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                <span className="text-sm md:text-xl font-black text-amber-900 font-amiri">{hijriDateDisplay}</span>
              </div>
              <div className="flex items-center gap-2 py-2 px-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs md:text-base font-bold text-slate-700 font-amiri">
                  {currentTime.toLocaleDateString('ar-SY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          <PrayerCard icon={<Star />} name="الإمساك" time={todayRamadanData.times.imsak} special isActive={smartCountdown?.label?.includes("الإمساك")} />
          <PrayerCard icon={<Moon />} name="الفجر" time={todayRamadanData.times.fajr} isActive={smartCountdown?.label?.includes("الفجر")} />
          <PrayerCard icon={<Sun />} name="الظهر" time={todayRamadanData.times.dhuhr} />
          <PrayerCard icon={<Sun />} name="العصر" time={todayRamadanData.times.asr} />
          <PrayerCard icon={<Moon />} name="المغرب" time={todayRamadanData.times.maghrib} highlight isActive={smartCountdown?.label?.includes("الإفطار")} />
          <PrayerCard icon={<Moon />} name="العشاء" time={todayRamadanData.times.isha} />
        </div>

        {/* جدول الإمساكية التفصيلي */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border border-slate-200">
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full bg-slate-900 px-5 py-5 flex items-center justify-between font-bold text-white hover:bg-black transition-all">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-amber-400" />
              <span className="font-amiri text-base md:text-xl tracking-wide">جدول إمساكية رمضان 2026 - توقيت دمشق</span>
            </div>
            <div className="bg-white/10 p-1 rounded-full">{isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
          </button>
          
          <div className={`transition-all duration-1000 ease-in-out ${isExpanded ? 'max-h-[15000px]' : 'max-h-0'} overflow-hidden`}>
            <div className="p-0 md:p-4 bg-slate-50/20 overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-y-0.5 table-fixed min-w-[700px]">
                <thead className="text-slate-500 font-bold uppercase text-[9px] md:text-xs tracking-wider border-b">
                  <tr>
                    <th className="py-3 w-[8%]">اليوم</th><th className="py-3 w-[14%]">التاريخ</th><th className="py-3 w-[8%]">رمضان</th>
                    <th className="py-3 w-[10%] bg-slate-100/30">الإمساك</th><th className="py-3 w-[11%] bg-blue-50/30">الفجر</th>
                    <th className="py-3 w-[8%]">الشروق</th><th className="py-3 w-[8%]">الظهر</th><th className="py-3 w-[8%]">العصر</th>
                    <th className="py-3 w-[15%] bg-amber-50/30">المغرب</th><th className="py-3 w-[10%]">العشاء</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {RAMADAN_DATA_2026.map((day, idx) => (
                    <React.Fragment key={idx}>
                      {idx === 0 && <SectionDivider title="أوله رحمة" color="bg-green-600" />}
                      {idx === 10 && <SectionDivider title="وأوسطه مغفرة" color="bg-blue-600" />}
                      {idx === 20 && <SectionDivider title="وآخره عتق من النار" color="bg-red-600" />}
                      <tr className={`${idx === currentRamadanDayIndex && appStatus === 'IN_RAMADAN' ? 'bg-amber-100 ring-2 ring-amber-400 z-10 relative' : 'bg-white hover:bg-slate-50'} transition-all duration-200`}>
                        <td className="py-2.5 md:py-4 font-amiri text-xs md:text-lg font-black border-b border-slate-100">{day.dayName}</td>
                        <td className="py-2.5 md:py-4 text-slate-500 font-sans text-[9px] md:text-xs font-bold border-b border-slate-100">{day.gregorianDate}</td>
                        <td className="py-2.5 md:py-4 text-amber-700 font-black text-base md:text-2xl border-b border-slate-100">{day.displayDay}</td>
                        <td className="py-2.5 md:py-4 font-mono text-slate-400 text-[10px] md:text-sm font-bold border-b border-slate-100">{day.times.imsak}</td>
                        <td className="py-2.5 md:py-4 font-mono text-blue-950 text-xs md:text-xl font-black bg-blue-50/20 border-b border-blue-100">{day.times.fajr}</td>
                        <td className="py-2.5 md:py-4 font-mono text-slate-500 text-[9px] md:text-xs font-bold border-b border-slate-100">{day.times.sunrise}</td>
                        <td className="py-2.5 md:py-4 font-mono text-slate-500 text-[9px] md:text-xs font-bold border-b border-slate-100">{day.times.dhuhr}</td>
                        <td className="py-2.5 md:py-4 font-mono text-slate-500 text-[9px] md:text-xs font-bold border-b border-slate-100">{day.times.asr}</td>
                        <td className="py-2.5 md:py-4 font-mono text-amber-950 text-sm md:text-2xl font-black bg-amber-50/40 border-b border-amber-200">{day.times.maghrib}</td>
                        <td className="py-2.5 md:py-4 font-mono text-slate-500 text-[10px] md:text-base font-bold border-b border-slate-100">{day.times.isha}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* التقرير البحثي والمنهجية الفقهية (كامل ومستعاد) */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border border-slate-200">
          <button onClick={() => setIsMethodologyOpen(!isMethodologyOpen)} className="w-full bg-slate-50 px-5 py-6 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-100 transition-all">
            <div className="flex items-center gap-3 text-right">
              <BookOpen className="w-6 h-6 text-amber-600" />
              <div>
                <span className="block font-amiri text-base md:text-xl font-black">تقرير البحث التخصصي المعمق والمنهجية الفقهية</span>
                <span className="block text-slate-500 text-[9px] md:text-xs opacity-70">دراسة فلكية وإدارية وفق التقويم الهاشمي السوري لعام 2026</span>
              </div>
            </div>
            <div className="p-1.5 rounded-full bg-slate-200">{isMethodologyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
          </button>

          <div className={`transition-all duration-1000 ease-in-out ${isMethodologyOpen ? 'max-h-[15000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="p-5 lg:p-12 space-y-12 bg-white font-amiri text-sm md:text-lg leading-loose text-slate-800">
              
              <div className="bg-amber-50 p-6 md:p-8 rounded-[1.5rem] border border-amber-200 shadow-sm relative overflow-hidden">
                <FileText className="absolute -bottom-10 -left-10 w-40 h-40 text-amber-200 opacity-20" />
                <h2 className="text-xl md:text-2xl font-black text-amber-900 mb-5 flex items-center gap-3 relative z-10"><Star className="w-6 h-6 fill-amber-500 text-amber-500" /> مقدمة التقرير التخصصي</h2>
                <p className="relative z-10 text-justify">تمثل مسألة ضبط المواقيت الزمانية في الشعائر الإسلامية أحد أدق جوانب التقاطع بين علوم الفلك والحساب وبين الفقه المقارن. وفي الجمهورية العربية السورية، استقر العرف المؤسسي والاجتماعي على اعتماد "التقويم الهاشمي" مرجعاً أساسياً نظراً لما يتمتع به من دقة حسابية فائقة وملاءمة جغرافية لإحداثيات المدن السورية، وعلى رأسها دمشق. يهدف هذا التقرير إلى تقديم تحليل شامل وعميق لإمساكية شهر رمضان لعام 1447 هـ (2026 م) مع شرح وافٍ لمنهجية الحساب الرسمية المعتمدة.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 border-r-4 border-amber-500 pr-3"><Landmark className="text-amber-600 w-6 h-6" /> الإطار التاريخي والفلسفي</h3>
                  <p className="text-justify">يعود أصل التقويم الهاشمي إلى مجهودات الدكتور محمد الهاشمي، الذي ابتكر نظاماً يجمع بين الحساب الفلكي الدقيق وبين الرؤية الشرعية. الميزة الأساسية هي اعتماده على "دورة ميتونية" تضبط السنة القمرية وتجعلها في حالة توازن مع الفصول الشمسية على مدار 19 عاماً، مما يضمن ثباتاً زمنياً فريداً للمواقيت.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 border-r-4 border-amber-500 pr-3"><Settings className="text-amber-600 w-6 h-6" /> الميكانيكا الفلكية للحساب</h3>
                  <p className="text-justify">تعتمد الحسابات على إحداثيات دمشق الدقيقة (33.51° شمالاً و36.29° شرقاً). يتم حساب الفجر الصادق بناءً على زاوية انخفاض الشمس تحت الأفق الشرقي (19.0 إلى 19.5 درجة)، وهي المعايير السورية الرسمية التي تضمن بزوغ الضوء المستطير واليقين المطلق في الإمساك عن المفطرات.</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[1.5rem] shadow-2xl space-y-4 relative overflow-hidden">
                <TrendingUp className="absolute -top-10 -right-10 w-40 h-40 text-amber-500/10" />
                <h3 className="text-lg md:text-xl font-black text-amber-400 flex items-center gap-2 relative z-10"><TrendingUp className="w-6 h-6" /> تحليل معطيات هلال رمضان 1447 هـ (2026 م)</h3>
                <p className="text-justify text-slate-300 relative z-10">وفقاً للبيانات المتقاطعة، فإن الاقتران الفلكي لشهر رمضان سيحدث يوم الثلاثاء 17 فبراير 2026 في تمام الساعة 15:02 بتوقيت دمشق. تشير الدراسات إلى استحالة رؤية الهلال مساء الثلاثاء لأن القمر سيغرب قبل الشمس، مما يجعل الأربعاء 18 فبراير المتمم لشهر شعبان، والخميس 19 فبراير الغرة الرسمية لرمضان 2026 في سوريا فلكياً.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 border-r-4 border-amber-500 pr-3"><Scale className="text-amber-600 w-6 h-6" /> المنهجية الفقهية والقانونية</h3>
                  <p className="text-justify">تقود سوريا منهجية مؤسسية صارمة عبر "القاضي الشرعي الأول بدمشق". بموجب المنهج المتبع، فإن الرؤية البصرية تظل هي الأصل الشرعي، لكنها لا تُقبل إذا كانت مستحيلة فلكياً، وهو ما يعكس روح دمج الخبرات العلمية بالمعايير الفقهية لضمان صحة الشعائر ووحدة الصف.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 border-r-4 border-amber-500 pr-3"><ShieldCheck className="text-amber-600 w-6 h-6" /> أهمية الإمساك الاحتياطي</h3>
                  <p className="text-justify">تحديد وقت الإمساك قبل 15 دقيقة من أذان الفجر هو تطبيق لمبدأ "الاحتياط" في العبادة. يتأثر توقيت الفجر بظروف الغلاف الجوي والتلوث الضوئي، والتوقف المبكر يضمن للصائم عدم الوقوع في الشبهة أثناء تناول السحور، وهو إجراء تنظيمي مستقر في دمشق منذ عقود.</p>
                </div>
              </div>

              {/* جدول مقارنة المعايير الحسابية المستعاد بالكامل */}
              <div className="space-y-6">
                 <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-3"><Info className="text-amber-600 w-6 h-6" /> مقارنة المعايير الحسابية العالمية</h3>
                  <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 shadow-md">
                    <table className="w-full text-right border-collapse min-w-[750px]">
                      <thead className="bg-slate-900 text-white font-bold text-[10px] md:text-sm">
                        <tr>
                          <th className="p-4 border-b border-white/10">المؤسسة / المعيار الحسابي</th>
                          <th className="p-4 border-b border-white/10">زاوية الفجر (Dawn)</th>
                          <th className="p-4 border-b border-white/10">زاوية العشاء (Night)</th>
                          <th className="p-4 border-b border-white/10">ملاحظات دقة دمشق</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 font-bold text-[10px] md:text-base">
                        <tr className="bg-amber-50/50">
                          <td className="p-4 border-b font-black text-amber-900">التقويم الهاشمي (سوريا)</td>
                          <td className="p-4 border-b text-amber-950">19.0° - 19.5°</td>
                          <td className="p-4 border-b text-amber-950">متغيرة (نظام الهاشمي)</td>
                          <td className="p-4 border-b text-green-700 font-black">الأكثر دقة للتضاريس السورية</td>
                        </tr>
                        <tr>
                          <td className="p-4 border-b">رابطة العالم الإسلامي (MWL)</td>
                          <td className="p-4 border-b">18.0°</td>
                          <td className="p-4 border-b">17.0°</td>
                          <td className="p-4 border-b text-slate-500 italic">يوجد فارق حوالي 5-8 دقائق</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 border-b">الهيئة المصرية العامة للمساحة</td>
                          <td className="p-4 border-b">19.5°</td>
                          <td className="p-4 border-b">17.5°</td>
                          <td className="p-4 border-b text-slate-500 italic">مقاربة جداً للمعايير الهاشمية</td>
                        </tr>
                        <tr>
                          <td className="p-4 border-b">جامعة أم القرى (مكة المكرمة)</td>
                          <td className="p-4 border-b">18.5°</td>
                          <td className="p-4 border-b">90 دقيقة بعد المغرب</td>
                          <td className="p-4 border-b text-slate-500 italic">فارق زمني واضح في العشاء</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 border-b">اتحاد الإسلامي لأمريكا الشمالية (ISNA)</td>
                          <td className="p-4 border-b">15.0°</td>
                          <td className="p-4 border-b">15.0°</td>
                          <td className="p-4 border-b text-red-600 font-black">غير دقيقة للمنطقة العربية</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
              </div>

              <div className="bg-amber-100 p-6 md:p-8 rounded-[1.5rem] border border-amber-400 shadow-inner space-y-4">
                <h3 className="text-lg md:text-xl font-black text-amber-900 flex items-center gap-3"><ShieldCheck className="text-amber-600 w-8 h-8" /> التوصيات النهائية للصائمين</h3>
                <ul className="space-y-4 text-amber-950 text-sm md:text-lg list-none">
                  <li className="flex gap-3 items-start"><div className="h-6 w-6 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0 text-[10px] md:text-xs shadow-md">1</div> الاعتماد الكلي على التقويم الهاشمي وتجنب التطبيقات العالمية غير المضبوطة يدوياً.</li>
                  <li className="flex gap-3 items-start"><div className="h-6 w-6 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0 text-[10px] md:text-xs shadow-md">2</div> الالتزام بوقت الإمساك الاحتياطي الموضح (15 دقيقة قبل أذان الفجر).</li>
                  <li className="flex gap-3 items-start"><div className="h-6 w-6 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0 text-[10px] md:text-xs shadow-md">3</div> متابعة البيان الرسمي للقاضي الشرعي الأول بدمشق مساء الثلاثاء 17 شباط 2026.</li>
                </ul>
              </div>

              <div className="text-center p-8 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
                 <h3 className="text-xl md:text-3xl font-black text-amber-400 mb-3 font-amiri">خاتمة التقرير</h3>
                 <p className="text-sm md:text-xl opacity-80 leading-relaxed font-amiri">تم إعداد هذا التقرير ليكون مرجعاً علمياً وإيمانياً لكل صائم يبتغي الدقة واليقين، مع أطيب التمنيات من أكاديمية أبعاد للهندسة المعمارية.</p>
              </div>

            </div>
          </div>
        </div>

        <footer className="text-center space-y-8 pt-16 pb-16 border-t border-black/5 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
             <BrandTitle className="mb-2 scale-90 md:scale-100" />
             <p className="text-slate-800 font-bold text-base md:text-xl px-6 font-amiri leading-relaxed max-w-2xl">أُهديت هذه الإمساكية إلى روح والدي المرحوم غسان الحمامي، صدقةً جاريةً وذكرى طيبة له، سائلين الله أن يتقبّلها ويجعلها في ميزان حسناته.</p>
          </div>
          <div className="flex justify-center gap-3 relative z-10">{[...Array(5)].map((_, i) => <OrangeHeart key={i} />)}</div>
          <div className="space-y-2 relative z-10 px-4">
            <h2 className="font-amiri text-5xl md:text-8xl font-black text-slate-950 drop-shadow-lg text-center">رمضان مبارك</h2>
          </div>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t-4 border-[#fcc52c] p-3 flex justify-around items-center md:hidden z-50 rounded-t-[2rem] shadow-2xl">
        <div className="text-center flex flex-col items-center">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">الفجر</span>
          <span className="font-black text-lg font-mono tracking-tighter">{todayRamadanData.times.fajr}</span>
        </div>
        <div className="text-center transform -translate-y-5">
          <div className="bg-[#fcc52c] shadow-lg px-5 py-1.5 rounded-xl mb-1 border border-black/5 scale-110">
             <span className="text-[9px] text-slate-950 font-black uppercase tracking-tighter">الإفطار</span>
          </div>
          <span className="font-black text-2xl font-mono text-amber-950 block tracking-tighter">{todayRamadanData.times.maghrib}</span>
        </div>
        <div className="text-center flex flex-col items-center">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">العشاء</span>
          <span className="font-black text-lg font-mono tracking-tighter">{todayRamadanData.times.isha}</span>
        </div>
      </nav>
    </div>
  );
};

const SectionDivider: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <tr><td colSpan={10} className={`py-4 md:py-8 px-4 ${color} text-white font-black text-sm md:text-2xl font-amiri rounded-xl shadow-md text-center my-4`}>{title}</td></tr>
);

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center group">
    <div className="w-20 h-20 md:w-36 md:h-36 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-[2.5rem] flex flex-col items-center justify-center text-slate-900 shadow-inner border border-white group-hover:border-amber-400 transition-all duration-500">
      <span className="text-3xl md:text-6xl font-black font-mono leading-none group-hover:text-amber-600 transition-all transform group-hover:scale-105 tracking-tighter">{value.toString().padStart(2, '0')}</span>
      <span className="text-[8px] md:text-xs mt-1 md:mt-2 text-slate-500 font-black uppercase">{label}</span>
    </div>
  </div>
);

const PrayerCard: React.FC<{ icon: React.ReactNode; name: string; time: string; isActive?: boolean; highlight?: boolean; special?: boolean; }> = ({ icon, name, time, isActive, highlight, special }) => (
  <div className={`p-2 md:p-8 rounded-xl md:rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 border ${isActive ? 'bg-[#fcc52c] text-slate-950 z-20 border-2 border-black animate-prayer-active shadow-xl scale-110' : 'bg-white shadow-md border-slate-50 hover:shadow-xl hover:scale-105 hover:-translate-y-2'} ${highlight && !isActive ? 'bg-amber-50/50 border-amber-200 shadow-inner' : ''} ${special && !isActive ? 'border-amber-400 ring-2 ring-amber-50 bg-amber-50/10' : ''} transform relative overflow-hidden group cursor-pointer`}>
    <div className={`mb-1 md:mb-5 transition-all duration-500 ${isActive ? 'text-black scale-110' : 'text-amber-500 group-hover:scale-110'}`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 20, className: "md:w-10 md:h-10" })}</div>
    <span className={`text-[9px] md:text-lg font-black mb-0.5 md:mb-1 font-amiri tracking-wide ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{name}</span>
    <span className={`text-[11px] md:text-3xl font-mono font-black tracking-tighter ${isActive ? 'text-black' : 'text-slate-950 group-hover:text-amber-800'}`}>{time}</span>
  </div>
);

export default App;

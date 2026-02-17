
import React, { useState, useEffect, useMemo } from 'react';
import { RAMADAN_DATA_2026, RAMADAN_START_DATE_2026, OrangeHeart, ACADEMY_NAME, BrandTitle, ACADEMY_LINK, ENGINEER_LINK } from './constants';
import { RamadanDay } from './types';
import { Clock, Moon, Sun, Calendar, Star, ChevronDown, ChevronUp, LayoutGrid, PartyPopper, BookOpen, Info, ShieldCheck, TrendingUp, AlertCircle, FileText, Scale, Landmark, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen islamic-pattern text-slate-900 pb-24 overflow-x-hidden selection:bg-amber-300">
      <header className="bg-gradient-to-br from-white via-slate-50 to-[#fcc52c]/30 pt-10 pb-24 px-4 text-center border-b border-black/5 relative overflow-hidden arch-header">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <BrandTitle className="mb-6 transform hover:scale-105 transition-transform duration-500" />
          <div className="flex flex-col items-center gap-2 mb-6">
            <h1 className="text-2xl md:text-5xl font-black font-amiri text-slate-800 drop-shadow-sm">
              <a href={ACADEMY_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 transition-colors">
                أكاديمية أبعاد للهندسة المعمارية
              </a>
            </h1>
            <p className="text-xl md:text-3xl font-bold font-amiri text-slate-600 drop-shadow-sm italic">
              تتمنى لكم إفطاراً شهياً وصياماً مقبولاً
            </p>
          </div>
          <a 
            href={ENGINEER_LINK} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-3 py-3 px-8 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-amber-400/50 shadow-sm transition-all hover:bg-white/80 group"
          >
            <OrangeHeart />
            <span className="font-bold text-lg md:text-3xl text-slate-900 font-amiri group-hover:text-orange-700 transition-colors">م. أمير الدين الحمامي</span>
            <OrangeHeart />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto -mt-12 px-2 md:px-4 space-y-12 relative z-20">
        
        <section className="bg-white/95 backdrop-blur-2xl rounded-[2rem] md:rounded-[4rem] shadow-2xl p-6 md:p-14 text-center border-b-[12px] border-[#fcc52c] relative overflow-hidden">
          <div className="flex flex-col items-center">
            {appStatus === 'EID' && currentTime.getDate() === 21 && currentTime.getMonth() === 2 ? (
              <div className="py-12 space-y-4">
                <PartyPopper className="w-24 h-24 text-amber-500 mx-auto animate-bounce" />
                <h2 className="text-6xl font-black font-amiri text-amber-600">عيد فطر سعيد!</h2>
                <p className="text-2xl font-bold text-slate-600 font-amiri">تقبل الله منا ومنكم صالح الأعمال</p>
              </div>
            ) : smartCountdown ? (
              <>
                <div className="inline-flex items-center gap-4 mb-10 bg-slate-900 py-4 px-10 rounded-full text-amber-400 font-black text-lg md:text-4xl border-4 border-[#fcc52c] shadow-2xl hover:scale-105 transition-transform duration-500">
                  <Clock className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                  <span className="font-amiri">{smartCountdown.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 md:gap-12 w-full max-w-4xl">
                  <TimeUnit value={smartCountdown.hours} label="ساعة" />
                  <TimeUnit value={smartCountdown.minutes} label="دقيقة" />
                  <TimeUnit value={smartCountdown.seconds} label="ثانية" />
                </div>
              </>
            ) : null}

            <div className="mt-14 flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-3 py-3 px-8 bg-amber-100 rounded-2xl border-2 border-amber-400">
                <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                <span className="text-xl md:text-3xl font-black text-amber-900 font-amiri">{hijriDateDisplay}</span>
              </div>
              <div className="flex items-center gap-3 py-3 px-8 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                <Calendar className="w-6 h-6 text-slate-400" />
                <span className="text-sm md:text-xl font-bold text-slate-700 font-amiri">
                  {currentTime.toLocaleDateString('ar-SY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          <PrayerCard icon={<Star />} name="الإمساك" time={todayRamadanData.times.imsak} special isActive={smartCountdown?.label?.includes("الإمساك")} />
          <PrayerCard icon={<Moon />} name="الفجر" time={todayRamadanData.times.fajr} isActive={smartCountdown?.label?.includes("الفجر")} />
          <PrayerCard icon={<Sun />} name="الظهر" time={todayRamadanData.times.dhuhr} />
          <PrayerCard icon={<Sun />} name="العصر" time={todayRamadanData.times.asr} />
          <PrayerCard icon={<Moon />} name="المغرب" time={todayRamadanData.times.maghrib} highlight isActive={smartCountdown?.label?.includes("الإفطار")} />
          <PrayerCard icon={<Moon />} name="العشاء" time={todayRamadanData.times.isha} />
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-slate-900 px-6 py-8 flex items-center justify-between font-bold text-white hover:bg-black transition-all"
          >
            <div className="flex items-center gap-4 text-xl md:text-3xl">
              <LayoutGrid className="w-8 h-8 text-amber-400" />
              <span className="font-amiri text-2xl md:text-3xl">جدول إمساكية رمضان 2026 - توقيت دمشق</span>
            </div>
            <div className="bg-white/10 p-2 rounded-full">
               {isExpanded ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
            </div>
          </button>
          
          <div className={`transition-all duration-1000 ease-in-out ${isExpanded ? 'max-h-[15000px]' : 'max-h-0'} overflow-hidden`}>
            <div className="p-1 md:p-8 bg-slate-50/20 overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-y-1 table-fixed min-w-[700px]">
                <thead className="text-slate-600 font-black uppercase text-[10px] md:text-base tracking-normal">
                  <tr>
                    <th className="py-2 w-[8%]">اليوم</th>
                    <th className="py-2 w-[14%]">التاريخ</th>
                    <th className="py-2 w-[8%]">رمضان</th>
                    <th className="py-2 w-[10%] bg-slate-100">الإمساك</th>
                    <th className="py-2 w-[11%] bg-blue-50">الفجر</th>
                    <th className="py-2 w-[8%]">الشروق</th>
                    <th className="py-2 w-[8%]">الظهر</th>
                    <th className="py-2 w-[8%]">العصر</th>
                    <th className="py-2 w-[15%] bg-amber-50">المغرب</th>
                    <th className="py-2 w-[10%]">العشاء</th>
                  </tr>
                </thead>
                <tbody className="text-slate-900">
                  {RAMADAN_DATA_2026.map((day, idx) => (
                    <React.Fragment key={idx}>
                      {idx === 0 && <SectionDivider title="أوله رحمة" color="bg-green-600" />}
                      {idx === 10 && <SectionDivider title="وأوسطه مغفرة" color="bg-blue-600" />}
                      {idx === 20 && <SectionDivider title="وآخره عتق من النار" color="bg-red-600" />}
                      {idx === 30 && (
                        <>
                          <SectionDivider title="عيد الفطر السعيد" color="bg-amber-600" />
                          <tr>
                            <td colSpan={10} className="p-4 md:p-8 bg-amber-50 border-x-4 border-amber-600 text-right space-y-4">
                              <div className="flex items-start gap-4">
                                <Info className="w-6 h-6 md:w-8 md:h-8 text-amber-700 shrink-0 mt-1" />
                                <div className="space-y-4">
                                  <p className="text-amber-900 font-amiri text-lg md:text-2xl font-bold leading-relaxed">
                                    <span className="text-amber-700 font-black block mb-1">صلاة العيد:</span>
                                    تقام صلاة العيد في مساجد دمشق عادةً بعد شروق الشمس بمدة تتراوح بين 15 إلى 25 دقيقة (أي حوالي الساعة 07:00 صباحاً وفق توقيت اليوم الأول)، ويصدر تعميم دقيق بالموعد من وزارة الأوقاف قبل العيد بيوم.
                                  </p>
                                  <p className="text-amber-900 font-amiri text-lg md:text-2xl font-bold leading-relaxed">
                                    <span className="text-amber-700 font-black block mb-1">تحري شوال:</span>
                                    سيتم التماس هلال شوال مساء الخميس 19 آذار 2026. إذا لم تثبت الرؤية، يُتم رمضان ثلاثين يوماً كما هو موضح في الجدول أعلاه.
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                      
                      <tr className={`${idx === currentRamadanDayIndex && appStatus === 'IN_RAMADAN' ? 'bg-amber-100 ring-2 ring-amber-400 z-10 relative' : 'bg-white hover:bg-amber-50/20'} transition-all`}>
                        <td className="py-3 md:py-5 font-amiri text-[11px] md:text-xl font-bold truncate">{day.dayName}</td>
                        <td className="py-3 md:py-5 text-slate-500 font-sans text-[10px] md:text-base font-bold">{day.gregorianDate}</td>
                        <td className="py-3 md:py-5 text-amber-600 font-black text-[14px] md:text-3xl">{day.displayDay}</td>
                        <td className="py-3 md:py-5 font-mono text-slate-400 text-[10px] md:text-lg font-bold">{day.times.imsak}</td>
                        <td className="py-3 md:py-5 font-mono text-blue-900 text-[12px] md:text-2xl font-black bg-blue-50/30">{day.times.fajr}</td>
                        <td className="py-3 md:py-5 font-mono text-slate-400 text-[9px] md:text-base font-bold">{day.times.sunrise}</td>
                        <td className="py-3 md:py-5 font-mono text-slate-400 text-[9px] md:text-base font-bold">{day.times.dhuhr}</td>
                        <td className="py-3 md:py-5 font-mono text-slate-400 text-[9px] md:text-base font-bold">{day.times.asr}</td>
                        <td className="py-3 md:py-5 font-mono text-amber-900 text-[14px] md:text-3xl font-black bg-amber-50/50">{day.times.maghrib}</td>
                        <td className="py-3 md:py-5 font-mono text-slate-400 text-[10px] md:text-lg font-bold">{day.times.isha}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div className="mt-8 p-6 bg-slate-900 text-amber-400 rounded-3xl border-4 border-amber-500 text-sm md:text-xl font-bold font-amiri leading-relaxed shadow-2xl">
                <AlertCircle className="w-8 h-8 inline-block mb-1 ml-3 text-white" />
                تنويه: المواعيد أعلاه مستندة إلى التوقعات الفلكية الأكثر دقة للتقويم الهاشمي لعام 2026، ويبقى القول الفصل لما يعلنه القاضي الشرعي الأول بدمشق ليلة التحري.
              </div>
            </div>
          </div>
          {!isExpanded && (
            <div className="p-8 text-center text-slate-900 font-black text-xl cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group" onClick={() => setIsExpanded(true)}>
              <LayoutGrid className="w-8 h-8 text-amber-500 group-hover:rotate-45 transition-transform duration-500" />
              <span className="font-amiri text-2xl md:text-3xl">عرض كامل الجدول التفصيلي لرمضان والعيد</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl overflow-hidden border border-slate-200">
          <button 
            onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
            className="w-full bg-slate-50 px-8 py-10 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-5">
              <BookOpen className="w-10 h-10 text-amber-600" />
              <div className="text-right">
                <span className="block font-amiri text-2xl md:text-3xl font-black">تقرير البحث التخصصي المعمق والمنهجية الفقهية</span>
                <span className="block text-slate-500 text-sm md:text-base opacity-70">دراسة فلكية وإدارية وفق التقويم الهاشمي السوري</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-slate-200">
               {isMethodologyOpen ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
            </div>
          </button>

          <div className={`transition-all duration-1000 ease-in-out ${isMethodologyOpen ? 'max-h-[15000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="p-8 lg:p-16 space-y-12 bg-white font-amiri text-lg md:text-xl leading-relaxed text-slate-800">
              
              <div className="bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-200 shadow-sm relative overflow-hidden">
                <FileText className="absolute -bottom-10 -left-10 w-48 h-48 text-amber-200 opacity-30" />
                <h2 className="text-3xl font-black text-amber-900 mb-6 flex items-center gap-3 relative z-10">
                  <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                  مقدمة التقرير التخصصي
                </h2>
                <p className="relative z-10 text-justify">
                  تمثل مسألة ضبط المواقيت الزمانية في الشعائر التعبدية الإسلامية أحد أدق جوانب التقاطع بين علوم الفلك والحساب وبين الفقه المقارن، إذ يترتب على دقة هذه المواقيت صحة العبادة من حيث الإمساك عن المفطرات في الصيام أو دخول وقت الصلاة. وفي الجمهورية العربية السورية، استقر العرف المؤسسي والاجتماعي منذ عقود على اعتماد "التقويم الهاشمي" مرجعاً أساسياً لا يقبل الجدل في تحديد مواقيت الصلاة والإمساك، نظراً لما يتمتع به من دقة حسابية فائقة وملاءمة جغرافية لإحداثيات المدن السورية، وعلى رأسها العاصمة دمشق. يهدف هذا التقرير إلى تقديم تحليل شامل وعميق لإمساكية شهر رمضان المبارك لعام 1447 هجرية الموافق لعام 2026 ميلادية، مع التركيز على المنهجية العلمية التي يتبعها التقويم الهاشمي، وتفصيل الجدول الزمني الدقيق الذي يضمن تحري الحلال والحرام، مع مراعاة الاحتياط الشرعي في وقت الإمساك بجعله سابقاً لأذان الفجر بخمس عشرة دقيقة.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
                    <Landmark className="text-amber-600" />
                    الإطار التاريخي والفلسفي
                  </h3>
                  <p className="text-justify">
                    يعود أصل التقويم الهاشمي إلى مجهودات علمية قام بها الدكتور محمد الهاشمي، الذي سعى لابتكار نظام تقويمي يجمع بين الحساب الفلكي الدقيق (النجمي والقمر) وبين الرؤية الشرعية المستندة إلى السنة النبوية. إن الميزة الأساسية لهذا التقويم هي اعتماده على "دورة ميتونية" التي تضبط السنة القمرية وتجعلها في حالة توازن مع الفصول الشمسية على مدار 19 عاماً، وهو ما يفسر استمرارية دقة هذا التقويم وتوافقه مع الظواهر الفلكية المشاهدة.
                  </p>
                  <p className="text-justify bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    في السياق السوري، لم يكن التقويم الهاشمي مجرد أداة حسابية، بل تحول إلى وثيقة رسمية تصدرها مطبعة الهاشمية بدمشق وتحظى بمصادقة وزارة الأوقاف والمحكمة الشرعية. ويعتبر الجامع الأموي بدمشق هو الميقاتي الأول الذي تُضبط على أذانه ساعات السوريين.
                  </p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
                    <Settings className="text-amber-600" />
                    الميكانيكا الفلكية للحساب
                  </h3>
                  <p className="text-justify">
                    تعتمد الحسابات الفلكية في التقويم الهاشمي على إحداثيات دمشق الجغرافية الدقيقة (خط عرض 33.51° شمالاً وخط طول 36.29° شرقاً). ويتم حساب وقت الفجر الصادق بناءً على زاوية انخفاض الشمس تحت الأفق الشرقي، حيث تتبنى المعايير السورية زاوية تتراوح بين 18.5 و19.5 درجة، وهي زاوية تضمن بزوغ الضوء المستطير الذي يحدد شرعاً وقت الفجر.
                  </p>
                  <p className="text-justify bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    أما بالنسبة لوقت المغرب (الإفطار)، فإن الحساب يعتمد على لحظة اختفاء كامل قرص الشمس تحت الأفق الغربي مع إضافة هامش بسيط يسمى "دقيقة الاحتياط" لضمان زوال الحمرة المشرقية ودخول الليل يقيناً.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8">
                <h3 className="text-2xl font-black text-amber-400 flex items-center gap-3">
                  <TrendingUp />
                  تحليل معطيات هلال رمضان 1447 هـ (2026 م)
                </h3>
                <p className="text-justify text-slate-300">
                  وفقاً للبيانات الفلكية المتقاطعة من عدة مراصد عالمية وإقليمية، فإن لحظة الاقتران الفلكي (تولد الهلال) لشهر رمضان 1447 هـ ستحدث يوم الثلاثاء 17 فبراير/ شباط 2026 في تمام الساعة 15:02 بتوقيت دمشق. وتشير الدراسات إلى استحالة رؤية الهلال مساء يوم الثلاثاء في سوريا، لأن القمر سيغرب قبل الشمس في ذلك اليوم.
                </p>
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                  تؤدي هذه المعطيات العلمية إلى استنتاج أن يوم الأربعاء 18 فبراير هو المتمم لشهر شعبان، وأن الخميس 19 فبراير هو الغرة الرسمية لرمضان 2026 في سوريا فلكياً.
                </div>
                <p className="text-amber-300 font-bold italic">
                  تنويه: المواعيد أعلاه مستمدة من الحسابات الفلكية الأكثر دقة لدمشق، ويجب الالتزام بما يعلنه القاضي الشرعي الأول رسمياً ليلة الثلاثاء 17 شباط 2026 بخصوص بداية الشهر يقيناً.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
                    <Scale className="text-amber-600" />
                    المنهجية الفقهية والقانونية
                  </h3>
                  <p className="text-justify">
                    تعتمد سوريا في إثبات الأهلة منهجية مؤسسية صارمة يقودها "القاضي الشرعي الأول بدمشق". وبموجب المنهج المتبع، فإن الرؤية البصرية تظل هي الأصل الشرعي، لكنها لا تُقبل إذا كانت مستحيلة فلكياً، وهو ما يعكس روح "اللجنة الوطنية لرصد الأهلة" لدمج الخبرات الفلكية بالمعايير الفقهية. تعمل الجمعية الفلكية السورية على تزويد المحكمة الشرعية بتقرير مفصل يشمل زاوية الاستطالة وارتفاع الهلال ومكثه بعد الغروب.
                  </p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
                    <ShieldCheck className="text-amber-600" />
                    أهمية الإمساك الاحتياطي
                  </h3>
                  <p className="text-justify">
                    إن تحديد وقت الإمساك قبل 15 دقيقة من أذان الفجر ليس مجرد إجراء تنظيمي، بل هو تطبيق لمبدأ "الاحتياط" في العبادة. فمن الناحية الفلكية, يتأثر توقيت الفجر الصادق بظروف الغلاف الجوي والتلوث الضوئي، مما قد يجعل الأذان المسجل يختلف بفارق ضئيل عن الواقع. التوقف المبكر يضمن للصائم ألا يدركه الفجر وهو لا يزال يتناول سحوره، مما قد يعرض صيامه للبطلان.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
                    <Info className="text-amber-600" />
                    التحليل الزمني لساعات الصيام
                  </h3>
                  <p className="text-justify">
                    يلاحظ أن رمضان 1447 هـ يقع في فترة انتقالية بين الشتاء والربيع، مما يؤدي لتغيرات ملحوظة في طول النهار. يبدأ الصيام في دمشق بحوالي 12 ساعة و29 دقيقة، ليصل في اليوم الثلاثين إلى حوالي 13 ساعة و29 دقيقة. يتقدم وقت الفجر بمعدل دقيقة يومياً بينما يتأخر المغرب بمعدل مماثل. يظل وقت الظهر ثابتاً نسبياً حول 12:49.
                  </p>
              </div>

              <div className="overflow-x-auto rounded-[2rem] border-2 border-slate-100 shadow-sm">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="p-6 border-b border-white/10">المعيار الحسابي</th>
                        <th className="p-6 border-b border-white/10">زاوية الفجر</th>
                        <th className="p-6 border-b border-white/10">زاوية العشاء</th>
                        <th className="p-6 border-b border-white/10">الدقة لدمشق</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 font-bold">
                      <tr>
                        <td className="p-6 border-b font-black text-slate-950">التقويم الهاشمي (الرسمي)</td>
                        <td className="p-6 border-b">19° - 19.5°</td>
                        <td className="p-6 border-b">متغيرة فصلياً</td>
                        <td className="p-6 border-b text-green-600 font-black">عالية جداً</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="p-6 border-b">رابطة العالم الإسلامي</td>
                        <td className="p-6 border-b">18°</td>
                        <td className="p-6 border-b">17°</td>
                        <td className="p-6 border-b text-amber-600">متوسطة</td>
                      </tr>
                      <tr>
                        <td className="p-6">توقيت أم القرى</td>
                        <td className="p-6">18.5°</td>
                        <td className="p-6">90 د ثابتة</td>
                        <td className="p-6 text-red-600">غير دقيقة لدمشق</td>
                      </tr>
                    </tbody>
                  </table>
              </div>

              <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
                    <Landmark className="text-amber-600" />
                    الأبعاد الاجتماعية والإدارية
                  </h3>
                  <p className="text-justify">
                    ترتبط دقة الإمساكية أيضاً بتنظيم الحياة العامة. فبموجب التعميمات الرسمية، يتم تعديل ساعات الدوام لتصبح من 08:00 وحتى 14:00. هذا الضبط الزمني يعتمد كلياً على مواقيت التقويم الهاشمي. وتقوم وزارة الأوقاف السورية عبر قنواتها (نور الشام وإذاعة القدس) ببث الأذان وفقاً لهذا التقويم حصراً، مما يضمن وحدة الصف ومنع التشويش.
                  </p>
              </div>

              <div className="bg-amber-100 p-10 rounded-[3rem] border-2 border-amber-400 shadow-inner">
                <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-amber-600" />
                  التوصيات النهائية للصائمين
                </h3>
                <ul className="space-y-4 text-amber-950">
                  <li className="flex gap-4 items-start">
                    <div className="h-8 w-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0">1</div>
                    <p>الاعتماد الكلي على التقويم الهاشمي وتجنب التطبيقات العالمية غير المضبوطة يدوياً.</p>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="h-8 w-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0">2</div>
                    <p>الالزام بوقت الإمساك الاحتياطي الموضح في الجدول (15 دقيقة قبل الأذان).</p>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="h-8 w-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0">3</div>
                    <p>متابعة البيان الرسمي للقاضي الشرعي الأول بدمشق مساء الثلاثاء 17 شباط 2026.</p>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="h-8 w-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black shrink-0">4</div>
                    <p>مراعاة فروق التوقيت بين المحافظات السورية وفقاً للموقع الجغرافي.</p>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        <footer className="text-center space-y-12 pt-24 pb-20 border-t border-black/5 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-8 relative z-10 flex flex-col items-center">
             <BrandTitle className="mb-4" />
             <p className="text-slate-800 font-bold text-xl px-6 font-amiri md:text-4xl leading-relaxed max-w-3xl">
               أُهديت هذه الإمساكية إلى روح والدي المرحوم غسان الحمامي، صدقةً جاريةً وذكرى طيبة له، سائلين الله أن يتقبّلها ويجعلها في ميزان حسناته.
             </p>
          </div>
          <div className="flex justify-center gap-6 relative z-10">
            {[...Array(5)].map((_, i) => <OrangeHeart key={i} />)}
          </div>
          <div className="space-y-4 relative z-10 px-4">
            <h2 className="font-amiri text-6xl md:text-9xl font-black text-slate-950 drop-shadow-xl tracking-tighter hover:text-orange-600 transition-colors cursor-default text-center">
              رمضان مبارك
            </h2>
          </div>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t-4 border-[#fcc52c] p-5 flex justify-around items-center md:hidden z-50 text-slate-900 shadow-[0_-15px_30px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
        <div className="text-center flex flex-col items-center">
          <span className="text-[9px] text-slate-400 font-black uppercase mb-1">الفجر</span>
          <span className="font-black text-xl font-mono leading-none">{todayRamadanData.times.fajr}</span>
        </div>
        <div className="text-center transform -translate-y-6">
          <div className="bg-[#fcc52c] shadow-2xl px-6 py-2 rounded-2xl mb-1 border-2 border-black/5">
             <span className="text-[11px] text-slate-950 font-black uppercase">الإفطار</span>
          </div>
          <span className="font-black text-3xl font-mono text-amber-950 block">{todayRamadanData.times.maghrib}</span>
        </div>
        <div className="text-center flex flex-col items-center">
          <span className="text-[9px] text-slate-400 font-black uppercase mb-1">العشاء</span>
          <span className="font-black text-xl font-mono leading-none">{todayRamadanData.times.isha}</span>
        </div>
      </nav>
    </div>
  );
};

const SectionDivider: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <tr>
    <td colSpan={10} className={`py-4 md:py-8 px-4 ${color} text-white font-black text-lg md:text-3xl font-amiri rounded-xl shadow-lg text-center transform scale-[0.98] my-4`}>
      {title}
    </td>
  </tr>
);

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center group">
    <div className="w-24 h-24 md:w-44 md:h-44 bg-white/60 backdrop-blur-sm rounded-3xl md:rounded-[3.5rem] flex flex-col items-center justify-center text-slate-900 shadow-inner border-2 border-white group-hover:border-amber-400 transition-all duration-500">
      <span className="text-4xl md:text-8xl font-black font-mono leading-none group-hover:text-amber-600 transition-all duration-500 transform group-hover:scale-110">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] md:text-sm mt-1 text-slate-500 font-black tracking-widest uppercase">{label}</span>
    </div>
  </div>
);

const PrayerCard: React.FC<{ 
  icon: React.ReactNode; 
  name: string; 
  time: string; 
  isActive?: boolean;
  highlight?: boolean;
  special?: boolean;
}> = ({ icon, name, time, isActive, highlight, special }) => (
  <div className={`
    p-2.5 md:p-10 rounded-2xl md:rounded-[3rem] flex flex-col items-center justify-center transition-all duration-700 border-2
    ${isActive ? 'bg-[#fcc52c] text-slate-950 z-20 border-4 border-black animate-prayer-active shadow-2xl' : 'bg-white shadow-lg border-slate-50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2'}
    ${highlight && !isActive ? 'bg-amber-50/50 border-amber-200 shadow-inner' : ''}
    ${special && !isActive ? 'border-amber-500 ring-2 ring-amber-50 bg-amber-50/20' : ''}
    transform relative overflow-hidden group cursor-pointer
  `}>
    <div className={`mb-1.5 md:mb-5 transition-all duration-500 ${isActive ? 'text-black scale-110' : 'text-amber-500 group-hover:scale-125 group-hover:rotate-6'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 28, className: "md:w-12 md:h-12" })}
    </div>
    <span className={`text-[9px] md:text-lg font-black mb-1 font-amiri ${isActive ? 'text-slate-900 underline decoration-black/20 decoration-2 underline-offset-4' : 'text-slate-500'}`}>
      {name}
    </span>
    <span className={`text-[11px] md:text-4xl font-mono font-black tracking-tighter ${isActive ? 'text-black' : 'text-slate-900 group-hover:text-amber-800'}`}>
      {time}
    </span>
  </div>
);

export default App;

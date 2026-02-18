
export interface PrayerTimes {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface RamadanDay {
  dayNumber: number;
  gregorianDate: string;
  dayName: string;
  times: PrayerTimes;
}

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isActive: boolean;
  isFasting: boolean;
}

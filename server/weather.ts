export interface RegionalWeatherRisk {
  region: string;
  city: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  activity_index: number; // 0 - 100
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  active_species_threats: string[];
  recommendation: string;
}

const REGION_COORDINATES: Record<string, { lat: number; lng: number; city: string }> = {
  UK: { lat: 51.5074, lng: -0.1278, city: 'London' },
  US: { lat: 38.8951, lng: -77.0364, city: 'Washington DC' },
  CA: { lat: 45.4215, lng: -75.6972, city: 'Ottawa' },
  AU: { lat: -33.8688, lng: 151.2093, city: 'Sydney' },
  EU: { lat: 48.8566, lng: 2.3522, city: 'Paris' },
  Other: { lat: 51.5074, lng: -0.1278, city: 'Global Station' },
};

export async function fetchRegionalInsectRisk(region: string = 'UK'): Promise<RegionalWeatherRisk> {
  const coords = REGION_COORDINATES[region] || REGION_COORDINATES['UK'];

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const temp = data.current?.temperature_2m ?? 21;
      const humidity = data.current?.relative_humidity_2m ?? 65;
      const rain = data.current?.precipitation ?? 0;

      // Insect activity formula: Insects thrive in warm (18°C-32°C) and humid (>50%) conditions
      let score = 20;
      if (temp >= 15 && temp <= 35) score += 40;
      if (temp > 22 && temp < 30) score += 20;
      if (humidity > 55) score += 15;
      if (humidity > 75) score += 10;
      if (rain > 5) score -= 15; // heavy rain temporarily suppresses flight

      score = Math.max(10, Math.min(95, score));

      let risk_level: RegionalWeatherRisk['risk_level'] = 'Low';
      let active_species: string[] = ['Common Ants', 'Harmless Hoverflies'];
      let rec = 'Standard insect activity. General outdoor safety is fine.';

      if (score >= 75) {
        risk_level = 'Severe';
        active_species = ['Yellowjackets & Hornets', 'Asian Tiger Mosquitoes', 'Blacklegged Deer Ticks', 'Horseflies'];
        rec = 'Peak insect aggression and breeding conditions. Apply DEET/Picaridin repellents and avoid standing water.';
      } else if (score >= 50) {
        risk_level = 'High';
        active_species = ['Common Wasps', 'Wood Ticks', 'Mosquitoes', 'Biting Midges'];
        rec = 'Elevated outdoor pest activity. Wear light-colored clothing and check for ticks after woodland walks.';
      } else if (score >= 30) {
        risk_level = 'Moderate';
        active_species = ['Honeybees', 'Spiders', 'Garden Weevils', 'Aphids'];
        rec = 'Moderate foraging activity. Low stinging risk unless directly disturbed.';
      }

      return {
        region,
        city: coords.city,
        temperature: Math.round(temp),
        humidity: Math.round(humidity),
        precipitation: rain,
        activity_index: score,
        risk_level,
        active_species_threats: active_species,
        recommendation: rec,
      };
    }
  } catch (err) {
    console.warn('Open-Meteo request failed, using estimated metrics:', err);
  }

  return {
    region,
    city: coords.city,
    temperature: 22,
    humidity: 60,
    precipitation: 0,
    activity_index: 55,
    risk_level: 'Moderate',
    active_species_threats: ['Common Wasps', 'Garden Ticks', 'Biting Midges'],
    recommendation: 'Moderate seasonal insect activity. Carry insect repellent when exploring tall grass.',
  };
}

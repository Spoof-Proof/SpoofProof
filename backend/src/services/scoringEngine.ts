import SensorLog, { ISensorLog } from '../models/SensorLog';
import { IClaim } from '../models/Claim';
import User from '../models/User';
import axios from 'axios';

// Haversine formula to get distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Radius of the earth in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export const computeTrustScore = async (claimId: string): Promise<IClaim['trustScoreBreakdown']> => {
  const breakdown = {
    movement: 0,
    accelerometer: 0,
    gyroscope: 0,
    barometer: 0,
    network: 0,
    activity: 0,
    deviceIntegrity: 0,
  };

  const logs = await SensorLog.find({ claimId }).sort({ timestamp: 1 });
  if (!logs || logs.length === 0) return breakdown;

  // Track anomalies
  let anomalies = 0;
  let accelerometerActive = false;
  let maxSpeedFound = 0;
  let suddenJumps = 0;
  let totalDistance = 0;
  let gyroActive = false;
  let networkDrops = false;

  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1];
    const curr = logs[i];

    // Compute time difference in seconds
    const timeDiffSecs = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
    
    if (timeDiffSecs > 0) {
      const dist = getDistanceFromLatLonInM(prev.location.lat, prev.location.lng, curr.location.lat, curr.location.lng);
      totalDistance += dist;
      
      const calculatedSpeed = dist / timeDiffSecs;
      if (calculatedSpeed > maxSpeedFound) maxSpeedFound = calculatedSpeed;
      
      // Jumps over 50m in barely any time -> Spoofing jump
      if (dist > 50 && timeDiffSecs < 2) {
        suddenJumps++;
        anomalies++;
      }
    }

    // Accumulate accelerometer delta
    const accDelta = Math.abs(curr.motion.accelerometer.x - prev.motion.accelerometer.x) + 
                     Math.abs(curr.motion.accelerometer.y - prev.motion.accelerometer.y) + 
                     Math.abs(curr.motion.accelerometer.z - prev.motion.accelerometer.z);
    
    if (accDelta > 0.6) accelerometerActive = true; 

    // Accumulate gyro delta
    const gyroDelta = Math.abs(curr.motion.gyroscope.x - prev.motion.gyroscope.x) + 
                      Math.abs(curr.motion.gyroscope.y - prev.motion.gyroscope.y) + 
                      Math.abs(curr.motion.gyroscope.z - prev.motion.gyroscope.z);
    
    if (gyroDelta > 0.4) gyroActive = true;

    // Network stability during storm check
    if (curr.network.strength < 40) {
      networkDrops = true; // Signals poor conditions possibly correlating with bad weather
    }
  }

  // --- Weather Validation (Open-Meteo) ---
  let expectedStorm = false;
  try {
     const lastLog = logs[logs.length - 1];
     const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lastLog.location.lat}&longitude=${lastLog.location.lng}&current=surface_pressure,wind_speed_10m,precipitation,weather_code`;
     const weatherRes = await axios.get(weatherUrl);
     const current = weatherRes.data?.current;
     // simple storm condition: high wind, high precipitation, or low pressure
     if (current && (current.wind_speed_10m > 30 || current.precipitation > 5 || current.weather_code >= 61)) {
        expectedStorm = true;
     }
  } catch (err) {
     console.error("Open-Meteo fetch failed:", err);
  }

  const userId = logs[0].userId;
  const user = await User.findById(userId);

  // --- Movement Scoring (15 max) ---
  // If moving unrealistically fast (e.g. > 50m/s ~ 180km/h) or has sudden jumps
  let validMovement = true;
  if (maxSpeedFound > 50 || suddenJumps > 0) validMovement = false;
  if (validMovement && totalDistance > 5) breakdown.movement = 15;
  else if (validMovement && totalDistance <= 5) breakdown.movement = 8; // Maybe valid but barely moved

  // --- Accelerometer Scoring (15 max) ---
  if (accelerometerActive) breakdown.accelerometer = 15;
  
  // Consistency Check: High Movement but Flat Accelerometer = Spoofed GPS
  if (breakdown.movement === 15 && totalDistance > 10 && !accelerometerActive) {
    breakdown.movement = 0;
    breakdown.accelerometer = 0;
    anomalies++;
  }

  // --- Gyroscope Scoring (10 max) ---
  if (gyroActive) breakdown.gyroscope = 10;
  if (!gyroActive && breakdown.movement === 15) breakdown.gyroscope = 0;

  // --- Activity Consistency (10 max) ---
  const lastActivity = logs[logs.length - 1].activity;
  if (lastActivity && lastActivity.type !== 'unknown' && lastActivity.type !== 'idle') {
    breakdown.activity = 10;
  } else {
    breakdown.activity = 5;
  }

  // --- Barometer Scoring (20 max) ---
  // In a real storm, pressure drops. If the API expects a storm, and the phone confirms it (barometer < 1005 hPa), it validates reality.
  // For now, if no storm expected, we give full marks to Barometer.
  breakdown.barometer = 20; 

  // --- Network Scoring (20 max) ---
  // Storms cause bad signal. If a storm is happening but signal is perfect = Suspicious
  if (expectedStorm && !networkDrops) breakdown.network = 10;
  else breakdown.network = 20;

  // --- Device Integrity (10 max) ---
  if (user && !user.isRooted && !user.isMockLocationEnabled) {
    breakdown.deviceIntegrity = 10;
  }

  // Ensure hard penalties if anomalies found
  if (anomalies > 1) {
     breakdown.movement = Math.max(0, breakdown.movement - 10);
  }

  return breakdown;
};

export const calculateTotalScore = (breakdown: IClaim['trustScoreBreakdown']): number => {
  return breakdown.movement + 
         breakdown.accelerometer + 
         breakdown.gyroscope + 
         breakdown.barometer + 
         breakdown.network + 
         breakdown.activity + 
         breakdown.deviceIntegrity;
};

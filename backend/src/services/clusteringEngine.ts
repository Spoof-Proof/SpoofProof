import kmeans from 'node-kmeans';
import Claim from '../models/Claim';
import SensorLog from '../models/SensorLog';

export const detectFraudClusters = async () => {
  const recentClaims = await Claim.find({ status: { $ne: 'APPROVED' } }).populate('userId');
  if (recentClaims.length < 2) return [];

  const vectors: number[][] = [];
  const claimMap: any = {};

  for (let claim of recentClaims) {
    const logs = await SensorLog.find({ claimId: claim._id }).limit(10);
    if (logs.length > 0) {
      // Basic feature vector: Average Lat, Avg Lng, Avg Accel Z, Avg Net Strength
      const avgLat = logs.reduce((sum, l) => sum + l.location.lat, 0) / logs.length;
      const avgLng = logs.reduce((sum, l) => sum + l.location.lng, 0) / logs.length;
      const avgAccelZ = logs.reduce((sum, l) => sum + (l.motion.accelerometer?.z || 0), 0) / logs.length;
      const avgNet = logs.reduce((sum, l) => sum + l.network.strength, 0) / logs.length;

      vectors.push([avgLat, avgLng, avgAccelZ, avgNet]);
      claimMap[vectors.length - 1] = claim;
    }
  }

  if (vectors.length < 2) return [];

  return new Promise((resolve, reject) => {
    kmeans.clusterize(vectors, { k: Math.min(vectors.length, 3) }, (err: any, res: any) => {
      if (err) return reject(err);
      
      // res is an array of clusters
      const clusters = res.map((cluster: any) => ({
        centroid: cluster.centroid,
        claims: cluster.clusterInd.map((idx: number) => claimMap[idx])
      }));
      
      resolve(clusters);
    });
  });
};

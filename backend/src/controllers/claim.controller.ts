import { Request, Response } from 'express';
import Claim from '../models/Claim';
import User from '../models/User';
import { computeTrustScore, calculateTotalScore } from '../services/scoringEngine';
import { detectFraudClusters } from '../services/clusteringEngine';

export const uploadProof = async (req: Request<{ claimId: string }>, res: Response) => {
  try {
    const { claimId } = req.params as { claimId: string };
    const { proofImageUrl } = req.body;
    
    if (!proofImageUrl) {
      return res.status(400).json({ message: 'No proof image provided.' });
    }

    const updatedClaim = await Claim.findByIdAndUpdate(
      claimId,
      { proofImageUrl, status: 'PENDING' }, // Or keep it needs proof until manually reviewed, but we'll set to pending
      { new: true }
    );

    res.status(200).json(updatedClaim);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitClaim = async (req: Request, res: Response) => {
  try {
    const { userId, weatherContext } = req.body;
    
    // Check user integrity
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked due to integrity violation' });
    }

    const newClaim = new Claim({
      userId,
      weatherContext,
      status: 'PENDING'
    });

    await newClaim.save();
    res.status(201).json(newClaim);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const computeScore = async (req: Request<{ claimId: string }>, res: Response) => {
  try {
    const { claimId } = req.params as { claimId: string };
    
    const breakdown = await computeTrustScore(claimId);
    const totalScore = calculateTotalScore(breakdown);
    
    let status = 'PENDING';
    if (totalScore >= 80) status = 'APPROVED';
    else if (totalScore >= 50) status = 'NEEDS_PROOF';
    else status = 'FLAGGED';

    const updatedClaim = await Claim.findByIdAndUpdate(
      claimId,
      { trustScore: totalScore, trustScoreBreakdown: breakdown, status },
      { new: true }
    );

    res.status(200).json(updatedClaim);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getClaims = async (req: Request, res: Response) => {
  try {
    const claims = await Claim.find().populate('userId').sort({ createdAt: -1 });
    res.status(200).json(claims);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFraudClusters = async (req: Request, res: Response) => {
  try {
    const clusters = await detectFraudClusters();
    res.status(200).json(clusters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

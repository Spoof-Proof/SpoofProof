import { Router } from 'express';
import { submitClaim, computeScore, getClaims, getFraudClusters, uploadProof } from '../controllers/claim.controller';

const router = Router();

router.post('/submit', submitClaim);
router.post('/compute-score/:claimId', computeScore);
router.post('/proof/:claimId', uploadProof);
router.get('/', getClaims);
router.get('/clusters', getFraudClusters);

export default router;

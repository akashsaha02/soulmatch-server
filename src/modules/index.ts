import { Router } from 'express';
import { authRoutes } from './auth';
import { usersRoutes } from './users';
import { biodatasRoutes } from './biodatas';
import { contactRequestsRoutes } from './contact-requests';
import { premiumRequestsRoutes } from './premium-requests';
import { successStoriesRoutes } from './success-stories';
import { favouritesRoutes } from './favourites';
import { paymentRoutes } from './payment';
import { adminRoutes } from './admin';

const router = Router();

router.use(authRoutes);
router.use(usersRoutes);
router.use(biodatasRoutes);
router.use(contactRequestsRoutes);
router.use(premiumRequestsRoutes);
router.use(successStoriesRoutes);
router.use(favouritesRoutes);
router.use(paymentRoutes);
router.use(adminRoutes);

export default router;

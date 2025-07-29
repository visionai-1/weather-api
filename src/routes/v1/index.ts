import { Router } from 'express';
import weatherRoutes from './weather';

/**
 * 🛣️ API v1 Routes
 * Main router for all v1 API endpoints
 */

const router = Router();

// Weather routes
router.use('/weather', weatherRoutes);

export { router }; 
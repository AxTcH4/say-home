const { Router } = require('express');
const {
  getAllProperties,
  getLatestProperties,
  getPropertyById,
  createProperty,
} = require('../controllers/property.controller');

const router = Router();

router.get('/latest', getLatestProperties);
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', createProperty);

module.exports = router;
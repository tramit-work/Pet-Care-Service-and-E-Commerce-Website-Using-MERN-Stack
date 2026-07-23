const express = require('express');
const {
  listPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} = require('../controllers/pet.controller');
const {
  createPetValidator,
  updatePetValidator,
  listPetsValidator,
} = require('../validators/pet.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', listPetsValidator, validate, listPets);
router.get('/:id', getPetById);

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), createPetValidator, validate, createPet);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), updatePetValidator, validate, updatePet);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), deletePet);

module.exports = router;

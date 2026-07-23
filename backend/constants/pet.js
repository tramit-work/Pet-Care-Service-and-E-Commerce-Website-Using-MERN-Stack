const PET_SPECIES = {
  DOG: 'Dog',
  CAT: 'Cat',
};
const SPECIES_VALUES = Object.values(PET_SPECIES);

const PET_GENDER = {
  MALE: 'male',
  FEMALE: 'female',
};
const GENDER_VALUES = Object.values(PET_GENDER);

const ADOPTION_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  ADOPTED: 'adopted',
};
const ADOPTION_STATUS_VALUES = Object.values(ADOPTION_STATUS);

module.exports = {
  PET_SPECIES,
  SPECIES_VALUES,
  PET_GENDER,
  GENDER_VALUES,
  ADOPTION_STATUS,
  ADOPTION_STATUS_VALUES,
};

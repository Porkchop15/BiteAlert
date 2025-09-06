const express = require('express');
const router = express.Router();
const BiteCase = require('../models/BiteCase');

// Create a new bite case
router.post('/', async (req, res) => {
  try {
    console.log('Received request to create bite case:', req.body);
    
    // Preprocess the request body
    const processedBody = {
      ...req.body,
      middleName: req.body.middleName || ''
    };
    
    // Convert boolean fields to arrays
    // Type of Exposure
    const typeOfExposure = [];
    if (req.body.typeNonBite) typeOfExposure.push('NON-BITE');
    if (req.body.typeBite) typeOfExposure.push('BITE');
    processedBody.typeOfExposure = typeOfExposure;
    
    // Site of Bite
    const siteOfBite = [];
    if (req.body.headBite) siteOfBite.push('Head');
    if (req.body.faceBite) siteOfBite.push('Face');
    if (req.body.neckBite) siteOfBite.push('Neck');
    if (req.body.chestBite) siteOfBite.push('Chest');
    if (req.body.backBite) siteOfBite.push('Back');
    if (req.body.abdomenBite) siteOfBite.push('Abdomen');
    if (req.body.upperExtremitiesBite) siteOfBite.push('Upper Extremities');
    if (req.body.lowerExtremitiesBite) siteOfBite.push('Lower Extremities');
    if (req.body.othersBite) siteOfBite.push('Others');
    processedBody.siteOfBite = siteOfBite;
    
    // Nature of Injury
    const natureOfInjury = [];
    if (req.body.multipleInjuries) natureOfInjury.push('Multiple Injuries');
    if (req.body.abrasion) natureOfInjury.push('Abrasion');
    if (req.body.avulsion) natureOfInjury.push('Avulsion');
    if (req.body.burn) natureOfInjury.push('Burn');
    if (req.body.concussion) natureOfInjury.push('Concussion');
    if (req.body.contusion) natureOfInjury.push('Contusion');
    if (req.body.openWound) natureOfInjury.push('Open Wound');
    if (req.body.trauma) natureOfInjury.push('Trauma');
    if (req.body.othersInjury) natureOfInjury.push('Others');
    processedBody.natureOfInjury = natureOfInjury;
    
    // External Cause
    const externalCause = [];
    if (req.body.biteSting) externalCause.push('Bite/Sting');
    if (req.body.chemicalSubstance) externalCause.push('Chemical Substance');
    processedBody.externalCause = externalCause;
    
    // Place of Occurrence
    const placeOfOccurrence = [];
    if (req.body.placeHome) placeOfOccurrence.push('Home');
    if (req.body.placeSchool) placeOfOccurrence.push('School');
    if (req.body.placeRoad) placeOfOccurrence.push('Road');
    if (req.body.placeNeighbor) placeOfOccurrence.push('Neighbor');
    if (req.body.placeOthers) placeOfOccurrence.push('Others');
    processedBody.placeOfOccurrence = placeOfOccurrence;
    
    // Disposition
    const disposition = [];
    if (req.body.dispositionTreated) disposition.push('Treated & Sent Home');
    if (req.body.dispositionTransferred) disposition.push('Transferred to another facility/hospital');
    processedBody.disposition = disposition;
    
    // Circumstance of Bite
    const circumstanceOfBite = [];
    if (req.body.circumstanceProvoked) circumstanceOfBite.push('Provoked');
    if (req.body.circumstanceUnprovoked) circumstanceOfBite.push('Unprovoked');
    processedBody.circumstanceOfBite = circumstanceOfBite;
    
    // Animal Profile - Species
    const species = [];
    if (req.body.animalDog) species.push('Dog');
    if (req.body.animalCat) species.push('Cat');
    if (req.body.animalOthers) species.push('Others');
    processedBody.species = species;
    
    // Animal Profile - Clinical Status
    const clinicalStatus = [];
    if (req.body.animalHealthy) clinicalStatus.push('Healthy');
    if (req.body.animalSick) clinicalStatus.push('Sick');
    if (req.body.animalDied) clinicalStatus.push('Died');
    if (req.body.animalKilled) clinicalStatus.push('Killed');
    processedBody.clinicalStatus = clinicalStatus;
    
    // Animal Profile - Brain Exam
    const brainExam = [];
    if (req.body.animalBrainExamDone) brainExam.push('Brain exam done');
    if (req.body.animalNoBrainExam) brainExam.push('No Brain Exam Done');
    if (req.body.animalUnknown) brainExam.push('Unknown');
    processedBody.brainExam = brainExam;
    
    // Animal Profile - Vaccination Status
    const vaccinationStatus = [];
    if (req.body.animalImmunized) vaccinationStatus.push('Immunized');
    if (req.body.animalNotImmunized) vaccinationStatus.push('Not Immunized');
    processedBody.vaccinationStatus = vaccinationStatus;
    
    // Animal Profile - Ownership
    const ownership = [];
    if (req.body.animalPet) ownership.push('Pet');
    if (req.body.animalNeighbor) ownership.push('Neighbor');
    if (req.body.animalStray) ownership.push('Stray');
    processedBody.ownership = ownership;
    
    // Patient Immunization - DPT
    const dpt = [];
    if (req.body.dptComplete) dpt.push('Complete');
    if (req.body.dptIncomplete) dpt.push('Incomplete');
    if (req.body.dptNone) dpt.push('None');
    processedBody.dpt = dpt;
    
    // Patient Immunization - TT
    const tt = [];
    if (req.body.ttActive) tt.push('Active');
    if (req.body.ttPassive) tt.push('Passive');
    processedBody.tt = tt;
    
    // Patient Immunization - TT Dates
    const ttDates = [];
    if (req.body.tt1Date) ttDates.push(req.body.tt1Date);
    if (req.body.tt2Date) ttDates.push(req.body.tt2Date);
    if (req.body.tt3Date) ttDates.push(req.body.tt3Date);
    processedBody.ttDates = ttDates;
    
    // Current Immunization - Type
    const type = [];
    if (req.body.currentActive) type.push('Active');
    if (req.body.currentPostExposure) type.push('Post-exposure');
    if (req.body.currentPreExposure) type.push('Pre-exposure');
    if (req.body.currentPreviouslyImmunized) type.push('Previously Immunized');
    processedBody.type = type;
    
    // Current Immunization - Vaccine
    const vaccine = [];
    if (req.body.currentPvrv) vaccine.push('PVRV');
    if (req.body.currentPcec) vaccine.push('PCEC');
    if (req.body.currentId) vaccine.push('ID');
    if (req.body.currentIm) vaccine.push('IM');
    processedBody.vaccine = vaccine;
    
    // Current Immunization - Route
    const route = [];
    if (req.body.currentPassive) route.push('Passive');
    if (req.body.currentSkinTest) route.push('Skin test');
    if (req.body.currentHrig) route.push('HRIG');
    if (req.body.currentLocalInfiltration) route.push('Local Infiltration');
    processedBody.route = route;
    
    // Current Immunization - Schedule
    const schedule = [];
    if (req.body.currentStructured) schedule.push('Structured');
    if (req.body.currentUnstructured) schedule.push('Unstructured');
    processedBody.schedule = schedule;
    
    const biteCase = new BiteCase(processedBody);
    const savedBiteCase = await biteCase.save();
    
    console.log('Bite case saved successfully:', savedBiteCase);
    res.status(201).json(savedBiteCase);
  } catch (error) {
    console.error('Error creating bite case:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a bite case
router.put('/:id', async (req, res) => {
  try {
    console.log('Received request to update bite case:', req.params.id);
    console.log('Update data:', req.body);

    // Preprocess the request body
    const processedBody = {
      ...req.body,
      middleName: req.body.middleName || ''
    };
    
    // Convert boolean fields to arrays (same logic as create)
    // Type of Exposure
    const typeOfExposure = [];
    if (req.body.typeNonBite) typeOfExposure.push('NON-BITE');
    if (req.body.typeBite) typeOfExposure.push('BITE');
    processedBody.typeOfExposure = typeOfExposure;
    
    // Site of Bite
    const siteOfBite = [];
    if (req.body.headBite) siteOfBite.push('Head');
    if (req.body.faceBite) siteOfBite.push('Face');
    if (req.body.neckBite) siteOfBite.push('Neck');
    if (req.body.chestBite) siteOfBite.push('Chest');
    if (req.body.backBite) siteOfBite.push('Back');
    if (req.body.abdomenBite) siteOfBite.push('Abdomen');
    if (req.body.upperExtremitiesBite) siteOfBite.push('Upper Extremities');
    if (req.body.lowerExtremitiesBite) siteOfBite.push('Lower Extremities');
    if (req.body.othersBite) siteOfBite.push('Others');
    processedBody.siteOfBite = siteOfBite;
    
    // Nature of Injury
    const natureOfInjury = [];
    if (req.body.multipleInjuries) natureOfInjury.push('Multiple Injuries');
    if (req.body.abrasion) natureOfInjury.push('Abrasion');
    if (req.body.avulsion) natureOfInjury.push('Avulsion');
    if (req.body.burn) natureOfInjury.push('Burn');
    if (req.body.concussion) natureOfInjury.push('Concussion');
    if (req.body.contusion) natureOfInjury.push('Contusion');
    if (req.body.openWound) natureOfInjury.push('Open Wound');
    if (req.body.trauma) natureOfInjury.push('Trauma');
    if (req.body.othersInjury) natureOfInjury.push('Others');
    processedBody.natureOfInjury = natureOfInjury;
    
    // External Cause
    const externalCause = [];
    if (req.body.biteSting) externalCause.push('Bite/Sting');
    if (req.body.chemicalSubstance) externalCause.push('Chemical Substance');
    processedBody.externalCause = externalCause;
    
    // Place of Occurrence
    const placeOfOccurrence = [];
    if (req.body.placeHome) placeOfOccurrence.push('Home');
    if (req.body.placeSchool) placeOfOccurrence.push('School');
    if (req.body.placeRoad) placeOfOccurrence.push('Road');
    if (req.body.placeNeighbor) placeOfOccurrence.push('Neighbor');
    if (req.body.placeOthers) placeOfOccurrence.push('Others');
    processedBody.placeOfOccurrence = placeOfOccurrence;
    
    // Disposition
    const disposition = [];
    if (req.body.dispositionTreated) disposition.push('Treated & Sent Home');
    if (req.body.dispositionTransferred) disposition.push('Transferred to another facility/hospital');
    processedBody.disposition = disposition;
    
    // Circumstance of Bite
    const circumstanceOfBite = [];
    if (req.body.circumstanceProvoked) circumstanceOfBite.push('Provoked');
    if (req.body.circumstanceUnprovoked) circumstanceOfBite.push('Unprovoked');
    processedBody.circumstanceOfBite = circumstanceOfBite;
    
    // Animal Profile - Species
    const species = [];
    if (req.body.animalDog) species.push('Dog');
    if (req.body.animalCat) species.push('Cat');
    if (req.body.animalOthers) species.push('Others');
    processedBody.species = species;
    
    // Animal Profile - Clinical Status
    const clinicalStatus = [];
    if (req.body.animalHealthy) clinicalStatus.push('Healthy');
    if (req.body.animalSick) clinicalStatus.push('Sick');
    if (req.body.animalDied) clinicalStatus.push('Died');
    if (req.body.animalKilled) clinicalStatus.push('Killed');
    processedBody.clinicalStatus = clinicalStatus;
    
    // Animal Profile - Brain Exam
    const brainExam = [];
    if (req.body.animalBrainExamDone) brainExam.push('Brain exam done');
    if (req.body.animalNoBrainExam) brainExam.push('No Brain Exam Done');
    if (req.body.animalUnknown) brainExam.push('Unknown');
    processedBody.brainExam = brainExam;
    
    // Animal Profile - Vaccination Status
    const vaccinationStatus = [];
    if (req.body.animalImmunized) vaccinationStatus.push('Immunized');
    if (req.body.animalNotImmunized) vaccinationStatus.push('Not Immunized');
    processedBody.vaccinationStatus = vaccinationStatus;
    
    // Animal Profile - Ownership
    const ownership = [];
    if (req.body.animalPet) ownership.push('Pet');
    if (req.body.animalNeighbor) ownership.push('Neighbor');
    if (req.body.animalStray) ownership.push('Stray');
    processedBody.ownership = ownership;
    
    // Patient Immunization - DPT
    const dpt = [];
    if (req.body.dptComplete) dpt.push('Complete');
    if (req.body.dptIncomplete) dpt.push('Incomplete');
    if (req.body.dptNone) dpt.push('None');
    processedBody.dpt = dpt;
    
    // Patient Immunization - TT
    const tt = [];
    if (req.body.ttActive) tt.push('Active');
    if (req.body.ttPassive) tt.push('Passive');
    processedBody.tt = tt;
    
    // Patient Immunization - TT Dates
    const ttDates = [];
    if (req.body.tt1Date) ttDates.push(req.body.tt1Date);
    if (req.body.tt2Date) ttDates.push(req.body.tt2Date);
    if (req.body.tt3Date) ttDates.push(req.body.tt3Date);
    processedBody.ttDates = ttDates;
    
    // Current Immunization - Type
    const type = [];
    if (req.body.currentActive) type.push('Active');
    if (req.body.currentPostExposure) type.push('Post-exposure');
    if (req.body.currentPreExposure) type.push('Pre-exposure');
    if (req.body.currentPreviouslyImmunized) type.push('Previously Immunized');
    processedBody.type = type;
    
    // Current Immunization - Vaccine
    const vaccine = [];
    if (req.body.currentPvrv) vaccine.push('PVRV');
    if (req.body.currentPcec) vaccine.push('PCEC');
    if (req.body.currentId) vaccine.push('ID');
    if (req.body.currentIm) vaccine.push('IM');
    processedBody.vaccine = vaccine;
    
    // Current Immunization - Route
    const route = [];
    if (req.body.currentPassive) route.push('Passive');
    if (req.body.currentSkinTest) route.push('Skin test');
    if (req.body.currentHrig) route.push('HRIG');
    if (req.body.currentLocalInfiltration) route.push('Local Infiltration');
    processedBody.route = route;
    
    // Current Immunization - Schedule
    const schedule = [];
    if (req.body.currentStructured) schedule.push('Structured');
    if (req.body.currentUnstructured) schedule.push('Unstructured');
    processedBody.schedule = schedule;

    const updatedBiteCase = await BiteCase.findByIdAndUpdate(
      req.params.id,
      processedBody,
      { new: true, runValidators: true }
    );

    if (!updatedBiteCase) {
      return res.status(404).json({ message: 'Bite case not found' });
    }

    console.log('Bite case updated successfully:', updatedBiteCase);
    res.json(updatedBiteCase);
  } catch (error) {
    console.error('Error updating bite case:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all bite cases
router.get('/', async (req, res) => {
  try {
    const biteCases = await BiteCase.find();
    res.json(biteCases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific bite case
router.get('/:id', async (req, res) => {
  try {
    const biteCase = await BiteCase.findById(req.params.id);
    if (biteCase) {
      res.json(biteCase);
    } else {
      res.status(404).json({ message: 'Bite case not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bite cases by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    console.log('Fetching bite cases for patient ID:', req.params.patientId);
    const biteCases = await BiteCase.find({ patientId: req.params.patientId });
    console.log('Found bite cases:', biteCases);
    res.json(biteCases);
  } catch (error) {
    console.error('Error fetching bite cases:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get bite case by registration number
router.get('/registration/:registrationNumber', async (req, res) => {
  try {
    console.log('Fetching bite case by registration number:', req.params.registrationNumber);
    const biteCase = await BiteCase.findOne({ registrationNumber: req.params.registrationNumber });
    
    if (!biteCase) {
      return res.status(404).json({ message: 'Bite case not found' });
    }
    
    console.log('Found bite case:', biteCase);
    res.json(biteCase);
  } catch (error) {
    console.error('Error fetching bite case:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 

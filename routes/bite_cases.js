const express = require('express');
const router = express.Router();
const BiteCase = require('../models/BiteCase');

// Create a new bite case
router.post('/', async (req, res) => {
  try {
    console.log('Received request to create bite case:', req.body);
    console.log('Type of Exposure checkboxes:', {
      typeNonBite: req.body.typeNonBite,
      typeBite: req.body.typeBite
    });
    console.log('Site of Bite checkboxes:', {
      headBite: req.body.headBite,
      faceBite: req.body.faceBite,
      neckBite: req.body.neckBite
    });
    
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
    
    // Animal Profile - Nested Object
    const animalProfile = {
      species: []
    };
    if (req.body.animalDog) animalProfile.species.push('Dog');
    if (req.body.animalCat) animalProfile.species.push('Cat');
    if (req.body.animalOthers) animalProfile.species.push('Others');
    
    // Animal Profile - Clinical Status
    animalProfile.clinicalStatus = [];
    if (req.body.animalHealthy) animalProfile.clinicalStatus.push('Healthy');
    if (req.body.animalSick) animalProfile.clinicalStatus.push('Sick');
    if (req.body.animalDied) animalProfile.clinicalStatus.push('Died');
    if (req.body.animalKilled) animalProfile.clinicalStatus.push('Killed');
    
    // Animal Profile - Brain Exam
    animalProfile.brainExam = [];
    if (req.body.animalBrainExamDone) animalProfile.brainExam.push('Brain Exam Done');
    if (req.body.animalNoBrainExam) animalProfile.brainExam.push('No Brain Exam');
    if (req.body.animalUnknown) animalProfile.brainExam.push('Unknown');
    
    // Animal Profile - Vaccination Status
    animalProfile.vaccinationStatus = [];
    if (req.body.animalImmunized) animalProfile.vaccinationStatus.push('Immunized');
    if (req.body.animalNotImmunized) animalProfile.vaccinationStatus.push('Not Immunized');
    
    // Animal Profile - Ownership
    animalProfile.ownership = [];
    if (req.body.animalPet) animalProfile.ownership.push('Pet');
    if (req.body.animalNeighbor) animalProfile.ownership.push('Neighbor');
    if (req.body.animalStray) animalProfile.ownership.push('Stray');
    
    // Add other animal profile fields
    animalProfile.othersSpecify = req.body.animalOthersSpecify || '';
    animalProfile.vaccinationDate = req.body.animalVaccinationDate || '';
    
    processedBody.animalProfile = animalProfile;
    
    // Patient Immunization - Nested Object
    const patientImmunization = {
      dpt: []
    };
    if (req.body.dptComplete) patientImmunization.dpt.push('Complete');
    if (req.body.dptIncomplete) patientImmunization.dpt.push('Incomplete');
    if (req.body.dptNone) patientImmunization.dpt.push('None');
    
    // Patient Immunization - TT (nested object)
    patientImmunization.tt = [];
    if (req.body.ttActive) patientImmunization.tt.push('Active');
    if (req.body.ttPassive) patientImmunization.tt.push('Passive');
    
    // Patient Immunization - TT Dates
    patientImmunization.ttDates = [];
    if (req.body.tt1Date) patientImmunization.ttDates.push(req.body.tt1Date);
    if (req.body.tt2Date) patientImmunization.ttDates.push(req.body.tt2Date);
    if (req.body.tt3Date) patientImmunization.ttDates.push(req.body.tt3Date);
    
    // Add other patient immunization fields
    patientImmunization.dptYearGiven = req.body.dptYearGiven || '';
    patientImmunization.dptDosesGiven = req.body.dptDosesGiven || '';
    patientImmunization.skinTest = req.body.skinTest || false;
    patientImmunization.skinTestTime = req.body.skinTestTime || '';
    patientImmunization.skinTestReadTime = req.body.skinTestReadTime || '';
    patientImmunization.skinTestResult = req.body.skinTestResult || '';
    patientImmunization.tig = req.body.tig || false;
    patientImmunization.tigDose = req.body.tigDose || '';
    patientImmunization.tigDate = req.body.tigDate || '';
    
    processedBody.patientImmunization = patientImmunization;
    
    // Current Immunization - Nested Object
    const currentImmunization = {
      type: []
    };
    if (req.body.currentActive) currentImmunization.type.push('Active');
    if (req.body.currentPostExposure) currentImmunization.type.push('Post-exposure');
    if (req.body.currentPreExposure) currentImmunization.type.push('Pre-exposure');
    if (req.body.currentPreviouslyImmunized) currentImmunization.type.push('Previously Immunized');
    
    // Current Immunization - Vaccine
    currentImmunization.vaccine = [];
    if (req.body.currentPvrv) currentImmunization.vaccine.push('PVRV');
    if (req.body.currentPcec) currentImmunization.vaccine.push('PCEC');
    
    // Current Immunization - Route
    currentImmunization.route = [];
    if (req.body.currentId) currentImmunization.route.push('ID');
    if (req.body.currentIm) currentImmunization.route.push('IM');
    
    // Current Immunization - Schedule
    currentImmunization.schedule = [];
    if (req.body.currentStructured) currentImmunization.schedule.push('Structured');
    if (req.body.currentUnstructured) currentImmunization.schedule.push('Unstructured');
    
    // Add other current immunization fields
    currentImmunization.passive = req.body.currentPassive || false;
    currentImmunization.skinTest = req.body.currentSkinTest || false;
    currentImmunization.skinTestTime = req.body.currentSkinTestTime || '';
    currentImmunization.skinTestReadTime = req.body.currentSkinTestReadTime || '';
    currentImmunization.skinTestResult = req.body.currentSkinTestResult || '';
    currentImmunization.hrig = req.body.currentHrig || false;
    currentImmunization.hrigDose = req.body.hrigDose || '';
    currentImmunization.hrigDate = req.body.hrigDate || '';
    currentImmunization.localInfiltration = req.body.currentLocalInfiltration || false;
    currentImmunization.medicineUsed = req.body.medicineUsed || '';
    currentImmunization.branchNo = req.body.branchNo || '';
    
    processedBody.currentImmunization = currentImmunization;
    
    console.log('Final processed body arrays:', {
      typeOfExposure: processedBody.typeOfExposure,
      siteOfBite: processedBody.siteOfBite,
      natureOfInjury: processedBody.natureOfInjury,
      animalProfile: processedBody.animalProfile,
      patientImmunization: processedBody.patientImmunization,
      currentImmunization: processedBody.currentImmunization
    });
    
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
    
    // Animal Profile - Nested Object
    const animalProfile = {
      species: []
    };
    if (req.body.animalDog) animalProfile.species.push('Dog');
    if (req.body.animalCat) animalProfile.species.push('Cat');
    if (req.body.animalOthers) animalProfile.species.push('Others');
    
    // Animal Profile - Clinical Status
    animalProfile.clinicalStatus = [];
    if (req.body.animalHealthy) animalProfile.clinicalStatus.push('Healthy');
    if (req.body.animalSick) animalProfile.clinicalStatus.push('Sick');
    if (req.body.animalDied) animalProfile.clinicalStatus.push('Died');
    if (req.body.animalKilled) animalProfile.clinicalStatus.push('Killed');
    
    // Animal Profile - Brain Exam
    animalProfile.brainExam = [];
    if (req.body.animalBrainExamDone) animalProfile.brainExam.push('Brain Exam Done');
    if (req.body.animalNoBrainExam) animalProfile.brainExam.push('No Brain Exam');
    if (req.body.animalUnknown) animalProfile.brainExam.push('Unknown');
    
    // Animal Profile - Vaccination Status
    animalProfile.vaccinationStatus = [];
    if (req.body.animalImmunized) animalProfile.vaccinationStatus.push('Immunized');
    if (req.body.animalNotImmunized) animalProfile.vaccinationStatus.push('Not Immunized');
    
    // Animal Profile - Ownership
    animalProfile.ownership = [];
    if (req.body.animalPet) animalProfile.ownership.push('Pet');
    if (req.body.animalNeighbor) animalProfile.ownership.push('Neighbor');
    if (req.body.animalStray) animalProfile.ownership.push('Stray');
    
    // Add other animal profile fields
    animalProfile.othersSpecify = req.body.animalOthersSpecify || '';
    animalProfile.vaccinationDate = req.body.animalVaccinationDate || '';
    
    processedBody.animalProfile = animalProfile;
    
    // Patient Immunization - Nested Object
    const patientImmunization = {
      dpt: []
    };
    if (req.body.dptComplete) patientImmunization.dpt.push('Complete');
    if (req.body.dptIncomplete) patientImmunization.dpt.push('Incomplete');
    if (req.body.dptNone) patientImmunization.dpt.push('None');
    
    // Patient Immunization - TT (nested object)
    patientImmunization.tt = [];
    if (req.body.ttActive) patientImmunization.tt.push('Active');
    if (req.body.ttPassive) patientImmunization.tt.push('Passive');
    
    // Patient Immunization - TT Dates
    patientImmunization.ttDates = [];
    if (req.body.tt1Date) patientImmunization.ttDates.push(req.body.tt1Date);
    if (req.body.tt2Date) patientImmunization.ttDates.push(req.body.tt2Date);
    if (req.body.tt3Date) patientImmunization.ttDates.push(req.body.tt3Date);
    
    // Add other patient immunization fields
    patientImmunization.dptYearGiven = req.body.dptYearGiven || '';
    patientImmunization.dptDosesGiven = req.body.dptDosesGiven || '';
    patientImmunization.skinTest = req.body.skinTest || false;
    patientImmunization.skinTestTime = req.body.skinTestTime || '';
    patientImmunization.skinTestReadTime = req.body.skinTestReadTime || '';
    patientImmunization.skinTestResult = req.body.skinTestResult || '';
    patientImmunization.tig = req.body.tig || false;
    patientImmunization.tigDose = req.body.tigDose || '';
    patientImmunization.tigDate = req.body.tigDate || '';
    
    processedBody.patientImmunization = patientImmunization;
    
    // Current Immunization - Nested Object
    const currentImmunization = {
      type: []
    };
    if (req.body.currentActive) currentImmunization.type.push('Active');
    if (req.body.currentPostExposure) currentImmunization.type.push('Post-exposure');
    if (req.body.currentPreExposure) currentImmunization.type.push('Pre-exposure');
    if (req.body.currentPreviouslyImmunized) currentImmunization.type.push('Previously Immunized');
    
    // Current Immunization - Vaccine
    currentImmunization.vaccine = [];
    if (req.body.currentPvrv) currentImmunization.vaccine.push('PVRV');
    if (req.body.currentPcec) currentImmunization.vaccine.push('PCEC');
    
    // Current Immunization - Route
    currentImmunization.route = [];
    if (req.body.currentId) currentImmunization.route.push('ID');
    if (req.body.currentIm) currentImmunization.route.push('IM');
    
    // Current Immunization - Schedule
    currentImmunization.schedule = [];
    if (req.body.currentStructured) currentImmunization.schedule.push('Structured');
    if (req.body.currentUnstructured) currentImmunization.schedule.push('Unstructured');
    
    // Add other current immunization fields
    currentImmunization.passive = req.body.currentPassive || false;
    currentImmunization.skinTest = req.body.currentSkinTest || false;
    currentImmunization.skinTestTime = req.body.currentSkinTestTime || '';
    currentImmunization.skinTestReadTime = req.body.currentSkinTestReadTime || '';
    currentImmunization.skinTestResult = req.body.currentSkinTestResult || '';
    currentImmunization.hrig = req.body.currentHrig || false;
    currentImmunization.hrigDose = req.body.hrigDose || '';
    currentImmunization.hrigDate = req.body.hrigDate || '';
    currentImmunization.localInfiltration = req.body.currentLocalInfiltration || false;
    currentImmunization.medicineUsed = req.body.medicineUsed || '';
    currentImmunization.branchNo = req.body.branchNo || '';
    
    processedBody.currentImmunization = currentImmunization;

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

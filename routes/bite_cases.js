const express = require('express');
const router = express.Router();
const BiteCase = require('../models/BiteCase');

// Create a new bite case
router.post('/', async (req, res) => {
  try {
    console.log('Received request to create bite case:', req.body);
    console.log('Backend create - PhilHealth No received:', req.body.philhealthNo);
    console.log('Backend create - Management object received:', req.body.management);
    console.log('Type of Exposure checkboxes:', {
      typeNonBite: req.body.typeNonBite,
      typeBite: req.body.typeBite
    });
    console.log('Site of Bite checkboxes:', {
      headBite: req.body.headBite,
      faceBite: req.body.faceBite,
      neckBite: req.body.neckBite
    });
    console.log('Management checkboxes:', {
      washingWoundYes: req.body.washingWoundYes,
      washingWoundNo: req.body.washingWoundNo,
      category1: req.body.category1,
      category2: req.body.category2,
      category3: req.body.category3
    });
    
    // Preprocess the request body
    const processedBody = {
      ...req.body,
      middleName: req.body.middleName || '',
      philhealthNo: req.body.philhealthNo || ''
    };
    
    // Use array data from frontend if available, otherwise convert boolean fields to arrays
    // Type of Exposure
    if (req.body.typeOfExposure !== undefined) {
      processedBody.typeOfExposure = req.body.typeOfExposure;
    } else {
      const typeOfExposure = [];
      if (req.body.typeNonBite) typeOfExposure.push('NON-BITE');
      if (req.body.typeBite) typeOfExposure.push('BITE');
      processedBody.typeOfExposure = typeOfExposure;
    }
    
    // Site of Bite
    if (req.body.siteOfBite !== undefined) {
      processedBody.siteOfBite = req.body.siteOfBite;
    } else {
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
    }
    
    // Nature of Injury
    if (req.body.natureOfInjury !== undefined) {
      processedBody.natureOfInjury = req.body.natureOfInjury;
    } else {
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
    }
    
    // Add burn and injury details
    processedBody.burnDegree = req.body.burnDegree || 1;
    processedBody.burnSite = req.body.burnSite || '';
    processedBody.othersInjuryDetails = req.body.othersInjuryDetails || '';
    
    // External Cause - Use array data directly
    processedBody.externalCause = req.body.externalCause || [];
    
    // Add external cause details
    processedBody.biteStingDetails = req.body.biteStingDetails || '';
    processedBody.chemicalSubstanceDetails = req.body.chemicalSubstanceDetails || '';
    
    // Place of Occurrence - Use array data directly
    processedBody.placeOfOccurrence = req.body.placeOfOccurrence || [];
    
    // Add place of occurrence details
    processedBody.placeOthersDetails = req.body.placeOthersDetails || '';
    
    // Disposition - Use array data directly
    processedBody.disposition = req.body.disposition || [];
    
    // Add disposition details
    processedBody.transferredTo = req.body.transferredTo || '';
    
    // Circumstance of Bite - Use array data directly
    processedBody.circumstanceOfBite = req.body.circumstanceOfBite || [];
    
    // Animal Profile - Use nested object data directly
    processedBody.animalProfile = req.body.animalProfile || {};
    
    // Patient Immunization - Use nested object data directly
    processedBody.patientImmunization = req.body.patientImmunization || {};
    
    // Current Immunization - Use nested object data directly
    processedBody.currentImmunization = req.body.currentImmunization || {};
    
    // Management - Use nested object data directly (same as update route)
    processedBody.management = req.body.management || {};

    // Ensure initiallyAssessedBy is never null
    processedBody.initiallyAssessedBy = (req.body.initiallyAssessedBy === null || req.body.initiallyAssessedBy === undefined)
      ? ''
      : req.body.initiallyAssessedBy;

    console.log('Backend received array data:', {
      typeOfExposure: req.body.typeOfExposure,
      siteOfBite: req.body.siteOfBite,
      natureOfInjury: req.body.natureOfInjury,
      externalCause: req.body.externalCause,
      placeOfOccurrence: req.body.placeOfOccurrence,
      disposition: req.body.disposition,
      management: req.body.management
    });
    
    console.log('Final processed body arrays:', {
      typeOfExposure: processedBody.typeOfExposure,
      siteOfBite: processedBody.siteOfBite,
      natureOfInjury: processedBody.natureOfInjury,
      externalCause: processedBody.externalCause,
      placeOfOccurrence: processedBody.placeOfOccurrence,
      disposition: processedBody.disposition,
      animalProfile: processedBody.animalProfile,
      patientImmunization: processedBody.patientImmunization,
      currentImmunization: processedBody.currentImmunization,
      management: processedBody.management
    });
    
    console.log('Raw boolean values being processed:');
    console.log('typeNonBite:', req.body.typeNonBite, 'typeBite:', req.body.typeBite);
    console.log('headBite:', req.body.headBite, 'faceBite:', req.body.faceBite);
    console.log('washingWoundYes:', req.body.washingWoundYes, 'washingWoundNo:', req.body.washingWoundNo);
    
    const biteCase = new BiteCase(processedBody);
    const savedBiteCase = await biteCase.save();
    
    console.log('Bite case saved successfully:', savedBiteCase);
    console.log('Backend create - PhilHealth No saved:', savedBiteCase.philhealthNo);
    console.log('Backend create - Management object saved:', savedBiteCase.management);
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
    console.log('Backend received philhealthNo:', req.body.philhealthNo);

    // Preprocess the request body
    const processedBody = {
      ...req.body,
      middleName: req.body.middleName || '',
      philhealthNo: req.body.philhealthNo || ''
    };
    console.log('Backend processed philhealthNo:', processedBody.philhealthNo);
    console.log('Backend received management:', req.body.management);
    
    // Use array data directly from frontend
    // Type of Exposure - Use array data directly
    processedBody.typeOfExposure = req.body.typeOfExposure || [];
    console.log('Backend received typeOfExposure:', req.body.typeOfExposure);
    
    // Site of Bite - Use array data directly
    processedBody.siteOfBite = req.body.siteOfBite || [];
    console.log('Backend received siteOfBite:', req.body.siteOfBite);
    
    // Nature of Injury - Use array data directly
    processedBody.natureOfInjury = req.body.natureOfInjury || [];
    console.log('Backend received natureOfInjury:', req.body.natureOfInjury);
    
    // Add burn and injury details
    processedBody.burnDegree = req.body.burnDegree || 1;
    processedBody.burnSite = req.body.burnSite || '';
    processedBody.othersInjuryDetails = req.body.othersInjuryDetails || '';
    
    // External Cause - Use array data directly
    processedBody.externalCause = req.body.externalCause || [];
    
    // Add external cause details
    processedBody.biteStingDetails = req.body.biteStingDetails || '';
    processedBody.chemicalSubstanceDetails = req.body.chemicalSubstanceDetails || '';
    
    // Place of Occurrence - Use array data directly
    processedBody.placeOfOccurrence = req.body.placeOfOccurrence || [];
    
    // Add place of occurrence details
    processedBody.placeOthersDetails = req.body.placeOthersDetails || '';
    
    // Disposition - Use array data directly
    processedBody.disposition = req.body.disposition || [];
    
    // Add disposition details
    processedBody.transferredTo = req.body.transferredTo || '';
    
    // Circumstance of Bite - Use array data directly
    processedBody.circumstanceOfBite = req.body.circumstanceOfBite || [];
    
    // Animal Profile - Use nested object data directly
    processedBody.animalProfile = req.body.animalProfile || {};
    
    // Patient Immunization - Use nested object data directly
    processedBody.patientImmunization = req.body.patientImmunization || {};
    
    // Current Immunization - Use nested object data directly
    processedBody.currentImmunization = req.body.currentImmunization || {};
    
    // Management - Use nested object data directly
    processedBody.management = req.body.management || {};
    console.log('Backend received management object:', req.body.management);

    console.log('Final processed body arrays:', {
      typeOfExposure: processedBody.typeOfExposure,
      siteOfBite: processedBody.siteOfBite,
      natureOfInjury: processedBody.natureOfInjury,
      externalCause: processedBody.externalCause,
      placeOfOccurrence: processedBody.placeOfOccurrence,
      disposition: processedBody.disposition,
      circumstanceOfBite: processedBody.circumstanceOfBite,
      management: processedBody.management
    });

    const updatedBiteCase = await BiteCase.findByIdAndUpdate(
      req.params.id,
      processedBody,
      { new: true, runValidators: true }
    );

    if (!updatedBiteCase) {
      return res.status(404).json({ message: 'Bite case not found' });
    }

    console.log('Bite case updated successfully:', updatedBiteCase);
    console.log('Returned philhealthNo:', updatedBiteCase.philhealthNo);
    console.log('Returned management:', updatedBiteCase.management);
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

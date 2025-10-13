const express = require('express');
const router = express.Router();
const BiteCase = require('../models/BiteCase');
const AuditTrail = require('../models/AuditTrail');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

// Resolve actor (staff or patient) from Authorization header or fallback headers
async function resolveActor(req) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const role = (decoded.role || '').toLowerCase();
        if (role === 'staff') {
          const staff = await Staff.findOne({ staffId: decoded.userId });
          if (staff) {
            return {
              role: 'Staff',
              firstName: staff.firstName,
              middleName: staff.middleName || '',
              lastName: staff.lastName,
              staffID: staff.staffId,
              patientID: null,
              centerName: staff.officeAddress || '',
            };
          }
        } else if (role === 'patient') {
          const patient = await Patient.findOne({ patientId: decoded.userId });
          if (patient) {
            return {
              role: 'Patient',
              firstName: patient.firstName,
              middleName: patient.middleName || '',
              lastName: patient.lastName,
              staffID: null,
              patientID: patient.patientId,
              centerName: patient.barangay || '',
            };
          }
        }
      } catch (e) {
        // ignore token errors; fall back to headers
      }
    }

    // Fallback via custom headers (best-effort)
    const headerName = (req.headers['x-staff-name'] || '').toString();
    const headerCenter = (req.headers['x-staff-center'] || '').toString();
    if (headerName) {
      const parts = headerName.split(' ');
      return {
        role: 'Staff',
        firstName: parts[0] || '',
        middleName: parts.length === 3 ? parts[1] : '',
        lastName: parts.length > 1 ? parts[parts.length - 1] : '',
        staffID: null,
        patientID: null,
        centerName: headerCenter || '',
      };
    }

    return null;
  } catch (_e) {
    return null;
  }
}

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

    // Ensure initiallyAssessedBy is populated - prefer body, fallback to headers, else empty
    console.log('Create route - initiallyAssessedBy (raw):', req.body.initiallyAssessedBy);
    let initialAssessor = req.body.initiallyAssessedBy;
    if (!initialAssessor || initialAssessor === '""') {
      // Accept staff identity via headers when mobile/web sends it
      const headerName = req.headers['x-staff-name'] || '';
      if (headerName && typeof headerName === 'string') {
        initialAssessor = headerName;
      }
    }
    processedBody.initiallyAssessedBy = initialAssessor || '';
    console.log('Create route - initiallyAssessedBy (processed):', processedBody.initiallyAssessedBy);

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
    // Write audit trail: Created bite case
    try {
      const actor = await resolveActor(req);
      await AuditTrail.create({
        role: actor?.role || 'Staff',
        firstName: actor?.firstName || '',
        middleName: actor?.middleName || '',
        lastName: actor?.lastName || '',
        centerName: actor?.centerName || (processedBody.center || ''),
        action: 'Created bite case',
        patientName: [processedBody.firstName, processedBody.middleName, processedBody.lastName].filter(Boolean).join(' ').trim(),
        patientID: processedBody.patientId || null,
        staffID: actor?.staffID || null,
      });
    } catch (auditErr) {
      console.error('Failed to write audit for create bite case:', auditErr);
    }

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
    // Load existing document to preserve unspecified fields
    const existing = await BiteCase.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Bite case not found' });
    }

    // Build $set update only for fields that are explicitly provided
    const update = {};
    const has = (k) => Object.prototype.hasOwnProperty.call(req.body, k);

    // Simple scalar fields
    [
      'patientId','registrationNumber','philhealthNo','dateRegistered','arrivalDate','arrivalTime',
      'firstName','middleName','lastName','civilStatus','birthdate','birthplace','nationality','religion',
      'occupation','contactNo','houseNo','street','barangay','subdivision','city','province','zipCode',
      'age','weight','sex','center','animalStatus','remarks','status','othersBiteSpecify','burnDegree','burnSite',
      'othersInjuryDetails','biteStingDetails','chemicalSubstanceDetails','placeOthersDetails','transferredTo','typeOfProphylaxis',
      'exposureDate','exposurePlace','exposureType','exposureSource','exposureCategory','genericName','brandName','route','lastArn','completed','tt'
    ].forEach((field) => { if (has(field)) update[field] = req.body[field]; });

    // Arrays: only update if provided with non-empty array to avoid unintended clearing
    ['typeOfExposure','siteOfBite','natureOfInjury','externalCause','placeOfOccurrence','disposition','circumstanceOfBite','scheduleDates']
      .forEach((field) => {
        if (has(field)) {
          const val = req.body[field];
          if (Array.isArray(val) && val.length > 0) {
            update[field] = val;
          }
        }
      });

    // Nested objects: animalProfile, patientImmunization, currentImmunization, management
    const mergeNested = (root) => {
      if (has(root) && req.body[root] && typeof req.body[root] === 'object') {
        Object.keys(req.body[root]).forEach((k) => {
          update[`${root}.${k}`] = req.body[root][k];
        });
      }
    };
    mergeNested('animalProfile');
    mergeNested('patientImmunization');
    mergeNested('currentImmunization');
    mergeNested('management');

    // Ensure initiallyAssessedBy is only set when provided or from header (never blank out)
    if (has('initiallyAssessedBy')) {
      const val = (req.body.initiallyAssessedBy || '').toString().trim();
      if (val) update['initiallyAssessedBy'] = val;
    } else {
      const headerName = (req.headers['x-staff-name'] || '').toString().trim();
      if (headerName) update['initiallyAssessedBy'] = headerName;
    }

    // Track finalAssessedBy: prefer body when provided, else header; do not blank out
    if (has('finalAssessedBy')) {
      const val = (req.body.finalAssessedBy || '').toString().trim();
      if (val) update['finalAssessedBy'] = val;
    } else {
      const headerName = (req.headers['x-staff-name'] || '').toString().trim();
      if (headerName) update['finalAssessedBy'] = headerName;
    }

    console.log('Applying $set update keys:', Object.keys(update));

    // Determine if meaningful fields actually change before writing audit entries
    const nonMeaningfulFields = new Set([
      'initiallyAssessedBy',
      'finalAssessedBy',
      'updatedAt',
    ]);
    const updateKeys = Object.keys(update).filter((k) => !nonMeaningfulFields.has(k));
    let meaningfulChanged = false;
    try {
      for (const key of updateKeys) {
        const existingVal = existing.get(key);
        const newVal = update[key];
        // Simple deep compare via JSON for nested structures
        const a = typeof existingVal === 'object' ? JSON.stringify(existingVal) : existingVal;
        const b = typeof newVal === 'object' ? JSON.stringify(newVal) : newVal;
        if (a !== b) {
          meaningfulChanged = true;
          break;
        }
      }
    } catch (cmpErr) {
      console.log('Compare update vs existing failed, assuming changed:', cmpErr?.message);
      meaningfulChanged = true;
    }

    const updatedBiteCase = await BiteCase.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedBiteCase) {
      return res.status(404).json({ message: 'Bite case not found' });
    }

    console.log('Bite case updated successfully:', updatedBiteCase);
    console.log('Returned philhealthNo:', updatedBiteCase.philhealthNo);
    console.log('Returned management:', updatedBiteCase.management);
    // Write audit trail: Updated bite case (only if meaningful change)
    if (meaningfulChanged) {
      try {
        const actor = await resolveActor(req);
        await AuditTrail.create({
          role: actor?.role || 'Staff',
          firstName: actor?.firstName || '',
          middleName: actor?.middleName || '',
          lastName: actor?.lastName || '',
          centerName: actor?.centerName || (update.center || existing.center || ''),
          action: 'Updated bite case',
          patientName: [existing.firstName, existing.middleName, existing.lastName].filter(Boolean).join(' ').trim(),
          patientID: existing?.patientId || null,
          staffID: actor?.staffID || null,
        });
      } catch (auditErr) {
        console.error('Failed to write audit for update bite case:', auditErr);
      }
    } else {
      console.log('No meaningful changes detected; skipping update audit log.');
    }

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

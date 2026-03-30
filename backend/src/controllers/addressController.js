const { validationResult } = require('express-validator');
const prismaAddressService = require('../services/prismaAddressService');

const getValidationErrors = (req) => {
  if (Array.isArray(req?._validationErrors)) {
    return {
      isEmpty: () => req._validationErrors.length === 0,
      array: () => req._validationErrors,
    };
  }

  return validationResult(req);
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await prismaAddressService.getByUser(req.user.id);
    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: { addresses },
    });
  } catch (err) {
    console.error('getAddresses error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addAddress = async (req, res) => {
  const errors = getValidationErrors(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const address = await prismaAddressService.createAddress({
      userId: req.user.id,
      label: req.body.label?.trim() || null,
      line1: req.body.line1.trim(),
      line2: req.body.line2?.trim() || null,
      city: req.body.city.trim(),
      state: req.body.state?.trim() || null,
      postalCode: req.body.postal_code?.trim() || null,
      isDefault: Boolean(req.body.is_default),
    });

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address },
    });
  } catch (err) {
    console.error('addAddress error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const editAddress = async (req, res) => {
  const errors = getValidationErrors(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const payload = {
      label: req.body.label?.trim() || null,
      line1: req.body.line1?.trim(),
      line2: req.body.line2?.trim() || null,
      city: req.body.city?.trim(),
      state: req.body.state?.trim() || null,
      postalCode: req.body.postal_code?.trim() || null,
      isDefault: typeof req.body.is_default === 'boolean' ? req.body.is_default : undefined,
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );

    const address = await prismaAddressService.updateAddress({
      addressId: req.params.addressId,
      userId: req.user.id,
      payload: cleanedPayload,
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: { address },
    });
  } catch (err) {
    console.error('editAddress error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeAddress = async (req, res) => {
  const errors = getValidationErrors(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const deleted = await prismaAddressService.deleteAddress({
      addressId: req.params.addressId,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (err) {
    console.error('removeAddress error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  editAddress,
  removeAddress,
};

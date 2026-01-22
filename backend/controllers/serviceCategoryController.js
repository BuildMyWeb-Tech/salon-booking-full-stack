import ServiceCategory from '../models/ServiceCategory.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * GET all service categories
 */
const getAllServices = async (req, res) => {
  try {
    const services = await ServiceCategory.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

/**
 * CREATE new service category
 */
const createService = async (req, res) => {
  try {
    const { name, description, basePrice } = req.body;

    if (!name || !description || !basePrice) {
      return res.json({
        success: false,
        message: 'Name, description and base price are required'
      });
    }

    let image = '';

    // ✅ Upload image to Cloudinary (same pattern as userController)
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: 'services'
      });
      image = uploadResult.secure_url;
    }

    const service = new ServiceCategory({
      name,
      description,
      basePrice,
      image
    });

    await service.save();

    res.json({
      success: true,
      message: 'Service created successfully',
      service
    });

  } catch (error) {
    console.error('Error creating service:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET single service by ID
 */
const getServiceById = async (req, res) => {
  try {
    const service = await ServiceCategory.findById(req.params.id);

    if (!service) {
      return res.json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      service
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

/**
 * UPDATE service category
 */
const updateService = async (req, res) => {
  try {
    const { name, description, basePrice } = req.body;
    const serviceId = req.params.id;

    const updateData = {
      name,
      description,
      basePrice
    };

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: 'services'
      });
      updateData.image = uploadResult.secure_url;
    }

    const updatedService = await ServiceCategory.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true }
    );

    if (!updatedService) {
      return res.json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE service category
 */
const deleteService = async (req, res) => {
  try {
    const service = await ServiceCategory.findById(req.params.id);

    if (!service) {
      return res.json({
        success: false,
        message: 'Service not found'
      });
    }

    // ❌ No Cloudinary deletion required unless you store public_id
    await ServiceCategory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};



export {
  getAllServices,
  createService,
  getServiceById,
  updateService,
  deleteService
};

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { GearService } from './gear.service';

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const result = await GearService.createGearInDB(providerId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Gear listing created successfully',
    data: result,
  });
});

const getAllGears = catchAsync(async (req: Request, res: Response) => {
  const result = await GearService.getAllGearsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gear items retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GearService.getSingleGearFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gear item retrieved successfully',
    data: result,
  });
});

const getMyGearListings = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const result = await GearService.getMyGearListingsFromDB(providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider gear listings retrieved successfully',
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await GearService.updateGearInDB(id, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gear listing updated successfully',
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await GearService.deleteGearFromDB(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gear listing deleted successfully',
    data: result,
  });
});

export const GearController = {
  createGear,
  getAllGears,
  getSingleGear,
  getMyGearListings,
  updateGear,
  deleteGear,
};

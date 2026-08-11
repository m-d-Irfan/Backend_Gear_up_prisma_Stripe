import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const { id } = req.params;
  const { status } = req.body;

  const result = await UserService.updateUserStatusInDB(adminId, id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User status updated to ${status} successfully`,
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const { id } = req.params;
  const { role } = req.body;

  const result = await UserService.updateUserRoleInDB(adminId, id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User role updated to ${role} successfully`,
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const { id } = req.params;

  const result = await UserService.deleteUserFromDB(adminId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User account deleted successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const result = await UserService.updateUserProfileInDB(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  updateProfile,
};


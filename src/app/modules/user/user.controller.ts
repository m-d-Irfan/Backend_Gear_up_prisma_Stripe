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
  const { id } = req.params;
  const { status } = req.body;

  const result = await UserService.updateUserStatusInDB(id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User status updated to ${status} successfully`,
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  updateUserStatus,
};

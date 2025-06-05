import { Response } from "express";

interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default class ApiResponse {
  public static success(
    res: Response,
    data: any,
    message: string,
    pagination?: IPagination,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
} 
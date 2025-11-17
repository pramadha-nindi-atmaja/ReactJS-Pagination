import prisma from "../utils/client.js";

/**
 * Generate reusable search filter
 */
const buildSearchFilter = (search) => ({
  OR: ["first_name", "last_name", "email", "gender", "ip_address"].map(
    (field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    })
  ),
});

/**
 * Validate sort fields for security
 */
const allowedSortFields = ["id", "first_name", "last_name", "email", "gender", "ip_address"];
const allowedDirections = ["asc", "desc"];

/**
 * Pagination: Get all personal data
 */
export const getPersonaldata = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortField = allowedSortFields.includes(req.query.sortField)
      ? req.query.sortField
      : "id";
    const sortDirection = allowedDirections.includes(req.query.sortDirection)
      ? req.query.sortDirection
      : "desc";

    const filters = buildSearchFilter(search);
    const offset = page * limit;
    const orderBy = { [sortField]: sortDirection };
    const timestamp = new Date().toISOString();

    const totalRows = await prisma.personaldata.count({ where: filters });
    const totalPages = Math.ceil(totalRows / limit);

    const result = await prisma.personaldata.findMany({
      where: filters,
      skip: offset,
      take: limit,
      orderBy,
    });

    return res.status(200).json({
      result,
      page,
      limit,
      totalRows,
      totalPages,
      metadata: {
        timestamp,
        sortField,
        sortDirection,
        query: search,
        executionTime: `${Date.now() - req.startTime}ms`,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch personal data",
      error: error.message,
    });
  }
};

/**
 * Get single record by ID
 */
export const getPersonalById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const data = await prisma.personaldata.findUnique({ where: { id } });

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Personal data not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch personal data by ID",
      error: error.message,
    });
  }
};

/**
 * Export personal data (limited by maxExport)
 */
export const exportPersonalData = async (req, res) => {
  try {
    const search = req.query.search || "";
    const maxExport = parseInt(req.query.maxExport) || 1000;

    const filters = buildSearchFilter(search);

    const data = await prisma.personaldata.findMany({
      where: filters,
      take: maxExport,
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      status: "success",
      totalExported: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to export personal data",
      error: error.message,
    });
  }
};

/**
 * Middleware to track request start time
 */
export const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

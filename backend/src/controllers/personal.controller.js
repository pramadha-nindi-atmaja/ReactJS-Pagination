import prisma from "../utils/client.js";

export const getPersonaldata = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortField = req.query.sortField || "id";
    const sortDirection = req.query.sortDirection || "desc";
    const offset = page * limit;

    // Validate sort field to prevent injection
    const validSortFields = ["id", "first_name", "last_name", "email", "gender", "ip_address"];
    const finalSortField = validSortFields.includes(sortField) ? sortField : "id";
    
    // Validate sort direction
    const finalSortDirection = ["asc", "desc"].includes(sortDirection) ? sortDirection : "desc";
    
    // Create dynamic orderBy object
    const orderBy = {
      [finalSortField]: finalSortDirection,
    };

    const totalRows = await prisma.personaldata.count({
      where: {
        OR: [
          {
            first_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            last_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            gender: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ip_address: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
    });
    const totalPages = Math.ceil(totalRows / limit);
    const response = await prisma.personaldata.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            last_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            gender: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ip_address: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      skip: offset,
      take: limit,
      orderBy: orderBy,
    });
    
    // Add execution timestamp and query metadata
    const timestamp = new Date().toISOString();
    
    return res.status(200).json({
      result: response,
      page,
      limit,
      totalRows,
      totalPages,
      metadata: {
        timestamp,
        sortField: finalSortField,
        sortDirection: finalSortDirection,
        query: search,
        executionTime: `${Date.now() - req.startTime}ms`,
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch personal data",
      error: error.message
    });
  }
};

// Get single record by ID
export const getPersonalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const personalData = await prisma.personaldata.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!personalData) {
      return res.status(404).json({
        status: "error",
        message: "Personal data not found"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: personalData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch personal data by ID",
      error: error.message
    });
  }
};

// Export data - handles larger datasets
export const exportPersonalData = async (req, res) => {
  try {
    const search = req.query.search || "";
    const maxExport = parseInt(req.query.maxExport) || 1000; // Limit export size
    
    const response = await prisma.personaldata.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            last_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            gender: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ip_address: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      take: maxExport,
      orderBy: {
        id: "desc",
      },
    });
    
    return res.status(200).json({
      status: "success",
      totalExported: response.length,
      data: response
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to export personal data",
      error: error.message
    });
  }
};

// Middleware to track request start time
export const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};
const mongoose = require("mongoose");

const Task = require("../../models/taskModel");

class ReportController {
  // DAILY / WEEKLY SUMMARY
  static taskSummary = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const result = await Task.aggregate([
        {
          $match: {
            userId,

            dueDate: {
              $gte: start,
              $lte: end,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalTasks: {
              $sum: 1,
            },

            completedTasks: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "Completed"],
                  },
                  1,
                  0,
                ],
              },
            },

            pendingTasks: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "Pending"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $project: {
            _id: 0,
            totalTasks: 1,
            completedTasks: 1,
            pendingTasks: 1,
          },
        },
      ]);

      const summary = result[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };

      return res.status(200).json({
        success: true,
        summary,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Failed to generate summary",
      });
    }
  };

  // TASK STATISTICS
  static taskStatistics = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const result = await Task.aggregate([
        {
          $match: {
            userId,
          },
        },

        {
          $group: {
            _id: null,

            totalTasks: {
              $sum: 1,
            },

            completedTasks: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "Completed"],
                  },
                  1,
                  0,
                ],
              },
            },

            totalCompletionTime: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$status", "Completed"],
                      },
                      {
                        $ne: ["$completedAt", null],
                      },
                    ],
                  },

                  {
                    $subtract: ["$completedAt", "$createdAt"],
                  },

                  0,
                ],
              },
            },

            completedCountForAverage: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$status", "Completed"],
                      },
                      {
                        $ne: ["$completedAt", null],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $project: {
            _id: 0,

            totalTasks: 1,

            completedTasks: 1,

            pendingTasks: {
              $subtract: ["$totalTasks", "$completedTasks"],
            },

            completionRate: {
              $cond: [
                {
                  $gt: ["$totalTasks", 0],
                },

                {
                  $multiply: [
                    {
                      $divide: ["$completedTasks", "$totalTasks"],
                    },
                    100,
                  ],
                },

                0,
              ],
            },

            averageCompletionTimeHours: {
              $cond: [
                {
                  $gt: ["$completedCountForAverage", 0],
                },

                {
                  $divide: [
                    "$totalCompletionTime",
                    {
                      $multiply: ["$completedCountForAverage", 1000 * 60 * 60],
                    },
                  ],
                },

                0,
              ],
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,

        statistics: result[0] || {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          completionRate: 0,
          averageCompletionTimeHours: 0,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Failed to generate statistics",
      });
    }
  };

  // COMPLETION OVER TIME
  static completionOverTime = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const { startDate, endDate } = req.query;

      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const result = await Task.aggregate([
        {
          $match: {
            userId,

            createdAt: {
              $gte: start,
              $lte: end,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            totalTasks: {
              $sum: 1,
            },

            completedTasks: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "Completed"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $project: {
            _id: 0,

            date: "$_id",

            totalTasks: 1,

            completedTasks: 1,

            completionRate: {
              $multiply: [
                {
                  $cond: [
                    {
                      $gt: ["$totalTasks", 0],
                    },

                    {
                      $divide: ["$completedTasks", "$totalTasks"],
                    },

                    0,
                  ],
                },

                100,
              ],
            },
          },
        },

        {
          $sort: {
            date: 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        statistics: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate completion statistics",
      });
    }
  };
}

module.exports = ReportController;

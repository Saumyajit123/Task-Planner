const mongoose = require("mongoose");

const Task = require("../../models/taskModel");

class ReportEJSController {
  // SUMMARY
  static summary = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const now = new Date();

      const start = new Date(now);

      start.setHours(0, 0, 0, 0);

      const end = new Date(start);

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
      ]);

      const summary = result[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };

      return res.render("reports/summary", {
        summary,
      });
    } catch (error) {
      return res.status(500).send("Failed to generate summary");
    }
  };

  // STATISTICS
  static statistics = async (req, res) => {
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

            completedCount: {
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

            averageCompletionTimeHours: {
              $cond: [
                {
                  $gt: ["$completedCount", 0],
                },

                {
                  $divide: [
                    "$totalCompletionTime",
                    {
                      $multiply: ["$completedCount", 3600000],
                    },
                  ],
                },

                0,
              ],
            },
          },
        },
      ]);

      const statistics = result[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        averageCompletionTimeHours: 0,
      };

      return res.render("reports/statistics", {
        statistics,
      });
    } catch (error) {
      return res.status(500).send("Failed to generate statistics");
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

      return res.render("reports/completion", {
        statistics: result,
        startDate,
        endDate,
      });
    } catch (error) {
      return res.status(500).send("Failed to generate report");
    }
  };
}

module.exports = ReportEJSController;

const Label = require("../../models/labelModel");
const Task = require("../../models/taskModel");

class LabelController {
  // ADD LABEL
  static addLabel = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name } = req.body;

      const existing = await Label.findOne({
        userId,
        name,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Label already exists",
        });
      }

      const label = await Label.create({
        userId,
        name,
      });

      return res.status(201).json({
        success: true,
        message: "Label created successfully",
        label,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create label",
      });
    }
  };

  // EDIT LABEL
  static editLabel = async (req, res) => {
    try {
      const { labelId } = req.params;
      const userId = req.user.userId;

      const label = await Label.findOneAndUpdate(
        {
          _id: labelId,
          userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!label) {
        return res.status(404).json({
          success: false,
          message: "Label not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Label updated successfully",
        label,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update label",
      });
    }
  };

  // DELETE LABEL
  static deleteLabel = async (req, res) => {
    try {
      const { labelId } = req.params;
      const userId = req.user.userId;

      const label = await Label.findOneAndDelete({
        _id: labelId,
        userId,
      });

      if (!label) {
        return res.status(404).json({
          success: false,
          message: "Label not found",
        });
      }

      // Remove deleted label from tasks
      await Task.updateMany(
        {
          userId,
          labels: labelId,
        },
        {
          $pull: {
            labels: labelId,
          },
        },
      );

      return res.status(200).json({
        success: true,
        message: "Label deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete label",
      });
    }
  };

  // LIST LABELS
  static listLabels = async (req, res) => {
    try {
      const labels = await Label.find({
        userId: req.user.userId,
      }).sort({
        name: 1,
      });

      return res.status(200).json({
        success: true,
        count: labels.length,
        labels,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch labels",
      });
    }
  };
}

module.exports = LabelController;

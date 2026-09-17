const Label = require("../../models/labelModel");
const Task = require("../../models/taskModel");

class LabelEJSController {
  // LIST
  static listLabels = async (req, res) => {
    try {
      const labels = await Label.find({
        userId: req.user.userId,
      }).sort({
        name: 1,
      });

      return res.render("labels/list", {
        labels,
      });
    } catch (error) {
      return res.status(500).send("Failed to fetch labels");
    }
  };

  // CREATE PAGE
  static createPage = async (req, res) => {
    return res.render("labels/create", {
      error: null,
    });
  };

  // CREATE
  static createLabel = async (req, res) => {
    try {
      const { name } = req.body;

      const existing = await Label.findOne({
        userId: req.user.userId,
        name,
      });

      if (existing) {
        return res.status(409).render("labels/create", {
          error: "Label already exists",
        });
      }

      await Label.create({
        userId: req.user.userId,
        name,
      });

      return res.redirect("/ui/labels");
    } catch (error) {
      return res.status(500).send("Failed to create label");
    }
  };

  // EDIT PAGE
  static editPage = async (req, res) => {
    try {
      const label = await Label.findOne({
        _id: req.params.labelId,
        userId: req.user.userId,
      });

      if (!label) {
        return res.status(404).send("Label not found");
      }

      return res.render("labels/edit", {
        label,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load label");
    }
  };

  // EDIT
  static editLabel = async (req, res) => {
    try {
      const label = await Label.findOneAndUpdate(
        {
          _id: req.params.labelId,
          userId: req.user.userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!label) {
        return res.status(404).send("Label not found");
      }

      return res.redirect("/ui/labels");
    } catch (error) {
      return res.status(500).send("Failed to update label");
    }
  };

  // DELETE
  static deleteLabel = async (req, res) => {
    try {
      const label = await Label.findOneAndDelete({
        _id: req.params.labelId,
        userId: req.user.userId,
      });

      if (!label) {
        return res.status(404).send("Label not found");
      }

      await Task.updateMany(
        {
          userId: req.user.userId,
          labels: req.params.labelId,
        },
        {
          $pull: {
            labels: req.params.labelId,
          },
        },
      );

      return res.redirect("/ui/labels");
    } catch (error) {
      return res.status(500).send("Failed to delete label");
    }
  };
}

module.exports = LabelEJSController;

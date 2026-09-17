const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const User = require("../../models/userModel");
const generateToken = require("../../utils/generateTokens");
const sendMail = require("../../config/sendMail");

class UserController {
  // SIGNUP:
  static signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      const verificationToken = crypto.randomBytes(32).toString("hex");

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

      await sendMail({
        to: email,

        subject: "Verify your Daily Task Planner account",

        html: `
          <h2>Welcome ${name}</h2>

          <p>
            Thank you for registering with Daily Task Planner.
          </p>

          <p>
            Click the link below to verify your email:
          </p>

          <a href="${verificationLink}">
            Verify Email
          </a>

          <p>
            This link will expire in 24 hours.
          </p>
        `,
      });

      return res.status(201).json({
        success: true,
        message:
          "Signup successful. Please check your email to verify your account.",
        userId: user._id,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Signup failed",
        error: error.message,
      });
    }
  };

  // VERIFY EMAIL
  static verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        emailVerificationToken: token,

        emailVerificationExpires: {
          $gt: new Date(),
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Email verification failed",
      });
    }
  };

  // LOGIN
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email first",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  };

  // GET PROFILE
  static getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select(
        "-password -emailVerificationToken -emailVerificationExpires",
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  };

  // UPDATE PROFILE
  static updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId;

      const { name, email, profilePicture } = req.body;

      if (email) {
        const existingUser = await User.findOne({
          email,
          _id: {
            $ne: userId,
          },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Email already in use",
          });
        }
      }

      const updateData = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (email !== undefined) {
        updateData.email = email;
        updateData.isEmailVerified = false;
      }

      if (profilePicture !== undefined) {
        updateData.profilePicture = profilePicture;
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password -emailVerificationToken -emailVerificationExpires");

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Profile update failed",
      });
    }
  };
}

module.exports = UserController;

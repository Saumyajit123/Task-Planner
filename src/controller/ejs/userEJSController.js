const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const User = require("../../models/userModel");
const generateToken = require("../../utils/generateTokens");
const sendMail = require("../../config/sendMail");

class UserEJSController {
  // SignUp page:
  static signupPage = async (req, res) => {
    return res.render("auth/signup", {
      error: null,
    });
  };

  // SignUp:
  static signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).render("auth/signup", {
          error: "Emaiil already registered",
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

      const verificationLink = `${process.env.CLIENT_URL}/ui/verify-email/${verificationToken}`;

      await sendMail({
        to: email,

        subject: "Verify your Daily Task Planner account",

        html: `
          <h2>Welcome ${name}</h2>

          <p>
            Please verify your email address.
          </p>

          <a href="${verificationLink}">
            Verify Email
          </a>
        `,
      });

      return res.render("auth/verify-email", {
        message: "Signup successful. Please check your email.",
      });
    } catch (error) {
      return res.status(500).render("auth/signup", {
        error: "Something went wrong during signup",
      });
    }
  };

  // Verify Email:
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
        return res.status(400).render("auth/verify-email", {
          message: "Invalid or expired verification link",
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;

      await user.save();

      return res.render("auth/verify-email", {
        message: "Email verified successfully. You can now login.",
      });
    } catch (error) {
      return res.status(500).render("auth/verify-email", {
        message: "Email verification failed",
      });
    }
  };

  // Login page:
  static loginPage = async (req, res) => {
    return res.render("auth/login", {
      error: null,
    });
  };

  // Login:
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).render("auth/login", {
          error: "Invalid email or password",
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).render("auth/login", {
          error: "Please verify your email first",
        });
      }

      const passwordMatch = await bcryptjs(password, user.password);

      if (!passwordMatch) {
        return res.status(401).render("auth/login", {
          error: "Invalid email or password",
        });
      }

      const token = generateToken(user);
      req.session.token = token;

      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      return res.redirect("ui/tasks");
    } catch (error) {
      console.log(error);

      return res.status(500).render("auth/login", {
        error: "Login failed",
      });
    }
  };

  // Logout:
  static logout = async (req, res) => {
    req.session.destroy(() => {
      return res.redirect("/ui/login");
    });
  };

  // Profile:
  static profile = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select(
        "-password -emailVerificationToken -emailVerificationExpires",
      );

      if (!user) {
        return res.status(404).send("User not found");
      }

      return res.render("user/profile", {
        user,
      });
    } catch (error) {
      return res.status(500).send("Failed to fetch profile");
    }
  };

  // Edit profile page:
  static editProfilePage = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);

      return res.render("user/edit-profile", {
        user,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load profile");
    }
  };

  // Edit Profile:
  static editProfile = async (req, res) => {
    try {
      const userId = req.user.userId;

      const { name, email, profilePicture } = req.body;

      if (email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: userId },
        });

        if (existingUser) {
          const user = await User.findById(userId);

          return res.status(409).render("user/edit-profile", {
            user,
            error: "Email already in use",
          });
        }
      }

      const updateData = {};

      if (name !== undefined) {
        uploadData.name = name;
      }

      if (email !== undefined) {
        uploadData.email = email;
      }

      if (profilePicture !== undefined) {
        uploadData.profilePicture = profilePicture;
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      return res.redirect("/ui/profile");
    } catch (error) {
      return res.status(500).send("Failed to update profile");
    }
  };
}

module.exports = UserEJSController;

const jwt = require("jsonwebtoken");

const authEJSMiddleware = (req, res, next) => {
  try {
    const token = res.session.token;

    if (!token) {
      return res.redirect("/ui/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    req.session.destroy(() => {
      return res.redirect("/ui/login");
    });
  }
};


module.exports = authEJSMiddleware;

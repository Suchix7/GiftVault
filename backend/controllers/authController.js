const User = require("./models/UserModel.js");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
  });

  if (user) {
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.role === "vendor" && !user.isApproved) {
    res.status(403);
    throw new Error("Your vendor account is pending approval");
  }

  const token = generateToken(user._id, user.role);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

module.exports = {
  registerUser,
  loginUser,
};

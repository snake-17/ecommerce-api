const {
  registerUser,
  loginUser,
  editClient,
} = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    await registerUser(name, email, password);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    return res.json({ token });
  } catch (error) {
    next(error);
  }
};
const edit = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    await editClient(name, email, password);
    return res.status(200).json({ message: "Name updated successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = { register, login, edit };

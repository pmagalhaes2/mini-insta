const express = require("express");
const {
  createUser,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/userController");
const validateUser = require("../middlewares/authentication");
const router = express();

router.post("/usuarios", createUser);

router.post("/usuarios/login", login);

router.use(validateUser);

router.get("/usuarios/perfil", getProfile);

router.put("/usuarios/perfil", updateProfile);

module.exports = router;

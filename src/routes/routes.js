const express = require("express");
const {
  createUser,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/userController");
const validateUser = require("../middlewares/authentication");
const { createPost, likePost } = require("../controllers/postController");
const router = express();

router.post("/usuarios", createUser);

router.post("/usuarios/login", login);

router.use(validateUser);

router.get("/usuarios/perfil", getProfile);

router.put("/usuarios/perfil", updateProfile);

router.post("/postagens", createPost);

router.post("/postagens/:postagemId/curtir", likePost);

module.exports = router;

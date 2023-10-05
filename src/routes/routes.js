const express = require("express");
const {
  createUser,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/userController");
const validateUser = require("../middlewares/authentication");
const {
  createPost,
  likePost,
  commentPost,
  getPosts,
} = require("../controllers/postController");
const router = express();

router.post("/usuarios", createUser);

router.post("/usuarios/login", login);

router.use(validateUser);

router.get("/usuarios/perfil", getProfile);

router.put("/usuarios/perfil", updateProfile);

router.get("/postagens", getPosts);

router.post("/postagens", createPost);

router.post("/postagens/:postagemId/curtir", likePost);

router.post("/postagens/:postagemId/comentar", commentPost);

module.exports = router;

const jwt = require("jsonwebtoken");
const knex = require("../connection");

const validateUser = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message:
        "Para acessar este recurso um token de autenticação válido deve ser enviado.",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, process.env.JWT_PASS);
    const existingUser = await knex("usuarios").where({ id }).first();

    if (!existingUser) {
      return res.status(404).json({ message: "Usuário não autorizado!" });
    }

    const { senha: _, ...user } = existingUser;

    req.usuario = user;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({
        message:
          "Para acessar este recurso um token de autenticação válido deve ser enviado.",
      });
  }
};


module.exports = validateUser;
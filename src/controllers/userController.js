const knex = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const {
    nome,
    imagem,
    username,
    site,
    bio,
    telefone,
    genero,
    email,
    senha,
    verificado,
  } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ message: "O campo username deve ser informado!" });
  }

  if (!senha) {
    return res
      .status(400)
      .json({ message: "O campo senha deve ser informado!" });
  }

  if (senha.length < 5) {
    return res
      .status(400)
      .json({ message: "A senha deve conter no mínimo 5 caracteres!" });
  }

  try {
    const existingUsername = await knex("usuarios").where({ username }).first();

    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Usuário informado já consta cadastrado!" });
    }

    if (email) {
      const existingEmail = await knex("usuarios")
        .where({ email })
        .first()
        .debug();

      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "E-mail informado já consta cadastrado!" });
      }
    }

    const encryptPassword = await bcrypt.hash(senha, 10);

    const newUser = await knex("usuarios")
      .insert({
        nome,
        imagem,
        username,
        site,
        bio,
        telefone,
        genero,
        email,
        senha: encryptPassword,
        verificado,
      })
      .returning("*");

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

const login = async (req, res) => {
  const { username, senha } = req.body;

  if (!username || !senha) {
    return res
      .status(400)
      .json({ message: "Os campos username e senha são obrigatórios!" });
  }

  try {
    const existingUser = await knex("usuarios").where({ username }).first();

    if (!existingUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(senha, existingUser.senha);

    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "E-mail e/ou senha não conferem!" });
    }

    const userToken = {
      id: existingUser.id,
      username: existingUser.username,
    };

    const token = jwt.sign(userToken, process.env.JWT_PASS, {
      expiresIn: "8h",
    });

    const { senha: _, ...userData } = existingUser;

    return res.status(200).json({
      usuario: userData,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json(req.usuario);
};

const updateProfile = async (req, res) => {
  let {
    nome,
    imagem,
    username,
    site,
    bio,
    telefone,
    genero,
    email,
    senha,
    verificado,
  } = req.body;

  const { id } = req.usuario;

  if (
    !nome &&
    !imagem &&
    !username &&
    !site &&
    !bio &&
    !telefone &&
    !genero &&
    !email &&
    !senha &&
    !verificado
  ) {
    return res.status(400).json({
      message: "É obrigatório informar ao menos um campo para ser alterado!",
    });
  }

  try {
    if (senha) {
      if (senha.length < 5) {
        return res
          .status(400)
          .json({ message: "A senha deve conter no mínimo 5 caracteres!" });
      }

      senha = await bcrypt.hash(senha, 10);
    }

    if (email !== req.usuario.email) {
      const existingEmail = await knex("usuarios").where({ email }).first();

      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "E-mail informado já consta cadastrado!" });
      }
    }

    if (username !== req.usuario.username) {
      const existingUsername = await knex("usuarios")
        .where({ username })
        .first();

      if (existingUsername) {
        return res
          .status(400)
          .json({ message: "Usuário informado já consta cadastrado!" });
      }
    }

    const updatedUser = await knex("usuarios").where({ id }).update({
      nome,
      imagem,
      username,
      site,
      bio,
      telefone,
      genero,
      email,
      senha,
      verificado,
    });

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: "O perfil do usuário não foi atualizado!" });
    }

    return res
      .status(200)
      .json({ message: "Perfil do usuário atualizado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

module.exports = { createUser, login, getProfile, updateProfile };

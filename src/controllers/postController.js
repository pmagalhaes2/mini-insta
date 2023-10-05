const knex = require("../connection");

const createPost = async (req, res) => {
  const { id } = req.usuario;
  const { texto, fotos } = req.body;

  if (!fotos || fotos.length === 0) {
    return res
      .status(400)
      .json({ message: "É preciso informar ao menos a URL de uma foto!" });
  }

  try {
    const post = await knex("postagens")
      .insert({ texto, usuario_id: id })
      .returning("*");

    if (!post) {
      return res
        .status(400)
        .json({ message: "Não foi possível concluir a postagem!" });
    }

    console.log(post);

    for (const foto of fotos) {
      const insertedImages = await knex("postagem_fotos").insert({
        postagem_id: post[0].id,
        imagem: foto.imagem,
      });

      if (!insertedImages) {
        await knex("postagens").where({ id: post[0].id }).del();
        return res
          .status(400)
          .json({ message: "Não foi possível adicionar as imagens!" });
      }
    }
    return res.status(201).json({ message: "Postagem realizada com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

const likePost = async (req, res) => {
  const { id } = req.usuario;
  const { postagemId } = req.params;

  try {
    const post = await knex("postagens").where({ id: postagemId }).first();

    if (!post) {
      res.status(404).json({ message: "Postagem não encontrada!" });
    }

    const userHasLikedPost = await knex("postagem_curtidas")
      .where({
        usuario_id: id,
        postagem_id: post.id,
      })
      .first();

    if (userHasLikedPost) {
      return res
        .status(400)
        .json({ message: "O usuário já curtiu essa postagem!" });
    }

    const postLike = await knex("postagem_curtidas").insert({
      usuario_id: id,
      postagem_id: post.id,
    });

    if (!postLike) {
      return res
        .status(400)
        .json({ message: "Não foi possível efetuar a curtida!" });
    }

    return res.status(200).json({ message: "Postagem curtida com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

const commentPost = async (req, res) => {
  const { id } = req.usuario;
  const { postagemId } = req.params;
  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({
      message: "Para prosseguir é necessário informar o texto do comentário!",
    });
  }

  try {
    const post = await knex("postagens").where({ id: postagemId }).first();

    if (!post) {
      res.status(404).json({ message: "Postagem não encontrada!" });
    }

    const postComment = await knex("postagem_comentarios").insert({
      usuario_id: id,
      postagem_id: post.id,
      texto,
    });

    if (!postComment) {
      return res
        .status(400)
        .json({ message: "Não foi possível efetuar o comentário!" });
    }

    return res
      .status(200)
      .json({ message: "Comentário efetuado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

const getPosts = async (req, res) => {
  const { id } = req.usuario;
  const { offset } = req.query;

  const offsetValue = offset ? offset : 0;

  try {
    const posts = await knex("postagens")
      .where("usuario_id", "<>", id)
      .limit(10)
      .offset(offsetValue);

    if (posts.length === 0) {
      return res.status(200).json(posts);
    }

    for (let post of posts) {
      const user = await knex("usuarios")
        .where({ id: post.usuario_id })
        .select("imagem", "username", "verificado")
        .first();

      post.usuario = user;

      const photos = await knex("postagem_fotos")
        .where({
          postagem_id: post.id,
        })
        .select("imagem");

      post.fotos = photos;

      const likes = await knex("postagem_curtidas")
        .where({
          postagem_id: post.id,
        })
        .select("usuario_id");

      post.curtidas = likes.length;

      post.curtidoPorMim = likes.find((like) => like.usuario_id === id)
        ? true
        : false;

      const comments = await knex("postagem_comentarios")
        .leftJoin("usuarios", "usuarios.id", "postagem_comentarios.usuario_id")
        .where({
          postagem_id: post.id,
        })
        .select("usuarios.username", "postagem_comentarios.texto");

      post.comentarios = comments;
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Erro interno no servidor!" });
  }
};

module.exports = { createPost, likePost, commentPost, getPosts };

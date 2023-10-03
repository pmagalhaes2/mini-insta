CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    imagem TEXT,
    username TEXT NOT NULL UNIQUE,
    site TEXT,
    bio TEXT,
    telefone TEXT,
    genero TEXT,
    email TEXT UNIQUE,
    senha TEXT NOT NULL,
    verificado BOOLEAN DEFAULT FALSE
);

CREATE TABLE postagens (
	id SERIAL PRIMARY KEY,
	usuario_id INT NOT NULL references usuarios(id),
    data TIMESTAMPTZ default now(),
    texto TEXT 
);

CREATE TABLE postagem_fotos(
    id SERIAL PRIMARY KEY,
	postagem_id INT NOT NULL references postagens(id),
    imagem TEXT NOT NULL
 );
 
CREATE TABLE postagem_comentarios (
	id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL references usuarios(id),
	postagem_id INT NOT NULL references postagens(id),
	data TIMESTAMPTZ default now(),
    texto TEXT NOT NULL
);

CREATE TABLE postagem_curtidas (
  usuario_id INT NOT NULL references usuarios(id),
  postagem_id INT NOT NULL references postagens(id),
  data TIMESTAMPTZ default now()
);






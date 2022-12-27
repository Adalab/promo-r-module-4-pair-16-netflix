const express = require('express');
const cors = require('cors');
const usersData = require('./data/users.json');
const Database = require('better-sqlite3');
const { response } = require('express');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//Instalación del motor de plantillas
server.set('view engine', 'ejs');

// init and config data base
const db = new Database('./src/database.db', {
  // comment next line to hide data base logs in console
  verbose: console.log,
});

// function to capitalize 1st letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//End points
server.get('/movies', (req, res) => {
  const genreFilterParam = req.query.genre;
  const sortFilterParam = req.query.sort.toUpperCase();

  if (genreFilterParam !== '') {
    const queryGenre = db.prepare(`SELECT * FROM movies WHERE genre = ? ORDER BY name ${sortFilterParam}`);
    const moviesByGenre = queryGenre.all(capitalizeFirstLetter(genreFilterParam));
    const response = {
      success: true,
      movies: moviesByGenre,
    };
    res.json(response);
  } else {
    const querySort = db.prepare(`SELECT * FROM movies ORDER BY name ${sortFilterParam}`);
    const moviesSorted = querySort.all();
    const response = {
      success: true,
      movies: moviesSorted,
    };
    res.json(response);
  }
});

server.get('/movie/:movieId', (req, res) => {
  const movieId = req.params.movieId;

  const query = db.prepare(`SELECT * FROM movies WHERE id = ?`);
  const result = query.get(movieId);
  res.render('movie', result);
});

server.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const foundUser = usersData.find((user) => user.email === userEmail && user.password === userPassword);
  if (foundUser !== undefined) {
    const responseSuccess = {
      success: true,
      userId: 'id_de_la_usuaria_encontrada',
    };
    res.json(responseSuccess);
  } else {
    const responseError = {
      success: false,
      errorMessage: 'Usuaria/o no encontrada/o',
    };
    res.json(responseError);
  }
});

server.post('/sign-up', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const query = db.prepare('INSERT INTO users (email, password) VALUES (?, ?');
  const result = query.run(userEmail, userPassword);
  res.json({
    success: true,
    userId: result,
  });
});

//Servidores estáticos
const staticServer = './src/public-react';
server.use(express.static(staticServer));

const staticServerImages = './src/public-movies-images';
server.use(express.static(staticServerImages));

const staticServerStyles = './src/public-css';
server.use(express.static(staticServerStyles));

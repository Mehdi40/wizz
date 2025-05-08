const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get('/api/games', (req, res) => db.Game.findAll()
  .then(games => res.send(games))
  .catch((err) => {
    console.log('There was an error querying games', JSON.stringify(err));
    return res.send(err);
  }));

app.post('/api/games/search', (req, res) => {
  const { name, platform } = req.body;
  const where = {};

  if (name) {
    where.name = { [db.Sequelize.Op.like]: `%${name}%` };
  }

  if (platform) {
    where.platform = platform;
  }

  return db.Game.findAll({ where })
    .then(games => res.send(games))
    .catch((err) => {
      console.log('Error searching games', JSON.stringify(err));
      return res.status(500).send(err);
    });
});

app.post('/api/games', (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  return db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    .then(game => res.send(game))
    .catch((err) => {
      console.log('***There was an error creating a game', JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.delete('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then(game => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log('***Error deleting game', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => {
      const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
      return game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(() => res.send(game))
        .catch((err) => {
          console.log('***Error updating game', JSON.stringify(err));
          res.status(400).send(err);
        });
    });
});

app.post('/api/games/populate', async (req, res) => {
  const iosUrl = 'https://wizz-technical-test-dev.s3.eu-west-3.amazonaws.com/ios.top100.json';
  const androidUrl = 'https://wizz-technical-test-dev.s3.eu-west-3.amazonaws.com/android.top100.json';

  try {
    const [iosResponse, androidResponse] = await Promise.all([
      axios.get(iosUrl),
      axios.get(androidUrl)
    ]);

    const iosGamesBatches = iosResponse.data;
    const androidGamesBatches = androidResponse.data;

    const gamesToCreate = [];

    iosGamesBatches.forEach(gameBatch => {
      gameBatch.forEach(game => {
        gamesToCreate.push({
          name: game.name,
          platform: 'iOS',
          storeId: game.app_id ? String(game.app_id) : null,
          bundleId: game.bundle_id,
          appVersion: game.version,
          isPublished: true,
          publisherId: game.publisher_id ? String(game.publisher_id) : null
        });
      });
    });

    androidGamesBatches.forEach(gameBatch => {
      gameBatch.forEach(game => {
        gamesToCreate.push({
          name: game.name,
          platform: 'Android',
          storeId: game.app_id ? String(game.app_id) : null,
          bundleId: game.bundle_id,
          appVersion: game.version,
          isPublished: true,
          publisherId: game.publisher_id ? String(game.publisher_id) : null
        });
      });
    });

    if (gamesToCreate.length > 0) {
      const createdGames = await db.Game.bulkCreate(gamesToCreate, {
        ignoreDuplicates: true,
      });
      res.send({ message: 'Database populated successfully with top games.', count: createdGames.length });
    } else {
      res.send({ message: 'No games found to populate or data format issue.', count: 0 });
    }

  } catch (error) {
    console.error('Error populating database:', error);
    res.status(500).send({ message: 'Failed to populate database.', error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;

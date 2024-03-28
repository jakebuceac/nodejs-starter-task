var express = require('express');
var router = express.Router();
var webSocketServer = require('../../websocket');

const redis = require('redis');
const client = redis.createClient();

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (! req.query.op || ! req.query.op_name || ! req.query.status) {
    return res.status(404).send('Route not found');
  }

  await client.connect();

  client.on('error', (err) => {
      console.log(`Error ${err}`)
  });

  const data = JSON.parse(await client.get('data'));

  if (data[req.query.op]) {
    data[req.query.op].status = req.query.status;

    await client.set('data', JSON.stringify(data));

    data[req.query.op].id = req.query.op;
    
    const message = {
      type: "update",
      data: data[req.query.op]
    };

    webSocketServer.clients.forEach(function each(client) {
      client.send(JSON.stringify(message));
    });

    await client.disconnect();

    return res.json({
      message: 'Status updated successfully'
    });
  } else {
    return res.json({
      message: 'User does not exist'
    });
  }
});

module.exports = router;
 
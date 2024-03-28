import express, { Request, Response, NextFunction } from "express";
import webSocketServer from "../../websocket.js";
import redis from "redis";

var router = express.Router();
const client = redis.createClient();

/* GET home page. */
router.get('/', async function(req: Request, res: Response, next: NextFunction) {
  if (! req.query.op || ! req.query.op_name || ! req.query.status) {
    return res.status(404).send('Route not found');
  }

  const operationId: string = req.query.op as string;

  await client.connect();

  client.on('error', (err) => {
      console.log(`Error ${err}`)
  });

  const data = JSON.parse(await client.get('data') ?? 'null');

  if (data[operationId]) {
    data[operationId].status = req.query.status;

    await client.set('data', JSON.stringify(data));

    data[operationId].id = req.query.op;
    
    const message = {
      type: "update",
      data: data[operationId]
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

export default router;
 
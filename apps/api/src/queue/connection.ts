import amqp, { Channel, ChannelModel} from "amqplib";
import { EXCHANGES, QUEUES } from "./queues";

let connection:ChannelModel;
let channel:Channel;

export const connectRabbitMq=async(check=3):Promise<void> => {
  for(let i = 0;i<check;i++) {
    try {
      connection=await amqp.connect(process.env.RABBITMQ_URL!);
      channel=await connection.createChannel();
      console.log('queu rabbit connected');

    await channel.assertExchange(EXCHANGES.ASSET_UPLOADED,'fanout', {durable:true}); //msg all q--durable-oky wid server restart
    for (const q of Object.values(QUEUES)) {
     await channel.assertQueue(q, {durable:true});
    }
    await channel.bindQueue(QUEUES.THUMBNAIL,EXCHANGES.ASSET_UPLOADED, '');
    await channel.bindQueue(QUEUES.METADATA,EXCHANGES.ASSET_UPLOADED, '');
    await channel.bindQueue(QUEUES.DUPLICATE,EXCHANGES.ASSET_UPLOADED, '');
    await channel.bindQueue(QUEUES.NOTIFICATION,EXCHANGES.ASSET_UPLOADED, '');
    return;
    } catch (err) {
      console.log(`queu conncet try${i+1} fail, retry in 3sec`);
      await new Promise(r =>setTimeout(r, 3000));
    }
  }
  throw new Error('queu cant conncet');
};

export const getChannel=() => {
  if(!channel)throw new Error('queue rabbit not conncet yet');
  return channel;
};
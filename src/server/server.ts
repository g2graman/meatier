import {SocketCluster} from 'socketcluster';
import * as os from 'os';
import * as path from 'path';

const numCpus = os.cpus().length;
import {getDotenv} from '../universal/utils/dotenv';

import 'ts-node/register';

// Import .env and expand variables:
getDotenv();

export const options = {
  authKey: process.env.JWT_SECRET,
  logLevel: 1,

  // change this to scale vertically
  workers: numCpus || 1,
  brokers: 1,
  port: process.env.PORT || 3000,
  appName: 'Meatier',
  allowClientPublish: false,
  workerController: path.join(__dirname, '/worker.js'),
  brokerController: path.join(__dirname, '/broker.js'),
  socketChannelLimit: 1000,
  rebootWorkerOnCrash: true
};

new SocketCluster(options); // eslint-disable-line no-new

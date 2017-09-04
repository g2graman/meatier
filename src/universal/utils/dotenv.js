/*
 * getDotenv()
 * processes .env file (if it exists). Sets process.env[VARS] as a
 * side-effect.
 *
 * Returns true.
 */
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

export function getDotenv() {
  const myEnv = dotenv.config({silent: true});   // eslint-disable-line
  dotenvExpand(myEnv);

  return true;
}

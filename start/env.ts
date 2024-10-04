/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  CALL_BACK_URL: Env.schema.string(),
  // DIR_NAME : Env.schema.string(),
  //////////////////  My ENV
  FRONT_ORIGINE: Env.schema.string(),
  FRONT_END_AUTH: Env.schema.string(),
  FRONT_END_REGISTER: Env.schema.string(),
  GOOGLE_CALLBACK: Env.schema.string(),
  GOOGLE: Env.schema.string(),
  DEFAULT_LIMIT: Env.schema.string(),
  FILE_STORAGE_PATH: Env.schema.string(),
  FILE_STORAGE_URL: Env.schema.string(),
  PUBLIC_PATH: Env.schema.string(),
  /*
  |----------------------------------------------------------
  | Variables for configuring ally package
  |----------------------------------------------------------
  */
  GOOGLE_CLIENT_ID: Env.schema.string(),
  GOOGLE_CLIENT_SECRET: Env.schema.string(),
})

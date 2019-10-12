import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated
   * JavaScript object including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      PORT: Joi.number().default(3000),
      DB_URI: Joi.string().required(),
      DEBUG: Joi.boolean().default(false),
      REQUEST_TIMEOUT: Joi.number().default(5000),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get dbUri(): string {
    return String(this.envConfig.DB_URI);
  }

  get debug(): boolean {
    return Boolean(this.envConfig.DEBUG);
  }

  get timeOutThreshold(): number {
    return Number(this.envConfig.REQUEST_TIMEOUT);
  }
}

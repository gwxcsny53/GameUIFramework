import { IConfigService } from "../api/IConfigService";

export class ConfigService implements IConfigService {
  public readonly name = "ConfigService";

  public async init(): Promise<void> {}

  public async start(): Promise<void> {}

  public async clear(): Promise<void> {}
}

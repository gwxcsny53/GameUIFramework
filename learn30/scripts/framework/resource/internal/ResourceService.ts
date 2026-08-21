import { IResourceService } from "../api/IResourceService";

export class ResourceService implements IResourceService {
  public readonly name = "ResourceService";

  public async init(): Promise<void> {}

  public async start(): Promise<void> {}

  public async clear(): Promise<void> {}
}

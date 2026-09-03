import { IUIService } from "../api/IUIService";

export class UIService implements IUIService {
  public readonly name = "UIService";

  public async init(): Promise<void> {}

  public async start(): Promise<void> {}

  public async clear(): Promise<void> {}
}

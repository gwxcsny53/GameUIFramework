export interface IService {
  readonly name: string;

  init(): Promise<void>;

  start?(): Promise<void>;

  clear(): Promise<void>;
}

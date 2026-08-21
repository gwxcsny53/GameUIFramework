interface IShowConfig<
  Typekey extends keyof any = any,
  InitDataTypeMapType = any,
  ShowDataTypeMapType = any,
> {
  typekey?: Typekey;
  /** 传递初始化数据 */
  onInitData?: InitDataTypeMapType[ToAnyIndexKey<Typekey, InitDataTypeMapType>];
  /** 强制重新加载 */
  forceLoad?: boolean;
  /** 显示数据 */
  onShowData?: ShowDataTypeMapType[ToAnyIndexKey<Typekey, ShowDataTypeMapType>];
  /** 在实例onShow后回调 */
  showedCb?: CtrlInsCb;
  /** 在实例限时完成后回调 */
  showEndCb?: CtrlInsCb;
  /** 加载后onload参数 */
  onLoadData?: any;
  /** 加载完成回调,返回实例为空则加载失败,返回实例则成功 */
  loadCb?: CtrlInsCb;
}

interface ICtrl<NodeType = any> {
  key?: string | any;
  /**正在加载 */
  isLoading?: boolean;
  /**已经加载 */
  isLoaded?: boolean;
  /**已经初始化 */
  isInited?: boolean;
  /**已经显示 */
  isShowed?: boolean;
  /**需要显示 */
  needShow?: boolean;
  /**需要加载 */
  needLoad?: boolean;
  /**正在显示 */
  isShowing?: boolean;

  /**
   * 透传给加载处理的数据,
   * 会和调用显示接口showDpc中传来的onLoadData合并,
   * 以接口传入的为主
   * Object.assign(ins.onLoadData,cfg.onLoadData);
   * */
  onLoadData?: any;
  /**获取资源 */
  getRess?(): string[] | any[];
  /**
   * 初始化
   * @param initData 初始化数据
   */
  onInit(config?: displayCtrl.IInitConfig): void;
  /**
   * 当显示时
   * @param showData 显示数据
   */
  onShow(config?: displayCtrl.IShowConfig): void;
  /**
   * 当更新时
   * @param updateData 更新数据
   * @param endCb 结束回调
   */
  onUpdate(updateData: any): void;
  /**
   * 获取控制器
   */
  getFace<T>(): ReturnCtrlType<T>;
  /**
   * 当隐藏时
   */
  onHide(): void;
  /**
   * 强制隐藏
   */
  forceHide(): void;
  /**
   * 当销毁时
   * @param destroyRes
   */
  onDestroy(destroyRes?: boolean): void;
  /**
   * 获取显示节点
   */
  getNode(): NodeType;
}

/**
 * 资源处理器
 */
interface IResHandler {
  /**
   * 加载资源
   * @param config
   */
  loadRes?(config: displayCtrl.IResLoadConfig): void;
  /**
   * 释放资源
   * @param ctrlIns
   */
  releaseRes?(ctrlIns?: ICtrl): void;
}

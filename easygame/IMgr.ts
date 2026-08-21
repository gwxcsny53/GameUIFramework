interface IMgr<
  CtrlKeyMapType = any,
  InitDataTypeMapType = any,
  ShowDataTypeMapType = any,
  UpdateDataTypeMapType = any,
> {
  /**控制器key字典 */
  keys: CtrlKeyMapType;
  /**
   * 控制器单例字典
   */
  sigCtrlCache: CtrlInsMap;
  /**
   * 初始化
   * @param resHandler 资源处理
   */
  init(resHandler?: IResHandler): void;
  /**
   * 批量注册控制器类
   * @param classMap
   */
  registTypes(classes: CtrlClassMap | CtrlClassType[]): void;
  /**
   * 注册控制器类
   * @param ctrlClass
   * @param typeKey 如果ctrlClass这个类里没有静态属性typeKey则取传入的typeKey
   */
  regist(ctrlClass: CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
  /**
   * 是否注册了
   * @param typeKey
   */
  isRegisted<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): boolean;
  /**
   * 获取注册类的资源信息
   * 读取类的静态变量 ress
   * @param typeKey
   */
  getDpcRessInClass<keyType extends keyof CtrlKeyMapType>(
    typeKey: keyType,
  ): string[] | any[];
  /**
   * 获取单例UI的资源数组
   * @param typeKey
   */
  getSigDpcRess<keyType extends keyof CtrlKeyMapType>(
    typeKey: keyType,
  ): string[] | any[];
  /**
   * 获取/生成单例显示控制器示例
   * @param typeKey 类型key
   */
  getSigDpcIns<T, keyType extends keyof CtrlKeyMapType = any>(
    typeKey: keyType,
  ): displayCtrl.ReturnCtrlType<T>;
  /**
   * 加载Dpc
   * @param typeKey 注册时的typeKey
   * @param loadCfg 透传数据和回调
   */
  loadSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(
    typeKey: keyType,
    loadCfg?: displayCtrl.ILoadConfig,
  ): displayCtrl.ReturnCtrlType<T>;
  /**
   * 初始化显示控制器
   * @param typeKey 注册类时的 typeKey
   * @param initCfg displayCtrl.IInitConfig
   */
  initSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(
    typeKey: keyType,
    initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>,
  ): displayCtrl.ReturnCtrlType<T>;
  /**
   * 显示单例显示控制器
   * @param typeKey 类key或者显示配置IShowConfig
   * @param onShowData 显示透传数据
   * @param showedCb 显示完成回调(onShow调用之后)
   * @param onInitData 初始化透传数据
   * @param forceLoad 是否强制重新加载
   * @param onCancel 当取消显示时
   */
  showDpc<T, keyType extends keyof CtrlKeyMapType = any>(
    typeKey:
      | keyType
      | displayCtrl.IShowConfig<
          keyType,
          InitDataTypeMapType,
          ShowDataTypeMapType
        >,
    onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<
      keyType,
      ShowDataTypeMapType
    >],
    showedCb?: displayCtrl.CtrlInsCb<T>,
    onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<
      keyType,
      InitDataTypeMapType
    >],
    forceLoad?: boolean,
    onLoadData?: any,
    loadCb?: displayCtrl.CtrlInsCb,
    onCancel?: VoidFunction,
  ): displayCtrl.ReturnCtrlType<T>;
  /**
   * 更新控制器
   * @param key UIkey
   * @param updateData 更新数据
   */
  updateDpc<keyType extends keyof CtrlKeyMapType>(
    key: keyType,
    updateData?: UpdateDataTypeMapType[ToAnyIndexKey<
      keyType,
      UpdateDataTypeMapType
    >],
  ): void;
  /**
   * 隐藏单例控制器
   * @param key
   */
  hideDpc<keyType extends keyof CtrlKeyMapType>(key: keyType): void;
  /**
   * 销毁单例控制器
   * @param key
   * @param destroyRes 销毁资源
   */
  destroyDpc<keyType extends keyof CtrlKeyMapType>(
    key: keyType,
    destroyRes?: boolean,
  ): void;

  /**
   * 实例化显示控制器
   * @param typeKey 类型key
   */
  insDpc<T, keyType extends keyof CtrlKeyMapType = any>(
    typeKey: keyType,
  ): ReturnCtrlType<T>;
  /**
   * 加载显示控制器
   * @param ins
   * @param loadCfg
   */
  loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: ILoadConfig): void;
  /**
   * 初始化显示控制器
   * @param ins
   * @param initData
   */
  initDpcByIns<keyType extends keyof CtrlKeyMapType>(
    ins: displayCtrl.ICtrl,
    initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>,
  ): void;
  /**
   * 显示 显示控制器
   * @param ins
   * @param showCfg
   */
  showDpcByIns<keyType extends keyof CtrlKeyMapType>(
    ins: displayCtrl.ICtrl,
    showCfg?: displayCtrl.IShowConfig<
      keyType,
      InitDataTypeMapType,
      ShowDataTypeMapType
    >,
  ): void;
  /**
   * 通过实例隐藏
   * @param ins
   */
  hideDpcByIns<T extends displayCtrl.ICtrl>(ins: T): void;
  /**
   * 通过实例销毁
   * @param ins
   * @param destroyRes 是否销毁资源
   */
  destroyDpcByIns<T extends displayCtrl.ICtrl>(
    ins: T,
    destroyRes?: boolean,
    endCb?: VoidFunction,
  ): void;

  /**
   * 获取单例控制器是否正在
   * @param key
   */
  isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
  /**
   * 获取单例控制器是否加载了
   * @param key
   */
  isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
  /**
   * 获取单例控制器是否初始化了
   * @param key
   */
  isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
  /**
   * 获取单例控制器是否显示
   * @param key
   */
  isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
  /**
   * 获取控制器类
   * @param typeKey
   */
  getCtrlClass<keyType extends keyof CtrlKeyMapType>(
    typeKey: keyType,
  ): CtrlClassType<ICtrl>;
}

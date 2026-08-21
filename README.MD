# 三种游戏 UI 架构学习总结

## 1. 总体定位

### 1.1 三篇文章分别解决的问题

### 1.2 三篇文章所在的架构层级

## 2. EasyGameFramework

1. 是一个完整的游戏Ui框架,使用需要安装依赖

### 2.1 设计目标

### 2.2 核心结构

### 2.3 核心接口

### 2.4 使用流程

### 2.5 单实例与多实例

### 2.6 解决的问题

### 2.7 未解决的问题

## 3. JKFrame UI 系统

### 3.1 设计目标

### 3.2 核心结构

### 3.3 UIWindowData

### 3.4 窗口注册方式

### 3.5 打开和关闭流程

### 3.6 层级与遮罩

### 3.7 缓存方式

### 3.8 解决的问题

### 3.9 未解决的问题

## 4. MVVM、Flux 与 Redux

### 4.1 设计目标

### 4.2 MVC

### 4.3 MVVM

### 4.4 Flux

### 4.5 Redux

### 4.6 数据流转方式

### 4.7 解决的问题

### 4.8 未解决的问题

## 5. 横向对比

### 5.1 管理对象

### 5.2 生命周期

### 5.3 资源与实例

### 5.4 层级与窗口关系

### 5.5 数据与状态

### 5.6 异步处理

## 6. 当前理解

### 6.1 准备保留的思想

### 6.2 不准备直接照搬的设计

### 6.3 需要通过 Demo 验证的问题

TS 基础知识


# 构造函数类型 / 构造签名

new (...args:any[]) => T;

class Player{}

let a: Player; // a 是一个Player实例
let b: typeof Player; // b 是一个Player类

class Dog {}
let DogType: new () => Dog;
DogType = Dog; // 不明白这里的意思
const dog = new DogType();

此时:dog = Dog
那么 dog 现在是什么东西, dog是一个类,使用需要 new dog() 返回的类型是 Dog

type AssetType<T extends Asset> = new (...args:any[]) => T;



# 剩余参数

...args:any[] 

func?:(...args:any[])=> void;
func();
func(1,2,3);

new (...args:any[]) => T;
class A {
    constructor();
}
class B {
    constructor(a,b)
}
class C {
    constructor(a,b,c)
}


# 函数类型:

private progressCallback?:(lodaed:number,total:number)=>void;

type ProgressCallback = (loaded: number, total: number) => void;

private progressCallback?:ProgressCallback;

type Factory<T> = ()=>T;


# Array / Map / Set

enemys: [];
for (let enemy of enemys){
    enemy.update();
}
enemys.sort();
enemys.filter();

enemyEntitys: Map<String,EnemyEntity>;
enemyEnitys.get(id):EnemyEntity | undefined;
enemyEntiys.set(id, enemyEntity);
enemyEnitys.has(id);
enemyEnitys.delete(id);
enemyEnitys.size(); // 数量
enemyEnitys.clear(); 

for(let enemy of enemyEnitys.values()){
    enemy.update();
}
for(let enemy of enemyEnitys.keys()){
    consoloe.log(`enemy id: ${enemy}`);
}
for(let [key,value] of enemyEnitys){
    consoloe.log(`enemy id: ${key}, enemy entity: ${value}`)
}

Map<Node,UICtrl>() ; Map<Entity,Buff[]>() ; Map<Node,Tween>(); Map<Class,Service>();

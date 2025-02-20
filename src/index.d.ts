/**************** creep角色 ********************/
type BodyConfigRole = 'HarvesterBody' | 'WorkerBody' | 'HaulerBody' |
  'DefenderBody' | 'RangedBody' | 'HealerBody' | 'RemoteHarvesterBody' |
  'RemoteHauler' | 'RemoteDefenderBody' | 'ClaimerBody' | 'DismantlerBody' |
  'ProcessorBody'

/**
 * 基础运营
 */
type BaseRole = 'Harvester' | 'Worker' | 'Hauler' | 'Collector' | 'Upgrader'
  | 'Builder' | 'Filler' | 'Processor' | 'Manager'
/**
 * 防御
 */
type DefenderRole = 'Defender' | 'Ranged' | 'Healer'
/**
 * 远程挖矿
 */
type RemoteRole = 'RemoteHarvester' | 'RemoteHauler' | 'RemoteDefender'
/**
 * 高级单位
 */
type AdvanceRole = 'Claimer' | 'Dismantler'
/**
 * 所有Role
 */
type CreepRole = BaseRole | DefenderRole | RemoteRole | AdvanceRole

type BodySet = Partial<Record<BodyPartConstant, number>>

type BodyConfig = Record<BodyConfigRole,
  [BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]>

/**************** Creep周期定义 ********************/
interface CreepCycle {
  // 每次死后都会进行判断，只有返回 true 时才会重新发布孵化任务
  isNeed?: (creep: Creep) => boolean
  // 准备阶段执行的方法, 返回 true 时代表准备完成
  prepare?: (creep: Creep) => boolean
  // creep 获取工作所需资源时执行的方法
  // 返回 true 则执行 target 阶段，返回其他将继续执行该方法
  source?: (creep: Creep) => boolean
  // creep 工作时执行的方法,
  // 返回 true 则执行 source 阶段，返回其他将继续执行该方法
  target: (creep: Creep) => boolean
  // 每个角色默认的身体组成部分
  bodys: CreepRole | BodyPartConstant[]
}

type CreepWork = {
  [role in CreepRole]: (data: CreepData) => CreepCycle
}
/**************** CreepData ********************/
type EmptyData = {}
type HarvesterData = {
  sourceId: string
  targetId: string
}
type WorkerData = {
  sourceId: string
  targetId: string
}
type ProcessorData = {
  x: number
  y: number
}
type RemoteHarvesterData = {
  sourceFlagName: string
  targetId: string
  spawnRoom: string
}
type HealerData = {
  targetFlagName: string
  reSpawn: boolean
}
type CreepData = EmptyData | HarvesterData | WorkerData | ProcessorData | RemoteHarvesterData |
  HealerData

/**************** 内存管理 ********************/
interface Memory {
  bypassRooms: string[]
  shareTask: ShareTask[]
}
// Creep的内存管理
interface CreepMemory {
  // 是否去对穿
  crossable: boolean
  // 是否被对穿
  standed: boolean
  role: CreepRole
  noNeed?: boolean
  ready: boolean
  // 待命位置
  isStandBy: boolean
  // 工作位置,不允许对穿
  isStand: boolean
  data: CreepData
  goCache: boolean
  move?: {
    far: boolean
    // 序列化之后的路径信息
    path?: string
    // 移动索引，标志 creep 现在走到的第几个位置
    index: number
    // 上一个位置信息，形如"14/4"，用于在 creep.move 返回 OK 时检查有没有撞墙
    prePos?: string
    // 缓存路径的目标，该目标发生变化时刷新路径, 形如"14/4E14S1"
    targetPos?: string
  }
  // 是否有工作
  working: boolean
  // 建筑工特有，当前缓存的建筑工地
  constructionSiteId?: string
  // 要刷的墙的ID
  fillWallId?: string
}

interface FlagMemory { }
interface PowerCreepMemory { }
// 房间的内存管理 
interface BuildStructure {
  siteId: string
  type: StructureConstant
  pos: { x: number, y: number }
}
type CenterStructures = STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_FACTORY | 'centerLink'
// 中央物流任务
type CenterTask = {
  // 任务提交者，中央建筑或者手动推送
  submit: CenterStructures | number
  source: CenterStructures
  target: CenterStructures
  resouce: ResourceConstant
  amount: number
}
// 房间物流任务
type TransferTask = ExtensionFill | TowerFill | NukerFill | PowerSpawnFill |
  LabInFill | LabOut | BoostGetResource | BoostGetEnergy | BootClear
type TransferTaskConstant = 'Extension' | 'Tower' | 'Nuker' | 'Power' | 'LabIn' | 'LabOut'
  | 'BoostGetResource' | 'BoostGetEnergy' | 'BoostClear'
interface ExtensionFill {
  type: TransferTaskConstant
}
interface TowerFill extends ExtensionFill {
  id: string
}
interface NukerFill extends TowerFill {
  resouce: ResourceConstant
}
interface PowerSpawnFill extends NukerFill { }

interface LabInFill extends ExtensionFill {
  resource: {
    id: string
    type: ResourceConstant
    amount: number
  }[]
}
interface LabOut extends ExtensionFill {
  resource: ResourceConstant
}
interface BoostGetResource extends ExtensionFill { }
interface BoostGetEnergy extends ExtensionFill { }
interface BootClear extends ExtensionFill { }


// 能量请求任务
type PowerTask = PowerConstant
// 孵化任务
type SpawnTask = CreepRole

// 不同房间共享任务
type ShareTask = {
  submit: Structure | number
  target: Structure
  resource: ResourceConstant
  amount: number
}

// 房间任务
type RoomTask = {
  center?: CenterTask[]
  transfer?: TransferTask[]
  power?: PowerTask[]
  spawn?: SpawnTask[]
}
type SourceType = 'source'
interface SourceMemory {
  id: string
  pos: RoomPosition
  belong: string
}
interface StructureMemory {
  id: string
  pos: RoomPosition
}
interface RoomMemory {
  // 路径缓存
  routeCache: {
    // 键为路径的起点和终点名，例如："12/32/W1N1 23/12/W2N2"，值是使用 Creep.serializeFarPath 序列化后的路径
    [routeKey: string]: {
      path: string,
      lastUsed: number
    }
  },
  // 准备的点
  standBy?: {
    x: number,
    y: number
  },
  // 建筑工地相关
  buildStructure?: BuildStructure
  // 任务
  task?: RoomTask
  // 状态
  stat: {
    // 房间等级
    rcl?: number
    // 布局等级
    layout?: number
    currentState: OperationState
    creepConfigs: Partial<Record<CreepRole, number>>
  }
  // 建筑 
  structure: Partial<Record<StructureConstant, Record<string, StructureMemory>>>
  source: Record<string, SourceMemory>
  war: boolean
  layout: {
    center?: { x: number, y: number }
  }
}
interface SpawnMemory {
  belong?: string | null
}



/**************** Room扩展属性 ********************/
interface Room {
  addAvoidPos(creepName: string, pos: RoomPosition): void
  rmAvoidPos(creepName: string): void
  serializePath(path: PathStep[]): string;
  deserializePath(path: string): PathStep[];
  sources: Source[]
  sourceContainers: StructureContainer[]
  getAvoidPos(): { [creepName: string]: string }
  getAvailableSource(): StructureTerminal | StructureStorage | StructureContainer | Source
  log(content: string, instanceName?: string, color?: Colors, notify?: boolean): void
  // 敌人缓存
  _enemys: Creep[]
  registerContainer(structure: StructureContainer): void
  addSpawnTask(emergency: boolean, ...role: SpawnTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET
  addCenterTask(emergency: boolean, ...task: CenterTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET
  addTransferTask(emergency: boolean, ...task: TransferTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET
  addPowerTask(emergency: boolean, ...task: PowerTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET
  addShareTask(emergency: boolean, ...task: ShareTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET
  nextSpawnTask(): SpawnTask | undefined
  nextCenterTask(): CenterTask | undefined
  nextTransferTask(): TransferTask | undefined
  nextTransferTaskBy<T extends TransferTask>(taskType: T['type']): T | undefined
  nextPowerTask(): PowerTask | undefined
  nextShareTask(): ShareTask | undefined
  finishSpawnTask(): void
  finishCenterTask(): void
  finishTransferTask(): void
  finishPowerTask(): void
  finishShareTask(): void
  needSpawn(role: CreepRole): boolean
  stateChange(state: OperationState): void
  clearHostileStructures(): OK | ERR_NOT_FOUND
  setCenter(flagName: string): OK | ERR_NOT_FOUND
  findOptimalCenter(cnt?: number, visual?: boolean): RoomPosition[]
  planConstruntureSite(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): StructureConstant[] | ScreepsReturnCode
  snapshotLayout(flagName: string): void
  visualizeLayout(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void
  getStructure(structureType: StructureConstant, fresh?: boolean): StructureMemory[]
  getSource(fresh?: boolean): SourceMemory[]
}

type Colors = 'green' | 'blue' | 'yellow' | 'red'

/**************** Extension ********************/

/**************** RoomPosition ********************/
interface RoomPosition {
  directionToPos(direction: DirectionConstant): RoomPosition | undefined
  getFreeSpace(): RoomPosition[]
}

/**************** Extension ********************/

/**************** Creep ********************/
interface Creep {
  // 是否允许对穿
  work(): void;
  isStand(): void;
  standBy(): void;
  chkEnemy(): boolean;
  defense(): void;
  cross(direction: DirectionConstant): OK | ERR_BUSY | ERR_NOT_FOUND;
  requireCross(direction: DirectionConstant): OK | ERR_BUSY;
  upgrade(): ScreepsReturnCode;
  buildStructure(): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND;
  nextStructure(): ConstructionSite | undefined | null;
  fillWall(): OK | OK | ERR_NOT_FOUND
  getFrom(target: Structure | Source): ScreepsReturnCode;
  giveTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode;
  attackFlag(flag: string, healerName?: string): boolean;
  dismantleFlag(flag: string, healerName?: string): boolean;
  canMoveWith(creep: AnyCreep): boolean;
  healTo(creep: AnyCreep): void;
  serializeFarPath(positions: RoomPosition[]): string;
  serializePath(positions: PathStep[]): string;
  _move(target: DirectionConstant): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  dash(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  race(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  marathon(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  goTo(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  goByCache(): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  log(content: string, color?: Colors, notify?: boolean): void;
}

/**************** terminal ********************/

/**
 * 帮助信息的必要信息
 */
interface ModuleDescribe {
  name: string // 名称
  describe: string // 描述
  api: ApiDescribe[] // api命令
}


/**
 * Api描述
 */
interface ApiDescribe {
  title: string // 标题
  describe?: string
  params?: {
    name: string // 参数名
    describe?: string // 描述
  }[]
  functionName: string // 函数名
  commandType?: boolean // 命是否为直接执行类型：不需要使用 () 就可以执行的命令
  result?: string // 返回值


}

/*********************** Global 全局声明 ************************/

declare function addShareTask(emergency: boolean, ...task: ShareTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET;
declare function nextShareTask(): ShareTask | undefined;
declare function finishShareTask(): void;



/*****************Creep Controller Module ********************/
type OperationState = 'claim' | 'container' | 'storage' | 'link'


/****************** Spawn 扩展 ******************/
interface StructureSpawn {
  work(): void
  canSpawn(body: BodyPartConstant[],): ScreepsReturnCode
  lend(by: string): boolean
  canLend(by: string): boolean
  remend(by: string): boolean
  needEnergy(): void
  doSpawnTask(): void
}

interface StructureTower {
  work(): void
  needEnergy(): void
}

/**
 * 基地布局信息
 */
type BaseLayout = {
  // 不同等级下应建造的建筑
  [controllerLevel in 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8]: {
    // 该类型建筑应该被放置在什么地方
    [structureType in StructureConstant]?: ([number, number] | null)[]
  }
}

type PlanToolData = {
  rcl: number
  buildings: {
    [structureType in StructureConstant]?: { x: number, y: number }[]
  }
}


interface Structure {
  my?: boolean
}
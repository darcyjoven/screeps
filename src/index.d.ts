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
  isNeed?: (room: Room, creepName: string, preMemory: CreepMemory) => boolean
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
interface EmptyData { }
interface HarvesterData {
  sourceId: string
  targetId: string
}
interface WorkerData {
  // sourceId:string
  targetId: string
}
interface ProcessorData {
  x: number
  y: number
}
interface RemoteHarvesterData {
  sourceFlagName: string
  targetId: string
  spawnRoom: string
}
interface HealerData {
  targetFlagName: string
  reSpawn: boolean
}
type CreepData = EmptyData | WorkerData | ProcessorData | RemoteHarvesterData |
  HealerData

/**************** 内存管理 ********************/
interface Memory {
}
// Creep的内存管理
interface CreepMemory {
  role: string
  reSpawn: boolean
  ready: boolean
  data: {}
}

interface FlagMemory { }
interface PowerCreepMemory { }
// 房间的内存管理 
interface RoomMemory {
  spawnList: string[] // 孵化清单
}
interface SpawnMemory {
  belong: string | null
}

/**************** Room扩展属性 ********************/
interface Room {
  sources: Source[]
  sourceContainers: StructureContainer[]
}

type Colors = 'green' | 'blue' | 'yellow' | 'red'



/**************** Extension ********************/

/**************** RoomPosition ********************/
interface RoomPosition {
  directionToPos(direction: DirectionConstant): RoomPosition | undefined
  getFreeSpace(): RoomPosition[]
}
/**************** Room ********************/
interface Room {

}

/**************** Creep ********************/
interface Room {

}
/**************** Spawn ********************/
interface StructureSpawn {

}

/**************** Extension ********************/
/**************** Creep ********************/
interface Creep {
  work(): void;
  standBy(): void;
  defense(): void;
  cross(direction: DirectionConstant): OK | ERR_BUSY | ERR_NOT_FOUND;
  requireCross(direction: DirectionConstant): OK | ERR_BUSY;
  upgrade(): ScreepsReturnCode;
  buildStructure(): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND;
  getFrom(target: Structure | Source): ScreepsReturnCode;
  giveTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode;
  attackFlag(flag: string, healer: string): boolean;
  dismantleFlag(flag: string, healer: string): boolean;
  healTo(creep: Creep): void;
  dash(target: RoomPosition): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET;
  race(target: RoomPosition): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET;
  marathon(target: RoomPosition): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET;
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


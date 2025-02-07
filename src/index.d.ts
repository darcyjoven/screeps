
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
type DenfenderRole = 'Denfender' | 'Ranged' | 'Healer'
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
type CreepRole = BaseRole | DenfenderRole | RemoteRole | AdvanceRole

type BodySet = Partial<Record<BodyPartConstant, number>>

type BodyConfig = Record<BodyConfigRole,
  [BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]>

interface Memory {
  creepConfigs: {
    [creepName: string]: {
      name: string,
      spawnRoom: string,
      bodys: BodyPartConstant[],
      data: object
    }
  }
}

interface CreepMemory {
  reSpawn: boolean
}


type Colors = 'green' | 'blue' | 'yellow' | 'red'
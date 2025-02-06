
/*
creep身体种类
*/
type BodyContent = MOVE | WORK | CARRY | ATTACK | RANGED_ATTACK | TOUGH | HEAL | CLAIM;


/*
  角色类型
*/
type HARVESTER = 'harvester'
type WORKER = 'worker'
type UPGRADER = 'upgrader'
type ATTACKER = 'attacker'
type HEALER = 'healer'
type DISMANTLER = 'dismantler'
// type manager = 'manager'
// type processor = 'processor'
// type reserver = 'reserver'
// type remoteHarvester = 'remoteHarvester'

// 角色
type Roles = HARVESTER | WORKER | UPGRADER | ATTACKER | HEALER | DISMANTLER

interface BodySet {
  [MOVE]?: number
  [CARRY]?: number
  [ATTACK]?: number
  [RANGED_ATTACK]?: number
  [WORK]?: number
  [CLAIM]?: number
  [TOUGH]?: number
  [HEAL]?: number
}

type BodyArray = [BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]

type BodyConfigs = {
  [type in Roles]: BodyArray
}

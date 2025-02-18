import { filter } from "lodash"
import { fillerMinEnemy } from "setting/global"
import { info } from "utils/terminal"

const TRANSFER_DEATH_LIMIT = 20

export const roles: {
  [role in BaseRole]: (data: CreepData) => CreepCycle
} = {
  /**
   * 采集者
   * 从指定 source 中获取能量 > 将能量存放到身下的 container 中
   */
  Harvester: ((data: HarvesterData): CreepCycle => ({
    // 向 container 或者 source 移动
    // 在这个阶段中，targetId 是指 container 或 conatiner 的工地或 source
    prepare: (creep: Creep) => {
      let target: StructureContainer | Source | ConstructionSite | null = null
      // 如果没有缓存获取目标缓存
      let data: HarvesterData = creep.memory.data as HarvesterData
      info(['creepPrepare', 'harvester'], 'prepare 开始', 'name', creep.name, 'data', data)
      if (data.targetId) {
        target = Game.getObjectById<StructureContainer | Source | ConstructionSite>(data.targetId as Id<StructureContainer | Source | ConstructionSite>)
      }
      let source = Game.getObjectById<Source>(data.sourceId as Id<Source>)
      if (!source) {
        const sources = creep.room.find(FIND_SOURCES, {
          filter: s => {
            if (!creep.room.memory.structure ||
              !creep.room.memory.structure.source ||
              !creep.room.memory.structure.source[s.id]) return true
            if (!creep.room.memory.structure.source[s.id].belong ||
              creep.room.memory.structure.source[s.id].belong === creep.name ||
              !Game.creeps[creep.room.memory.structure.source[s.id].belong!]
            ) return true
            return false
          }
        })
        if (sources.length > 0) {
          source = sources[0]
          if (!creep.room.memory.structure) creep.room.memory.structure = {}
          if (!creep.room.memory.structure.source) creep.room.memory.structure.source = { [source.id]: { belong: creep.name } }
          creep.room.memory.structure.source[source.id] = { belong: creep.name }
        }
      }
      // 没有缓存或者缓存失效要重新获取
      if (!target && source) {
        // 先尝试获取 container
        const containers = source.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })
        // 找到了就把 container 当做目标
        if (containers.length > 0) target = containers[0]
      }
      // 还没找到就找 container 的工地
      if (!target && source) {
        const constructionSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })
        if (constructionSite.length > 0) target = constructionSite[0]
      }
      info(['creepPrepare', 'harvester'], 'target 获取', { target })
      info(['creepPrepare', 'harvester'], 'source 获取', { source })
      // 如果还是没找到的话就用 source 当作目标
      if (!target) target = source
      if (target) {
        data.targetId = target!.id
        creep.memory.data = data
      } else return false

      // 设置移动范围并进行移动（source 走到附近、container 和工地就走到它上面）
      const range = target instanceof Source ? 1 : 0
      creep.goTo(target.pos)

      // 抵达位置了就准备完成
      if (creep.pos.inRangeTo(target.pos, range)) return true
      return false
    },
    // 因为 prepare 准备完之后会先执行 source 阶段，所以在这个阶段里对 container 进行维护
    // 在这个阶段中，targetId 仅指 container
    source: (creep: Creep) => {
      creep.say('stand')

      // 没有能量就进行采集，因为是维护阶段，所以允许采集一下工作一下
      if (creep.store[RESOURCE_ENERGY] <= 0) {
        const source = Game.getObjectById(data.sourceId as Id<Source>)
        if (source) creep.getFrom(source)
        return false
      }

      // 获取 prepare 阶段中保存的 targetId
      let target = Game.getObjectById((creep.memory.data as HarvesterData).targetId as Id<StructureContainer | Source>)

      // 存在 container，把血量修满
      if (target && target instanceof StructureContainer) {
        creep.repair(target)
        // 血修满了就正式进入采集阶段
        return target.hits >= target.hitsMax
      }

      // 不存在 container，开始新建，首先尝试获取工地缓存，没有缓存就新建工地
      let constructionSite: ConstructionSite | undefined | null = null
      if (!creep.memory.constructionSiteId) creep.pos.createConstructionSite(STRUCTURE_CONTAINER)
      else constructionSite = Game.getObjectById(creep.memory.constructionSiteId as Id<ConstructionSite>)

      // 没找到工地缓存或者工地没了，重新搜索
      if (!constructionSite) constructionSite = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).find(s => s.structureType === STRUCTURE_CONTAINER)

      // 还没找到就说明有可能工地已经建好了，进行搜索
      if (!constructionSite) {
        const container = creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_CONTAINER)

        // 找到了造好的 container 了，添加进房间
        if (container) {
          creep.room.registerContainer(container as StructureContainer)
          return true
        }

        // 还没找到，等下个 tick 会重新新建工地
        return false
        // 找到了就缓存 id
      } else creep.memory.constructionSiteId = constructionSite.id
      return (creep.build(constructionSite) === OK)
    },
    // 采集阶段会无脑采集，过量的能量会掉在 container 上然后被接住存起来
    target: (creep: Creep): boolean => {
      const target = Game.getObjectById((data).sourceId as Id<Source>)
      if (target) creep.getFrom(target)
      else return false
      // 快死了就把身上的能量丢出去，这样就会存到下面的 container 里，否则变成墓碑后能量无法被 container 自动回收
      if (creep.ticksToLive && creep.ticksToLive < 2) creep.drop(RESOURCE_ENERGY)
      return false
    },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory) => true,
    bodys: "Harvester"
  })) as (data: CreepData) => CreepCycle,
  Worker: ((data: CreepData): CreepCycle => ({
    prepare: (creep: Creep): boolean => { return true },
    target: (creep: Creep): boolean => { return true },
    source: (creep: Creep): boolean => { return true },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
    bodys: "Collector"
  })) as (data: CreepData) => CreepCycle,
  Hauler: ((data: CreepData): CreepCycle => ({
    prepare: (creep: Creep): boolean => { return true },
    target: (creep: Creep): boolean => { return true },
    source: (creep: Creep): boolean => { return true },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
    bodys: "Worker"
  })) as (data: CreepData) => CreepCycle,
  /**
   * 收集者
   * 从指定 source 中获取资源 > 将资源转移到指定建筑中
   */
  Collector: ((data: HarvesterData): CreepCycle => ({
    prepare: (creep: Creep): boolean => {
      const target = Game.getObjectById(data.targetId as Id<Structure>)
      if (!target) return false
      // 已经到附近了就准备完成
      if (creep.pos.isNearTo(target.pos)) return true
      // 否则就继续移动
      else {
        creep.goTo(target.pos)
        return false
      }
    },
    source: (creep: Creep): boolean => {
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true

      const source = Game.getObjectById<Source>(data.sourceId as Id<Source>)
      if (!source) {
        creep.say('找不到source')
        return false
      }

      // 开始采集
      const harvestResult = creep.harvest(source)
      if (harvestResult === ERR_NOT_IN_RANGE) creep.goTo(source.pos)
      // TODO 重新发布任务
      // else if (actionResult === ERR_NOT_ENOUGH_RESOURCES) {
      //   // 如果满足下列条件就重新发送 regen_source 任务
      //   if (
      //     // creep 允许重新发布任务
      //     (!creep.memory.regenSource || creep.memory.regenSource < Game.time) &&
      //     // source 上没有效果
      //     (!source.effects || !source.effects[PWR_REGEN_SOURCE])
      //   ) {
      //     // 并且房间内的 pc 支持这个任务
      //     if (creep.room.memory.powers && creep.room.memory.powers.split(' ').includes(String(PWR_REGEN_SOURCE))) {
      //       // 添加 power 任务，设置重新尝试时间
      //       creep.room.addPowerTask(PWR_REGEN_SOURCE)
      //       creep.memory.regenSource = Game.time + 300
      //     }
      //     else creep.memory.regenSource = Game.time + 1000
      //   }
      // }

      // 快死了就把能量移出去
      if (creep.ticksToLive && creep.ticksToLive <= 3) return true
      return true
    },
    target: (creep: Creep): boolean => {
      const target = Game.getObjectById(data.targetId as Id<Structure>)
      // 找不到目标,自杀重新发布规划
      if (!target) {
        creep.say('找不到目标')
        // 发布spawn
        creep.suicide()
        return false
      }

      if (creep.giveTo(target, RESOURCE_ENERGY) !== OK) return false
      return creep.store.getUsedCapacity() === 0
    },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
    bodys: "Collector"
  })) as (data: CreepData) => CreepCycle,
  /**
     * 升级者
     * 不会采集能量，只会从指定目标获取能量
     * 从指定建筑中获取能量 > 升级 controller
     */
  Upgrader: ((data: WorkerData): CreepCycle => ({
    source: (creep: Creep): boolean => {
      // 因为只会从建筑里拿，所以只要拿到了就去升级
      if (creep.store[RESOURCE_ENERGY] > 0) return true

      const source = Game.getObjectById(data.sourceId as Id<StructureTerminal | StructureStorage | StructureContainer>)
      if (!source) return false
      // 如果来源是 container 的话就等到其中能量大于指定数量再拿（优先满足 filler 的能量需求）
      if (source.structureType === STRUCTURE_CONTAINER
        && source.store[RESOURCE_ENERGY] <= fillerMinEnemy) return false

      // 获取能量
      const result = creep.getFrom(source)
      // 但如果是 Container 或者 Link 里获取能量的话，就不会重新运行规划
      if (
        (result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_INVALID_TARGET) &&
        (source instanceof StructureTerminal || source instanceof StructureStorage)
      ) {
        // 如果发现能量来源（建筑）里没有能量了，就自杀并重新运行 upgrader 发布规划
        // creep.room.releaseCreep('upgrader')
        // TODO 重新孵化
        creep.suicide()
      }
      return false
    },
    target: (creep: Creep): boolean => {
      return creep.upgrade() === ERR_NOT_ENOUGH_RESOURCES
    },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
    bodys: "Upgrader"
  })) as (data: CreepData) => CreepCycle,
  /**
     * 建筑者
     * 只有在有工地时才会生成
     * 从指定结构中获取能量 > 查找建筑工地并建造
     * 
     * @param spawnRoom 出生房间名称
     * @param sourceId 要挖的矿 id
     */
  Builder: ((data: WorkerData): CreepCycle => ({
    // 根据 sourceId 对应的能量来源里的剩余能量来自动选择新的能量来源
    source: (creep: Creep): boolean => {
      // 塞满了就去工作了
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true

      // 寻找能量来源
      let source: null | StructureStorage | StructureTerminal | StructureContainer | Source
      if (!creep.memory.data || !(creep.memory.data as WorkerData).sourceId) {
        source = creep.room.getAvailableSource()
        let data = creep.memory.data as WorkerData
        data.sourceId = source.id
        creep.memory.data = data
      } else source = Game.getObjectById((creep.memory.data as WorkerData).sourceId as Id<StructureStorage | StructureTerminal | StructureContainer | Source>)

      if (!source) return false
      return creep.getFrom(source) === OK
    },
    target: (creep: Creep): boolean => {
      // 刷墙
      if (creep.memory.fillWallId) creep.fillWall()
      // 工地
      else if (creep.buildStructure() !== ERR_NOT_FOUND) { }
      // upgrader
      else if (creep.upgrade()) { }

      return creep.store.getUsedCapacity() === 0
    },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => {
      // 工地都建完就就使命完成
      const targets: ConstructionSite[] = room.find(FIND_MY_CONSTRUCTION_SITES)
      return targets.length > 0 ? true : false
    },
    bodys: "Builder"
  })) as (data: CreepData) => CreepCycle,
  /**
     * 填充单位
     * 从 container 中获取能量 > 执行房间物流任务
     * 在空闲时间会尝试把能量运输至 storage
     */
  Filler: ((data: WorkerData): CreepCycle => ({
    // 一直尝试从 container 里获取能量，不过拿到了就走
    source: (creep: Creep): boolean => {
      if (creep.store[RESOURCE_ENERGY] > 0) return true
      // 获取container
      let source = Game.getObjectById(data.sourceId as Id<StructureContainer | StructureStorage>)
      // container 没能量了就尝试从 storage 里获取能量执行任务
      // 原因是有了 sourceLink 之后 container 会有很长一段时间没人维护（直到 container 耐久掉光）
      // 如果没有这个判断的话 filler 会在停止孵化之前有好几辈子都呆在空 container 前啥都不干
      if (!source || source.store[RESOURCE_ENERGY] <= 0) source = creep.room.storage!

      return creep.getFrom(source) === OK
    },
    // 维持房间能量填充
    target: (creep: Creep): boolean => {
      // TODO 这里需要任务系统
      return true
    },
    // 能量来源（container）没了就自觉放弃
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean =>
      _.some(room.sourceContainers, container => container.id === data.sourceId),
    bodys: "Collector"
  })) as (data: CreepData) => CreepCycle,
  /**
     * 中心搬运者
     * 从房间的中央任务队列 Room.memory.centerTransferTasks 中取出任务并执行
     * 
     */
  Processor: ((data: ProcessorData): CreepCycle => ({
    // 移动到指定位置
    prepare: (creep: Creep): boolean => {
      if (creep.pos.isEqualTo(data.x, data.y)) return true
      else {
        creep.goTo(new RoomPosition(data.x, data.y, creep.room.name))
        return false
      }
    },
    source: (creep: Creep): boolean => {
      // 快死了就拒绝执行任务
      if (creep.ticksToLive && creep.ticksToLive <= 5) return false
      // 需要任务系统
      return true
    },
    target: (creep: Creep): boolean => { return true },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
    bodys: "Processor"
  })) as (data: CreepData) => CreepCycle,
  /**
     * 房间物流运输者
     * 执行 ROOM_TRANSFER_TASK 中定义的任务
     * 任务处理逻辑定义在 transferTaskOperations 中
     */
  Manager: ((data: WorkerData): CreepCycle => ({
    source: (creep: Creep): boolean => {
      if (creep.ticksToLive && creep.ticksToLive <= TRANSFER_DEATH_LIMIT) return deathPrepare(creep, data.sourceId)
      // TODO 需要任务系统
      return true
    },
    target: (creep: Creep): boolean => {
      // TODO 需要任务系统
      return true
    },
    isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
    bodys: "Manager"
  })) as (data: CreepData) => CreepCycle,
}
/**
 * 快死时的后事处理
 * 将资源存放在对应的地方
 * 存完了就自杀
 * 
 * @param creep manager
 * @param sourceId 能量存放处
 */
const deathPrepare = function (creep: Creep, sourceId: string): false {
  if (creep.store.getUsedCapacity() > 0) {
    for (const resourceType in creep.store) {
      let target: StructureStorage | StructureTerminal | null | undefined
      // 不是能量就放到 terminal 里
      if (resourceType != RESOURCE_ENERGY && resourceType != RESOURCE_POWER && creep.room.terminal) {
        target = creep.room.terminal
      }
      // 否则就放到 storage 或者玩家指定的地方
      else target = sourceId ? Game.getObjectById(sourceId as Id<StructureStorage>) : creep.room.storage

      if (!target) return false
      // 转移资源
      creep.goTo(target.pos)
      creep.transfer(target, <ResourceConstant>resourceType)

      return false
    }
  }
  else creep.suicide()

  return false
}
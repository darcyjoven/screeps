import { STRUCTURE_TOWER_MIN_ENERGY_WAR, TASK_BOOSTCLEAR, TASK_BOOSTGETENERGY, TASK_BOOSTGETRESOURCE, TASK_EXTENSION, TASK_LABIN, TASK_LABOUT, TASK_NUKER, TASK_POWER, TASK_TOWER } from "setting/global";


const defaultSoure = (creep: Creep, task: TransferTask, sourceId: string): boolean => {
    if (creep.store[RESOURCE_ENERGY] > 0) return true
    let source: StructureStorage | null = Game.getObjectById(sourceId as Id<StructureStorage>)
    if (!source) {
        source = creep.room.storage || null
    }
    if (!source) return false
    creep.getFrom(source)
    return false
}
/**
 * [ ] 房间物流任务处理
 */
export const transferTaskOperations: Record<TransferTaskConstant, TransferTaskOperation> = {
    [TASK_EXTENSION]: {
        source: defaultSoure,
        target: (creep, task): boolean => {
            let target: StructureExtension | StructureSpawn | null = null
            // 有缓存就用缓存
            if (creep.memory.fillStructureId) {
                target = Game.getObjectById(creep.memory.fillStructureId as Id<StructureExtension | StructureSpawn>)
                // 如果找不到对应的建筑或者已经填满了就移除缓存
                if (!target || !(_.includes([STRUCTURE_EXTENSION, STRUCTURE_SPAWN], target.structureType)) ||
                    target.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    delete creep.memory.fillStructureId
                    target = null
                }
            }
            // 没缓存就重新获取
            if (!target) {
                target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: s => (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
                        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                })
                if (!target) {
                    creep.room.finishTransferTaskBy(task.type)
                    return true
                }
                creep.memory.fillStructureId = target.id
            }
            // 这里应该是extension填满之后，再返回OK
            const result = creep.giveTo(target, RESOURCE_ENERGY)
            if (result !== OK && result !== ERR_NOT_IN_RANGE) creep.log(`extension ${result}`)
            if (creep.store[RESOURCE_ENERGY] === 0) return true
            return false
        }
    },
    [TASK_TOWER]: {
        source: defaultSoure,
        target: (creep, task: TransferTask): boolean => {
            let target: StructureTower | null = null
            const towetTask: TowerFill = task as TowerFill

            // 有缓存的话
            if (creep.memory.fillStructureId) {
                target = Game.getObjectById(creep.memory.fillStructureId as Id<StructureTower>)
                // 如果找不到对应的建筑或者已经填满了就移除缓存
                if (!target || target.structureType !== STRUCTURE_TOWER ||
                    target.store.getFreeCapacity(RESOURCE_ENERGY) >= STRUCTURE_TOWER_MIN_ENERGY_WAR) {
                    delete creep.memory.fillStructureId
                    target = null
                }
            }
            // 没缓存的话
            if (!target) {
                // 先检查下任务发布 tower 能量是否足够
                target = Game.getObjectById(towetTask.id as Id<StructureTower>)
                // 任务tower不需要填充，检查下其它tower是否需要填充
                if (!target || target.store[RESOURCE_ENERGY] > STRUCTURE_TOWER_MIN_ENERGY_WAR) {
                    const towers = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] <= STRUCTURE_TOWER_MIN_ENERGY_WAR
                    })
                    // 如果还没找到的话就算完成任务了
                    if (towers.length <= 0) {
                        creep.room.finishTransferTaskBy(task.type)
                        return true
                    }
                    target = creep.pos.findClosestByRange(towers) as StructureTower
                }
                creep.memory.fillStructureId = target.id
            }
            // 开始填充能量
            const result = creep.giveTo(target, RESOURCE_ENERGY)
            if (result != OK && result != ERR_NOT_IN_RANGE) creep.say(`塔填充 ${result}`)
            if (creep.store[RESOURCE_ENERGY] === 0) return true
            return false
        }
    },
    [TASK_NUKER]: {
        source: (creep, task, sourceId): boolean => {
            // 有资源直接去填充
            if (creep.store[(task as NukerFill).resouce] > 0) return true

            // 获取source
            // 如果是energy 直接走默认source 
            if ((task as NukerFill).resouce === RESOURCE_ENERGY) {
                return defaultSoure(creep, task, sourceId)
            } else {
                let sourceStructure = creep.room.terminal
                const nuker = Game.getObjectById((task as NukerFill).id as Id<StructureNuker>)

                if (!sourceStructure || !nuker) {
                    creep.room.finishTransferTask()
                    creep.log('nuker 填充任务，未找到 Storage 或者 Nuker')
                    return false
                }
                // 将creep身上energy释放
                if (!creep.clearStore(RESOURCE_ENERGY)) return false

                // 获取应拿的数量
                let getAmount = Math.min(
                    creep.store.getFreeCapacity((task as NukerFill).resouce),
                    sourceStructure.store[(task as NukerFill).resouce],
                    nuker.store.getFreeCapacity((task as NukerFill).resouce) || 0,
                )

                if (getAmount <= 0) {
                    return false
                }
                // 拿去资源
                creep.goTo(sourceStructure.pos)
                const result = creep.withdraw(sourceStructure, (task as NukerFill).resouce, getAmount)
                if (result === OK) return true
                else if (result != ERR_NOT_IN_RANGE) creep.log(`nuker 填充任务，withdraw ${result}`, 'red')
            }
            return false
        },
        target: (creep, task): boolean => {
            // 获取 nuker
            let target = Game.getObjectById((task as NukerFill).id as Id<StructureNuker>)
            if (!target) {
                creep.room.finishTransferTask()
                return false
            }
            // 转移资源
            const result = creep.giveTo(target, (task as NukerFill).resouce)
            if (result === OK) {
                creep.room.finishTransferTask()
                return true
            } else if (result != ERR_NOT_IN_RANGE) creep.say(`核弹填充 ${result}`)
            return false
        }
    },
    [TASK_POWER]: {
        source: (creep, task, sourceId): boolean => {

            return true
        },
        target: (creep, task): boolean => {

            return true
        }
    },
    [TASK_LABIN]: {
        source: (creep, task, sourceId): boolean => {

            return true
        },
        target: (creep, task): boolean => {

            return true
        }
    },
    [TASK_LABOUT]: {
        source: (creep, task, sourceId): boolean => {

            return true
        },
        target: (creep, task): boolean => {

            return true
        }
    },
    [TASK_BOOSTGETRESOURCE]: {
        source: (creep, task, sourceId): boolean => {

            return true
        },
        target: (creep, task): boolean => {

            return true
        }
    },
    [TASK_BOOSTGETENERGY]: {
        source: (creep, task, sourceId): boolean => {

            return true
        },
        target: (creep, task): boolean => {

            return true
        }
    },
    [TASK_BOOSTCLEAR]: {
        source: (creep, task, sourceId): boolean => {

            return true
        },
        target: (creep, task): boolean => {

            return true
        }
    }
}
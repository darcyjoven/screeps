import { creepDefaultMemory } from "setting/creep";
import ConfigExtension from "./config";
import { log } from "./tool";

export default class CreepControl extends ConfigExtension {
    /**
     * Creep数量控制
     * 
     * Room.memory.stat 未初始化，需要判断当前阶段并初始化
     * 
     */
    public creepNumberControl(): void {
        // 进行初始化
        if (!this.memory.stat || (this.memory.stat.currentState === 'claim' &&
            _.size(Game.creeps) === 0 && !this.nextSpawnTask()
        )) {
            const state = getCurrentState(this)
            this.stateChange(state)
        }
    }
    /**
     * 阶段转换
     * 
     * 1. 更新memory 
     * 
     * 2. 发布新的孵化任务
     * @param state 
     */
    public stateChange(state: OperationState): void {
        log('memory', 'room', this.name, 'stateChange', state, 'tick', Game.time)
        // 刷新建筑
        this.freshAllStructue()
        // 保存旧的配置,用来判断creep是否需要suicide 
        const oldConfig = this.memory.stat?.creepConfigs || {}
        // 直接覆盖原来的值
        this.memory.stat = {
            currentState: state,
            creepConfigs: stateControls[state]
        }

        // 重新设置孵化任务
        // 清空孵化任务
        if (this.memory.task) this.memory.task.spawn = []
        let newConfig = _.cloneDeep(this.memory.stat.creepConfigs)
        // 遍历现存的Creep
        this.find(FIND_MY_CREEPS).forEach(creep => {
            const role = creep.memory.role;
            if (newConfig[role] === undefined) {
                // 处理旧配置逻辑,如果旧配置中有这个角色，且数量大于0，则不需要孵化
                if (!!oldConfig[role] && oldConfig[role]! > 0) {
                    creep.memory.noNeed = true
                }
                return
            }
            newConfig[role]--
            if (newConfig[role] <= 0) {
                // 如果数量小于0,表示数量超过配置,也需要比较旧配置
                if (!!oldConfig[role] && oldConfig[role]! > 0) {
                    creep.memory.noNeed = true
                }
                newConfig[role] = 0
            }
        })
        // 将剩余数量加入孵化任务
        for (const role in newConfig) {
            for (let i = 0; i < newConfig[role as CreepRole]!; i++) {
                this.addSpawnTask(false, {
                    role: role as CreepRole,
                    name: "",
                    memory: creepDefaultMemory[role as CreepRole]
                })
            }
        }
    }
    /**
     * 清除死亡的creep内存
     */
    public clearCreepMemory(): void {
        let toDel: string[] = []
        for (const name in Memory.creeps) {
            if (!_.some(Game.creeps, creep => creep.name === name)) toDel.push(name)
        }
        toDel.forEach(name => {
            delete Memory.creeps[name]
            this.log(`清除死亡creep[${name}]的内存`, 'creep', 'red')
        })
    }
    /**
     * 判断一个角色是否需要孵化
     * 
     * 当角色快死亡时会调用此方法,所以creep和task数量都需要判断
     * 
     */
    public needSpawn(role: CreepRole): boolean {
        // 当前存活数量
        const creepCnt = this.find(FIND_MY_CREEPS, {
            filter: s => s.memory.role === role
        }).length
        // 孵化队列
        const taskCnt = _.filter(this.memory.task?.spawn || [], t => t.role === role).length
        if (!this.memory.stat) return false
        // 如果大于配置的数量，不需要孵化
        const configCnt = this.memory.stat.creepConfigs[role] || 0
        const cnt = creepCnt + taskCnt
        log('memory', 'needSpawn', '', 'role', role, 'creepCnt', creepCnt, 'taskCnt', taskCnt, 'configCnt', configCnt)
        if (cnt > configCnt) return false
        return true
    }
    /**
     * 发布建造者
     * 
     * 如果存在工地，但是creep和task数量不满足当前配置，则增加孵化任务
     * 
     * 此函数应该有room.work调用
     */
    public releaseBuilder(): void {
        if (!this.memory.spawnBuilder) return
        this.memory.spawnBuilder = false
        const constructureSites = this.find(FIND_MY_CONSTRUCTION_SITES)
        // 有工地
        if (constructureSites && constructureSites.length > 0) {
            // 获得配置Builder数量
            let cnt = stateControls[this.memory.stat?.currentState || 'claim'].Builder || 0
            log('release', 'config.lenght', cnt)
            if (cnt <= 0) return
            cnt -= this.find(FIND_MY_CREEPS, { filter: c => c.memory.role === 'Builder' }).length
            log('release', 'after find creep.lenght', cnt)
            if (cnt <= 0) return
            cnt -= this.memory.task?.spawn?.filter(s => s.role === 'Builder').length || 0
            log('release', 'after task lenght', cnt)
            // [x] 增加一个查询正在孵化中creep功能
            this.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_SPAWN }).forEach(s => {
                if (s.spawning && s.spawning.name.indexOf('Builder') !== -1) cnt -= 1
            })
            log('release', 'after spawning lenght', cnt)
            if (cnt <= 0) return
            this.addSpawnTask(false, ...(new Array(cnt).fill({ role: 'Builder', name: '', memory: creepDefaultMemory['Builder'] } as SpawnTask)))
        }
    }
}

const stateControls: Record<OperationState, Partial<Record<CreepRole, number>>> = {
    claim: {
        Harvester: 2,
        Builder: 1,
    },
    container: {
        Harvester: 2,
        Builder: 1,
        Filler: 2,
        Upgrader: 4,
    },
    storage: {
        Harvester: 2,
        Builder: 2,
        Filler: 2,
        Upgrader: 6,
        Manager: 1,
    },
    link: {
        Collector: 2,
        Builder: 2,
        Filler: 2,
        Upgrader: 8,
        Manager: 1,
        Processor: 1,
    }
}

/**
 * 判断房间的运维阶段
 * @param room 
 * @returns 
 */
export const getCurrentState = (room: Room): OperationState => {
    if (!room.controller) return 'claim'

    if (room.controller.level >= 5) {
        // 判断是否时link阶段
        const links = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_LINK
        })
        if (links && links.length > 0) return 'link'
    }
    if (room.controller.level >= 4) {
        // 判断是否时store阶段
        const storage = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_STORAGE
        })
        if (storage && storage.length > 0) return 'storage'
    }
    // 检查container是否建立了，且有两个
    const containers = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
    })
    if (containers && containers.length >= 2) return 'container'
    else return 'claim'
}


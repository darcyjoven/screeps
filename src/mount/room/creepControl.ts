import ConfigExtension from "./config";
import { info } from "utils/terminal";
import { getBodyConfig } from "setting/creep";
import { generateCreepId } from "utils/tool";

export default class CreepControl extends ConfigExtension {
    /**
     * Creep数量控制
     * 
     * 1. Room.memory.stat 未初始化，需要判断当前阶段并初始化
     * 
     * 2. 获取可以使用的spawn，进行孵化任务
     */
    public creepNumberControl(): void {
        info(['roomMount', 'creepControl'], '房间creep数量控制')
        // 进行初始化
        if (!this.memory.stat) {
            info(['roomMount', 'creepControl'], '房间creep数量控制', '初始化配置参数')
            const state = getCurrentState(this)
            info(['roomMount', 'creepControl'], '判断当前阶段', state)
            this.stateChange(state)
        }
        // 获取可以使用的spawn
        const spawns = this.find(FIND_MY_SPAWNS, {
            filter: s => s.canLend('creepControl')
        })

        // 没有可用的spawn，不需要孵化
        info(['roomMount', 'creepControl'], '寻找可以使用的spawn:', spawns.length)
        if (spawns.length <= 0) return
        // 没有任务，不需要孵化
        if (!this.nextSpawnTask()) {
            info(['roomMount', 'creepControl'], '无spawn任务')
            return
        }

        // 开始孵化
        for (const spawn of spawns) {
            const task = this.nextSpawnTask()
            if (!task) break // 断言
            if (!spawn.lend('creepControl')) {
                info(['roomMount', 'creepControl'], 'spawn不可借用', 'name', spawn.name)
                return
            }
            const name = `${this.name}/${task}/${generateCreepId()}`
            const body = getBodyConfig(task, this.controller?.level || 1)
            const reulst = spawn.spawnCreep(body, name)
            info(['roomMount', 'creepControl'], 'SpawnCreep', 'name', name, 'body', body, 'result', reulst)
            if (reulst === OK) {
                // 孵化成功
                this.finishSpawnTask()
            }
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
        // 保存旧的配置,用来判断creep是否需要suicide 
        const oldConfig = this.memory.stat?.creepConfigs || {}
        // 直接覆盖原来的值
        this.memory.stat = {
            currentState: state,
            creepConfigs: stateControls[state]
        }
        info(['roomMount', 'stateChange'], '阶段转换', 'old', oldConfig, 'new', this.memory.stat)

        // 重新设置孵化任务
        // 清空孵化任务
        this.memory.spawnList = []
        let newConfig = _.cloneDeep(this.memory.stat.creepConfigs)
        // 遍历现存的Creep
        this.find(FIND_MY_CREEPS).forEach(creep => {
            const role = creep.memory.role;
            if (newConfig[role] === undefined) {
                // 处理旧配置逻辑,如果旧配置中有这个角色，且数量大于0，则不需要孵化
                if (!!oldConfig[role] && oldConfig[role]! > 0) {
                    creep.memory.noNeed = true
                    info(['roomMount', 'stateChange'], '不再需要孵化', 'name', creep.name)
                }
                return
            }
            newConfig[role]--
            if (newConfig[role] <= 0) {
                // 如果数量小于0,表示数量超过配置,也需要比较旧配置
                if (!!oldConfig[role] && oldConfig[role]! > 0) {
                    creep.memory.noNeed = true
                    info(['roomMount', 'stateChange'], '不再需要孵化', 'name', creep.name)
                }
                newConfig[role] = 0
            }
        })
        info(['roomMount', 'stateChange'], '加入孵化队列', 'task', newConfig)
        // 将剩余数量加入孵化任务
        for (const role in newConfig) {
            for (let i = 0; i < newConfig[role as CreepRole]!; i++) {
                this.addSpawnTask(false, role as CreepRole)
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
        let cnt = 0
        // 当前存活数量
        cnt += this.find(FIND_MY_CREEPS, {
            filter: s => s.memory.role === role
        }).length
        // 孵化队列
        cnt += _.filter(this.memory.task?.spawn || [], t => t === role).length
        if (!this.memory.stat) return false
        // 如果大于配置的数量，不需要孵化
        if (cnt > ((this.memory.stat.currentState as Partial<Record<CreepRole, number>>)[role] || 0)) return false
        return false
    }
}

const stateControls: Record<OperationState, Partial<Record<CreepRole, number>>> = {
    link: {
        Harvester: 2,
        Builder: 1,
    },
    storage: {
        Harvester: 2,
        Builder: 1,
        Filler: 2,
        Upgrader: 4,
    },
    container: {
        Harvester: 2,
        Builder: 2,
        Filler: 2,
        Upgrader: 6,
        Manager: 1,
    },
    claim: {
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
const getCurrentState = (room: Room): OperationState => {
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
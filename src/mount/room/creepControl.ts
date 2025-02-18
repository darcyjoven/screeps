import ConfigExtension from "./config";
import { info } from "utils/terminal";
import { getBodyConfig } from "setting/creep";
import { generateCreepId } from "utils/tool";

export default class CreepControl extends ConfigExtension {
    public creepNumberControl(): void {
        info(['creepNumberControl'], 'room', this.name, 'creep 数量控制 开始')
        if (!this.memory.stat) this.memory.stat = { currentState: getCurrentState(this) }
        info(['creepNumberControl'], 'room', this.name, '运维阶段', this.memory.stat.currentState)
        if (!this.memory.task) this.memory.task = {}
        if (!this.memory.task.spawn) this.memory.task.spawn = []
        // 还需要加入队列中的角色
        const toSpawn = getToSpawn(
            this.memory.task?.spawn || [],
            this.find(FIND_MY_CREEPS),
            this.memory.stat.currentState,
        )
        info(['creepNumberControl'], this.addSpawnTask)
        if (toSpawn.length > 0) this.addSpawnTask(false, ...toSpawn)
        info(['creepNumberControl'], `${toSpawn.length}个Creep加入了孵化队列`, toSpawn)

        // 寻找可用spawn
        const spawns = this.find(FIND_MY_SPAWNS, {
            filter: spawn => !spawn.spawning && (!spawn.memory.belong || spawn.memory.belong === "creepControll")
        })
        if (spawns.length === 0) {
            info(['creepNumberControl'], `无spawn可用`)
            return
        }

        // 开始孵化
        for (const spawnName in spawns) {
            const creep = this.nextSpawnTask()
            if (!creep) {
                info(['creepNumberControl'], `当前无孵化任务`)
                break
            }
            const name = `${this.name}-${creep}-${generateCreepId()}`
            const result = spawns[spawnName].spawnCreep(getBodyConfig(creep, this.controller?.level || 1) || [], name, {
                memory: {
                    crossable: false,
                    standed: false,
                    role: creep,
                    reSpawn: true,
                    ready: false,
                    isStandBy: false,
                    isStand: false,
                    data: {},
                    goCache: false,
                    working: false
                }
            })
            if (result === OK) this.finishSpawnTask()
            else info(['creepNumberControl'], `[${this.name}] [${spawnName}]`, `孵化失败，错误代码${JSON.stringify({ result })}`)
        }
        info(['creepNumberControl'], 'room', this.name, 'creep 数量控制 结束')
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
}

const stateControls: Record<OperationState, CreepRole[]> = {
    claim: [
        'Harvester',
        'Harvester',
        'Builder',
    ],
    container: [
        'Harvester',
        'Harvester',
        'Builder',
        'Filler',
        'Filler',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
    ],
    storage: [
        'Harvester',
        'Harvester',
        'Builder',
        'Filler',
        'Filler',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Manager'
    ],
    link: [
        'Harvester',
        'Harvester',
        'Builder',
        'Filler',
        'Filler',
        'Filler',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Upgrader',
        'Manager',
        'Processor'
    ]
}

/**
 * 判断房间的运维阶段
 * @param room 
 * @returns 
 */
const getCurrentState = (room: Room): OperationState => {
    return 'claim'
}
/**
 * 从this.memory.task.spawn,creep,运维配置
 * 
 * 获取有哪些creep还未进任务清单
 */
const getToSpawn = (tasks: SpawnTask[], creeps: Creep[], state: OperationState): CreepRole[] => {
    // 复制数组，避免修改外部数据
    let configsCopy: CreepRole[] = []
    let toSpawn: Record<CreepRole, number> = {
        Harvester: 0,
        Worker: 0,
        Hauler: 0,
        Collector: 0,
        Upgrader: 0,
        Builder: 0,
        Filler: 0,
        Processor: 0,
        Manager: 0,
        Defender: 0,
        Ranged: 0,
        Healer: 0,
        RemoteHarvester: 0,
        RemoteHauler: 0,
        RemoteDefender: 0,
        Claimer: 0,
        Dismantler: 0
    }
    // 配置数量 
    stateControls[state].forEach(role => toSpawn[role]++)
    creeps.forEach(creep => toSpawn[creep.memory.role as CreepRole]--)
    tasks.forEach(task => toSpawn[task]--)

    for (const role in toSpawn) {
        for (let i = 0; i < toSpawn[role as CreepRole]; i++) {
            configsCopy.push(role as CreepRole)
        }
    }
    return configsCopy
} 
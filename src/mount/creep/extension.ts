import { dashRange, stanbyRange, minWallHits } from "setting/global"
import { unserializePos, getSurroundingPos, serializePos, getOppositeDirection } from "utils/path"
import roles from "creep"
import { warn } from "utils/terminal"

// creep 原型拓展
export default class CreepExtension extends Creep {
    /**
     * 主要工作
     */
    public work(): void {
        // 检查角色正确否
        if (!(this.memory.role in roles)) {
            this.log(`未知角色`, 'yellow')
            this.say(`unrole:${this.memory.role}`)
            return
        }
        // 孵化中
        if (this.spawning) {
            // if (this.ticksToLive === CREEP_LIFE_TIME) this._id = this.id // 解决 this creep not exist 问题
            return
        }
        // 获取creep的配置
        const creepConfig: CreepCycle = roles[this.memory.role as CreepRole](this.memory.data)

        // 快死的时候处理
        if (this.ticksToLive && this.ticksToLive <= 3) {
            log('memory', 'creep', this.name, 'ticksToLive', this.ticksToLive, 'isNeed', creepConfig.isNeed!(this) || false)
            // 释放出禁止通行点
            if (this.memory.isStand) this.room.rmAvoidPos(this.name)
            // BUG harvester未重新孵化
            if (creepConfig.isNeed && creepConfig.isNeed(this)) {
                // 需要需要重新孵化，就立即自杀重新孵化
                this.afk()
                this.memory.ready = false
                this.memory.working = false
                this.room.addSpawnTask(false, {
                    role: this.memory.role,
                    name: this.name,
                    memory: this.memory
                })
                this.say('🔄我重生去了')
                this.suicide()
                return
            }
        }

        // 还未准备好
        if (!this.memory.ready) {
            if (creepConfig.prepare) this.memory.ready = creepConfig.prepare(this)
            else this.memory.ready = true
        }
        // 还未准备就继续下一个tick
        if (!this.memory.ready) return
        // 获取是否有工作
        const working = creepConfig.source ? this.memory.working : true
        let stateChange = false
        // 执行阶段 
        if (working === true) {
            const ok = creepConfig.target && creepConfig.target(this)
            if (ok) stateChange = true
        } else {
            const ok = creepConfig.source && creepConfig.source(this)
            if (ok) stateChange = true
        }
        // 状态变化了就释放工作位置
        if (stateChange) {
            this.memory.working = !this.memory.working
            if (this.memory.isStand) {
                this.room.rmAvoidPos(this.name)
                this.memory.isStand = false
            }
        }
    }
    /**
     * 占住当前位置，将当前地点加到房间禁止通行中
     */
    public isStand(): void {
        if (this.memory.isStand) return
        this.memory.isStand = true
        this.room.addAvoidPos(this.name, this.pos)
    }
    /**
     * 指定位置待命
     */
    public standBy(): ScreepsReturnCode {
        let pos: Pos = { x: -1, y: -1 }
        switch (this.memory.role) {
            case 'Processor': pos = this.memory.data as ProcessorData; break
            case 'Defender': pos = this.room.memory.standBy.defender || pos; break
            default: pos = this.room.memory.standBy.prepare || pos
        }
        if (pos.x === -1 || pos.y === -1) {
            this.say('no standBy pos')
            return ERR_NOT_FOUND
        }
        const standByPos = new RoomPosition(pos.x, pos.y, this.room.name)

        if (this.pos.getRangeTo(standByPos) > 1) {
            this.goTo(standByPos)
            return ERR_NOT_IN_RANGE
        } else {
            this.say('standBy')
            this.memory.isStandBy = true
            this.room.addAvoidPos(this.name, this.pos)
            return OK
        }
    }
    /**
     * 检查是否有敌人
     */
    public chkEnemy(): boolean {
        if (!this.room._enemys) {
            this.room._enemys = this.room.find(FIND_HOSTILE_CREEPS)
        }
        if (this.room._enemys.length > 0) {
            this.memory.isStandBy = false
            return true
        } else return false
    }
    /**
     * 防御
     */
    public defense(): void {
        if (!this.room._enemys) {
            this.room._enemys = this.room.find(FIND_HOSTILE_CREEPS)
        }
        if (this.room._enemys.length <= 0) return

        // 从缓存中获取敌人
        const enemy = this.pos.findClosestByRange(this.room._enemys)
        if (!enemy) return
        this.say(`正在消灭 ${enemy.name}`)
        this.goTo(enemy.pos)

        if (this.getActiveBodyparts(RANGED_ATTACK) > 0) this.rangedAttack(enemy)
        else this.attack(enemy)

        // 如果有可用 HEAL 身体并且掉血了则自我治疗
        if (this.getActiveBodyparts(HEAL) > 0 && this.hits < this.hitsMax) {
            this.heal(this)
        }
    }
    /**
     * 向指定方向对穿
     * @param direction 方向
     * @returns OK 对穿成功
     * @returns ERR_BUSY 对方正忙
     * @returns ERR_NOT_FOUND 未找到对象
     */
    public cross(direction: DirectionConstant): OK | ERR_BUSY | ERR_NOT_FOUND {
        if (!this.memory.crossable) {
            return ERR_BUSY
        }
        // 找到对面Creep
        const frontPos = this.pos.directionToPos(direction)
        if (!frontPos) return ERR_NOT_FOUND

        const frontCreep = frontPos.lookFor(LOOK_CREEPS)[0] || frontPos.lookFor(LOOK_POWER_CREEPS)[0]
        if (!frontCreep) return ERR_NOT_FOUND

        this.say('👉')
        if (frontCreep.requireCross(getOppositeDirection(direction)) === OK) this._move(direction)
        else return ERR_BUSY

        return OK
    }
    /**
     * 对方请求对穿
     * @param direction 方向
     * @returns OK 可以对穿
     * @returns ERR_BUSY 不能对穿，正忙
     */
    public requireCross(direction: DirectionConstant): OK | ERR_BUSY {
        // 没有memory 说明creep已经死亡,直接移动
        if (!this.memory) return OK

        if (this.memory.standed) {
            this.say('👊')
            return ERR_BUSY
        }

        // 可以对穿
        this.say('👌')
        this.move(direction)
        return OK
    }
    /**
     * 升级本房间控制器
     * 
     * 阻塞
     */
    public upgrade(): ScreepsReturnCode {
        if (!this.room.controller) return ERR_NOT_FOUND
        const result = this.upgradeController(this.room.controller)

        if (result === OK && !this.memory.standed) {
            this.memory.standed = true
            this.room.addAvoidPos(this.name, this.pos)
        } else if (result == ERR_NOT_IN_RANGE) {
            return this.goTo(this.room.controller.pos)
        }
        return result
    }
    /**
     * 建筑工地
     */
    public buildStructure(): ScreepsReturnCode {
        // 建筑工地
        let target: ConstructionSite | undefined | null = undefined
        // 检查是否有缓存
        if (this.room.memory.buildStructure) {
            target = Game.getObjectById<ConstructionSite>(this.room.memory.buildStructure.siteId as Id<ConstructionSite>)
            // 找不到工地，可能是已经完成了
            if (!target) {
                const currentPos = new RoomPosition(
                    this.room.memory.buildStructure.pos.x,
                    this.room.memory.buildStructure.pos.y,
                    this.room.name,
                )
                // 需要查到相同类型建筑才可以
                const struct = _.find(currentPos.lookFor(LOOK_STRUCTURES), (s) => {
                    return s.structureType === this.room.memory.buildStructure!.type
                })
                if (struct) {
                    // 建造完成
                    structureInfo(struct)
                    this.afk()
                }
                target = this.nextStructure()
            }
            // 没换成直接获取
        } else target = this.nextStructure()
        if (!target) return ERR_NOT_FOUND

        // 开始建造
        const buildResult = this.build(target)
        if (buildResult === OK && !this.memory.standed) {
            this.memory.standed = true
            this.room.addAvoidPos(this.name, this.pos)
        }
        else if (buildResult === ERR_NOT_IN_RANGE) return this.goTo(target.pos)
        return buildResult
    }
    /**
     * 寻找下一个建筑工地
     */
    public nextStructure(): ConstructionSite | undefined | null {
        const targets = this.room.find(FIND_MY_CONSTRUCTION_SITES)
        if (targets.length > 0) {
            let target: ConstructionSite | undefined | null
            // 优先建筑类型
            for (const type of [STRUCTURE_SPAWN, StructureExtension]) {
                target = targets.find(s => s.structureType === type)
                if (target) break
            }
            // 找最近的工地
            if (!target) target = this.pos.findClosestByRange(targets)
            if (!target) return undefined

            this.room.memory.buildStructure = {
                siteId: target.id,
                type: target.structureType,
                pos: { x: target.pos.x, y: target.pos.y }
            }
            return target
        } else {
            delete this.room.memory.buildStructure
            return undefined
        }
    }
    /**
      * 稳定新墙
      * 会把内存中 fillWallId 标注的墙声明值刷到定值以上
      */
    public fillWall(): ScreepsReturnCode {
        const wall = Game.getObjectById(this.memory.fillWallId as Id<StructureWall | StructureRampart>)
        if (!wall) return ERR_NOT_FOUND

        if (wall.hits < minWallHits) {
            const result = this.repair(wall)
            if (result === OK && !this.memory.standed) {
                this.memory.standed = true
                this.room.addAvoidPos(this.name, this.pos)
            } else if (result === ERR_NOT_IN_RANGE) return this.goTo(wall.pos)
            else return result
        } else {
            delete this.memory.fillWallId
            this.afk()
        }
        return OK
    }
    /**
     * 从指定目标获取能量
     * @param target 目标结构
     * @returns harvest或withdraw 返回值
     */
    public getFrom(target: Structure | Source): ScreepsReturnCode {
        let result: ScreepsReturnCode
        if (target instanceof Source) {
            // harvest
            result = this.harvest(target as Source)
            if (result === OK) this.isStand()
        } else {
            result = this.withdraw(target as Structure, RESOURCE_ENERGY)
        }
        if (result === ERR_NOT_IN_RANGE) result = this.goTo(target.pos)
        return result
    }
    /**
     * 将资源转义到指定建筑
     * @param target 目标建筑
     * @param RESOURCE 资源类型
     */
    public giveTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode {
        let result = this.transfer(target, RESOURCE)
        if (result === ERR_NOT_IN_RANGE) return this.goTo(target.pos)
        return result
    }
    /**
     * 供给指定位置结构
     * @param flag flag名称
     * @param healerName 治疗者名称
     */
    public attackFlag(flag: string, healerName: string = ''): boolean {
        this.say('attack', true)
        // 找到攻击flag
        const attackFlag = Game.flags[flag]
        if (!attackFlag) return false

        // 不在同一个房间，先移动过去
        if (!attackFlag.room || attackFlag.room && this.room.name !== attackFlag.room.name) {
            this.goTo(attackFlag.pos)
            return true
        }

        // 如果在同一个房间
        // 优先供给creep
        let target: Creep | PowerCreep | Structure | Flag
        const enemys = attackFlag.pos.findInRange(FIND_HOSTILE_CREEPS, 2)
        if (enemys.length > 0) target = enemys[0]
        else {
            // 寻找structure
            const structures = attackFlag.pos.lookFor(LOOK_STRUCTURES)
            if (structures.length === 0) {
                this.say('no enemy')
                target = attackFlag
            } else target = structures[0]
        }
        this.goTo(target.pos)
        this.attack(target as AnyCreep | Structure)
        return true
    }
    /**
     * 拆除指定位置建筑
     * @param flag flag名称 
     * @param healerName 治疗者 
     */
    public dismantleFlag(flag: string, healerName: string = ''): boolean {
        // 获取flag
        const attackFlag = Game.flags[flag]
        if (!attackFlag) return false
        // 治疗单位
        const healer = Game.creeps[healerName]

        // 不在同一个房间，先移动过去
        if (!attackFlag.room || attackFlag.room && this.room.name !== attackFlag.room.name) {
            if (!this.canMoveWith(healer)) return true
            this.goTo(attackFlag.pos)
            return true
        }

        // 如果flag在同一个房间
        const structures = attackFlag.pos.lookFor(LOOK_STRUCTURES)
        if (structures.length === 0) this.say('找不到建筑')

        if (this.canMoveWith(healer)) this.goTo(attackFlag.pos)
        this.dismantle(structures[0])
        return true
    }

    /**
     * 两个creep一起移动
     */
    public canMoveWith(creep: AnyCreep): boolean {
        return (creep && this.pos.isNearTo(creep) && this.fatigue === 0)
    }
    /**
     * 治疗指定的creep
     * @param creep 指定的creep
     */
    public healTo(creep: AnyCreep): void {
        let result = this.heal(creep)
        if (result === ERR_NOT_IN_RANGE) this.goTo(creep.pos)
    }

    /**
       * 压缩 PathFinder 返回的路径数组
       * 
       * @param positions 房间位置对象数组，必须连续
       * @returns 压缩好的路径
       */
    public serializeFarPath(positions: RoomPosition[]): string {
        if (positions.length == 0) return ''
        // 确保路径的第一个位置是自己的当前位置
        if (!positions[0].isEqualTo(this.pos)) positions.splice(0, 0, this.pos)

        return positions.map((pos, index) => {
            // 最后一个位置就不用再移动
            if (index >= positions.length - 1) return null
            // 由于房间边缘地块会有重叠，所以这里筛除掉重叠的步骤
            if (pos.roomName != positions[index + 1].roomName) return null
            // 获取到下个位置的方向
            return pos.getDirectionTo(positions[index + 1])
        }).join('')
    }

    public serializePath(positions: PathStep[]): string {
        if (positions.length == 0) return ''
        return positions.map(pos => pos.direction).join('')
    }
    /**
     * 按照方向移动
     * @param target 
     * @returns 
     */
    public _move(target: DirectionConstant): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        if (!this.memory.move) return ERR_NO_PATH
        const moveResult = this.move(target)
        // 发生碰撞
        const currentPos = `${this.pos.x}/${this.pos.y}`
        if (this.memory.move.prePos && this.memory.move.prePos === currentPos) {
            const crossResult = this.memory.crossable ? ERR_BUSY : this.cross(target)
            // 对穿失败，重新寻路
            if (crossResult != OK) {
                return ERR_INVALID_TARGET
            }
        }
        // 更新最新位置
        this.memory.move.prePos = currentPos
        return OK
    }
    /**
     * 短距离移动，不保存路径
     * @param target 目标位置
     * @returns 
     */
    // CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
    public dash(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        const result = this.moveTo(target, {
            plainCost: 1,
            swampCost: 5,
            visualizePathStyle: {
                fill: 'transparent',
                stroke: '#a5d94c',
                lineStyle: 'solid',
                strokeWidth: 0.1,
                opacity: 0.3
            },
            costCallback: (name, cost) => {
                const room = Game.rooms[name]
                if (!room) return
                // 排除掉禁止通行点
                const avoidPos = room.getAvoidPos()
                for (const name in avoidPos) {
                    if (name === this.name) continue
                    const pos = unserializePos(avoidPos[name])
                    cost.set(pos!.x, pos!.y, 0xff)
                }
                return cost
            }
        })
        return result
    }
    /**
     * 长距离移动
     * @param target 目标位置
     * @returns 
     */
    public race(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        // 查看是否有缓存路径      
        const routeKey = `${serializePos(this.pos)},${serializePos(target)}`
        let route = Memory.routeCache[routeKey]
        if (!route || !route.path) {
            route = { path: '', lastUsed: 0 }
            // 要进行寻路
            const result = PathFinder.search(this.pos, target, {
                plainCost: 2,
                swampCost: 10,
                maxOps: 4000,
                roomCallback: roomName => {
                    if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false
                    // 没有视野
                    const room = Game.rooms[roomName]
                    if (!room) return false

                    let costs = new PathFinder.CostMatrix

                    room.find(FIND_STRUCTURES).forEach(struct => {
                        if (struct.structureType === STRUCTURE_ROAD) {
                            costs.set(struct.pos.x, struct.pos.y, 1)
                        }
                        // 不能穿过无法行走的建筑
                        else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
                        ) costs.set(struct.pos.x, struct.pos.y, 0xff)
                    })
                    // 排除掉禁止通行点
                    const avoidPos = room.getAvoidPos()
                    for (const name in avoidPos) {
                        if (name === this.name) continue
                        const pos = unserializePos(avoidPos[name])
                        costs.set(pos!.x, pos!.y, 0xff)
                    }
                    return costs
                }
            })
            if (result.path.length <= 0 || !result.incomplete) return ERR_NO_PATH
            route.path = this.serializeFarPath(result.path)
            Memory.routeCache[routeKey] = route
        }
        // 根据缓存移动
        route.lastUsed = Game.time
        if (!route.used) route.used = 1
        else route.used++
        this.memory.goCache = true
        this.memory.move = {
            index: 0,
            far: 'race',
            path: route.path,
            prePos: `${this.pos.x}/${this.pos.y}`,
            targetPos: serializePos(target)
        }
        return this.goByCache()
    }

    public goTo(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        // [x] 根据缓存进行移动的时候，进行判断
        // 继续按照缓存走
        if (this.memory.goCache && this.memory.move.targetPos === serializePos(target)) {
            const result = this.goByCache()
            if (result === ERR_INVALID_TARGET) this.reGo()
            return result
        }

        // 跨房间
        if (this.room.name !== target.roomName) return this.race(target)
        // 距离超过dashRange距离，要去缓存路径 
        return target.getRangeTo(this.pos) > dashRange ? this.race(target) : this.dash(target)
    }
    public goByCache(): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        if (!this.memory.goCache || !this.memory.move || !this.memory.move.path) return ERR_NO_PATH
        // 跨房间
        const index = this.memory.move.index
        if (index >= this.memory.move.path!.length) {
            // 到达目的地
            this.memory.goCache = false
            this.memory.move = { index: 0 }
            return OK
        }
        const next = <DirectionConstant>Number(this.memory.move.path[index])
        this.say(`${directions[next - 1]} ${index}/${this.memory.move.path.length}`)
        const goResult = this._move(next)
        if (goResult === OK) this.memory.move.index++
        return goResult
    }
    public log(content: string, color: Colors = 'blue', notify: boolean = false) {
        this.room.log(content, this.name, color, notify)
    }
    /**
     * creep初始化
     */
    public init(): string {
        this.afk()
        this.memory.working = false
        this.memory.ready = false
        this.memory.data = {}
        return '初始化完成'
    }
    /**
     * 处理掉 creep 身上携带的能量
     * 运输者在之前处理任务的时候身上可能会残留能量，如果不及时处理的话可能会导致任务处理能力下降
     * 
     * @returns 为 true 时代表已经处理完成，可以继续执行任务
     */
    public clearStore(type: ResourceConstant): boolean {
        if (this.store[type] > 0) {
            if (this.room.storage && this.room.storage.store.getFreeCapacity() >= this.store[type]) {
                this.giveTo(this.room.storage, type)
                return false
            } else {
                this.drop(type)
                return true
            }
        } else {
            return true
        }
    }
    /**
     * 离开工作岗位
     */
    public afk(): void {
        this.memory.crossable = true
        this.memory.standed = true
        this.memory.isStandBy = false
        this.memory.isStand = false
        this.room.rmAvoidPos(this.name)
        this.say('afk')
    }
    /**
     * 重新规划路线
     */
    public reGo(): void {
        this.memory.goCache = false
        this.memory.move = { index: 0 }
    }
}

/**
 *  建筑建立完成后的触发函数
 */
const structureInfo = (structure: Structure<StructureConstant>): void => {
    // 刷新该类型建筑缓存
    structure.room.getStructure(structure.structureType, true)
    switch (structure.structureType) {
        case STRUCTURE_CONTAINER:
            // 两个container都建立完成后，转变为container阶段
            const conatiners = structure.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            })
            if (conatiners && conatiners.length >= 2) {
                if (structure.room.memory.stat && structure.room.memory.stat.currentState === 'claim') structure.room.stateChange('container')
            }
            break
        case STRUCTURE_STORAGE:
            // storage 建立完成后，转变为storage阶段
            if (structure.room.memory.stat && structure.room.memory.stat.currentState === 'container') structure.room.stateChange('storage')
            break
        case STRUCTURE_LINK:
            // link 建立完成后，转变为link阶段
            if (structure.room.memory.stat && structure.room.memory.stat.currentState === 'storage') structure.room.stateChange('link')
            break
    }
}

const logShow: Record<string, boolean> = {
    dead: true,
    memory: true,
}

export const log = (func: string, ...args: any[]) => {
    if (!logShow[func]) return

    let content: [any, any][] = []
    let i = 0
    for (; i < args.length - 1; i += 2) {
        content.push([args[i], args[i + 1]])
    }
    if (i < args.length - 1) {
        content.push(['unkey', args[i]])
    }
    warn(['room', func], ...content)
}

const directions = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️']
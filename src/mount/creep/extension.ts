import { dashRange, stanbyRange, minWallHits } from "setting/global"
import { unserializePos, getSurroundingPos, serializePos, getOppositeDirection } from "utils/path"
import roles from "creep"

// creep 原型拓展
export default class CreepExtension extends Creep {
    /**
     * 主要工作
     */
    public work(): void {
        // 检查角色正确否
        if (!(this.memory.role in roles)) {
            this.log(`未知角色`, 'yellow')
            this.say(`凉了，role:${this.memory.role}`)
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
            // 释放出禁止通行点
            if (this.memory.isStand) this.room.rmAvoidPos(this.name)
            // BUG harvester未重新孵化
            if (creepConfig.isNeed && creepConfig.isNeed(this)) {
                // 需要需要重新孵化，就立即自杀重新孵化
                this.memory.ready = false
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
        if (working===true) {
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
    public standBy(): void {
        if (!this.room.memory.standBy) {
            this.say('没有StandBy点')
            return
        }
        if (this.memory.isStandBy) {
            // 准备完成
            if (this.pos.x !== this.room.memory.standBy.x || this.pos.y !== this.room.memory.standBy.y) this.say('standBy')
            // 还未移动好，继续移动
            else this.goTo(getSurroundingPos(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
        } else {
            if (this.pos.x !== this.room.memory.standBy.x || this.pos.y !== this.room.memory.standBy.y) {
                // 还未移动到standby点处
                this.goTo(new RoomPosition(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
            } else {
                // 到了移动到周围，并准备好
                this.goTo(getSurroundingPos(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
                this.memory.ready = true
                this.memory.isStandBy = true
            }
        }


        if (!this.memory.isStandBy && (this.pos.x !== this.room.memory.standBy.x ||
            this.pos.y !== this.room.memory.standBy.y)) {
            // 还未移动到standby点处
            this.goTo(new RoomPosition(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
        } else if (this.pos.x !== this.room.memory.standBy.x && this.pos.y !== this.room.memory.standBy.y) {
            this.goTo(getSurroundingPos(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
            this.memory.ready = true
            this.memory.isStandBy = true
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

        if (this.memory.standed || this.memory.isStand) {
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
            this.goTo(this.room.controller.pos)
        }
        return result
    }
    /**
     * 建筑工地
     */
    public buildStructure(): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND {
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
                if (struct) structureInfo(struct)
                target = this.nextStructure()
            }
            // 没换成直接获取
        } else target = this.nextStructure()
        if (!target) return ERR_NOT_FOUND

        // 开始建造
        const buildResult = this.build(target)
        if (buildResult !== OK && buildResult === ERR_NOT_IN_RANGE) this.goTo(target.pos)
        return buildResult
    }
    /**
     * 寻找下一个建筑工地
     */
    public nextStructure(): ConstructionSite | undefined | null {
        const targets = this.room.find(FIND_MY_CONSTRUCTION_SITES)
        if (targets.length > 1) {
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
    public fillWall(): OK | OK | ERR_NOT_FOUND {
        const wall = Game.getObjectById(this.memory.fillWallId as Id<StructureWall | StructureRampart>)
        if (!wall) return ERR_NOT_FOUND

        if (wall.hits < minWallHits) {
            if (this.repair(wall) === ERR_NOT_IN_RANGE) this.goTo(wall.pos)
        } else delete this.memory.fillWallId

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
        if (result === ERR_NOT_IN_RANGE) this.goTo(target.pos)
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
    public _move(target: DirectionConstant): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        if (!this.memory.move) return ERR_NO_PATH
        const moveResult = this.move(target)

        // 发生碰撞
        const currentPos = `${this.pos.x}/${this.pos.y}`
        if (this.memory.move.prePos && this.memory.move.prePos == currentPos) {
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
            visualizePathStyle: {
                fill: 'transparent',
                stroke: '#ffffff',
                lineStyle: 'dotted',
                strokeWidth: 0.15,
                opacity: 0.1
            },
            ignoreCreeps: true,
            swampCost: 8,
        })
        return result
    }
    /**
     * 中距离移动，保存路径
     * @param target 目标位置
     * @returns 
     */
    public race(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {

        if (!this.room.memory.standBy ||// 没有standby
            (this.room.memory.standBy.x === this.pos.x && this.room.memory.standBy.y === this.pos.y) || // 已经在standby上
            (this.pos.getRangeTo(this.room.memory.standBy.x, this.room.memory.standBy.y) > stanbyRange) // 距离standby太远
        ) {
            // 查看是否有缓存路径      
            const routeKey = `${serializePos(this.pos)},${serializePos(target)}`
            let route = Memory.routeCache[routeKey]
            if (!route || !route.path) {
                route = { path: '', lastUsed: 0 }
                // 要进行寻路
                const result = this.room.findPath(this.pos, target, {
                    ignoreCreeps: true,
                    plainCost: 2,
                    swampCost: 10,
                })
                route.path = this.serializePath(result)
                Memory.routeCache[routeKey] = route
            }
            // 根据缓存移动
            route.lastUsed = Game.time
            this.memory.goCache = true
            this.memory.move = {
                far: false,
                index: 0,
                path: route.path,
                prePos: `${this.pos.x}/${this.pos.y}`,
                targetPos: serializePos(target)
            }
            return this.goByCache()
        } else {
            // 在standby的范围内，先移动到standby，再去寻路
            return this.dash(new RoomPosition(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
        }
    }
    /**
     * 长距离移动
     * @param target 目标位置
     * @returns 
     */
    public marathon(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        // 移动到standBy
        // Creep在standby上 或者没有standby  寻路去target
        if (!this.room.memory.standBy ||// 没有standby
            (this.room.memory.standBy.x === this.pos.x && this.room.memory.standBy.y === this.pos.y) || // 已经在standby上
            (this.pos.getRangeTo(this.room.memory.standBy.x, this.room.memory.standBy.y) > stanbyRange) // 距离standby太远
        ) {
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
            this.memory.goCache = true
            this.memory.move = {
                index: 0,
                far: true,
                path: route.path,
                prePos: `${this.pos.x}/${this.pos.y}`,
                targetPos: serializePos(target)
            }
            return this.goByCache()
        } else {
            // 在standby的范围内，先移动到standby，再去寻路
            return this.dash(new RoomPosition(this.room.memory.standBy.x, this.room.memory.standBy.y, this.room.name))
        }
    }

    public goTo(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {

        // 继续按照缓存走
        if (this.memory.goCache && !this.memory.move && this.memory.move!.targetPos === serializePos(target)) return this.goByCache()

        let fromPos = {
            x: this.pos.x,
            y: this.pos.y
        }
        // 距离standby一个格子内，从standby开始计算初始位置
        if (this.room.memory.standBy) if (this.pos.inRangeTo(this.room.memory.standBy.x, this.room.memory.standBy.y, 1)) fromPos = this.room.memory.standBy
        // 跨房间
        if (this.room.name !== target.roomName) return this.marathon(target)
        // 距离超过1/4，要去缓存路径
        return target.getRangeTo(fromPos.x, fromPos.y) > dashRange ? this.race(target) : this.dash(target)
    }
    public goByCache(): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        if (!this.memory.goCache || !this.memory.move || !this.memory.move.path) return ERR_NO_PATH
        // 跨房间
        const index = this.memory.move.index
        if (index >= this.memory.move.path!.length) {
            // 到达目的地
            delete this.memory.move.path
            return OK
        }
        const next = <DirectionConstant>Number(this.memory.move.path[index])
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
        this.memory.data = {}
        this.memory.ready = false
        this.memory.isStand = false
        return '初始化完成'
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
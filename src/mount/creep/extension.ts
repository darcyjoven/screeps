import { dashRange, stanbyRange } from "setting/global"
import { unserializePos } from "utils/path"
import { serializePos, getOppositeDirection } from "utils/path"
// creep 原型拓展
export default class CreepExtension extends Creep {
  /**
   * 主要工作
   */
  public work(): void { }
  /**
   * 指定位置待命
   */
  public standBy(): void { }
  /**
   * 防御
   */
  public defense(): void { }
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

    this.say('=>')
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

    if (this.memory.standed){
      this.say('||')
      return ERR_BUSY
    }

    // 可以对穿
    this.say('<=')
    this.move(direction)
    return OK
  }
  /**
   * 升级本房间控制器
   */
  public upgrade(): ScreepsReturnCode {
    return OK
  }
  /**
   * 建筑工地
   */
  public buildStructure(): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND {
    return OK
  }
  /**
   * 从指定目标获取能量
   * @param target 目标结构
   * @returns havest或withdraw 返回值
   */
  public getFrom(target: Structure | Source): ScreepsReturnCode {
    return OK
  }
  /**
   * 将资源转义到指定建筑
   * @param target 目标建筑
   * @param RESOURCE 资源类型
   */
  public giveTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode {
    return OK
  }
  /**
   * 供给指定位置结构
   * @param flag flag名称
   * @param healer 治疗者名称
   */
  public attackFlag(flag: string, healer: string): boolean {
    return true
  }
  /**
   * 拆除指定位置建筑
   * @param flag flag名称 
   * @param healer 治疗者 
   */
  public dismantleFlag(flag: string, healer: string): boolean {
    return true
  }
  /**
   * 治疗指定的creep
   * @param creep 指定的creep
   */
  public healTo(creep: Creep): void { }

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
    return this.moveTo(target, {
      noPathFinding: true,
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
      const routeKey = `${serializePos(this.pos), serializePos(target)}`
      let route = this.room.memory.routeCache[routeKey]
      if (!route || !route.path) {
        route = { path: '', lastUsed: 0 }
        // 要进行寻路
        const result = this.room.findPath(this.pos, target, {
          ignoreCreeps: true,
          plainCost: 2,
          swampCost: 10,
        })
        route.path = this.serializePath(result)
        this.room.memory.routeCache[routeKey] = route
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
      const routeKey = `${serializePos(this.pos), serializePos(target)}`
      let route = this.room.memory.routeCache[routeKey]
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
        this.room.memory.routeCache[routeKey] = route
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
}

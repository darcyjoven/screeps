import { baseLayout } from "setting/global";
import RoomExtension from "./extension";
import room from ".";
/**
 * 布局规划
 */
export default class LayoutExtension extends RoomExtension {
    /**
     * 清除非自己的建筑
     */
    public clearHostileStructures(): OK | ERR_NOT_FOUND {
        const notMyStructure = this.find(FIND_STRUCTURES, { filter: s => !s.my })
        if (notMyStructure.length === 0) return ERR_NOT_FOUND

        notMyStructure.forEach(s => {
            // 如果是这三种建筑则看一下存储，只要不为空就不摧毁
            if (s.structureType === STRUCTURE_TERMINAL || s.structureType === STRUCTURE_FACTORY || s.structureType === STRUCTURE_STORAGE) {
                if (s.store.getFreeCapacity() > 0) return
            }// 墙壁交给玩家决定，默认不摧毁
            else if (s.structureType === STRUCTURE_WALL) return
            else s.destroy()
        })
        return OK
    }
    /**
     * 设置中心点
     * @param flagName 中间点flag名称
     */
    public setCenter(flagName: string): OK | ERR_NOT_FOUND {
        if (!Game.flags[flagName] || !Game.flags[flagName].room || Game.flags[flagName].room.name !== this.name) {
            return ERR_NOT_FOUND
        }
        const flag = Game.flags[flagName]
        if (!this.memory.layout) this.memory.layout = { center: { x: flag.pos.x, y: flag.pos.y } }
        if (!this.memory.layout.center) this.memory.layout.center = { x: flag.pos.x, y: flag.pos.y }
        this.memory.layout.center.x = flag.pos.x
        this.memory.layout.center.y = flag.pos.y
        return OK
    }
    /**
     * 动态设置最佳中心点
     */
    public findOptimalCenter(cnt: number = 10, visual: boolean = false): RoomPosition[] {
        // 取得清单
        const sources = this.find(FIND_SOURCES)
        const minerals = this.find(FIND_MINERALS)

        // 初始化阻挡矩阵和地形数据
        const blocked = new Array(50).fill(0).map(() => new Array(50).fill(false))
        const terrain = this.getTerrain()
        const isSwamp = new Array(50).fill(0).map(() => new Array(50).fill(0))

        // 填充阻挡和地形数据
        // 建筑物阻挡
        this.find(FIND_STRUCTURES).forEach(s => blocked[s.pos.x][s.pos.y] = true)
        // 沼泽
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                isSwamp[x][y] = (terrain.get(x, y) & TERRAIN_MASK_SWAMP) ? 1 : 0;
            }
        }
        // 最终结果数组
        const candidates: { x: number, y: number, swamps: number, dist: number }[] = [];
        // 搜索循环
        for (let x = 5; x <= 44; x++) {
            for (let y = 5; y <= 44; y++) {
                let valid = true;
                let swamps = 0;
                // 11x11区域检查
                for (let dx = -5; dx <= 5; dx++) {
                    for (let dy = -5; dy <= 5; dy++) {
                        const tx = x + dx
                        const ty = y + dy
                        // 被阻挡
                        if ((terrain.get(tx, ty) & TERRAIN_MASK_WALL) || blocked[tx][ty]) {
                            valid = false;
                            break;
                        }
                        // 沼泽数量
                        swamps += isSwamp[tx][ty];
                    }
                    if (!valid) break;
                }
                // 计算距离
                if (valid) {
                    let dist: number = 0
                    for (const source of sources) {
                        dist += Math.max(Math.abs(x - source.pos.x), Math.abs(y - source.pos.y))
                    }
                    candidates.push({ x, y, swamps: swamps, dist })
                }
            }
        }
        // 高效排序
        candidates.sort((a, b) =>
            a.swamps - b.swamps || a.dist - b.dist
        )
        return candidates.slice(0, cnt).map(c => {
            // 画圈
            if (visual) this.visual.circle(c.x, c.y, { radius: 0.4, fill: '#00FF00' })
            return new RoomPosition(c.x, c.y, this.name)
        }
        )
    }
    /**
     * controller每个等级要自动规划建筑布局
     * 
     * 从RCL2开始
     * @param level controller 等级
     * @returns 返回新增的工地清单
     */
    public planConstruntureSite(rcl: 2 | 3 | 4 | 5 | 6 | 7 | 8): StructureConstant[] | ScreepsReturnCode {
        const sites: StructureConstant[] = []
        // 如果未找到中心点，要去提示
        if (!this.memory.layout?.center) {
            this.log('房间还未设置中心点，不能自动规划建筑布局', 'planConstruntureSite', 'red', true)
            return ERR_NOT_FOUND
        }
        // 开始规划
        let info: string = ''
        const layout = baseLayout[rcl as keyof BaseLayout]
        for (const structureType in layout) {
            if (!layout[structureType as StructureConstant]) {
                continue
            }
            for (const structure of layout[structureType as StructureConstant]!) {
                // 手动维护的建筑
                if (structure === null) {
                    info += `建筑类型:${structureType}` + '\n'
                    continue
                }
                const result = this.createConstructionSite(structure[0] + this.memory.layout.center.x, structure[1] + this.memory.layout.center.y, structureType as BuildableStructureConstant)
                this.memory.spawnBuilder = true
                if (result !== OK) info += `新建工地失败-建筑类型:${structureType} 报错代码:${result} 位置:x-${structure[0] + this.memory.layout.center.x} y-${structure[1] + this.memory.layout.center.y}` + '\n'
                else {
                    sites.push(structureType as BuildableStructureConstant)
                }
            }
        }
        if (info !== '') {
            info = `以下是需要手动部署的建筑:\n` + info
            this.log(info, 'new constructure site failed', 'red', true)
        }
        this.memory.stat.layout = rcl
        return sites
    }
    /**
     * [ ] 保存当前布局到内存
     */
    public snapshotLayout(flagName: string): void {
    }
    /**
     * [ ] 可视化工具
     */
    public visualizeLayout(rcl: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void {

    }
    /**
     * 将layout配置转为screeps-tools的JSON内容
     * 
     * https://screepers.github.io/screeps-tools/#/building-planner
     * @returns 
     */
    public planToolJSON(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): string {
        // 获得中心点
        const center: { x: number, y: number } = this.memory.layout?.center || { x: 25, y: 25 }
        const planToolData: PlanToolData = { rcl: level, buildings: {} };

        for (let level = 1; level <= 8; level++) {
            const layout = baseLayout[level as keyof BaseLayout]
            if (!layout) continue

            for (const structureType in layout) {
                const positions = layout[structureType as StructureConstant]
                if (!positions) continue

                if (!planToolData.buildings[structureType as StructureConstant]) {
                    planToolData.buildings[structureType as StructureConstant] = []
                }
                planToolData.buildings[structureType as StructureConstant]?.push(
                    ...positions.map((position) => (position === null ? { x: 50, y: 50 } : { x: position[0] + center.x, y: position[1] + center.y }))
                )
            }
        }
        return JSON.stringify(planToolData)
    }
    /**
     * 初始化controller点位
     * @returns 
     */
    public initUpgraderPos(): void {
        if (this.memory.upgraderPos) return
        // 获取控制器的位置
        const controllerPos = this.controller?.pos
        if (!controllerPos) return

        // 获取控制器周围7x7范围内的所有位置
        let positions = []

        for (let x = controllerPos.x - 3; x <= controllerPos.x + 3; x++) {
            for (let y = controllerPos.y - 3; y <= controllerPos.y + 3; y++) {
                let pos = new RoomPosition(x, y, this.name);
                // 检查位置是否可以移动
                if (this.getTerrain().get(x, y) !== TERRAIN_MASK_WALL) {
                    positions.push(pos);
                }
            }
        }

        // 按照与控制器的距离排序
        this.memory.upgraderPos = []
        positions.sort((a, b) => a.getRangeTo(controllerPos) - b.getRangeTo(controllerPos))
        positions.forEach((p) => {
            this.memory.upgraderPos?.push(p)
        })
    }
    /**
     * [x] standBy 点位设置
     * 
     * 1. prepare
     * 
     * 2. processor
     * 
     * 3. defender
     * @returns 
     */
    public setStandByPos(): string {
        if (!this.memory.standBy.prepare) {
            if (Game.flags['prepare']) this.memory.standBy.prepare = Game.flags['prepare'].pos
            else {
                const suggestPos: RoomPosition = this.getCenterPos(
                    ..._.values(this.memory.source).map(s => new RoomPosition(s.pos.x, s.pos.y, this.name)),
                    ...this.find(FIND_MINERALS).filter(m => m !== null).map(m => m.pos),
                )
                suggestPos.createFlag('prepare')
                return `prepare 建议点位 ${suggestPos}`
            }
        }
        if (!this.memory.standBy.processor) {
            if (Game.flags['processor']) this.memory.standBy.processor = Game.flags['processor'].pos
            else {
                return `请建立一个名称为‘porocessor'的Flag`
            }
        }
        if (!this.memory.standBy.defender) {
            if (Game.flags['defender']) this.memory.standBy.defender = Game.flags['defender'].pos
            else {
                return `defender'的Flag`
            }
        }
        return 'standBy点位置已设置'
    }
    public getCenterPos(...postions: RoomPosition[]): RoomPosition {

        return postions[0]
    }
}

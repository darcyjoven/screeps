import LayoutExtension from "./layout"
/**
 * 查询相关
 */
export default class SearchExtension extends LayoutExtension {
    /**
  * 查找房间中的有效能量来源
  */
    public getAvailableSource(): StructureTerminal | StructureStorage | StructureContainer | Source {
        // terminal 或 storage 里有能量就优先用
        if (this.terminal && this.terminal.store[RESOURCE_ENERGY] > 10000) return this.terminal
        if (this.storage && this.storage.store[RESOURCE_ENERGY] > 100000) return this.storage
        // 如果有 sourceConainer 的话就挑个多的
        if (this.sourceContainers && this.sourceContainers.length > 0) {
            return _.maxBy(this.sourceContainers, container => container.store[RESOURCE_ENERGY]) as StructureContainer
        }
        if (!this.sources || this.sources.length === 0) {
            this.sources = this.find(FIND_SOURCES)
        }
        // 没有就选边上有空位的 source
        return this.sources.find(source => {
            const freeCount = source.pos.getFreeSpace().length
            const harvestCount = source.pos.findInRange(FIND_CREEPS, 1).length

            return freeCount - harvestCount > 0
        }) as Source
    }
    /**
     * 获取禁止通过的位置
     * @returns 
     */
    public getAvoidPos(): { [creepName: string]: string } {
        return {}
    }
    /**
     * 获取房间内容的指定类别建筑物
     * 
     * 如果内存中没有，注册到memory中
     */
    public getStructure(structureType: StructureConstant, fresh: boolean = false): StructureMemory[] {
        // 如果内存中没有或者指定需要刷新
        if (!this.memory.structure[structureType] ||
            _.size(this.memory.structure[structureType]) <= 0 || fresh) {
            // 需要搜索
            const structures = this.find(FIND_STRUCTURES, { filter: s => s.structureType === structureType })
            // 将结果中不存在于 this.memory.structure 的加入到this.memory.structure
            structures.forEach(s => {
                if (!this.memory.structure[structureType]) this.memory.structure[structureType] = {}
                if (!this.memory.structure[structureType][s.id]) {
                    this.memory.structure[structureType][s.id] = { id: s.id, pos: s.pos }
                }
            })
            // 将内存中有，实际没有的删除
            _.keys(this.memory.structure[structureType]).forEach(id => {
                if (!_.some(structures, s => s.id === id)) delete this.memory.structure[structureType]![id]
            })
        }
        return _.values(this.memory.structure[structureType])
    }
    /**
     * 获取房间内容的指定类别资源
     * 
     * 如果内存中没有，注册到memory中
     */
    public getSource(fresh: boolean = false): SourceMemory[] {
        if (_.size(this.memory.source) <= 0 || fresh) {
            const sources = this.find(FIND_SOURCES)
            // 将结果中不存在于内存中的加入到内存
            sources.forEach(s => {
                if (!this.memory.source[s.id]) this.memory.source[s.id] = { id: s.id, pos: s.pos, belong: '' }
            })
            // 将内存中存在结果中不存在的删除内存
            _.keys(this.memory.source).forEach(id => {
                if (!_.some(sources, source => source.id !== id)) delete this.memory.source[id]
            })
        }
        return _.values(this.memory.source)
    }
    /**
     * 缓存所有建筑
     */
    public freshAllStructue(): string {
        this.getSource(true)
        this.getStructure(STRUCTURE_EXTENSION, true)
        this.getStructure(STRUCTURE_RAMPART, true)
        this.getStructure(STRUCTURE_ROAD, true)
        this.getStructure(STRUCTURE_SPAWN, true)
        this.getStructure(STRUCTURE_LINK, true)
        this.getStructure(STRUCTURE_WALL, true)
        this.getStructure(STRUCTURE_STORAGE, true)
        this.getStructure(STRUCTURE_TOWER, true)
        this.getStructure(STRUCTURE_OBSERVER, true)
        this.getStructure(STRUCTURE_POWER_SPAWN, true)
        this.getStructure(STRUCTURE_EXTRACTOR, true)
        this.getStructure(STRUCTURE_LAB, true)
        this.getStructure(STRUCTURE_TERMINAL, true)
        this.getStructure(STRUCTURE_CONTAINER, true)
        this.getStructure(STRUCTURE_NUKER, true)
        this.getStructure(STRUCTURE_FACTORY, true)
        this.getStructure(STRUCTURE_KEEPER_LAIR, true)
        this.getStructure(STRUCTURE_CONTROLLER, true)
        this.getStructure(STRUCTURE_POWER_BANK, true)
        this.getStructure(STRUCTURE_PORTAL, true)
        this.getStructure(STRUCTURE_INVADER_CORE, true)
        return '刷新完成....'
    }

    /**
     * [x]寻找房间中符合条件的第一个建筑
     * 
     * 先按照数量排序，再按照数量排序
     * @param resouce 资源类型
     * @param range 按照距离排序
     * @param amount 按照数量排序
     * @param types 查询的建筑类型
     * @returns 返回符合条件的第一个建筑
     */
    public getResouceAvailable(
        resouce: ResourceConstant = RESOURCE_ENERGY,
        distance: { pos?: RoomPosition } = {},
        amount: boolean,
        ...types: StoreStructureConstant[]): StoreStructure | null {

        // 获取指定类型建筑
        let structures: StoreStructure[] = []

        types.forEach(t => {
            _.keys(this.memory.structure[t]).forEach(s => {
                const tmp = Game.getObjectById(s as Id<StoreStructure>)
                if (tmp) {
                    if (tmp.store[resouce] > 0) structures.push(tmp)
                }
            })
        })

        if (!structures || structures.length <= 0) return null

        // 距离排序
        if (distance.pos) {
            structures.sort((a, b) => distance.pos!.getRangeTo(a) - distance.pos!.getRangeTo(b))
        }
        // 数量排序
        if (amount) {
            structures.sort((a, b) => (a as StoreStructure).store[resouce] - (b as StoreStructure).store[resouce])
        }
        return structures[0] as StoreStructure || null
    }
    /**
     * 按照建筑类型获取有资源的建筑
     * @param resouce 资源类型
     * @param types 建筑类型
     * @returns 
     */
    public getResouceByType(
        resouce: ResourceConstant = RESOURCE_ENERGY,
        ...types: StoreStructureConstant[]): StoreStructure | Source | null {

        if (types.length == 0) return null
        let structure: StoreStructure | Source | null = null
        types.forEach(t => {
            if (structure) return
            _.keys(this.memory.structure[t]).forEach(s => {
                if (structure) return
                const tmp = Game.getObjectById(s as Id<StoreStructure>)
                if (tmp && tmp.store[resouce] > 0) {
                    structure = tmp
                }
            })
        })
        if (resouce === RESOURCE_ENERGY && !structure) {
            structure = Game.getObjectById(_.first(_.keys(this.memory.source)) as Id<Source>)
        }
        return structure
    }
    public hasFiller(): boolean {
        return _.values(Game.creeps)
            .filter(c => c.room.name === this.name && c.memory.role === 'Filler')
            .length > 0
    }
}
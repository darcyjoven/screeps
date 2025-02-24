export const roles: {
    [role in DefenderRole]: (data: CreepData) => CreepCycle
} = {
    // [ ] defender 行为控制
    Defender: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    // [ ] ranged 远程 行为控制
    Ranged: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    // [ ] healer 治疗 行为控制
    Healer:((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
}
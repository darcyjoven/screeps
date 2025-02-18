export const roles: {
    [role in AdvanceRole]: (data: CreepData) => CreepCycle
} = {
    Claimer: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    Dismantler: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
}
export const roles: {
    [role in RemoteRole]: (data: CreepData) => CreepCycle
} = {
    RemoteHarvester: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    RemoteHauler:((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    RemoteDefender:((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (creep:Creep): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
}
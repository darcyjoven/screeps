export const roles: {
    [role in DefenderRole]: (data: CreepData) => CreepCycle
} = {
    Defender: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    Ranged: ((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
    Healer:((data: CreepData): CreepCycle => ({
        prepare: (creep: Creep): boolean => { return true },
        target: (creep: Creep): boolean => { return true },
        source: (creep: Creep): boolean => { return true },
        isNeed: (room: Room, creepName: string, preMemory: CreepMemory): boolean => { return true },
        bodys: "Collector"
    })) as (data: CreepData) => CreepCycle,
}
export const roles: {
    [role in DefenderRole]: (data: CreepData) => CreepCycle
} = {
    Defender: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Ranged: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Healer: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    }
}
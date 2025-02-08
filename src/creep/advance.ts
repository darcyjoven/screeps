export const roles: {
    [role in AdvanceRole]: (data: CreepData) => CreepCycle
} = {
    Claimer: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Dismantler: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    }
}
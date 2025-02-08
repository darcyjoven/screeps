export const roles: {
    [role in RemoteRole]: (data: CreepData) => CreepCycle
} = {
    RemoteHarvester: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    RemoteHauler: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    RemoteDefender: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    }
}
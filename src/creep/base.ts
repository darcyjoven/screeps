export const roles: {
    [role in BaseRole]: (data: CreepData) => CreepCycle
} = {
    Harvester: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Worker: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Hauler: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Collector: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Upgrader: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Builder: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Filler: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Processor: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    },
    Manager: function (data: CreepData): CreepCycle {
        throw new Error("Function not implemented.");
    }
}
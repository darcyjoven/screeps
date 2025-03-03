/**
 * 映射角色对应审核配置
 */
const bodyRoleMap: Record<BodyConfigRole, CreepRole[]> = {
  HarvesterBody: ['Harvester'],
  WorkerBody: ['Filler', 'Collector', 'Upgrader', 'Builder'],
  HaulerBody: ['Manager'],
  DefenderBody: ['Defender'],
  RangedBody: ['Ranged'],
  HealerBody: ['Healer'],
  RemoteHarvesterBody: ['RemoteHarvester'],
  RemoteHauler: ['RemoteHauler'],
  RemoteDefenderBody: ['RemoteDefender'],
  ClaimerBody: ['Claimer'],
  DismantlerBody: ['Dismantler'],
  ProcessorBody: ['Processor']
};

export const creepRoles: CreepRole[] = ['Harvester', 'Filler', 'Collector',
  'Upgrader', 'Builder', 'Manager', 'Defender', 'Ranged', 'Healer', 'RemoteHarvester',
  'RemoteHauler', 'RemoteDefender', 'Claimer', 'Dismantler', 'Processor']

const bodyConfigs: BodyConfig = {
  HarvesterBody: [
    { [WORK]: 2, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 4, [CARRY]: 1, [MOVE]: 2 },
    { [WORK]: 6, [CARRY]: 1, [MOVE]: 3 },
    { [WORK]: 8, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 10, [CARRY]: 1, [MOVE]: 5 },
    { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
    { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
    { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
  ],
  WorkerBody: [
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
    { [WORK]: 6, [CARRY]: 6, [MOVE]: 6 },
    { [WORK]: 7, [CARRY]: 7, [MOVE]: 7 },
    { [WORK]: 12, [CARRY]: 6, [MOVE]: 9 },
    { [WORK]: 20, [CARRY]: 8, [MOVE]: 14 },
  ],
  HaulerBody: [
    { [CARRY]: 2, [MOVE]: 1 },
    { [CARRY]: 3, [MOVE]: 2 },
    { [CARRY]: 4, [MOVE]: 2 },
    { [CARRY]: 5, [MOVE]: 3 },
    { [CARRY]: 8, [MOVE]: 4 },
    { [CARRY]: 14, [MOVE]: 7 },
    { [CARRY]: 20, [MOVE]: 10 },
    { [CARRY]: 32, [MOVE]: 16 }
  ],
  DefenderBody: [
    { [MOVE]: 2, [ATTACK]: 2 },
    { [MOVE]: 3, [ATTACK]: 3 },
    { [MOVE]: 4, [ATTACK]: 4 },
    { [MOVE]: 5, [ATTACK]: 5 },
    { [MOVE]: 6, [ATTACK]: 6 },
    { [MOVE]: 7, [ATTACK]: 7 },
    { [MOVE]: 8, [ATTACK]: 8 },
    { [MOVE]: 9, [ATTACK]: 9 },
  ],
  RangedBody: [
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
    { [RANGED_ATTACK]: 1 },
  ],
  HealerBody: [
    { [MOVE]: 1, [HEAL]: 1 },
    { [MOVE]: 1, [HEAL]: 1 },
    { [MOVE]: 2, [HEAL]: 2 },
    { [MOVE]: 4, [HEAL]: 4 },
    { [MOVE]: 6, [HEAL]: 6 },
    { [MOVE]: 7, [HEAL]: 7 },
    { [MOVE]: 16, [HEAL]: 16 },
    { [MOVE]: 25, [HEAL]: 25 },
  ],
  RemoteHarvesterBody: [
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 4, [CARRY]: 6, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 9, [MOVE]: 7 },
    { [WORK]: 6, [CARRY]: 10, [MOVE]: 8 },
    { [WORK]: 7, [CARRY]: 15, [MOVE]: 11 },
    { [WORK]: 11, [CARRY]: 15, [MOVE]: 19 }
  ],
  RemoteHauler: [
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
  ],
  RemoteDefenderBody: [
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
    { [MOVE]: 1 },
  ],
  ClaimerBody: [
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
    { [CLAIM]: 1 },
  ],
  DismantlerBody: [
    { [TOUGH]: 1, [WORK]: 1, [MOVE]: 2 },
    { [TOUGH]: 2, [WORK]: 2, [MOVE]: 4 },
    { [TOUGH]: 2, [WORK]: 3, [MOVE]: 5 },
    { [TOUGH]: 3, [WORK]: 4, [MOVE]: 7 },
    { [TOUGH]: 4, [WORK]: 5, [MOVE]: 9 },
    { [TOUGH]: 5, [WORK]: 6, [MOVE]: 11 },
    { [TOUGH]: 10, [WORK]: 10, [MOVE]: 20 },
    { [TOUGH]: 13, [WORK]: 12, [MOVE]: 25 },
  ],
  ProcessorBody: [
    { [CARRY]: 2, [MOVE]: 1 },
    { [CARRY]: 3, [MOVE]: 1 },
    { [CARRY]: 5, [MOVE]: 1 },
    { [CARRY]: 7, [MOVE]: 1 },
    { [CARRY]: 11, [MOVE]: 1 },
    { [CARRY]: 14, [MOVE]: 1 },
    { [CARRY]: 26, [MOVE]: 1 },
    { [CARRY]: 39, [MOVE]: 1 }
  ]
}

/**
 * 获取角色在不同等级的身体配置
 * @param role 角色类型
 * @param controllerLevel 控制器等级
 * @returns 返回身体构造
 */
export function getBodyConfig(role: CreepRole, controllerLevel: number): BodyPartConstant[] {
  for (const [bodyRole, roles] of Object.entries(bodyRoleMap)) {
    if (roles.includes(role)) {
      const levelConfig = bodyConfigs[bodyRole as BodyConfigRole];
      const partsConfig = levelConfig[controllerLevel - 1] || levelConfig[0]; // 默认最低级别配置

      return Object.entries(partsConfig)
        .map(([part, count]) => Array(count).fill(part as BodyPartConstant))
        .reduce((acc, val) => acc.concat(val), []); // 使用 reduce 兼容 Node 10
    }
  }
  return []; // 未找到匹配的身体配置
}


export const creepDefaultMemory: Record<CreepRole, CreepMemory> = {
  RemoteHauler: {
    crossable: true,
    standed: false,
    role: "RemoteHauler",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Harvester: {
    crossable: true,
    standed: false,
    role: "Harvester",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Worker: {
    crossable: true,
    standed: false,
    role: "Worker",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Hauler: {
    crossable: true,
    standed: false,
    role: "Hauler",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Collector: {
    crossable: true,
    standed: false,
    role: "Collector",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Upgrader: {
    crossable: true,
    standed: false,
    role: "Upgrader",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Builder: {
    crossable: true,
    standed: false,
    role: "Builder",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Filler: {
    crossable: true,
    standed: false,
    role: "Filler",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Processor: {
    crossable: true,
    standed: false,
    role: "Processor",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Manager: {
    crossable: true,
    standed: false,
    role: "Manager",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Defender: {
    crossable: true,
    standed: false,
    role: "Defender",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Ranged: {
    crossable: true,
    standed: false,
    role: "Ranged",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Healer: {
    crossable: true,
    standed: false,
    role: "Healer",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  RemoteHarvester: {
    crossable: true,
    standed: false,
    role: "RemoteHarvester",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  RemoteDefender: {
    crossable: true,
    standed: false,
    role: "RemoteDefender",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Claimer: {
    crossable: true,
    standed: false,
    role: "Claimer",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  },
  Dismantler: {
    crossable: true,
    standed: false,
    role: "Dismantler",
    ready: false,
    isStandBy: false,
    isStand: false,
    data: {},
    goCache: false,
    working: false,
    move: { index: 0 }
  }
}
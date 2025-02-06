export const bodyConfig: BodyConfigs = {
    harvester: [
        { [WORK]: 2, [CARRY]: 1, [MOVE]: 1 },
        { [WORK]: 4, [CARRY]: 1, [MOVE]: 2 },
        { [WORK]: 6, [CARRY]: 1, [MOVE]: 3 },
        { [WORK]: 8, [CARRY]: 1, [MOVE]: 4 },
        { [WORK]: 10, [CARRY]: 1, [MOVE]: 5 },
        { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
        { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
        { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
    ],
    worker: [
        { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
        { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
        { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
        { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
        { [WORK]: 6, [CARRY]: 6, [MOVE]: 6 },
        { [WORK]: 7, [CARRY]: 7, [MOVE]: 7 },
        { [WORK]: 12, [CARRY]: 6, [MOVE]: 9 },
        { [WORK]: 20, [CARRY]: 8, [MOVE]: 14 },
    ],
    upgrader: [
        { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
        { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
        { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
        { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
        { [WORK]: 6, [CARRY]: 6, [MOVE]: 6 },
        { [WORK]: 9, [CARRY]: 9, [MOVE]: 9 },
        { [WORK]: 17, [CARRY]: 9, [MOVE]: 17 },
        { [WORK]: 12, [CARRY]: 12, [MOVE]: 12 },
    ],
    attacker: [
        { [MOVE]: 2, [ATTACK]: 2 },
        { [MOVE]: 3, [ATTACK]: 3 },
        { [MOVE]: 4, [ATTACK]: 4 },
        { [MOVE]: 5, [ATTACK]: 5 },
        { [MOVE]: 6, [ATTACK]: 6 },
        { [MOVE]: 7, [ATTACK]: 7 },
        { [MOVE]: 8, [ATTACK]: 8 },
        { [MOVE]: 9, [ATTACK]: 9 },
    ],
    healer: [
        { [MOVE]: 1, [HEAL]: 1 },
        { [MOVE]: 1, [HEAL]: 1 },
        { [MOVE]: 2, [HEAL]: 2 },
        { [MOVE]: 4, [HEAL]: 4 },
        { [MOVE]: 6, [HEAL]: 6 },
        { [MOVE]: 7, [HEAL]: 7 },
        { [MOVE]: 16, [HEAL]: 16 },
        { [MOVE]: 25, [HEAL]: 25 },
    ],
    dismantler: [
        { [TOUGH]: 1, [WORK]: 1, [MOVE]: 2 },
        { [TOUGH]: 2, [WORK]: 2, [MOVE]: 4 },
        { [TOUGH]: 2, [WORK]: 3, [MOVE]: 5 },
        { [TOUGH]: 3, [WORK]: 4, [MOVE]: 7 },
        { [TOUGH]: 4, [WORK]: 5, [MOVE]: 9 },
        { [TOUGH]: 5, [WORK]: 6, [MOVE]: 11 },
        { [TOUGH]: 10, [WORK]: 10, [MOVE]: 20 },
        { [TOUGH]: 13, [WORK]: 12, [MOVE]: 25 },
    ],
}
// 获取身体零部件配置
export function calcBodyPart(bodySet: BodySet): BodyContent[] {
    return Object.entries(bodySet).reduce<BodyContent[]>((acc, [type, count]) => {
        acc.push(...Array(count).fill(type as BodyContent));
        return acc;
    }, []);
}

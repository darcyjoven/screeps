/**
 * 将指定位置序列化为字符串
 * 形如: 12/32/E1N2
 * 
 * @param pos 要进行压缩的位置
 */
export const serializePos = (pos: RoomPosition): string => {
    return `${pos.x}/${pos.y}/${pos.roomName}`
}

/**
 * 将位置序列化字符串转换为位置
 * 位置序列化字符串形如: 12/32/E1N2
 * 
 * @param posStr 要进行转换的字符串
 */
export const unserializePos = (posStr: string): RoomPosition | undefined => {
    // 形如 ["12", "32", "E1N2"]
    const infos = posStr.split('/')

    return infos.length === 3 ? new RoomPosition(Number(infos[0]), Number(infos[1]), infos[2]) : undefined
}


export const serializePath = (path: RoomPosition[]): string => {
    let result = ''
    for (const pos of path) {
        result += serializePos(pos) + ','
    }
    return result
}
export const unserializePath = (pathStr: string): RoomPosition[] => {
    const result: RoomPosition[] = []

    const positions = pathStr.split(',')

    for (let i = 0; i < positions.length; i++) {
        const pos = unserializePos(positions[i])
        if (pos) result[i] = pos
    }
    return result
}

/**
 * 获得指定方向相反方向
 */
export function getOppositeDirection(direction: DirectionConstant): DirectionConstant {
    return <DirectionConstant>((direction + 3) % 8 + 1)
 }
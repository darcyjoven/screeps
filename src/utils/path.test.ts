import exp from 'constants';
import { serializePos, unserializePos } from './path';

describe('Path Test', () => {
    beforeAll(() => {
        // @ts-ignore
        global.RoomPosition = jest.fn().mockImplementation((x: number, y: number, roomName: string) => {
            return {
                x,
                y,
                roomName,
                getPosition: jest.fn(() => `${roomName} (${x}, ${y})`),
            };
        });
    });

    it('RoomPostion Mock', () => {
        const pos = new RoomPosition(10, 20, 'E1N1');

        expect(pos.x).toBe(10);
        expect(pos.y).toBe(20);
        expect(pos.roomName).toBe('E1N1');
    });

    it('序列化', () => {
        const pos = new RoomPosition(10, 20, 'E1N1');

        expect(serializePos(pos)).toBe('10/20/E1N1');
    })
    it('发序列化', () => {
        const pos = unserializePos('10/20/E1N1')
        expect(pos).toBeDefined

        expect(pos?.x).toEqual(10)
        expect(pos?.y).toEqual(20)
        expect(pos?.roomName).toEqual('E1N1')
    })

});

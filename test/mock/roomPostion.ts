import { getMock } from ".";
class RoomPostionMock {
  roomName: string = '';
  x: number = 0;
  y: number = 0;

  constructor(x: number, y: number, roomName: string) {
    this.x = x
    this.y = y
    this.roomName = roomName
  }
}

export const getMockRoomPosition = (x: number, y: number, roomName: string) => {
  const instance = new RoomPostionMock(x, y, roomName);
  return (props?: Partial<RoomPosition>) => Object.assign(instance, props);
};

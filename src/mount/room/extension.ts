export default class RoomExtension extends Room {
    public work(): void {
        this.creepController.run()
    }
}
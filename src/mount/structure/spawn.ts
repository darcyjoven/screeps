export default class SpawnExtension extends StructureSpawn {
    public work(): void { }
    public canSpawn(body: BodyPartConstant[],): ScreepsReturnCode { return OK }
    public lend(by: string): boolean {
        return true
    }
    public remend(by: string): boolean {
        return true
    }
    public canLend(by: string): boolean {
        return true
    }
}
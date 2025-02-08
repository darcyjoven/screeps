export default class SpawnExtension extends StructureSpawn {
    public work(): void { }
    public canSpawn(body: BodyPartConstant[],): ScreepsReturnCode { return OK }
}
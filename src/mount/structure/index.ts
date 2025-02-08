import { assignPrototype } from "utils/mount";
import SpawnExtension from "./spawn";

export default () => {
    assignPrototype(StructureSpawn, SpawnExtension)
}
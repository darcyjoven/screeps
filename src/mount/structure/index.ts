import { assignPrototype } from "utils/mount";
import SpawnExtension from "./spawn";
import TowerExtension from "./tower";
import NukerExtension from "./nuker";

export default () => {
    assignPrototype(StructureSpawn, SpawnExtension)
    assignPrototype(StructureTower, TowerExtension)
    assignPrototype(StructureNuker, NukerExtension)
}
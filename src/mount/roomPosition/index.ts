import RoomPositionExtension from "./extension";
import { assignPrototype } from "utils/mount";

export default () => {
    assignPrototype(RoomPosition, RoomPositionExtension)
}


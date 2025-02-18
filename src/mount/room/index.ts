import ConfigExtension from "./config";
import RoomExtension from "./extension";
import LayoutExtension from "./layout";
import SearchExtension from "./search";
import TaskExtension from "./task";
import { assignPrototype } from "utils/mount";
import { info } from "utils/teminal";

export default () => { 
    assignPrototype(Room, ConfigExtension)
    assignPrototype(Room, RoomExtension)
    assignPrototype(Room, LayoutExtension)
    assignPrototype(Room, SearchExtension)
    assignPrototype(Room, TaskExtension) 
}


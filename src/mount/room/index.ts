import ConfigExtension from "./config";
import RoomExtension from "./extension";
import LayoutExtension from "./layout";
import SearchExtension from "./search";
import TaskExtension from "./task";
import { assignPrototype } from "utils/mount";
import CreepControl from "./creepControl";

const plugins = [ConfigExtension, CreepControl, RoomExtension, LayoutExtension, SearchExtension, TaskExtension]

export default () => plugins.forEach(plugin => { assignPrototype(Room, plugin) })


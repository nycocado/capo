import {PipeLength} from "@models/pipe-length.interface";
import {Joint} from "@models/joint.interface";

export interface AssemblyClientProps {
    initialItems: Joint[];
    initialSelectedItem?: PipeLength | null;
    fetchError?: string;
}
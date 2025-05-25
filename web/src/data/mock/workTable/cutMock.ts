import {PipeLength} from "@models/PipeLenght";
import {Dn} from "@models/Dn";

export const pipeLengths: PipeLength[] = [
    new PipeLength(1078, 1979, new Dn(1, 65, 2.5), 'ERB-SM018', undefined, 1, '1.1', 5, '306L', true),
    new PipeLength(1079, 334, new Dn(1, 65, 2.5), 'ERB-SM018', undefined, 1, '1.2', 5, '306L', false),
    new PipeLength(1080, 897, new Dn(1, 65, 2.5), 'ERB-SM018', undefined, 1, '1.3', 5, '306L', false)
];


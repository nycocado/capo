import { PipeLength } from '@models/pipe-length.interface';

export interface UseCuttingOperationsProps {
    onSuccess?: (item: PipeLength) => void;
    onError?: (error: string) => void;
}
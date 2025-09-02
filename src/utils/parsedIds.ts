import { errorResponse } from '@/utils/apiResponse';

export default function parsedIds(arg1: string, arg2: string) {
    const parsedArg1  = Number(arg1);
    const parsedArg2  = Number(arg2);

    if(
        !parsedArg1 || !parsedArg2 || isNaN(parsedArg1) ||
        isNaN(parsedArg2) || parsedArg1 <= 0 || parsedArg2 <= 0
    ) {
        throw errorResponse('Invalid Id Entered', 400);
    }

    return { parsedArg1, parsedArg2};
}
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

 export const GetVenue = createParamDecorator(
    ( data: string | undefined, ctx: ExecutionContext)=>{
        const request = ctx.switchToHttp().getRequest();
        if(data){
            return request.venue[data];
        }
        return request.venue;
    }
 )
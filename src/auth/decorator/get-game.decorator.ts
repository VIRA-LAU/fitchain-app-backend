import { createParamDecorator, ExecutionContext } from "@nestjs/common";

 export const GetGame = createParamDecorator(
    ( data: string | undefined, ctx: ExecutionContext)=>{
        const request = ctx.switchToHttp().getRequest();
        if(data){
            return request.game[data];
        }
        return request.game;
    }
 )
import { IsOptional, IsString } from "class-validator";

export class OrderLiveUpdateDTO {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    orderId?: string 
}
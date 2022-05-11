import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy } from "passport-local";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {
        super();
    }
    public async validate(username: string, password: string): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { username }
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

export class AuthGuardLocal extends AuthGuard('local') {}
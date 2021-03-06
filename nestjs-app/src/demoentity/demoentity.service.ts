import { Injectable, Logger } from '@nestjs/common';
import { CreateDemoentityDto } from './dto/create-demoentity.dto';
import { UpdateDemoentityDto } from './dto/update-demoentity.dto';

import { Between, MoreThanOrEqual, Not, Repository, Timestamp } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Demoentity } from './entities/demoentity.entity';
import { AuthUser } from 'src/auth/authuser.model';
import { Bunyan, InjectLogger } from 'nestjs-bunyan';
import { paginate, PaginateOptions } from 'src/core/pagination';

@Injectable()
export class DemoentityService {
  constructor(
    @InjectRepository(Demoentity)
    private readonly repo: Repository<Demoentity>
  ) {}
  @InjectLogger() private readonly logger: Bunyan

  async create(createDemoentityDto: CreateDemoentityDto, user: AuthUser) {    
    const rslt = await this.repo.save({
      ...createDemoentityDto,
      ...{
        aud_create_user: user.id,
        aud_update_user: user.id
      }
    });
    return rslt;    
  }
  
  async findAll(user: AuthUser, paginateOptions: PaginateOptions, criteria: object) {
    this.logger.info("info service");
    let whereQ = {};    
    // //transform criteria on TypeORM equivalent filter expressions
    //whereQ["field_decimal"] = Between(0, 100);
    // // this is without pagination
    //const rslt = await this.repo.find(whereQ);    
    let qb = await this.repo.createQueryBuilder().where(whereQ);
    const rslt = await paginate(qb, paginateOptions);
    return rslt;    
  }

  async findOne(id: number, user: AuthUser) {
    const rslt = await this.repo.findOne(id);
    return rslt;
  }

  async update(id: number, updateDemoentityDto: UpdateDemoentityDto, user: AuthUser) {
    const initDbData = await this.repo.findOne(id);
    //remove from object any properties you do not want to update/change
    //if (updateDemoentityDto.hasOwnProperty('id')) delete updateDemoentityDto['id'];
    updateDemoentityDto.aud_update_user = user.id;
    const rslt = await this.repo.save({
      ...initDbData,
      ...updateDemoentityDto,
      ...{        
        aud_update_user: user.id
      }
    });
    return `This action updates a #${id} demoentity`;
  }

  async remove(id: number, user: AuthUser) {
    return await this.repo.delete(id);
  }
}

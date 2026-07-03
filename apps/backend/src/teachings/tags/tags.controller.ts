import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { TagsService } from './tags.service';

@Controller('teachings/tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.tagsService.findAllPublic();
  }
}

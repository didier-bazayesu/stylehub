import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        public_id: string;
    }>;
    deleteImage(publicId: string): Promise<void>;
}

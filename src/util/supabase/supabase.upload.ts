import { getSupabaseClient } from "./supabase.client";
import { Multer } from 'multer';
import { v4 as uuidv4 } from 'uuid';

type UploadPath = 'cat-avatar' | 'user-avatar' | 'feed-images';

export const supabaseUpload = async (file: Multer.File, path: UploadPath) => {
    const supabaseClient = getSupabaseClient();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${path}/${uuidv4()}.${fileExtension}`;

    const { error } = await supabaseClient.storage
        .from(process.env.SUPABASE_BUCKET!)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) throw error;
    console.log(error);

    const { data } = supabaseClient.storage
        .from(process.env.SUPABASE_BUCKET!)
        .getPublicUrl(fileName);

    return {
        path: fileName,
        url: data.publicUrl,
    };
};

export const supabaseDelete = async (fileName: string, path: UploadPath) => {
    const supabaseClient = getSupabaseClient();
    
    const fullPath = `${path}/${fileName}`;
    
    const { error } = await supabaseClient.storage
        .from(process.env.SUPABASE_BUCKET!)
        .remove([fullPath]);
    
    if (error) {
        console.error('Supabase 파일 삭제 실패:', error);
        throw error;
    }
}

const MAX = 1 * 1024 * 1024 * 1024; // 1GB

const checkFileSize = (file: Multer.File) => { // 파일 크기 및 스토리지 용량 체크
    // if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
}
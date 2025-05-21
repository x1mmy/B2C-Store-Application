// import supabase from '../configDB/supabaseConnect';

// const STORAGE_BUCKET = 'product-images';

// export const uploadProductImage = async (file: File) => {
//     try {
//         // Create a unique filename
//         const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        
//         // Upload the file to Supabase Storage
//         const { data, error } = await supabase.storage
//             .from(STORAGE_BUCKET)
//             .upload(filename, file);

//         if (error) throw error;

//         // Get the public URL
//         const { data: { publicUrl } } = supabase.storage
//             .from(STORAGE_BUCKET)
//             .getPublicUrl(filename);

//         return publicUrl;
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         throw error;
//     }
// };

// export const getImageUrl = (path: string) => {
//     if (!path) return 'https://via.placeholder.com/300?text=No+Image';
    
//     // If it's already a Supabase Storage URL, return as is
//     if (path.includes('https://cyihruftnrlpdcjhochq.supabase.co')) return path;
    
//     // If it's a full URL to another domain, return a placeholder for now
//     // You might want to implement a migration strategy for existing images
//     if (path.startsWith('http')) return 'https://via.placeholder.com/300?text=Image+Not+Available';
    
//     // Otherwise, assume it's a storage path and get the public URL
//     const { data: { publicUrl } } = supabase.storage
//         .from(STORAGE_BUCKET)
//         .getPublicUrl(path);
    
//     return publicUrl;
// }; 
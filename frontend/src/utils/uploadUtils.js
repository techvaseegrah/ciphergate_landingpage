import { supabase } from "./supabaseClient";

const uploadUtils = async (file) => {
    if (!file) return;

    // Instant fail-fast for placeholder URLs to prevent multi-second network timeouts
    if (supabase.supabaseUrl?.includes('placeholder.supabase.co')) {
        console.warn("Skipping upload: Placeholder Supabase URL detected.");
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random`;
    }

    try {
        const filePath = `user-photos/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase
            .storage
            .from('user-photos')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload failed:", uploadError.message);
            // Fallback to mock URL in development
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random`;
        }

        const { data } = await supabase
            .storage
            .from('user-photos')
            .getPublicUrl(filePath);

        console.log("Uploaded file URL:", data.publicUrl);
        return data.publicUrl;
    } catch (error) {
        console.error("Upload process error:", error);
        // Fallback to mock URL in development/offline mode
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random`;
    }
};

export default uploadUtils;
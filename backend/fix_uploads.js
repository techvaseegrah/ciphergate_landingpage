const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load the Leave model
const Leave = require('./models/Leave');

const fixUploads = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected successfully');

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.error('Uploads directory not found');
            process.exit(1);
        }

        const files = fs.readdirSync(uploadsDir);
        console.log(`Found ${files.length} files in uploads dir.`);

        for (const filename of files) {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);

            if (stats.isFile() && !filename.includes('.')) {
                // Read first few bytes to guess type
                const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' }).slice(0, 4);

                let extension = '';
                // JPEG: FF D8 FF
                if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
                    extension = '.jpg';
                }
                // PNG: 89 50 4E 47
                else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
                    extension = '.png';
                }
                // PDF: 25 50 44 46
                else if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
                    extension = '.pdf';
                }
                // Default to .jpg if binary? Or maybe just leave it?
                // Actually the user's data shows its a JPEG.
                else {
                    // If unknown but binary, let's try .jpg as it's the most common for this case
                    extension = '.jpg';
                }

                if (extension) {
                    const newFilename = filename + extension;
                    const newPath = path.join(uploadsDir, newFilename);

                    console.log(`Renaming ${filename} -> ${newFilename}`);
                    fs.renameSync(filePath, newPath);

                    // Update database
                    const updateResult = await Leave.updateMany(
                        { document: filename },
                        { $set: { document: newFilename } }
                    );
                    console.log(`Updated ${updateResult.modifiedCount} records for ${filename}`);
                }
            }
        }

        console.log('Finished fixing uploads.');
        process.exit(0);
    } catch (err) {
        console.error('An error occurred:', err);
        process.exit(1);
    }
};

fixUploads();

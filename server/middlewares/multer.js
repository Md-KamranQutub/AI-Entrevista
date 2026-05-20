import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() +""+file.originalname;
        cb(null,fileName);
    }
});

export const upload = multer({storage , limits:{fileSize: 5 * 1024 * 1024}});
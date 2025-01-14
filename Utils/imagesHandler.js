const expressAsyncHandler = require("express-async-handler");
const {
  UploadSingleImage,
} = require("../Middleware/UploadImageMiddleware");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const logger = require('../config/logger');

const ensureUploadDirExists = (type) => {
  const dir = `uploads/${type}`;
  if (!fs.existsSync(dir)) {
    logger.info(`Creating upload directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

exports.resizeImage = (type) =>
  expressAsyncHandler(async (req, res, next) => {
    ensureUploadDirExists(type);
    const imageType = req.file?.mimetype.split("image/")[1];
    
    if (req.file) {
      logger.debug('Processing image upload', { 
        type,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype 
      });

      const filename = `${type}-${uuidv4()}-${Date.now()}.${
        imageType ? imageType : "jpeg"
      }`;

      await sharp(req.file.buffer)
        .resize(1920, 1080)
        .toFormat(imageType)
        .toFile(`uploads/${type}/${filename}`);

      logger.info('Image processed and saved successfully', { 
        type,
        filename,
        path: `uploads/${type}/${filename}` 
      });

      req.body.image = filename;
    }
    next();
  });

exports.uploadImage = UploadSingleImage("image");

exports.fsRemove = async (filePath) => {
  if (!filePath) {
    logger.warn('Attempted to remove file with no path provided');
    return;
  }

  if (!fs.existsSync(filePath)) {
    logger.warn('File not found for deletion', { path: filePath });
    return;
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      logger.error('Failed to delete file', { 
        path: filePath,
        error: err.message 
      });
    } else {
      logger.info('File successfully deleted', { path: filePath });
    }
  });
};

exports.filePathImage = (fileName, relativePathImage) => {
  if (!fileName || !relativePathImage) {
    logger.warn('Invalid parameters for file deletion', { 
      fileName, 
      relativePathImage 
    });
    return;
  }

  const filePath = path.join(
    __dirname,
    `../uploads/${fileName}/`,
    relativePathImage
  );

  logger.debug('Attempting to delete file', { 
    fileName,
    relativePathImage,
    fullPath: filePath 
  });

  exports.fsRemove(filePath);
};

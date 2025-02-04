const expressAsyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const factory = require("./FactoryHandler");

const multer = require("multer");
const VideoModel = require("../Modules/VideoModel");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  endpoint: "https://ca6bff28afbd86eea11ce7de6b31f8c9.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "772d41e4c779fc443698257b0a434e82",
    secretAccessKey:
      "8c62878634cfeb81438e63d0c9aa69cea195aa1f93f759ac99bc9953148d0c0f",
  },
  region: "auto",
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 100 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/quicktime"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("نوع الملف غير مدعوم"), false);
    }
    cb(null, true);
  },
});

exports.createVideo = [
  upload.single("video"),
  expressAsyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "مطلوب تسجيل الدخول" });
    }

    let uniqueKey = `${uuidv4()}-${Date.now()}.${
      req.file.mimetype.split("/")[1]
    }`;

    try {
      // رفع الفيديو إلى R2
      const uploadParams = {
        Bucket: "stories",
        Key: uniqueKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: "public-read",
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const fileUrl = `https://ca6bff28afbd86eea11ce7de6b31f8c9.r2.cloudflarestorage.com/stories/${uniqueKey}`;

      // حفظ الفيديو في قاعدة البيانات
      const videoDoc = await VideoModel.create({
        url: fileUrl,
        user: req.user._id,
        key: uniqueKey,
        size: req.file.size,
        duration: null,
      });

      res.status(201).json({
        success: true,
        data: { id: videoDoc._id, url: fileUrl },
      });
    } catch (error) {
      console.error(`Upload Error [${req.user._id}]:`, error);

      // حذف الفيديو في حال حدوث خطأ
      await s3
        .send(new DeleteObjectCommand({ Bucket: "stories", Key: uniqueKey }))
        .catch(console.error);

      res.status(500).json({
        success: false,
        error:
          process.env.NODE_ENV === "production"
            ? "فشل في رفع الملف"
            : error.message,
      });
    }
  }),
];

exports.getVideos = factory.getAll(VideoModel);
exports.getVideo = factory.getOne(VideoModel);
exports.updateVideo = factory.updateOne(VideoModel);
exports.deleteVideo = factory.deleteOne(VideoModel);

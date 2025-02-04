const AWS = require('aws-sdk');

// إعداد R2 باستخدام S3 API
const s3 = new AWS.S3({
  endpoint: 'https://ca6bff28afbd86eea11ce7de6b31f8c9.r2.cloudflarestorage.com',
  accessKeyId: '2fe0ea209f201bf2de21dac53e1020a5',
  secretAccessKey: '2420005082b283189c17b90b226cb227a400183d212e916b3feb0dfee34c3ff2',
  region: 'auto',
  signatureVersion: 'v4',
});
s3.listBuckets((err, data) => {
  if (err) {
    console.error("❌ فشل الاتصال بـ AWS:", err);
  } else {
    console.log("✅ تم الاتصال بنجاح، القائمة المتاحة:", data.Buckets);
  }
});
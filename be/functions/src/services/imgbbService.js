class ImgBBService {
  constructor() {
    this.IMGBB_API_KEY = process.env.IMGBB_API_KEY;
  }

  async uploadFileStream(
      fileStream,
      fileName = "upload",
      mimeType = "image/jpeg",
  ) {
    if (!this.IMGBB_API_KEY) {
      throw new Error("ImgBB API key not configured");
    }

    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    const base64Image = fileBuffer.toString("base64");
    const formBody = new URLSearchParams();
    formBody.append("image", base64Image);
    formBody.append("name", fileName);

    const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${this.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formBody.toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          signal: AbortSignal.timeout(15000),
        },
    );

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: {
          imageUrl: result.data.url,
          displayUrl: result.data.display_url,
          deleteUrl: result.data.delete_url,
          size: result.data.size,
          title: result.data.title,
          fileName: fileName,
          mimeType: mimeType,
          width: result.data.width,
          height: result.data.height,
        },
      };
    } else {
      return {
        success: false,
        error: result.error.message,
      };
    }
  }

  generateMockImageUrl(userId, type = "profile") {
    return `https://i.ibb.co/sample/${userId}-${type}.jpg`;
  }
}

module.exports = new ImgBBService();

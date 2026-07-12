import QRCode from "qrcode";
import { storageService } from "./storage.service.js";

export const qrcodeService = {
  async generateAndUpload(assetId: string, assetTag: string): Promise<string> {
    // Encode the asset tag in the QR code
    const buffer = await QRCode.toBuffer(assetTag, {
      type: "png",
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    const path = `qrcodes/${assetId}.png`;
    return storageService.uploadFile(path, buffer, "image/png");
  },
};

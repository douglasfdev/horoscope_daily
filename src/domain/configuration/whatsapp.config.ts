export interface WhatsappConfig {
  readonly waSession: string;
  readonly waQrCodeTimeout: number;
  readonly groupIds: string[];
  readonly defaultGroupId: string;
}

export const whatsappConfig: WhatsappConfig = {
  waSession: process.env.WA_SESSION || 'whatsapp_session',
  waQrCodeTimeout: parseInt(process.env.WA_QRCODE_TIMEOUT) || 60000,
  groupIds: [
    process.env.SCAM_GROUP_ID || '1203631234567890@g.us',
    process.env.DEFAULT_GROUP_ID || '1203631234567890@g.us'
  ],
  defaultGroupId: process.env.DEFAULT_GROUP_ID || '1203631234567890@g.us'
};

export default whatsappConfig;

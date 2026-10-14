import { Schema, model, Types, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: Types.ObjectId;       // Referência ao usuário (do Keycloak ou local)
  phone: string;              // número de celular para notificação
  preferredLanguage: string;  // idioma preferido ('pt', 'en', etc.)
  notificationOptIn: boolean; // concordância para receber notificação
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
    phone: { type: String, required: true, index: true },
    preferredLanguage: { type: String, default: 'pt' },
    notificationOptIn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índice para busca por phone
ProfileSchema.index({ phone: 1 });

export const Profile = model<IProfile>('Profile', ProfileSchema);
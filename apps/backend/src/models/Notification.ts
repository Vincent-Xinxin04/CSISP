import { Notification as NotificationType } from '@csisp/types';

export class Notification implements NotificationType {
  id: number;
  type: string;
  title: string;
  content: string;
  targetUserId: number;
  senderId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    type: string,
    title: string,
    content: string,
    targetUserId: number,
    senderId: number,
    status: string = 'unread',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.content = content;
    this.targetUserId = targetUserId;
    this.senderId = senderId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default Notification;

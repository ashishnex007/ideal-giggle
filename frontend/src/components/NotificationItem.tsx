import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface NotificationItemProps {
  title: string;
  description: string;
  createdAt: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ title, description, createdAt }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-sm text-gray-500 mt-2">
          {new Date(createdAt).toLocaleString()}
        </div>
      </CardHeader>
    </Card>
  );
};

export default NotificationItem;
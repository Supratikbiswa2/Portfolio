
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { LoginEntry } from '@/lib/types';

interface RecentLoginsProps {
  logins: LoginEntry[];
}

export function RecentLogins({ logins }: RecentLoginsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users />
          Recently Marked In
        </CardTitle>
        <CardDescription>
          Here are the latest students who have marked their attendance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logins.length > 0 ? (
          <div className="space-y-4">
            {logins.map((login) => (
              <div key={login.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png`} alt={login.name} data-ai-hint="user avatar" />
                  <AvatarFallback>{login.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-medium">{login.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(login.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No one has marked attendance yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
